export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { chapter_id, quiz_passed } = await req.json()

  await supabase.from('user_progress').upsert({
    user_id: user.id,
    chapter_id,
    is_completed: quiz_passed,
    quiz_passed,
    completed_at: quiz_passed ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,chapter_id' })

  return NextResponse.json({ ok: true })
}
