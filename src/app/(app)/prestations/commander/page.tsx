'use client'

import { useState, useEffect } from 'react'

type Prestation = {
  id: string
  title: string
  category: string
  price_min: number
  price_max: number | null
  is_on_quote: boolean
  description: string | null
}

const categoryLabel: Record<string, string> = {
  document: '📄 Documents personnels',
  design: '🎨 Design & Identité visuelle',
  web: '🌐 Web & Digital',
}

export default function CommanderPage() {
  const [prestations, setPrestations] = useState<Prestation[]>([])
  const [selected, setSelected] = useState<Prestation | null>(null)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [acceptConditions, setAcceptConditions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/prestations').then(r => r.json()).then(setPrestations)
  }, [])

  const grouped = prestations.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, Prestation[]>)

  function selectPrestation(p: Prestation) {
    setSelected(p)
    setAmount(p.is_on_quote ? '' : String(p.price_min))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    if (!acceptConditions) { setError("Tu dois accepter les conditions des prestations."); return }
    if (!description.trim()) { setError('Décris ton besoin.'); return }
    const num = Number(amount)
    if (!num || num < (selected.price_min || 1)) { setError('Montant invalide.'); return }

    setLoading(true)
    setError('')
    const res = await fetch('/api/commandes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prestation_id: selected.id, description, amount: num }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Erreur'); setLoading(false); return }
    window.location.href = data.payment_url
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Commander une prestation</h1>
      <p className="text-gray-500 mb-8">Sélectionne une prestation, décris ton besoin et paie en ligne.</p>

      {!selected ? (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="font-semibold text-gray-700 mb-3">{categoryLabel[cat] ?? cat}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {items.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectPrestation(p)}
                    className="text-left bg-white border rounded-xl p-4 hover:border-green-500 hover:shadow-sm transition"
                  >
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-sm text-green-600 mt-1">
                      {p.is_on_quote ? 'Sur devis' : p.price_max
                        ? `${p.price_min.toLocaleString('fr-FR')} — ${p.price_max.toLocaleString('fr-FR')} FCFA`
                        : `${p.price_min.toLocaleString('fr-FR')} FCFA`}
                    </p>
                    {p.description && <p className="text-xs text-gray-400 mt-1">{p.description}</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-xl">
          <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
            ← Changer de prestation
          </button>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="font-semibold text-green-800">{selected.title}</p>
            <p className="text-sm text-green-600">
              {selected.is_on_quote ? 'Sur devis' : selected.price_max
                ? `${selected.price_min.toLocaleString('fr-FR')} — ${selected.price_max.toLocaleString('fr-FR')} FCFA`
                : `${selected.price_min.toLocaleString('fr-FR')} FCFA`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Décris ton besoin</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Explique ce que tu veux, tes préférences, tes couleurs, tes références..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA)</label>
              <input
                type="number"
                required
                min={selected.price_min || 1}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                readOnly={!selected.is_on_quote && !selected.price_max}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 read-only:bg-gray-50"
              />
              {selected.price_max && (
                <p className="text-xs text-gray-400 mt-1">Entre {selected.price_min.toLocaleString('fr-FR')} et {selected.price_max.toLocaleString('fr-FR')} FCFA</p>
              )}
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={acceptConditions} onChange={e => setAcceptConditions(e.target.checked)} className="mt-0.5" />
              <span>{"J'accepte les"} <a href="/legal/prestations" target="_blank" className="text-green-600 underline">conditions des prestations</a></span>
            </label>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Redirection vers le paiement...' : `Payer ${Number(amount).toLocaleString('fr-FR')} FCFA`}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
