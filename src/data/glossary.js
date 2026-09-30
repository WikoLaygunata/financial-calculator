/**
 * Kamus istilah finansial.
 * Setiap entri: istilah, kategori, penjelasan singkat, dan contoh angka konkret.
 */

export const GLOSSARY_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'dasar', label: 'Dasar' },
  { id: 'utang', label: 'Utang' },
  { id: 'investasi', label: 'Investasi' },
  { id: 'pensiun', label: 'Pensiun' },
]

export const GLOSSARY = [
  {
    term: 'Dana Darurat',
    category: 'dasar',
    aka: 'Emergency Fund',
    definition:
      'Uang yang khusus disiapkan untuk kejadian tak terduga seperti PHK, sakit, atau kerusakan mendadak. Harus mudah dicairkan dan tidak boleh dipakai untuk keperluan yang bisa direncanakan.',
    example:
      'Pengeluaran Rp5 juta/bulan dan kamu single: target dana darurat sekitar Rp15 juta (3x pengeluaran).',
    related: '/dana-darurat',
  },
  {
    term: 'Arus Kas',
    category: 'dasar',
    aka: 'Cash Flow',
    definition:
      'Selisih antara uang yang masuk dan uang yang keluar dalam satu periode. Arus kas positif berarti ada sisa untuk ditabung; negatif berarti kamu menutup kekurangan dengan tabungan atau utang.',
    example: 'Gaji Rp8 juta, pengeluaran Rp5 juta, cicilan Rp1,5 juta → arus kas +Rp1,5 juta.',
  },
  {
    term: 'Inflasi',
    category: 'dasar',
    definition:
      'Kenaikan harga barang dan jasa secara umum dari tahun ke tahun. Membuat jumlah uang yang sama bisa membeli lebih sedikit barang dibanding sebelumnya.',
    example:
      'Dengan inflasi 4%/tahun, barang seharga Rp100 ribu hari ini jadi sekitar Rp148 ribu dalam 10 tahun.',
    related: '/inflasi',
  },
  {
    term: 'Likuiditas',
    category: 'dasar',
    definition:
      'Seberapa cepat sebuah aset bisa diubah jadi uang tunai tanpa kehilangan nilai. Tabungan sangat likuid; properti sangat tidak likuid.',
    example:
      'Reksadana pasar uang bisa cair 1–2 hari kerja, sementara menjual rumah bisa butuh berbulan-bulan.',
  },
  {
    term: 'Rasio Menabung',
    category: 'dasar',
    aka: 'Savings Rate',
    definition:
      'Persentase penghasilan yang tidak habis terpakai dan berhasil disisihkan. Ini salah satu indikator paling kuat untuk memperkirakan kondisi keuanganmu di masa depan.',
    example: 'Gaji Rp10 juta, berhasil menyisihkan Rp2 juta → rasio menabung 20%.',
    related: '/anggaran',
  },
  {
    term: 'DSR',
    category: 'utang',
    aka: 'Debt Service Ratio',
    definition:
      'Persentase penghasilan bulanan yang habis untuk membayar cicilan. Dipakai bank untuk menilai kelayakan kredit. Batas aman yang umum dipakai adalah 30%.',
    example: 'Gaji Rp8 juta dengan total cicilan Rp2,4 juta → DSR 30%, tepat di batas aman.',
    related: '/kesehatan-cicilan',
  },
  {
    term: 'Bunga Anuitas',
    category: 'utang',
    definition:
      'Metode cicilan di mana jumlah bayaran bulanan tetap, tapi komposisinya berubah: porsi bunga besar di awal, porsi pokok besar di akhir. Dipakai hampir semua KPR.',
    example:
      'Cicilan Rp3 juta di bulan pertama bisa terdiri dari Rp2,7 juta bunga dan hanya Rp300 ribu pokok.',
    related: '/simulasi-pinjaman',
  },
  {
    term: 'Bunga Flat vs Efektif',
    category: 'utang',
    definition:
      'Bunga flat dihitung dari pokok awal sepanjang tenor, sedangkan bunga efektif dihitung dari saldo yang menyusut. Untuk angka persen yang sama, bunga flat selalu lebih mahal.',
    example: 'Pinjaman "6% flat" bisa setara dengan sekitar 11% efektif — hampir dua kali lipat.',
  },
  {
    term: 'Debt Snowball',
    category: 'utang',
    definition:
      'Strategi melunasi utang dengan saldo terkecil lebih dulu. Lebih cepat memberi rasa berhasil sehingga bagus untuk menjaga motivasi, meski tidak selalu paling hemat bunga.',
    example: 'Punya utang Rp2 juta, Rp8 juta, dan Rp15 juta → serang yang Rp2 juta lebih dulu.',
    related: '/bebas-utang',
  },
  {
    term: 'Debt Avalanche',
    category: 'utang',
    definition:
      'Strategi melunasi utang dengan bunga tertinggi lebih dulu. Secara matematis paling hemat karena menghentikan sumber bunga terbesar lebih cepat.',
    example: 'Paylater 36% diserang lebih dulu daripada cicilan motor 12%, meski saldonya lebih kecil.',
    related: '/bebas-utang',
  },
  {
    term: 'Restrukturisasi',
    category: 'utang',
    definition:
      'Kesepakatan dengan pemberi pinjaman untuk mengubah syarat utang — memperpanjang tenor, menurunkan bunga, atau memotong cicilan — agar kamu mampu membayarnya.',
    example:
      'Cicilan Rp3 juta/bulan selama 2 tahun diubah jadi Rp1,8 juta/bulan selama 4 tahun.',
  },
  {
    term: 'DCA',
    category: 'investasi',
    aka: 'Dollar Cost Averaging',
    definition:
      'Menyetor sejumlah uang yang sama secara rutin tanpa memperhatikan harga sedang naik atau turun. Membuat harga belimu jadi rata-rata dan menghilangkan kebutuhan menebak waktu pasar.',
    example: 'Beli reksadana Rp1 juta setiap tanggal 25, konsisten, apa pun kondisi pasar.',
    related: '/dca',
  },
  {
    term: 'Compounding',
    category: 'investasi',
    aka: 'Bunga Berbunga',
    definition:
      'Keuntungan yang kamu peroleh ikut diinvestasikan sehingga menghasilkan keuntungan lagi. Efeknya kecil di awal lalu membesar cepat, sehingga waktu jadi faktor terpenting.',
    example:
      'Rp2 juta/bulan dengan return 8% selama 20 tahun: setoran Rp480 juta, saldo akhir sekitar Rp1,1 miliar.',
    related: '/dca',
  },
  {
    term: 'Yield',
    category: 'investasi',
    definition:
      'Persentase penghasilan tahunan dibanding modal yang ditanam. Dipakai untuk mengukur berapa "gaji pasif" yang bisa dihasilkan sebuah investasi.',
    example: 'Modal Rp100 juta dengan yield 6% menghasilkan Rp6 juta setahun, sekitar Rp500 ribu/bulan.',
    related: '/passive-income',
  },
  {
    term: 'Dividen',
    category: 'investasi',
    definition:
      'Bagian laba perusahaan yang dibagikan ke pemegang saham. Jumlahnya tidak dijamin — perusahaan bisa memotong atau melewatkan dividen saat kondisi sedang sulit.',
    example: 'Punya 1.000 lembar saham yang membagi dividen Rp200/lembar → terima Rp200 ribu.',
  },
  {
    term: 'SBN',
    category: 'investasi',
    aka: 'Surat Berharga Negara',
    definition:
      'Surat utang yang diterbitkan pemerintah. Kamu meminjamkan uang ke negara dan menerima kupon secara rutin. Termasuk instrumen dengan risiko paling rendah di Indonesia.',
    example: 'ORI atau SBR dengan kupon sekitar 6% per tahun, dibayarkan tiap bulan.',
  },
  {
    term: 'Reksadana Pasar Uang',
    category: 'investasi',
    aka: 'RDPU',
    definition:
      'Reksadana yang isinya deposito dan surat utang jangka pendek. Nilainya sangat stabil dan cepat dicairkan, sehingga cocok untuk menyimpan dana darurat.',
    example: 'Return sekitar 4–5% per tahun, bisa dicairkan dalam 1–2 hari kerja.',
  },
  {
    term: 'Index Fund',
    category: 'investasi',
    definition:
      'Reksadana atau ETF yang mengikuti pergerakan sebuah indeks pasar, bukan dipilih satu per satu oleh manajer. Biayanya murah dan otomatis tersebar ke banyak perusahaan.',
    example: 'Reksadana indeks yang mengikuti IDX30 atau LQ45.',
    related: '/bandingkan-aset',
  },
  {
    term: 'Diversifikasi',
    category: 'investasi',
    definition:
      'Menyebar uang ke beberapa jenis aset agar kerugian di satu tempat tidak menghancurkan seluruh portofolio. Prinsip "jangan taruh semua telur di satu keranjang".',
    example: 'Portofolio berisi 30% pasar uang, 40% obligasi, dan 30% saham.',
    related: '/rebalancing',
  },
  {
    term: 'Rebalancing',
    category: 'investasi',
    definition:
      'Mengembalikan porsi aset ke target alokasi awal setelah bergeser karena perbedaan pertumbuhan. Menjaga tingkat risiko portofolio tetap sesuai rencana.',
    example: 'Saham tumbuh dari 30% jadi 45% → tambah aset lain agar porsinya kembali seimbang.',
    related: '/rebalancing',
  },
  {
    term: 'Volatilitas',
    category: 'investasi',
    definition:
      'Seberapa besar dan seberapa sering nilai sebuah aset naik-turun. Volatilitas tinggi berarti potensi keuntungan besar, tapi juga kemungkinan rugi besar dalam jangka pendek.',
    example: 'Saham bisa turun 30% dalam setahun; deposito nilainya praktis tidak bergerak.',
  },
  {
    term: 'Return Riil',
    category: 'investasi',
    definition:
      'Pertumbuhan investasi setelah dikurangi inflasi. Ini angka yang sebenarnya menentukan apakah daya belimu naik atau tidak.',
    example: 'Return 8% dengan inflasi 4% menghasilkan return riil sekitar 3,8%, bukan tepat 4%.',
  },
  {
    term: 'FIRE',
    category: 'pensiun',
    aka: 'Financial Independence, Retire Early',
    definition:
      'Kondisi ketika hasil investasimu cukup menutupi biaya hidup, sehingga bekerja menjadi pilihan dan bukan kewajiban.',
    example: 'Pengeluaran Rp10 juta/bulan butuh dana sekitar Rp3 miliar dengan asumsi SWR 4%.',
    related: '/pensiun',
  },
  {
    term: 'Rule of 25',
    category: 'pensiun',
    definition:
      'Perkiraan cepat dana pensiun: kumpulkan 25 kali pengeluaran tahunanmu. Berasal dari asumsi bahwa menarik 4% per tahun relatif aman untuk jangka panjang.',
    example: 'Pengeluaran Rp120 juta/tahun → target dana pensiun sekitar Rp3 miliar.',
    related: '/pensiun',
  },
  {
    term: 'SWR',
    category: 'pensiun',
    aka: 'Safe Withdrawal Rate',
    definition:
      'Persentase dana pensiun yang dianggap aman ditarik setiap tahun tanpa membuat pokoknya habis sebelum waktunya. Angka yang paling sering dipakai adalah 4%.',
    example: 'Dana Rp3 miliar dengan SWR 4% memberi Rp120 juta/tahun, sekitar Rp10 juta/bulan.',
  },
  {
    term: 'Nilai Waktu dari Uang',
    category: 'pensiun',
    aka: 'Time Value of Money',
    definition:
      'Prinsip bahwa uang hari ini lebih bernilai daripada nominal yang sama di masa depan, karena bisa diinvestasikan dan karena inflasi menggerus nilainya.',
    example: 'Rp10 juta hari ini bisa jadi Rp21 juta dalam 10 tahun dengan return 8%.',
  },
]
