import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CopyButton from '@/components/CopyButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, balance, total_earned, referral_code')
    .eq('id', user.id)
    .single()

  const { count: totalFilleuls } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', user.id)
    .eq('status', 'validated')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
    .limit(5)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const referralLink = `${appUrl}/rejoindre?ref=${profile?.referral_code}`

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Bonjour, {profile?.full_name?.split(' ')[0]} 👋
      </h1>
      <p className="text-gray-500 mb-8">Voici un résumé de ton activité</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="Solde disponible"
          value={`${profile?.balance?.toLocaleString('fr-FR') ?? 0} FCFA`}
          icon="💰"
          color="green"
        />
        <StatCard
          label="Total gagné"
          value={`${profile?.total_earned?.toLocaleString('fr-FR') ?? 0} FCFA`}
          icon="📈"
          color="blue"
        />
        <StatCard
          label="Filleuls validés"
          value={String(totalFilleuls ?? 0)}
          icon="👥"
          color="purple"
        />
      </div>

      {/* Lien de parrainage */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-green-800 mb-2">🔗 Ton lien de parrainage</h2>
        <p className="text-sm text-green-700 mb-3">Partage ce lien et gagne 210 FCFA par inscription validée</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-white border border-green-300 rounded-lg px-3 py-2 text-sm text-gray-700"
          />
          <CopyButton text={referralLink} />
        </div>
      </div>

      {/* Notifications récentes */}
      {notifications && notifications.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">🔔 Notifications récentes</h2>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3 text-sm">
                <span className="text-green-500 mt-0.5">●</span>
                <div>
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-gray-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
  }
  return (
    <div className={`rounded-xl border p-6 ${colors[color]}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{label}</p>
    </div>
  )
}


