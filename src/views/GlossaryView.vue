<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { GLOSSARY, GLOSSARY_CATEGORIES } from '@/data/glossary'
import { getModule, stageLabel } from '@/data/modules'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

const mod = getModule('kamus')

const query = ref('')
const category = ref('all')

const categoryOptions = GLOSSARY_CATEGORIES.map((c) => ({
  value: c.id,
  label: c.label,
}))

const CATEGORY_LABEL = Object.fromEntries(GLOSSARY_CATEGORIES.map((c) => [c.id, c.label]))

const CATEGORY_LEVEL = {
  dasar: 'brand',
  utang: 'danger',
  investasi: 'safe',
  pensiun: 'warn',
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()

  return GLOSSARY.filter((entry) => {
    if (category.value !== 'all' && entry.category !== category.value) return false
    if (!q) return true
    // Cari di istilah, singkatan, penjelasan, dan contoh sekaligus.
    return [entry.term, entry.aka, entry.definition, entry.example]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(q))
  }).sort((a, b) => a.term.localeCompare(b.term, 'id'))
})

function resetSearch() {
  query.value = ''
  category.value = 'all'
}

/** Kelompokkan per huruf awal supaya mudah dipindai. */
const grouped = computed(() => {
  const map = new Map()
  filtered.value.forEach((entry) => {
    const letter = entry.term[0].toUpperCase()
    if (!map.has(letter)) map.set(letter, [])
    map.get(letter).push(entry)
  })
  return [...map.entries()].map(([letter, entries]) => ({ letter, entries }))
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.kamus"
    route-name="kamus"
  >
    <div class="space-y-5">
      <!-- Pencarian -->
      <AppCard title="Cari istilah" icon="🔎">
        <div class="space-y-5">
          <div class="space-y-1.5">
            <label for="glossary-search" class="label">Kata kunci</label>
            <div class="relative">
              <span
                class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              >
                <svg viewBox="0 0 20 20" fill="none" class="size-4">
                  <circle cx="9" cy="9" r="5.5" stroke="currentColor" stroke-width="2" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </span>
              <input
                id="glossary-search"
                v-model="query"
                type="search"
                class="field pl-10"
                placeholder="Mis. yield, DSR, compounding"
              />
            </div>
          </div>

          <ChipGroup v-model="category" label="Kategori" :options="categoryOptions" />

          <p class="hint">
            {{ filtered.length }} istilah ditemukan{{
              category !== 'all' ? ` di kategori ${CATEGORY_LABEL[category]}` : ''
            }}.
          </p>
        </div>
      </AppCard>

      <!-- Hasil kosong -->
      <AppCard v-if="!filtered.length">
        <div class="py-10 text-center">
          <p class="text-3xl" aria-hidden="true">🤔</p>
          <p class="mt-3 text-sm font-bold text-ink-800 dark:text-ink-100">
            Tidak ada istilah yang cocok
          </p>
          <p class="hint mx-auto mt-1 max-w-sm">
            Coba kata kunci yang lebih pendek, atau ganti kategorinya ke "Semua".
          </p>
          <button type="button" class="btn-ghost mt-4" @click="resetSearch()">
            Reset pencarian
          </button>
        </div>
      </AppCard>

      <!-- Daftar istilah -->
      <div v-for="group in grouped" :key="group.letter" class="space-y-3">
        <div class="flex items-center gap-3">
          <span
            class="grid size-8 shrink-0 place-items-center rounded-xl bg-brand-600 text-sm font-extrabold text-white"
            aria-hidden="true"
          >
            {{ group.letter }}
          </span>
          <span class="h-px flex-1 bg-ink-200 dark:bg-white/10" aria-hidden="true" />
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="entry in group.entries"
            :key="entry.term"
            class="card card-pad card-hover space-y-3"
          >
            <header class="flex flex-wrap items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 class="text-base font-bold text-ink-900 dark:text-white">{{ entry.term }}</h3>
                <p v-if="entry.aka" class="hint mt-0.5 italic">{{ entry.aka }}</p>
              </div>
              <StatusPill
                :level="CATEGORY_LEVEL[entry.category] ?? 'default'"
                :label="CATEGORY_LABEL[entry.category]"
                size="sm"
                :dot="false"
              />
            </header>

            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {{ entry.definition }}
            </p>

            <div
              class="rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600
                dark:bg-white/5 dark:text-ink-300"
            >
              <span class="font-bold text-ink-700 dark:text-ink-200">Contoh:</span>
              {{ entry.example }}
            </div>

            <RouterLink
              v-if="entry.related"
              :to="entry.related"
              class="inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition hover:gap-2
                dark:text-brand-300"
            >
              Buka kalkulatornya <span aria-hidden="true">→</span>
            </RouterLink>
          </article>
        </div>
      </div>
    </div>
  </ModuleLayout>
</template>
