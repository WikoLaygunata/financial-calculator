<script setup>
defineProps({
  size: { type: String, default: 'md' }, // sm | md
  showTagline: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span
      class="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
        text-white shadow-lg shadow-brand-600/25"
      :class="size === 'sm' ? 'size-8' : 'size-9'"
      aria-hidden="true"
    >
      <!-- Grafik naik di dalam lingkaran: simbol pertumbuhan -->
      <svg viewBox="0 0 24 24" fill="none" :class="size === 'sm' ? 'size-4' : 'size-5'">
        <path
          d="M4 17.5L9 11.5L13 14.5L20 6.5"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M15 6.5H20V11.5"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <div class="min-w-0">
      <p
        class="leading-none font-extrabold tracking-tight text-ink-900 dark:text-white"
        :class="size === 'sm' ? 'text-base' : 'text-lg'"
      >
        Financi
      </p>
      <p v-if="showTagline" class="mt-1 text-[0.65rem] font-semibold text-ink-400">
        Teman belajar & hitung finansial
      </p>
    </div>
  </div>
</template>
