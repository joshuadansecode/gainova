import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPublicationsPage() {
  const { data: posts } = await adminSupabase
    .from('posts')
    .select('*, user:users(full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Publications à modérer</h1>
      {!posts?.length ? (
        <p className="text-gray-400 text-sm">Aucune publication en attente.</p>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <div key={p.id} className="bg-white border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">{(p.user as any)?.full_name} · {new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                  <p className="text-sm text-gray-800">{p.content}</p>
                  {p.image_url && <img src={p.image_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover" />}
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={`/api/communaute/moderer`} method="POST">
                    <input type="hidden" name="post_id" value={p.id} />
                    <input type="hidden" name="action" value="approve" />
                    <button className="bg-green-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-green-700">Approuver</button>
                  </form>
                  <form action={`/api/communaute/moderer`} method="POST">
                    <input type="hidden" name="post_id" value={p.id} />
                    <input type="hidden" name="action" value="reject" />
                    <button className="bg-red-500 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-red-600">Rejeter</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
