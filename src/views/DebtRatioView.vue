<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { DSR_SAFE_LIMIT, DSR_WARN_LIMIT, debtServiceRatio } from '@/utils/finance'
import { RANGE } from '@/data/limits'
import { formatPercent, formatRupiah } from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ScoreGauge from '@/components/ui/ScoreGauge.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const mod = getModule('kesehatan-cicilan')
const p = state.userProfile

const result = computed(() =>
  debtServiceRatio({ monthlyIncome: p.monthlyIncome, monthlyDebt: p.monthlyDebt }),
)

const ZONES = {
  safe: {
    label: 'Zona Aman',
    emoji: '🟢',
    headline: 'Cicilanmu masih terkendali',
    message:
      'Arus kasmu punya ruang bernapas. Ini posisi yang bagus untuk mulai menambah dana darurat atau investasi.',
  },
  warn: {
    label: 'Zona Waspada',
    emoji: '🟡',
    headline: 'Sudah mulai sesak',
    message:
      'Cicilanmu di atas batas aman. Hindari mengambil cicilan baru, dan mulai percepat pelunasan yang bunganya paling tinggi.',
  },
  danger: {
    label: 'Zona Berisiko',
    emoji: '🔴',
    headline: 'Ini perlu ditangani segera',
    message:
      'Lebih dari separuh penghasilanmu habis untuk cicilan. Satu kejadian tak terduga bisa membuatmu gagal bayar. Prioritaskan pelunasan atau bicarakan restrukturisasi dengan pemberi pinjaman.',
  },
}

const zone = computed(() => ZONES[result.value.level])

/** Gauge dibuat penuh di 60% agar zona merah terlihat jelas, bukan mentok di 100%. */
const gaugeScore = computed(() => Math.min(100, (result.value.ratio / 60) * 100))

const donutSlices = computed(() => [
  { label: 'Cicilan', value: p.monthlyDebt, color: '#e11d48' },
  {
    label: 'Sisa penghasilan',
    value: Math.max(0, p.monthlyIncome - p.monthlyDebt),
    color: '#059669',
  },
])

/** Simulasi: seberapa besar cicilan tambahan sebelum menembus batas aman. */
const scenarios = computed(() => {
  const income = p.monthlyIncome
  return [
    { label: 'Batas aman (30%)', amount: income * 0.3, level: 'safe' },
    { label: 'Batas waspada (50%)', amount: income * 0.5, level: 'warn' },
  ].map((s) => ({
    ...s,
    headroom: s.amount - p.monthlyDebt,
  }))
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['kesehatan-cicilan']"
    route-name="kesehatan-cicilan"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Angka kamu" icon="🎛️" subtitle="Tersambung dengan Profil Keuangan.">
          <div class="space-y-6">
            <SliderField
              v-model="p.monthlyIncome"
              v-bind="RANGE.income"
              label="Penghasilan bersih bulanan"
              tooltip="Pakai gaji bersih yang benar-benar masuk rekening, bukan gaji kotor."
              :format="formatRupiah"
              accent="emerald"
            />

            <SliderField
              v-model="p.monthlyDebt"
              v-bind="RANGE.debt"
              label="Total cicilan bulanan"
              tooltip="Jumlahkan KPR, cicilan kendaraan, pembayaran minimum kartu kredit, paylater, dan pinjol."
              :format="formatRupiah"
              accent="rose"
            />
          </div>
        </AppCard>

        <AppCard title="Jangan lupa dihitung" icon="🧾">
          <ul class="space-y-2 text-sm text-ink-600 dark:text-ink-300">
            <li v-for="d in ['KPR atau cicilan properti', 'Cicilan kendaraan', 'Pembayaran minimum kartu kredit', 'Paylater (Shopee, Gopay, dll)', 'Pinjaman online', 'Pinjaman koperasi atau kantor']" :key="d" class="flex gap-2.5">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
              <span>{{ d }}</span>
            </li>
          </ul>
          <p class="hint mt-3">
            Paylater paling sering terlewat padahal bunganya biasanya paling mahal.
          </p>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard :tone="result.level">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">Debt Service Ratio</h2>
              <StatusPill :level="result.level" :label="zone.label" size="sm" />
            </div>
          </template>

          <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <ScoreGauge
              :score="gaugeScore"
              :level="result.level"
              :size="190"
              :label="formatPercent(result.ratio)"
            />

            <div class="min-w-0 flex-1 space-y-3 text-center sm:text-left">
              <div>
                <p class="text-lg font-extrabold text-ink-900 dark:text-white">
                  {{ zone.emoji }} {{ zone.headline }}
                </p>
                <p class="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                  {{ zone.message }}
                </p>
              </div>
              <p class="hint">
                Dari penghasilan {{ formatRupiah(p.monthlyIncome) }}, sebesar
                {{ formatRupiah(p.monthlyDebt) }} habis untuk cicilan.
              </p>
            </div>
          </div>
        </AppCard>

        <!-- Skala zona -->
        <AppCard title="Posisimu di skala DSR" icon="📏">
          <div class="space-y-3">
            <div class="relative h-9 overflow-hidden rounded-xl">
              <div class="absolute inset-0 flex">
                <div class="h-full bg-emerald-500/85" style="width: 50%" />
                <div class="h-full bg-amber-500/85" style="width: 33.333%" />
                <div class="h-full bg-rose-500/85" style="width: 16.667%" />
              </div>
              <!-- Penanda posisi, skala 0-60% -->
              <div
                class="absolute top-0 h-full w-1 bg-ink-950 shadow-lg transition-[left] duration-500 dark:bg-white"
                :style="{ left: `${Math.min(99, (result.ratio / 60) * 100)}%` }"
                aria-hidden="true"
              />
            </div>
            <div class="flex justify-between text-[0.7rem] font-bold text-ink-400">
              <span>0%</span>
              <span>{{ DSR_SAFE_LIMIT }}%</span>
              <span>{{ DSR_WARN_LIMIT }}%</span>
              <span>60%+</span>
            </div>
            <div class="grid gap-2 sm:grid-cols-3">
              <p class="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                🟢 ≤30% — Aman
              </p>
              <p class="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                🟡 31–50% — Waspada
              </p>
              <p class="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
                🔴 >50% — Berisiko
              </p>
            </div>
          </div>
        </AppCard>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard title="Komposisi penghasilan" icon="🍩">
            <DonutChart
              :slices="donutSlices"
              :size="170"
              center-label="Cicilan"
              :center-value="formatPercent(result.ratio)"
            />
          </AppCard>

          <div class="space-y-4">
            <ResultStat
              label="Sisa kuota cicilan aman"
              :value="formatRupiah(result.headroom)"
              :tone="result.headroom > 0 ? 'safe' : 'danger'"
              :caption="
                result.headroom > 0
                  ? 'Plafon maksimal kalau kamu benar-benar perlu cicilan baru. Tidak wajib dipakai.'
                  : 'Kamu sudah melewati batas aman. Sebaiknya tidak menambah cicilan apa pun.'
              "
              tooltip="Selisih antara batas aman 30% penghasilan dan cicilan yang sudah berjalan."
            />

            <ResultStat
              label="Sisa penghasilan setelah cicilan"
              :value="formatRupiah(result.takeHome)"
              tone="brand"
              size="sm"
              caption="Uang yang tersedia untuk biaya hidup dan tabungan."
            />
          </div>
        </div>

        <!-- Batas nominal -->
        <AppCard title="Batas nominal untukmu" icon="🚧">
          <ul class="space-y-3">
            <li
              v-for="s in scenarios"
              :key="s.label"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-200
                px-3.5 py-3 dark:border-white/10"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-ink-900 dark:text-white">{{ s.label }}</p>
                <p class="hint">Total cicilan maksimal {{ formatRupiah(s.amount) }}</p>
              </div>
              <StatusPill
                :level="s.headroom >= 0 ? 'safe' : 'danger'"
                :label="
                  s.headroom >= 0
                    ? `Sisa ${formatRupiah(s.headroom)}`
                    : `Lewat ${formatRupiah(Math.abs(s.headroom))}`
                "
                size="sm"
              />
            </li>
          </ul>
        </AppCard>

        <!-- Langkah lanjut -->
        <AppCard
          v-if="result.level !== 'safe'"
          tone="warn"
          title="Langkah berikutnya"
          icon="🧭"
        >
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Kelebihan cicilan di atas batas aman:
              <strong class="tnum font-bold text-rose-600 dark:text-rose-400">
                {{ formatRupiah(result.overLimit) }}
              </strong>
              per bulan. Menurunkan angka ini akan langsung melonggarkan arus kasmu.
            </p>
            <div class="flex flex-wrap gap-2">
              <RouterLink to="/bebas-utang" class="btn-primary">
                Susun rencana bebas utang →
              </RouterLink>
              <RouterLink to="/anggaran" class="btn-ghost">Tinjau anggaran →</RouterLink>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
