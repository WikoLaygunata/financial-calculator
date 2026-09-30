/**
 * Registrasi service worker.
 *
 * Hanya dijalankan pada build produksi: di mode dev, service worker justru
 * menyulitkan karena bisa melayani modul versi lama dan membuat hot reload
 * terasa "macet" tanpa sebab yang jelas.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

  // Tunggu halaman selesai memuat agar registrasi tidak bersaing dengan render pertama.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline bersifat bonus — kalau gagal, aplikasi tetap jalan normal.
    })
  })
}
