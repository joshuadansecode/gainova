import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPaiementsPage() {
  const { data: payments } = await adminSupabase
    .from('payments')
    .select('*, user:users(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const typeLabel: Record<string, string> = {
    inscription: 'Inscription',
    niveau_avance: 'Niveau avancé',
    coaching: 'Coaching',
    boost: 'Boost post',
    prestation: 'Prestation',
  }

  const statusColor: Record<string, string> = {
    success: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paiements</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Membre</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Type</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Montant</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {payments?.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-gray-800">{(p.user as any)?.full_name}</td>
                <td className="px-4 py-3 text-gray-600">{typeLabel[p.type] ?? p.type}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{p.amount.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
