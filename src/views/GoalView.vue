<script setup>
import { computed } from 'vue'
import { EXPLAINERS } from '@/data/explainers'
import { getModule, stageLabel } from '@/data/modules'
import { derived, state } from '@/stores/financeStore'
import { goalPlan, projectInvestment } from '@/utils/finance'
import { COFFEE_PRICE, PRESETS, RANGE } from '@/data/limits'
import {
  formatDecimal,
  formatMonthsToHuman,
  formatPercent,
  formatRupiah,
  formatRupiahCompact,
  monthsFromNowLabel,
} from '@/utils/format'
import ModuleLayout from '@/components/ui/ModuleLayout.vue'
import AppCard from '@/components/ui/AppCard.vue'
import SliderField from '@/components/ui/SliderField.vue'
import ToggleField from '@/components/ui/ToggleField.vue'
import ResultStat from '@/components/ui/ResultStat.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import LineChart from '@/components/charts/LineChart.vue'

const mod = getModule('target-impian')
const g = state.goal

const effectiveReturn = computed(() => (g.useInvestment ? g.returnPct : 0))

const plan = computed(() =>
  goalPlan({
    target: g.target,
    months: g.months,
    initial: g.initial,
    annualReturnPct: effectiveReturn.value,
  }),
)

/** Uang bebas bulanan (dihitung terpusat di store), untuk menilai apakah targetnya realistis. */
const surplus = computed(() => Math.max(0, derived.value.surplus))

const burdenPct = computed(() =>
  surplus.value > 0 ? (plan.value.perMonth / surplus.value) * 100 : 100,
)

const feasibility = computed(() => {
  if (plan.value.alreadyEnough) {
    return {
      level: 'safe',
      label: 'Sudah Tercapai',
      message:
        'Modal awalmu sudah cukup untuk mencapai target di tenggat ini. Kamu tidak perlu setoran tambahan.',
    }
  }
  if (surplus.value <= 0) {
    return {
      level: 'danger',
      label: 'Belum Ada Ruang',
      message:
        'Saat ini penghasilanmu habis untuk pengeluaran dan cicilan, jadi belum ada uang bebas untuk target ini. Benahi arus kas lebih dulu.',
    }
  }
  if (burdenPct.value <= 50) {
    return {
      level: 'safe',
      label: 'Realistis',
      message: `Setoran ini memakai ${formatPercent(burdenPct.value)} dari uang bebas bulananmu. Masih menyisakan ruang untuk tujuan lain.`,
    }
  }
  if (burdenPct.value <= 100) {
    return {
      level: 'warn',
      label: 'Ketat',
      message: `Setoran ini memakai ${formatPercent(burdenPct.value)} dari uang bebas bulananmu. Bisa dijalankan, tapi hampir tidak ada ruang untuk tujuan lain.`,
    }
  }
  return {
    level: 'danger',
    label: 'Terlalu Berat',
    message: `Setoran yang dibutuhkan melebihi uang bebas bulananmu (${formatRupiah(surplus)}). Coba panjangkan tenggat, turunkan target, atau tambah modal awal.`,
  }
})

/** Proyeksi saldo bulanan sampai tenggat, untuk grafik. */
const projection = computed(() => {
  const proj = projectInvestment({
    initial: g.initial,
    monthly: plan.value.perMonth,
    annualReturnPct: effectiveReturn.value,
    years: g.months / 12,
  })

  const step = Math.max(1, Math.ceil(proj.monthlySeries.length / 40))
  const points = proj.monthlySeries.filter((_, i) => i % step === 0 || i === proj.monthlySeries.length - 1)

  return {
    labels: points.map((pt) => (pt.month === 0 ? 'Mulai' : `Bln ${pt.month}`)),
    series: [
      {
        name: 'Saldo terkumpul',
        color: '#4f46e5',
        values: points.map((pt) => pt.balance),
        area: true,
      },
      {
        name: 'Target',
        color: '#059669',
        values: points.map(() => g.target),
        dashed: true,
      },
    ],
    final: proj.finalBalance,
  }
})

const formatReturnPercent = (v) => formatPercent(v, 1)

/** Setoran harian dibandingkan harga kopi supaya terasa konkret. */
const coffeeEquivalent = computed(() => plan.value.perDay / COFFEE_PRICE)

/** Saran instrumen berdasarkan jangka waktu — makin pendek, makin rendah risikonya. */
const horizonAdvice = computed(() => {
  if (g.months <= 12) {
    return {
      level: 'warn',
      title: 'Target jangka pendek — jangan diinvestasikan',
      body: 'Di bawah satu tahun, uangmu harus pasti ada saat dibutuhkan. Pakai tabungan terpisah atau deposito. Investasi yang nilainya bisa turun terlalu berisiko untuk tenggat sedekat ini.',
    }
  }
  if (g.months <= 36) {
    return {
      level: 'brand',
      title: 'Target menengah — instrumen risiko rendah',
      body: 'Untuk 1–3 tahun, reksadana pasar uang atau obligasi negara cukup masuk akal. Ekspektasi return sekitar 4–6% per tahun dengan fluktuasi yang kecil.',
    }
  }
  return {
    level: 'safe',
    title: 'Target jangka panjang — boleh lebih agresif',
    body: 'Dengan tenggat di atas 3 tahun, kamu punya waktu untuk memulihkan penurunan pasar. Campuran obligasi dan saham bisa dipertimbangkan, tapi tetap sesuaikan dengan kenyamananmu.',
  }
})
</script>

<template>
  <ModuleLayout
    :title="mod.title"
    :description="mod.description"
    :icon="mod.icon"
    :stage="stageLabel(mod.stage)"
    :explainer="EXPLAINERS['target-impian']"
    route-name="target-impian"
  >
    <div class="grid gap-5 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <!-- Kontrol -->
      <div class="min-w-0 space-y-5">
        <AppCard title="Targetmu" icon="🎯">
          <div class="space-y-6">
            <div class="space-y-1.5">
              <label for="goal-name" class="label">Nama target</label>
              <input
                id="goal-name"
                v-model="g.name"
                type="text"
                class="field"
                placeholder="Mis. DP Rumah, Laptop Baru, Liburan"
              />
              <p class="hint">
                Target dengan nama jelas lebih mudah dipertahankan daripada "nanti mau nabung".
              </p>
            </div>

            <SliderField
              v-model="g.target"
              v-bind="RANGE.goalTarget"
              label="Target nominal"
              :format="formatRupiahCompact"
              accent="brand"
              :presets="PRESETS.goalTarget"
            />

            <SliderField
              v-model="g.months"
              v-bind="RANGE.goalMonths"
              label="Tenggat waktu"
              :format="formatMonthsToHuman"
              accent="sky"
              :hint="`Target tercapai sekitar ${monthsFromNowLabel(g.months)}`"
              :presets="PRESETS.goalMonths"
            />

            <SliderField
              v-model="g.initial"
              v-bind="RANGE.goalInitial"
              label="Uang yang sudah ada untuk target ini"
              :format="formatRupiahCompact"
              accent="emerald"
            />
          </div>
        </AppCard>

        <AppCard title="Bantuan investasi" icon="📈">
          <div class="space-y-4">
            <ToggleField
              v-model="g.useInvestment"
              label="Bantu dengan investasi"
              tooltip="Kalau aktif, perhitungan menganggap uangmu berkembang sehingga setoran bulanan bisa lebih kecil."
              description="Setoranmu diasumsikan berkembang, bukan hanya disimpan di tabungan."
            />

            <SliderField
              v-if="g.useInvestment"
              v-model="g.returnPct"
              v-bind="RANGE.returnPct"
              label="Asumsi return per tahun"
              tooltip="Pakai angka konservatif. Untuk target penting, lebih baik hasilnya kelebihan daripada kurang."
              :format="formatReturnPercent"
              accent="emerald"
              :presets="PRESETS.goalReturnProfile"
            />

            <div
              class="rounded-xl p-3.5"
              :class="{
                'bg-amber-50 dark:bg-amber-500/10': horizonAdvice.level === 'warn',
                'bg-brand-50 dark:bg-brand-500/10': horizonAdvice.level === 'brand',
                'bg-emerald-50 dark:bg-emerald-500/10': horizonAdvice.level === 'safe',
              }"
            >
              <p class="text-xs font-bold text-ink-800 dark:text-ink-100">
                {{ horizonAdvice.title }}
              </p>
              <p class="mt-1 text-xs leading-relaxed text-ink-600 dark:text-ink-300">
                {{ horizonAdvice.body }}
              </p>
            </div>
          </div>
        </AppCard>
      </div>

      <!-- Hasil -->
      <div class="min-w-0 space-y-5">
        <AppCard :tone="feasibility.level">
          <template #header>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-base font-bold text-ink-900 dark:text-white">
                {{ g.name || 'Targetmu' }}
              </h2>
              <StatusPill :level="feasibility.level" :label="feasibility.label" size="sm" />
            </div>
          </template>

          <div class="space-y-5">
            <div>
              <p class="hint">Yang harus kamu sisihkan</p>
              <p class="tnum mt-1 text-3xl font-extrabold text-ink-900 sm:text-4xl dark:text-white">
                {{ formatRupiah(plan.perMonth) }}
                <span class="text-base font-bold text-ink-400">/bulan</span>
              </p>
            </div>

            <div class="grid gap-4 sm:grid-cols-3">
              <ResultStat
                label="Per hari"
                :value="formatRupiah(plan.perDay)"
                tone="brand"
                size="sm"
                caption="Kalau disisihkan harian"
              />
              <ResultStat
                label="Per minggu"
                :value="formatRupiah(plan.perWeek)"
                tone="brand"
                size="sm"
                caption="Kalau disisihkan mingguan"
              />
              <ResultStat
                label="Per bulan"
                :value="formatRupiah(plan.perMonth)"
                tone="brand"
                size="sm"
                caption="Paling praktis: autodebet"
              />
            </div>

            <p class="text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {{ feasibility.message }}
            </p>
          </div>
        </AppCard>

        <!-- Beban terhadap uang bebas -->
        <AppCard title="Seberapa berat untuk kantongmu" icon="⚖️">
          <div class="space-y-4">
            <ProgressBar
              :value="Math.min(100, burdenPct)"
              :tone="feasibility.level === 'safe' ? 'safe' : feasibility.level === 'warn' ? 'warn' : 'danger'"
              height="lg"
              label="Porsi dari uang bebas bulanan"
              :value-label="surplus > 0 ? formatPercent(burdenPct) : 'Tidak ada uang bebas'"
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="hint">Uang bebas bulananmu</p>
                <p class="tnum mt-0.5 text-sm font-bold text-ink-900 dark:text-white">
                  {{ formatRupiah(surplus) }}
                </p>
              </div>
              <div>
                <p class="hint">Sisa setelah setoran target ini</p>
                <p
                  class="tnum mt-0.5 text-sm font-bold"
                  :class="
                    surplus - plan.perMonth >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  "
                >
                  {{ formatRupiah(surplus - plan.perMonth) }}
                </p>
              </div>
            </div>
          </div>
        </AppCard>

        <!-- Efek investasi -->
        <AppCard v-if="g.useInvestment && plan.helpedByReturns > 0" tone="safe" title="Bantuan dari imbal hasil" icon="🌱">
          <div class="space-y-3">
            <div class="grid gap-4 sm:grid-cols-2">
              <ResultStat
                label="Kalau menabung biasa"
                :value="formatRupiah(plan.plainPerMonth)"
                tone="default"
                size="sm"
                caption="Tanpa bantuan investasi"
              />
              <ResultStat
                label="Setoranmu jadi lebih ringan"
                :value="formatRupiah(plan.helpedByReturns)"
                tone="safe"
                size="sm"
                caption="Selisih per bulan"
              />
            </div>
            <p class="hint">
              Dengan asumsi return {{ formatPercent(g.returnPct, 1) }} per tahun, sebagian targetmu
              dipenuhi oleh pertumbuhan investasi — jadi setoran bulanannya turun sekitar
              {{ formatPercent((plan.helpedByReturns / Math.max(1, plan.plainPerMonth)) * 100) }}.
              Ingat ini asumsi, bukan jaminan.
            </p>
          </div>
        </AppCard>

        <!-- Grafik -->
        <AppCard title="Perjalanan menuju target" icon="📈">
          <LineChart
            :series="projection.series"
            :labels="projection.labels"
            :height="300"
            :format-value="formatRupiahCompact"
            :format-tooltip-value="formatRupiah"
            :max-x-labels="7"
          />
          <p class="hint mt-3">
            Garis hijau putus-putus adalah targetmu ({{ formatRupiah(g.target) }}). Dengan setoran di
            atas, saldo akhir diperkirakan {{ formatRupiah(projection.final) }} setelah
            {{ formatMonthsToHuman(g.months) }}.
          </p>
        </AppCard>

        <!-- Konteks harian -->
        <AppCard title="Biar lebih terasa" icon="☕">
          <div class="space-y-2.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            <p>
              Setoran {{ formatRupiah(plan.perDay) }} per hari itu setara dengan sekitar
              <strong class="font-bold text-ink-800 dark:text-ink-100">
                {{ formatDecimal(coffeeEquivalent, 1) }} gelas kopi
              </strong>
              (asumsi {{ formatRupiah(COFFEE_PRICE) }} per gelas).
            </p>
            <p>
              Dalam {{ formatMonthsToHuman(g.months) }}, total yang kamu setorkan sekitar
              {{ formatRupiah(plan.perMonth * g.months) }}
              <template v-if="g.initial > 0">
                ditambah modal awal {{ formatRupiah(g.initial) }}</template
              >.
            </p>
          </div>
        </AppCard>
      </div>
    </div>
  </ModuleLayout>
</template>
