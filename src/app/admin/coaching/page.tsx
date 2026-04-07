import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminCoachingPage() {
  const { data: sessions } = await adminSupabase
    .from('coaching_sessions')
    .select('*, user:users(full_name, phone)')
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Sessions coaching actives</h1>
      {!sessions?.length ? (
        <p className="text-gray-400 text-sm">Aucune session active.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map(s => (
            <div key={s.id} className="bg-white border rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{(s.user as any)?.full_name}</p>
                <p className="text-sm text-gray-500">{(s.user as any)?.phone}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {s.type === 'pack' ? 'Pack 5 séances' : '1 séance'} · {s.sessions_used}/{s.sessions_total} utilisées
                </p>
                {s.scheduled_at && (
                  <p className="text-xs text-blue-600 mt-0.5">
                    Planifiée : {new Date(s.scheduled_at).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>
              <p className="font-bold text-gray-800">{s.amount.toLocaleString('fr-FR')} FCFA</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
