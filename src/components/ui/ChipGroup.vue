<script setup>
/**
 * Segmented chips untuk pilihan tunggal. Menggantikan dropdown/select
 * supaya semua opsi kelihatan tanpa perlu diklik dulu.
 */
import { computed, useId } from 'vue'
import InfoTip from './InfoTip.vue'

const props = defineProps({
  modelValue: { type: [String, Number, Boolean], default: '' },
  /** [{ value, label, note?, icon? }] */
  options: { type: Array, required: true },
  label: { type: String, default: '' },
  tooltip: { type: String, default: '' },
  columns: { type: Number, default: 0 }, // 0 = otomatis (flex-wrap)
})

const emit = defineEmits(['update:modelValue'])
const groupId = useId()

const gridClass = computed(() => {
  if (!props.columns) return 'flex flex-wrap gap-2'
  const map = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }
  return `grid gap-2 ${map[props.columns] ?? 'grid-cols-2'}`
})

const activeNote = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.note ?? '',
)
</script>

<template>
  <div class="space-y-2" role="radiogroup" :aria-labelledby="label ? groupId : undefined">
    <p v-if="label" :id="groupId" class="label flex items-center gap-1.5">
      {{ label }}
      <InfoTip v-if="tooltip" :text="tooltip" />
    </p>

    <div :class="gridClass">
      <button
        v-for="opt in options"
        :key="String(opt.value)"
        type="button"
        role="radio"
        :aria-checked="modelValue === opt.value"
        class="chip flex-1 whitespace-nowrap"
        :class="modelValue === opt.value && 'chip-active'"
        @click="emit('update:modelValue', opt.value)"
      >
        <span v-if="opt.icon" class="mr-1" aria-hidden="true">{{ opt.icon }}</span>
        {{ opt.label }}
      </button>
    </div>

    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="hidden"
    >
      <p v-if="activeNote" :key="activeNote" class="hint">{{ activeNote }}</p>
    </Transition>
  </div>
</template>
