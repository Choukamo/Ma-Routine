const CACHE = 'ma-routine-v2'

// Met l'appli en cache dès la première visite pour qu'elle s'ouvre hors-ligne.
async function precache() {
  const c = await caches.open(CACHE)
  const res = await fetch('/', { cache: 'no-store' })
  const html = await res.clone().text()
  const files = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1])
  await c.put('/', res)
  await c.addAll([...new Set(files)])
}

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(precache().catch((err) => console.warn('Mise en cache hors-ligne impossible', err)))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

// Réseau d'abord (toujours la dernière version), cache si hors-ligne.
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copy))
        return res
      })
      .catch(() => caches.match(req, { ignoreVary: true }).then((r) => r || caches.match('/'))),
  )
})
