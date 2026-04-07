'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function InscriptionForm() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptCgu, setAcceptCgu] = useState(false)
  const [acceptConfidentialite, setAcceptConfidentialite] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!acceptCgu || !acceptConfidentialite) {
      setError('Tu dois accepter les CGU et la politique de confidentialité.')
      return
    }
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/inscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, ref: refCode }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    // Rediriger vers FedaPay
    window.location.href = data.payment_url
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-sm border p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-600">Gainova</Link>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Créer mon compte</h1>
          <p className="text-gray-500 text-sm mt-1">Inscription unique — 1 050 FCFA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ton nom et prénom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Minimum 8 caractères"
            />
          </div>

          {refCode && (
            <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              🎉 Tu as été parrainé(e) — code : <strong>{refCode}</strong>
            </p>
          )}

          <div className="space-y-2 pt-2">
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={acceptCgu} onChange={e => setAcceptCgu(e.target.checked)} className="mt-0.5" />
              <span>{"J'accepte les"} <Link href="/legal/cgu" target="_blank" className="text-green-600 underline">{"Conditions Générales d'Utilisation"}</Link></span>
            </label>
            <label className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={acceptConfidentialite} onChange={e => setAcceptConfidentialite(e.target.checked)} className="mt-0.5" />
              <span>{"J'accepte la"} <Link href="/legal/confidentialite" target="_blank" className="text-green-600 underline">Politique de confidentialité</Link></span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Redirection vers le paiement...' : 'Payer 1 050 FCFA et créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {"Déjà inscrit ?"} <Link href="/connexion" className="text-green-600 font-medium">Se connecter</Link>
        </p>
      </div>
    </main>
  )
}

export default function RejoindreePage() {
  return (
    <Suspense>
      <InscriptionForm />
    </Suspense>
  )
}
