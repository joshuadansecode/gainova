'use client'

import { useState, useEffect } from 'react'

type Session = {
  id: string
  type: string
  sessions_total: number
  sessions_used: number
  amount: number
  status: string
  scheduled_at: string | null
  created_at: string
}

export default function CoachingPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch('/api/coaching').then(r => r.json()).then(data => {
      setSessions(data)
      setFetching(false)
    })
  }, [])

  async function reserver(type: 'single' | 'pack') {
    setLoading(true)
    const res = await fetch('/api/coaching', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    })
    const data = await res.json()
    if (data.payment_url) window.location.href = data.payment_url
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    active: '✅ Actif',
    completed: '🏁 Terminé',
    cancelled: '❌ Annulé',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Coaching</h1>
      <p className="text-gray-500 mb-8">Réserve une session de coaching personnalisé avec notre équipe</p>

      {/* Offres */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white border rounded-xl p-6">
          <p className="font-semibold text-gray-900 text-lg mb-1">1 séance</p>
          <p className="text-3xl font-bold text-green-600 mb-2">2 000 <span className="text-base font-normal text-gray-500">FCFA</span></p>
          <p className="text-sm text-gray-500 mb-4">1 heure de coaching individuel. L'équipe te contacte pour fixer la date.</p>
          <button
            onClick={() => reserver('single')}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            {loading ? '...' : 'Réserver'}
          </button>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-6 relative">
          <span className="absolute top-3 right-3 bg-white text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Économie 2 000 FCFA</span>
          <p className="font-semibold text-lg mb-1">Pack 5 séances</p>
          <p className="text-3xl font-bold mb-2">8 000 <span className="text-base font-normal opacity-80">FCFA</span></p>
          <p className="text-sm opacity-80 mb-4">5 heures de coaching. Idéal pour un accompagnement complet.</p>
          <button
            onClick={() => reserver('pack')}
            disabled={loading}
            className="w-full bg-white text-green-700 py-2.5 rounded-xl font-semibold hover:bg-green-50 disabled:opacity-50 text-sm"
          >
            {loading ? '...' : 'Réserver le pack'}
          </button>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-900">Mes sessions</h2>
        </div>
        {fetching ? (
          <div className="p-8 text-center text-gray-400 text-sm">Chargement...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Aucune session pour le moment.</div>
        ) : (
          <div className="divide-y">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {s.type === 'pack' ? 'Pack 5 séances' : '1 séance'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {s.sessions_used}/{s.sessions_total} séances utilisées
                    {s.scheduled_at && ` · Planifiée le ${new Date(s.scheduled_at).toLocaleDateString('fr-FR')}`}
                  </p>
                  <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">{s.amount.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-gray-500 mt-0.5">{statusLabel[s.status] ?? s.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
