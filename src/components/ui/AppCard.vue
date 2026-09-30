<script setup>
/**
 * Kartu serbaguna. Header opsional (judul + ikon + aksi di kanan).
 */
defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  tone: {
    type: String,
    default: 'default', // default | brand | safe | warn | danger
  },
  padded: { type: Boolean, default: true },
  hover: { type: Boolean, default: false },
})

const toneRing = {
  default: '',
  brand: 'ring-1 ring-brand-500/25',
  safe: 'ring-1 ring-emerald-500/30',
  warn: 'ring-1 ring-amber-500/30',
  danger: 'ring-1 ring-rose-500/30',
}

const toneIcon = {
  default: 'bg-ink-100 text-ink-600 dark:bg-white/10 dark:text-ink-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  safe: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  warn: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
}
</script>

<template>
  <section class="card" :class="[toneRing[tone], hover && 'card-hover']">
    <header
      v-if="title || $slots.header || $slots.actions"
      class="flex items-start justify-between gap-3 border-b divide-line px-5 py-4 sm:px-6"
    >
      <div class="flex min-w-0 items-start gap-3">
        <span
          v-if="icon"
          class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl text-base"
          :class="toneIcon[tone]"
          aria-hidden="true"
        >
          {{ icon }}
        </span>
        <div class="min-w-0">
          <slot name="header">
            <h2 class="truncate text-base font-bold text-ink-900 dark:text-white">
              {{ title }}
            </h2>
            <p v-if="subtitle" class="mt-0.5 text-xs leading-relaxed text-ink-500 dark:text-ink-400">
              {{ subtitle }}
            </p>
          </slot>
        </div>
      </div>
      <div v-if="$slots.actions" class="shrink-0">
        <slot name="actions" />
      </div>
    </header>

    <div :class="padded ? 'card-pad' : ''">
      <slot />
    </div>

    <footer v-if="$slots.footer" class="border-t divide-line px-5 py-4 sm:px-6">
      <slot name="footer" />
    </footer>
  </section>
</template>
