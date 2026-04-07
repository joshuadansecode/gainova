import { createClient as createAdmin } from '@supabase/supabase-js'

const adminSupabase = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function AdminPage() {
  const [
    { count: totalUsers },
    { count: activeUsers },
    { data: payments },
    { count: pendingWithdrawals },
    { count: pendingPosts },
    { count: pendingOrders },
  ] = await Promise.all([
    adminSupabase.from('users').select('*', { count: 'exact', head: true }),
    adminSupabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
    adminSupabase.from('payments').select('amount').eq('status', 'success'),
    adminSupabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount ?? 0), 0) ?? 0

  const stats = [
    { label: 'Membres total', value: totalUsers ?? 0, color: 'text-blue-600' },
    { label: 'Membres actifs', value: activeUsers ?? 0, color: 'text-green-600' },
    { label: 'Revenus totaux', value: `${totalRevenue.toLocaleString('fr-FR')} FCFA`, color: 'text-purple-600' },
    { label: 'Retraits en attente', value: pendingWithdrawals ?? 0, color: 'text-orange-600', href: '/admin/retraits' },
    { label: 'Posts à modérer', value: pendingPosts ?? 0, color: 'text-yellow-600', href: '/admin/publications' },
    { label: 'Commandes en attente', value: pendingOrders ?? 0, color: 'text-red-600', href: '/admin/commandes' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <a key={s.label} href={s.href ?? '#'}
            className={`bg-white border rounded-xl p-5 ${s.href ? 'hover:shadow-sm transition' : ''}`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
