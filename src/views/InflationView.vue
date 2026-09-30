<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { ASSUMPTIONS_REVIEWED, inflationImpact } from '@/utils/finance'
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
import LineChart from '@/components/charts/LineChart.vue'

const mod = getModule('inflasi')
const inf = state.inflation

const result = computed(() =>
  inflationImpact({
    amount: inf.amount,
    inflationPct: inf.inflationPct,
    years: inf.years,
  }),
)

const chart = computed(() => ({
  labels: result.value.series.map((s) => (s.year === 0 ? 'Sekarang' : `+${Math.round(s.year)} th`)),
  series: [
    {
      name: 'Harga barang yang sama',
      color: '#e11d48',
      values: result.value.series.map((s) => s.futureCost),
      area: true,
    },
    {
      name: 'Daya beli uangmu kalau didiamkan',
      color: '#0ea5e9',
      values: result.value.series.map((s) => s.purchasingPower),
      area: true,
    },
  ],
}))

/** Perbandingan: uang didiamkan vs ditaruh di beberapa instrumen. */
const comparisons = computed(() => {
  const years = inf.years
  const grow = (rate) => inf.amount * Math.pow(1 + rate / 100, years)
  const futureCost = result.value.futureCost

  return [
    { label: 'Didiamkan di rumah', rate: 0, color: '#e11d48' },
    { label: 'Tabungan biasa', rate: 1, color: '#f59e0b' },
    { label: 'Deposito', rate: 3.5, color: '#64748b' },
    { label: 'Reksadana pasar uang', rate: 5, color: '#0ea5e9' },
    { label: 'Obligasi negara', rate: 6.2, color: '#14b8a6' },
    { label: 'Index fund / saham', rate: 11, color: '#6366f1' },
  ].map((c) => {
    const nominal = grow(c.rate)
    return {
      ...c,
      nominal,
      // Menang kalau pertumbuhannya mengejar kenaikan harga.
      beatsInflation: nominal >= futureCost,
      realGainPct: (nominal / futureCost - 1) * 100,
    }
  })
})

const formatYears = (v) => `${v} tahun`
const formatRatePercent = (v) => formatPercent(v, 2)

const halvingYears = computed(() => {
  const rate = Math.max(0.01, inf.inflationPct) / 100
  // Berapa tahun sampai daya beli tinggal separuh.
  return Math.log(2) / Math.log(1 + rate)
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.inflasi"
    route-name="inflasi"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Atur skenario" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="inf.amount"
              v-bind="RANGE.inflationAmount"
              label="Nominal uang atau harga barang"
              :format="formatRupiahCompact"
              accent="brand"
              :presets="PRESETS.inflationAmount"
            />

            <SliderField
              v-model="inf.inflationPct"
              v-bind="RANGE.inflationPct"
              label="Asumsi inflasi per tahun"
              tooltip="Inflasi umum Indonesia sekitar 3-4%. Tapi biaya pendidikan dan kesehatan naik jauh lebih cepat."
              :format="formatRatePercent"
              accent="rose"
              :presets="PRESETS.inflationSector"
            />

            <SliderField
              v-model="inf.years"
              v-bind="RANGE.years"
              label="Jangka waktu"
              :format="formatYears"
              accent="sky"
              :presets="PRESETS.years"
            />
          </div>
        </AppCard>

        <AppCard title="Inflasi tidak seragam" icon="📌">
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Angka inflasi resmi adalah rata-rata dari banyak barang. Pos pengeluaran tertentu naik
              jauh lebih cepat:
            </p>
            <ul class="space-y-1.5">
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
                <span>Inflasi umum sekitar 3–4% per tahun.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                <span>Biaya pendidikan sering 8–12% per tahun.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                <span>Biaya kesehatan umumnya di atas 10% per tahun.</span>
              </li>
            </ul>
            <p class="hint">
              Merencanakan dana pendidikan anak dengan asumsi inflasi umum adalah kesalahan yang mahal.
              Coba geser slider ke 10% dan lihat bedanya.
            </p>
          </div>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard tone="danger" title="Harga di masa depan" icon="📈">
            <div class="space-y-3">
              <div>
                <p class="hint">
                  Barang yang hari ini seharga {{ formatRupiahCompact(inf.amount) }}, dalam
                  {{ inf.years }} tahun jadi
                </p>
                <p class="tnum mt-1.5 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
                  {{ formatRupiahCompact(result.futureCost) }}
                </p>
                <p class="hint mt-1">{{ formatRupiah(result.futureCost) }}</p>
              </div>
              <p class="hint">
                Naik {{ formatDecimal(result.factor, 2) }}x dari harga sekarang. Angka inilah yang
                harus kamu pakai saat merencanakan target jangka panjang.
              </p>
            </div>
          </AppCard>

          <AppCard tone="warn" title="Daya beli uangmu" icon="📉">
            <div class="space-y-3">
              <div>
                <p class="hint">
                  Kalau {{ formatRupiahCompact(inf.amount) }} hanya didiamkan selama
                  {{ inf.years }} tahun, nilainya tinggal
                </p>
                <p class="tnum mt-1.5 text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {{ formatRupiahCompact(result.purchasingPower) }}
                </p>
                <p class="hint mt-1">dalam nilai uang hari ini</p>
              </div>
              <p class="hint">
                Nominalnya tetap, tapi daya belinya hilang
                {{ formatRupiahCompact(result.lostValue) }}
                ({{ formatPercent(result.lostPct) }}). Uangnya tidak dicuri siapa pun — hanya
                tergerus perlahan.
              </p>
            </div>
          </AppCard>
        </div>

        <AppCard
          title="Dua sisi dari peristiwa yang sama"
          icon="⏳"
          subtitle="Garis merah: harga naik. Garis biru: daya beli turun."
        >
          <LineChart
            :series="chart.series"
            :labels="chart.labels"
            :height="320"
            :format-value="formatRupiahCompact"
            :format-tooltip-value="formatRupiah"
            :max-x-labels="8"
          />
        </AppCard>

        <div class="grid gap-4 sm:grid-cols-3">
          <ResultStat
            label="Return minimum agar tidak kalah"
            :value="formatPercent(result.breakEvenReturnPct, 2)"
            tone="brand"
            size="sm"
            caption="Di bawah ini, daya belimu menyusut"
            tooltip="Investasimu harus tumbuh minimal sebesar inflasi supaya nilai uangmu tidak berkurang."
          />
          <ResultStat
            label="Daya beli tinggal separuh dalam"
            :value="`± ${Math.round(halvingYears)} tahun`"
            tone="warn"
            size="sm"
            caption="Kalau uang hanya didiamkan"
          />
          <ResultStat
            label="Pengali harga"
            :value="`${formatDecimal(result.factor, 2)}x`"
            tone="danger"
            size="sm"
            :caption="`Selama ${inf.years} tahun`"
          />
        </div>

        <!-- Perbandingan instrumen -->
        <AppCard
          title="Mana yang mengalahkan inflasi?"
          icon="🏁"
          :subtitle="`Nilai ${formatRupiahCompact(inf.amount)} setelah ${inf.years} tahun di berbagai tempat.`"
          :padded="false"
        >
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b divide-line text-left">
                  <th class="px-5 py-3 text-xs font-bold tracking-wide text-ink-400 uppercase">
                    Ditaruh di
                  </th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                    Return/th
                  </th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                    Nilai nominal
                  </th>
                  <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                    vs harga barang
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="c in comparisons" :key="c.label" class="border-b divide-line last:border-0">
                  <td class="px-5 py-3">
                    <span class="flex items-center gap-2.5">
                      <span
                        class="size-2.5 shrink-0 rounded-full"
                        :style="{ backgroundColor: c.color }"
                        aria-hidden="true"
                      />
                      <span class="font-semibold text-ink-800 dark:text-ink-100">{{ c.label }}</span>
                    </span>
                  </td>
                  <td class="tnum px-5 py-3 text-right text-ink-600 dark:text-ink-300">
                    {{ formatPercent(c.rate, 1) }}
                  </td>
                  <td class="tnum px-5 py-3 text-right font-bold text-ink-900 dark:text-white">
                    {{ formatRupiahCompact(c.nominal) }}
                  </td>
                  <td class="px-5 py-3 text-right">
                    <span
                      class="tnum text-xs font-bold"
                      :class="
                        c.beatsInflation
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      "
                    >
                      {{ c.beatsInflation ? '✓ Menang ' : '✕ Kalah ' }}
                      {{ formatPercent(Math.abs(c.realGainPct)) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="border-t divide-line px-5 py-4">
            <p class="hint">
              Kolom terakhir membandingkan pertumbuhan uangmu dengan kenaikan harga barang
              ({{ formatRupiahCompact(result.futureCost) }}). "Menang" berarti daya belimu naik,
              "kalah" berarti tetap menyusut meski nominalnya bertambah. Return di sini asumsi
              rata-rata historis, terakhir ditinjau
              <strong class="font-bold text-ink-600 dark:text-ink-300">
                {{ ASSUMPTIONS_REVIEWED }} </strong
              >, dan bukan jaminan.
            </p>
          </div>
        </AppCard>

        <AppCard tone="brand" title="Jadi apa yang perlu dilakukan?" icon="🧭">
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Bukan berarti semua uang harus diinvestasikan. Yang penting membedakan peruntukannya:
            </p>
            <ul class="space-y-1.5">
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                <span>
                  Dana darurat dan kebutuhan jangka dekat: tetap di tabungan atau pasar uang. Di sini
                  keamanan lebih penting daripada mengalahkan inflasi.
                </span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-brand-400" aria-hidden="true" />
                <span>
                  Uang untuk tujuan jangka panjang: tempatkan di instrumen yang secara historis
                  mengalahkan inflasi, sesuaikan risikonya dengan jangka waktunya.
                </span>
              </li>
            </ul>
            <div class="flex flex-wrap gap-2 pt-1">
              <RouterLink to="/bandingkan-aset" class="btn-primary">
                Bandingkan instrumen →
              </RouterLink>
              <RouterLink to="/dca" class="btn-ghost">Simulasi investasi rutin →</RouterLink>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
