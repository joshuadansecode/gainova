export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [{ data: profile }, { data: withdrawals }] = await Promise.all([
    adminSupabase.from('users').select('balance').eq('id', user.id).single(),
    adminSupabase.from('withdrawals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return NextResponse.json({ profile, withdrawals: withdrawals ?? [] })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { amount, phone, operator } = await req.json()
  const numAmount = Number(amount)

  if (numAmount < 1000) return NextResponse.json({ error: 'Minimum 1 000 FCFA' }, { status: 400 })

  // Vérifier le solde
  const { data: profile } = await adminSupabase.from('users').select('balance, is_active').eq('id', user.id).single()
  if (!profile?.is_active) return NextResponse.json({ error: 'Compte inactif' }, { status: 400 })
  if ((profile?.balance ?? 0) < numAmount) return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 })

  const isAuto = numAmount <= 5000
  const mode = isAuto ? 'auto' : 'manual'

  // Déduire le solde
  await adminSupabase.rpc('decrement_balance', { user_id: user.id, amount: numAmount })

  // Créer la demande
  const { data: withdrawal } = await adminSupabase.from('withdrawals').insert({
    user_id: user.id,
    amount: numAmount,
    phone,
    operator,
    mode,
    status: isAuto ? 'processing' : 'pending',
  }).select().single()

  if (isAuto) {
    // Virement automatique via FedaPay Payout
    try {
      const fedapayRes = await fetch('https://api.fedapay.com/v1/payouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount: numAmount,
          currency: { iso: 'XOF' },
          mode: operator,
          customer: { phone_number: { number: phone, country: 'BJ' } },
        }),
      })

      if (fedapayRes.ok) {
        const fedapayData = await fedapayRes.json()
        await adminSupabase.from('withdrawals').update({
          status: 'paid',
          fedapay_transaction_id: String(fedapayData.id ?? ''),
          processed_at: new Date().toISOString(),
        }).eq('id', withdrawal.id)

        await adminSupabase.from('notifications').insert({
          user_id: user.id,
          title: 'Retrait effectué',
          message: `${numAmount.toLocaleString('fr-FR')} FCFA ont été envoyés sur ton ${operator.toUpperCase()} Money.`,
          type: 'retrait',
        })

        return NextResponse.json({ ok: true, auto: true })
      }
    } catch {}

    // Si FedaPay échoue → passer en manuel
    await adminSupabase.from('withdrawals').update({ status: 'pending', mode: 'manual' }).eq('id', withdrawal.id)
  }

  await adminSupabase.from('notifications').insert({
    user_id: user.id,
    title: 'Demande de retrait reçue',
    message: `Ta demande de ${numAmount.toLocaleString('fr-FR')} FCFA est en cours de traitement (24-48h).`,
    type: 'retrait',
  })

  return NextResponse.json({ ok: true, auto: false })
}
