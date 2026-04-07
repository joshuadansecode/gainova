import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminCommandesPage() {
  const { data: orders } = await adminSupabase
    .from('orders')
    .select('*, user:users(full_name), prestation:prestations(title)')
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: true })

  const statusLabel: Record<string, string> = {
    pending: '⏳ En attente',
    in_progress: '🔄 En cours',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Commandes actives</h1>
      {!orders?.length ? (
        <p className="text-gray-400 text-sm">Aucune commande active.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white border rounded-xl p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{(o.prestation as any)?.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{(o.user as any)?.full_name}</p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">{o.description}</p>
                <p className="text-xs text-gray-400 mt-1">{o.amount.toLocaleString('fr-FR')} FCFA · {new Date(o.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{statusLabel[o.status]}</span>
                <div className="mt-3 flex gap-2">
                  {o.status === 'pending' && (
                    <a href={`/api/admin/commandes/prendre?id=${o.id}`}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700">
                      Prendre en charge
                    </a>
                  )}
                  {o.status === 'in_progress' && (
                    <a href={`/admin/commandes/${o.id}/livrer`}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">
                      Livrer
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
