<script setup>
/**
 * Kerangka halaman modul kalkulator.
 *
 * Tugasnya: header konsisten + accordion penjelasan + grid dua kolom
 * (kontrol di kiri, hasil di kanan) yang otomatis menumpuk di mobile.
 */
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ExplainerAccordion from './ExplainerAccordion.vue'
import { markVisited } from '@/stores/financeStore'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '🧮' },
  stage: { type: String, default: '' },
  /** Item accordion penjelasan fitur (wajib ada di setiap modul). */
  explainer: { type: Array, default: () => [] },
  explainerTitle: { type: String, default: '' },
  routeName: { type: String, default: '' },
})

onMounted(() => markVisited(props.routeName))
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 animate-fade-up">
    <!-- Header -->
    <header class="space-y-3">
      <nav class="flex items-center gap-1.5 text-xs font-semibold text-ink-400" aria-label="Breadcrumb">
        <RouterLink to="/" class="transition hover:text-brand-600 dark:hover:text-brand-300">
          Dashboard
        </RouterLink>
        <span aria-hidden="true">/</span>
        <span v-if="stage" class="text-ink-500 dark:text-ink-400">{{ stage }}</span>
      </nav>

      <div class="flex items-start gap-4">
        <span
          class="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500
            to-brand-700 text-2xl shadow-lg shadow-brand-600/20"
          aria-hidden="true"
        >
          {{ icon }}
        </span>
        <div class="min-w-0">
          <h1 class="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl dark:text-white">
            {{ title }}
          </h1>
          <p
            v-if="description"
            class="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-ink-400"
          >
            {{ description }}
          </p>
        </div>
      </div>
    </header>

    <!-- Penjelasan fitur -->
    <ExplainerAccordion
      v-if="explainer.length"
      :items="explainer"
      :title="explainerTitle || `Tentang ${title}`"
      subtitle="Klik tiap pertanyaan untuk melihat penjelasannya."
      :single="false"
    />

    <!-- Konten kalkulator -->
    <slot />
  </div>
</template>
