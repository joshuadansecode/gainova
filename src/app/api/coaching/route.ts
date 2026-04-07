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
    .from('coaching_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type } = await req.json() // 'single' | 'pack'
  const amount = type === 'pack' ? 8000 : 2000
  const sessions_total = type === 'pack' ? 5 : 1

  const { data: profile } = await adminSupabase
    .from('users')
    .select('full_name, email, phone, is_active')
    .eq('id', user.id)
    .single()

  if (!profile?.is_active) return NextResponse.json({ error: 'Compte inactif' }, { status: 400 })

  // Récupérer l'admin comme coach
  const { data: admin } = await adminSupabase
    .from('users')
    .select('id')
    .eq('role', 'admin')
    .single()

  // Créer transaction FedaPay
  const isSandbox = process.env.FEDAPAY_SECRET_KEY?.startsWith('sk_sandbox_')
  const fedapayBase = isSandbox ? 'https://api.sandbox.fedapay.com' : 'https://api.fedapay.com'
  const fedapayRes = await fetch(`${fedapayBase}/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      description: type === 'pack' ? 'Pack coaching 5 séances — Gainova' : 'Coaching 1 séance — Gainova',
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

  if (!fedapayRes.ok) return NextResponse.json({ error: 'Erreur paiement' }, { status: 500 })

  const fedapayData = await fedapayRes.json()
  const transaction = fedapayData.v1?.transaction ?? fedapayData

  const { data: payment } = await adminSupabase.from('payments').insert({
    user_id: user.id,
    amount,
    type: 'coaching',
    status: 'pending',
    fedapay_transaction_id: String(transaction.id),
    metadata: { type, sessions_total },
  }).select().single()

  await adminSupabase.from('coaching_sessions').insert({
    user_id: user.id,
    coach_id: admin?.id ?? user.id,
    type,
    sessions_total,
    sessions_used: 0,
    amount,
    payment_id: payment.id,
    status: 'active',
  })

  return NextResponse.json({ payment_url: transaction.links?.payment_url ?? fedapayData.url })
}
