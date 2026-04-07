import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminRetraitsPage() {
  const { data: withdrawals } = await adminSupabase
    .from('withdrawals')
    .select('*, user:users(full_name, email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Retraits en attente</h1>
      {!withdrawals?.length ? (
        <p className="text-gray-400 text-sm">Aucun retrait en attente.</p>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Membre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Montant</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Mobile Money</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {withdrawals.map(w => (
                <tr key={w.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{(w.user as any)?.full_name}</p>
                    <p className="text-xs text-gray-400">{(w.user as any)?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{w.amount.toLocaleString('fr-FR')} FCFA</td>
                  <td className="px-4 py-3">
                    <p>{w.phone}</p>
                    <p className="text-xs text-gray-400">{w.operator.toUpperCase()}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(w.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <a href={`/api/admin/retraits/traiter?id=${w.id}`}
                      className="bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-700">
                      Traiter
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
