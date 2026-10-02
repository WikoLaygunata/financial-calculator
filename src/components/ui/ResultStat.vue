<script setup>
/**
 * Kartu angka hasil. `tone` mengatur warna supaya status langsung terbaca
 * tanpa harus membaca teksnya.
 */
import InfoTip from './InfoTip.vue'

defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  caption: { type: String, default: '' },
  tone: { type: String, default: 'default' }, // default | brand | safe | warn | danger
  size: { type: String, default: 'md' }, // sm | md | lg
  tooltip: { type: String, default: '' },
  icon: { type: String, default: '' },
})

const TONES = {
  default:
    'border-ink-200 bg-ink-50/70 text-ink-900 dark:border-white/10 dark:bg-white/5 dark:text-white',
  brand:
    'border-brand-200 bg-brand-50 text-brand-900 dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-100',
  safe: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-100',
  warn: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100',
  danger:
    'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-100',
}

const SIZES = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-3xl sm:text-4xl',
}

const LABEL_TONES = {
  default: 'text-ink-500 dark:text-ink-400',
  brand: 'text-brand-600 dark:text-brand-300',
  safe: 'text-emerald-600 dark:text-emerald-300',
  warn: 'text-amber-600 dark:text-amber-300',
  danger: 'text-rose-600 dark:text-rose-300',
}
</script>

<template>
  <div class="rounded-xl border p-4" :class="TONES[tone]">
    <p class="flex items-center gap-1.5 text-xs font-semibold" :class="LABEL_TONES[tone]">
      <span v-if="icon" aria-hidden="true">{{ icon }}</span>
      {{ label }}
      <InfoTip v-if="tooltip" :text="tooltip" />
    </p>
    <p class="tnum mt-1.5 leading-tight font-extrabold break-words" :class="SIZES[size]">
      {{ value }}
    </p>
    <p v-if="caption" class="mt-1.5 text-xs leading-relaxed opacity-75">{{ caption }}</p>
    <slot />
  </div>
</template>
