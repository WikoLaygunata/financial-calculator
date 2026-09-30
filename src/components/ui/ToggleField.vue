<script setup>
/**
 * Switch on/off dengan label & deskripsi.
 */
import { useId } from 'vue'
import InfoTip from './InfoTip.vue'

defineProps({
  modelValue: { type: Boolean, required: true },
  label: { type: String, required: true },
  description: { type: String, default: '' },
  tooltip: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const id = useId()
</script>

<template>
  <div
    class="flex items-start justify-between gap-4 rounded-xl border border-ink-200 bg-ink-50/60 p-3.5
      dark:border-white/10 dark:bg-white/5"
  >
    <div class="min-w-0">
      <label :for="id" class="label flex cursor-pointer items-center gap-1.5">
        {{ label }}
        <InfoTip v-if="tooltip" :text="tooltip" />
      </label>
      <p v-if="description" class="hint mt-1">{{ description }}</p>
    </div>

    <button
      :id="id"
      type="button"
      role="switch"
      :aria-checked="modelValue"
      class="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer rounded-full transition duration-200"
      :class="modelValue ? 'bg-brand-600' : 'bg-ink-300 dark:bg-white/20'"
      @click="emit('update:modelValue', !modelValue)"
    >
      <span
        class="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition duration-200"
        :class="modelValue && 'translate-x-5'"
      />
    </button>
  </div>
</template>
