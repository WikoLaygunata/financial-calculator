<script setup>
/**
 * Badge status dengan indikator titik warna.
 * Warna + teks selalu berpasangan supaya tetap terbaca bagi pengguna buta warna.
 */
defineProps({
  level: { type: String, default: 'default' }, // safe | warn | danger | brand | default
  label: { type: String, required: true },
  size: { type: String, default: 'md' }, // sm | md
  dot: { type: Boolean, default: true },
})

const STYLES = {
  safe: 'bg-emerald-100 text-emerald-800 ring-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-800 ring-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-800 ring-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300',
  brand: 'bg-brand-100 text-brand-800 ring-brand-500/20 dark:bg-brand-500/15 dark:text-brand-300',
  default: 'bg-ink-100 text-ink-700 ring-ink-500/15 dark:bg-white/10 dark:text-ink-300',
}

const DOTS = {
  safe: 'bg-emerald-500',
  warn: 'bg-amber-500',
  danger: 'bg-rose-500',
  brand: 'bg-brand-500',
  default: 'bg-ink-400',
}
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-bold ring-1 ring-inset"
    :class="[STYLES[level], size === 'sm' ? 'px-2 py-0.5 text-[0.65rem]' : 'px-2.5 py-1 text-xs']"
  >
    <span
      v-if="dot"
      class="size-1.5 rounded-full"
      :class="DOTS[level]"
      aria-hidden="true"
    />
    {{ label }}
  </span>
</template>
