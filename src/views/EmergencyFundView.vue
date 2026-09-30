<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { DEPENDENT_OPTIONS, JOB_OPTIONS, emergencyFund } from '@/utils/finance'
import { PRESETS, RANGE } from '@/data/limits'
import { formatDecimal, formatMonthsToHuman, formatPercent, formatRupiah } from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const mod = getModule('dana-darurat')
const p = state.userProfile

const dependentOptions = DEPENDENT_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
  note: `${o.note} — pengali dasar ${o.multiplier}x pengeluaran bulanan.`,
}))

const jobOptions = JOB_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
  note: `${o.note}${o.extra > 0 ? ` — tambahan ${o.extra}x pengeluaran.` : ' — tanpa tambahan pengali.'}`,
}))

const result = computed(() =>
  emergencyFund({
    monthlyExpenses: p.monthlyExpenses,
    dependents: p.dependents,
    jobType: p.jobType,
    alreadySaved: p.emergencyFundSaved,
  }),
)

/** Berapa lama target tercapai dengan sisa uang bebas bulanan. */
const surplus = computed(() =>
  Math.max(0, p.monthlyIncome - p.monthlyExpenses - p.monthlyDebt),
)

const monthsToTarget = computed(() => {
  if (result.value.remaining <= 0) return 0
  if (surplus.value <= 0) return null
  return Math.ceil(result.value.remaining / surplus.value)
})

/** Target antara, supaya angka akhir tidak terasa mustahil. */
const milestones = computed(() => {
  const expense = p.monthlyExpenses
  const saved = p.emergencyFundSaved
  return [1, 3, 6, result.value.multiplier]
    .filter((m, i, arr) => m > 0 && arr.indexOf(m) === i && m <= result.value.multiplier)
    .map((m) => ({
      multiplier: m,
      amount: expense * m,
      done: saved >= expense * m,
    }))
})

const donutSlices = computed(() => [
  { label: 'Sudah terkumpul', value: Math.min(result.value.saved, result.value.target), color: '#059669' },
  { label: 'Masih kurang', value: result.value.remaining, color: '#94a3b8' },
])

const statusLabel = computed(() => {
  const pct = result.value.progressPct
  if (pct >= 100) return { level: 'safe', label: 'Target Tercapai' }
  if (pct >= 50) return { level: 'warn', label: 'Setengah Jalan' }
  return { level: 'danger', label: 'Perlu Dikejar' }
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['dana-darurat']"
    route-name="dana-darurat"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Kondisi kamu" icon="🎛️" subtitle="Angka ini tersambung dengan Profil Keuangan.">
          <div class="space-y-6">
            <SliderField
              v-model="p.monthlyExpenses"
              v-bind="RANGE.expenses"
              label="Pengeluaran rutin bulanan"
              tooltip="Total biaya hidup sebulan tanpa cicilan. Ini dasar perhitungan dana darurat, bukan gaji."
              :format="formatRupiah"
              accent="amber"
              :presets="PRESETS.expenses"
            />

            <ChipGroup
              v-model="p.dependents"
              label="Status tanggungan"
              tooltip="Makin banyak orang yang bergantung padamu, makin tebal bantalan yang dibutuhkan."
              :options="dependentOptions"
              :columns="3"
            />

            <ChipGroup
              v-model="p.jobType"
              label="Jenis pekerjaan"
              tooltip="Penghasilan yang naik-turun butuh dana darurat lebih besar karena risikonya lebih tinggi."
              :options="jobOptions"
              :columns="3"
            />

            <SliderField
              v-model="p.emergencyFundSaved"
              v-bind="RANGE.emergencySaved"
              label="Dana darurat yang sudah terkumpul"
              :format="formatRupiah"
              accent="emerald"
            />
          </div>
        </AppCard>

        <!-- Rincian pengali -->
        <AppCard title="Cara angkanya terbentuk" icon="🧮">
          <dl class="space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Pengeluaran bulanan</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(p.monthlyExpenses) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Pengali status</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ result.baseMultiplier }}x
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Tambahan pekerjaan</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">+{{ result.jobExtra }}x</dd>
            </div>
            <div
              class="flex items-center justify-between gap-3 border-t divide-line pt-2.5 text-brand-700 dark:text-brand-300"
            >
              <dt class="font-bold">Total pengali</dt>
              <dd class="tnum font-extrabold">{{ result.multiplier }}x</dd>
            </div>
          </dl>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard :tone="statusLabel.level">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">Target dana daruratmu</h2>
              <StatusPill :level="statusLabel.level" :label="statusLabel.label" size="sm" />
            </div>
          </template>

          <div class="space-y-5">
            <div>
              <p class="hint">Total yang perlu terkumpul</p>
              <p class="tnum mt-1 text-3xl font-extrabold text-ink-900 sm:text-4xl dark:text-white">
                {{ formatRupiah(result.target) }}
              </p>
              <p class="hint mt-1.5">
                Setara {{ result.multiplier }}x pengeluaran bulanan
                ({{ formatRupiah(p.monthlyExpenses) }} × {{ result.multiplier }}).
              </p>
            </div>

            <ProgressBar
              :value="result.progressPct"
              tone="auto"
              height="lg"
              label="Progress pencapaian"
              :value-label="formatPercent(result.progressPct)"
            />

            <div class="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="Sudah terkumpul"
                :value="formatRupiah(result.saved)"
                tone="safe"
                size="sm"
              />
              <ResultStat
                label="Masih kurang"
                :value="formatRupiah(result.remaining)"
                :tone="result.remaining > 0 ? 'warn' : 'safe'"
                size="sm"
              />
              <ResultStat
                label="Bulan tercover"
                :value="`${formatDecimal(result.monthsCovered, 1)} bulan`"
                tone="brand"
                size="sm"
                tooltip="Berapa lama kamu bisa bertahan dengan dana darurat saat ini kalau penghasilan berhenti."
              />
            </div>
          </div>
        </AppCard>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard title="Komposisi" icon="🍩">
            <DonutChart
              :slices="donutSlices"
              :size="180"
              center-label="Progress"
              :center-value="formatPercent(result.progressPct)"
            />
          </AppCard>

          <AppCard title="Perkiraan waktu" icon="⏱️">
            <div v-if="result.remaining <= 0" class="space-y-2">
              <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                🎉 Dana daruratmu sudah penuh.
              </p>
              <p class="hint">
                Berhenti menambah, lalu alihkan setoran bulananmu ke pelunasan utang atau investasi.
              </p>
              <RouterLink to="/dca" class="btn-primary mt-2 w-full">
                Mulai simulasi investasi →
              </RouterLink>
            </div>

            <div v-else-if="monthsToTarget === null" class="space-y-2">
              <p class="text-sm font-bold text-rose-600 dark:text-rose-400">
                Belum ada uang bebas tiap bulan.
              </p>
              <p class="hint">
                Pengeluaran dan cicilanmu saat ini menghabiskan seluruh penghasilan, jadi belum ada
                yang bisa disisihkan. Coba tinjau anggaranmu lebih dulu.
              </p>
              <RouterLink to="/anggaran" class="btn-ghost mt-2 w-full">
                Atur anggaran →
              </RouterLink>
            </div>

            <div v-else class="space-y-3">
              <div>
                <p class="hint">Dengan uang bebas {{ formatRupiah(surplus) }}/bulan</p>
                <p class="tnum mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">
                  {{ formatMonthsToHuman(monthsToTarget) }}
                </p>
              </div>
              <p class="hint">
                Perkiraan ini memakai seluruh uang bebasmu. Kalau hanya sebagian yang disisihkan,
                waktunya akan lebih panjang.
              </p>
            </div>
          </AppCard>
        </div>

        <!-- Target bertahap -->
        <AppCard
          title="Pecah jadi target kecil"
          icon="🪜"
          subtitle="Angka akhir bisa terasa berat. Kejar satu tangga dulu."
        >
          <ul class="space-y-2.5">
            <li
              v-for="ms in milestones"
              :key="ms.multiplier"
              class="flex items-center gap-3 rounded-xl border px-3.5 py-3"
              :class="
                ms.done
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10'
                  : 'border-ink-200 bg-white dark:border-white/10 dark:bg-white/5'
              "
            >
              <span
                class="grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold"
                :class="
                  ms.done
                    ? 'bg-emerald-600 text-white'
                    : 'bg-ink-100 text-ink-500 dark:bg-white/10 dark:text-ink-300'
                "
                aria-hidden="true"
              >
                {{ ms.done ? '✓' : `${ms.multiplier}x` }}
              </span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-bold text-ink-900 dark:text-white">
                  {{ ms.multiplier }}x pengeluaran bulanan
                </span>
                <span class="hint">{{ formatRupiah(ms.amount) }}</span>
              </span>
              <StatusPill
                :level="ms.done ? 'safe' : 'default'"
                :label="ms.done ? 'Tercapai' : 'Belum'"
                size="sm"
              />
            </li>
          </ul>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
