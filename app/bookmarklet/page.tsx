export default function BookmarkletPage() {
  const bookmarkletCode = `javascript:(function(){var t=document.querySelector('meta[property="og:title"]')?.content||document.title;var img=document.querySelector('meta[property="og:image:secure_url"]')?.content||document.querySelector('meta[property="og:image"]')?.content||'';var site=document.querySelector('meta[property="og:site_name"]')?.content||location.hostname.replace('www.','');var price='';var sel=['[class*="price"]:not([class*="original"]):not([class*="old"]):not([class*="strike"])','[itemprop="price"]','[data-price]','[class*="Price"]'];for(var s of sel){var el=document.querySelector(s);if(el){var txt=el.getAttribute('content')||el.textContent||'';var m=txt.match(/\\d[\\d\\s.,]*/);if(m){price=m[0].replace(/\\s/g,'').replace(',','.');break;}}}var p=new URLSearchParams({url:location.href,title:t,image:img,siteName:site,price:price});window.open('https://lou-shopping.vercel.app/add?'+p.toString(),'_blank');})();`

  return (
    <main className="min-h-screen bg-[#FAFAF7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-stone-800 mb-2">Bookmarklet Lou ☀️</h1>
        <p className="text-stone-400 text-sm mb-10">
          Glisse ce bouton dans ta barre de favoris. Ensuite, sur n&apos;importe quelle page produit, clique dessus pour l&apos;ajouter au panier.
        </p>

        {/* Le bookmarklet draggable */}
        <a
          href={bookmarkletCode}
          className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg cursor-grab active:cursor-grabbing select-none transition-all hover:scale-105 hover:shadow-xl"
          onClick={(e) => e.preventDefault()}
          draggable
        >
          🛍️ Ajouter à mon panier
        </a>

        <p className="text-stone-300 text-xs mt-4">← glisse ce bouton dans ta barre de favoris</p>

        <div className="mt-12 bg-white rounded-2xl p-6 text-left shadow-sm border border-stone-100 space-y-4">
          <h2 className="font-semibold text-stone-700">Comment ça marche</h2>
          <ol className="space-y-3 text-sm text-stone-500">
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">1.</span>
              Glisse le bouton ci-dessus dans ta barre de favoris (ou signets)
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">2.</span>
              Va sur n&apos;importe quelle page produit (Zara, ASOS, Sandro…)
            </li>
            <li className="flex gap-3">
              <span className="text-amber-500 font-bold">3.</span>
              Clique sur le favori — l&apos;article s&apos;ajoute automatiquement au panier ✨
            </li>
          </ol>
        </div>

        <a href="/" className="inline-block mt-8 text-sm text-stone-400 hover:text-amber-500 transition-colors">
          ← Voir le panier
        </a>
      </div>
    </main>
  )
}
