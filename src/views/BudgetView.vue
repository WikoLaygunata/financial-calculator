<script setup>
import { computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { state } from '@/stores/financeStore'
import { BUDGET_PRESETS, budgetPlan } from '@/utils/finance'
import { RANGE } from '@/data/limits'
import { formatPercent, formatRupiah } from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import DonutChart from '@/components/charts/DonutChart.vue'

const mod = getModule('anggaran')
const p = state.userProfile
const b = state.budget

const presetOptions = BUDGET_PRESETS.map((o) => ({
  value: o.value,
  label: o.label,
  note: o.note,
}))

// Memilih preset langsung menyetel slider; menggeser slider akan pindah ke "Atur Sendiri".
watch(
  () => b.preset,
  (preset) => {
    const found = BUDGET_PRESETS.find((x) => x.value === preset)
    if (found && preset !== 'custom') {
      b.needsPct = found.needs
      b.wantsPct = found.wants
    }
  },
)

function onSliderChange(key, value) {
  b[key] = value
  b.preset = 'custom'
}

/**
 * Pengeluaran rutin di profil dianggap sebagai "kebutuhan", dan cicilan ikut
 * masuk kebutuhan karena sifatnya wajib. Keinginan dihitung dari sisa yang
 * benar-benar habis terpakai.
 */
const actualNeeds = computed(() => p.monthlyExpenses + p.monthlyDebt)

const result = computed(() =>
  budgetPlan({
    monthlyIncome: p.monthlyIncome,
    needsPct: b.needsPct,
    wantsPct: b.wantsPct,
    actualNeeds: actualNeeds.value,
    actualWants: p.monthlyWants,
  }),
)

const wantsStatus = computed(() =>
  result.value.wantsGap >= 0
    ? { level: 'safe', label: 'Dalam pagu' }
    : { level: 'danger', label: 'Melebihi pagu' },
)

const savingsPct = computed(() => Math.max(0, 100 - b.needsPct - b.wantsPct))

const formatWholePercent = (v) => formatPercent(v, 0)

/** Keinginan dibatasi agar kebutuhan + keinginan tidak melebihi batas atas kebutuhan. */
const maxWantsPct = computed(() => Math.max(0, RANGE.needsPct.max - b.needsPct))

const donutSlices = computed(() => [
  { label: `Kebutuhan (${formatPercent(b.needsPct, 0)})`, value: result.value.plan.needs, color: '#0ea5e9' },
  { label: `Keinginan (${formatPercent(b.wantsPct, 0)})`, value: result.value.plan.wants, color: '#f59e0b' },
  { label: `Tabungan (${formatPercent(savingsPct, 0)})`, value: result.value.plan.savings, color: '#059669' },
])

const needsStatus = computed(() => {
  const gap = result.value.needsGap
  if (gap >= 0) return { level: 'safe', label: 'Dalam pagu' }
  return { level: 'danger', label: 'Melebihi pagu' }
})

const realSavingsStatus = computed(() => {
  const pct = result.value.realSavingsPct
  if (pct >= savingsPct.value) return { level: 'safe', label: 'Sesuai rencana' }
  if (pct >= 10) return { level: 'warn', label: 'Di bawah rencana' }
  if (pct >= 0) return { level: 'danger', label: 'Terlalu kecil' }
  return { level: 'danger', label: 'Defisit' }
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS.anggaran"
    route-name="anggaran"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="space-y-5">
        <AppCard title="Atur pembagianmu" icon="🎛️">
          <div class="space-y-6">
            <SliderField
              v-model="p.monthlyIncome"
              v-bind="RANGE.income"
              label="Penghasilan bersih bulanan"
              tooltip="Uang yang benar-benar masuk rekening setelah pajak dan potongan."
              :format="formatRupiah"
              accent="emerald"
            />

            <ChipGroup
              v-model="b.preset"
              label="Pola pembagian"
              tooltip="Pilih pola siap pakai, atau geser slider di bawah untuk mengatur sendiri."
              :options="presetOptions"
              :columns="2"
            />

            <div class="space-y-6 border-t divide-line pt-5">
              <SliderField
                :model-value="b.needsPct"
                v-bind="RANGE.needsPct"
                label="Kebutuhan"
                tooltip="Pengeluaran yang kalau tidak dibayar ada konsekuensi serius: sewa, makan, transport, cicilan."
                :format="formatWholePercent"
                accent="sky"
                @update:model-value="onSliderChange('needsPct', $event)"
              />

              <SliderField
                :model-value="b.wantsPct"
                label="Keinginan"
                tooltip="Hal yang menyenangkan tapi bisa dikurangi tanpa konsekuensi serius."
                :min="0"
                :max="maxWantsPct"
                :step="1"
                :format="formatWholePercent"
                accent="amber"
                @update:model-value="onSliderChange('wantsPct', $event)"
              />

              <div
                class="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5
                  dark:border-emerald-400/25 dark:bg-emerald-500/10"
              >
                <p class="flex items-center justify-between gap-3">
                  <span class="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Tabungan & investasi
                  </span>
                  <span class="tnum text-lg font-extrabold text-emerald-700 dark:text-emerald-300">
                    {{ formatPercent(savingsPct, 0) }}
                  </span>
                </p>
                <p class="mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/80">
                  Sisa otomatis dari 100%. Inilah bagian yang sebaiknya disisihkan lebih dulu, bukan
                  ditunggu dari sisa akhir bulan.
                </p>
              </div>
            </div>
          </div>
        </AppCard>

        <AppCard title="Pengeluaran aslimu" icon="📌" subtitle="Diambil dari Profil Keuangan.">
          <dl class="space-y-2.5 text-sm">
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Pengeluaran rutin</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(p.monthlyExpenses) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Total cicilan</dt>
              <dd class="tnum font-bold text-ink-900 dark:text-white">
                {{ formatRupiah(p.monthlyDebt) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3">
              <dt class="text-ink-500 dark:text-ink-400">Keinginan / jajan</dt>
              <dd class="tnum font-bold text-sky-600 dark:text-sky-400">
                {{ formatRupiah(p.monthlyWants) }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-3 border-t divide-line pt-2.5">
              <dt class="font-bold text-ink-700 dark:text-ink-200">Dihitung sebagai kebutuhan</dt>
              <dd class="tnum font-extrabold text-ink-900 dark:text-white">
                {{ formatRupiah(actualNeeds) }}
              </dd>
            </div>
          </dl>
          <p class="hint mt-3">
            Cicilan dimasukkan ke kebutuhan karena sifatnya wajib dibayar. Ubah angkanya lewat tombol
            Profil Keuangan.
          </p>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="space-y-5">
        <AppCard title="Rencana alokasi bulananmu" icon="🥧">
          <DonutChart
            :slices="donutSlices"
            :size="200"
            center-label="Penghasilan"
            :center-value="formatRupiah(p.monthlyIncome)"
          />
        </AppCard>

        <AppCard title="Rencana vs kenyataan" icon="🔍">
          <div class="space-y-5">
            <!-- Kebutuhan -->
            <div class="space-y-2">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-bold text-ink-800 dark:text-ink-100">Kebutuhan</p>
                <StatusPill :level="needsStatus.level" :label="needsStatus.label" size="sm" />
              </div>
              <ProgressBar
                :value="result.plan.needs > 0 ? (actualNeeds / result.plan.needs) * 100 : 0"
                :tone="needsStatus.level === 'safe' ? 'safe' : 'danger'"
                :marker="100"
                marker-label="Garis penanda = batas pagu kebutuhanmu"
              />
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="text-ink-500 dark:text-ink-400">
                  Pagu {{ formatRupiah(result.plan.needs) }} · Aktual
                  {{ formatRupiah(actualNeeds) }}
                </span>
                <span
                  class="tnum font-bold"
                  :class="
                    result.needsGap >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  "
                >
                  {{ result.needsGap >= 0 ? 'Sisa ' : 'Lebih ' }}
                  {{ formatRupiah(Math.abs(result.needsGap)) }}
                </span>
              </div>
            </div>

            <!-- Keinginan -->
            <div class="space-y-2 border-t divide-line pt-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-bold text-ink-800 dark:text-ink-100">Keinginan</p>
                <StatusPill :level="wantsStatus.level" :label="wantsStatus.label" size="sm" />
              </div>
              <ProgressBar
                :value="result.plan.wants > 0 ? (p.monthlyWants / result.plan.wants) * 100 : 0"
                :tone="wantsStatus.level === 'safe' ? 'safe' : 'danger'"
                :marker="100"
                marker-label="Garis penanda = batas pagu keinginanmu"
              />
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span class="text-ink-500 dark:text-ink-400">
                  Pagu {{ formatRupiah(result.plan.wants) }} · Aktual
                  {{ formatRupiah(p.monthlyWants) }}
                </span>
                <span
                  class="tnum font-bold"
                  :class="
                    result.wantsGap >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  "
                >
                  {{ result.wantsGap >= 0 ? 'Sisa ' : 'Lebih ' }}
                  {{ formatRupiah(Math.abs(result.wantsGap)) }}
                </span>
              </div>
            </div>

            <!-- Tabungan nyata -->
            <div class="space-y-2 border-t divide-line pt-5">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p class="text-sm font-bold text-ink-800 dark:text-ink-100">
                  Yang benar-benar bisa kamu sisihkan
                </p>
                <StatusPill
                  :level="realSavingsStatus.level"
                  :label="realSavingsStatus.label"
                  size="sm"
                />
              </div>
              <p class="tnum text-2xl font-extrabold text-ink-900 dark:text-white">
                {{ formatRupiah(result.realSavings) }}
                <span class="text-sm font-bold text-ink-400">
                  ({{ formatPercent(result.realSavingsPct) }})
                </span>
              </p>
              <p class="hint">
                Penghasilan {{ formatRupiah(p.monthlyIncome) }} dikurangi kebutuhan
                {{ formatRupiah(actualNeeds) }} dan keinginan
                {{ formatRupiah(p.monthlyWants) }}. Ini angka yang benar-benar tersisa, bukan
                perkiraan.
              </p>
            </div>
          </div>
        </AppCard>

        <div class="grid gap-4 sm:grid-cols-3">
          <ResultStat
            label="Pagu kebutuhan"
            :value="formatRupiah(result.plan.needs)"
            :caption="`${formatPercent(b.needsPct, 0)} dari penghasilan`"
            tone="brand"
            size="sm"
          />
          <ResultStat
            label="Pagu keinginan"
            :value="formatRupiah(result.plan.wants)"
            :caption="`${formatPercent(b.wantsPct, 0)} dari penghasilan`"
            tone="warn"
            size="sm"
          />
          <ResultStat
            label="Target tabungan"
            :value="formatRupiah(result.plan.savings)"
            :caption="`${formatPercent(savingsPct, 0)} dari penghasilan`"
            tone="safe"
            size="sm"
          />
        </div>

        <!-- Saran -->
        <AppCard
          :tone="result.onTrack ? 'safe' : 'warn'"
          :title="result.onTrack ? 'Anggaranmu masuk' : 'Ada yang perlu disesuaikan'"
          :icon="result.onTrack ? '✅' : '⚠️'"
        >
          <div class="space-y-3 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p v-if="result.onTrack">
              Kebutuhan aktualmu masih di bawah pagu, dan sisa yang bisa disisihkan sudah memenuhi
              target tabungan. Langkah berikutnya: pastikan setoran itu benar-benar berjalan otomatis
              di tanggal gajian.
            </p>
            <template v-else>
              <p>
                Kebutuhan aktualmu
                {{ formatRupiah(actualNeeds) }} melebihi pagu
                {{ formatRupiah(result.plan.needs) }}, jadi target tabungan
                {{ formatPercent(savingsPct, 0) }} sulit tercapai tanpa penyesuaian.
              </p>
              <ul class="space-y-1.5">
                <li class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>
                    Cek dulu porsi cicilan ({{ formatRupiah(p.monthlyDebt) }}). Kalau ini penyumbang
                    terbesar, pelunasan utang akan langsung melonggarkan anggaranmu.
                  </span>
                </li>
                <li class="flex gap-2.5">
                  <span class="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>
                    Naikkan pagu kebutuhan ke angka yang realistis dulu, lalu kejar penurunannya
                    bertahap. Anggaran yang tidak realistis justru gampang ditinggalkan.
                  </span>
                </li>
              </ul>
            </template>

            <div class="flex flex-wrap gap-2 pt-1">
              <RouterLink to="/kesehatan-cicilan" class="btn-ghost">Cek rasio cicilan →</RouterLink>
              <RouterLink to="/bebas-utang" class="btn-ghost">Rencana bebas utang →</RouterLink>
            </div>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
