'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '🏠' },
  { href: '/formations', label: 'Formations', icon: '📚' },
  { href: '/communaute', label: 'Communauté', icon: '🌍' },
  { href: '/parrainage', label: 'Parrainage', icon: '🔗' },
  { href: '/retraits', label: 'Retraits', icon: '💸' },
  { href: '/prestations/commander', label: 'Prestations', icon: '🛠️' },
  { href: '/mes-commandes', label: 'Mes commandes', icon: '📦' },
  { href: '/coaching', label: 'Coaching', icon: '🎯' },
  { href: '/profil', label: 'Mon profil', icon: '👤' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="text-xl font-bold text-green-600">Gainova</Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
              pathname === item.href
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  )
}
