'use client'

import { useState, useEffect } from 'react'

type Profile = { balance: number }
type Withdrawal = {
  id: string
  amount: number
  phone: string
  operator: string
  status: string
  created_at: string
  processed_at: string | null
}

export default function RetraitsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [form, setForm] = useState({ amount: '', phone: '', operator: 'mtn' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [acceptConditions, setAcceptConditions] = useState(false)

  useEffect(() => {
    fetch('/api/retraits').then(r => r.json()).then(data => {
      setProfile(data.profile)
      setWithdrawals(data.withdrawals)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptConditions) {
      setError("Tu dois accepter les conditions du parrainage.")
      return
    }
    const amount = Number(form.amount)
    if (amount < 1000) {
      setError('Montant minimum : 1 000 FCFA')
      return
    }
    if (amount > (profile?.balance ?? 0)) {
      setError('Solde insuffisant')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/retraits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la demande.')
    } else {
      setSuccess(data.auto ? 'Virement en cours — tu recevras ton argent dans quelques minutes.' : 'Demande enregistrée — traitement sous 24-48h.')
      setForm({ amount: '', phone: '', operator: 'mtn' })
      setProfile(prev => prev ? { ...prev, balance: prev.balance - amount } : prev)
    }
    setLoading(false)
  }

  const statusLabel: Record<string, string> = {
    pending: '⏳ En attente',
    processing: '🔄 En cours',
    paid: '✅ Versé',
    rejected: '❌ Rejeté',
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Retraits</h1>
      <p className="text-gray-500 mb-8">Retire tes commissions via Mobile Money</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Formulaire */}
        <div className="bg-white border rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Solde disponible</h2>
          <p className="text-3xl font-bold text-green-600 mb-6">
            {profile?.balance?.toLocaleString('fr-FR') ?? '—'} FCFA
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input
                type="number"
                min={1000}
                required
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Minimum 1 000 FCFA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro Mobile Money</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="+229 XX XX XX XX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
              <select
                value={form.operator}
                onChange={e => setForm({ ...form, operator: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="mtn">MTN Mobile Money</option>
                <option value="moov">Moov Money</option>
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={acceptConditions} onChange={e => setAcceptConditions(e.target.checked)} className="mt-0.5" />
              <span>{"J'accepte les"} <a href="/legal/parrainage" target="_blank" className="text-green-600 underline">conditions du parrainage</a></span>
            </label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Demander le retrait'}
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-2">ℹ️ Comment ça marche</p>
            <ul className="space-y-1 text-xs">
              <li>• Minimum : 1 000 FCFA</li>
              <li>• Versement via MTN ou Moov Money</li>
              <li>• ≤ 5 000 FCFA → virement automatique immédiat</li>
              <li>• &gt; 5 000 FCFA → validation manuelle (24-48h)</li>
              <li>• Aucun frais prélevé par Gainova</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-gray-900">Historique des retraits</h2>
        </div>
        {withdrawals.length > 0 ? (
          <div className="divide-y">
            {withdrawals.map(w => (
              <div key={w.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-800">{w.amount.toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-xs text-gray-400">{w.phone} · {w.operator.toUpperCase()}</p>
                  <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className="text-sm">{statusLabel[w.status] ?? w.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-sm">Aucun retrait effectué.</div>
        )}
      </div>
    </div>
  )
}
