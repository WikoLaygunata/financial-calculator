/**
 * Isi accordion penjelasan untuk setiap modul.
 *
 * Aturan penulisan:
 * - Bahasa Indonesia sehari-hari, hindari jargon tanpa penjelasan.
 * - Selalu jawab tiga hal: ini apa, kenapa penting, dan cara membaca hasilnya.
 * - Sertakan rumus supaya pengguna bisa memverifikasi angkanya sendiri.
 *
 * Struktur item: { q, a?, list?, formula?, note? }
 */

export const EXPLAINERS = {
  dashboard: [
    {
      q: 'Apa itu skor kesehatan finansial?',
      a: 'Skor ini rangkuman kasar kondisi keuanganmu dalam angka 0–100. Bukan nilai ujian, lebih seperti cek-up: tujuannya menunjukkan bagian mana yang sudah kuat dan bagian mana yang masih bolong.',
      list: [
        'Di bawah 40 — ada fondasi penting yang belum terpasang.',
        '40 sampai 70 — sudah di jalur benar, masih ada celah untuk ditutup.',
        'Di atas 70 — fondasi kuat, fokusmu bisa pindah ke optimasi investasi.',
      ],
    },
    {
      q: 'Kenapa bobot tiap pertanyaan berbeda?',
      a: 'Karena dampaknya tidak sama. Tidak punya dana darurat bisa memaksamu berutang saat keadaan mendesak, jadi bobotnya besar. Sementara "sudah mulai investasi" penting, tapi tidak akan menyelamatkanmu kalau cicilan sudah mencekik.',
      formula:
        'Skor = (total bobot jawaban "Sudah" ÷ total seluruh bobot) × 100',
      note: 'Dana darurat dan rasio cicilan masing-masing bernilai 20 poin — dua-duanya fondasi arus kas. Kebiasaan mencatat bernilai 14 poin karena jadi dasar semua angka lainnya.',
    },
    {
      q: 'Angka di kartu ringkasan dari mana?',
      a: 'Semuanya dihitung dari Profil Keuangan yang kamu isi. Begitu kamu mengubah gaji atau pengeluaran di modul mana pun, angka di dashboard ikut menyesuaikan — tidak perlu isi ulang.',
      list: [
        'Uang bebas bulanan = penghasilan − kebutuhan − keinginan − cicilan.',
        'Rasio cicilan (DSR) = cicilan ÷ penghasilan.',
        'Progress dana darurat = dana terkumpul ÷ target ideal.',
      ],
    },
    {
      q: 'Datanya disimpan di mana? Apakah aman?',
      a: 'Semua angka tersimpan di localStorage browser kamu sendiri dan tidak pernah dikirim ke server mana pun. Tidak ada login, tidak ada database. Konsekuensinya: kalau kamu ganti browser atau membersihkan data situs, isinya hilang.',
      note: 'Mau pindah perangkat? Pakai tombol Ekspor untuk mengunduh datamu sebagai file JSON, lalu impor di perangkat lain.',
    },
    {
      q: 'Harus mulai dari mana?',
      a: 'Ikuti urutan tahapnya. Tahap 1 mengamankan fondasi, Tahap 2 menentukan tujuan, Tahap 3 mengatur strategi investasi. Melompat langsung ke investasi tanpa dana darurat itu seperti memasang atap sebelum membuat pondasi.',
    },
  ],

  'dana-darurat': [
    {
      q: 'Apa itu dana darurat, dan bedanya dengan tabungan biasa?',
      a: 'Dana darurat adalah uang yang khusus disiapkan untuk kejadian tak terduga: kena PHK, sakit, motor rusak, atau keluarga butuh bantuan mendadak. Bedanya dengan tabungan biasa ada pada niat dan aturan pakainya — dana ini tidak boleh disentuh untuk liburan atau ganti HP.',
      list: [
        'Harus mudah dicairkan dalam hitungan hari (rekening terpisah, deposito harian, atau reksadana pasar uang).',
        'Jangan diinvestasikan ke saham atau kripto — nilainya bisa turun tepat saat kamu butuh.',
        'Simpan di rekening berbeda dari rekening harian supaya tidak "keburu" terpakai.',
      ],
    },
    {
      q: 'Kenapa pengalinya beda-beda?',
      a: 'Karena kebutuhan bantalan tiap orang berbeda. Makin banyak orang yang bergantung padamu dan makin tidak pasti penghasilanmu, makin tebal bantalan yang dibutuhkan.',
      list: [
        'Single: 3x pengeluaran bulanan — kalau terjadi sesuatu, kamu relatif lincah menyesuaikan diri.',
        'Menikah: 6x — ada pasangan yang ikut terdampak.',
        'Menikah + anak: 12x — biaya anak tidak bisa ditunda atau dipangkas.',
        'Freelancer / pebisnis: tambah 3x — penghasilan naik-turun, jadi butuh penyangga ekstra.',
      ],
    },
    {
      q: 'Rumus yang dipakai',
      formula:
        'Target = Pengeluaran Bulanan × (Pengali Status + Tambahan Pekerjaan)',
      a: 'Perhatikan bahwa dasarnya adalah PENGELUARAN, bukan penghasilan. Yang perlu kamu tanggung saat penghasilan berhenti adalah biaya hidup, bukan besarnya gaji.',
      note: 'Kalau pengeluaranmu Rp5 juta, status single, dan kamu freelancer: 5 juta × (3 + 3) = Rp30 juta.',
    },
    {
      q: 'Targetnya terasa terlalu besar, bagaimana?',
      a: 'Wajar, dan tidak perlu langsung terkumpul. Perlakukan angka itu sebagai tujuan akhir, bukan setoran pertama. Pecah jadi target kecil: kumpulkan 1x pengeluaran bulanan dulu, lalu naik ke 3x, dan seterusnya.',
      note: 'Sudah punya 1x pengeluaran bulanan saja sudah jauh lebih aman dibanding nol. Mulai kecil lebih baik daripada menunda.',
    },
    {
      q: 'Kalau sudah penuh, lalu apa?',
      a: 'Berhenti menambah, lalu alihkan setoran bulananmu ke tujuan berikutnya — melunasi utang berbunga tinggi atau mulai investasi. Dana darurat yang berlebihan justru membuat uangmu tergerus inflasi karena disimpan di instrumen ber-return rendah.',
    },
  ],

  anggaran: [
    {
      q: 'Apa itu aturan 50/30/20?',
      a: 'Cara paling sederhana membagi penghasilan bulanan: 50% untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan dan investasi. Ini kerangka awal, bukan hukum mati — silakan sesuaikan dengan kondisimu.',
      list: [
        'Kebutuhan: sewa/KPR, makan, transportasi, listrik, cicilan, asuransi.',
        'Keinginan: nongkrong, langganan streaming, hobi, liburan, upgrade gadget.',
        'Tabungan & investasi: dana darurat, reksadana, saham, dana pensiun.',
      ],
    },
    {
      q: 'Bagaimana membedakan kebutuhan dan keinginan?',
      a: 'Tesnya sederhana: kalau kamu berhenti membayarnya bulan ini, apakah ada konsekuensi serius? Tidak bayar sewa berujung diusir — itu kebutuhan. Berhenti langganan streaming cuma bikin bosan — itu keinginan.',
      note: 'Internet bisa jadi kebutuhan kalau kamu kerja remote. Yang penting konsisten dengan definisimu sendiri.',
    },
    {
      q: 'Kenapa menabung harus di awal bulan?',
      a: 'Karena kalau menunggu sisa, biasanya tidak ada sisa. Pengeluaran punya kecenderungan memenuhi ruang yang tersedia. Dengan menyisihkan lebih dulu, kamu memaksa sisa anggaran menyesuaikan diri — bukan sebaliknya.',
      formula: 'Penghasilan − Tabungan = Uang yang boleh dipakai',
      note: 'Istilahnya "pay yourself first". Paling efektif kalau dibuat autodebet di tanggal gajian.',
    },
    {
      q: 'Cara membaca hasil perbandingannya',
      a: 'Kolom rencana adalah target alokasimu, kolom aktual adalah pengeluaran yang kamu laporkan. Selisih hijau berarti kamu masih di bawah pagu, merah berarti kelebihan dan perlu dikurangi dari pos lain.',
      list: [
        'Kebutuhan melebihi pagu — biaya hidup terlalu berat, pertimbangkan pindah/negosiasi biaya besar.',
        'Keinginan melebihi pagu — paling mudah dipangkas, mulai dari langganan yang jarang dipakai.',
        'Tabungan nyata di bawah 10% — ini lampu kuning untuk kondisi jangka panjang.',
      ],
    },
  ],

  'kesehatan-cicilan': [
    {
      q: 'Apa itu DSR (Debt Service Ratio)?',
      a: 'DSR adalah persentase penghasilan bulanan yang habis untuk membayar cicilan. Bank memakai angka ini untuk menilai apakah kamu layak diberi pinjaman baru. Kamu sebaiknya memakainya untuk alasan yang lebih penting: memastikan hidupmu tidak tercekik cicilan.',
      formula: 'DSR = (Total Cicilan Bulanan ÷ Penghasilan Bersih Bulanan) × 100%',
    },
    {
      q: 'Cicilan apa saja yang dihitung?',
      a: 'Semua kewajiban rutin bulanan yang punya tenggat, termasuk yang sering dianggap "kecil".',
      list: [
        'KPR atau cicilan kontrakan berjangka.',
        'Cicilan kendaraan.',
        'Kartu kredit — pakai pembayaran minimum bulanannya.',
        'Paylater dan pinjaman online, sekecil apa pun.',
        'Pinjaman ke koperasi, kantor, atau keluarga yang dibayar rutin.',
      ],
      note: 'Paylater paling sering lupa dihitung padahal bunganya biasanya paling mahal.',
    },
    {
      q: 'Kenapa batas amannya 30%?',
      a: 'Di atas 30%, ruang gerak arus kasmu menyempit: satu pengeluaran tak terduga bisa memaksa kamu berutang lagi untuk menutup utang. Angka 30% adalah rambu umum yang dipakai industri keuangan, bukan angka sakti — tapi cukup baik sebagai pagar.',
      list: [
        'Hijau (≤30%): aman, masih ada ruang bernapas.',
        'Kuning (31–50%): waspada, hindari cicilan baru dan mulai percepat pelunasan.',
        'Merah (>50%): berisiko tinggi, prioritaskan restrukturisasi atau pelunasan agresif.',
      ],
    },
    {
      q: 'Apa arti "sisa kuota aman"?',
      a: 'Itu selisih antara batas aman (30% penghasilanmu) dan cicilan yang sudah berjalan. Anggap sebagai plafon: kalaupun kamu berencana ambil cicilan baru, jangan melewati angka itu.',
      formula: 'Sisa Kuota = (Penghasilan × 30%) − Cicilan Berjalan',
      note: 'Sisa kuota Rp0 bukan berarti kamu wajib memakainya. Tidak berutang selalu jadi opsi terbaik.',
    },
    {
      q: 'DSR saya sudah merah, apa langkah pertama?',
      a: 'Jangan ambil utang baru, lalu susun rencana pelunasan. Buka modul Simulasi Bebas Utang untuk melihat urutan pelunasan yang paling efisien. Kalau cicilan benar-benar tidak tertutup penghasilan, hubungi pihak pemberi pinjaman untuk membahas restrukturisasi — jauh lebih baik daripada menunggu gagal bayar.',
    },
  ],

  'bebas-utang': [
    {
      q: 'Apa bedanya Snowball dan Avalanche?',
      a: 'Keduanya sama-sama membayar minimum ke semua utang, lalu menumpuk dana ekstra ke satu utang prioritas. Perbedaannya hanya pada cara memilih prioritas itu.',
      list: [
        'Snowball — lunasi saldo terkecil dulu. Lebih cepat terasa "menang", bagus untuk menjaga semangat.',
        'Avalanche — lunasi bunga tertinggi dulu. Secara matematis paling hemat, tapi kemenangan pertama terasa lebih lama.',
      ],
      note: 'Metode terbaik adalah yang benar-benar kamu jalankan sampai selesai. Kalau butuh motivasi cepat, Snowball tidak salah.',
    },
    {
      q: 'Kenapa disebut "snowball"?',
      a: 'Karena ada efek bola salju. Saat satu utang lunas, cicilan bulanan yang tadinya untuk utang itu tidak dipakai jajan — dialihkan ke utang berikutnya. Jadi dana serangan makin besar setiap ada utang yang selesai, dan pelunasan makin cepat.',
      formula:
        'Anggaran bulanan = Total cicilan minimum + Dana ekstra (tetap, meski ada utang yang lunas)',
    },
    {
      q: 'Bagaimana simulasinya dihitung?',
      a: 'Perhitungan berjalan bulan demi bulan, bukan rata-rata kasar. Setiap bulan bunga ditambahkan ke saldo, lalu cicilan minimum dibayarkan ke semua utang, lalu sisa anggaran ditumpuk ke utang prioritas.',
      list: [
        'Bunga bulanan = Saldo × (Bunga per tahun ÷ 12).',
        'Bunga dihitung dari saldo terbaru, jadi saldo yang cepat turun otomatis menghasilkan bunga lebih kecil.',
        'Utang yang lunas dikeluarkan dari daftar, cicilan minimumnya mengalir ke utang berikutnya.',
      ],
    },
    {
      q: 'Kenapa hasil kedua metode bisa sama?',
      a: 'Kalau utangmu hanya satu, atau kebetulan utang dengan saldo terkecil juga punya bunga tertinggi, urutan prioritasnya jadi identik. Dalam kondisi itu pilih yang mana pun, hasilnya sama.',
    },
    {
      q: 'Kenapa hasilnya "tidak akan lunas"?',
      a: 'Itu muncul kalau total anggaran bulananmu lebih kecil dari bunga yang tumbuh setiap bulan. Saldo justru naik meski kamu rajin membayar. Ini kondisi serius yang tidak bisa diselesaikan dengan kalkulator.',
      note: 'Kalau ini terjadi: tambah dana ekstra, atau hubungi pemberi pinjaman untuk restrukturisasi. Hindari mengambil pinjaman baru untuk menutup yang lama.',
    },
  ],

  'simulasi-pinjaman': [
    {
      q: 'Apa itu cicilan anuitas?',
      a: 'Anuitas berarti cicilan bulananmu jumlahnya tetap dari awal sampai akhir, tapi komposisinya berubah. Di bulan-bulan awal porsi bunga besar dan pokok kecil; makin ke belakang terbalik. Ini metode yang dipakai hampir semua KPR dan kredit kendaraan.',
      formula: 'Cicilan = Pokok × r ÷ (1 − (1 + r)^−n), dengan r = bunga tahunan ÷ 12',
    },
    {
      q: 'Kenapa di awal bayarannya hampir habis buat bunga?',
      a: 'Karena bunga dihitung dari saldo utang yang tersisa, dan di awal saldo itu masih penuh. Inilah sebabnya melunasi lebih cepat di tahun-tahun awal jauh lebih berdampak daripada di tahun-tahun akhir.',
      note: 'Lihat tabel amortisasi di bawah hasil — di sana terlihat jelas pergeseran porsi bunga ke pokok.',
    },
    {
      q: 'Kenapa total bunganya sebesar itu?',
      a: 'Karena bunga dibayar berulang setiap bulan selama tenor. Memperpanjang tenor membuat cicilan bulanan terasa ringan, tapi total bunga yang kamu bayar justru membengkak. Coba geser slider tenor dan perhatikan dua angka itu bergerak berlawanan.',
      list: [
        'Tenor panjang: cicilan ringan, total bunga besar.',
        'Tenor pendek: cicilan berat, total bunga jauh lebih kecil.',
      ],
    },
    {
      q: 'Bunga flat vs efektif, bedanya apa?',
      a: 'Kalkulator ini memakai bunga efektif (anuitas), di mana bunga dihitung dari saldo yang menyusut. Bunga flat menghitung bunga dari pokok awal terus-menerus, sehingga bunga "8% flat" sebenarnya lebih mahal dari "8% efektif".',
      note: 'Saat membandingkan penawaran pinjaman, selalu tanyakan jenis bunganya. Kalau tidak jelas, bandingkan total pembayarannya saja.',
    },
    {
      q: 'Apakah cicilan ini masih aman untuk saya?',
      a: 'Hasil hitungan di sini otomatis dibandingkan dengan penghasilanmu lewat rasio DSR. Kalau cicilan barunya mendorong DSR melewati 30%, akan muncul peringatan. Untuk analisis lebih lengkap, buka modul Cek Kesehatan Cicilan.',
    },
  ],

  'target-impian': [
    {
      q: 'Kenapa target perlu diberi nama dan tenggat?',
      a: 'Karena "nanti mau nabung" hampir selalu kalah dari pengeluaran hari ini. Target dengan nama jelas ("DP rumah") dan tenggat jelas ("36 bulan") mengubah keinginan abstrak jadi angka setoran yang bisa kamu jadwalkan.',
    },
    {
      q: 'Kenapa ditampilkan per hari dan per minggu?',
      a: 'Karena angka bulanan sering terasa menakutkan, padahal kalau dipecah jadi harian biasanya masih masuk akal. Rp1,5 juta per bulan terdengar berat; Rp50 ribu per hari lebih mudah dibayangkan dan dibandingkan dengan pengeluaran harianmu.',
      formula: 'Per hari = (Setoran bulanan × 12) ÷ 365   |   Per minggu = (Setoran bulanan × 12) ÷ 52',
    },
    {
      q: 'Kapan sebaiknya pakai bantuan investasi?',
      a: 'Tergantung jarak waktunya. Untuk target pendek, uangnya harus aman dan pasti ada saat dibutuhkan — jangan diinvestasikan ke instrumen yang bisa turun nilainya.',
      list: [
        'Di bawah 1 tahun: tabungan atau deposito saja. Jangan ambil risiko.',
        '1–3 tahun: reksadana pasar uang atau obligasi negara, return sekitar 4–6% per tahun.',
        'Di atas 3 tahun: boleh mulai mempertimbangkan instrumen dengan potensi lebih tinggi.',
      ],
      note: 'Aturan praktisnya: makin dekat tenggatnya, makin rendah risiko yang boleh kamu ambil.',
    },
    {
      q: 'Apa itu "dibantu imbal hasil"?',
      a: 'Itu selisih antara menabung biasa dan menabung sambil diinvestasikan. Kalau uangmu berkembang, sebagian target dipenuhi oleh pertumbuhan investasi sehingga setoran bulananmu bisa lebih kecil.',
      formula: 'Dibantu imbal hasil = Setoran tanpa investasi − Setoran dengan investasi',
      note: 'Angka return di sini hanya asumsi, bukan jaminan. Untuk target penting, siapkan cadangan agar tidak kurang.',
    },
  ],

  pensiun: [
    {
      q: 'Apa itu "angka pensiun"?',
      a: 'Jumlah dana yang perlu terkumpul supaya hasil investasinya bisa menutupi biaya hidupmu tanpa kamu harus bekerja lagi. Begitu dana ini tercapai, pekerjaan berubah jadi pilihan, bukan kewajiban.',
    },
    {
      q: 'Apa itu Rule of 25 dan Safe Withdrawal Rate?',
      a: 'Safe Withdrawal Rate (SWR) adalah persentase dana yang dianggap aman ditarik setiap tahun tanpa membuat pokoknya habis. SWR 4% setara dengan mengumpulkan 25x pengeluaran tahunanmu — dari situ istilah "Rule of 25" berasal.',
      formula: 'Target Dana = (Pengeluaran Bulanan saat Pensiun × 12) ÷ SWR',
      list: [
        'SWR 4% → dana = 25x pengeluaran tahunan (asumsi standar).',
        'SWR 3% → dana = 33x, lebih konservatif, cocok kalau masa pensiunmu panjang.',
        'SWR 5% → dana = 20x, lebih agresif dan lebih rentan kalau pasar sedang buruk.',
      ],
    },
    {
      q: 'Kenapa pengeluaran masa depan jauh lebih besar?',
      a: 'Karena inflasi. Biaya hidup Rp6 juta hari ini tidak akan cukup 30 tahun lagi. Dengan inflasi 4% per tahun, kebutuhan itu bisa menjadi sekitar tiga kali lipat. Kalkulator ini menaikkan pengeluaranmu ke nilai masa depan sebelum menghitung targetnya.',
      formula: 'Pengeluaran saat Pensiun = Pengeluaran Sekarang × (1 + Inflasi)^Jumlah Tahun',
      note: 'Angka target akhirnya mungkin terlihat mengejutkan. Itu normal — dan justru alasan kenapa mulai lebih awal sangat menolong.',
    },
    {
      q: 'Apa itu return riil?',
      a: 'Return riil adalah pertumbuhan investasimu setelah dikurangi inflasi — ini yang menentukan apakah daya belimu benar-benar naik. Investasi 8% dengan inflasi 4% bukan berarti untung 4% pas, tapi sekitar 3,8% setelah dihitung dengan benar.',
      formula: 'Return Riil = ((1 + Return) ÷ (1 + Inflasi)) − 1',
    },
    {
      q: 'Setorannya jauh di atas kemampuan saya, harus bagaimana?',
      a: 'Angka ini bukan penghakiman, tapi informasi untuk mengambil keputusan. Ada beberapa tuas yang bisa kamu geser, dan biasanya kombinasi kecil dari beberapa tuas lebih realistis daripada satu perubahan besar.',
      list: [
        'Mundurkan usia pensiun beberapa tahun — dampaknya biasanya paling besar.',
        'Turunkan target pengeluaran saat pensiun.',
        'Mulai sekarang walau kecil — waktu adalah bahan bakar utama bunga berbunga.',
        'Rencanakan penghasilan tambahan yang tetap berjalan saat pensiun.',
      ],
      note: 'Menunda 5 tahun bisa membuat setoran bulanan yang dibutuhkan naik drastis. Coba geser slider usia dan lihat sendiri efeknya.',
    },
  ],

  'passive-income': [
    {
      q: 'Apa itu passive income dari investasi?',
      a: 'Penghasilan yang datang dari uang yang kamu tanam, bukan dari jam kerjamu. Bentuknya bisa kupon obligasi, bagi hasil reksadana, atau dividen saham. Kuncinya: kamu hidup dari hasilnya, tanpa menjual atau menggerus modal pokoknya.',
    },
    {
      q: 'Apa itu yield?',
      a: 'Yield adalah persentase penghasilan tahunan dibanding modal yang kamu tanam. Modal Rp100 juta dengan yield 6% menghasilkan Rp6 juta per tahun, atau sekitar Rp500 ribu per bulan.',
      formula: 'Modal Dibutuhkan = (Target Bulanan × 12) ÷ Yield per Tahun',
      note: 'Perhatikan bahwa modalnya besar. Yield 6% berarti kamu butuh modal 200x target bulananmu.',
    },
    {
      q: 'Instrumen mana yang paling cocok?',
      a: 'Tidak ada yang sempurna; masing-masing menukar kepastian dengan potensi.',
      list: [
        'SBN / obligasi negara — kupon rutin, dijamin negara, paling bisa diandalkan.',
        'Reksadana pendapatan tetap — dikelola manajer investasi, nilainya bisa berfluktuasi sedikit.',
        'Dividen saham bluechip — potensi paling besar, tapi dividen bisa dipotong atau dilewatkan saat perusahaan sedang sulit.',
      ],
      note: 'Untuk penghasilan yang kamu andalkan sehari-hari, jangan bergantung pada satu instrumen saja.',
    },
    {
      q: 'Apa yang sering dilupakan orang?',
      a: 'Tiga hal: pajak, inflasi, dan konsistensi. Dividen dan kupon umumnya dipotong pajak, jadi pakai yield bersih. Inflasi membuat target bulananmu perlu naik setiap tahun. Dan yield historis bukan janji untuk tahun depan.',
      list: [
        'Pakai yield setelah pajak, bukan yield brosur.',
        'Jangan pakai seluruh hasil — sisakan sebagian untuk menambah modal agar tahan inflasi.',
        'Uji dengan yield yang lebih rendah dari harapanmu untuk melihat skenario buruk.',
      ],
    },
  ],

  inflasi: [
    {
      q: 'Apa itu inflasi, sederhananya?',
      a: 'Kenaikan harga barang dan jasa secara umum dari tahun ke tahun. Efeknya bukan uangmu berkurang jumlahnya, tapi jumlah yang sama jadi bisa membeli lebih sedikit. Uang Rp100 ribu tetap Rp100 ribu, hanya isi keranjang belanjanya yang menyusut.',
    },
    {
      q: 'Kenapa menyimpan uang di tabungan bisa merugikan?',
      a: 'Karena bunga tabungan biasanya di bawah inflasi. Kalau bunga tabungan 1% sementara inflasi 4%, daya beli uangmu turun sekitar 3% setiap tahun. Uangnya aman secara nominal, tapi nilainya bocor perlahan tanpa terasa.',
      formula: 'Daya Beli Masa Depan = Nominal ÷ (1 + Inflasi)^Jumlah Tahun',
    },
    {
      q: 'Cara membaca dua angka di hasil',
      a: 'Keduanya dua sisi dari peristiwa yang sama, hanya cara pandangnya berbeda.',
      list: [
        'Harga masa depan — berapa rupiah yang kamu butuhkan nanti untuk barang yang hari ini seharga X.',
        'Daya beli — berapa nilai uang X hari ini kalau hanya kamu diamkan sampai tahun target.',
      ],
      note: 'Untuk perencanaan target jangka panjang, selalu pakai angka harga masa depan.',
    },
    {
      q: 'Berapa asumsi inflasi yang wajar?',
      a: 'Inflasi umum Indonesia dalam beberapa tahun terakhir berkisar 2–4% per tahun. Tapi pos pengeluaran tertentu naik jauh lebih cepat, jadi sesuaikan asumsimu dengan kebutuhan yang sedang kamu rencanakan.',
      list: [
        'Inflasi umum: sekitar 3–4% per tahun.',
        'Biaya pendidikan: sering 8–12% per tahun.',
        'Biaya kesehatan: umumnya 10% ke atas per tahun.',
      ],
      note: 'Merencanakan dana pendidikan anak dengan asumsi inflasi umum adalah kesalahan yang mahal.',
    },
    {
      q: 'Jadi harus bagaimana?',
      a: 'Simpan di tabungan hanya uang yang kamu butuhkan dalam waktu dekat plus dana darurat. Sisanya tempatkan di instrumen yang secara historis mengalahkan inflasi, dengan tingkat risiko yang sesuai jangka waktu tujuanmu.',
    },
  ],

  dca: [
    {
      q: 'Apa itu DCA (Dollar Cost Averaging)?',
      a: 'Strategi menyetor sejumlah uang yang sama secara rutin — misalnya setiap tanggal gajian — tanpa peduli harga sedang naik atau turun. Saat harga turun kamu otomatis dapat unit lebih banyak, saat harga naik dapat lebih sedikit. Hasilnya harga belimu jadi rata-rata.',
      note: 'Manfaat terbesarnya bukan matematis, tapi psikologis: kamu tidak perlu menebak waktu terbaik untuk masuk pasar.',
    },
    {
      q: 'Apa itu bunga berbunga (compounding)?',
      a: 'Keuntungan yang kamu peroleh ikut diinvestasikan, lalu keuntungan itu menghasilkan keuntungan lagi. Di tahun-tahun awal efeknya nyaris tidak terasa, lalu mulai membesar dengan cepat. Ini alasan mengapa waktu lebih berharga daripada nominal setoran.',
      formula: 'Saldo bulan ini = (Saldo bulan lalu + Setoran) × (1 + return bulanan)',
    },
    {
      q: 'Kapan bunga mulai mengalahkan setoran saya?',
      a: 'Titik itu ditandai di halaman ini. Awalnya hampir seluruh saldomu berasal dari uang yang kamu setor. Setelah beberapa tahun, porsi pertumbuhan menyalip — sejak saat itu uangmu bekerja lebih keras daripada setoran bulananmu.',
      note: 'Grafik batang memisahkan "uang setoranmu" dan "hasil pertumbuhan". Perhatikan bagaimana warnanya berubah dominan seiring waktu.',
    },
    {
      q: 'Berapa asumsi return yang realistis?',
      a: 'Gunakan angka konservatif supaya rencanamu tidak rapuh. Return tinggi selalu datang bersama kemungkinan rugi di tengah jalan.',
      list: [
        'Konservatif 5% — pasar uang, obligasi, deposito.',
        'Moderat 8% — campuran obligasi dan saham.',
        'Agresif 12% — dominan saham, siap melihat nilai turun 30% sewaktu-waktu.',
      ],
      note: 'Ini proyeksi garis lurus. Pasar sebenarnya bergerak naik-turun, jadi anggap hasilnya sebagai perkiraan kasar, bukan janji.',
    },
    {
      q: 'Apa yang paling menentukan hasil akhir?',
      a: 'Berdasarkan urutan dampaknya: lama waktu, konsistensi setoran, lalu besarnya return. Mulai 5 tahun lebih awal biasanya lebih berpengaruh daripada mengejar return 2% lebih tinggi — dan jauh lebih bisa kamu kendalikan.',
    },
  ],

  'bandingkan-aset': [
    {
      q: 'Apa gunanya membandingkan instrumen?',
      a: 'Untuk melihat bahwa selisih return yang tampak kecil ternyata berdampak besar dalam jangka panjang. Beda 3% per tahun terasa sepele di tahun pertama, tapi setelah 20 tahun selisihnya bisa mencapai ratusan juta.',
    },
    {
      q: 'Dari mana angka return ini?',
      a: 'Dari rata-rata historis jangka panjang masing-masing kelas aset di Indonesia. Angka-angka ini pembulatan untuk keperluan simulasi, bukan data real-time dan bukan proyeksi resmi.',
      list: [
        'Deposito ~3,5% — hampir pasti, tapi kerap kalah dari inflasi.',
        'Reksadana pasar uang ~5% — likuid, cocok untuk dana darurat.',
        'Obligasi negara / SBN ~6,2% — dijamin negara, kupon rutin.',
        'Reksadana pendapatan tetap ~7,5% — fluktuasi sedang.',
        'Emas ~9% — pelindung nilai, tapi bisa stagnan bertahun-tahun.',
        'Index fund / saham ~11% — potensi tertinggi, ayunan nilai paling besar.',
      ],
    },
    {
      q: 'Kenapa tidak langsung pilih yang paling tinggi?',
      a: 'Karena return tinggi selalu dibayar dengan risiko. Saham bisa turun 30–40% dalam satu tahun buruk. Kalau uang itu kamu butuhkan tahun depan, kamu bisa terpaksa menjual saat harga sedang jatuh — dan kerugiannya jadi permanen.',
      note: 'Aturan praktis: uang yang dibutuhkan dalam 3 tahun jangan ditaruh di instrumen yang nilainya bisa berfluktuasi besar.',
    },
    {
      q: 'Keterbatasan simulasi ini',
      a: 'Grafik ini menggambar garis pertumbuhan yang mulus, sementara pasar nyata bergerak zig-zag. Beberapa hal juga belum diperhitungkan.',
      list: [
        'Biaya: pajak, biaya beli/jual, biaya pengelolaan reksadana.',
        'Urutan untung-rugi, yang berpengaruh besar kalau kamu menarik dana di tengah jalan.',
        'Return historis tidak menjamin hasil di masa depan.',
      ],
    },
  ],

  rebalancing: [
    {
      q: 'Apa itu rebalancing?',
      a: 'Mengembalikan porsi aset di portofoliomu ke rencana awal. Karena tiap aset tumbuh dengan kecepatan berbeda, komposisinya pasti bergeser dari waktu ke waktu. Rebalancing adalah tindakan merapikannya kembali.',
      note: 'Contoh: target sahammu 30%, tapi setelah pasar naik porsinya jadi 45%. Tanpa sadar, risiko portofoliomu sudah jauh lebih tinggi dari rencana.',
    },
    {
      q: 'Kenapa ini penting?',
      a: 'Karena porsi yang bergeser mengubah profil risikomu secara diam-diam. Rebalancing juga memaksamu melakukan hal yang sulit secara emosional tapi benar secara strategi: mengurangi aset yang sedang naik tinggi, dan menambah yang sedang tertinggal.',
    },
    {
      q: 'Apa bedanya mode "beli saja" dan "boleh jual"?',
      a: 'Dua cara mencapai tujuan yang sama, dengan konsekuensi berbeda.',
      list: [
        'Beli saja — dana baru diarahkan ke aset yang porsinya paling kurang. Tidak ada penjualan, jadi tidak ada pajak dan biaya transaksi jual. Lebih lambat tapi lebih hemat.',
        'Boleh jual — menjual aset yang kelebihan untuk menambal yang kurang. Porsi langsung pas, tapi berpotensi kena pajak dan biaya.',
      ],
      note: 'Untuk kebanyakan orang yang masih rutin menyetor, mode "beli saja" sudah cukup.',
    },
    {
      q: 'Bagaimana dana baru dibagi?',
      a: 'Aplikasi menghitung nilai ideal tiap aset berdasarkan total portofolio setelah dana baru masuk, lalu membandingkannya dengan nilai sekarang. Dana baru dibagi sebanding dengan besarnya kekurangan, sehingga aset yang paling tertinggal otomatis mendapat porsi terbesar.',
      formula:
        'Nilai Ideal = (Total Portofolio + Dana Baru) × Target %   →   Kekurangan = Nilai Ideal − Nilai Sekarang',
    },
    {
      q: 'Seberapa sering perlu rebalancing?',
      a: 'Tidak perlu sering. Terlalu rajin justru menambah biaya tanpa manfaat berarti.',
      list: [
        'Berkala: sekali setiap 6 atau 12 bulan.',
        'Berbasis ambang: hanya saat ada porsi yang menyimpang lebih dari 5% dari target.',
        'Paling praktis: arahkan setoran rutin bulananmu ke aset yang paling tertinggal.',
      ],
    },
  ],

  kamus: [
    {
      q: 'Kenapa kamus ini ada?',
      a: 'Karena hambatan terbesar dalam belajar keuangan sering bukan matematikanya, tapi istilahnya. Sekali kamu paham arti "yield", "DSR", atau "compounding", sisanya jadi jauh lebih mudah diikuti.',
    },
    {
      q: 'Cara memakai halaman ini',
      a: 'Pakai kotak pencarian untuk menemukan istilah tertentu, atau saring berdasarkan kategori. Setiap istilah punya penjelasan singkat dan contoh angka supaya terasa konkret.',
    },
  ],
}


