<script setup>
/**
 * Panel Profil Keuangan — inti dari "shared state".
 *
 * Angka yang diisi di sini otomatis dipakai semua modul kalkulator, jadi pengguna
 * tidak perlu mengisi gaji atau pengeluaran berulang kali di tiap halaman.
 */
import { computed, ref } from 'vue'
import { formatRupiah, formatRupiahCompact, formatPercent } from '@/utils/format'
import { DEPENDENT_OPTIONS, JOB_OPTIONS } from '@/utils/finance'
import { RANGE } from '@/data/limits'
import {
  state,
  derived,
  exportData,
  importData,
  resetAll,
} from '@/stores/financeStore'
import SliderField from '@/components/ui/SliderField.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import StatusPill from '@/components/ui/StatusPill.vue'

const props = defineProps({ open: { type: Boolean, default: false } })
const emit = defineEmits(['close'])

const fileInput = ref(null)
const importError = ref('')
const confirmingReset = ref(false)

const dependentOptions = DEPENDENT_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
  note: o.note,
}))

const jobOptions = JOB_OPTIONS.map((o) => ({ value: o.value, label: o.label, note: o.note }))

const formatYears = (v) => `${v} tahun`

/** Usia pensiun tidak boleh di bawah usia sekarang. */
const minRetirementAge = computed(() =>
  Math.max(state.userProfile.currentAge + 1, RANGE.retirementAge.min),
)

const yearsToRetire = computed(() =>
  Math.max(0, state.userProfile.retirementAge - state.userProfile.currentAge),
)

async function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  importError.value = ''
  try {
    await importData(file)
  } catch {
    importError.value = 'File tidak bisa dibaca. Pastikan itu file JSON hasil ekspor Financi.'
  }
  event.target.value = ''
}

function doReset() {
  resetAll()
  confirmingReset.value = false
}

const SURPLUS_TONE = (v) => (v > 0 ? 'safe' : v === 0 ? 'warn' : 'danger')
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="props.open"
        class="fixed inset-0 z-40 bg-ink-950/40 backdrop-blur-sm"
        @click="emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="props.open"
        class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-ink-50 shadow-2xl
          dark:bg-ink-950"
        role="dialog"
        aria-modal="true"
        aria-label="Profil Keuangan"
      >
        <header
          class="flex items-start justify-between gap-4 border-b divide-line bg-white px-5 py-4 dark:bg-ink-900"
        >
          <div>
            <h2 class="text-base font-bold text-ink-900 dark:text-white">Profil Keuangan</h2>
            <p class="hint mt-0.5">
              Isi sekali di sini, otomatis terpakai di semua kalkulator.
            </p>
          </div>
          <button
            type="button"
            class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl text-ink-500
              transition hover:bg-ink-100 dark:hover:bg-white/10"
            aria-label="Tutup panel profil"
            @click="emit('close')"
          >
            <svg viewBox="0 0 20 20" fill="none" class="size-4">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                stroke-width="2.2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </header>

        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <!-- Ringkasan hidup -->
          <div class="card card-pad space-y-3">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs font-semibold text-ink-500 dark:text-ink-400">
                Uang bebas tiap bulan
              </span>
              <StatusPill
                :level="SURPLUS_TONE(derived.surplus)"
                :label="derived.surplus >= 0 ? 'Surplus' : 'Defisit'"
                size="sm"
              />
            </div>
            <p class="tnum text-2xl font-extrabold text-ink-900 dark:text-white">
              {{ formatRupiah(derived.surplus) }}
            </p>
            <div class="grid grid-cols-2 gap-3 border-t divide-line pt-3">
              <div>
                <p class="hint">Rasio cicilan</p>
                <p class="tnum text-sm font-bold text-ink-800 dark:text-ink-100">
                  {{ formatPercent(derived.dsr.ratio) }}
                </p>
              </div>
              <div>
                <p class="hint">Rasio menabung</p>
                <p class="tnum text-sm font-bold text-ink-800 dark:text-ink-100">
                  {{ formatPercent(derived.savings.pct) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Arus kas -->
          <section class="space-y-5">
            <h3 class="section-title">Arus Kas Bulanan</h3>

            <SliderField
              v-model="state.userProfile.monthlyIncome"
              v-bind="RANGE.income"
              label="Penghasilan bersih"
              tooltip="Uang yang benar-benar masuk rekeningmu setiap bulan, setelah pajak dan potongan."
              :format="formatRupiah"
              accent="emerald"
            />

            <SliderField
              v-model="state.userProfile.monthlyExpenses"
              v-bind="RANGE.expenses"
              label="Pengeluaran rutin"
              tooltip="Total biaya hidup bulanan tanpa menghitung cicilan: makan, transport, sewa, listrik."
              :format="formatRupiah"
              accent="amber"
            />

            <SliderField
              v-model="state.userProfile.monthlyDebt"
              v-bind="RANGE.debt"
              label="Total cicilan berjalan"
              tooltip="Jumlahkan semua cicilan bulanan: KPR, kendaraan, kartu kredit, paylater, pinjol."
              :format="formatRupiah"
              accent="rose"
            />
          </section>

          <!-- Kondisi hidup -->
          <section class="space-y-4">
            <h3 class="section-title">Kondisi Hidup</h3>

            <ChipGroup
              v-model="state.userProfile.dependents"
              label="Status tanggungan"
              :options="dependentOptions"
              :columns="3"
            />

            <ChipGroup
              v-model="state.userProfile.jobType"
              label="Jenis pekerjaan"
              :options="jobOptions"
              :columns="3"
            />

            <div class="grid grid-cols-1 gap-5">
              <SliderField
                v-model="state.userProfile.currentAge"
                v-bind="RANGE.currentAge"
                label="Usia sekarang"
                :format="formatYears"
              />
              <SliderField
                v-model="state.userProfile.retirementAge"
                v-bind="RANGE.retirementAge"
                :min="minRetirementAge"
                label="Target usia pensiun"
                :format="formatYears"
                :hint="`Sisa waktu menabung: ${yearsToRetire} tahun`"
              />
            </div>
          </section>

          <!-- Aset -->
          <section class="space-y-5">
            <h3 class="section-title">Aset yang Sudah Ada</h3>

            <SliderField
              v-model="state.userProfile.emergencyFundSaved"
              v-bind="RANGE.emergencySaved"
              label="Dana darurat terkumpul"
              :format="formatRupiahCompact"
              accent="sky"
            />

            <SliderField
              v-model="state.userProfile.investedAssets"
              v-bind="RANGE.investedAssets"
              label="Nilai investasi saat ini"
              tooltip="Total nilai reksadana, saham, emas, obligasi, dan aset investasi lainnya."
              :format="formatRupiahCompact"
              accent="brand"
            />
          </section>

          <!-- Kelola data -->
          <section class="space-y-3 border-t divide-line pt-5">
            <h3 class="section-title">Data Kamu</h3>
            <p class="hint">
              Tersimpan hanya di browser ini. Ekspor kalau mau memindahkannya ke perangkat lain.
            </p>

            <div class="flex flex-wrap gap-2">
              <button type="button" class="btn-ghost" @click="exportData()">⬇️ Ekspor JSON</button>
              <button type="button" class="btn-ghost" @click="fileInput?.click()">
                ⬆️ Impor JSON
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="application/json,.json"
                class="hidden"
                @change="onFileChange"
              />
            </div>

            <p v-if="importError" class="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {{ importError }}
            </p>

            <div v-if="!confirmingReset">
              <button type="button" class="btn-danger" @click="confirmingReset = true">
                🗑️ Reset semua data
              </button>
            </div>
            <div
              v-else
              class="space-y-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 dark:border-rose-500/25 dark:bg-rose-500/10"
            >
              <p class="text-xs font-semibold text-rose-800 dark:text-rose-200">
                Semua isian dan skor akan dihapus, dan ini tidak bisa dibatalkan. Lanjutkan?
              </p>
              <div class="flex gap-2">
                <button type="button" class="btn-danger" @click="doReset">Ya, hapus</button>
                <button type="button" class="btn-ghost" @click="confirmingReset = false">
                  Batal
                </button>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
