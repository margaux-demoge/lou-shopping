import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'
import { Item } from '@/lib/types'

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KEY = 'shopping:items'

export async function GET() {
  try {
    const items = await redis.lrange<Item>(KEY, 0, -1)
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
  await redis.lpush(KEY, item)
  return NextResponse.json(item, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const items = await redis.lrange<Item>(KEY, 0, -1)
  const toRemove = items.find((i) => i.id === id)
  if (toRemove) {
    await redis.lrem(KEY, 1, toRemove)
  }
  return NextResponse.json({ success: true })
}
