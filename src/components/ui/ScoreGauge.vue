<script setup>
/**
 * Gauge skor 0–100 berbentuk busur 270°, digambar murni dengan SVG.
 * Warnanya mengikuti level skor supaya kondisi langsung terbaca sekilas.
 */
import { computed, useId } from 'vue'

const props = defineProps({
  score: { type: Number, required: true },
  level: { type: String, default: 'brand' }, // safe | warn | danger | brand
  label: { type: String, default: '' },
  caption: { type: String, default: '' },
  size: { type: Number, default: 200 },
})

const gradId = useId()

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const ARC_FRACTION = 0.75 // 270 dari 360 derajat
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION

const clamped = computed(() => Math.min(100, Math.max(0, props.score || 0)))

const progressDash = computed(
  () => `${(clamped.value / 100) * ARC_LENGTH} ${CIRCUMFERENCE}`,
)

const COLORS = {
  safe: ['#34d399', '#059669'],
  warn: ['#fbbf24', '#d97706'],
  danger: ['#fb7185', '#e11d48'],
  brand: ['#818cf8', '#4f46e5'],
}

const colors = computed(() => COLORS[props.level] ?? COLORS.brand)

const TEXT = {
  safe: 'text-emerald-600 dark:text-emerald-400',
  warn: 'text-amber-600 dark:text-amber-400',
  danger: 'text-rose-600 dark:text-rose-400',
  brand: 'text-brand-600 dark:text-brand-400',
}
</script>

<template>
  <div class="relative inline-grid place-items-center" :style="{ width: `${size}px` }">
    <svg
      :width="size"
      :height="size"
      viewBox="0 0 200 200"
      role="img"
      :aria-label="`Skor ${Math.round(clamped)} dari 100${label ? `, ${label}` : ''}`"
    >
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" :stop-color="colors[0]" />
          <stop offset="100%" :stop-color="colors[1]" />
        </linearGradient>
      </defs>

      <g transform="rotate(135 100 100)">
        <!-- Track -->
        <circle
          cx="100"
          cy="100"
          :r="RADIUS"
          fill="none"
          stroke="currentColor"
          class="text-ink-200 dark:text-white/10"
          stroke-width="16"
          :stroke-dasharray="`${ARC_LENGTH} ${CIRCUMFERENCE}`"
          stroke-linecap="round"
        />
        <!-- Progress -->
        <circle
          cx="100"
          cy="100"
          :r="RADIUS"
          fill="none"
          :stroke="`url(#${gradId})`"
          stroke-width="16"
          :stroke-dasharray="progressDash"
          stroke-linecap="round"
          style="transition: stroke-dasharray 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
        />
      </g>
    </svg>

    <div class="absolute inset-0 grid place-items-center text-center">
      <div>
        <p class="tnum text-4xl leading-none font-extrabold" :class="TEXT[level]">
          {{ Math.round(clamped) }}
        </p>
        <p class="mt-1 text-[0.7rem] font-semibold tracking-wide text-ink-400 uppercase">
          / 100
        </p>
        <p v-if="label" class="mt-1.5 text-xs font-bold text-ink-700 dark:text-ink-200">
          {{ label }}
        </p>
      </div>
    </div>

    <p v-if="caption" class="hint mt-2 text-center">{{ caption }}</p>
  </div>
</template>
