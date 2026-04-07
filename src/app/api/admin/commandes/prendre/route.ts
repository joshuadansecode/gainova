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
  if (!id) return NextResponse.redirect(new URL('/admin/commandes', req.url))

  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, status, user_id')
    .eq('id', id)
    .eq('status', 'pending')
    .single()

  if (!order) return NextResponse.redirect(new URL('/admin/commandes', req.url))

  await adminSupabase.from('orders').update({
    status: 'in_progress',
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  await adminSupabase.from('notifications').insert({
    user_id: order.user_id,
    title: 'Commande en cours',
    message: 'Ton équipe Gainova a pris en charge ta commande. Tu seras notifié à la livraison.',
    type: 'order',
  })

  return NextResponse.redirect(new URL('/admin/commandes', req.url))
}
