'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function LivrerCommandePage() {
  const { id } = useParams()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Sélectionne un fichier.'); return }
    setLoading(true)
    const formData = new FormData()
    formData.append('order_id', id as string)
    formData.append('file', file)
    const res = await fetch('/api/admin/commandes/livrer', { method: 'POST', body: formData })
    if (res.ok) router.push('/admin/commandes')
    else { setError('Erreur lors de la livraison.'); setLoading(false) }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Livrer la commande</h1>
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fichier livrable</label>
          <input
            type="file"
            required
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Envoi...' : 'Livrer la commande'}
        </button>
      </form>
    </div>
  )
}
