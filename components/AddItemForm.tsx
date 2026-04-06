'use client'

import { useState } from 'react'
import { Item } from '@/lib/types'

type Props = {
  onAdd: (item: Item) => void
}

export default function AddItemForm({ onAdd }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Scrape product info
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })

      if (!scrapeRes.ok) {
        const { error: msg } = await scrapeRes.json()
        throw new Error(msg || 'Impossible de récupérer le produit')
      }

      const scraped = await scrapeRes.json()

      // 2. Save to KV
      const item: Item = {
        id: crypto.randomUUID(),
        url: url.trim(),
        title: scraped.title,
        image: scraped.image,
        price: scraped.price,
        currency: scraped.currency || '€',
        site_name: scraped.siteName,
        created_at: new Date().toISOString(),
      }

      const saveRes = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })

      if (!saveRes.ok) throw new Error('Erreur lors de la sauvegarde')

      onAdd(item)
      setUrl('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2 items-center bg-white rounded-2xl shadow-md p-2 border border-stone-100">
          <span className="pl-2 text-xl">🔗</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Colle un lien produit ici…"
            className="flex-1 bg-transparent outline-none text-stone-700 placeholder-stone-300 text-sm py-2 min-w-0"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-2 active:scale-95"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Chargement…
              </>
            ) : (
              'Ajouter ✨'
            )}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 text-center text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-center text-sm text-emerald-500 font-medium animate-fade-in">
          Ajouté au panier ! 🎉
        </p>
      )}
    </div>
  )
}
