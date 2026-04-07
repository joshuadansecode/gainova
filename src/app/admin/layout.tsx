import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const navItems = [
    { href: '/admin', label: '📊 Dashboard' },
    { href: '/admin/utilisateurs', label: '👥 Utilisateurs' },
    { href: '/admin/publications', label: '📝 Publications' },
    { href: '/admin/commandes', label: '📦 Commandes' },
    { href: '/admin/retraits', label: '💸 Retraits' },
    { href: '/admin/paiements', label: '💳 Paiements' },
    { href: '/admin/coaching', label: '🎯 Coaching' },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="p-5 border-b">
          <p className="font-bold text-green-600">Gainova</p>
          <p className="text-xs text-gray-400 mt-0.5">Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <a key={item.href} href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              {item.label}
            </a>
          ))}
        </nav>
        <div className="p-3 border-t">
          <a href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
            ← Mode apprenant
          </a>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
