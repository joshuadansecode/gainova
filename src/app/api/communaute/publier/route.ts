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

  // Vérifier le quota hebdomadaire
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const { count } = await adminSupabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', weekStart.toISOString())
    .not('status', 'eq', 'rejected')

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Quota de 5 publications par semaine atteint.' }, { status: 400 })
  }

  const formData = await req.formData()
  const content = formData.get('content') as string
  const imageFile = formData.get('image') as File | null

  let image_url = null

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const path = `posts/${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await adminSupabase.storage
      .from('gainova')
      .upload(path, imageFile, { contentType: imageFile.type })

    if (!uploadError) {
      const { data } = adminSupabase.storage.from('gainova').getPublicUrl(path)
      image_url = data.publicUrl
    }
  }

  const { error } = await adminSupabase.from('posts').insert({
    user_id: user.id,
    content: content || null,
    image_url,
    status: 'pending',
  })

  if (error) return NextResponse.json({ error: 'Erreur lors de la publication.' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
