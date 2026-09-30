<script setup>
/**
 * Donut chart untuk komposisi (alokasi anggaran, porsi portofolio).
 * Digambar dengan stroke-dasharray pada beberapa circle — ringan, tanpa path arc manual.
 */
import { computed } from 'vue'
import { formatRupiah, formatPercent } from '@/utils/format'

const props = defineProps({
  /** [{ label, value, color }] */
  slices: { type: Array, required: true },
  size: { type: Number, default: 220 },
  thickness: { type: Number, default: 22 },
  centerLabel: { type: String, default: '' },
  centerValue: { type: String, default: '' },
  formatValue: { type: Function, default: formatRupiah },
  showLegend: { type: Boolean, default: true },
})

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const total = computed(() =>
  props.slices.reduce((sum, s) => sum + Math.max(0, Number(s.value) || 0), 0),
)

/** Hitung offset kumulatif tiap potongan agar tersambung membentuk cincin. */
const segments = computed(() => {
  let offset = 0
  return props.slices.map((s) => {
    const value = Math.max(0, Number(s.value) || 0)
    const share = total.value > 0 ? value / total.value : 0
    const length = share * CIRCUMFERENCE
    const seg = {
      ...s,
      value,
      share: share * 100,
      dasharray: `${length} ${CIRCUMFERENCE - length}`,
      dashoffset: -offset,
    }
    offset += length
    return seg
  })
})
</script>

<template>
  <div class="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
    <div class="relative shrink-0" :style="{ width: `${size}px`, height: `${size}px` }">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 200 200"
        role="img"
        aria-label="Grafik komposisi"
      >
        <!-- Mulai dari jam 12 -->
        <g transform="rotate(-90 100 100)">
          <circle
            cx="100"
            cy="100"
            :r="RADIUS"
            fill="none"
            stroke="currentColor"
            class="text-ink-200 dark:text-white/10"
            :stroke-width="thickness"
          />
          <circle
            v-for="seg in segments"
            :key="seg.label"
            cx="100"
            cy="100"
            :r="RADIUS"
            fill="none"
            :stroke="seg.color"
            :stroke-width="thickness"
            :stroke-dasharray="seg.dasharray"
            :stroke-dashoffset="seg.dashoffset"
            stroke-linecap="butt"
            style="transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease"
          />
        </g>
      </svg>

      <div v-if="centerValue || centerLabel" class="absolute inset-0 grid place-items-center text-center">
        <div class="px-8">
          <p v-if="centerLabel" class="text-[0.65rem] font-bold tracking-wide text-ink-400 uppercase">
            {{ centerLabel }}
          </p>
          <p class="tnum mt-0.5 text-base leading-tight font-extrabold text-ink-900 dark:text-white">
            {{ centerValue }}
          </p>
        </div>
      </div>
    </div>

    <ul v-if="showLegend" class="w-full min-w-0 flex-1 space-y-2.5">
      <li v-for="seg in segments" :key="seg.label" class="flex items-center gap-3">
        <span
          class="size-3 shrink-0 rounded-full"
          :style="{ backgroundColor: seg.color }"
          aria-hidden="true"
        />
        <span class="min-w-0 flex-1 truncate text-sm font-semibold text-ink-700 dark:text-ink-200">
          {{ seg.label }}
        </span>
        <span class="tnum shrink-0 text-right">
          <span class="block text-sm font-bold text-ink-900 dark:text-white">
            {{ formatValue(seg.value) }}
          </span>
          <span class="block text-[0.7rem] font-semibold text-ink-400">
            {{ formatPercent(seg.share, 1) }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
