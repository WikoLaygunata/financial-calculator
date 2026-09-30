<script setup>
/**
 * Tooltip penjelas untuk istilah finansial yang sulit.
 * Bisa dibuka lewat hover maupun klik/keyboard (penting untuk layar sentuh).
 */
import { ref, useId } from 'vue'

defineProps({
  text: { type: String, required: true },
  label: { type: String, default: 'Apa ini?' },
})

const open = ref(false)
const tipId = useId()
</script>

<template>
  <span class="relative inline-flex align-middle">
    <button
      type="button"
      class="grid size-[1.15rem] cursor-pointer place-items-center rounded-full border border-ink-300
        text-[0.65rem] font-bold text-ink-500 transition
        hover:border-brand-400 hover:bg-brand-50 hover:text-brand-600
        dark:border-white/20 dark:text-ink-400 dark:hover:bg-white/10 dark:hover:text-brand-300"
      :aria-label="label"
      :aria-expanded="open"
      :aria-describedby="open ? tipId : undefined"
      @click.stop="open = !open"
      @mouseenter="open = true"
      @mouseleave="open = false"
      @focus="open = true"
      @blur="open = false"
    >
      ?
    </button>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition duration-100 ease-in"
      leave-to-class="opacity-0"
    >
      <span
        v-if="open"
        :id="tipId"
        role="tooltip"
        class="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 rounded-xl
          bg-ink-900 px-3 py-2.5 text-xs leading-relaxed font-normal text-ink-100 shadow-lift
          dark:bg-ink-800 dark:ring-1 dark:ring-white/10"
      >
        {{ text }}
        <span
          class="absolute top-full left-1/2 -mt-1 size-2 -translate-x-1/2 rotate-45 bg-ink-900 dark:bg-ink-800"
          aria-hidden="true"
        />
      </span>
    </Transition>
  </span>
</template>
