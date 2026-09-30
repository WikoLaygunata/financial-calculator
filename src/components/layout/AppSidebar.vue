<script setup>
/**
 * Navigasi utama. Modul dikelompokkan per tahap supaya urutan belajarnya jelas:
 * fondasi dulu, baru target, baru strategi.
 */
import { RouterLink, useRoute } from 'vue-router'
import { MODULES, STAGES } from '@/data/modules'
import { state, scorecard } from '@/stores/financeStore'
import AppLogo from './AppLogo.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

defineEmits(['navigate'])

const route = useRoute()

const modulesOf = (stageId) => MODULES.filter((m) => m.stage === stageId)
const isVisited = (id) => state.ui.visited.includes(id)
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="px-5 py-5">
      <RouterLink to="/" class="inline-flex" @click="$emit('navigate')">
        <AppLogo show-tagline />
      </RouterLink>
    </div>

    <nav class="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Navigasi utama">
      <!-- Dashboard -->
      <RouterLink
        to="/"
        class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
        :class="
          route.name === 'dashboard'
            ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
            : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5'
        "
        @click="$emit('navigate')"
      >
        <span class="text-base" aria-hidden="true">📊</span>
        <span class="flex-1">Dashboard</span>
        <StatusPill
          v-if="state.scorecard.lastScore !== null"
          :level="route.name === 'dashboard' ? 'default' : scorecard.status.level"
          :label="String(state.scorecard.lastScore)"
          size="sm"
          :dot="false"
        />
      </RouterLink>

      <!-- Modul per tahap -->
      <div v-for="stage in STAGES" :key="stage.id" class="space-y-1">
        <p class="section-title px-3 pb-1.5">{{ stage.label }}</p>
        <RouterLink
          v-for="m in modulesOf(stage.id)"
          :key="m.id"
          :to="m.path"
          class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          :class="
            route.name === m.id
              ? 'bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-500/20 dark:bg-brand-500/15 dark:text-brand-200'
              : 'text-ink-600 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-white/5'
          "
          @click="$emit('navigate')"
        >
          <span class="text-base" aria-hidden="true">{{ m.icon }}</span>
          <span class="flex-1 truncate">{{ m.short }}</span>
          <span
            v-if="isVisited(m.id) && route.name !== m.id"
            class="size-1.5 shrink-0 rounded-full bg-emerald-400"
            title="Sudah kamu buka"
            aria-label="Sudah kamu buka"
          />
        </RouterLink>
      </div>
    </nav>

    <div class="border-t divide-line px-5 py-4">
      <p class="hint leading-relaxed">
        🔒 Semua hitungan berjalan di browsermu. Tidak ada data yang dikirim ke server.
      </p>
    </div>
  </div>
</template>
