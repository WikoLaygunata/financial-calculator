/**
 * Registry modul — satu sumber kebenaran untuk navigasi, router, dan kartu di dashboard.
 * Menambah modul baru cukup dengan menambahkan entri di sini + file view-nya.
 */

export const STAGES = [
  {
    id: 'fondasi',
    label: 'Tahap 1 · Fondasi Keamanan',
    short: 'Fondasi',
    icon: '🧱',
    description:
      'Amankan dulu dasarnya: bantalan dana darurat, arus kas yang sehat, dan utang yang terkendali.',
    accent: 'emerald',
  },
  {
    id: 'target',
    label: 'Tahap 2 · Target & Masa Depan',
    short: 'Target',
    icon: '🎯',
    description:
      'Setelah fondasi aman, tentukan ke mana uangmu mau dibawa: barang impian, pensiun, atau penghasilan pasif.',
    accent: 'sky',
  },
  {
    id: 'strategi',
    label: 'Tahap 3 · Strategi Investasi',
    short: 'Strategi',
    icon: '📈',
    description:
      'Bagian eksekusi: cara menyetor rutin, memilih instrumen, dan menjaga porsi portofolio tetap seimbang.',
    accent: 'brand',
  },
  {
    id: 'literasi',
    label: 'Literasi',
    short: 'Literasi',
    icon: '📚',
    description: 'Kamus istilah finansial dengan bahasa sehari-hari.',
    accent: 'amber',
  },
]

export const MODULES = [
  /* ---------- TAHAP 1: FONDASI ---------- */
  {
    id: 'dana-darurat',
    path: '/dana-darurat',
    title: 'Kalkulator Dana Darurat',
    short: 'Dana Darurat',
    icon: '🛟',
    stage: 'fondasi',
    tagline: 'Berapa bantalan yang kamu butuhkan sebelum mulai investasi?',
    description:
      'Hitung target dana darurat ideal berdasarkan status tanggungan dan stabilitas penghasilanmu.',
  },
  {
    id: 'anggaran',
    path: '/anggaran',
    title: 'Pembagi Anggaran Bulanan',
    short: 'Anggaran',
    icon: '🧾',
    stage: 'fondasi',
    tagline: 'Bagi gaji ke kebutuhan, keinginan, dan tabungan.',
    description:
      'Pola 50/30/20 dan variasinya, lalu bandingkan dengan pengeluaran aslimu untuk melihat celahnya.',
  },
  {
    id: 'kesehatan-cicilan',
    path: '/kesehatan-cicilan',
    title: 'Cek Kesehatan Cicilan',
    short: 'Cek Cicilan',
    icon: '⚖️',
    stage: 'fondasi',
    tagline: 'Masih aman ambil cicilan baru, atau sudah lampu merah?',
    description:
      'Hitung Debt Service Ratio (DSR) dan lihat sisa kuota cicilan yang masih aman untuk kondisimu.',
  },
  {
    id: 'bebas-utang',
    path: '/bebas-utang',
    title: 'Simulasi Bebas Utang',
    short: 'Bebas Utang',
    icon: '🔓',
    stage: 'fondasi',
    tagline: 'Snowball atau Avalanche, mana yang lebih cocok?',
    description:
      'Bandingkan dua metode pelunasan utang, lihat tanggal bebas utang dan total bunga yang bisa dihemat.',
  },
  {
    id: 'simulasi-pinjaman',
    path: '/simulasi-pinjaman',
    title: 'Simulasi Cicilan Pinjaman',
    short: 'Cicilan Pinjaman',
    icon: '🏦',
    stage: 'fondasi',
    tagline: 'Lihat cicilan bulanan dan total bunga sebelum tanda tangan.',
    description:
      'Hitung cicilan tetap (anuitas) untuk KPR, kendaraan, atau pinjaman lain, lengkap dengan porsi bunga vs pokok.',
  },

  /* ---------- TAHAP 2: TARGET ---------- */
  {
    id: 'target-impian',
    path: '/target-impian',
    title: 'Kalkulator Target Impian',
    short: 'Target Impian',
    icon: '✨',
    stage: 'target',
    tagline: 'Ubah keinginan jadi setoran harian yang terasa ringan.',
    description:
      'Tentukan target nominal dan tenggat waktunya, lalu lihat berapa yang harus disisihkan per hari, minggu, dan bulan.',
  },
  {
    id: 'pensiun',
    path: '/pensiun',
    title: 'Simulasi Target Pensiun',
    short: 'Pensiun (FIRE)',
    icon: '🌅',
    stage: 'target',
    tagline: 'Berapa "angka pensiun" yang harus kamu kumpulkan?',
    description:
      'Perhitungan dana pensiun yang sudah memperhitungkan inflasi, dengan pendekatan Safe Withdrawal Rate.',
  },
  {
    id: 'passive-income',
    path: '/passive-income',
    title: 'Kalkulator Passive Income',
    short: 'Passive Income',
    icon: '💸',
    stage: 'target',
    tagline: 'Modal berapa untuk "gajian" tanpa bekerja?',
    description:
      'Hitung modal yang harus terkumpul agar hasil bunga atau dividennya menutupi target penghasilan bulananmu.',
  },
  {
    id: 'inflasi',
    path: '/inflasi',
    title: 'Mesin Waktu Inflasi',
    short: 'Efek Inflasi',
    icon: '⏳',
    stage: 'target',
    tagline: 'Uang diam itu menyusut. Ini buktinya.',
    description:
      'Lihat bagaimana inflasi mengubah harga barang dan menggerus daya beli uang yang hanya disimpan.',
  },

  /* ---------- TAHAP 3: STRATEGI ---------- */
  {
    id: 'dca',
    path: '/dca',
    title: 'Simulasi DCA & Bunga Berbunga',
    short: 'Simulasi DCA',
    icon: '🌱',
    stage: 'strategi',
    tagline: 'Lihat kapan bunga mulai bekerja lebih keras dari setoranmu.',
    description:
      'Proyeksi investasi rutin bulanan, dengan pemisahan jelas antara uang yang kamu setor dan hasil pertumbuhannya.',
  },
  {
    id: 'bandingkan-aset',
    path: '/bandingkan-aset',
    title: 'Perbandingan Instrumen Investasi',
    short: 'Bandingkan Aset',
    icon: '🆚',
    stage: 'strategi',
    tagline: 'Deposito, emas, atau index fund? Lihat selisihnya.',
    description:
      'Bandingkan proyeksi pertumbuhan beberapa instrumen sekaligus memakai asumsi return rata-rata historis.',
  },
  {
    id: 'rebalancing',
    path: '/rebalancing',
    title: 'Kalkulator Rebalancing',
    short: 'Rebalancing',
    icon: '🧭',
    stage: 'strategi',
    tagline: 'Kembalikan porsi portofolio ke rencana awal.',
    description:
      'Dapatkan instruksi beli/jual yang konkret agar alokasi asetmu kembali sesuai target.',
  },

  /* ---------- LITERASI ---------- */
  {
    id: 'kamus',
    path: '/kamus',
    title: 'Kamus Finansial',
    short: 'Kamus',
    icon: '📖',
    stage: 'literasi',
    tagline: 'Istilah finansial, dijelaskan tanpa bikin pusing.',
    description:
      'Kumpulan istilah yang sering muncul di aplikasi ini, dijelaskan dengan bahasa sehari-hari dan contoh nyata.',
  },
]

export const getModule = (id) => MODULES.find((m) => m.id === id)

export const getStage = (id) => STAGES.find((s) => s.id === id)

export const modulesByStage = (stageId) => MODULES.filter((m) => m.stage === stageId)

/** Label stage untuk breadcrumb di ModuleLayout. */
export const stageLabel = (stageId) => getStage(stageId)?.label ?? ''
