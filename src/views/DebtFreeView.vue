<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { addDebt, removeDebt, state } from '@/stores/financeStore'
import { compareDebtStrategies } from '@/utils/finance'
import { MAX, MINOR_SAVING_THRESHOLD, PRESETS, RANGE } from '@/data/limits'
import {
  formatMonthsToHuman,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
  monthsFromNowLabel,
} from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import CurrencyField from '@/components/ui/CurrencyField.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import LineChart from '@/components/charts/LineChart.vue'

const mod = getModule('bebas-utang')
const d = state.debts

const totalPrincipal = computed(() =>
  d.items.reduce((sum, x) => sum + (Number(x.principal) || 0), 0),
)
const totalMinimum = computed(() =>
  d.items.reduce((sum, x) => sum + (Number(x.minPayment) || 0), 0),
)

const comparison = computed(() => compareDebtStrategies(d.items, d.extraPayment))

const snowball = computed(() => comparison.value.snowball)
const avalanche = computed(() => comparison.value.avalanche)

const unresolved = computed(() => snowball.value.unresolved || avalanche.value.unresolved)

/** Grafik sisa utang bulan per bulan untuk kedua strategi. */
const chart = computed(() => {
  const maxLen = Math.max(snowball.value.timeline.length, avalanche.value.timeline.length)
  if (maxLen <= 1) return { labels: [], series: [] }

  const pad = (timeline) => {
    const values = timeline.map((t) => t.balance)
    // Setelah lunas, garisnya tetap di nol supaya kedua strategi bisa dibandingkan sejajar.
    while (values.length < maxLen) values.push(0)
    return values
  }

  return {
    labels: Array.from({ length: maxLen }, (_, i) =>
      i === 0 ? 'Sekarang' : `Bln ${i}`,
    ),
    series: [
      { name: 'Snowball (saldo terkecil dulu)', color: '#0ea5e9', values: pad(snowball.value.timeline) },
      { name: 'Avalanche (bunga tertinggi dulu)', color: '#6366f1', values: pad(avalanche.value.timeline) },
    ],
  }
})

/** Urutan serangan menurut tiap strategi, untuk ditampilkan sebagai daftar aksi. */
const attackOrder = (strategy) =>
  computed(() => {
    const sorted = [...d.items].filter((x) => Number(x.principal) > 0)
    if (strategy === 'avalanche') {
      sorted.sort((a, b) => b.apr - a.apr || a.principal - b.principal)
    } else {
      sorted.sort((a, b) => a.principal - b.principal || b.apr - a.apr)
    }
    return sorted
  })

const snowballOrder = attackOrder('snowball')
const avalancheOrder = attackOrder('avalanche')

const winnerLabel = computed(() => {
  if (comparison.value.winner === 'tie') return 'Hasilnya sama'
  return comparison.value.winner === 'avalanche' ? 'Avalanche lebih hemat' : 'Snowball lebih hemat'
})

const highestApr = computed(() =>
  d.items.reduce((max, x) => (Number(x.apr) > Number(max?.apr ?? -1) ? x : max), null),
)
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['bebas-utang']"
    route-name="bebas-utang"
  >
    <div class="space-y-5">
      <!-- Daftar utang -->
      <AppCard title="Daftar utangmu" icon="📋" subtitle="Isi setiap utang yang masih berjalan.">
        <template #actions>
          <button type="button" class="btn-primary !py-2 !text-xs" @click="addDebt()">
            + Tambah utang
          </button>
        </template>

        <div v-if="!d.items.length" class="py-8 text-center">
          <p class="text-sm font-semibold text-ink-600 dark:text-ink-300">Belum ada utang di daftar.</p>
          <p class="hint mt-1">
            Kalau kamu memang tidak punya utang, itu kabar bagus. Lanjut ke Tahap 2 untuk menyusun
            target.
          </p>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" class="btn-ghost" @click="addDebt()">Tambah utang</button>
            <RouterLink to="/target-impian" class="btn-primary">Susun target →</RouterLink>
          </div>
        </div>

        <div v-else class="space-y-3">
          <!-- Header tabel, hanya di layar lebar -->
          <div
            class="hidden gap-3 px-1 lg:grid lg:grid-cols-[minmax(0,1fr)_9rem_7rem_9rem_2.5rem]"
          >
            <span class="section-title">Nama utang</span>
            <span class="section-title">Sisa pokok</span>
            <span class="section-title">Bunga /tahun</span>
            <span class="section-title">Cicilan minimum</span>
            <span class="sr-only">Aksi</span>
          </div>

          <div
            v-for="item in d.items"
            :key="item.id"
            class="grid gap-3 rounded-xl border border-ink-200 p-3.5 lg:grid-cols-[minmax(0,1fr)_9rem_7rem_9rem_2.5rem]
              lg:items-end lg:border-0 lg:border-b lg:divide-line lg:p-1 lg:pb-3.5 dark:border-white/10"
          >
            <div class="space-y-1.5">
              <label class="label lg:hidden" :for="`name-${item.id}`">Nama utang</label>
              <input
                :id="`name-${item.id}`"
                v-model="item.name"
                type="text"
                class="field"
                placeholder="Mis. Kartu Kredit"
              />
            </div>

            <div>
              <label class="label lg:hidden">Sisa pokok</label>
              <CurrencyField v-model="item.principal" compact :max="MAX.debtPrincipal" />
            </div>

            <div class="space-y-1.5">
              <label class="label lg:hidden" :for="`apr-${item.id}`">Bunga per tahun</label>
              <div class="relative">
                <input
                  :id="`apr-${item.id}`"
                  v-model.number="item.apr"
                  type="number"
                  min="0"
                  max="200"
                  step="0.5"
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
              <label class="label lg:hidden">Cicilan minimum</label>
              <CurrencyField v-model="item.minPayment" compact :max="MAX.debtMinPayment" />
            </div>

            <button
              type="button"
              class="grid size-10 cursor-pointer place-items-center justify-self-end rounded-xl border
                border-rose-200 text-rose-600 transition hover:bg-rose-50
                dark:border-rose-500/25 dark:text-rose-400 dark:hover:bg-rose-500/10"
              :aria-label="`Hapus ${item.name}`"
              @click="removeDebt(item.id)"
            >
              <svg viewBox="0 0 20 20" fill="none" class="size-4">
                <path
                  d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </div>

          <!-- Ringkasan -->
          <div class="grid gap-4 pt-2 sm:grid-cols-3">
            <ResultStat
              label="Total sisa utang"
              :value="formatRupiah(totalPrincipal)"
              tone="danger"
              size="sm"
            />
            <ResultStat
              label="Total cicilan minimum"
              :value="formatRupiah(totalMinimum)"
              tone="warn"
              size="sm"
            />
            <ResultStat
              label="Anggaran serangan bulanan"
              :value="formatRupiah(totalMinimum + d.extraPayment)"
              tone="brand"
              size="sm"
              caption="Minimum + dana ekstra"
            />
          </div>
        </div>
      </AppCard>

      <template v-if="d.items.length">
        <!-- Dana ekstra -->
        <AppCard title="Dana ekstra tiap bulan" icon="⚡">
          <SliderField
            v-model="d.extraPayment"
            v-bind="RANGE.extraPayment"
            label="Tambahan di atas cicilan minimum"
            tooltip="Uang lebih yang kamu siapkan khusus untuk menyerang satu utang prioritas setiap bulan."
            :format="formatRupiah"
            accent="emerald"
            hint="Geser dan perhatikan tanggal bebas utangmu maju"
            :presets="PRESETS.extraPayment"
          />
        </AppCard>

        <!-- Peringatan tidak lunas -->
        <AppCard v-if="unresolved" tone="danger" title="Utang ini tidak akan lunas" icon="🚨">
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Dengan anggaran {{ formatRupiah(totalMinimum + d.extraPayment) }} per bulan, pembayaranmu
              tidak cukup menutup bunga yang tumbuh. Saldo utang justru akan naik walau kamu rajin
              membayar.
            </p>
            <ul class="space-y-1.5">
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                <span>Naikkan dana ekstra sampai peringatan ini hilang.</span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                <span>
                  Hubungi pemberi pinjaman untuk membahas restrukturisasi — memperpanjang tenor atau
                  menurunkan bunga. Ini jauh lebih baik daripada menunggu gagal bayar.
                </span>
              </li>
              <li class="flex gap-2.5">
                <span class="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                <span>Hindari mengambil pinjaman baru untuk menutup pinjaman lama.</span>
              </li>
            </ul>
          </div>
        </AppCard>

        <template v-else>
          <!-- Perbandingan strategi -->
          <div class="grid gap-5 lg:grid-cols-2">
            <AppCard
              :tone="comparison.winner === 'snowball' ? 'safe' : 'default'"
              title="Debt Snowball"
              icon="❄️"
              subtitle="Serang saldo terkecil lebih dulu"
            >
              <div class="space-y-4">
                <div>
                  <p class="hint">Bebas utang pada</p>
                  <p class="tnum mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">
                    {{ monthsFromNowLabel(snowball.months) }}
                  </p>
                  <p class="hint mt-0.5">{{ formatMonthsToHuman(snowball.months) }} dari sekarang</p>
                </div>

                <div class="grid grid-cols-2 gap-3 border-t divide-line pt-4">
                  <div>
                    <p class="hint">Total bunga dibayar</p>
                    <p class="tnum text-sm font-bold text-rose-600 dark:text-rose-400">
                      {{ formatRupiah(snowball.totalInterest) }}
                    </p>
                  </div>
                  <div>
                    <p class="hint">Total pembayaran</p>
                    <p class="tnum text-sm font-bold text-ink-800 dark:text-ink-100">
                      {{ formatRupiah(snowball.totalPaid) }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2 border-t divide-line pt-4">
                  <p class="section-title">Urutan serangan</p>
                  <ol class="space-y-1.5">
                    <li
                      v-for="(item, i) in snowballOrder"
                      :key="item.id"
                      class="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        class="grid size-5 shrink-0 place-items-center rounded-md bg-sky-100 text-[0.65rem]
                          font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-300"
                      >
                        {{ i + 1 }}
                      </span>
                      <span class="min-w-0 flex-1 truncate font-semibold text-ink-700 dark:text-ink-200">
                        {{ item.name }}
                      </span>
                      <span class="tnum shrink-0 text-xs text-ink-500 dark:text-ink-400">
                        {{ formatRupiahCompact(item.principal) }} · {{ formatPercent(item.apr) }}
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </AppCard>

            <AppCard
              :tone="comparison.winner === 'avalanche' ? 'safe' : 'default'"
              title="Debt Avalanche"
              icon="🏔️"
              subtitle="Serang bunga tertinggi lebih dulu"
            >
              <div class="space-y-4">
                <div>
                  <p class="hint">Bebas utang pada</p>
                  <p class="tnum mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">
                    {{ monthsFromNowLabel(avalanche.months) }}
                  </p>
                  <p class="hint mt-0.5">{{ formatMonthsToHuman(avalanche.months) }} dari sekarang</p>
                </div>

                <div class="grid grid-cols-2 gap-3 border-t divide-line pt-4">
                  <div>
                    <p class="hint">Total bunga dibayar</p>
                    <p class="tnum text-sm font-bold text-rose-600 dark:text-rose-400">
                      {{ formatRupiah(avalanche.totalInterest) }}
                    </p>
                  </div>
                  <div>
                    <p class="hint">Total pembayaran</p>
                    <p class="tnum text-sm font-bold text-ink-800 dark:text-ink-100">
                      {{ formatRupiah(avalanche.totalPaid) }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2 border-t divide-line pt-4">
                  <p class="section-title">Urutan serangan</p>
                  <ol class="space-y-1.5">
                    <li
                      v-for="(item, i) in avalancheOrder"
                      :key="item.id"
                      class="flex items-center gap-2.5 text-sm"
                    >
                      <span
                        class="grid size-5 shrink-0 place-items-center rounded-md bg-brand-100 text-[0.65rem]
                          font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300"
                      >
                        {{ i + 1 }}
                      </span>
                      <span class="min-w-0 flex-1 truncate font-semibold text-ink-700 dark:text-ink-200">
                        {{ item.name }}
                      </span>
                      <span class="tnum shrink-0 text-xs text-ink-500 dark:text-ink-400">
                        {{ formatRupiahCompact(item.principal) }} · {{ formatPercent(item.apr) }}
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </AppCard>
          </div>

          <!-- Kesimpulan -->
          <AppCard tone="brand">
            <template #header>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base font-bold text-ink-900 dark:text-white">Kesimpulan</h2>
                <StatusPill
                  :level="comparison.winner === 'tie' ? 'default' : 'brand'"
                  :label="winnerLabel"
                  size="sm"
                />
              </div>
            </template>

            <div class="space-y-4">
              <div class="grid gap-4 sm:grid-cols-2">
                <ResultStat
                  label="Bunga yang dihemat dengan Avalanche"
                  :value="formatRupiah(comparison.interestSaved)"
                  :tone="comparison.interestSaved > 0 ? 'safe' : 'default'"
                  tooltip="Selisih total bunga antara metode Snowball dan Avalanche."
                />
                <ResultStat
                  label="Waktu yang dihemat"
                  :value="
                    comparison.monthsSaved > 0
                      ? formatMonthsToHuman(comparison.monthsSaved)
                      : 'Sama cepat'
                  "
                  :tone="comparison.monthsSaved > 0 ? 'safe' : 'default'"
                />
              </div>

              <div class="space-y-2 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
                <p v-if="comparison.winner === 'tie'">
                  Kedua metode memberi hasil yang sama untuk daftar utangmu — biasanya karena
                  utangnya hanya satu, atau urutan prioritasnya kebetulan identik. Pilih yang mana
                  pun.
                </p>
                <p v-else-if="comparison.interestSaved < MINOR_SAVING_THRESHOLD">
                  Selisihnya kecil, hanya {{ formatRupiah(comparison.interestSaved) }}. Dalam kondisi
                  seperti ini, pilih metode yang paling bikin kamu semangat menjalankannya — konsistensi
                  lebih berharga daripada selisih sekecil itu.
                </p>
                <p v-else>
                  Avalanche menghemat {{ formatRupiah(comparison.interestSaved) }} bunga. Kalau kamu
                  butuh dorongan motivasi, Snowball tetap pilihan yang sah — rencana yang dijalankan
                  selalu mengalahkan rencana yang paling optimal tapi ditinggalkan.
                </p>
                <p v-if="highestApr">
                  Bunga tertinggi di daftarmu:
                  <strong class="font-bold text-rose-600 dark:text-rose-400">
                    {{ highestApr.name }} ({{ formatPercent(highestApr.apr) }})
                  </strong>
                  — ini sumber kebocoran terbesar.
                </p>
              </div>
            </div>
          </AppCard>

          <!-- Grafik -->
          <AppCard
            v-if="chart.series.length"
            title="Sisa utang dari bulan ke bulan"
            icon="📉"
            subtitle="Arahkan kursor ke grafik untuk melihat detail tiap bulan."
          >
            <LineChart
              :series="chart.series"
              :labels="chart.labels"
              :height="320"
              :format-value="(v) => formatRupiahCompact(v)"
              :format-tooltip-value="formatRupiah"
              :max-x-labels="8"
            />
          </AppCard>
        </template>
      </template>
    </div>
  </ModuleLayout>
</template>
