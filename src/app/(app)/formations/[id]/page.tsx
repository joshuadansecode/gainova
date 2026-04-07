import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export default async function FormationDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: formation } = await supabase
    .from('formations')
    .select('*, levels(*, chapters(id, title, chapter_order))')
    .eq('id', params.id)
    .single()

  if (!formation) notFound()

  // Niveaux débloqués par l'utilisateur (payants)
  const { data: unlockedLevels } = await supabase
    .from('user_formations')
    .select('level_id')
    .eq('user_id', user.id)

  const unlockedIds = new Set(unlockedLevels?.map(u => u.level_id))

  // Progression
  const { data: progress } = await supabase
    .from('user_progress')
    .select('chapter_id, is_completed, quiz_passed')
    .eq('user_id', user.id)

  const progressMap = new Map(progress?.map(p => [p.chapter_id, p]))

  const levels = formation.levels?.sort((a: any, b: any) => a.level_order - b.level_order)

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/formations" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Retour aux formations
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">{formation.title}</h1>
      <p className="text-gray-500 mb-8">{formation.description}</p>

      <div className="space-y-6">
        {levels?.map((level: any) => {
          const isAccessible = level.is_free || unlockedIds.has(level.id)
          const chapters = level.chapters?.sort((a: any, b: any) => a.chapter_order - b.chapter_order)

          return (
            <div key={level.id} className="bg-white border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b bg-gray-50">
                <div>
                  <h2 className="font-semibold text-gray-900">{level.title}</h2>
                  <span className={`text-xs ${level.is_free ? 'text-green-600' : 'text-orange-600'}`}>
                    {level.is_free ? 'Gratuit' : '500 FCFA'}
                  </span>
                </div>
                {!isAccessible && (
                  <Link
                    href={`/api/paiement/niveau?level_id=${level.id}`}
                    className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Débloquer
                  </Link>
                )}
              </div>

              {isAccessible ? (
                <div className="divide-y">
                  {chapters?.map((chapter: any, index: number) => {
                    const prog = progressMap.get(chapter.id)
                    const isCompleted = prog?.is_completed && prog?.quiz_passed
                    // Un chapitre est accessible si c'est le premier ou si le précédent est complété
                    const prevChapter = index > 0 ? chapters[index - 1] : null
                    const prevCompleted = !prevChapter || (progressMap.get(prevChapter.id)?.is_completed && progressMap.get(prevChapter.id)?.quiz_passed)

                    return (
                      <div key={chapter.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isCompleted ? '✓' : index + 1}
                          </span>
                          <span className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {chapter.title}
                          </span>
                        </div>
                        {prevCompleted ? (
                          <Link
                            href={`/formations/${formation.id}/${level.id}/${chapter.id}`}
                            className="text-sm text-green-600 hover:underline"
                          >
                            {isCompleted ? 'Revoir' : 'Commencer →'}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400">🔒 Verrouillé</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-400 text-sm">
                  🔒 Débloque ce niveau pour accéder aux chapitres
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
