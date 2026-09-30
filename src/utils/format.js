/**
 * Helper format angka & mata uang (locale id-ID).
 * Semua fungsi aman terhadap nilai null/NaN supaya UI tidak pernah menampilkan "NaN".
 */

const safe = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
})

/**
 * 10000000 -> "Rp10.000.000"
 * Intl menyisipkan non-breaking space setelah "Rp"; kita buang supaya gayanya
 * konsisten dengan formatRupiahCompact ("Rp384 jt") dan sesuai kebiasaan penulisan Indonesia.
 */
export const formatRupiah = (value) =>
  rupiahFormatter.format(Math.round(safe(value))).replace(/\u00a0/g, '')

/** 10000000 -> "10.000.000" (tanpa prefix, untuk input) */
export const formatNumber = (value) => numberFormatter.format(Math.round(safe(value)))

/** Angka desimal dengan jumlah digit tertentu: 3.456 -> "3,46" */
export const formatDecimal = (value, digits = 2) =>
  new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(safe(value))

/**
 * Versi ringkas untuk label chart & angka besar.
 * 1_250_000_000 -> "Rp1,25 M" | 12_500_000 -> "Rp12,5 jt" | 45_000 -> "Rp45 rb"
 */
export function formatRupiahCompact(value, { withPrefix = true } = {}) {
  const n = safe(value)
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  const prefix = withPrefix ? 'Rp' : ''

  const build = (divisor, suffix, digits) => {
    const scaled = abs / divisor
    // Tampilkan desimal hanya bila menambah informasi (mis. 1,25 M tapi 12 jt)
    const d = scaled >= 100 ? 0 : scaled >= 10 ? 1 : digits
    return `${sign}${prefix}${formatDecimal(scaled, d).replace(/,0+$/, '')} ${suffix}`
  }

  if (abs >= 1e12) return build(1e12, 'T', 2)
  if (abs >= 1e9) return build(1e9, 'M', 2)
  if (abs >= 1e6) return build(1e6, 'jt', 2)
  if (abs >= 1e3) return build(1e3, 'rb', 1)
  return `${sign}${prefix}${formatNumber(abs)}`
}

/** 12.5 -> "12,5%" */
export function formatPercent(value, digits = 1) {
  const n = safe(value)
  const d = Number.isInteger(n) ? 0 : digits
  return `${formatDecimal(n, d)}%`
}

/** Ambil hanya digit dari string input pengguna: "Rp1.250.000" -> 1250000 */
export function parseNumeric(input) {
  if (typeof input === 'number') return safe(input)
  const digits = String(input ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

/** 14 -> "1 tahun 2 bulan" */
export function formatMonthsToHuman(totalMonths) {
  const m = Math.max(0, Math.round(safe(totalMonths)))
  if (m === 0) return 'Kurang dari 1 bulan'
  const years = Math.floor(m / 12)
  const months = m % 12
  const parts = []
  if (years) parts.push(`${years} tahun`)
  if (months) parts.push(`${months} bulan`)
  return parts.join(' ')
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

/** Tanggal yang jatuh N bulan dari sekarang -> "Maret 2028" */
export function monthsFromNowLabel(monthsAhead) {
  const base = new Date()
  const target = new Date(base.getFullYear(), base.getMonth() + Math.round(safe(monthsAhead)), 1)
  return `${MONTH_NAMES[target.getMonth()]} ${target.getFullYear()}`
}

/** Batasi nilai ke rentang tertentu */
export const clamp = (value, min, max) => Math.min(Math.max(safe(value), min), max)
