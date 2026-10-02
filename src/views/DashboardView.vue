<script setup>
/**
 * Dashboard — pintu masuk aplikasi.
 *
 * Tiga lapis informasi:
 * 1. Skor kesehatan finansial (checklist 7 pertanyaan berbobot).
 * 2. Metrik kunci yang otomatis dihitung dari Profil Keuangan.
 * 3. Peta modul per tahap, supaya urutan belajarnya jelas.
 */
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { MODULES, STAGES } from '@/data/modules'
import { EXPLAINERS } from '@/data/explainers'
import { derived, resetScorecard, scorecard, setAnswer, state } from '@/stores/financeStore'
import {
  formatDecimal,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from '@/utils/format'
import { DSR_SAFE_LIMIT } from '@/utils/finance'
import AppCard from '@/components/ui/AppCard.vue'
import ExplainerAccordion from '@/components/ui/ExplainerAccordion.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ScoreGauge from '@/components/ui/ScoreGauge.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

const progressPct = computed(
  () => (scorecard.value.answeredCount / scorecard.value.totalCount) * 100,
)

/** Tiga hal paling berdampak yang belum beres — ini yang ditawarkan sebagai langkah berikutnya. */
const topPriorities = computed(() => scorecard.value.priorities.slice(0, 3))

const modulesOf = (stageId) => MODULES.filter((m) => m.stage === stageId)

const dsrTone = computed(() => derived.value.dsr.level)

const emergencyMonths = computed(() => derived.value.emergency.monthsCovered)

const savingsTone = computed(() => {
  const pct = derived.value.savings.pct
  if (pct >= 20) return 'safe'
  if (pct >= 10) return 'warn'
  return 'danger'
})

const isVisited = (id) => state.ui.visited.includes(id)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-8 animate-fade-up">
    <!-- Hero -->
    <header class="space-y-2">
      <p class="section-title">Dashboard</p>
      <h1 class="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
        Kesehatan finansial kamu, dalam satu halaman
      </h1>
      <p class="max-w-2xl text-sm leading-relaxed text-ink-500 dark:text-ink-400">
        Jawab tujuh pertanyaan untuk melihat skormu, lalu pakai kalkulator di tahap yang paling kamu
        butuhkan. Semua angka dihitung langsung di browsermu.
      </p>
    </header>

    <!-- Scorecard -->
    <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <AppCard title="Checklist Kesehatan Finansial" icon="🩺" tone="brand">
        <template #actions>
          <button
            v-if="scorecard.answeredCount > 0"
            type="button"
            class="cursor-pointer text-xs font-semibold text-ink-500 transition hover:text-rose-600 dark:hover:text-rose-400"
            @click="resetScorecard()"
          >
            Reset
          </button>
        </template>

        <div class="space-y-4">
          <ProgressBar
            :value="progressPct"
            tone="brand"
            height="sm"
            label="Pertanyaan terjawab"
            :value-label="`${scorecard.answeredCount} / ${scorecard.totalCount}`"
          />

          <ul class="divide-y divide-line">
            <li
              v-for="item in scorecard.details"
              :key="item.id"
              class="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <div class="min-w-0 flex-1">
                <p class="flex items-start gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100">
                  <span
                    class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md text-[0.6rem] font-bold"
                    :class="
                      item.answer === true
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : item.answer === false
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          : 'bg-ink-100 text-ink-400 dark:bg-white/10'
                    "
                    aria-hidden="true"
                  >
                    {{ item.answer === true ? '✓' : item.answer === false ? '✕' : '?' }}
                  </span>
                  <span>{{ item.question }}</span>
                </p>
                <p class="hint mt-1 pl-7">{{ item.why }}</p>
                <RouterLink
                  v-if="item.answer === false"
                  :to="item.fixRoute"
                  class="mt-2 ml-7 inline-flex items-center gap-1 text-xs font-bold text-brand-600
                    transition hover:gap-2 dark:text-brand-300"
                >
                  {{ item.fixLabel }}
                  <span aria-hidden="true">→</span>
                </RouterLink>
              </div>

              <div class="flex shrink-0 gap-2 pl-7 sm:pl-0">
                <button
                  type="button"
                  class="chip !px-3 !py-1.5 !text-xs"
                  :class="
                    item.answer === true &&
                    '!border-emerald-500 !bg-emerald-600 !text-white hover:!bg-emerald-600'
                  "
                  :aria-pressed="item.answer === true"
                  @click="setAnswer(item.id, true)"
                >
                  Sudah
                </button>
                <button
                  type="button"
                  class="chip !px-3 !py-1.5 !text-xs"
                  :class="
                    item.answer === false &&
                    '!border-rose-500 !bg-rose-600 !text-white hover:!bg-rose-600'
                  "
                  :aria-pressed="item.answer === false"
                  @click="setAnswer(item.id, false)"
                >
                  Belum
                </button>
              </div>
            </li>
          </ul>
        </div>
      </AppCard>

      <!-- Hasil skor -->
      <AppCard :tone="scorecard.status.level" padded>
        <div class="flex flex-col items-center gap-4 text-center">
          <ScoreGauge
            :score="scorecard.score"
            :level="scorecard.status.level"
            :size="200"
          />
          <StatusPill :level="scorecard.status.level" :label="scorecard.status.label" />

          <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {{
              scorecard.answeredCount === 0
                ? 'Jawab checklist di samping untuk melihat skor kesehatan finansialmu.'
                : scorecard.status.message
            }}
          </p>

          <div v-if="topPriorities.length && scorecard.answeredCount > 0" class="w-full space-y-2 text-left">
            <p class="section-title">Prioritas perbaikan</p>
            <RouterLink
              v-for="p in topPriorities"
              :key="p.id"
              :to="p.fixRoute"
              class="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5
                transition hover:border-brand-300 hover:bg-brand-50
                dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span class="min-w-0">
                <span class="block truncate text-xs font-bold text-ink-800 dark:text-ink-100">
                  {{ p.fixLabel }}
                </span>
                <span class="hint">Bernilai {{ p.weight }} poin</span>
              </span>
              <span class="shrink-0 text-brand-500" aria-hidden="true">→</span>
            </RouterLink>
          </div>

          <p v-else-if="scorecard.answeredCount > 0" class="hint">
            🎉 Semua poin sudah terpenuhi. Lanjut ke Tahap 3 untuk mengoptimalkan strategi investasi.
          </p>
        </div>
      </AppCard>
    </div>

    <!-- Metrik kunci -->
    <section class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <h2 class="text-base font-bold text-ink-900 dark:text-white">Angka kunci kamu</h2>
        <p class="hint">Dihitung dari Profil Keuangan — ubah lewat tombol Profil di atas.</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ResultStat
          label="Uang bebas per bulan"
          icon="💰"
          :value="formatRupiah(derived.surplus)"
          :tone="derived.surplus > 0 ? 'safe' : 'danger'"
          :caption="
            derived.surplus > 0
              ? 'Sisa setelah kebutuhan, keinginan, dan cicilan. Ini bahan bakar investasimu.'
              : 'Pengeluaranmu melebihi penghasilan. Ini perlu dibenahi lebih dulu.'
          "
          tooltip="Penghasilan bersih dikurangi kebutuhan, pengeluaran keinginan, dan total cicilan bulanan."
        />

        <ResultStat
          label="Rasio cicilan (DSR)"
          icon="⚖️"
          :value="formatPercent(derived.dsr.ratio)"
          :tone="dsrTone"
          :caption="
            dsrTone === 'safe'
              ? `Masih aman. Batasnya ${DSR_SAFE_LIMIT}% dari penghasilan.`
              : dsrTone === 'warn'
                ? 'Sudah di zona waspada. Hindari cicilan baru.'
                : 'Zona berisiko. Prioritaskan pelunasan utang.'
          "
          tooltip="Persentase penghasilan yang habis untuk cicilan. Batas aman umum adalah 30%."
        />

        <ResultStat
          label="Dana darurat"
          icon="🛟"
          :value="formatPercent(derived.emergency.progressPct)"
          :tone="derived.emergency.statusLevel"
          :caption="`Menutupi ${formatDecimal(emergencyMonths, 1)} bulan pengeluaran, dari target ${derived.emergency.multiplier}x.`"
          tooltip="Perbandingan dana darurat yang sudah terkumpul dengan target idealmu."
        >
          <ProgressBar
            :value="derived.emergency.progressPct"
            tone="auto"
            height="sm"
            class="mt-3"
          />
        </ResultStat>

        <ResultStat
          label="Rasio menabung"
          icon="🌱"
          :value="formatPercent(derived.savings.pct)"
          :tone="savingsTone"
          :caption="
            savingsTone === 'safe'
              ? 'Bagus. Di atas 20% termasuk sehat.'
              : savingsTone === 'warn'
                ? 'Cukup, tapi masih bisa ditingkatkan ke 20%.'
                : 'Di bawah 10%. Coba tinjau ulang anggaranmu.'
          "
          tooltip="Bagian penghasilan yang berhasil kamu sisihkan setiap bulan."
        />
      </div>
    </section>

    <!-- Aset ringkas -->
    <AppCard title="Ringkasan aset" icon="🏦" subtitle="Total dana darurat dan investasi yang kamu catat di profil.">
      <div class="grid gap-4 sm:grid-cols-3">
        <div>
          <p class="hint">Dana darurat</p>
          <p class="tnum mt-1 text-xl font-extrabold text-ink-900 dark:text-white">
            {{ formatRupiahCompact(state.userProfile.emergencyFundSaved) }}
          </p>
        </div>
        <div>
          <p class="hint">Nilai investasi</p>
          <p class="tnum mt-1 text-xl font-extrabold text-ink-900 dark:text-white">
            {{ formatRupiahCompact(state.userProfile.investedAssets) }}
          </p>
        </div>
        <div class="sm:border-l divide-line sm:pl-4">
          <p class="hint">Total tercatat</p>
          <p class="tnum mt-1 text-xl font-extrabold text-brand-600 dark:text-brand-300">
            {{ formatRupiahCompact(derived.netWorthish) }}
          </p>
        </div>
      </div>
    </AppCard>

    <!-- Peta modul -->
    <section v-for="stage in STAGES" :key="stage.id" class="space-y-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-base" aria-hidden="true">{{ stage.icon }}</span>
          <h2 class="text-base font-bold text-ink-900 dark:text-white">{{ stage.label }}</h2>
        </div>
        <p class="hint mt-1 max-w-2xl">{{ stage.description }}</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="m in modulesOf(stage.id)"
          :key="m.id"
          :to="m.path"
          class="card card-hover group flex flex-col gap-2 p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <span
              class="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-100 text-xl
                transition group-hover:bg-brand-100 dark:bg-white/10 dark:group-hover:bg-brand-500/20"
              aria-hidden="true"
            >
              {{ m.icon }}
            </span>
            <StatusPill v-if="isVisited(m.id)" level="safe" label="Dibuka" size="sm" />
          </div>

          <h3
            class="mt-1 text-sm font-bold text-ink-900 transition group-hover:text-brand-700
              dark:text-white dark:group-hover:text-brand-300"
          >
            {{ m.title }}
          </h3>
          <p class="hint flex-1">{{ m.tagline }}</p>
          <span
            class="mt-1 inline-flex items-center gap-1 text-xs font-bold text-brand-600 transition group-hover:gap-2 dark:text-brand-300"
          >
            Buka kalkulator <span aria-hidden="true">→</span>
          </span>
        </RouterLink>
      </div>
    </section>

    <!-- Penjelasan -->
    <ExplainerAccordion
      :items="EXPLAINERS.dashboard"
      title="Tentang dashboard & skor ini"
      subtitle="Klik tiap pertanyaan untuk melihat penjelasannya."
      :single="false"
    />
  </div>
</template>
