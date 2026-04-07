'use client'

import { useState, useEffect } from 'react'

type Order = {
  id: string
  amount: number
  description: string
  status: string
  revision_count: number
  created_at: string
  delivered_at: string | null
  prestation: { title: string; category: string } | null
}

const statusLabel: Record<string, { label: string; color: string }> = {
  pending:    { label: '⏳ En attente',    color: 'bg-yellow-100 text-yellow-700' },
  in_progress:{ label: '🔄 En cours',      color: 'bg-blue-100 text-blue-700' },
  delivered:  { label: '📦 Livré',         color: 'bg-purple-100 text-purple-700' },
  validated:  { label: '✅ Validé',        color: 'bg-green-100 text-green-700' },
  cancelled:  { label: '❌ Annulé',        color: 'bg-red-100 text-red-700' },
}

export default function MesCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/commandes').then(r => r.json()).then(data => {
      setOrders(data)
      setLoading(false)
    })
  }, [])

  async function valider(id: string) {
    await fetch('/api/commandes/valider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: id }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'validated' } : o))
  }

  if (loading) return <div className="text-gray-400 text-sm p-8">Chargement...</div>

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes commandes</h1>
      <p className="text-gray-500 mb-8">Suivi de tes commandes de prestations</p>

      {orders.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-400 text-sm">
          Aucune commande pour le moment.<br />
          <a href="/prestations/commander" className="text-green-600 underline mt-2 inline-block">Commander une prestation</a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => {
            const s = statusLabel[o.status] ?? { label: o.status, color: 'bg-gray-100 text-gray-700' }
            return (
              <div key={o.id} className="bg-white border rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{o.prestation?.title ?? 'Prestation'}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{o.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(o.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{o.amount.toLocaleString('fr-FR')} FCFA
                      {o.revision_count > 0 && ` · ${o.revision_count} révision(s)`}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${s.color}`}>{s.label}</span>
                </div>

                {o.status === 'delivered' && (
                  <div className="mt-4 pt-4 border-t flex gap-3">
                    <button
                      onClick={() => valider(o.id)}
                      className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Valider la livraison
                    </button>
                    <a
                      href={`/mes-commandes/${o.id}`}
                      className="border text-sm px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                      Voir les fichiers
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
