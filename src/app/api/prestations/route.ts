import { NextResponse } from 'next/server'
import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data } = await adminSupabase
    .from('prestations')
    .select('*')
    .eq('is_active', true)
    .order('category')

  return NextResponse.json(data ?? [])
}
