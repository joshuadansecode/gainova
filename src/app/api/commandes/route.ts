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

  const { data } = await adminSupabase
    .from('orders')
    .select('*, prestation:prestations(title, category)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { prestation_id, description, amount } = await req.json()
  if (!prestation_id || !description || !amount) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data: profile } = await adminSupabase
    .from('users')
    .select('full_name, email, phone, is_active')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) return NextResponse.json({ error: 'Compte inactif' }, { status: 400 })

  // Créer la transaction FedaPay
  const fedapayRes = await fetch('https://api.fedapay.com/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      description: 'Commande prestation Gainova',
      amount,
      currency: { iso: 'XOF' },
      customer: {
        firstname: profile.full_name,
        email: profile.email,
        phone_number: { number: profile.phone, country: 'BJ' },
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/fedapay/callback`,
    }),
  })

  if (!fedapayRes.ok) {
    return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })
  }

  const fedapayData = await fedapayRes.json()
  const transaction = fedapayData.v1?.transaction ?? fedapayData

  // Créer le paiement en pending
  const { data: payment } = await adminSupabase.from('payments').insert({
    user_id: user.id,
    amount,
    type: 'prestation',
    status: 'pending',
    fedapay_transaction_id: String(transaction.id),
    metadata: { prestation_id, description },
  }).select().single()

  // Créer la commande en pending
  await adminSupabase.from('orders').insert({
    user_id: user.id,
    prestation_id,
    description,
    amount,
    status: 'pending',
    payment_id: payment.id,
  })

  return NextResponse.json({ payment_url: transaction.links?.payment_url ?? fedapayData.url })
}
