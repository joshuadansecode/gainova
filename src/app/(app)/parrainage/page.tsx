import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CopyButton from '@/components/CopyButton'

export default async function ParrainagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('referral_code, balance, total_earned')
    .eq('id', user.id)
    .single()

  const { data: referrals } = await supabase
    .from('referrals')
    .select('*, filleul:users!referred_id(full_name, created_at)')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  const validated = referrals?.filter(r => r.status === 'validated') ?? []
  const pending = referrals?.filter(r => r.status === 'pending') ?? []

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const referralLink = `${appUrl}/rejoindre?ref=${profile?.referral_code}`

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Parrainage</h1>
      <p className="text-gray-500 mb-8">{"Gagne 210 FCFA pour chaque personne qui s'inscrit via ton lien"}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-green-700">{validated.length}</p>
          <p className="text-sm text-gray-600 mt-1">Filleuls validés</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-blue-700">{profile?.total_earned?.toLocaleString('fr-FR') ?? 0}</p>
          <p className="text-sm text-gray-600 mt-1">FCFA gagnés</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
          <p className="text-2xl font-bold text-purple-700">{profile?.balance?.toLocaleString('fr-FR') ?? 0}</p>
          <p className="text-sm text-gray-600 mt-1">FCFA disponibles</p>
        </div>
      </div>

      {/* Lien de parrainage */}
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">🔗 Ton lien de parrainage</h2>
        <div className="flex gap-2 mb-3">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm text-gray-700"
          />
          <CopyButton text={referralLink} />
        </div>
        <p className="text-xs text-gray-400">Code : <strong>{profile?.referral_code}</strong></p>
      </div>

      {/* Historique */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-900">Historique des parrainages</h2>
        </div>
        {referrals && referrals.length > 0 ? (
          <div className="divide-y">
            {referrals.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {(r.filleul as any)?.full_name ?? 'Utilisateur'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">+{r.commission_amount} FCFA</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    r.status === 'validated' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {r.status === 'validated' ? 'Validé' : 'En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">
            {"Aucun parrainage pour le moment. Partage ton lien !"}
          </div>
        )}
      </div>
    </div>
  )
}
