<script setup>
/**
 * Input rupiah dengan pemisah ribuan otomatis.
 * Dipakai hanya di tempat yang slider-nya tidak praktis
 * (mis. daftar utang yang jumlahnya dinamis).
 */
import { computed, ref, useId, watch } from 'vue'
import { formatNumber, parseNumeric } from '@/utils/format'

const props = defineProps({
  modelValue: { type: Number, required: true },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '0' },
  suffix: { type: String, default: '' },
  prefix: { type: String, default: 'Rp' },
  max: { type: Number, default: 1e15 },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const id = useId()
const focused = ref(false)
const display = ref(formatNumber(props.modelValue))

// Sinkronkan tampilan saat nilai berubah dari luar (mis. dimuat dari localStorage),
// tapi jangan ganggu saat pengguna sedang mengetik.
watch(
  () => props.modelValue,
  (v) => {
    if (!focused.value) display.value = formatNumber(v)
  },
)

const onInput = (event) => {
  const parsed = Math.min(parseNumeric(event.target.value), props.max)
  display.value = formatNumber(parsed)
  emit('update:modelValue', parsed)
}

const onBlur = () => {
  focused.value = false
  // Rapikan kembali tampilan setelah pengguna selesai mengetik.
  display.value = formatNumber(props.modelValue)
}

const paddingClass = computed(() => (props.prefix ? 'pl-9' : 'pl-3.5'))
</script>

<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="label">{{ label }}</label>
    <div class="relative">
      <span
        v-if="prefix"
        class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-semibold text-ink-400"
        aria-hidden="true"
      >
        {{ prefix }}
      </span>
      <input
        :id="id"
        type="text"
        inputmode="numeric"
        class="field tnum"
        :class="[paddingClass, compact && 'py-2 text-sm', suffix && 'pr-10']"
        :placeholder="placeholder"
        :value="display"
        @input="onInput"
        @focus="focused = true"
        @blur="onBlur"
      />
      <span
        v-if="suffix"
        class="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-semibold text-ink-400"
      >
        {{ suffix }}
      </span>
    </div>
  </div>
</template>
