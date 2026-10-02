<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { derived, state } from '@/stores/financeStore'
import { projectInvestment, retirementPlan } from '@/utils/finance'
import { PRESETS, RANGE } from '@/data/limits'
import {
  formatDecimal,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import LineChart from '@/components/charts/LineChart.vue'

const mod = getModule('pensiun')
const p = state.userProfile
const r = state.retirement

const formatYears = (v) => `${v} tahun`
const formatRatePercent = (v) => formatPercent(v, 2)
const formatReturnPercent = (v) => formatPercent(v, 1)

const plan = computed(() =>
  retirementPlan({
    currentAge: p.currentAge,
    retirementAge: p.retirementAge,
    monthlyExpenseToday: r.monthlyExpenseToday,
    inflationPct: r.inflationPct,
    returnPct: r.returnPct,
    currentAssets: p.investedAssets,
    withdrawalRatePct: r.withdrawalRatePct,
  }),
)

/** Uang bebas bulanan dihitung terpusat di store, supaya semua modul sepakat. */
const surplus = computed(() => Math.max(0, derived.value.surplus))

const burdenPct = computed(() =>
  surplus.value > 0 ? (plan.value.requiredMonthly / surplus.value) * 100 : 100,
)

const feasibility = computed(() => {
  if (plan.value.yearsToRetire <= 0) {
    return {
      level: 'warn',
      label: 'Atur Usia Dulu',
      message:
        'Target usia pensiunmu sama dengan atau di bawah usia sekarang. Geser target usia pensiun di Profil Keuangan supaya simulasinya bisa dihitung.',
    }
  }
  if (plan.value.alreadyEnough) {
    return {
      level: 'safe',
      label: 'Sudah Aman',
      message:
        'Aset investasimu saat ini, kalau dibiarkan tumbuh, sudah cukup mencapai target pensiun. Kamu tidak perlu setoran tambahan — tapi tetap jaga agar tidak tergerus.',
    }
  }
  if (surplus.value <= 0) {
    return {
      level: 'danger',
      label: 'Belum Ada Ruang',
      message:
        'Belum ada uang bebas bulanan untuk dialokasikan. Perbaiki arus kas dan rasio cicilan lebih dulu — itu langkah paling berdampak sekarang.',
    }
  }
  if (burdenPct.value <= 60) {
    return {
      level: 'safe',
      label: 'Masih Terjangkau',
      message: `Setoran ini memakai ${formatPercent(burdenPct.value)} dari uang bebas bulananmu. Targetmu realistis.`,
    }
  }
  if (burdenPct.value <= 100) {
    return {
      level: 'warn',
      label: 'Ketat',
      message: `Setoran ini memakai ${formatPercent(burdenPct.value)} dari uang bebas bulananmu, jadi hampir tidak ada ruang untuk tujuan lain.`,
    }
  }
  return {
    level: 'danger',
    label: 'Perlu Disesuaikan',
    message: `Setoran yang dibutuhkan (${formatRupiah(plan.value.requiredMonthly)}) melebihi uang bebas bulananmu (${formatRupiah(surplus.value)}). Coba geser beberapa asumsi di bawah.`,
  }
})

/** Proyeksi pertumbuhan dana sampai usia pensiun, dipecah per tahun. */
const projection = computed(() => {
  const years = Math.max(1, plan.value.yearsToRetire)
  const proj = projectInvestment({
    initial: p.investedAssets,
    monthly: plan.value.requiredMonthly,
    annualReturnPct: r.returnPct,
    years,
  })

  return {
    labels: proj.yearlySeries.map((pt) => `Usia ${p.currentAge + Math.round(pt.year)}`),
    series: [
      {
        name: 'Uang yang kamu setor',
        color: '#0ea5e9',
        values: proj.yearlySeries.map((pt) => pt.contributed),
      },
      {
        name: 'Hasil pertumbuhan',
        color: '#4f46e5',
        values: proj.yearlySeries.map((pt) => pt.growth),
      },
    ],
    final: proj.finalBalance,
    contributed: proj.totalContributed,
    growth: proj.totalGrowth,
  }
})

/**
 * Dampak menunda: menunjukkan bahwa setoran naik cukup tajam kalau mulai terlambat.
 * Ini sering jadi pendorong paling efektif untuk mulai sekarang.
 */
const delayScenarios = computed(() =>
  [0, 5, 10].map((delay) => {
    const scenario = retirementPlan({
      currentAge: p.currentAge + delay,
      retirementAge: p.retirementAge,
      monthlyExpenseToday: r.monthlyExpenseToday,
      inflationPct: r.inflationPct,
      returnPct: r.returnPct,
      currentAssets: p.investedAssets,
      withdrawalRatePct: r.withdrawalRatePct,
    })
    return {
      delay,
      label: delay === 0 ? 'Mulai sekarang' : `Menunda ${delay} tahun`,
      age: p.currentAge + delay,
      monthly: scenario.requiredMonthly,
      possible: scenario.yearsToRetire > 0,
    }
  }),
)

const baseMonthly = computed(() => delayScenarios.value[0]?.monthly ?? 0)
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.pensiun"
    route-name="pensiun"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="min-w-0 space-y-5">
        <AppCard title="Kapan & berapa" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="p.currentAge"
              v-bind="RANGE.currentAge"
              label="Usia sekarang"
              :format="formatYears"
              accent="sky"
            />

            <SliderField
              v-model="p.retirementAge"
              v-bind="RANGE.retirementAge"
              label="Target usia pensiun"
              :format="formatYears"
              accent="brand"
              :hint="`Sisa waktu menabung: ${plan.yearsToRetire} tahun`"
              :presets="PRESETS.retirementAge"
            />

            <SliderField
              v-model="r.monthlyExpenseToday"
              v-bind="RANGE.retirementExpense"
              label="Biaya hidup bulanan saat pensiun"
              tooltip="Pakai nilai uang hari ini. Aplikasi otomatis menaikkannya mengikuti inflasi."
              :format="formatRupiah"
              accent="amber"
              hint="Dalam nilai uang sekarang"
            />
          </div>
        </AppCard>

        <AppCard title="Asumsi" icon="⚙️">
          <div class="space-y-6">
            <SliderField
              v-model="r.inflationPct"
              v-bind="RANGE.retirementInflationPct"
              label="Perkiraan inflasi per tahun"
              tooltip="Inflasi umum Indonesia beberapa tahun terakhir berkisar 2-4% per tahun."
              :format="formatRatePercent"
              accent="rose"
              :presets="PRESETS.inflationBasic"
            />

            <SliderField
              v-model="r.returnPct"
              v-bind="RANGE.returnPct"
              label="Perkiraan return investasi per tahun"
              tooltip="Semakin panjang jangka waktumu, semakin masuk akal memakai asumsi yang lebih tinggi."
              :format="formatReturnPercent"
              accent="emerald"
              :presets="PRESETS.returnProfile"
            />

            <SliderField
              v-model="r.withdrawalRatePct"
              v-bind="RANGE.withdrawalRatePct"
              label="Safe Withdrawal Rate"
              tooltip="Persentase dana yang aman ditarik tiap tahun tanpa membuat pokoknya habis. 4% adalah standar yang paling umum."
              :format="formatRatePercent"
              accent="brand"
              :hint="`Setara mengumpulkan ${formatDecimal(plan.multiplier, 1)}x pengeluaran tahunan`"
              :presets="PRESETS.withdrawalRate"
            />
          </div>
        </AppCard>

        <AppCard title="Aset investasimu sekarang" icon="🏦">
          <SliderField
            v-model="p.investedAssets"
            v-bind="RANGE.investedAssets"
            label="Nilai investasi saat ini"
            tooltip="Total reksadana, saham, emas, obligasi. Jangan masukkan dana darurat."
            :format="formatRupiahCompact"
            accent="brand"
          />
          <p class="hint mt-3">
            Aset ini diasumsikan ikut tumbuh sampai pensiun, jadi mengurangi setoran yang dibutuhkan.
          </p>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="min-w-0 space-y-5">
        <AppCard tone="brand">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">Angka pensiunmu</h2>
              <StatusPill :level="feasibility.level" :label="feasibility.label" size="sm" />
            </div>
          </template>

          <div class="space-y-5">
            <div>
              <p class="hint">Total dana yang perlu terkumpul di usia {{ p.retirementAge }}</p>
              <p class="tnum mt-1 text-3xl font-extrabold text-brand-700 sm:text-4xl dark:text-brand-300">
                {{ formatRupiahCompact(plan.target) }}
              </p>
              <p class="hint mt-1.5">{{ formatRupiah(plan.target) }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <ResultStat
                label="Setoran bulanan mulai sekarang"
                :value="formatRupiah(plan.requiredMonthly)"
                :tone="feasibility.level"
                tooltip="Sudah memperhitungkan pertumbuhan aset investasi yang kamu miliki saat ini."
              />
              <ResultStat
                label="Sisa waktu menabung"
                :value="`${plan.yearsToRetire} tahun`"
                tone="brand"
                :caption="`${plan.months} bulan setoran`"
              />
            </div>

            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {{ feasibility.message }}
            </p>
          </div>
        </AppCard>

        <!-- Efek inflasi -->
        <AppCard title="Kenapa angkanya sebesar itu" icon="🔍">
          <div class="space-y-4">
            <dl class="space-y-3 text-sm">
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-500 dark:text-ink-400">
                  Biaya hidup bulanan hari ini
                </dt>
                <dd class="tnum shrink-0 font-bold text-ink-900 dark:text-white">
                  {{ formatRupiah(r.monthlyExpenseToday) }}
                </dd>
              </div>
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-500 dark:text-ink-400">
                  Setelah digerus inflasi {{ formatPercent(r.inflationPct, 2) }} selama
                  {{ plan.yearsToRetire }} tahun
                </dt>
                <dd class="tnum shrink-0 font-bold text-rose-600 dark:text-rose-400">
                  {{ formatRupiah(plan.monthlyExpenseAtRetirement) }}
                </dd>
              </div>
              <div class="flex items-start justify-between gap-4">
                <dt class="text-ink-500 dark:text-ink-400">Kebutuhan per tahun saat pensiun</dt>
                <dd class="tnum shrink-0 font-bold text-ink-900 dark:text-white">
                  {{ formatRupiahCompact(plan.monthlyExpenseAtRetirement * 12) }}
                </dd>
              </div>
              <div
                class="flex items-start justify-between gap-4 border-t divide-line pt-3 text-brand-700 dark:text-brand-300"
              >
                <dt class="font-bold">
                  Dikali {{ formatDecimal(plan.multiplier, 1) }} (dari SWR
                  {{ formatPercent(r.withdrawalRatePct, 2) }})
                </dt>
                <dd class="tnum shrink-0 font-extrabold">
                  {{ formatRupiahCompact(plan.target) }}
                </dd>
              </div>
            </dl>

            <p class="hint">
              Return riil investasimu — pertumbuhan setelah dikurangi inflasi — sekitar
              <strong class="font-bold text-ink-700 dark:text-ink-200">
                {{ formatPercent(plan.realReturnPct, 2) }}
              </strong>
              per tahun. Angka inilah yang benar-benar menambah daya belimu.
            </p>
          </div>
        </AppCard>

        <!-- Grafik -->
        <AppCard
          v-if="plan.yearsToRetire > 0"
          title="Pertumbuhan dana sampai pensiun"
          icon="📈"
          subtitle="Perhatikan kapan porsi ungu (hasil pertumbuhan) mulai menyalip setoranmu."
        >
          <LineChart
            :series="projection.series"
            :labels="projection.labels"
            :height="320"
            stacked
            :format-value="formatRupiahCompact"
            :format-tooltip-value="formatRupiah"
            :max-x-labels="8"
          />
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <p class="hint">Total yang kamu setor</p>
              <p class="tnum mt-0.5 text-sm font-bold text-sky-600 dark:text-sky-400">
                {{ formatRupiahCompact(projection.contributed) }}
              </p>
            </div>
            <div>
              <p class="hint">Hasil pertumbuhan</p>
              <p class="tnum mt-0.5 text-sm font-bold text-brand-600 dark:text-brand-300">
                {{ formatRupiahCompact(projection.growth) }}
              </p>
            </div>
            <div>
              <p class="hint">Saldo akhir</p>
              <p class="tnum mt-0.5 text-sm font-bold text-ink-900 dark:text-white">
                {{ formatRupiahCompact(projection.final) }}
              </p>
            </div>
          </div>
        </AppCard>

        <!-- Biaya menunda -->
        <AppCard title="Harga dari menunda" icon="⏰" subtitle="Setoran yang dibutuhkan kalau kamu mulai nanti.">
          <ul class="space-y-2.5">
            <li
              v-for="s in delayScenarios"
              :key="s.delay"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
              :class="
                s.delay === 0
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10'
                  : 'border-ink-200 dark:border-white/10'
              "
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-ink-900 dark:text-white">{{ s.label }}</p>
                <p class="hint">Mulai di usia {{ s.age }}</p>
              </div>
              <div class="shrink-0 text-right">
                <p
                  class="tnum text-sm font-extrabold"
                  :class="
                    s.delay === 0
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-rose-600 dark:text-rose-400'
                  "
                >
                  {{ s.possible ? `${formatRupiah(s.monthly)}/bln` : 'Sudah melewati usia pensiun' }}
                </p>
                <p v-if="s.delay > 0 && s.possible && baseMonthly > 0" class="hint">
                  {{ formatDecimal(s.monthly / baseMonthly, 1) }}x lebih berat
                </p>
              </div>
            </li>
          </ul>
          <p class="hint mt-3">
            Menunda tidak hanya memperpendek waktu menabung, tapi juga memotong tahun-tahun paling
            berharga untuk bunga berbunga.
          </p>
        </AppCard>

        <AppCard
          v-if="feasibility.level === 'danger'"
          tone="warn"
          title="Tuas yang bisa kamu geser"
          icon="🎚️"
        >
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <ul class="space-y-1.5">
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span>
                  Mundurkan usia pensiun beberapa tahun — biasanya ini tuas dengan dampak paling besar.
                </span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span>Turunkan target biaya hidup saat pensiun ke angka yang lebih sederhana.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span>
                  Perbesar uang bebas bulananmu dengan melunasi utang atau menaikkan penghasilan.
                </span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span>
                  Mulai dengan nominal berapa pun sekarang. Setoran kecil yang berjalan jauh lebih
                  berharga daripada rencana sempurna yang tidak pernah dimulai.
                </span>
              </li>
            </ul>
            <div class="flex flex-wrap gap-2 pt-1">
              <RouterLink to="/anggaran" class="btn-ghost">Tinjau anggaran →</RouterLink>
              <RouterLink to="/bebas-utang" class="btn-ghost">Rencana bebas utang →</RouterLink>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
