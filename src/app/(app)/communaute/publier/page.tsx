'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PublierPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() && !image) {
      setError('Ajoute du texte ou une image.')
      return
    }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('content', content)
    if (image) formData.append('image', image)

    const res = await fetch('/api/communaute/publier', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la publication.')
      setLoading(false)
      return
    }

    router.push('/communaute')
  }

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/communaute" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Retour
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Nouvelle publication</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            maxLength={1000}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Partage quelque chose avec la communauté..."
          />
          <p className="text-xs text-gray-400 text-right">{content.length}/1000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-700">
          ⏳ Ta publication sera visible après validation par notre équipe (jusqu'à 24h). Elle restera en ligne 48h.
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Envoi en cours...' : 'Soumettre pour modération'}
        </button>
      </form>
    </div>
  )
}
