import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const event = body.name
  const transaction = body.data?.object

  if (!transaction) return NextResponse.json({ ok: true })

  const fedapayId = String(transaction.id)
  const status = transaction.status // 'approved' | 'declined' | etc.

  // Trouver le paiement correspondant
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('fedapay_transaction_id', fedapayId)
    .single()

  if (!payment) return NextResponse.json({ ok: true })

  if (event === 'transaction.approved' || status === 'approved') {
    // Marquer le paiement comme réussi
    await supabase
      .from('payments')
      .update({ status: 'success', updated_at: new Date().toISOString() })
      .eq('id', payment.id)

    if (payment.type === 'coaching') {
      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'Coaching confirmé',
        message: payment.metadata?.type === 'pack'
          ? 'Ton pack 5 séances de coaching est activé. L\'équipe Gainova te contactera pour planifier.'
          : 'Ta séance de coaching est confirmée. L\'équipe Gainova te contactera pour planifier.',
        type: 'coaching',
      })
    }

    if (payment.type === 'prestation') {
      // Passer la commande en in_progress
      await supabase
        .from('orders')
        .update({ status: 'in_progress', updated_at: new Date().toISOString() })
        .eq('payment_id', payment.id)

      await supabase.from('notifications').insert({
        user_id: payment.user_id,
        title: 'Commande confirmée',
        message: 'Ton paiement a été reçu. Ton équipe Gainova prend en charge ta commande.',
        type: 'order',
      })
    }

    if (payment.type === 'inscription') {
      // Activer le compte
      await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', payment.user_id)

      // Traiter la commission du parrain
      const referred_by = payment.metadata?.referred_by
      if (referred_by) {
        await supabase.from('referrals').insert({
          referrer_id: referred_by,
          referred_id: payment.user_id,
          commission_amount: 210,
          status: 'validated',
          validated_at: new Date().toISOString(),
        })

        // Créditer le solde du parrain
        await supabase.rpc('increment_balance', {
          user_id: referred_by,
          amount: 210,
        })

        // Notification au parrain
        await supabase.from('notifications').insert({
          user_id: referred_by,
          title: 'Commission reçue !',
          message: 'Tu as reçu 210 FCFA de commission pour un nouveau parrainage.',
          type: 'commission',
        })
      }
    }
  } else if (status === 'declined' || status === 'canceled') {
    await supabase
      .from('payments')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', payment.id)
  }

  return NextResponse.json({ ok: true })
}
