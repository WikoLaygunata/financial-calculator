<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { YIELD_PRESETS, passiveIncomePlan, requiredMonthlyDeposit } from '@/utils/finance'
import { CAPITAL_UNIT, PASSIVE_LADDER_STEPS, PRESETS, RANGE } from '@/data/limits'
import {
  formatDecimal,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
} from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

const mod = getModule('passive-income')
const pi = state.passiveIncome
const p = state.userProfile

const presetOptions = YIELD_PRESETS.map((o) => ({
  value: o.value,
  label: `${o.label}${o.value === 'custom' ? '' : ` (${formatPercent(o.yieldPct, 0)})`}`,
  note: o.note,
}))

const activeYield = computed(() => {
  if (pi.preset === 'custom') return pi.customYieldPct
  return YIELD_PRESETS.find((o) => o.value === pi.preset)?.yieldPct ?? 6
})

const plan = computed(() =>
  passiveIncomePlan({
    monthlyTarget: pi.monthlyTarget,
    yieldPct: activeYield.value,
    taxPct: pi.taxPct,
  }),
)

/** Progress dari aset investasi yang sudah ada menuju modal yang dibutuhkan. */
const progressPct = computed(() =>
  plan.value.capital > 0 ? Math.min(100, (p.investedAssets / plan.value.capital) * 100) : 0,
)

const remaining = computed(() => Math.max(0, plan.value.capital - p.investedAssets))

const surplus = computed(() => Math.max(0, p.monthlyIncome - p.monthlyExpenses - p.monthlyDebt))

/** Berapa lama modal itu terkumpul kalau seluruh uang bebas diinvestasikan. */
const yearsToCapital = computed(() => {
  if (remaining.value <= 0) return 0
  if (surplus.value <= 0) return null

  // Cari durasi (dalam tahun) di mana setoran bulanan surplus cukup mencapai target.
  for (let years = 1; years <= 60; years += 1) {
    const needed = requiredMonthlyDeposit({
      target: plan.value.capital,
      initial: p.investedAssets,
      annualReturnPct: activeYield.value,
      months: years * 12,
    })
    if (needed.monthly <= surplus.value) return years
  }
  return null
})

const currentPassiveIncome = computed(
  () => (p.investedAssets * (plan.value.netYieldPct / 100)) / 12,
)

const status = computed(() => {
  if (progressPct.value >= 100) {
    return { level: 'safe', label: 'Target Tercapai' }
  }
  if (progressPct.value >= 25) return { level: 'warn', label: 'Sedang Dikumpulkan' }
  return { level: 'danger', label: 'Baru Mulai' }
})

const formatRatePercent = (v) => formatPercent(v, 2)
const formatWholePercent = (v) => formatPercent(v, 0)

/** Modal target dinyatakan dalam satuan Rp100 juta agar lebih mudah dibayangkan. */
const capitalUnits = computed(() => plan.value.capital / CAPITAL_UNIT)

/** Beberapa titik target agar terasa bertahap, bukan sekali lompat. */
const ladder = computed(() =>
  PASSIVE_LADDER_STEPS.filter(
    (t) => t <= Math.max(pi.monthlyTarget, PASSIVE_LADDER_STEPS.at(-1)),
  )
    .map((target) => {
      const capital = (target * 12) / (plan.value.netYieldPct / 100)
      return {
        target,
        capital,
        reached: p.investedAssets >= capital,
      }
    }),
)
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['passive-income']"
    route-name="passive-income"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Target penghasilan pasif" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="pi.monthlyTarget"
              v-bind="RANGE.passiveTarget"
              label="Target passive income per bulan"
              tooltip="Uang yang ingin kamu terima tiap bulan dari hasil investasi, tanpa menjual pokoknya."
              :format="formatRupiah"
              accent="emerald"
              :presets="PRESETS.passiveTarget"
            />

            <ChipGroup
              v-model="pi.preset"
              label="Instrumen penghasil yield"
              tooltip="Yield adalah persentase penghasilan tahunan dibanding modal yang kamu tanam."
              :options="presetOptions"
              :columns="2"
            />

            <SliderField
              v-if="pi.preset === 'custom'"
              v-model="pi.customYieldPct"
              v-bind="RANGE.yieldPct"
              label="Yield per tahun"
              :format="formatRatePercent"
              accent="brand"
            />

            <SliderField
              v-model="pi.taxPct"
              v-bind="RANGE.taxPct"
              label="Potongan pajak atas hasil"
              tooltip="Dividen saham umumnya dipotong 10%, kupon obligasi sekitar 10%. Reksadana biasanya tidak dipotong lagi di tingkat investor."
              :format="formatWholePercent"
              accent="rose"
              :presets="PRESETS.tax"
            />
          </div>
        </AppCard>

        <AppCard title="Modal yang sudah kamu punya" icon="🏦">
          <SliderField
            v-model="p.investedAssets"
            v-bind="RANGE.investedAssets"
            label="Nilai investasi saat ini"
            :format="formatRupiahCompact"
            accent="brand"
          />
          <div class="mt-4 rounded-xl bg-ink-50 p-3.5 dark:bg-white/5">
            <p class="hint">Penghasilan pasif dari modal ini sekarang</p>
            <p class="tnum mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {{ formatRupiah(currentPassiveIncome) }}<span class="text-xs font-bold text-ink-400">/bulan</span>
            </p>
          </div>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard :tone="status.level">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">
                Modal yang wajib terkumpul
              </h2>
              <StatusPill :level="status.level" :label="status.label" size="sm" />
            </div>
          </template>

          <div class="space-y-5">
            <div>
              <p class="tnum text-3xl font-extrabold text-ink-900 sm:text-4xl dark:text-white">
                {{ formatRupiahCompact(plan.capital) }}
              </p>
              <p class="hint mt-1.5">{{ formatRupiah(plan.capital) }}</p>
            </div>

            <div
              class="rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-3 font-mono text-xs
                leading-relaxed text-brand-900 dark:border-brand-400/25 dark:bg-brand-500/10 dark:text-brand-200"
            >
              ({{ formatRupiah(pi.monthlyTarget) }} × 12) ÷
              {{ formatPercent(plan.netYieldPct, 2) }} =
              {{ formatRupiahCompact(plan.capital) }}
            </div>

            <ProgressBar
              :value="progressPct"
              tone="auto"
              height="lg"
              label="Progress dari modal yang sudah ada"
              :value-label="formatPercent(progressPct)"
            />

            <div class="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="Modal sekarang"
                :value="formatRupiahCompact(p.investedAssets)"
                tone="safe"
                size="sm"
              />
              <ResultStat
                label="Masih kurang"
                :value="formatRupiahCompact(remaining)"
                :tone="remaining > 0 ? 'warn' : 'safe'"
                size="sm"
              />
              <ResultStat
                label="Target tahunan"
                :value="formatRupiahCompact(plan.annualTarget)"
                tone="brand"
                size="sm"
                caption="Yang ditarik per tahun"
              />
            </div>
          </div>
        </AppCard>

        <div class="grid gap-5 sm:grid-cols-2">
          <AppCard title="Feel-nya per Rp100 juta" icon="💡">
            <div class="space-y-3">
              <div>
                <p class="hint">Setiap {{ formatRupiahCompact(CAPITAL_UNIT) }} modal menghasilkan</p>
                <p class="tnum mt-1 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {{ formatRupiah(plan.incomePer100M) }}
                  <span class="text-xs font-bold text-ink-400">/bulan</span>
                </p>
              </div>
              <p class="hint">
                Dengan yield bersih {{ formatPercent(plan.netYieldPct, 2) }}. Artinya untuk target
                {{ formatRupiah(pi.monthlyTarget) }} per bulan, kamu butuh sekitar
                {{ formatDecimal(capitalUnits, 1) }} × {{ formatRupiahCompact(CAPITAL_UNIT) }}.
              </p>
            </div>
          </AppCard>

          <AppCard title="Perkiraan waktu" icon="⏱️">
            <div v-if="remaining <= 0" class="space-y-2">
              <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                🎉 Modalmu sudah cukup.
              </p>
              <p class="hint">
                Hasil investasimu sudah bisa menutupi target {{ formatRupiah(pi.monthlyTarget) }} per
                bulan tanpa menggerus pokok. Jaga agar sebagian hasilnya tetap diinvestasikan supaya
                tahan inflasi.
              </p>
            </div>

            <div v-else-if="yearsToCapital === null" class="space-y-2">
              <p class="text-sm font-bold text-rose-600 dark:text-rose-400">Belum bisa dihitung</p>
              <p class="hint">
                {{
                  surplus <= 0
                    ? 'Belum ada uang bebas bulanan untuk diinvestasikan. Perbaiki arus kas lebih dulu.'
                    : 'Dengan uang bebas saat ini, target modal ini butuh lebih dari 60 tahun. Coba turunkan target penghasilan pasifnya.'
                }}
              </p>
              <RouterLink to="/anggaran" class="btn-ghost mt-2 w-full">Tinjau anggaran →</RouterLink>
            </div>

            <div v-else class="space-y-3">
              <div>
                <p class="hint">
                  Kalau seluruh uang bebas ({{ formatRupiah(surplus) }}/bulan) diinvestasikan
                </p>
                <p class="tnum mt-1 text-2xl font-extrabold text-ink-900 dark:text-white">
                  ± {{ yearsToCapital }} tahun
                </p>
              </div>
              <p class="hint">
                Perkiraan kasar dengan asumsi return sama dengan yield
                ({{ formatPercent(activeYield, 2) }}). Pada praktiknya, instrumen ber-yield tinggi
                biasanya punya pertumbuhan harga yang lebih lambat.
              </p>
            </div>
          </AppCard>
        </div>

        <!-- Tangga target -->
        <AppCard
          title="Tangga penghasilan pasif"
          icon="🪜"
          subtitle="Target besar lebih mudah dikejar kalau dipecah."
        >
          <ul class="space-y-2.5">
            <li
              v-for="step in ladder"
              :key="step.target"
              class="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-3.5 py-3"
              :class="
                step.reached
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-500/10'
                  : 'border-ink-200 dark:border-white/10'
              "
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-ink-900 dark:text-white">
                  {{ formatRupiah(step.target) }}<span class="text-ink-400">/bulan</span>
                </p>
                <p class="hint">Butuh modal {{ formatRupiahCompact(step.capital) }}</p>
              </div>
              <StatusPill
                :level="step.reached ? 'safe' : 'default'"
                :label="step.reached ? 'Tercapai' : 'Belum'"
                size="sm"
              />
            </li>
          </ul>
        </AppCard>

        <!-- Catatan penting -->
        <AppCard tone="warn" title="Tiga hal yang sering dilupakan" icon="⚠️">
          <ul class="space-y-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <li class="flex gap-2.5">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              <span>
                <strong class="font-bold text-ink-800 dark:text-ink-100">Inflasi.</strong>
                Target {{ formatRupiah(pi.monthlyTarget) }} hari ini tidak akan bernilai sama 10 tahun
                lagi. Sisakan sebagian hasil untuk menambah modal.
              </span>
            </li>
            <li class="flex gap-2.5">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              <span>
                <strong class="font-bold text-ink-800 dark:text-ink-100">Yield tidak dijamin.</strong>
                Dividen bisa dipotong atau dilewatkan saat perusahaan sedang sulit. Jangan bergantung
                pada satu instrumen saja.
              </span>
            </li>
            <li class="flex gap-2.5">
              <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              <span>
                <strong class="font-bold text-ink-800 dark:text-ink-100">Yield tinggi = risiko tinggi.</strong>
                Kalau ada tawaran yield jauh di atas angka di sini, curigai dulu. Itu pola umum
                investasi bodong.
              </span>
            </li>
          </ul>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
