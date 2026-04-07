import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const categoryLabels: Record<string, string> = {
  developpement_personnel: '🧠 Développement personnel',
  langues: '🌐 Langues',
  creatif: '🎨 Créatif',
  tech: '💻 Tech',
  business: '💼 Business',
  soft_skills: '🤝 Soft skills',
  bureautique: '📊 Bureautique',
  carriere: '🎓 Carrière',
  sante: '❤️ Santé',
}

export default async function FormationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: formations } = await supabase
    .from('formations')
    .select('*, levels(id, title, level_order, is_free)')
    .eq('is_published', true)
    .order('title')

  // Progression de l'utilisateur
  const { data: progress } = await supabase
    .from('user_progress')
    .select('chapter_id, is_completed')
    .eq('user_id', user.id)

  const completedChapters = new Set(progress?.filter(p => p.is_completed).map(p => p.chapter_id))

  // Grouper par catégorie
  const grouped = formations?.reduce((acc, f) => {
    if (!acc[f.category]) acc[f.category] = []
    acc[f.category].push(f)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Formations</h1>
      <p className="text-gray-500 mb-8">19 formations disponibles — niveaux débutant et intermédiaire gratuits</p>

      {Object.entries((grouped ?? {}) as Record<string, any[]>).map(([category, items]) => (
        <div key={category} className="mb-10">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {categoryLabels[category] ?? category}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {items?.map((formation) => (
              <Link
                key={formation.id}
                href={`/formations/${formation.id}`}
                className="bg-white border rounded-xl p-5 hover:shadow-md transition hover:border-green-300"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{formation.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{formation.description}</p>
                <div className="flex gap-2">
                  {formation.levels?.sort((a: any, b: any) => a.level_order - b.level_order).map((level: any) => (
                    <span
                      key={level.id}
                      className={`text-xs px-2 py-1 rounded-full ${
                        level.is_free
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {level.title} {!level.is_free && '• 500 FCFA'}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
