<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { projectInvestment } from '@/utils/finance'
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
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import StackedBarChart from '@/components/charts/StackedBarChart.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const mod = getModule('dca')
const d = state.dca
const p = state.userProfile

const formatYears = (v) => `${v} tahun`
const formatReturnPercent = (v) => formatPercent(v, 1)

const result = computed(() =>
  projectInvestment({
    initial: d.initial,
    monthly: d.monthly,
    annualReturnPct: d.returnPct,
    years: d.years,
  }),
)

const chart = computed(() => {
  const points = result.value.yearlySeries
  return {
    categories: points.map((pt) => (pt.year === 0 ? 'Mulai' : `Th ${Math.round(pt.year)}`)),
    series: [
      {
        name: 'Uang yang kamu setor',
        color: '#0ea5e9',
        values: points.map((pt) => pt.contributed),
      },
      {
        name: 'Hasil pertumbuhan',
        color: '#4f46e5',
        values: points.map((pt) => pt.growth),
      },
    ],
  }
})

/**
 * Titik balik: tahun pertama di mana hasil pertumbuhan melebihi total setoran.
 * Ini momen paling menarik untuk ditunjukkan ke pengguna.
 */
const crossover = computed(() => {
  const found = result.value.yearlySeries.find((pt) => pt.growth > pt.contributed && pt.year > 0)
  return found ? Math.round(found.year) : null
})

const donutSlices = computed(() => [
  { label: 'Uang yang kamu setor', value: result.value.totalContributed, color: '#0ea5e9' },
  { label: 'Hasil pertumbuhan', value: result.value.totalGrowth, color: '#4f46e5' },
])

const surplus = computed(() => Math.max(0, p.monthlyIncome - p.monthlyExpenses - p.monthlyDebt))

const affordability = computed(() => {
  if (surplus.value <= 0) {
    return { level: 'danger', label: 'Belum ada uang bebas' }
  }
  if (d.monthly <= surplus.value) return { level: 'safe', label: 'Sesuai kemampuan' }
  return { level: 'warn', label: 'Di atas uang bebasmu' }
})

/** Bandingkan efek menambah durasi vs menambah setoran — biasanya waktu lebih kuat. */
const levers = computed(() => {
  const base = result.value.finalBalance

  const plusFiveYears = projectInvestment({
    initial: d.initial,
    monthly: d.monthly,
    annualReturnPct: d.returnPct,
    years: d.years + 5,
  }).finalBalance

  const plusHalfDeposit = projectInvestment({
    initial: d.initial,
    monthly: d.monthly * 1.5,
    annualReturnPct: d.returnPct,
    years: d.years,
  }).finalBalance

  const plusTwoPct = projectInvestment({
    initial: d.initial,
    monthly: d.monthly,
    annualReturnPct: d.returnPct + 2,
    years: d.years,
  }).finalBalance

  return [
    {
      label: `Tambah 5 tahun (jadi ${d.years + 5} th)`,
      value: plusFiveYears,
      delta: plusFiveYears - base,
      note: 'Paling bisa kamu kendalikan: mulai lebih awal, berhenti lebih lambat.',
    },
    {
      label: 'Naikkan setoran 50%',
      value: plusHalfDeposit,
      delta: plusHalfDeposit - base,
      note: `Setoran jadi ${formatRupiah(d.monthly * 1.5)}/bulan.`,
    },
    {
      label: 'Return naik 2% per tahun',
      value: plusTwoPct,
      delta: plusTwoPct - base,
      note: 'Paling sulit dikendalikan, dan datang dengan risiko lebih besar.',
    },
  ].sort((a, b) => b.delta - a.delta)
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.dca"
    route-name="dca"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Atur simulasimu" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="d.initial"
              v-bind="RANGE.lumpSum"
              label="Modal awal"
              tooltip="Uang yang kamu masukkan sekali di awal. Boleh nol kalau mau mulai dari setoran rutin saja."
              :format="formatRupiahCompact"
              accent="brand"
              :presets="PRESETS.lumpSumDca"
            />

            <SliderField
              v-model="d.monthly"
              v-bind="RANGE.monthlyDeposit"
              label="Setoran rutin bulanan"
              tooltip="Nominal yang kamu setor setiap bulan, apa pun kondisi pasar. Inilah inti dari strategi DCA."
              :format="formatRupiah"
              accent="emerald"
              :hint="
                surplus > 0
                  ? `Uang bebas bulananmu: ${formatRupiah(surplus)}`
                  : 'Belum ada uang bebas bulanan di profilmu'
              "
              :presets="PRESETS.monthlyDepositDca"
            />

            <SliderField
              v-model="d.returnPct"
              v-bind="RANGE.dcaReturnPct"
              label="Asumsi return per tahun"
              tooltip="Pakai angka konservatif. Return tinggi selalu datang bersama kemungkinan nilai turun di tengah jalan."
              :format="formatReturnPercent"
              accent="sky"
              :presets="PRESETS.returnProfile"
            />

            <SliderField
              v-model="d.years"
              v-bind="RANGE.years"
              label="Durasi investasi"
              :format="formatYears"
              accent="amber"
              :presets="PRESETS.years"
            />
          </div>
        </AppCard>

        <AppCard title="Sesuai kantongmu?" icon="⚖️">
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-ink-500 dark:text-ink-400">Uang bebas bulanan</span>
              <span class="tnum text-sm font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(surplus) }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3">
              <span class="text-sm text-ink-500 dark:text-ink-400">Setoran simulasi ini</span>
              <span class="tnum text-sm font-bold text-brand-600 dark:text-brand-300">
                {{ formatRupiah(d.monthly) }}
              </span>
            </div>
            <div class="border-t divide-line pt-3">
              <StatusPill :level="affordability.level" :label="affordability.label" />
            </div>
            <p class="hint">
              Angka uang bebas diambil dari Profil Keuangan: penghasilan dikurangi pengeluaran dan
              cicilan.
            </p>
          </div>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard tone="brand">
          <template #header>
            <h2 class="text-base font-bold text-ink-900 dark:text-white">
              Saldo setelah {{ d.years }} tahun
            </h2>
          </template>

          <div class="space-y-5">
            <div>
              <p class="tnum text-3xl font-extrabold text-brand-700 sm:text-4xl dark:text-brand-300">
                {{ formatRupiahCompact(result.finalBalance) }}
              </p>
              <p class="hint mt-1.5">{{ formatRupiah(result.finalBalance) }}</p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="Total uang yang kamu setor"
                :value="formatRupiahCompact(result.totalContributed)"
                tone="default"
                size="sm"
                :caption="`Modal awal + ${d.years * 12}x setoran`"
              />
              <ResultStat
                label="Hasil pertumbuhan"
                :value="formatRupiahCompact(result.totalGrowth)"
                tone="safe"
                size="sm"
                caption="Bagian yang kamu dapat tanpa menyetor"
              />
              <ResultStat
                label="Porsi pertumbuhan"
                :value="formatPercent(result.growthSharePct)"
                tone="brand"
                size="sm"
                caption="Dari total saldo akhir"
              />
            </div>

            <ProgressBar
              :value="result.growthSharePct"
              tone="brand"
              height="lg"
              label="Berapa bagian saldomu yang berasal dari pertumbuhan"
              :value-label="formatPercent(result.growthSharePct)"
            />
          </div>
        </AppCard>

        <!-- Titik balik -->
        <AppCard
          :tone="crossover ? 'safe' : 'default'"
          title="Kapan bunga bekerja lebih keras dari kamu"
          icon="⚡"
        >
          <div v-if="crossover" class="space-y-3">
            <div>
              <p class="hint">Hasil pertumbuhan mulai melebihi total setoranmu di</p>
              <p class="tnum mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                tahun ke-{{ crossover }}
              </p>
            </div>
            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              Sejak titik itu, lebih dari separuh saldomu berasal dari pertumbuhan, bukan dari uang
              yang kamu setorkan. Inilah alasan kenapa bertahan lama jauh lebih penting daripada
              menyetor besar-besaran di awal.
            </p>
          </div>
          <div v-else class="space-y-3">
            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              Dalam {{ d.years }} tahun, hasil pertumbuhan belum menyalip total setoranmu. Coba
              perpanjang durasi atau naikkan asumsi return, lalu perhatikan kapan titik baliknya
              muncul — biasanya setelah 15–20 tahun pada return moderat.
            </p>
          </div>
        </AppCard>

        <!-- Grafik -->
        <AppCard
          title="Setoran vs pertumbuhan tiap tahun"
          icon="📊"
          subtitle="Arahkan kursor ke batang untuk melihat rinciannya."
        >
          <StackedBarChart
            :categories="chart.categories"
            :series="chart.series"
            :height="320"
            :format-value="formatRupiahCompact"
            :format-tooltip-value="formatRupiah"
            :max-x-labels="14"
          />
        </AppCard>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard title="Komposisi saldo akhir" icon="🍩">
            <DonutChart
              :slices="donutSlices"
              :size="170"
              center-label="Total"
              :center-value="formatRupiahCompact(result.finalBalance)"
              :format-value="formatRupiahCompact"
            />
          </AppCard>

          <AppCard title="Kelipatan uangmu" icon="✨">
            <div class="space-y-3">
              <div>
                <p class="hint">Saldo akhir dibanding total setoran</p>
                <p class="tnum mt-1 text-2xl font-extrabold text-brand-600 dark:text-brand-300">
                  {{
                    formatDecimal(
                      result.finalBalance / Math.max(1, result.totalContributed),
                      2,
                    )
                  }}x
                </p>
              </div>
              <p class="hint">
                Kamu menyetor {{ formatRupiahCompact(result.totalContributed) }} dan berakhir dengan
                {{ formatRupiahCompact(result.finalBalance) }}. Selisihnya,
                {{ formatRupiahCompact(result.totalGrowth) }}, datang dari bunga berbunga.
              </p>
            </div>
          </AppCard>
        </div>

        <!-- Tuas mana yang paling kuat -->
        <AppCard
          title="Tuas mana yang paling berdampak?"
          icon="🎚️"
          subtitle="Diurutkan dari yang paling menambah saldo akhirmu."
        >
          <ul class="space-y-2.5">
            <li
              v-for="(lever, i) in levers"
              :key="lever.label"
              class="rounded-xl border px-3.5 py-3"
              :class="
                i === 0
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10'
                  : 'border-ink-200 dark:border-white/10'
              "
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <p class="text-sm font-bold text-ink-900 dark:text-white">{{ lever.label }}</p>
                <p
                  class="tnum text-sm font-extrabold"
                  :class="
                    i === 0
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-ink-700 dark:text-ink-200'
                  "
                >
                  +{{ formatRupiahCompact(lever.delta) }}
                </p>
              </div>
              <p class="hint mt-1">{{ lever.note }}</p>
            </li>
          </ul>
          <p class="hint mt-3">
            Pada banyak kombinasi, menambah waktu mengalahkan menambah setoran. Kabar baiknya, waktu
            adalah tuas yang paling murah — cukup mulai lebih awal.
          </p>
        </AppCard>

        <AppCard tone="warn" title="Batas dari simulasi ini" icon="⚠️">
          <div class="space-y-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Grafik di atas menggambar garis pertumbuhan yang mulus. Pasar sebenarnya naik-turun:
              ada tahun untung 25%, ada tahun rugi 15%. Hasil akhirnya bisa berbeda cukup jauh dari
              angka di sini.
            </p>
            <p>
              Simulasi ini juga belum menghitung pajak, biaya transaksi, dan biaya pengelolaan
              reksadana. Anggap hasilnya sebagai gambaran arah, bukan janji.
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <RouterLink to="/bandingkan-aset" class="btn-ghost">
                Bandingkan instrumen →
              </RouterLink>
              <RouterLink to="/inflasi" class="btn-ghost">Cek efek inflasi →</RouterLink>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
