'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Item } from '@/lib/types'
import { Suspense } from 'react'

function AddItemInner() {
  const params = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const url = params.get('url')
    const title = params.get('title') || 'Article sans nom'
    const image = params.get('image') || null
    const siteName = params.get('siteName') || ''
    const rawPrice = params.get('price') || ''

    if (!url) { setStatus('error'); return }

    const price = rawPrice ? parseFloat(rawPrice.replace(',', '.')).toFixed(2) : null

    const item: Item = {
      id: crypto.randomUUID(),
      url,
      title,
      image,
      price: price && !isNaN(parseFloat(price)) ? price : null,
      currency: '€',
      site_name: siteName,
      created_at: new Date().toISOString(),
    }

    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
      .then((r) => {
        if (!r.ok) throw new Error()
        setStatus('success')
        setTimeout(() => { window.location.href = '/' }, 1200)
      })
      .catch(() => setStatus('error'))
  }, [params])

  return (
    <main className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 border-amber-300 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-500">Ajout en cours…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-stone-700 font-semibold text-lg">Ajouté au panier !</p>
            <p className="text-stone-400 text-sm mt-1">Redirection…</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">😬</div>
            <p className="text-stone-700 font-semibold">Une erreur est survenue</p>
            <a href="/" className="text-amber-500 text-sm mt-2 inline-block hover:underline">
              Retour au panier
            </a>
          </>
        )}
      </div>
    </main>
  )
}

export default function AddPage() {
  return (
    <Suspense>
      <AddItemInner />
    </Suspense>
  )
}
