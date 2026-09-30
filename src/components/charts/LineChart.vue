<script setup>
/**
 * Line / area chart multi-series, digambar manual dengan SVG.
 *
 * Alasan tidak memakai library chart: bundle-nya besar untuk kebutuhan kita yang
 * sederhana, dan dengan SVG sendiri kita bebas menyesuaikan gaya + dark mode.
 *
 * Fitur: multi-series, mode stacked area, crosshair + tooltip mengikuti kursor,
 * lebar responsif via ResizeObserver, dan sumbu Y yang dibulatkan ke angka "cantik".
 */
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { formatRupiahCompact } from '@/utils/format'

const props = defineProps({
  /** [{ name, color, values: number[], area?: boolean, dashed?: boolean }] */
  series: { type: Array, required: true },
  labels: { type: Array, default: () => [] },
  height: { type: Number, default: 300 },
  formatValue: { type: Function, default: (v) => formatRupiahCompact(v) },
  formatTooltipValue: { type: Function, default: null },
  stacked: { type: Boolean, default: false },
  showLegend: { type: Boolean, default: true },
  yTickCount: { type: Number, default: 4 },
  /** Jumlah label sumbu X maksimum agar tidak tumpang tindih. */
  maxXLabels: { type: Number, default: 7 },
})

const uid = useId()
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

const pointCount = computed(() =>
  Math.max(...props.series.map((s) => s.values?.length ?? 0), 0),
)

const innerW = computed(() => Math.max(10, width.value - PAD.left - PAD.right))
const innerH = computed(() => Math.max(10, props.height - PAD.top - PAD.bottom))

/**
 * Untuk mode stacked, tiap series jadi kumulatif dari series sebelumnya
 * sehingga area-nya bertumpuk, bukan saling menimpa.
 */
const resolvedSeries = computed(() => {
  if (!props.stacked) return props.series.map((s) => ({ ...s, stackTop: s.values ?? [] }))

  const running = new Array(pointCount.value).fill(0)
  return props.series.map((s) => {
    const base = [...running]
    const stackTop = (s.values ?? []).map((v, i) => {
      running[i] = (running[i] ?? 0) + (Number(v) || 0)
      return running[i]
    })
    return { ...s, stackBase: base, stackTop }
  })
})

const maxValue = computed(() => {
  const all = resolvedSeries.value.flatMap((s) => s.stackTop)
  const peak = Math.max(0, ...all.filter(Number.isFinite))
  if (peak <= 0) return 1
  // Bulatkan ke atas ke angka "cantik" (1, 2, 2.5, 5 x 10^n) agar label enak dibaca.
  const magnitude = Math.pow(10, Math.floor(Math.log10(peak)))
  const normalized = peak / magnitude
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10
  return step * magnitude
})

const xFor = (i) =>
  PAD.left + (pointCount.value <= 1 ? innerW.value / 2 : (i / (pointCount.value - 1)) * innerW.value)

const yFor = (v) =>
  PAD.top + innerH.value - (Math.max(0, Number(v) || 0) / maxValue.value) * innerH.value

const toPath = (values) =>
  values
    .map((v, i) => `${i === 0 ? 'M' : 'L'}${xFor(i).toFixed(2)},${yFor(v).toFixed(2)}`)
    .join(' ')

const toAreaPath = (s) => {
  const top = s.stackTop
  if (!top.length) return ''
  const upper = toPath(top)
  if (props.stacked && s.stackBase) {
    // Turun mengikuti garis series di bawahnya, lalu tutup.
    const lower = [...s.stackBase]
      .map((v, i) => ({ v, i }))
      .reverse()
      .map(({ v, i }) => `L${xFor(i).toFixed(2)},${yFor(v).toFixed(2)}`)
      .join(' ')
    return `${upper} ${lower} Z`
  }
  const baseline = yFor(0).toFixed(2)
  return `${upper} L${xFor(top.length - 1).toFixed(2)},${baseline} L${xFor(0).toFixed(2)},${baseline} Z`
}

const yTicks = computed(() => {
  const count = Math.max(2, props.yTickCount)
  return Array.from({ length: count + 1 }, (_, i) => {
    const value = (maxValue.value / count) * i
    return { value, y: yFor(value) }
  })
})

const xTicks = computed(() => {
  const n = pointCount.value
  if (!n) return []
  const stride = Math.max(1, Math.ceil(n / props.maxXLabels))
  const ticks = []
  for (let i = 0; i < n; i += stride) {
    ticks.push({ i, x: xFor(i), label: props.labels[i] ?? String(i) })
  }
  // Selalu tampilkan titik terakhir supaya rentang waktunya jelas.
  const last = n - 1
  if (ticks[ticks.length - 1]?.i !== last) {
    if (last - ticks[ticks.length - 1].i < stride / 2) ticks.pop()
    ticks.push({ i: last, x: xFor(last), label: props.labels[last] ?? String(last) })
  }
  return ticks
})

/* ---------- Interaksi hover ---------- */

function onPointerMove(event) {
  const rect = event.currentTarget.getBoundingClientRect()
  const x = event.clientX - rect.left
  const ratio = (x - PAD.left) / innerW.value
  const idx = Math.round(ratio * Math.max(1, pointCount.value - 1))
  hoverIndex.value = Math.min(pointCount.value - 1, Math.max(0, idx))
}

const clearHover = () => (hoverIndex.value = null)

const tooltipValue = (v) =>
  props.formatTooltipValue ? props.formatTooltipValue(v) : props.formatValue(v)

const tooltipStyle = computed(() => {
  if (hoverIndex.value === null) return {}
  const x = xFor(hoverIndex.value)
  // Jaga tooltip tetap di dalam area chart.
  const clamped = Math.min(Math.max(x, 90), width.value - 90)
  return { left: `${clamped}px` }
})

const hoverRows = computed(() => {
  if (hoverIndex.value === null) return []
  return props.series
    .map((s) => ({
      name: s.name,
      color: s.color,
      value: s.values?.[hoverIndex.value] ?? 0,
    }))
    .reverse()
})

const hoverTotal = computed(() =>
  hoverRows.value.reduce((sum, r) => sum + (Number(r.value) || 0), 0),
)
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="showLegend"
      class="flex flex-wrap items-center gap-x-4 gap-y-1.5"
      role="list"
      aria-label="Keterangan grafik"
    >
      <span
        v-for="s in series"
        :key="s.name"
        class="flex items-center gap-1.5 text-xs font-semibold text-ink-600 dark:text-ink-300"
        role="listitem"
      >
        <span
          class="size-2.5 rounded-full"
          :style="{ backgroundColor: s.color }"
          aria-hidden="true"
        />
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
        :aria-label="`Grafik ${series.map((s) => s.name).join(', ')}`"
        @pointermove="onPointerMove"
        @pointerleave="clearHover"
      >
        <defs>
          <linearGradient
            v-for="(s, si) in series"
            :key="`grad-${si}`"
            :id="`${uid}-grad-${si}`"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" :stop-color="s.color" stop-opacity="0.38" />
            <stop offset="100%" :stop-color="s.color" stop-opacity="0.02" />
          </linearGradient>
        </defs>

        <!-- Garis bantu horizontal + label sumbu Y -->
        <g>
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
        </g>

        <!-- Area (digambar lebih dulu agar berada di bawah garis) -->
        <path
          v-for="(s, si) in resolvedSeries"
          v-show="stacked || s.area"
          :key="`area-${si}`"
          :d="toAreaPath(s)"
          :fill="`url(#${uid}-grad-${si})`"
          stroke="none"
        />

        <!-- Garis series -->
        <path
          v-for="(s, si) in resolvedSeries"
          :key="`line-${si}`"
          :d="toPath(s.stackTop)"
          fill="none"
          :stroke="s.color"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-dasharray="s.dashed ? '6 5' : undefined"
        />

        <!-- Crosshair + titik pada posisi hover -->
        <g v-if="hoverIndex !== null">
          <line
            :x1="xFor(hoverIndex)"
            :x2="xFor(hoverIndex)"
            :y1="PAD.top"
            :y2="height - PAD.bottom"
            stroke="currentColor"
            class="text-ink-400 dark:text-white/30"
            stroke-width="1.5"
            stroke-dasharray="4 4"
          />
          <circle
            v-for="(s, si) in resolvedSeries"
            :key="`dot-${si}`"
            :cx="xFor(hoverIndex)"
            :cy="yFor(s.stackTop[hoverIndex])"
            r="5"
            :fill="s.color"
            stroke="white"
            stroke-width="2.5"
            class="dark:stroke-ink-900"
          />
        </g>

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

      <!-- Tooltip -->
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
          <p class="mb-1.5 font-bold text-white">{{ labels[hoverIndex] ?? `Titik ${hoverIndex}` }}</p>
          <ul class="space-y-1">
            <li
              v-for="row in hoverRows"
              :key="row.name"
              class="flex items-center justify-between gap-4 text-ink-200"
            >
              <span class="flex items-center gap-1.5">
                <span
                  class="size-2 rounded-full"
                  :style="{ backgroundColor: row.color }"
                  aria-hidden="true"
                />
                {{ row.name }}
              </span>
              <span class="tnum font-bold text-white">{{ tooltipValue(row.value) }}</span>
            </li>
          </ul>
          <p
            v-if="stacked && series.length > 1"
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
