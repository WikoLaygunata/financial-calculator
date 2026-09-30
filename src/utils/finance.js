/**
 * Mesin perhitungan finansial Financi.
 *
 * Semua fungsi di sini murni (pure): tidak menyentuh DOM, tidak memanggil network.
 * Ini sengaja dipisah dari komponen agar logikanya mudah dibaca, diuji, dan diaudit.
 *
 * Catatan konvensi bunga:
 * - Untuk INVESTASI kita pakai bunga efektif: return tahunan dikonversi ke bulanan
 *   dengan (1 + r)^(1/12) - 1. Jadi "8% per tahun" benar-benar menghasilkan 8% setahun.
 * - Untuk UTANG/PINJAMAN kita pakai bunga nominal: apr / 12. Ini konvensi yang
 *   dipakai bank & fintech di Indonesia saat menghitung cicilan.
 */

const num = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/** Konversi return tahunan (persen) ke rate bulanan efektif. */
export function effectiveMonthlyRate(annualPct) {
  const a = num(annualPct) / 100
  if (a <= -1) return -1
  return Math.pow(1 + a, 1 / 12) - 1
}

/** Konversi bunga tahunan (persen) ke rate bulanan nominal — dipakai untuk utang. */
export function nominalMonthlyRate(annualPct) {
  return num(annualPct) / 100 / 12
}

/* ------------------------------------------------------------------ *
 * 1. DANA DARURAT
 * ------------------------------------------------------------------ */

export const DEPENDENT_OPTIONS = [
  { value: 'single', label: 'Single', multiplier: 3, note: 'Tanggungan hanya diri sendiri' },
  { value: 'married', label: 'Menikah', multiplier: 6, note: 'Sudah ada pasangan' },
  {
    value: 'family',
    label: 'Menikah + Anak',
    multiplier: 12,
    note: 'Ada anak yang bergantung padamu',
  },
]

export const JOB_OPTIONS = [
  {
    value: 'employee',
    label: 'Karyawan Tetap',
    extra: 0,
    note: 'Penghasilan relatif stabil tiap bulan',
  },
  {
    value: 'contract',
    label: 'Kontrak / Probation',
    extra: 2,
    note: 'Ada risiko kontrak tidak diperpanjang',
  },
  {
    value: 'freelancer',
    label: 'Freelancer / Pebisnis',
    extra: 3,
    note: 'Penghasilan naik-turun, butuh bantalan lebih tebal',
  },
]

/**
 * Target dana darurat = pengeluaran bulanan x (multiplier status + tambahan pekerjaan).
 */
export function emergencyFund({ monthlyExpenses, dependents, jobType, alreadySaved = 0 }) {
  const base = DEPENDENT_OPTIONS.find((o) => o.value === dependents) ?? DEPENDENT_OPTIONS[0]
  const job = JOB_OPTIONS.find((o) => o.value === jobType) ?? JOB_OPTIONS[0]

  const multiplier = base.multiplier + job.extra
  const expenses = Math.max(0, num(monthlyExpenses))
  const target = expenses * multiplier
  const saved = Math.max(0, num(alreadySaved))
  const remaining = Math.max(0, target - saved)
  const progressPct = target > 0 ? Math.min(100, (saved / target) * 100) : 0

  return {
    multiplier,
    baseMultiplier: base.multiplier,
    jobExtra: job.extra,
    target,
    saved,
    remaining,
    progressPct,
    /** Berapa bulan pengeluaran yang sudah tercover dana darurat saat ini. */
    monthsCovered: expenses > 0 ? saved / expenses : 0,
    statusLevel: progressPct >= 100 ? 'safe' : progressPct >= 50 ? 'warn' : 'danger',
  }
}

/* ------------------------------------------------------------------ *
 * 2. DEBT SERVICE RATIO (DSR)
 * ------------------------------------------------------------------ */

export const DSR_SAFE_LIMIT = 30
export const DSR_WARN_LIMIT = 50

export function debtServiceRatio({ monthlyIncome, monthlyDebt }) {
  const income = Math.max(0, num(monthlyIncome))
  const debt = Math.max(0, num(monthlyDebt))
  const ratio = income > 0 ? (debt / income) * 100 : 0

  const level = ratio <= DSR_SAFE_LIMIT ? 'safe' : ratio <= DSR_WARN_LIMIT ? 'warn' : 'danger'

  const safeCeiling = income * (DSR_SAFE_LIMIT / 100)

  return {
    ratio,
    level,
    /** Batas total cicilan agar tetap di zona aman (30% penghasilan). */
    safeCeiling,
    /** Sisa kuota cicilan baru yang masih aman diambil. */
    headroom: Math.max(0, safeCeiling - debt),
    /** Kelebihan cicilan di atas batas aman (kalau ada). */
    overLimit: Math.max(0, debt - safeCeiling),
    takeHome: Math.max(0, income - debt),
  }
}

/* ------------------------------------------------------------------ *
 * 3. BEBAS UTANG — SNOWBALL vs AVALANCHE
 * ------------------------------------------------------------------ */

const sortByStrategy = (debts, strategy) => {
  const copy = [...debts]
  if (strategy === 'avalanche') {
    // Bunga tertinggi dulu — paling hemat secara matematis.
    copy.sort((a, b) => b.apr - a.apr || a.balance - b.balance)
  } else {
    // Saldo terkecil dulu — cepat terasa "menang", bagus untuk motivasi.
    copy.sort((a, b) => a.balance - b.balance || b.apr - a.apr)
  }
  return copy
}

/**
 * Simulasi pelunasan utang bulan per bulan.
 *
 * Tiap bulan: bunga berjalan ditambahkan ke saldo, lalu seluruh anggaran
 * (total cicilan minimum + dana ekstra) dibagikan. Minimum dibayar ke semua
 * utang, sisanya ditumpuk ke utang prioritas sesuai strategi. Ketika satu utang
 * lunas, cicilan minimumnya ikut mengalir ke utang berikutnya — inilah efek
 * "snowball" yang mempercepat pelunasan.
 *
 * @param {'snowball'|'avalanche'} strategy
 */
export function simulateDebtPayoff(rawDebts, extraPayment = 0, strategy = 'snowball', maxMonths = 720) {
  const debts = (rawDebts ?? [])
    .map((d, i) => ({
      id: d.id ?? i,
      name: d.name || `Utang ${i + 1}`,
      balance: Math.max(0, num(d.principal ?? d.balance)),
      apr: Math.max(0, num(d.apr)),
      minPayment: Math.max(0, num(d.minPayment)),
    }))
    .filter((d) => d.balance > 0)

  const empty = {
    months: 0,
    totalInterest: 0,
    totalPaid: 0,
    timeline: [{ month: 0, balance: 0 }],
    payoffOrder: [],
    order: [],
    unresolved: false,
    monthlyBudget: 0,
  }

  if (!debts.length) return empty

  const totalMinimum = debts.reduce((sum, d) => sum + d.minPayment, 0)
  const monthlyBudget = totalMinimum + Math.max(0, num(extraPayment))
  const startingBalance = debts.reduce((sum, d) => sum + d.balance, 0)

  // Kalau anggaran tidak menutup bunga bulan pertama, utang tidak akan pernah lunas.
  const firstMonthInterest = debts.reduce((s, d) => s + d.balance * nominalMonthlyRate(d.apr), 0)
  if (monthlyBudget <= firstMonthInterest) {
    return {
      ...empty,
      unresolved: true,
      monthlyBudget,
      startingBalance,
      minimumNeeded: firstMonthInterest,
      timeline: [{ month: 0, balance: startingBalance }],
      order: sortByStrategy(debts, strategy).map((d) => d.name),
    }
  }

  const priority = sortByStrategy(debts, strategy)
  const order = priority.map((d) => d.name)

  let month = 0
  let totalInterest = 0
  let totalPaid = 0
  const payoffOrder = []
  const timeline = [{ month: 0, balance: startingBalance }]

  while (priority.some((d) => d.balance > 0.005) && month < maxMonths) {
    month += 1
    let budget = monthlyBudget

    // (a) Bunga berjalan
    for (const d of priority) {
      if (d.balance <= 0) continue
      const interest = d.balance * nominalMonthlyRate(d.apr)
      d.balance += interest
      totalInterest += interest
    }

    // (b) Bayar cicilan minimum ke semua utang aktif
    for (const d of priority) {
      if (d.balance <= 0 || budget <= 0) continue
      const pay = Math.min(d.minPayment, d.balance, budget)
      d.balance -= pay
      budget -= pay
      totalPaid += pay
    }

    // (c) Sisa anggaran ditumpuk ke utang prioritas teratas
    for (const d of priority) {
      if (budget <= 0.005) break
      if (d.balance <= 0) continue
      const pay = Math.min(budget, d.balance)
      d.balance -= pay
      budget -= pay
      totalPaid += pay
    }

    // (d) Catat utang yang lunas bulan ini
    for (const d of priority) {
      if (d.balance <= 0.005 && !payoffOrder.some((p) => p.id === d.id)) {
        d.balance = 0
        payoffOrder.push({ id: d.id, name: d.name, month })
      }
    }

    timeline.push({
      month,
      balance: priority.reduce((sum, d) => sum + Math.max(0, d.balance), 0),
    })
  }

  return {
    months: month,
    totalInterest,
    totalPaid,
    timeline,
    payoffOrder,
    order,
    monthlyBudget,
    startingBalance,
    unresolved: month >= maxMonths,
  }
}

/** Bandingkan kedua strategi sekaligus dan hitung selisih penghematannya. */
export function compareDebtStrategies(debts, extraPayment = 0) {
  const snowball = simulateDebtPayoff(debts, extraPayment, 'snowball')
  const avalanche = simulateDebtPayoff(debts, extraPayment, 'avalanche')

  return {
    snowball,
    avalanche,
    interestSaved: Math.max(0, snowball.totalInterest - avalanche.totalInterest),
    monthsSaved: Math.max(0, snowball.months - avalanche.months),
    /** Strategi mana yang lebih hemat; bisa seri kalau utangnya cuma satu. */
    winner:
      Math.abs(snowball.totalInterest - avalanche.totalInterest) < 1
        ? 'tie'
        : avalanche.totalInterest < snowball.totalInterest
          ? 'avalanche'
          : 'snowball',
  }
}

/* ------------------------------------------------------------------ *
 * 4. CICILAN PINJAMAN (ANUITAS)
 * ------------------------------------------------------------------ */

/**
 * Hitung cicilan bulanan tetap (anuitas) untuk sebuah pinjaman,
 * plus jadwal amortisasi pokok vs bunga.
 */
export function loanInstallment({ principal, annualRatePct, months }) {
  const P = Math.max(0, num(principal))
  const n = Math.max(1, Math.round(num(months)))
  const r = nominalMonthlyRate(annualRatePct)

  const payment = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n))

  const schedule = []
  let balance = P
  let totalInterest = 0

  for (let i = 1; i <= n; i += 1) {
    const interest = balance * r
    const principalPart = Math.min(payment - interest, balance)
    balance = Math.max(0, balance - principalPart)
    totalInterest += interest
    schedule.push({
      month: i,
      payment: principalPart + interest,
      interest,
      principal: principalPart,
      balance,
    })
  }

  return {
    payment,
    months: n,
    totalInterest,
    totalPayment: P + totalInterest,
    schedule,
    /** Rasio bunga terhadap pokok — bikin "mahalnya" pinjaman terasa nyata. */
    interestRatioPct: P > 0 ? (totalInterest / P) * 100 : 0,
  }
}

/* ------------------------------------------------------------------ *
 * 5. INVESTASI: FUTURE VALUE, DCA & COMPOUNDING
 * ------------------------------------------------------------------ */

/**
 * Proyeksi pertumbuhan investasi: modal awal + setoran rutin bulanan.
 * Mengembalikan seri bulanan dan tahunan agar siap dipakai chart.
 */
export function projectInvestment({ initial = 0, monthly = 0, annualReturnPct = 8, years = 10 }) {
  const r = effectiveMonthlyRate(annualReturnPct)
  const totalMonths = Math.max(1, Math.round(num(years) * 12))
  const start = Math.max(0, num(initial))
  const deposit = Math.max(0, num(monthly))

  let balance = start
  let contributed = start

  const monthlySeries = [{ month: 0, balance, contributed, growth: 0 }]
  const yearlySeries = [{ year: 0, balance, contributed, growth: 0 }]

  for (let m = 1; m <= totalMonths; m += 1) {
    // Setoran di awal bulan, lalu ikut berbunga bulan itu.
    balance = (balance + deposit) * (1 + r)
    contributed += deposit

    const point = { month: m, balance, contributed, growth: balance - contributed }
    monthlySeries.push(point)
    if (m % 12 === 0) {
      yearlySeries.push({ year: m / 12, balance, contributed, growth: balance - contributed })
    }
  }

  // Pastikan titik akhir selalu masuk walau durasinya bukan kelipatan 12 bulan.
  const last = monthlySeries[monthlySeries.length - 1]
  if (yearlySeries[yearlySeries.length - 1].balance !== last.balance) {
    yearlySeries.push({
      year: totalMonths / 12,
      balance: last.balance,
      contributed: last.contributed,
      growth: last.growth,
    })
  }

  return {
    finalBalance: balance,
    totalContributed: contributed,
    totalGrowth: balance - contributed,
    growthSharePct: balance > 0 ? ((balance - contributed) / balance) * 100 : 0,
    monthlySeries,
    yearlySeries,
    monthlyRate: r,
  }
}

/**
 * Setoran bulanan yang dibutuhkan untuk mencapai target nominal.
 * Rumus PMT dari future value of annuity-due.
 */
export function requiredMonthlyDeposit({ target, initial = 0, annualReturnPct = 0, months }) {
  const FV = Math.max(0, num(target))
  const PV = Math.max(0, num(initial))
  const n = Math.max(1, Math.round(num(months)))
  const r = effectiveMonthlyRate(annualReturnPct)

  const futureOfInitial = PV * Math.pow(1 + r, n)
  const gap = FV - futureOfInitial

  if (gap <= 0) return { monthly: 0, futureOfInitial, gap: 0, alreadyEnough: true }

  // Annuity-due: setoran dilakukan di awal bulan.
  const monthly =
    r === 0 ? gap / n : (gap * r) / ((Math.pow(1 + r, n) - 1) * (1 + r))

  return { monthly, futureOfInitial, gap, alreadyEnough: false }
}

/* ------------------------------------------------------------------ *
 * 6. TARGET IMPIAN (GOAL-BASED SAVING)
 * ------------------------------------------------------------------ */

export function goalPlan({ target, months, initial = 0, annualReturnPct = 0 }) {
  const { monthly, alreadyEnough } = requiredMonthlyDeposit({
    target,
    initial,
    annualReturnPct,
    months,
  })

  const plain = Math.max(0, (num(target) - num(initial)) / Math.max(1, num(months)))

  return {
    perMonth: monthly,
    perWeek: (monthly * 12) / 52,
    perDay: (monthly * 12) / 365,
    alreadyEnough,
    /** Setoran bila menabung biasa tanpa bantuan return investasi. */
    plainPerMonth: plain,
    /** Berapa besar beban setoran yang "dibantu" oleh imbal hasil investasi. */
    helpedByReturns: Math.max(0, plain - monthly),
  }
}

/* ------------------------------------------------------------------ *
 * 7. PENSIUN / FIRE
 * ------------------------------------------------------------------ */

/**
 * Perencanaan dana pensiun dengan pendekatan Safe Withdrawal Rate.
 * SWR 4% setara dengan "Rule of 25" (dana = 25x pengeluaran tahunan).
 */
export function retirementPlan({
  currentAge,
  retirementAge,
  monthlyExpenseToday,
  inflationPct = 4,
  returnPct = 8,
  currentAssets = 0,
  withdrawalRatePct = 4,
}) {
  const yearsToRetire = Math.max(0, num(retirementAge) - num(currentAge))
  const months = Math.round(yearsToRetire * 12)
  const inflation = num(inflationPct) / 100
  const swr = Math.max(0.5, num(withdrawalRatePct)) / 100

  const expenseToday = Math.max(0, num(monthlyExpenseToday))
  // Nilai masa depan dari pengeluaran bulanan, digerus inflasi.
  const monthlyExpenseAtRetirement = expenseToday * Math.pow(1 + inflation, yearsToRetire)
  const target = (monthlyExpenseAtRetirement * 12) / swr

  const { monthly, futureOfInitial, alreadyEnough } = requiredMonthlyDeposit({
    target,
    initial: currentAssets,
    annualReturnPct: returnPct,
    months: Math.max(1, months),
  })

  // Return riil = pertumbuhan setelah dikurangi inflasi (rumus Fisher).
  const realReturnPct = ((1 + num(returnPct) / 100) / (1 + inflation) - 1) * 100

  return {
    yearsToRetire,
    months,
    monthlyExpenseAtRetirement,
    target,
    multiplier: 1 / swr,
    requiredMonthly: monthly,
    projectedFromCurrentAssets: futureOfInitial,
    alreadyEnough,
    realReturnPct,
    /** Pengeluaran bulanan yang bisa ditarik nanti, dalam nilai uang hari ini. */
    monthlyWithdrawalInTodayValue: expenseToday,
  }
}

/* ------------------------------------------------------------------ *
 * 8. PASSIVE INCOME / DIVIDEN
 * ------------------------------------------------------------------ */

export const YIELD_PRESETS = [
  {
    value: 'sbn',
    label: 'SBN / Obligasi Negara',
    yieldPct: 6,
    note: 'Dijamin negara, kupon dibayar rutin. Risiko paling rendah.',
  },
  {
    value: 'rdpt',
    label: 'Reksadana Pendapatan Tetap',
    yieldPct: 7,
    note: 'Isinya obligasi. Nilainya bisa naik-turun sedikit.',
  },
  {
    value: 'dividen',
    label: 'Dividen Saham Bluechip',
    yieldPct: 8,
    note: 'Potensi lebih besar, tapi dividen tidak dijamin tiap tahun.',
  },
  {
    value: 'custom',
    label: 'Yield Sendiri',
    yieldPct: 6,
    note: 'Masukkan asumsi yield kamu sendiri.',
  },
]

/**
 * Modal yang harus terkumpul agar hasil investasinya menutupi target
 * penghasilan pasif bulanan — tanpa menggerus pokok.
 */
export function passiveIncomePlan({ monthlyTarget, yieldPct, taxPct = 0 }) {
  const target = Math.max(0, num(monthlyTarget))
  const grossYield = Math.max(0.01, num(yieldPct))
  const netYield = grossYield * (1 - Math.max(0, num(taxPct)) / 100)

  const annualTarget = target * 12
  const capital = annualTarget / (netYield / 100)

  return {
    annualTarget,
    netYieldPct: netYield,
    capital,
    /** Penghasilan pasif bulanan per Rp100 juta modal — enak buat "feel"-nya. */
    incomePer100M: (100_000_000 * (netYield / 100)) / 12,
  }
}

/* ------------------------------------------------------------------ *
 * 9. PERBANDINGAN INSTRUMEN INVESTASI
 * ------------------------------------------------------------------ */

export const ASSET_PRESETS = [
  { value: 'deposito', label: 'Deposito Bank', returnPct: 3.5, risk: 'Sangat rendah', color: '#64748b' },
  { value: 'rdpu', label: 'Reksadana Pasar Uang', returnPct: 5, risk: 'Rendah', color: '#0ea5e9' },
  { value: 'sbn', label: 'Obligasi Negara / SBN', returnPct: 6.2, risk: 'Rendah', color: '#14b8a6' },
  { value: 'rdpt', label: 'Reksadana Pendapatan Tetap', returnPct: 7.5, risk: 'Sedang', color: '#22c55e' },
  { value: 'emas', label: 'Emas / Logam Mulia', returnPct: 9, risk: 'Sedang', color: '#f59e0b' },
  { value: 'saham', label: 'Index Fund / Saham', returnPct: 11, risk: 'Tinggi', color: '#6366f1' },
]

/* ------------------------------------------------------------------ *
 * 10. REBALANCING PORTOFOLIO
 * ------------------------------------------------------------------ */

/**
 * Hitung instruksi beli/jual agar porsi aset kembali ke target alokasi.
 *
 * @param {Array<{key:string,label:string,targetPct:number,currentValue:number,color?:string}>} assets
 * @param {number} freshMoney  Dana baru yang siap disetor bulan ini.
 * @param {boolean} allowSell  Kalau false, hanya mengalokasikan dana baru (tanpa jual aset).
 */
export function rebalancePortfolio(assets, freshMoney = 0, allowSell = false) {
  const list = (assets ?? []).map((a) => ({
    ...a,
    targetPct: Math.max(0, num(a.targetPct)),
    currentValue: Math.max(0, num(a.currentValue)),
  }))

  const currentTotal = list.reduce((s, a) => s + a.currentValue, 0)
  const fresh = Math.max(0, num(freshMoney))
  const futureTotal = currentTotal + fresh
  const targetSum = list.reduce((s, a) => s + a.targetPct, 0)

  const rows = list.map((a) => {
    // Normalisasi target supaya tetap benar walau total belum tepat 100%.
    const normalizedTarget = targetSum > 0 ? (a.targetPct / targetSum) * 100 : 0
    const idealValue = futureTotal * (normalizedTarget / 100)
    return {
      ...a,
      normalizedTarget,
      currentPct: currentTotal > 0 ? (a.currentValue / currentTotal) * 100 : 0,
      idealValue,
      gap: idealValue - a.currentValue,
    }
  })

  if (allowSell) {
    // Mode penuh: jual yang kelebihan, beli yang kekurangan.
    return {
      mode: 'full',
      currentTotal,
      futureTotal,
      fresh,
      targetSum,
      rows: rows.map((r) => ({
        ...r,
        action: r.gap > 1000 ? 'buy' : r.gap < -1000 ? 'sell' : 'hold',
        amount: Math.abs(r.gap),
        finalValue: r.idealValue,
      })),
      leftover: 0,
    }
  }

  // Mode "beli saja": bagikan dana baru sebanding dengan besarnya kekurangan.
  const deficits = rows.map((r) => Math.max(0, r.gap))
  const deficitTotal = deficits.reduce((s, d) => s + d, 0)

  let allocated = 0
  const withBuy = rows.map((r, i) => {
    let amount = 0
    if (deficitTotal > 0 && fresh > 0) {
      amount = (deficits[i] / deficitTotal) * fresh
    } else if (fresh > 0) {
      // Semua aset sudah pas — sebar dana baru mengikuti target alokasi.
      amount = fresh * (r.normalizedTarget / 100)
    }
    allocated += amount
    return { ...r, action: amount > 1000 ? 'buy' : 'hold', amount, finalValue: r.currentValue + amount }
  })

  return {
    mode: 'buy-only',
    currentTotal,
    futureTotal,
    fresh,
    targetSum,
    rows: withBuy,
    leftover: Math.max(0, fresh - allocated),
    /** Aset yang porsinya paling jauh di bawah target. */
    mostUnderweight: withBuy.reduce(
      (worst, r) => (worst && worst.gap >= r.gap ? worst : r),
      null,
    ),
  }
}

/* ------------------------------------------------------------------ *
 * 11. INFLASI — MESIN WAKTU NILAI UANG
 * ------------------------------------------------------------------ */

export function inflationImpact({ amount, inflationPct = 4, years = 10 }) {
  const a = Math.max(0, num(amount))
  const i = num(inflationPct) / 100
  const y = Math.max(0, num(years))
  const factor = Math.pow(1 + i, y)

  const series = []
  for (let year = 0; year <= Math.ceil(y); year += 1) {
    const f = Math.pow(1 + i, Math.min(year, y))
    series.push({
      year: Math.min(year, y),
      futureCost: a * f,
      purchasingPower: a / f,
    })
  }

  return {
    factor,
    /** Harga barang yang sama di masa depan. */
    futureCost: a * factor,
    /** Daya beli uangmu hari ini kalau hanya didiamkan. */
    purchasingPower: a / factor,
    lostValue: a - a / factor,
    lostPct: (1 - 1 / factor) * 100,
    /** Return minimum agar uangmu tidak kalah dari inflasi. */
    breakEvenReturnPct: num(inflationPct),
    series,
  }
}

/* ------------------------------------------------------------------ *
 * 12. ANGGARAN 50/30/20
 * ------------------------------------------------------------------ */

export const BUDGET_PRESETS = [
  { value: 'balanced', label: '50 / 30 / 20', needs: 50, wants: 30, savings: 20, note: 'Standar klasik, cocok untuk mayoritas orang.' },
  { value: 'saver', label: '40 / 20 / 40', needs: 40, wants: 20, savings: 40, note: 'Agresif menabung, cocok saat gaji sudah nyaman.' },
  { value: 'tight', label: '60 / 20 / 20', needs: 60, wants: 20, savings: 20, note: 'Biaya hidup tinggi, tabungan tetap dijaga.' },
  { value: 'custom', label: 'Atur Sendiri', needs: 50, wants: 30, savings: 20, note: 'Geser sendiri sesuai kondisimu.' },
]

export function budgetPlan({ monthlyIncome, needsPct, wantsPct, actualNeeds = 0, actualWants = 0 }) {
  const income = Math.max(0, num(monthlyIncome))
  const needs = Math.max(0, num(needsPct))
  const wants = Math.max(0, num(wantsPct))
  const savings = Math.max(0, 100 - needs - wants)

  const plan = {
    needs: income * (needs / 100),
    wants: income * (wants / 100),
    savings: income * (savings / 100),
  }

  const spent = Math.max(0, num(actualNeeds)) + Math.max(0, num(actualWants))

  return {
    income,
    needsPct: needs,
    wantsPct: wants,
    savingsPct: savings,
    plan,
    actual: { needs: num(actualNeeds), wants: num(actualWants) },
    needsGap: plan.needs - num(actualNeeds),
    wantsGap: plan.wants - num(actualWants),
    realSavings: income - spent,
    realSavingsPct: income > 0 ? ((income - spent) / income) * 100 : 0,
    onTrack: income - spent >= plan.savings - 1,
  }
}

/* ------------------------------------------------------------------ *
 * 13. SKOR KESEHATAN FINANSIAL
 * ------------------------------------------------------------------ */

/**
 * 6 pertanyaan berbobot. Bobot dibuat tidak sama karena dampaknya berbeda:
 * dana darurat & rasio cicilan adalah fondasi, jadi nilainya paling besar.
 */
export const SCORECARD_QUESTIONS = [
  {
    id: 'emergency',
    weight: 22,
    question: 'Punya dana darurat minimal 3x pengeluaran bulanan?',
    why: 'Ini bantalan pertama saat kehilangan penghasilan atau ada kejadian mendadak.',
    fixRoute: '/dana-darurat',
    fixLabel: 'Hitung Dana Darurat',
  },
  {
    id: 'debt',
    weight: 22,
    question: 'Total cicilan per bulan di bawah 30% penghasilan?',
    why: 'Di atas 30%, arus kas jadi sesak dan kamu rentan gagal bayar.',
    fixRoute: '/kesehatan-cicilan',
    fixLabel: 'Cek Rasio Cicilan',
  },
  {
    id: 'saving',
    weight: 18,
    question: 'Rutin menyisihkan minimal 10% penghasilan untuk tabungan/investasi?',
    why: 'Menabung di awal bulan jauh lebih efektif daripada menunggu sisa.',
    fixRoute: '/anggaran',
    fixLabel: 'Atur Anggaran',
  },
  {
    id: 'protection',
    weight: 14,
    question: 'Punya asuransi kesehatan (BPJS/swasta) yang aktif?',
    why: 'Satu kali rawat inap tanpa proteksi bisa menghabiskan tabungan bertahun-tahun.',
    fixRoute: '/dana-darurat',
    fixLabel: 'Perkuat Fondasi',
  },
  {
    id: 'retirement',
    weight: 14,
    question: 'Sudah mulai menyiapkan dana pensiun / hari tua?',
    why: 'Makin awal mulai, makin ringan setoran bulanannya karena dibantu bunga berbunga.',
    fixRoute: '/pensiun',
    fixLabel: 'Simulasi Pensiun',
  },
  {
    id: 'invest',
    weight: 10,
    question: 'Sebagian uangmu sudah diinvestasikan, bukan hanya di tabungan?',
    why: 'Bunga tabungan biasanya kalah dari inflasi, jadi nilai uangmu menyusut diam-diam.',
    fixRoute: '/dca',
    fixLabel: 'Simulasi Investasi',
  },
]

export function scorecardResult(answers = {}) {
  const totalWeight = SCORECARD_QUESTIONS.reduce((s, q) => s + q.weight, 0)
  let earned = 0
  let answered = 0

  const details = SCORECARD_QUESTIONS.map((q) => {
    const value = answers[q.id]
    if (value === true) earned += q.weight
    if (value === true || value === false) answered += 1
    return { ...q, answer: value ?? null, passed: value === true }
  })

  const score = Math.round((earned / totalWeight) * 100)

  const status =
    score > 70
      ? { level: 'safe', label: 'Sangat Sehat', message: 'Fondasi keuanganmu kuat. Saatnya fokus mengoptimalkan strategi investasi.' }
      : score >= 40
        ? { level: 'warn', label: 'Cukup Sehat', message: 'Sudah di jalur yang benar. Tutup beberapa celah lagi supaya lebih aman.' }
        : { level: 'danger', label: 'Perlu Perhatian', message: 'Ada beberapa fondasi penting yang belum terpasang. Mulai dari satu hal dulu, tidak perlu semua sekaligus.' }

  return {
    score,
    status,
    details,
    answeredCount: answered,
    totalCount: SCORECARD_QUESTIONS.length,
    /** Prioritas perbaikan: yang belum lolos, diurutkan dari bobot terbesar. */
    priorities: details.filter((d) => d.answer !== true).sort((a, b) => b.weight - a.weight),
  }
}

/* ------------------------------------------------------------------ *
 * UTILITAS UMUM
 * ------------------------------------------------------------------ */

/** Rasio menabung: berapa persen penghasilan yang tidak habis dipakai. */
export function savingsRate({ monthlyIncome, monthlyExpenses, monthlyDebt = 0 }) {
  const income = Math.max(0, num(monthlyIncome))
  const out = Math.max(0, num(monthlyExpenses)) + Math.max(0, num(monthlyDebt))
  if (income <= 0) return { pct: 0, surplus: 0 }
  return { pct: ((income - out) / income) * 100, surplus: income - out }
}
