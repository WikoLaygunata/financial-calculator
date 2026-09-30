<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { DSR_SAFE_LIMIT, debtServiceRatio, loanInstallment } from '@/utils/finance'
import { PRESETS, RANGE } from '@/data/limits'
import {
  formatMonthsToHuman,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import DonutChart from '@/components/charts/DonutChart.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'

const mod = getModule('simulasi-pinjaman')
const l = state.loan
const p = state.userProfile

const result = computed(() =>
  loanInstallment({
    principal: l.principal,
    annualRatePct: l.annualRatePct,
    months: l.months,
  }),
)

/** DSR setelah cicilan baru ini ditambahkan ke cicilan yang sudah berjalan. */
const dsrAfter = computed(() =>
  debtServiceRatio({
    monthlyIncome: p.monthlyIncome,
    monthlyDebt: p.monthlyDebt + result.value.payment,
  }),
)

const donutSlices = computed(() => [
  { label: 'Pokok pinjaman', value: l.principal, color: '#4f46e5' },
  { label: 'Total bunga', value: result.value.totalInterest, color: '#e11d48' },
])

/** Ringkas jadwal amortisasi ke per tahun supaya grafiknya terbaca. */
const yearlyBreakdown = computed(() => {
  const years = Math.ceil(result.value.months / 12)
  const categories = []
  const principalValues = []
  const interestValues = []

  for (let y = 0; y < years; y += 1) {
    const slice = result.value.schedule.slice(y * 12, (y + 1) * 12)
    if (!slice.length) break
    categories.push(`Th ${y + 1}`)
    principalValues.push(slice.reduce((s, r) => s + r.principal, 0))
    interestValues.push(slice.reduce((s, r) => s + r.interest, 0))
  }

  return {
    categories,
    series: [
      { name: 'Pokok', color: '#4f46e5', values: principalValues },
      { name: 'Bunga', color: '#e11d48', values: interestValues },
    ],
  }
})

/** Beberapa baris awal & akhir untuk memperlihatkan pergeseran bunga ke pokok. */
const scheduleHighlights = computed(() => {
  const s = result.value.schedule
  if (s.length <= 6) return s
  return [...s.slice(0, 3), null, ...s.slice(-3)]
})

const formatRatePercent = (v) => formatPercent(v, 2)

const affordability = computed(() => {
  const level = dsrAfter.value.level
  if (level === 'safe') {
    return {
      level: 'safe',
      label: 'Masih Aman',
      message: `Setelah cicilan ini, rasio cicilanmu jadi ${formatPercent(dsrAfter.value.ratio)} — masih di bawah batas aman ${DSR_SAFE_LIMIT}%.`,
    }
  }
  if (level === 'warn') {
    return {
      level: 'warn',
      label: 'Zona Waspada',
      message: `Cicilan ini mendorong rasio cicilanmu ke ${formatPercent(dsrAfter.value.ratio)}, di atas batas aman ${DSR_SAFE_LIMIT}%. Arus kasmu akan terasa sesak.`,
    }
  }
  return {
    level: 'danger',
    label: 'Terlalu Berat',
    message: `Rasio cicilanmu akan mencapai ${formatPercent(dsrAfter.value.ratio)}. Ini berisiko tinggi — pertimbangkan menurunkan nominal pinjaman atau memperpanjang tenor.`,
  }
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['simulasi-pinjaman']"
    route-name="simulasi-pinjaman"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Detail pinjaman" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="l.principal"
              v-bind="RANGE.loanPrincipal"
              label="Nominal pinjaman"
              :format="formatRupiahCompact"
              accent="brand"
              :presets="PRESETS.loanPrincipal"
            />

            <SliderField
              v-model="l.annualRatePct"
              v-bind="RANGE.loanRatePct"
              label="Bunga per tahun"
              tooltip="Pakai bunga efektif. Kalau penawaran menyebut bunga flat, angka efektifnya biasanya jauh lebih tinggi."
              :format="formatRatePercent"
              accent="rose"
              :presets="PRESETS.loanRate"
            />

            <SliderField
              v-model="l.months"
              v-bind="RANGE.loanMonths"
              label="Tenor"
              :format="formatMonthsToHuman"
              accent="sky"
              hint="Perhatikan: tenor panjang bikin cicilan ringan tapi total bunga membengkak"
              :presets="PRESETS.loanMonths"
            />
          </div>
        </AppCard>

        <AppCard title="Bandingkan dengan penghasilanmu" icon="⚖️">
          <dl class="space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Penghasilan bulanan</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(p.monthlyIncome) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Cicilan yang sudah berjalan</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(p.monthlyDebt) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Cicilan baru ini</dt>
              <dd class="tnum font-bold text-brand-600 dark:text-brand-300">
                {{ formatRupiah(result.payment) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t divide-line pt-2.5">
              <dt class="font-bold text-ink-700 dark:text-ink-200">Rasio cicilan setelahnya</dt>
              <dd
                class="tnum font-extrabold"
                :class="{
                  'text-emerald-600 dark:text-emerald-400': dsrAfter.level === 'safe',
                  'text-amber-600 dark:text-amber-400': dsrAfter.level === 'warn',
                  'text-rose-600 dark:text-rose-400': dsrAfter.level === 'danger',
                }"
              >
                {{ formatPercent(dsrAfter.ratio) }}
              </dd>
            </div>
          </dl>
          <p class="hint mt-3">Ubah penghasilan dan cicilan berjalan lewat tombol Profil Keuangan.</p>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard tone="brand">
          <template #header>
            <h2 class="text-base font-bold text-ink-900 dark:text-white">Cicilan bulananmu</h2>
          </template>

          <div class="space-y-5">
            <div>
              <p class="tnum text-3xl font-extrabold text-brand-700 sm:text-4xl dark:text-brand-300">
                {{ formatRupiah(result.payment) }}
              </p>
              <p class="hint mt-1.5">
                Tetap sama setiap bulan selama {{ formatMonthsToHuman(result.months) }}
                ({{ result.months }} kali bayar).
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="Total bunga"
                :value="formatRupiah(result.totalInterest)"
                tone="danger"
                size="sm"
                :caption="`${formatPercent(result.interestRatioPct)} dari pokok pinjaman`"
              />
              <ResultStat
                label="Total yang dibayar"
                :value="formatRupiah(result.totalPayment)"
                tone="warn"
                size="sm"
                caption="Pokok + seluruh bunga"
              />
              <ResultStat
                label="Pokok pinjaman"
                :value="formatRupiah(l.principal)"
                tone="brand"
                size="sm"
                caption="Uang yang kamu terima"
              />
            </div>
          </div>
        </AppCard>

        <!-- Kelayakan -->
        <AppCard :tone="affordability.level">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">Sanggup atau tidak?</h2>
              <StatusPill :level="affordability.level" :label="affordability.label" size="sm" />
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {{ affordability.message }}
            </p>
            <RouterLink
              v-if="affordability.level !== 'safe'"
              to="/kesehatan-cicilan"
              class="btn-ghost"
            >
              Lihat analisis rasio cicilan →
            </RouterLink>
          </div>
        </AppCard>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard title="Pokok vs bunga" icon="🍩">
            <DonutChart
              :slices="donutSlices"
              :size="170"
              center-label="Total bayar"
              :center-value="formatRupiahCompact(result.totalPayment)"
              :format-value="formatRupiahCompact"
            />
          </AppCard>

          <AppCard title="Yang sering mengejutkan" icon="💡">
            <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              <p>
                Untuk pinjaman {{ formatRupiahCompact(l.principal) }}, kamu akan membayar bunga
                <strong class="font-bold text-rose-600 dark:text-rose-400">
                  {{ formatRupiahCompact(result.totalInterest) }}
                </strong>
                — setara {{ formatPercent(result.interestRatioPct) }} dari pokoknya.
              </p>
              <p v-if="result.schedule.length">
                Di bulan pertama, dari cicilan {{ formatRupiah(result.payment) }} hanya
                {{ formatRupiah(result.schedule[0].principal) }} yang mengurangi utangmu. Sisanya,
                {{ formatRupiah(result.schedule[0].interest) }}, habis jadi bunga.
              </p>
            </div>
          </AppCard>
        </div>

        <AppCard
          v-if="yearlyBreakdown.categories.length"
          title="Porsi pokok vs bunga per tahun"
          icon="📊"
          subtitle="Perhatikan bagaimana porsi merah (bunga) menyusut seiring waktu."
        >
          <StackedBarChart
            :categories="yearlyBreakdown.categories"
            :series="yearlyBreakdown.series"
            :height="300"
            :format-value="formatRupiahCompact"
            :format-tooltip-value="formatRupiah"
          />
        </AppCard>

        <!-- Tabel amortisasi -->
        <AppCard
          title="Jadwal pembayaran"
          icon="📅"
          subtitle="Sebagian baris awal dan akhir, supaya pergeserannya terlihat."
          :padded="false"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b divide-line text-left">
                  <th class="px-5 py-3 text-xs font-bold tracking-wide text-ink-400 uppercase">Bulan</th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Cicilan</th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Bunga</th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Pokok</th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Sisa utang</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, i) in scheduleHighlights" :key="row ? row.month : `gap-${i}`">
                  <tr v-if="row === null" class="border-b divide-line">
                    <td colspan="5" class="px-5 py-2 text-center text-xs font-semibold text-ink-400">
                      ⋯ {{ result.months - 6 }} bulan berikutnya ⋯
                    </td>
                  </tr>
                  <tr v-else class="border-b divide-line last:border-0">
                    <td class="tnum px-5 py-3 font-semibold text-ink-700 dark:text-ink-200">
                      {{ row.month }}
                    </td>
                    <td class="tnum px-5 py-3 text-right text-ink-700 dark:text-ink-200">
                      {{ formatRupiah(row.payment) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                      {{ formatRupiah(row.interest) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right font-semibold text-brand-600 dark:text-brand-300">
                      {{ formatRupiah(row.principal) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right text-ink-500 dark:text-ink-400">
                      {{ formatRupiah(row.balance) }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
