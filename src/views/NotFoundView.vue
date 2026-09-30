<script setup>
import { RouterLink } from 'vue-router'
import { MODULES } from '@/data/modules'

// Tawarkan beberapa modul populer supaya pengguna tidak berhenti di jalan buntu.
const suggestions = MODULES.filter((m) =>
  ['dana-darurat', 'kesehatan-cicilan', 'dca', 'kamus'].includes(m.id),
)
</script>

<template>
  <div class="mx-auto max-w-2xl py-12 text-center animate-fade-up">
    <p class="text-5xl" aria-hidden="true">🧭</p>
    <h1 class="mt-5 text-2xl font-extrabold tracking-tight text-ink-900 dark:text-white">
      Halaman ini tidak ada
    </h1>
    <p class="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-500 dark:text-ink-400">
      Mungkin tautannya salah, atau halaman ini sudah dipindahkan. Datamu aman — semuanya tetap
      tersimpan di browsermu.
    </p>

    <RouterLink to="/" class="btn-primary mt-6">← Kembali ke Dashboard</RouterLink>

    <div class="mt-10 space-y-3 text-left">
      <p class="section-title text-center">Atau coba salah satu ini</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="m in suggestions"
          :key="m.id"
          :to="m.path"
          class="card card-hover flex items-center gap-3 p-4"
        >
          <span class="text-xl" aria-hidden="true">{{ m.icon }}</span>
          <span class="min-w-0">
            <span class="block truncate text-sm font-bold text-ink-900 dark:text-white">
              {{ m.short }}
            </span>
            <span class="hint line-clamp-1">{{ m.tagline }}</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
