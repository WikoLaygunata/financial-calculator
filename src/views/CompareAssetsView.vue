<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import {
  ASSET_PRESETS,
  ASSUMPTIONS_NOTE,
  ASSUMPTIONS_REVIEWED,
  projectInvestment,
} from '@/utils/finance'
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

const mod = getModule('bandingkan-aset')
const c = state.compare

const MAX_SELECTED = 4

const formatYears = (v) => `${v} tahun`

const isSelected = (key) => c.selected.includes(key)

function toggleAsset(key) {
  if (isSelected(key)) {
    // Sisakan minimal satu aset supaya grafiknya tetap ada isinya.
    if (c.selected.length > 1) c.selected = c.selected.filter((k) => k !== key)
    return
  }
  if (c.selected.length >= MAX_SELECTED) return
  c.selected = [...c.selected, key]
}

const selectedAssets = computed(() =>
  // Urutkan mengikuti ASSET_PRESETS supaya legend konsisten dari rendah ke tinggi.
  ASSET_PRESETS.filter((a) => c.selected.includes(a.value)),
)

const projections = computed(() =>
  selectedAssets.value.map((asset) => {
    const proj = projectInvestment({
      initial: c.initial,
      monthly: c.monthly,
      annualReturnPct: asset.returnPct,
      years: c.years,
    })
    return { ...asset, ...proj }
  }),
)

const totalContributed = computed(
  () => c.initial + c.monthly * Math.round(c.years * 12),
)

const chart = computed(() => {
  if (!projections.value.length) return { labels: [], series: [] }
  const reference = projections.value[0].yearlySeries

  return {
    labels: reference.map((pt) => (pt.year === 0 ? 'Mulai' : `Th ${Math.round(pt.year)}`)),
    series: projections.value.map((proj) => ({
      name: `${proj.label} (${formatPercent(proj.returnPct, 1)})`,
      color: proj.color,
      values: proj.yearlySeries.map((pt) => pt.balance),
    })),
  }
})

/** Selisih antara aset terbaik dan terburuk dari yang dipilih. */
const spread = computed(() => {
  if (projections.value.length < 2) return null
  const sorted = [...projections.value].sort((a, b) => b.finalBalance - a.finalBalance)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]
  return {
    best,
    worst,
    diff: best.finalBalance - worst.finalBalance,
    ratio: best.finalBalance / Math.max(1, worst.finalBalance),
    returnGap: best.returnPct - worst.returnPct,
  }
})

const RISK_LEVEL = {
  'Sangat rendah': 'safe',
  Rendah: 'safe',
  Sedang: 'warn',
  Tinggi: 'danger',
}
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['bandingkan-aset']"
    route-name="bandingkan-aset"
  >
    <div class="space-y-5">
      <!-- Pilih aset -->
      <AppCard
        title="Pilih instrumen yang mau dibandingkan"
        icon="✅"
        :subtitle="`Pilih hingga ${MAX_SELECTED} instrumen. Terpilih: ${c.selected.length}.`"
      >
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            v-for="asset in ASSET_PRESETS"
            :key="asset.value"
            type="button"
            class="flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-left transition"
            :class="
              isSelected(asset.value)
                ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500/20 dark:bg-brand-500/10'
                : 'border-ink-200 hover:border-brand-300 hover:bg-ink-50 dark:border-white/10 dark:hover:bg-white/5'
            "
            :aria-pressed="isSelected(asset.value)"
            :disabled="!isSelected(asset.value) && c.selected.length >= MAX_SELECTED"
            @click="toggleAsset(asset.value)"
          >
            <span
              class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 text-[0.6rem] font-bold text-white transition"
              :class="
                isSelected(asset.value)
                  ? 'border-transparent'
                  : 'border-ink-300 dark:border-white/25'
              "
              :style="isSelected(asset.value) ? { backgroundColor: asset.color } : {}"
              aria-hidden="true"
            >
              {{ isSelected(asset.value) ? '✓' : '' }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-sm font-bold text-ink-900 dark:text-white">
                {{ asset.label }}
              </span>
              <span class="mt-0.5 flex flex-wrap items-center gap-2">
                <span class="tnum text-xs font-bold" :style="{ color: asset.color }">
                  ~{{ formatPercent(asset.returnPct, 1) }}/th
                </span>
                <StatusPill
                  :level="RISK_LEVEL[asset.risk] ?? 'default'"
                  :label="`Risiko ${asset.risk.toLowerCase()}`"
                  size="sm"
                  :dot="false"
                />
              </span>
            </span>
          </button>
        </div>
        <div
          class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-ink-50 px-3.5 py-2.5
            dark:bg-white/5"
        >
          <StatusPill level="default" label="Asumsi" size="sm" :dot="false" />
          <p class="hint min-w-0 flex-1">
            {{ ASSUMPTIONS_NOTE }} Terakhir ditinjau
            <strong class="font-bold text-ink-600 dark:text-ink-300">
              {{ ASSUMPTIONS_REVIEWED }} </strong
            >. Cocokkan ulang dengan data terbaru dari penerbit instrumennya sebelum mengambil
            keputusan.
          </p>
        </div>
      </AppCard>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <!-- Kontrol -->
        <AppCard title="Skenario setoran" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="c.initial"
              v-bind="RANGE.lumpSum"
              label="Modal awal"
              :format="formatRupiahCompact"
              accent="brand"
              :presets="PRESETS.lumpSumCompare"
            />

            <SliderField
              v-model="c.monthly"
              v-bind="RANGE.monthlyDeposit"
              label="Setoran rutin bulanan"
              :format="formatRupiah"
              accent="emerald"
              :presets="PRESETS.monthlyDepositCompare"
            />

            <SliderField
              v-model="c.years"
              v-bind="RANGE.years"
              label="Jangka waktu"
              :format="formatYears"
              accent="sky"
              hint="Perpanjang dan lihat bagaimana selisihnya melebar"
              :presets="PRESETS.years"
            />

            <div class="rounded-xl bg-ink-50 p-3.5 dark:bg-white/5">
              <p class="hint">Total uang yang kamu setorkan</p>
              <p class="tnum mt-1 text-lg font-extrabold text-ink-900 dark:text-white">
                {{ formatRupiahCompact(totalContributed) }}
              </p>
              <p class="hint mt-1">
                Sama untuk semua instrumen. Yang membedakan hasil akhirnya hanya tingkat
                pertumbuhannya.
              </p>
            </div>
          </div>
        </AppCard>

        <!-- Hasil -->
        <div class="min-w-0 space-y-5">
          <AppCard
            v-if="chart.series.length"
            title="Perbandingan pertumbuhan"
            icon="📈"
            subtitle="Arahkan kursor ke grafik untuk membandingkan angka di tahun yang sama."
          >
            <LineChart
              :series="chart.series"
              :labels="chart.labels"
              :height="340"
              :format-value="formatRupiahCompact"
              :format-tooltip-value="formatRupiah"
              :max-x-labels="9"
            />
          </AppCard>

          <!-- Tabel hasil -->
          <AppCard title="Hasil akhir tiap instrumen" icon="🏁" :padded="false">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b divide-line text-left">
                    <th class="px-5 py-3 text-xs font-bold tracking-wide text-ink-400 uppercase">
                      Instrumen
                    </th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                      Saldo akhir
                    </th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                      Pertumbuhan
                    </th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">
                      Kelipatan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="proj in [...projections].sort((a, b) => b.finalBalance - a.finalBalance)"
                    :key="proj.value"
                    class="border-b divide-line last:border-0"
                  >
                    <td class="px-5 py-3">
                      <span class="flex items-center gap-2.5">
                        <span
                          class="size-2.5 shrink-0 rounded-full"
                          :style="{ backgroundColor: proj.color }"
                          aria-hidden="true"
                        />
                        <span class="min-w-0">
                          <span class="block font-semibold text-ink-800 dark:text-ink-100">
                            {{ proj.label }}
                          </span>
                          <span class="hint">
                            {{ formatPercent(proj.returnPct, 1) }}/th · risiko
                            {{ proj.risk.toLowerCase() }}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td class="tnum px-5 py-3 text-right font-bold text-ink-900 dark:text-white">
                      {{ formatRupiahCompact(proj.finalBalance) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {{ formatRupiahCompact(proj.totalGrowth) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right text-ink-600 dark:text-ink-300">
                      {{ formatDecimal(proj.finalBalance / Math.max(1, totalContributed), 2) }}x
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </AppCard>

          <!-- Selisih -->
          <AppCard v-if="spread" tone="brand" title="Seberapa besar bedanya?" icon="🔍">
            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <ResultStat
                  label="Selisih tertinggi vs terendah"
                  :value="formatRupiahCompact(spread.diff)"
                  tone="brand"
                  :caption="`${spread.best.label} vs ${spread.worst.label}`"
                />
                <ResultStat
                  label="Perbandingan hasil"
                  :value="`${formatDecimal(spread.ratio, 2)}x`"
                  tone="safe"
                  :caption="`Dari beda return hanya ${formatPercent(spread.returnGap, 1)} per tahun`"
                />
              </div>

              <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                Beda return {{ formatPercent(spread.returnGap, 1) }} per tahun terdengar kecil, tapi
                setelah {{ c.years }} tahun selisihnya jadi
                {{ formatRupiahCompact(spread.diff) }}. Ini efek bunga berbunga yang bekerja pada
                selisih — dan alasan kenapa memilih instrumen yang tepat untuk jangka panjang penting.
              </p>

              <p class="hint">
                Tapi ingat: {{ spread.best.label }} punya risiko
                {{ spread.best.risk.toLowerCase() }}. Nilainya bisa turun tajam di tahun tertentu.
                Kalau uang itu kamu butuhkan dalam waktu dekat, potensi return tinggi tidak ada artinya.
              </p>
            </div>
          </AppCard>

          <AppCard tone="warn" title="Yang belum dihitung di sini" icon="⚠️">
            <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              <ul class="space-y-1.5">
                <li class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>
                    Biaya: pajak, biaya beli/jual, dan biaya pengelolaan reksadana yang memotong hasil
                    setiap tahun.
                  </span>
                </li>
                <li class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>
                    Volatilitas: grafik ini mulus, pasar nyata zig-zag. Urutan tahun untung dan rugi
                    berpengaruh besar kalau kamu menarik dana di tengah jalan.
                  </span>
                </li>
                <li class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>
                    Inflasi: saldo akhir masih dalam nominal. Daya belinya lebih kecil dari yang
                    terlihat.
                  </span>
                </li>
              </ul>
              <div class="flex flex-wrap gap-2 pt-1">
                <RouterLink to="/inflasi" class="btn-ghost">Lihat efek inflasi →</RouterLink>
                <RouterLink to="/rebalancing" class="btn-ghost">Atur porsi portofolio →</RouterLink>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </ModuleLayout>
</template>
