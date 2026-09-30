<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppLogo from '@/components/layout/AppLogo.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import ProfileDrawer from '@/components/layout/ProfileDrawer.vue'
import { derived, initTheme, isDark, toggleTheme } from '@/stores/financeStore'
import { formatPercent, formatRupiahCompact } from '@/utils/format'

const route = useRoute()
const mobileNavOpen = ref(false)
const profileOpen = ref(false)

onMounted(initTheme)

// Tutup panel saat pindah halaman supaya tidak menghalangi konten.
watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false
  },
)

// Cegah scroll di belakang panel yang sedang terbuka.
watch([mobileNavOpen, profileOpen], ([nav, profile]) => {
  document.body.style.overflow = nav || profile ? 'hidden' : ''
})

// Escape menutup panel mana pun yang sedang terbuka.
function onKeydown(event) {
  if (event.key !== 'Escape') return
  mobileNavOpen.value = false
  profileOpen.value = false
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- Sidebar desktop -->
    <aside
      class="sticky top-0 hidden h-screen w-72 shrink-0 border-r divide-line bg-white/80 backdrop-blur
        lg:block dark:bg-ink-900/60"
    >
      <AppSidebar />
    </aside>

    <!-- Drawer navigasi mobile -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileNavOpen"
          class="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm lg:hidden"
          @click="mobileNavOpen = false"
        />
      </Transition>
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="-translate-x-full"
        leave-active-class="transition duration-200 ease-in"
        leave-to-class="-translate-x-full"
      >
        <aside
          v-if="mobileNavOpen"
          class="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden dark:bg-ink-900"
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi"
        >
          <AppSidebar @navigate="mobileNavOpen = false" />
        </aside>
      </Transition>
    </Teleport>

    <!-- Kolom konten -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Topbar -->
      <header
        class="sticky top-0 z-30 border-b divide-line bg-ink-50/85 backdrop-blur-lg dark:bg-ink-950/80"
      >
        <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border border-ink-200
              text-ink-600 transition hover:bg-ink-100 lg:hidden
              dark:border-white/10 dark:text-ink-300 dark:hover:bg-white/10"
            aria-label="Buka navigasi"
            @click="mobileNavOpen = true"
          >
            <svg viewBox="0 0 20 20" fill="none" class="size-4">
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              />
            </svg>
          </button>

          <AppLogo size="sm" class="lg:hidden" />

          <!-- Ringkasan cepat dari profil, hanya di layar lebar -->
          <div class="hidden min-w-0 items-center gap-6 lg:flex">
            <div class="min-w-0">
              <p class="text-[0.65rem] font-bold tracking-wide text-ink-400 uppercase">
                Uang bebas / bulan
              </p>
              <p
                class="tnum text-sm font-extrabold"
                :class="
                  derived.surplus >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                "
              >
                {{ formatRupiahCompact(derived.surplus) }}
              </p>
            </div>
            <div class="min-w-0 border-l divide-line pl-6">
              <p class="text-[0.65rem] font-bold tracking-wide text-ink-400 uppercase">
                Rasio cicilan
              </p>
              <p
                class="tnum text-sm font-extrabold"
                :class="{
                  'text-emerald-600 dark:text-emerald-400': derived.dsr.level === 'safe',
                  'text-amber-600 dark:text-amber-400': derived.dsr.level === 'warn',
                  'text-rose-600 dark:text-rose-400': derived.dsr.level === 'danger',
                }"
              >
                {{ formatPercent(derived.dsr.ratio) }}
              </p>
            </div>
          </div>

          <div class="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="btn-ghost !px-3"
              :aria-label="isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'"
              @click="toggleTheme()"
            >
              <span aria-hidden="true">{{ isDark ? '☀️' : '🌙' }}</span>
            </button>

            <button type="button" class="btn-primary" @click="profileOpen = true">
              <span aria-hidden="true">👤</span>
              <span class="hidden sm:inline">Profil Keuangan</span>
              <span class="sm:hidden">Profil</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Halaman -->
      <main class="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <footer class="border-t divide-line px-4 py-6 sm:px-6">
        <div class="mx-auto max-w-7xl space-y-2">
          <p class="hint">
            <strong class="font-bold text-ink-600 dark:text-ink-300">Financi</strong> — semua
            perhitungan berjalan di browsermu, tidak ada data yang dikirim ke server.
          </p>
          <p class="hint">
            Angka di aplikasi ini adalah simulasi dengan asumsi yang bisa kamu ubah sendiri, bukan
            saran keuangan atau jaminan hasil. Untuk keputusan besar, pertimbangkan berdiskusi dengan
            perencana keuangan.
          </p>
        </div>
      </footer>
    </div>

    <ProfileDrawer :open="profileOpen" @close="profileOpen = false" />
  </div>
</template>
