/**
 * Rentang slider & tombol preset, dikumpulkan di satu tempat.
 *
 * Dua alasan file ini ada:
 *
 * 1. Menghindari duplikasi. Rentang "penghasilan bulanan" dipakai di Profil,
 *    Anggaran, Cek Cicilan, dan Pensiun. Sebelumnya didefinisikan ulang di tiap
 *    view sehingga mudah melenceng satu sama lain.
 *
 * 2. Menjauhkan angka dari <template>. Ekspresi di template diparsing terpisah
 *    oleh vue-eslint-parser, dan numeric separator (1_000_000) langsung bermasalah
 *    begitu ada tool yang memakai ecmaVersion di bawah 2021. Di file .js biasa
 *    seperti ini, separator aman dan angkanya tetap enak dibaca.
 *
 * Cara pakai di view:
 *   <SliderField v-bind="RANGE.income" :presets="PRESETS.income" ... />
 */

/* ------------------------------------------------------------------ *
 * RENTANG SLIDER — bentuknya { min, max, step } supaya bisa di-v-bind
 * ------------------------------------------------------------------ */

export const RANGE = {
  /** Penghasilan bersih bulanan. */
  income: { min: 1_000_000, max: 100_000_000, step: 500_000 },

  /** Pengeluaran rutin bulanan (kebutuhan). */
  expenses: { min: 500_000, max: 60_000_000, step: 250_000 },

  /** Pengeluaran untuk keinginan: jajan, hobi, langganan, hiburan. */
  wants: { min: 0, max: 30_000_000, step: 100_000 },

  /** Total cicilan bulanan yang sedang berjalan. */
  debt: { min: 0, max: 50_000_000, step: 100_000 },

  /** Dana darurat yang sudah terkumpul. */
  emergencySaved: { min: 0, max: 500_000_000, step: 500_000 },

  /** Nilai portofolio investasi saat ini. */
  investedAssets: { min: 0, max: 5_000_000_000, step: 5_000_000 },

  /** Modal awal (lump sum) untuk simulasi investasi. */
  lumpSum: { min: 0, max: 1_000_000_000, step: 1_000_000 },

  /** Setoran rutin bulanan untuk simulasi investasi. */
  monthlyDeposit: { min: 0, max: 50_000_000, step: 250_000 },

  /** Target nominal sebuah tujuan keuangan. */
  goalTarget: { min: 1_000_000, max: 2_000_000_000, step: 1_000_000 },

  /** Uang yang sudah tersedia untuk tujuan tersebut. */
  goalInitial: { min: 0, max: 1_000_000_000, step: 1_000_000 },

  /** Biaya hidup bulanan saat pensiun, dalam nilai uang sekarang. */
  retirementExpense: { min: 1_000_000, max: 100_000_000, step: 500_000 },

  /** Target penghasilan pasif bulanan. */
  passiveTarget: { min: 250_000, max: 50_000_000, step: 250_000 },

  /** Nominal pinjaman. */
  loanPrincipal: { min: 1_000_000, max: 3_000_000_000, step: 5_000_000 },

  /** Nominal uang / harga barang untuk simulasi inflasi. */
  inflationAmount: { min: 1_000_000, max: 2_000_000_000, step: 1_000_000 },

  /** Dana ekstra bulanan untuk mempercepat pelunasan utang. */
  extraPayment: { min: 0, max: 20_000_000, step: 100_000 },

  /** Dana baru yang disetor saat rebalancing. */
  freshMoney: { min: 0, max: 100_000_000, step: 500_000 },

  /* ---- Rentang non-rupiah ---- */

  /** Usia sekarang. */
  currentAge: { min: 17, max: 70, step: 1 },

  /** Target usia pensiun. */
  retirementAge: { min: 30, max: 80, step: 1 },

  /** Durasi investasi dalam tahun. */
  years: { min: 1, max: 40, step: 1 },

  /** Tenggat tujuan dalam bulan. */
  goalMonths: { min: 1, max: 120, step: 1 },

  /** Tenor pinjaman dalam bulan. */
  loanMonths: { min: 6, max: 360, step: 6 },

  /** Asumsi inflasi tahunan. */
  inflationPct: { min: 0.5, max: 20, step: 0.25 },

  /** Asumsi inflasi di modul pensiun (boleh nol). */
  retirementInflationPct: { min: 0, max: 12, step: 0.25 },

  /** Asumsi return investasi tahunan. */
  returnPct: { min: 1, max: 15, step: 0.5 },

  /** Asumsi return untuk simulasi DCA (rentang lebih lebar). */
  dcaReturnPct: { min: 1, max: 20, step: 0.5 },

  /** Bunga pinjaman tahunan. */
  loanRatePct: { min: 0, max: 40, step: 0.25 },

  /** Safe Withdrawal Rate. */
  withdrawalRatePct: { min: 2, max: 6, step: 0.25 },

  /** Yield instrumen penghasil passive income. */
  yieldPct: { min: 1, max: 20, step: 0.25 },

  /** Potongan pajak atas hasil investasi. */
  taxPct: { min: 0, max: 30, step: 1 },

  /** Porsi kebutuhan dalam anggaran. */
  needsPct: { min: 20, max: 80, step: 1 },
}

/* ------------------------------------------------------------------ *
 * BATAS INPUT MANUAL (CurrencyField)
 * ------------------------------------------------------------------ */

export const MAX = {
  /** Sisa pokok satu utang. */
  debtPrincipal: 10_000_000_000,
  /** Cicilan minimum bulanan satu utang. */
  debtMinPayment: 1_000_000_000,
  /** Nilai satu aset dalam portofolio. */
  assetValue: 100_000_000_000,
}

/* ------------------------------------------------------------------ *
 * TOMBOL PRESET
 * ------------------------------------------------------------------ */

export const PRESETS = {
  expenses: [
    { label: '3 jt', value: 3_000_000 },
    { label: '5 jt', value: 5_000_000 },
    { label: '10 jt', value: 10_000_000 },
  ],

  lumpSumDca: [
    { label: 'Tanpa modal awal', value: 0 },
    { label: '10 jt', value: 10_000_000 },
    { label: '50 jt', value: 50_000_000 },
  ],

  lumpSumCompare: [
    { label: 'Nol', value: 0 },
    { label: '10 jt', value: 10_000_000 },
    { label: '100 jt', value: 100_000_000 },
  ],

  monthlyDepositDca: [
    { label: '500 rb', value: 500_000 },
    { label: '1 jt', value: 1_000_000 },
    { label: '2 jt', value: 2_000_000 },
    { label: '5 jt', value: 5_000_000 },
  ],

  monthlyDepositCompare: [
    { label: '500 rb', value: 500_000 },
    { label: '1 jt', value: 1_000_000 },
    { label: '3 jt', value: 3_000_000 },
  ],

  goalTarget: [
    { label: '20 jt', value: 20_000_000 },
    { label: '100 jt', value: 100_000_000 },
    { label: '500 jt', value: 500_000_000 },
  ],

  inflationAmount: [
    { label: '10 jt', value: 10_000_000 },
    { label: '100 jt', value: 100_000_000 },
    { label: '500 jt', value: 500_000_000 },
  ],

  loanPrincipal: [
    { label: '50 jt', value: 50_000_000 },
    { label: '300 jt', value: 300_000_000 },
    { label: '800 jt', value: 800_000_000 },
  ],

  passiveTarget: [
    { label: '1 jt', value: 1_000_000 },
    { label: '5 jt', value: 5_000_000 },
    { label: '10 jt', value: 10_000_000 },
  ],

  extraPayment: [
    { label: 'Tanpa ekstra', value: 0 },
    { label: '500 rb', value: 500_000 },
    { label: '1 jt', value: 1_000_000 },
    { label: '2 jt', value: 2_000_000 },
  ],

  freshMoney: [
    { label: 'Tanpa dana baru', value: 0 },
    { label: '1 jt', value: 1_000_000 },
    { label: '5 jt', value: 5_000_000 },
  ],

  /* ---- Preset non-rupiah ---- */

  years: [
    { label: '5 th', value: 5 },
    { label: '10 th', value: 10 },
    { label: '20 th', value: 20 },
    { label: '30 th', value: 30 },
  ],

  goalMonths: [
    { label: '6 bln', value: 6 },
    { label: '1 th', value: 12 },
    { label: '2 th', value: 24 },
    { label: '3 th', value: 36 },
    { label: '5 th', value: 60 },
  ],

  loanMonths: [
    { label: '1 th', value: 12 },
    { label: '5 th', value: 60 },
    { label: '10 th', value: 120 },
    { label: '15 th', value: 180 },
    { label: '20 th', value: 240 },
  ],

  loanRate: [
    { label: 'KPR ~11%', value: 11 },
    { label: 'Mobil ~7%', value: 7 },
    { label: 'KTA ~18%', value: 18 },
  ],

  inflationSector: [
    { label: 'Umum 3%', value: 3 },
    { label: 'Umum 4%', value: 4 },
    { label: 'Pendidikan 10%', value: 10 },
    { label: 'Kesehatan 12%', value: 12 },
  ],

  inflationBasic: [
    { label: '3%', value: 3 },
    { label: '4%', value: 4 },
    { label: '5%', value: 5 },
  ],

  returnProfile: [
    { label: 'Konservatif 5%', value: 5 },
    { label: 'Moderat 8%', value: 8 },
    { label: 'Agresif 12%', value: 12 },
  ],

  goalReturnProfile: [
    { label: 'Pasar uang 5%', value: 5 },
    { label: 'Obligasi 6%', value: 6 },
    { label: 'Campuran 8%', value: 8 },
  ],

  withdrawalRate: [
    { label: 'Hati-hati 3%', value: 3 },
    { label: 'Standar 4%', value: 4 },
    { label: 'Agresif 5%', value: 5 },
  ],

  retirementAge: [
    { label: '45', value: 45 },
    { label: '55', value: 55 },
    { label: '60', value: 60 },
  ],

  tax: [
    { label: 'Tanpa pajak', value: 0 },
    { label: '10%', value: 10 },
  ],
}

/* ------------------------------------------------------------------ *
 * ANGKA ACUAN untuk narasi di UI
 * ------------------------------------------------------------------ */

/** Harga satu gelas kopi, dipakai membandingkan setoran harian agar terasa nyata. */
export const COFFEE_PRICE = 25_000

/** Satuan "per Rp100 juta modal" pada modul passive income. */
export const CAPITAL_UNIT = 100_000_000

/** Di bawah nilai ini, selisih penghematan bunga dianggap tidak signifikan. */
export const MINOR_SAVING_THRESHOLD = 500_000

/** Tangga target penghasilan pasif bulanan, supaya target besar terasa bertahap. */
export const PASSIVE_LADDER_STEPS = [
  500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000,
]
