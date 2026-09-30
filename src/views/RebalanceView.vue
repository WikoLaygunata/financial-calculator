<script setup>
import { computed } from 'vue'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { rebalancePortfolio } from '@/utils/finance'
import { MAX, PRESETS, RANGE } from '@/data/limits'
import { formatPercent, formatRupiah, formatRupiahCompact } from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ToggleField from '@/components/ui/ToggleField.vue'
import CurrencyField from '@/components/ui/CurrencyField.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const mod = getModule('rebalancing')
const rb = state.rebalance

const targetSum = computed(() => rb.assets.reduce((s, a) => s + Number(a.targetPct || 0), 0))

const result = computed(() => rebalancePortfolio(rb.assets, rb.freshMoney, rb.allowSell))

const actions = computed(() => result.value.rows.filter((r) => r.action !== 'hold'))

/** Aset dengan penyimpangan terbesar dari target — biasanya yang paling perlu diperhatikan. */
const maxDrift = computed(() => {
  if (!result.value.rows.length) return 0
  return Math.max(
    ...result.value.rows.map((r) => Math.abs(r.currentPct - r.normalizedTarget)),
  )
})

const driftStatus = computed(() => {
  if (result.value.currentTotal <= 0) return { level: 'default', label: 'Belum ada data' }
  if (maxDrift.value <= 2) return { level: 'safe', label: 'Masih rapi' }
  if (maxDrift.value <= 5) return { level: 'warn', label: 'Mulai bergeser' }
  return { level: 'danger', label: 'Perlu dirapikan' }
})

const currentSlices = computed(() =>
  result.value.rows.map((r) => ({ label: r.label, value: r.currentValue, color: r.color })),
)

const targetSlices = computed(() =>
  result.value.rows.map((r) => ({ label: r.label, value: r.idealValue, color: r.color })),
)

function normalizeTargets() {
  const sum = targetSum.value
  if (sum <= 0) return
  rb.assets.forEach((a) => {
    a.targetPct = Math.round((Number(a.targetPct || 0) / sum) * 100)
  })
  // Bulatkan sisa ke aset pertama supaya totalnya benar-benar 100%.
  const newSum = rb.assets.reduce((s, a) => s + Number(a.targetPct || 0), 0)
  if (newSum !== 100 && rb.assets.length) {
    rb.assets[0].targetPct += 100 - newSum
  }
}

const ACTION_STYLE = {
  buy: {
    level: 'safe',
    label: 'Beli',
    verb: 'Beli',
    className: 'text-emerald-600 dark:text-emerald-400',
  },
  sell: {
    level: 'danger',
    label: 'Jual',
    verb: 'Jual',
    className: 'text-rose-600 dark:text-rose-400',
  },
  hold: { level: 'default', label: 'Diamkan', verb: 'Diamkan', className: 'text-ink-500' },
}
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.rebalancing"
    route-name="rebalancing"
  >
    <div class="space-y-5">
      <!-- Portofolio -->
      <AppCard
        title="Portofoliomu"
        icon="📋"
        subtitle="Isi target alokasi ideal dan nilai riil tiap aset saat ini."
      >
        <template #actions>
          <button
            v-if="targetSum !== 100"
            type="button"
            class="btn-ghost !py-2 !text-xs"
            @click="normalizeTargets()"
          >
            Sesuaikan ke 100%
          </button>
        </template>

        <div class="space-y-3">
          <div class="hidden gap-3 px-1 lg:grid lg:grid-cols-[minmax(0,1fr)_8rem_11rem_6rem]">
            <span class="section-title">Aset</span>
            <span class="section-title">Target %</span>
            <span class="section-title">Nilai sekarang</span>
            <span class="section-title text-right">Porsi riil</span>
          </div>

          <div
            v-for="asset in rb.assets"
            :key="asset.key"
            class="grid gap-3 rounded-xl border border-ink-200 p-3.5
              lg:grid-cols-[minmax(0,1fr)_8rem_11rem_6rem] lg:items-center lg:border-0 lg:border-b
              lg:divide-line lg:p-1 lg:pb-3.5 dark:border-white/10"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="size-3 shrink-0 rounded-full"
                :style="{ backgroundColor: asset.color }"
                aria-hidden="true"
              />
              <span class="min-w-0 truncate text-sm font-bold text-ink-900 dark:text-white">
                {{ asset.label }}
              </span>
            </div>

            <div class="space-y-1.5">
              <label class="label lg:hidden" :for="`target-${asset.key}`">Target %</label>
              <div class="relative">
                <input
                  :id="`target-${asset.key}`"
                  v-model.number="asset.targetPct"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  class="field tnum py-2 pr-8"
                />
                <span
                  class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-ink-400"
                >
                  %
                </span>
              </div>
            </div>

            <div>
              <label class="label lg:hidden">Nilai sekarang</label>
              <CurrencyField v-model="asset.currentValue" compact :max="MAX.assetValue" />
            </div>

            <div class="text-left lg:text-right">
              <span class="label lg:hidden">Porsi riil: </span>
              <span
                class="tnum text-sm font-bold"
                :class="
                  Math.abs(
                    (result.rows.find((r) => r.key === asset.key)?.currentPct ?? 0) -
                      (result.rows.find((r) => r.key === asset.key)?.normalizedTarget ?? 0),
                  ) > 5
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-ink-700 dark:text-ink-200'
                "
              >
                {{ formatPercent(result.rows.find((r) => r.key === asset.key)?.currentPct ?? 0) }}
              </span>
            </div>
          </div>

          <div
            v-if="targetSum !== 100"
            class="rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs leading-relaxed text-amber-800
              dark:bg-amber-500/10 dark:text-amber-200"
          >
            ⚠️ Total target alokasimu {{ formatPercent(targetSum, 0) }}, bukan 100%. Perhitungan tetap
            jalan karena angkanya dinormalisasi otomatis, tapi lebih rapi kalau dibuat pas 100%.
          </div>
        </div>
      </AppCard>

      <div class="grid gap-5 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <!-- Kontrol -->
        <div class="space-y-5">
          <AppCard title="Dana baru & metode" icon="🎛️">
            <div class="space-y-6">
              <SliderField
                v-model="rb.freshMoney"
                v-bind="RANGE.freshMoney"
                label="Dana baru bulan ini"
                tooltip="Uang segar yang siap kamu setorkan. Dana ini akan diarahkan ke aset yang porsinya paling tertinggal."
                :format="formatRupiah"
                accent="emerald"
                :presets="PRESETS.freshMoney"
              />

              <ToggleField
                v-model="rb.allowSell"
                label="Boleh menjual aset"
                tooltip="Kalau nonaktif, aplikasi hanya membagikan dana baru tanpa menyuruhmu menjual apa pun."
                description="Aktifkan kalau kamu mau porsinya langsung pas. Nonaktif = mode beli saja, lebih hemat pajak dan biaya."
              />

              <div class="rounded-xl bg-ink-50 p-3.5 dark:bg-white/5">
                <p class="hint">Mode aktif</p>
                <p class="mt-1 text-sm font-bold text-ink-900 dark:text-white">
                  {{ rb.allowSell ? 'Rebalancing penuh (beli & jual)' : 'Beli saja (tanpa jual)' }}
                </p>
                <p class="hint mt-1.5">
                  {{
                    rb.allowSell
                      ? 'Porsi langsung kembali pas ke target, tapi penjualan bisa menimbulkan pajak dan biaya transaksi.'
                      : 'Lebih lambat mencapai target, tapi tidak ada biaya jual. Cukup untuk kebanyakan orang yang masih rutin menyetor.'
                  }}
                </p>
              </div>
            </div>
          </AppCard>

          <AppCard title="Ringkasan portofolio" icon="📊">
            <dl class="space-y-2.5 text-sm">
              <div class="flex items-center justify-between gap-3">
                <dt class="text-ink-500 dark:text-ink-400">Nilai sekarang</dt>
                <dd class="tnum font-bold text-ink-900 dark:text-white">
                  {{ formatRupiah(result.currentTotal) }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3">
                <dt class="text-ink-500 dark:text-ink-400">Dana baru</dt>
                <dd class="tnum font-bold text-emerald-600 dark:text-emerald-400">
                  + {{ formatRupiah(result.fresh) }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 border-t divide-line pt-2.5">
                <dt class="font-bold text-ink-700 dark:text-ink-200">Total setelah setoran</dt>
                <dd class="tnum font-extrabold text-ink-900 dark:text-white">
                  {{ formatRupiah(result.futureTotal) }}
                </dd>
              </div>
            </dl>
          </AppCard>
        </div>

        <!-- Hasil -->
        <div class="space-y-5">
          <AppCard :tone="driftStatus.level">
            <template #header>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-bold text-ink-900 dark:text-white">
                  Instruksi aksi untukmu
                </h2>
                <StatusPill :level="driftStatus.level" :label="driftStatus.label" size="sm" />
              </div>
            </template>

            <div v-if="result.currentTotal <= 0 && result.fresh <= 0" class="py-4 text-center">
              <p class="text-sm font-semibold text-ink-600 dark:text-ink-300">
                Isi nilai aset atau dana baru dulu.
              </p>
              <p class="hint mt-1">
                Perhitungan butuh setidaknya satu angka untuk bisa memberi instruksi.
              </p>
            </div>

            <div v-else-if="!actions.length" class="py-4 text-center">
              <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✅ Portofoliomu sudah sesuai target.
              </p>
              <p class="hint mt-1">
                Tidak ada aksi yang perlu dilakukan. Cek lagi setelah beberapa bulan, atau saat ada
                porsi yang menyimpang lebih dari 5%.
              </p>
            </div>

            <ul v-else class="space-y-2.5">
              <li
                v-for="row in actions"
                :key="row.key"
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
                :class="
                  row.action === 'buy'
                    ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10'
                    : 'border-rose-200 bg-rose-50 dark:border-rose-400/25 dark:bg-rose-500/10'
                "
              >
                <div class="flex min-w-0 items-center gap-3">
                  <span
                    class="size-3 shrink-0 rounded-full"
                    :style="{ backgroundColor: row.color }"
                    aria-hidden="true"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-ink-900 dark:text-white">
                      {{ ACTION_STYLE[row.action].verb }} {{ row.label }} sebesar
                      <span class="tnum" :class="ACTION_STYLE[row.action].className">
                        {{ formatRupiah(row.amount) }}
                      </span>
                    </p>
                    <p class="hint">
                      Porsi {{ formatPercent(row.currentPct) }} → target
                      {{ formatPercent(row.normalizedTarget) }}
                    </p>
                  </div>
                </div>
                <StatusPill
                  :level="ACTION_STYLE[row.action].level"
                  :label="ACTION_STYLE[row.action].label"
                  size="sm"
                />
              </li>

              <li
                v-if="result.leftover > 1000"
                class="rounded-xl bg-ink-50 px-3.5 py-2.5 text-xs leading-relaxed text-ink-600
                  dark:bg-white/5 dark:text-ink-300"
              >
                Sisa dana yang belum teralokasi: {{ formatRupiah(result.leftover) }}. Ini terjadi
                karena semua aset sudah mencapai porsi idealnya.
              </li>
            </ul>
          </AppCard>

          <!-- Sebelum vs sesudah -->
          <div class="grid gap-5 sm:grid-cols-2">
            <AppCard title="Porsi sekarang" icon="📍">
              <DonutChart
                v-if="result.currentTotal > 0"
                :slices="currentSlices"
                :size="170"
                center-label="Total"
                :center-value="formatRupiahCompact(result.currentTotal)"
                :format-value="formatRupiahCompact"
              />
              <p v-else class="hint py-8 text-center">Belum ada nilai aset yang diisi.</p>
            </AppCard>

            <AppCard title="Porsi ideal" icon="🎯">
              <DonutChart
                v-if="result.futureTotal > 0"
                :slices="targetSlices"
                :size="170"
                center-label="Total"
                :center-value="formatRupiahCompact(result.futureTotal)"
                :format-value="formatRupiahCompact"
              />
              <p v-else class="hint py-8 text-center">Isi target alokasi dan nilai aset dulu.</p>
            </AppCard>
          </div>

          <!-- Tabel rinci -->
          <AppCard title="Rincian per aset" icon="🔍" :padded="false">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b divide-line text-left">
                    <th class="px-5 py-3 text-xs font-bold tracking-wide text-ink-400 uppercase">Aset</th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Sekarang</th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Ideal</th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Selisih</th>
                    <th class="px-5 py-3 text-right text-xs font-bold tracking-wide text-ink-400 uppercase">Setelah aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in result.rows" :key="row.key" class="border-b divide-line last:border-0">
                    <td class="px-5 py-3">
                      <span class="flex items-center gap-2.5">
                        <span
                          class="size-2.5 shrink-0 rounded-full"
                          :style="{ backgroundColor: row.color }"
                          aria-hidden="true"
                        />
                        <span class="min-w-0">
                          <span class="block font-semibold text-ink-800 dark:text-ink-100">
                            {{ row.label }}
                          </span>
                          <span class="hint">Target {{ formatPercent(row.normalizedTarget) }}</span>
                        </span>
                      </span>
                    </td>
                    <td class="tnum px-5 py-3 text-right text-ink-700 dark:text-ink-200">
                      {{ formatRupiahCompact(row.currentValue) }}
                      <span class="block text-[0.7rem] text-ink-400">
                        {{ formatPercent(row.currentPct) }}
                      </span>
                    </td>
                    <td class="tnum px-5 py-3 text-right text-ink-700 dark:text-ink-200">
                      {{ formatRupiahCompact(row.idealValue) }}
                    </td>
                    <td
                      class="tnum px-5 py-3 text-right font-semibold"
                      :class="
                        row.gap > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : row.gap < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-ink-400'
                      "
                    >
                      {{ row.gap >= 0 ? '+' : '−' }}{{ formatRupiahCompact(Math.abs(row.gap)) }}
                    </td>
                    <td class="tnum px-5 py-3 text-right font-bold text-ink-900 dark:text-white">
                      {{ formatRupiahCompact(row.finalValue) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="border-t divide-line px-5 py-4">
              <p class="hint">
                Kolom "Ideal" dihitung dari total portofolio setelah dana baru masuk
                ({{ formatRupiah(result.futureTotal) }}) dikali target alokasi masing-masing aset.
              </p>
            </div>
          </AppCard>
        </div>
      </div>
    </div>
  </ModuleLayout>
</template>
