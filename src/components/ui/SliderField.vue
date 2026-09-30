<script setup>
/**
 * Slider dengan live-update value, track terisi, dan tombol preset opsional.
 * Ini kontrol utama aplikasi — sengaja dibuat minim input teks.
 */
import { computed, useId } from 'vue'
import InfoTip from './InfoTip.vue'

const props = defineProps({
  modelValue: { type: Number, required: true },
  label: { type: String, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  /** Fungsi format untuk menampilkan nilai, mis. formatRupiah */
  format: { type: Function, default: (v) => String(v) },
  hint: { type: String, default: '' },
  tooltip: { type: String, default: '' },
  /** Tombol cepat: [{ label, value }] atau angka biasa */
  presets: { type: Array, default: () => [] },
  accent: { type: String, default: 'brand' }, // brand | emerald | amber | rose | sky
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const id = useId()

const ACCENTS = {
  brand: '#4f46e5',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  sky: '#0284c7',
}

const accentColor = computed(() => ACCENTS[props.accent] ?? ACCENTS.brand)

const percent = computed(() => {
  const span = props.max - props.min
  if (span <= 0) return 0
  return ((props.modelValue - props.min) / span) * 100
})

/** Gradient dua warna: bagian terisi memakai warna aksen, sisanya netral. */
const trackStyle = computed(() => ({
  '--slider-track': `linear-gradient(to right, ${accentColor.value} 0%, ${accentColor.value} ${percent.value}%, transparent ${percent.value}%, transparent 100%)`,
  '--slider-thumb': accentColor.value,
}))

const normalizedPresets = computed(() =>
  props.presets.map((p) =>
    typeof p === 'object' ? p : { label: props.format(p), value: p },
  ),
)

const onInput = (event) => emit('update:modelValue', Number(event.target.value))
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-end justify-between gap-3">
      <label :for="id" class="label flex items-center gap-1.5">
        {{ label }}
        <InfoTip v-if="tooltip" :text="tooltip" />
      </label>
      <output
        :for="id"
        class="tnum shrink-0 text-base font-extrabold text-ink-900 tabular-nums dark:text-white"
      >
        {{ format(modelValue) }}
      </output>
    </div>

    <!-- Lapisan track netral di belakang, gradient aksen di depan -->
    <div class="relative flex items-center">
      <div
        class="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-ink-200 dark:bg-white/10"
        aria-hidden="true"
      />
      <input
        :id="id"
        type="range"
        class="slider relative z-10"
        :style="trackStyle"
        :min="min"
        :max="max"
        :step="step"
        :value="modelValue"
        :disabled="disabled"
        :aria-valuetext="format(modelValue)"
        @input="onInput"
      />
    </div>

    <div class="flex items-center justify-between gap-2">
      <span class="hint tnum">{{ format(min) }}</span>
      <p v-if="hint" class="hint text-center">{{ hint }}</p>
      <span class="hint tnum">{{ format(max) }}</span>
    </div>

    <div v-if="normalizedPresets.length" class="flex flex-wrap gap-1.5 pt-0.5">
      <button
        v-for="p in normalizedPresets"
        :key="p.value"
        type="button"
        class="cursor-pointer rounded-lg border px-2 py-1 text-[0.7rem] font-semibold transition"
        :class="
          modelValue === p.value
            ? 'border-brand-500 bg-brand-600 text-white'
            : 'border-ink-200 bg-white text-ink-500 hover:border-brand-300 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-ink-400 dark:hover:text-brand-300'
        "
        @click="emit('update:modelValue', p.value)"
      >
        {{ p.label }}
      </button>
    </div>
  </div>
</template>
