import { nextTick, onBeforeUnmount, onMounted, watch } from 'vue'

/**
 * Focus trap untuk panel modal (drawer Profil, navigasi mobile).
 *
 * Tanpa ini, pengguna keyboard bisa "keluar" dari panel yang sedang terbuka:
 * Tab akan lanjut ke elemen di halaman belakang yang tertutup overlay, sehingga
 * fokus jadi tidak kelihatan dan panel praktis tidak bisa dioperasikan.
 *
 * Yang dilakukan:
 * 1. Saat dibuka  — ingat elemen yang sedang fokus, lalu pindahkan fokus ke dalam panel.
 * 2. Selama aktif — Tab / Shift+Tab berputar di dalam panel saja.
 * 3. Saat ditutup — kembalikan fokus ke elemen pemicu, supaya pengguna tidak kehilangan posisi.
 *
 * @param {import('vue').Ref<HTMLElement|null>} containerRef elemen panel
 * @param {import('vue').Ref<boolean>} isOpen  status terbuka
 * @param {object} [options]
 * @param {boolean} [options.autoFocus=true] pindahkan fokus otomatis saat dibuka
 */
export function useFocusTrap(containerRef, isOpen, { autoFocus = true } = {}) {
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')

  let lastFocused = null

  /** Hanya elemen yang benar-benar terlihat yang boleh menerima fokus. */
  const focusableItems = () => {
    const root = containerRef.value
    if (!root) return []
    return Array.from(root.querySelectorAll(FOCUSABLE)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement,
    )
  }

  function onKeydown(event) {
    if (event.key !== 'Tab' || !isOpen.value) return

    const root = containerRef.value
    if (!root) return

    const items = focusableItems()
    if (!items.length) {
      // Tidak ada yang bisa difokus: tahan fokus di panel itu sendiri.
      event.preventDefault()
      root.focus?.()
      return
    }

    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    const insidePanel = root.contains(active)

    if (event.shiftKey) {
      if (active === first || !insidePanel) {
        event.preventDefault()
        last.focus()
      }
      return
    }

    if (active === last || !insidePanel) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, async (open) => {
    if (open) {
      lastFocused = document.activeElement
      if (!autoFocus) return
      // Panel dirender lewat v-if + Transition, jadi tunggu DOM-nya ada dulu.
      await nextTick()
      const items = focusableItems()
      ;(items[0] ?? containerRef.value)?.focus?.()
      return
    }

    // Kembalikan fokus hanya kalau elemennya masih ada di dokumen.
    if (lastFocused?.isConnected) lastFocused.focus?.()
    lastFocused = null
  })

  // Capture phase supaya tetap jalan walau ada handler lain di dalam panel.
  onMounted(() => document.addEventListener('keydown', onKeydown, true))
  onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown, true))
}
