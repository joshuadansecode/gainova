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

  // Vérifier que c'est un admin
  const { data: profile } = await adminSupabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const { post_id, action, rejection_reason } = await req.json()
  // action: 'approve' | 'reject'

  if (action === 'approve') {
    const expires_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
    await adminSupabase.from('posts').update({
      status: 'approved',
      expires_at,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', post_id)

    // Notifier l'auteur
    const { data: post } = await adminSupabase.from('posts').select('user_id').eq('id', post_id).single()
    if (post) {
      await adminSupabase.from('notifications').insert({
        user_id: post.user_id,
        title: 'Publication approuvée',
        message: 'Ta publication a été approuvée et est maintenant visible par la communauté.',
        type: 'post',
      })
    }
  } else {
    await adminSupabase.from('posts').update({
      status: 'rejected',
      rejection_reason: rejection_reason || null,
      moderated_by: user.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', post_id)

    const { data: post } = await adminSupabase.from('posts').select('user_id').eq('id', post_id).single()
    if (post) {
      await adminSupabase.from('notifications').insert({
        user_id: post.user_id,
        title: 'Publication refusée',
        message: rejection_reason || 'Ta publication ne respecte pas la charte de publication.',
        type: 'post',
      })
    }
  }

  return NextResponse.json({ ok: true })
}
