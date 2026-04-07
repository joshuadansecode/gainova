import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function CommunautePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: posts } = await supabase
    .from('posts')
    .select('*, author:users(full_name, avatar_url)')
    .eq('status', 'approved')
    .gt('expires_at', new Date().toISOString())
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  // Quota hebdomadaire
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const { count: postsThisWeek } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', weekStart.toISOString())

  const remaining = Math.max(0, 5 - (postsThisWeek ?? 0))

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communauté</h1>
          <p className="text-sm text-gray-500 mt-1">
            {remaining > 0 ? `${remaining} publication(s) restante(s) cette semaine` : 'Quota hebdomadaire atteint'}
          </p>
        </div>
        <Link
          href="/communaute/publier"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          + Publier
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className={`bg-white border rounded-xl p-5 ${post.is_pinned ? 'border-green-300 bg-green-50' : ''}`}>
              {post.is_pinned && (
                <span className="text-xs text-green-600 font-medium mb-2 block">📌 Épinglé</span>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                  {(post.author as any)?.full_name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{(post.author as any)?.full_name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              {post.content && <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{post.content}</p>}
              {post.image_url && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <Image src={post.image_url} alt="Publication" fill className="object-cover" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-3">
                Expire le {new Date(post.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-4">🌍</p>
          <p>Aucune publication pour le moment.</p>
          <Link href="/communaute/publier" className="text-green-600 text-sm mt-2 inline-block hover:underline">
            Sois le premier à publier
          </Link>
        </div>
      )}
    </div>
  )
}
