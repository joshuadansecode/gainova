import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import QuizSection from './QuizSection'

export default async function ChapterPage({
  params,
}: {
  params: { id: string; level: string; chapter: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: chapter } = await supabase
    .from('chapters')
    .select('*, level:levels(id, title, is_free, formation_id)')
    .eq('id', params.chapter)
    .single()

  if (!chapter) notFound()

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .eq('chapter_id', params.chapter)

  const { data: progress } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('chapter_id', params.chapter)
    .single()

  // Chapitre suivant
  const { data: nextChapter } = await supabase
    .from('chapters')
    .select('id')
    .eq('level_id', params.level)
    .gt('chapter_order', chapter.chapter_order)
    .order('chapter_order')
    .limit(1)
    .single()

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/formations/${params.id}`}
        className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
      >
        ← Retour à la formation
      </Link>

      <h1 className="text-xl font-bold text-gray-900 mb-6">{chapter.title}</h1>

      {/* Contenu PDF */}
      {chapter.content_url ? (
        <div className="bg-white border rounded-xl overflow-hidden mb-8">
          <iframe
            src={chapter.content_url}
            className="w-full h-[500px]"
            title={chapter.title}
          />
        </div>
      ) : (
        <div className="bg-gray-50 border rounded-xl p-8 text-center text-gray-400 mb-8">
          📄 Le contenu de ce chapitre sera bientôt disponible
        </div>
      )}

      {/* Quiz */}
      {quizzes && quizzes.length > 0 ? (
        <QuizSection
          quizzes={quizzes}
          chapterId={params.chapter}
          userId={user.id}
          alreadyPassed={progress?.quiz_passed ?? false}
          nextChapterId={nextChapter?.id}
          formationId={params.id}
          levelId={params.level}
        />
      ) : (
        <div className="text-center text-gray-400 text-sm">Aucun quiz pour ce chapitre.</div>
      )}
    </div>
  )
}
