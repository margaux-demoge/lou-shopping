import { kv } from '@vercel/kv'
import { NextRequest, NextResponse } from 'next/server'
import { Item } from '@/lib/types'

const KEY = 'shopping:items'

export async function GET() {
  try {
    const items = await kv.lrange<Item>(KEY, 0, -1)
    return NextResponse.json(items || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest) {
  const item: Item = await req.json()
  if (!item.id || !item.url) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
  }
  await kv.lpush(KEY, item)
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const items = await kv.lrange<Item>(KEY, 0, -1)
  const toRemove = items.find((i) => i.id === id)
  if (toRemove) {
    await kv.lrem(KEY, 1, toRemove)
  }
  return NextResponse.json({ success: true })
}
