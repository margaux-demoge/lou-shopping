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

  const price =
    getMeta('og:price:amount') ||
    getMeta('product:price:amount') ||
    getMeta('price') ||
    null

  const currency =
    getMeta('og:price:currency') ||
    getMeta('product:price:currency') ||
    '€'

  let hostname = ''
  try {
    hostname = new URL(url).hostname.replace('www.', '')
  } catch {
    hostname = url
  }

  const siteName = getMeta('og:site_name') || hostname

  return {
    title: decodeHTMLEntities(title),
    image,
    price,
    currency,
    siteName,
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
  }

  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const data = extractOGData(html, url)

    return NextResponse.json(data)
  } catch (err) {
    console.error('Scrape error:', err)
    return NextResponse.json(
      { error: 'Impossible de récupérer le produit. Le site bloque peut-être les requêtes automatiques.' },
      { status: 422 }
    )
  }
}
