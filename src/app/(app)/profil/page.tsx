import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, phone, referral_code, balance, total_earned, role, created_at')
    .eq('id', user.id)
    .single()

  // Formations complétées (tous les chapitres d'un niveau validés)
  const { data: progress } = await supabase
    .from('user_progress')
    .select('chapter_id, is_completed, quiz_passed')
    .eq('user_id', user.id)
    .eq('is_completed', true)

  const completedChapters = progress?.length ?? 0

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mon profil</h1>

      {/* Infos */}
      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-2xl font-bold text-green-700">
            {profile?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile?.full_name}</p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Membre depuis {new Date(profile?.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Téléphone</p>
            <p className="font-medium text-gray-800">{profile?.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Code parrainage</p>
            <p className="font-medium text-gray-800 font-mono">{profile?.referral_code}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{profile?.balance?.toLocaleString('fr-FR') ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">FCFA disponibles</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{profile?.total_earned?.toLocaleString('fr-FR') ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">FCFA gagnés</p>
        </div>
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{completedChapters}</p>
          <p className="text-xs text-gray-500 mt-1">Chapitres suivis</p>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="bg-green-100 text-green-700 text-sm px-3 py-1.5 rounded-full">✅ Membre actif</span>
          {completedChapters >= 5 && (
            <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1.5 rounded-full">📚 Apprenant assidu</span>
          )}
          {(profile?.total_earned ?? 0) >= 1000 && (
            <span className="bg-yellow-100 text-yellow-700 text-sm px-3 py-1.5 rounded-full">💰 Parrain actif</span>
          )}
          {(profile?.total_earned ?? 0) >= 10000 && (
            <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1.5 rounded-full">🏆 Top parrain</span>
          )}
        </div>
      </div>
    </div>
  )
}
