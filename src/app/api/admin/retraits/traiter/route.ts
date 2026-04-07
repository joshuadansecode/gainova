export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/connexion', req.url))

  const { data: profile } = await adminSupabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', req.url))

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.redirect(new URL('/admin/retraits', req.url))

  const { data: withdrawal } = await adminSupabase
    .from('withdrawals')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  if (!withdrawal) return NextResponse.redirect(new URL('/admin/retraits', req.url))

  // Tenter le virement FedaPay
  try {
    const fedapayRes = await fetch('https://api.fedapay.com/v1/payouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: withdrawal.amount,
        currency: { iso: 'XOF' },
        mode: withdrawal.operator,
        customer: { phone_number: { number: withdrawal.phone, country: 'BJ' } },
      }),
    })

    if (fedapayRes.ok) {
      const fedapayData = await fedapayRes.json()
      await adminSupabase.from('withdrawals').update({
        status: 'paid',
        fedapay_transaction_id: String(fedapayData.id ?? ''),
        processed_at: new Date().toISOString(),
      }).eq('id', id)

      await adminSupabase.from('notifications').insert({
        user_id: withdrawal.user_id,
        title: 'Retrait effectué',
        message: `${withdrawal.amount.toLocaleString('fr-FR')} FCFA ont été envoyés sur ton ${withdrawal.operator.toUpperCase()} Money.`,
        type: 'retrait',
      })
    } else {
      await adminSupabase.from('withdrawals').update({ status: 'rejected' }).eq('id', id)
      await adminSupabase.rpc('increment_balance', { user_id: withdrawal.user_id, amount: withdrawal.amount })
      await adminSupabase.from('notifications').insert({
        user_id: withdrawal.user_id,
        title: 'Retrait échoué',
        message: `Ton retrait de ${withdrawal.amount.toLocaleString('fr-FR')} FCFA a échoué. Ton solde a été recrédité.`,
        type: 'retrait',
      })
    }
  } catch {
    await adminSupabase.from('withdrawals').update({ status: 'rejected' }).eq('id', id)
    await adminSupabase.rpc('increment_balance', { user_id: withdrawal.user_id, amount: withdrawal.amount })
  }

  return NextResponse.redirect(new URL('/admin/retraits', req.url))
}
