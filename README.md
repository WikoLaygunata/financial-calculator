# Financi

Teman belajar dan menghitung finansial. Aplikasi web yang membantu literasi keuangan
lewat 13 kalkulator interaktif, dengan penjelasan di setiap fitur.

**Filosofi: client-side first.** Semua perhitungan berjalan 100% di browser pengguna.
Tidak ada server, tidak ada login, tidak ada data yang dikirim ke mana pun.

## Fitur

### Dashboard

Checklist kesehatan finansial: 6 pertanyaan berbobot yang menghasilkan skor 0–100,
lengkap dengan status, prioritas perbaikan, dan tautan langsung ke kalkulator yang relevan.
Bobot dibuat tidak sama karena dampaknya berbeda — dana darurat dan rasio cicilan
masing-masing bernilai 22 poin karena keduanya fondasi arus kas.

### Tahap 1 — Fondasi Keamanan

| Modul | Fungsi |
| --- | --- |
| Dana Darurat | Target bantalan ideal berdasarkan status tanggungan dan stabilitas penghasilan |
| Pembagi Anggaran | Pola 50/30/20 dan variasinya, dibandingkan dengan pengeluaran asli |
| Cek Kesehatan Cicilan | Debt Service Ratio (DSR) dengan zona aman/waspada/berisiko |
| Simulasi Bebas Utang | Perbandingan metode Snowball vs Avalanche, bulan demi bulan |
| Simulasi Cicilan Pinjaman | Cicilan anuitas + jadwal amortisasi pokok vs bunga |

### Tahap 2 — Target & Masa Depan

| Modul | Fungsi |
| --- | --- |
| Target Impian | Setoran harian/mingguan/bulanan untuk mencapai target nominal |
| Target Pensiun (FIRE) | Dana pensiun dengan pendekatan Safe Withdrawal Rate, sudah memperhitungkan inflasi |
| Passive Income | Modal yang dibutuhkan agar hasil investasi menutupi target penghasilan bulanan |
| Mesin Waktu Inflasi | Efek inflasi terhadap harga barang dan daya beli uang |

### Tahap 3 — Strategi Investasi

| Modul | Fungsi |
| --- | --- |
| Simulasi DCA | Proyeksi investasi rutin, memisahkan setoran vs hasil pertumbuhan |
| Perbandingan Instrumen | Proyeksi pertumbuhan hingga 4 instrumen sekaligus |
| Rebalancing Portofolio | Instruksi beli/jual konkret untuk mengembalikan porsi aset ke target |

### Literasi

**Kamus Finansial** — 25 istilah dengan penjelasan bahasa sehari-hari, contoh angka nyata,
pencarian, dan filter kategori.

## Keputusan desain

**Shared state.** Profil Keuangan (penghasilan, pengeluaran, cicilan, usia, aset) adalah
sumber kebenaran tunggal di `src/stores/financeStore.js`. Mengubah gaji di kalkulator DSR
langsung memengaruhi perhitungan anggaran, pensiun, dan lainnya. Tidak perlu isi ulang
di setiap halaman.

**Minim input teks.** Kontrol utamanya slider, chip, toggle, dan tombol preset. Input teks
hanya dipakai di tempat yang memang dinamis, seperti daftar utang.

**Penjelasan di setiap fitur.** Tiap modul punya accordion penjelasan yang menjawab tiga hal:
ini apa, kenapa penting, dan bagaimana membaca hasilnya. Rumusnya ikut ditampilkan supaya
pengguna bisa memverifikasi angkanya sendiri.

**Tanpa library chart.** `LineChart`, `StackedBarChart`, dan `DonutChart` digambar manual
dengan SVG. Bundle lebih kecil, dan gayanya bebas disesuaikan termasuk untuk dark mode.

**Aksesibilitas.** Accordion memakai `aria-expanded`/`aria-controls`, chip memakai
`role="radio"`, toggle memakai `role="switch"`, dan status selalu dipasangkan warna + teks
sehingga tetap terbaca bagi pengguna buta warna. Animasi dihormati lewat
`prefers-reduced-motion`.

## Konvensi bunga

Dua konvensi berbeda dipakai sesuai konteks, didefinisikan di `src/utils/finance.js`:

- **Investasi** memakai bunga efektif: `(1 + r)^(1/12) - 1`. Jadi "8% per tahun" benar-benar
  menghasilkan 8% dalam setahun.
- **Utang dan pinjaman** memakai bunga nominal: `apr / 12`. Ini konvensi yang dipakai bank
  dan fintech di Indonesia saat menghitung cicilan.

## Struktur

```
src/
├── components/
│   ├── charts/      LineChart, StackedBarChart, DonutChart (SVG murni)
│   ├── layout/      AppLogo, AppSidebar, ProfileDrawer
│   └── ui/          Slider, Chip, Toggle, Accordion, Gauge, Card, dll.
├── data/
│   ├── modules.js     Registry modul — penggerak navigasi & router
│   ├── explainers.js  Isi accordion penjelasan tiap modul
│   ├── limits.js      Rentang slider (RANGE), preset tombol (PRESETS), batas input
│   └── glossary.js    Kamus istilah
├── stores/
│   └── financeStore.js  State global + persistence localStorage
├── utils/
│   ├── finance.js   Seluruh logika perhitungan (fungsi murni)
│   └── format.js    Format rupiah, persen, durasi (locale id-ID)
└── views/           Satu file per modul
```

Menambah modul baru: tambahkan entri di `src/data/modules.js`, isi penjelasannya di
`src/data/explainers.js`, buat view-nya, lalu daftarkan di `VIEWS` pada `src/router/index.js`.

## Penyimpanan data

Seluruh isian tersimpan di `localStorage` dengan key `financi.v1`. Saat dimuat, data
di-merge ke atas struktur default, jadi menambah field baru di versi berikutnya tidak
merusak data pengguna lama.

Pengguna tetap memegang datanya: panel Profil Keuangan menyediakan ekspor ke JSON,
impor dari JSON, dan reset.

## Menjalankan

```sh
npm install
npm run dev      # server pengembangan
npm run build    # build produksi ke dist/
npm run preview  # pratinjau hasil build
npm run lint     # ESLint + eslint-plugin-vue
npm run lint:fix # perbaiki yang bisa diperbaiki otomatis
```

Butuh Node.js `^22.18.0` atau `>=24.12.0`.

## Linting

`eslint.config.js` sengaja ada supaya lint-nya **terbatas dan terarah**. Tanpa config lokal,
ekstensi editor bisa memakai preset bawaannya dan membanjiri setiap file dengan peringatan
gaya penulisan.

Pembagiannya:

- Aturan yang menangkap bug tetap menyala — `vue/require-v-for-key`, `no-unused-vars`,
  `vue/no-unused-properties`, `vue/require-explicit-emits`, `eqeqeq`, dan lainnya.
- Aturan yang hanya mengatur format dimatikan — `vue/max-attributes-per-line`,
  `vue/html-indent`, `vue/attributes-order`, dan sejenisnya. Formatting ditangani editor,
  dan aturan-aturan itu bertabrakan dengan class Tailwind yang panjang dan multi-baris.

### Angka tidak ditulis langsung di `<template>`

Ekspresi di dalam `<template>` diparsing terpisah oleh `vue-eslint-parser` memakai
`parserOptions.ecmaVersion`. Kalau ada tool yang memakai ecmaVersion di bawah 2021,
numeric separator seperti `:min="1_000_000"` langsung dilaporkan sebagai
*"Parsing error: Identifier directly after number"*.

Karena itu seluruh angka batas dipindah ke `src/data/limits.js` dan dipakai lewat
`v-bind`:

```vue
<SliderField v-model="p.monthlyIncome" v-bind="RANGE.income" :presets="PRESETS.expenses" />
```

Efek sampingnya positif: rentang yang sama tidak lagi ditulis ulang di tiap view,
dan template jadi lebih pendek.

## Catatan

Angka di aplikasi ini adalah simulasi dengan asumsi yang bisa diubah sendiri — bukan saran
keuangan dan bukan jaminan hasil. Asumsi return instrumen investasi memakai rata-rata
historis yang dibulatkan, bukan data real-time.

## Stack

Vue 3 (`<script setup>`) · Vite · Tailwind CSS v4 · Vue Router. Tanpa dependensi runtime lain.
