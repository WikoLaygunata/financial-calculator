/**
 * Store global Financi.
 *
 * Pendekatannya sengaja sederhana: satu object `reactive` yang di-share antar
 * komponen, lalu di-persist ke localStorage. Tidak perlu Pinia/Vuex karena
 * aplikasi ini single-user, client-side, dan tanpa async state.
 *
 * Yang penting di sini:
 * 1. `userProfile` adalah sumber kebenaran tunggal. Kalau pengguna mengubah gaji
 *    di kalkulator DSR, nilainya langsung ikut terpakai di anggaran, pensiun, dll.
 * 2. Load memakai deep-merge terhadap default, jadi menambah field baru di versi
 *    berikutnya tidak akan merusak data pengguna lama.
 */

import { computed, reactive, watch } from 'vue'
import {
  debtServiceRatio,
  emergencyFund,
  savingsRate,
  scorecardResult,
} from '@/utils/finance'

const STORAGE_KEY = 'financi.v1'

/* ------------------------------------------------------------------ *
 * DEFAULT STATE
 * ------------------------------------------------------------------ */

const createDefaultState = () => ({
  /** Dipakai bersama oleh hampir semua modul. */
  userProfile: {
    monthlyIncome: 8_000_000,
    monthlyExpenses: 5_000_000,
    monthlyDebt: 1_500_000,
    dependents: 'single',
    jobType: 'employee',
    currentAge: 26,
    retirementAge: 55,
    emergencyFundSaved: 5_000_000,
    investedAssets: 10_000_000,
  },

  scorecard: {
    answers: {},
    lastScore: null,
  },

  budget: {
    preset: 'balanced',
    needsPct: 50,
    wantsPct: 30,
  },

  debts: {
    extraPayment: 500_000,
    items: [
      { id: 1, name: 'Kartu Kredit', principal: 8_000_000, apr: 26, minPayment: 400_000 },
      { id: 2, name: 'Cicilan Motor', principal: 15_000_000, apr: 12, minPayment: 750_000 },
      { id: 3, name: 'Paylater', principal: 2_500_000, apr: 36, minPayment: 300_000 },
    ],
  },

  loan: {
    principal: 300_000_000,
    annualRatePct: 11,
    months: 180,
  },

  goal: {
    name: 'DP Rumah',
    target: 150_000_000,
    months: 36,
    initial: 10_000_000,
    useInvestment: true,
    returnPct: 5,
  },

  retirement: {
    monthlyExpenseToday: 6_000_000,
    inflationPct: 4,
    returnPct: 8,
    withdrawalRatePct: 4,
  },

  passiveIncome: {
    monthlyTarget: 5_000_000,
    preset: 'sbn',
    customYieldPct: 6,
    taxPct: 0,
  },

  dca: {
    initial: 10_000_000,
    monthly: 2_000_000,
    returnPct: 8,
    years: 10,
  },

  compare: {
    selected: ['rdpu', 'emas', 'saham'],
    initial: 10_000_000,
    monthly: 1_000_000,
    years: 10,
  },

  inflation: {
    amount: 100_000_000,
    inflationPct: 4,
    years: 15,
  },

  rebalance: {
    freshMoney: 3_000_000,
    allowSell: false,
    assets: [
      { key: 'rdpu', label: 'Reksadana Pasar Uang', targetPct: 30, currentValue: 3_500_000, color: '#0ea5e9' },
      { key: 'sbn', label: 'Obligasi Negara / SBN', targetPct: 40, currentValue: 3_000_000, color: '#14b8a6' },
      { key: 'saham', label: 'Index Fund / Saham', targetPct: 30, currentValue: 5_000_000, color: '#6366f1' },
    ],
  },

  ui: {
    theme: null, // null = ikut preferensi sistem
    visited: [],
    hasSeenWelcome: false,
  },
})

/* ------------------------------------------------------------------ *
 * PERSISTENCE
 * ------------------------------------------------------------------ */

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/**
 * Gabungkan data tersimpan ke atas struktur default.
 * Array (mis. daftar utang) diambil apa adanya dari data tersimpan,
 * karena panjangnya memang ditentukan pengguna.
 */
function deepMerge(base, saved) {
  if (!isPlainObject(saved)) return base
  const out = Array.isArray(base) ? [...base] : { ...base }

  for (const [key, savedValue] of Object.entries(saved)) {
    const baseValue = out[key]
    if (isPlainObject(baseValue) && isPlainObject(savedValue)) {
      out[key] = deepMerge(baseValue, savedValue)
    } else if (savedValue !== undefined) {
      out[key] = savedValue
    }
  }
  return out
}

function loadState() {
  const fallback = createDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    return deepMerge(fallback, JSON.parse(raw))
  } catch {
    // Data korup atau localStorage diblokir — mulai dari default.
    return fallback
  }
}

export const state = reactive(loadState())

let saveTimer = null
function persist() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Kuota penuh atau mode privat — perhitungan tetap jalan, hanya tidak tersimpan.
    }
  }, 250)
}

watch(state, persist, { deep: true })

/* ------------------------------------------------------------------ *
 * TEMA
 * ------------------------------------------------------------------ */

function applyTheme() {
  const wantsDark =
    state.ui.theme === 'dark' ||
    (state.ui.theme === null &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', Boolean(wantsDark))
}

export const isDark = computed(
  () =>
    state.ui.theme === 'dark' ||
    (state.ui.theme === null &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches),
)

export function toggleTheme() {
  state.ui.theme = isDark.value ? 'light' : 'dark'
  applyTheme()
}

export function initTheme() {
  applyTheme()
  window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => {
    if (state.ui.theme === null) applyTheme()
  })
}

/* ------------------------------------------------------------------ *
 * PENJAGA KONSISTENSI
 * ------------------------------------------------------------------ */

/**
 * Usia pensiun harus selalu di atas usia sekarang, kalau tidak perhitungan
 * pensiun kehilangan makna (tahun menuju pensiun jadi nol atau negatif).
 */
watch(
  () => state.userProfile.currentAge,
  (age) => {
    if (state.userProfile.retirementAge <= age) {
      state.userProfile.retirementAge = Math.min(80, age + 1)
    }
  },
)

/** Kebutuhan + keinginan tidak boleh melebihi 100% penghasilan. */
watch(
  () => state.budget.needsPct,
  (needs) => {
    const maxWants = Math.max(0, 100 - needs)
    if (state.budget.wantsPct > maxWants) state.budget.wantsPct = maxWants
  },
)

/* ------------------------------------------------------------------ *
 * DERIVED STATE — dipakai dashboard & badge navigasi
 * ------------------------------------------------------------------ */

export const profile = computed(() => state.userProfile)

export const derived = computed(() => {
  const p = state.userProfile

  const dsr = debtServiceRatio({
    monthlyIncome: p.monthlyIncome,
    monthlyDebt: p.monthlyDebt,
  })

  const ef = emergencyFund({
    monthlyExpenses: p.monthlyExpenses,
    dependents: p.dependents,
    jobType: p.jobType,
    alreadySaved: p.emergencyFundSaved,
  })

  const sr = savingsRate({
    monthlyIncome: p.monthlyIncome,
    monthlyExpenses: p.monthlyExpenses,
    monthlyDebt: p.monthlyDebt,
  })

  return {
    dsr,
    emergency: ef,
    savings: sr,
    /** Uang bebas setiap bulan setelah pengeluaran & cicilan. */
    surplus: sr.surplus,
    netWorthish: Number(p.emergencyFundSaved || 0) + Number(p.investedAssets || 0),
  }
})

export const scorecard = computed(() => scorecardResult(state.scorecard.answers))

/** Simpan skor terakhir supaya bisa ditampilkan sebagai badge di navigasi. */
watch(
  scorecard,
  (result) => {
    if (result.answeredCount > 0) state.scorecard.lastScore = result.score
  },
  { immediate: true },
)

/* ------------------------------------------------------------------ *
 * ACTIONS
 * ------------------------------------------------------------------ */

export function setAnswer(id, value) {
  // Klik kedua pada jawaban yang sama akan membatalkan pilihan.
  state.scorecard.answers = {
    ...state.scorecard.answers,
    [id]: state.scorecard.answers[id] === value ? null : value,
  }
}

export function resetScorecard() {
  state.scorecard.answers = {}
  state.scorecard.lastScore = null
}

export function markVisited(routeName) {
  if (!routeName) return
  if (!state.ui.visited.includes(routeName)) state.ui.visited.push(routeName)
}

export function addDebt() {
  const nextId = Math.max(0, ...state.debts.items.map((d) => d.id)) + 1
  state.debts.items.push({
    id: nextId,
    name: `Utang ${state.debts.items.length + 1}`,
    principal: 5_000_000,
    apr: 18,
    minPayment: 300_000,
  })
}

export function removeDebt(id) {
  state.debts.items = state.debts.items.filter((d) => d.id !== id)
}

export function resetAll() {
  const fresh = createDefaultState()
  // Pertahankan preferensi tema supaya tampilan tidak "berkedip" saat reset.
  fresh.ui.theme = state.ui.theme
  Object.assign(state, fresh)
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* abaikan */
  }
}

/** Unduh seluruh data sebagai file JSON — pengguna tetap pegang datanya. */
export function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `financi-data-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importData(file) {
  const text = await file.text()
  const parsed = JSON.parse(text)
  Object.assign(state, deepMerge(createDefaultState(), parsed))
  applyTheme()
}

export { STORAGE_KEY, createDefaultState }
