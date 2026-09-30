<script setup>
/**
 * Accordion penjelasan fitur — dipakai di SETIAP modul.
 *
 * Setiap item boleh punya:
 *  - q       : pertanyaan / judul (wajib)
 *  - a       : paragraf penjelasan
 *  - list    : array poin-poin
 *  - formula : rumus yang dipakai (ditampilkan dalam blok mono)
 *  - note    : catatan kecil di bagian bawah
 *
 * Aksesibilitas: tombol memakai aria-expanded + aria-controls, panel memakai
 * role="region" sehingga screen reader membacanya sebagai bagian tersendiri.
 */
import { ref, useId } from 'vue'

const props = defineProps({
  items: { type: Array, required: true },
  title: { type: String, default: 'Pahami dulu sebelum menghitung' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '📘' },
  /** Hanya satu panel terbuka pada satu waktu. */
  single: { type: Boolean, default: true },
  /** Index item yang terbuka sejak awal, -1 untuk semua tertutup. */
  defaultOpen: { type: Number, default: -1 },
})

const baseId = useId()
const openSet = ref(new Set(props.defaultOpen >= 0 ? [props.defaultOpen] : []))

const isOpen = (i) => openSet.value.has(i)

function toggle(i) {
  const next = new Set(props.single ? [] : openSet.value)
  if (!openSet.value.has(i)) next.add(i)
  else next.delete(i)
  openSet.value = next
}

const allOpen = () => (openSet.value = new Set(props.items.map((_, i) => i)))
const allClosed = () => (openSet.value = new Set())
</script>

<template>
  <section
    class="card overflow-hidden"
    :aria-label="title"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 border-b divide-line
        bg-gradient-to-r from-brand-50 to-transparent px-5 py-4 sm:px-6
        dark:from-brand-500/10"
    >
      <div class="flex items-start gap-3">
        <span class="text-lg leading-none" aria-hidden="true">{{ icon }}</span>
        <div>
          <h2 class="text-sm font-bold text-ink-900 dark:text-white">{{ title }}</h2>
          <p v-if="subtitle" class="hint mt-0.5">{{ subtitle }}</p>
        </div>
      </div>
      <button
        v-if="!single"
        type="button"
        class="cursor-pointer text-xs font-semibold text-brand-600 hover:underline dark:text-brand-300"
        @click="openSet.size === items.length ? allClosed() : allOpen()"
      >
        {{ openSet.size === items.length ? 'Tutup semua' : 'Buka semua' }}
      </button>
    </header>

    <ul class="divide-y divide-line">
      <li v-for="(item, i) in items" :key="item.q">
        <h3>
          <button
            type="button"
            class="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-3.5 text-left
              transition hover:bg-ink-50 sm:px-6 dark:hover:bg-white/5"
            :aria-expanded="isOpen(i)"
            :aria-controls="`${baseId}-panel-${i}`"
            :id="`${baseId}-btn-${i}`"
            @click="toggle(i)"
          >
            <span
              class="text-sm font-semibold text-ink-800 transition group-hover:text-brand-700
                dark:text-ink-200 dark:group-hover:text-brand-300"
            >
              {{ item.q }}
            </span>
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-500
                transition duration-300 dark:border-white/15 dark:text-ink-400"
              :class="isOpen(i) && 'rotate-180 border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300'"
              aria-hidden="true"
            >
              <svg viewBox="0 0 20 20" fill="none" class="size-3.5">
                <path
                  d="M5 8l5 5 5-5"
                  stroke="currentColor"
                  stroke-width="2.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
        </h3>

        <div class="accordion-body" :data-open="isOpen(i)">
          <div>
            <div
              :id="`${baseId}-panel-${i}`"
              role="region"
              :aria-labelledby="`${baseId}-btn-${i}`"
              class="space-y-3 px-5 pb-4 text-sm leading-relaxed text-ink-600 sm:px-6 dark:text-ink-300"
            >
              <p v-if="item.a">{{ item.a }}</p>

              <ul v-if="item.list?.length" class="space-y-1.5">
                <li v-for="point in item.list" :key="point" class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                  <span>{{ point }}</span>
                </li>
              </ul>

              <div
                v-if="item.formula"
                class="rounded-xl border border-brand-200/70 bg-brand-50/70 px-3.5 py-3
                  font-mono text-[0.78rem] leading-relaxed text-brand-900
                  dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-200"
              >
                {{ item.formula }}
              </div>

              <p
                v-if="item.note"
                class="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800
                  dark:bg-amber-500/10 dark:text-amber-200"
              >
                💡 {{ item.note }}
              </p>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
