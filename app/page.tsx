'use client'

import { useEffect, useState, useCallback } from 'react'
import AddItemForm from '@/components/AddItemForm'
import MoodBoard from '@/components/MoodBoard'
import { Item } from '@/lib/types'

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPrice, setTotalPrice] = useState<number | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/items')
      const data: Item[] = await res.json()
      setItems(data)

      const prices = data
        .map((i) => parseFloat(i.price?.replace(',', '.') || ''))
        .filter((p) => !isNaN(p))
      setTotalPrice(prices.length > 0 ? prices.reduce((a, b) => a + b, 0) : null)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
    // Poll every 5s so les ajouts de Lou apparaissent en live
    const interval = setInterval(fetchItems, 5000)
    return () => clearInterval(interval)
  }, [fetchItems])

  const handleAdd = (item: Item) => {
    setItems((prev) => [item, ...prev])
  }

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await fetch('/api/items', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAF7]/90 backdrop-blur-md border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Title */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
              Lou fait ton shopping ☀️
            </h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {items.length > 0
                ? `${items.length} pièce${items.length > 1 ? 's' : ''} sélectionnée${items.length > 1 ? 's' : ''}`
                : 'En attente de Lou…'}
              {totalPrice !== null && (
                <span className="ml-2 font-semibold text-amber-600">
                  · {totalPrice.toFixed(2)} €
                </span>
              )}
            </p>
          </div>

          {/* Form */}
          <div className="w-full sm:w-auto sm:flex-1 sm:max-w-md">
            <AddItemForm onAdd={handleAdd} />
          </div>
        </div>
      </div>

      {/* Moodboard */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin" />
              <p className="text-stone-400 text-sm">Chargement du panier…</p>
            </div>
          </div>
        ) : (
          <MoodBoard items={items} onDelete={handleDelete} />
        )}
      </div>

      {/* Floating total */}
      {items.length > 0 && (
        <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-lg border border-stone-100 px-5 py-3 flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <div>
            <p className="text-xs text-stone-400 leading-none">Total estimé</p>
            <p className="text-lg font-bold text-stone-800 leading-tight">
              {totalPrice !== null ? `${totalPrice.toFixed(2)} €` : '—'}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
