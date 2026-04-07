import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { full_name, email, phone, password, ref } = await req.json()

  if (!full_name || !email || !phone || !password) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  // Vérifier si le parrain existe
  let referred_by = null
  if (ref) {
    const { data: parrain } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', ref)
      .single()
    if (parrain) referred_by = parrain.id
  }

  // Créer le compte Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
  })

  if (authError) {
    const msg = authError.message.includes('already registered')
      ? 'Cet email est déjà utilisé.'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const userId = authData.user.id
  const referral_code = nanoid(8).toUpperCase()

  // Créer le profil dans la table users
  const { error: profileError } = await supabase.from('users').insert({
    id: userId,
    email,
    full_name,
    phone,
    referral_code,
    referred_by,
    role: 'apprenant',
  })

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId)
    return NextResponse.json({ error: 'Erreur lors de la création du profil.' }, { status: 500 })
  }

  // Créer la transaction FedaPay
  const fedapayRes = await fetch('https://api.fedapay.com/v1/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
    },
    body: JSON.stringify({
      description: 'Inscription Gainova',
      amount: 1050,
      currency: { iso: 'XOF' },
      customer: {
        firstname: full_name,
        email,
        phone_number: { number: phone, country: 'BJ' },
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/fedapay/callback`,
      metadata: { user_id: userId, type: 'inscription', referred_by },
    }),
  })

  const fedapayData = await fedapayRes.json()

  if (!fedapayRes.ok) {
    return NextResponse.json({ error: 'Erreur paiement. Réessaie.' }, { status: 500 })
  }

  // Enregistrer le paiement en attente
  await supabase.from('payments').insert({
    user_id: userId,
    amount: 1050,
    type: 'inscription',
    status: 'pending',
    fedapay_transaction_id: String(fedapayData.v1?.transaction?.id || fedapayData.id),
    metadata: { referred_by },
  })

  const paymentUrl = fedapayData.v1?.transaction?.links?.payment_url || fedapayData.payment_url

  return NextResponse.json({ payment_url: paymentUrl })
}
