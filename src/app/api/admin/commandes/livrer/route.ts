export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await adminSupabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })

  const formData = await req.formData()
  const order_id = formData.get('order_id') as string
  const file = formData.get('file') as File

  if (!order_id || !file) return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })

  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, status, user_id')
    .eq('id', order_id)
    .eq('status', 'in_progress')
    .single()

  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  // Upload fichier dans Supabase Storage
  const ext = file.name.split('.').pop()
  const path = `orders/${order_id}/livraison.${ext}`
  const { error: uploadError } = await adminSupabase.storage
    .from('gainova')
    .upload(path, file, { upsert: true })

  if (uploadError) return NextResponse.json({ error: 'Erreur upload' }, { status: 500 })

  const { data: { publicUrl } } = adminSupabase.storage.from('gainova').getPublicUrl(path)

  await adminSupabase.from('order_files').insert({
    order_id,
    file_url: publicUrl,
    file_type: 'deliverable',
    uploaded_by: user.id,
  })

  await adminSupabase.from('orders').update({
    status: 'delivered',
    delivered_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', order_id)

  await adminSupabase.from('notifications').insert({
    user_id: order.user_id,
    title: 'Commande livrée !',
    message: 'Ta commande est prête. Connecte-toi pour valider la livraison.',
    type: 'order',
  })

  return NextResponse.json({ ok: true })
}
