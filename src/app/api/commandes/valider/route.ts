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

  const { order_id } = await req.json()

  const { data: order } = await adminSupabase
    .from('orders')
    .select('id, status, user_id')
    .eq('id', order_id)
    .eq('user_id', user.id)
    .single()

  if (!order || order.status !== 'delivered') {
    return NextResponse.json({ error: 'Commande introuvable ou non livrable' }, { status: 400 })
  }

  await adminSupabase.from('orders').update({
    status: 'validated',
    validated_at: new Date().toISOString(),
  }).eq('id', order_id)

  return NextResponse.json({ ok: true })
}
