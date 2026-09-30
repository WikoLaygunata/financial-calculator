<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true }, // 0-100
  tone: { type: String, default: 'brand' }, // brand | safe | warn | danger | auto
  height: { type: String, default: 'md' }, // sm | md | lg
  label: { type: String, default: '' },
  valueLabel: { type: String, default: '' },
  /** Tandai posisi tertentu, mis. batas aman 30% */
  marker: { type: Number, default: null },
  markerLabel: { type: String, default: '' },
})

const pct = computed(() => Math.min(100, Math.max(0, props.value)))

/** Mode `auto`: warna mengikuti tingkat pencapaian. */
const resolvedTone = computed(() => {
  if (props.tone !== 'auto') return props.tone
  if (pct.value >= 100) return 'safe'
  if (pct.value >= 50) return 'warn'
  return 'danger'
})

const FILL = {
  brand: 'bg-gradient-to-r from-brand-500 to-brand-600',
  safe: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
  warn: 'bg-gradient-to-r from-amber-400 to-amber-500',
  danger: 'bg-gradient-to-r from-rose-400 to-rose-600',
}

const HEIGHT = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
</script>

<template>
  <div class="space-y-1.5">
    <div v-if="label || valueLabel" class="flex items-baseline justify-between gap-3">
      <span class="text-xs font-semibold text-ink-600 dark:text-ink-300">{{ label }}</span>
      <span class="tnum text-xs font-bold text-ink-900 dark:text-white">{{ valueLabel }}</span>
    </div>

    <div
      class="relative w-full overflow-hidden rounded-full bg-ink-200 dark:bg-white/10"
      :class="HEIGHT[height]"
      role="progressbar"
      :aria-valuenow="Math.round(pct)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="label || 'Progress'"
    >
      <div
        class="h-full rounded-full transition-[width] duration-500 ease-out"
        :class="FILL[resolvedTone]"
        :style="{ width: `${pct}%` }"
      />
      <div
        v-if="marker !== null"
        class="absolute top-0 h-full w-0.5 bg-ink-900/50 dark:bg-white/60"
        :style="{ left: `${Math.min(100, Math.max(0, marker))}%` }"
        :title="markerLabel"
        aria-hidden="true"
      />
    </div>

    <p v-if="markerLabel" class="hint">{{ markerLabel }}</p>
  </div>
</template>
