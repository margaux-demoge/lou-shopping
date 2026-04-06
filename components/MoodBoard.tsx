'use client'

import { Item } from '@/lib/types'
import ItemCard from './ItemCard'

type Props = {
  items: Item[]
  onDelete: (id: string) => void
}

export default function MoodBoard({ items, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-6xl mb-4 animate-bounce">🛍️</div>
        <p className="text-stone-400 text-lg font-light">
          Le panier est vide pour l&apos;instant…
        </p>
        <p className="text-stone-300 text-sm mt-1">
          Lou n&apos;a pas encore fait son shopping !
        </p>
      </div>
    )
  }

  return (
    <div
      className="columns-2 md:columns-3 lg:columns-4 gap-4"
      style={{ columnFill: 'balance' }}
    >
      {items.map((item) => (
        <ItemCard key={item.id} item={item} onDelete={onDelete} />
      ))}
    </div>
  )
}
