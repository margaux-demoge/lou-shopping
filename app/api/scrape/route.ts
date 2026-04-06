import { NextRequest, NextResponse } from 'next/server'

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num)))
}

function extractOGData(html: string, url: string) {
  const getMeta = (name: string): string | null => {
    const patterns = [
      new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${name}["']`, 'i'),
      new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${name}["']`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) return decodeHTMLEntities(match[1].trim())
    }
    return null
  }

  const title =
    getMeta('og:title') ||
    getMeta('twitter:title') ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    'Article sans nom'

  const image =
    getMeta('og:image') ||
    getMeta('og:image:secure_url') ||
    getMeta('twitter:image') ||
    getMeta('twitter:image:src') ||
    null

  const rawCurrency =
    getMeta('og:price:currency') ||
    getMeta('product:price:currency') ||
    null

  // N'utilise le prix que si la devise est EUR (ou non précisée)
  const isEur = !rawCurrency || ['EUR', 'euro', '€'].includes(rawCurrency.toUpperCase())
  const price = isEur
    ? getMeta('og:price:amount') || getMeta('product:price:amount') || getMeta('price') || null
    : null

  const currency = '€'

  let hostname = ''
  try {
    hostname = new URL(url).hostname.replace('www.', '')
  } catch {
    hostname = url
  }

  const siteName = getMeta('og:site_name') || hostname

  return { title: decodeHTMLEntities(title), image, price, currency, siteName }
}

async function scrapeViaMicrolink(url: string) {
  const apiUrl = `https://api.microlink.io?url=${encodeURIComponent(url)}&meta=true`
  const res = await fetch(apiUrl, { headers: { 'Accept': 'application/json' } })
  if (!res.ok) throw new Error(`Microlink error ${res.status}`)
  const json = await res.json()
  if (json.status !== 'success') throw new Error('Microlink returned non-success')

  const data = json.data
  let hostname = ''
  try { hostname = new URL(url).hostname.replace('www.', '') } catch { hostname = url }

  return {
    title: data.title || data.description || 'Article sans nom',
    image: data.image?.url || data.screenshot?.url || null,
    price: null, // Microlink ne retourne pas le prix
    currency: '€',
    siteName: data.publisher || hostname,
  }
}

async function scrapeDirectly(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  return extractOGData(html, url)
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }

  try { new URL(url) } catch {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
  }

  // Essai 1 : scraping direct (plus rapide, récupère le prix)
  try {
    const data = await scrapeDirectly(url)
    if (data.title && data.image) return NextResponse.json(data)
    throw new Error('Données incomplètes')
  } catch {
    // fallback Microlink
  }

  // Essai 2 : Microlink (headless browser, contourne les blocages)
  try {
    const data = await scrapeViaMicrolink(url)
    return NextResponse.json(data)
  } catch (err) {
    console.error('All scrape methods failed:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer le produit. Essaie un lien direct vers un article (pas une page collection).' },
      { status: 422 }
    )
  }
}
