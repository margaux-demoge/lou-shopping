'use client'

import { Item } from '@/lib/types'
import Image from 'next/image'

type Props = {
  item: Item
  onDelete: (id: string) => void
}

export default function ItemCard({ item, onDelete }: Props) {
  const displayPrice = item.price ? `${item.price} €` : null

  return (
    <div className="group relative break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-stone-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-stone-100">
            <span className="text-4xl">🛍️</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Delete button */}
        <button
          onClick={() => onDelete(item.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:scale-110 shadow-md"
          title="Retirer"
        >
          <span className="text-stone-500 hover:text-red-500 text-sm leading-none">✕</span>
        </button>

        {/* Price badge */}
        {displayPrice && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-white/95 backdrop-blur-sm text-stone-800 text-sm font-semibold px-3 py-1 rounded-full shadow-sm">
              {displayPrice}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-amber-600 font-medium uppercase tracking-wider mb-1">
          {item.site_name}
        </p>
        <p className="text-sm text-stone-700 font-medium leading-snug line-clamp-2">
          {item.title}
        </p>
        {displayPrice && (
          <p className="text-sm font-bold text-stone-900 mt-1">{displayPrice}</p>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-stone-400 hover:text-amber-600 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          Voir le produit →
        </a>
      </div>
    </div>
  )
}
