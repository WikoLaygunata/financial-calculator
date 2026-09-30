/*
 * Service worker Financi — dukungan offline.
 *
 * Aplikasi ini menghitung semuanya di browser dan tidak butuh server saat dipakai,
 * jadi sebenarnya tidak ada alasan ia harus mati ketika internet putus.
 *
 * Strateginya dibedakan per jenis permintaan:
 *
 * 1. Navigasi (buka/refresh halaman) — NETWORK-FIRST.
 *    Penting: index.html menunjuk ke nama file aset yang ber-hash. Kalau HTML-nya
 *    dilayani dari cache lebih dulu, pengguna bisa terjebak di versi lama selamanya.
 *    Jaringan didahulukan supaya pembaruan langsung terpakai; cache hanya dipakai
 *    saat offline.
 *
 * 2. Aset ber-hash di /assets/ — CACHE-FIRST.
 *    Nama filenya sudah mengandung hash isi, jadi isinya tidak mungkin berubah.
 *    Aman diambil dari cache dan cepat.
 *
 * 3. Aset statis lain (favicon, font lokal) — cache-first dengan pembaruan
 *    di latar belakang, supaya tetap segar tanpa menghambat tampilan.
 *
 * Permintaan lintas-origin sengaja TIDAK disentuh sama sekali.
 */

const VERSION = 'v2'
const CACHE = `financi-${VERSION}`
const SHELL_URL = '/index.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE)
        // fetch + put, bukan cache.add(), supaya kegagalan bisa ditangani sendiri
        // dan instalasi tidak ikut gagal hanya karena shell belum bisa diambil.
        const response = await fetch(SHELL_URL, { cache: 'reload' })
        if (response.ok) await cache.put(SHELL_URL, response)
      } catch {
        // Tidak masalah: shell akan tersimpan saat navigasi pertama yang berhasil.
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Buang cache versi lama supaya penyimpanan tidak menumpuk.
      const names = await caches.keys()
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)))
      await self.clients.claim()
    })(),
  )
})

/** Ambil dari jaringan, simpan salinannya, dan kembalikan hasilnya. */
async function fetchAndCache(request, cache) {
  const response = await fetch(request)
  // Hanya simpan respons yang benar-benar berhasil.
  if (response && response.status === 200 && response.type === 'basic') {
    cache.put(request, response.clone())
  }
  return response
}

async function handleNavigation(request) {
  const cache = await caches.open(CACHE)
  try {
    const fresh = await fetch(request)
    if (fresh && fresh.status === 200) {
      cache.put(SHELL_URL, fresh.clone())
      return fresh
    }
    throw new Error('Respons navigasi tidak valid')
  } catch {
    // Offline: layani shell dari cache. Router menangani path-nya di sisi klien.
    const cached = (await cache.match(SHELL_URL)) ?? (await cache.match(request))
    if (cached) return cached
    return new Response(
      '<!doctype html><meta charset="utf-8"><title>Financi — offline</title>' +
        '<body style="font-family:system-ui;padding:2rem;max-width:32rem;margin:auto">' +
        '<h1>Belum bisa dibuka offline</h1>' +
        '<p>Buka Financi sekali saja sambil terhubung internet, setelah itu aplikasinya bisa dipakai tanpa koneksi.</p>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 },
    )
  }
}

async function handleAsset(request, { immutable }) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)

  if (cached) {
    // Aset ber-hash tidak pernah berubah, jadi tidak perlu diperiksa ulang.
    if (!immutable) {
      // Segarkan di latar belakang; kegagalan diabaikan karena versi cache sudah cukup.
      fetchAndCache(request, cache).catch(() => {})
    }
    return cached
  }

  // Belum ada di cache: ambil dari jaringan. Kalau gagal, biarkan error-nya
  // naik ke browser seperti permintaan biasa tanpa service worker.
  return fetchAndCache(request, cache)
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }

  const isHashedAsset = url.pathname.startsWith('/assets/')
  const isStaticAsset =
    /\.(css|js|woff2?|ttf|otf|png|jpe?g|svg|webp|ico|json|webmanifest)$/i.test(
      url.pathname,
    )

  if (isHashedAsset || isStaticAsset) {
    event.respondWith(handleAsset(request, { immutable: isHashedAsset }))
  }
})

/** Memungkinkan halaman memaksa worker baru langsung aktif. */
self.addEventListener('message', (event) => {
  if (event.data === 'skip-waiting') self.skipWaiting()
})
