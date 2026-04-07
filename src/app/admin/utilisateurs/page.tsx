import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminUtilisateursPage() {
  const { data: users } = await adminSupabase
    .from('users')
    .select('id, full_name, email, phone, role, is_active, balance, total_earned, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Utilisateurs</h1>
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Membre</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Téléphone</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Solde</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Statut</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map(u => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{u.full_name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{u.phone}</td>
                <td className="px-4 py-3 text-gray-800">{u.balance?.toLocaleString('fr-FR')} FCFA</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
