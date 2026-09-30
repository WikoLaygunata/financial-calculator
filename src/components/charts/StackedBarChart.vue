<script setup>
/**
 * Bar chart bertumpuk (stacked) atau berdampingan (grouped).
 *
 * Dipakai untuk memisahkan "uang yang kamu setor" vs "hasil bunga" —
 * pemisahan ini yang membuat efek compounding terasa nyata bagi pengguna.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatRupiahCompact } from '@/utils/format'

const props = defineProps({
  categories: { type: Array, required: true },
  /** [{ name, color, values: number[] }] */
  series: { type: Array, required: true },
  height: { type: Number, default: 300 },
  formatValue: { type: Function, default: (v) => formatRupiahCompact(v) },
  formatTooltipValue: { type: Function, default: null },
  grouped: { type: Boolean, default: false },
  showLegend: { type: Boolean, default: true },
  yTickCount: { type: Number, default: 4 },
  maxXLabels: { type: Number, default: 12 },
})

const wrapper = ref(null)
const width = ref(760)
const hoverIndex = ref(null)

let observer = null
onMounted(() => {
  if (!wrapper.value) return
  observer = new ResizeObserver(([entry]) => {
    width.value = Math.max(280, entry.contentRect.width)
  })
  observer.observe(wrapper.value)
  width.value = Math.max(280, wrapper.value.clientWidth)
})
onBeforeUnmount(() => observer?.disconnect())

const PAD = { top: 18, right: 14, bottom: 30, left: 60 }

const innerW = computed(() => Math.max(10, width.value - PAD.left - PAD.right))
const innerH = computed(() => Math.max(10, props.height - PAD.top - PAD.bottom))

const count = computed(() => props.categories.length)
const slotWidth = computed(() => innerW.value / Math.max(1, count.value))

/** Lebar bar disisakan sedikit gap; kalau grouped, dibagi jumlah series. */
const barWidth = computed(() => {
  const usable = slotWidth.value * 0.62
  return props.grouped ? Math.max(2, usable / props.series.length) : Math.max(2, usable)
})

const maxValue = computed(() => {
  let peak = 0
  for (let i = 0; i < count.value; i += 1) {
    if (props.grouped) {
      peak = Math.max(peak, ...props.series.map((s) => Number(s.values?.[i]) || 0))
    } else {
      peak = Math.max(
        peak,
        props.series.reduce((sum, s) => sum + (Number(s.values?.[i]) || 0), 0),
      )
    }
  }
  if (peak <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(peak)))
  const normalized = peak / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
})

const scaleH = (v) => (Math.max(0, Number(v) || 0) / maxValue.value) * innerH.value
const baseY = computed(() => PAD.top + innerH.value)
const slotCenter = (i) => PAD.left + slotWidth.value * (i + 0.5)

/** Susun rect siap render: posisi, tinggi, warna. */
const bars = computed(() => {
  const out = []
  for (let i = 0; i < count.value; i += 1) {
    let stackY = baseY.value
    props.series.forEach((s, si) => {
      const h = scaleH(s.values?.[i])
      if (h <= 0) return
      const x = props.grouped
        ? slotCenter(i) - (barWidth.value * props.series.length) / 2 + si * barWidth.value
        : slotCenter(i) - barWidth.value / 2
      const y = props.grouped ? baseY.value - h : stackY - h
      if (!props.grouped) stackY -= h
      out.push({
        key: `${i}-${si}`,
        x,
        y,
        w: barWidth.value,
        h,
        color: s.color,
        index: i,
        isTop: props.grouped || si === props.series.length - 1,
      })
    })
  }
  return out
})

const yTicks = computed(() => {
  const c = Math.max(2, props.yTickCount)
  return Array.from({ length: c + 1 }, (_, i) => {
    const value = (maxValue.value / c) * i
    return { value, y: baseY.value - scaleH(value) }
  })
})

const xTicks = computed(() => {
  if (!count.value) return []
  const stride = Math.max(1, Math.ceil(count.value / props.maxXLabels))
  return props.categories
    .map((label, i) => ({ label, i, x: slotCenter(i) }))
    .filter((t) => t.i % stride === 0 || t.i === count.value - 1)
})

function onPointerMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left - PAD.left
  const idx = Math.floor(x / slotWidth.value)
  hoverIndex.value = idx >= 0 && idx < count.value ? idx : null
}

const tooltipValue = (v) =>
  props.formatTooltipValue ? props.formatTooltipValue(v) : props.formatValue(v)

const tooltipStyle = computed(() => {
  if (hoverIndex.value === null) return {}
  const x = slotCenter(hoverIndex.value)
  return { left: `${Math.min(Math.max(x, 90), width.value - 90)}px` }
})

const hoverRows = computed(() => {
  if (hoverIndex.value === null) return []
  return props.series
    .map((s) => ({ name: s.name, color: s.color, value: Number(s.values?.[hoverIndex.value]) || 0 }))
    .reverse()
})

const hoverTotal = computed(() => hoverRows.value.reduce((sum, r) => sum + r.value, 0))
</script>

<template>
  <div class="space-y-3">
    <div v-if="showLegend" class="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      <span
        v-for="s in series"
        :key="s.name"
        class="flex items-center gap-1.5 text-xs font-semibold text-ink-600 dark:text-ink-300"
      >
        <span class="size-2.5 rounded-sm" :style="{ backgroundColor: s.color }" aria-hidden="true" />
        {{ s.name }}
      </span>
    </div>

    <div ref="wrapper" class="relative w-full">
      <svg
        :width="width"
        :height="height"
        :viewBox="`0 0 ${width} ${height}`"
        class="block touch-none"
        role="img"
        :aria-label="`Grafik batang ${series.map((s) => s.name).join(', ')}`"
        @pointermove="onPointerMove"
        @pointerleave="hoverIndex = null"
      >
        <!-- Garis bantu + label sumbu Y -->
        <line
          v-for="t in yTicks"
          :key="`gy-${t.value}`"
          :x1="PAD.left"
          :x2="width - PAD.right"
          :y1="t.y"
          :y2="t.y"
          stroke="currentColor"
          class="text-ink-200 dark:text-white/10"
          stroke-width="1"
          :stroke-dasharray="t.value === 0 ? '0' : '3 4'"
        />
        <text
          v-for="t in yTicks"
          :key="`ty-${t.value}`"
          :x="PAD.left - 10"
          :y="t.y + 4"
          text-anchor="end"
          class="fill-ink-400 text-[10px] font-semibold"
        >
          {{ formatValue(t.value) }}
        </text>

        <!-- Sorot kolom yang sedang di-hover -->
        <rect
          v-if="hoverIndex !== null"
          :x="slotCenter(hoverIndex) - slotWidth / 2"
          :y="PAD.top"
          :width="slotWidth"
          :height="innerH"
          fill="currentColor"
          class="text-ink-900/5 dark:text-white/5"
        />

        <!-- Bar -->
        <rect
          v-for="bar in bars"
          :key="bar.key"
          :x="bar.x"
          :y="bar.y"
          :width="bar.w"
          :height="bar.h"
          :rx="bar.isTop ? Math.min(4, bar.w / 2) : 0"
          :fill="bar.color"
          :opacity="hoverIndex === null || hoverIndex === bar.index ? 1 : 0.45"
          style="transition: opacity 0.15s ease"
        />

        <!-- Label sumbu X -->
        <text
          v-for="t in xTicks"
          :key="`tx-${t.i}`"
          :x="t.x"
          :y="height - 10"
          text-anchor="middle"
          class="fill-ink-400 text-[10px] font-semibold"
        >
          {{ t.label }}
        </text>
      </svg>

      <Transition
        enter-active-class="transition duration-100"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="hoverIndex !== null"
          class="pointer-events-none absolute top-2 z-20 w-max min-w-40 -translate-x-1/2 rounded-xl
            bg-ink-900/95 px-3 py-2.5 text-xs shadow-lift backdrop-blur dark:bg-ink-800/95 dark:ring-1 dark:ring-white/10"
          :style="tooltipStyle"
        >
          <p class="mb-1.5 font-bold text-white">{{ categories[hoverIndex] }}</p>
          <ul class="space-y-1">
            <li
              v-for="row in hoverRows"
              :key="row.name"
              class="flex items-center justify-between gap-4 text-ink-200"
            >
              <span class="flex items-center gap-1.5">
                <span class="size-2 rounded-sm" :style="{ backgroundColor: row.color }" aria-hidden="true" />
                {{ row.name }}
              </span>
              <span class="tnum font-bold text-white">{{ tooltipValue(row.value) }}</span>
            </li>
          </ul>
          <p
            v-if="!grouped && series.length > 1"
            class="mt-1.5 flex items-center justify-between gap-4 border-t border-white/15 pt-1.5 font-bold text-white"
          >
            <span>Total</span>
            <span class="tnum">{{ tooltipValue(hoverTotal) }}</span>
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>
