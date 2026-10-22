// Data contoh. Semua nama orang, kos, dan angka di sini rekaan untuk demo.
// Tanggal tidak ditulis mati: tiap entri memakai jarak (hari/jam) dari "hari ini" WIB, lalu dihitung di hitung.js.
import { hariBerikut, hariTgl } from './waktu';

export const APP = {
  nama: 'Grendel',
  slug: 'kos',
  url: 'https://app-kos.pintuweb.id',
  tagline: 'Bayar kos, lapor kerusakan, pantau kamar dalam satu aplikasi',
  kontak: 'https://www.pintuweb.id/kontak?demo=kos',
};

export const KOS = {
  nama: 'Kos Ubin Kembang',
  wilayah: 'Kedungwaru, Tulungagung',
  jenis: 'Kos campur: lantai 1 putra, lantai 2 putri',
  pemilik: 'Bu Wening',
  pemilikLengkap: 'Wening Rahayu',
  pengelola: 'Pak Darmo',
  jamBuka: 7,
  jamTutup: 21,
};

export const TIPE = {
  teras: { nama: 'Teras', harga: 650000, ukuran: '3 × 3 m', fasilitas: ['kipas', 'kasur', 'lemari', 'meja', 'wifi', 'kmLuar'] },
  tegel: { nama: 'Tegel', harga: 850000, ukuran: '3 × 4 m', fasilitas: ['kipas', 'kasur', 'lemari', 'meja', 'wifi', 'kmDalam'] },
  jendela: { nama: 'Jendela', harga: 1150000, ukuran: '3,5 × 4 m', fasilitas: ['ac', 'kasur', 'lemari', 'meja', 'wifi', 'kmDalam', 'jendela'] },
};

export const FASILITAS = {
  ac: { label: 'AC', ikon: 'salju' },
  kipas: { label: 'Kipas angin', ikon: 'kipas' },
  kasur: { label: 'Kasur 90×200', ikon: 'kasur' },
  lemari: { label: 'Lemari 2 pintu', ikon: 'lemari' },
  meja: { label: 'Meja & kursi', ikon: 'meja' },
  wifi: { label: 'Wifi', ikon: 'wifi' },
  kmDalam: { label: 'Kamar mandi dalam', ikon: 'air' },
  kmLuar: { label: 'Kamar mandi luar (3 kamar)', ikon: 'air' },
  jendela: { label: 'Jendela ke taman', ikon: 'jendela' },
};

export const PARKIR = 25000;
export const DENDA = { tenggang: 3, perHari: 10000, maks: 150000 };
export const DEPOSIT = 500000;
export const TERBIT_HARI = 7; // tagihan terbit 7 hari sebelum jatuh tempo
export const KONTRAK_BULAN = 12;
export const PEMBERITAHUAN_KELUAR = 30;

export const KAMAR = [
  { id: '01', lantai: 1, tipe: 'teras' },
  { id: '02', lantai: 1, tipe: 'teras' },
  { id: '03', lantai: 1, tipe: 'jendela' },
  { id: '04', lantai: 1, tipe: 'tegel' },
  { id: '05', lantai: 1, tipe: 'tegel' },
  { id: '06', lantai: 1, tipe: 'teras' },
  { id: '07', lantai: 2, tipe: 'tegel' },
  { id: '08', lantai: 2, tipe: 'tegel' },
  { id: '09', lantai: 2, tipe: 'jendela' },
  { id: '10', lantai: 2, tipe: 'teras' },
  { id: '11', lantai: 2, tipe: 'jendela' },
  { id: '12', lantai: 2, tipe: 'tegel' },
];

// Ilustrasi penghuni tanpa wajah: hanya bentuk kepala, rambut/kerudung, dan baju.
// kulit: indeks warna kulit; rambut: pendek | ikal | panjang | kerudung | cepol | topi
// d = jarak (hari) jatuh tempo periode "fokus" dari hari ini; bulanKe = periode ke berapa sejak masuk.
// telat = pola hari telat bayar periode lampau (negatif = lebih awal), dipakai bergiliran.
export const PENGHUNI = [
  { kamar: '01', nama: 'Bayu Saputra', panggil: 'Bayu', kerja: 'Mahasiswa', d: -6, lunas: false, bulanKe: 5, parkir: true, telat: [0, 2, 0, 6, 1], av: { kulit: 2, rambut: 'pendek', baju: '#2F4A6B', latar: '#DCE4EE' } },
  { kamar: '02', nama: 'Rizky Pratama', panggil: 'Rizky', kerja: 'Karyawan toko', d: -12, lunas: true, bulanKe: 14, parkir: true, telat: [0, -1, 0, 0, 3, -2, 0], av: { kulit: 3, rambut: 'topi', baju: '#205C4C', latar: '#D5E7DC' } },
  { kamar: '04', nama: 'Galih Prasetyo', panggil: 'Galih', kerja: 'Guru les', d: 6, lunas: false, bulanKe: 3, parkir: false, telat: [0, -3, -1], av: { kulit: 1, rambut: 'ikal', baju: '#A3381F', latar: '#F4DACF' } },
  { kamar: '06', nama: 'Fajar Nugroho', panggil: 'Fajar', kerja: 'Mahasiswa', d: 0, lunas: false, bulanKe: 10, parkir: true, telat: [0, 1, 4, 0, 0, 2], av: { kulit: 2, rambut: 'pendek', baju: '#6E4A1F', latar: '#F7E5B8' } },
  { kamar: '07', nama: 'Laras Wulandari', panggil: 'Laras', kerja: 'Perawat', d: 4, lunas: false, bulanKe: 8, parkir: true, telat: [0, -2, 0, -1, 0, 5, -1, 0], demo: true, av: { kulit: 1, rambut: 'kerudung', baju: '#A3381F', kerudung: '#E2A630', latar: '#F7E5B8' } },
  { kamar: '08', nama: 'Sekar Ayuningtyas', panggil: 'Sekar', kerja: 'Mahasiswi', d: -2, lunas: false, bulanKe: 6, parkir: false, telat: [0, 0, 1, -1, 0, 2], av: { kulit: 0, rambut: 'panjang', baju: '#205C4C', latar: '#D5E7DC' } },
  { kamar: '09', nama: 'Putri Maharani', panggil: 'Putri', kerja: 'Pegawai bank', d: -18, lunas: true, bulanKe: 20, parkir: true, telat: [0, -3, -2, -3, 0, -1], av: { kulit: 2, rambut: 'kerudung', baju: '#2F4A6B', kerudung: '#221C17', latar: '#DCE4EE' } },
  { kamar: '11', nama: 'Dewi Anggraini', panggil: 'Dewi', kerja: 'Desainer lepas', d: 13, lunas: false, bulanKe: 2, parkir: false, telat: [0, 0], av: { kulit: 3, rambut: 'cepol', baju: '#221C17', latar: '#F4DACF' } },
];

// Penghuni lama dari kamar yang kini kosong/perawatan: keluar = hari lalu, lama = bulan tinggal.
export const MANTAN = [
  { kamar: '03', keluar: 18, lama: 14, parkir: true },
  { kamar: '05', keluar: 25, lama: 9, parkir: false },
  { kamar: '10', keluar: 40, lama: 6, parkir: true },
  { kamar: '12', keluar: 6, lama: 11, parkir: false },
];

export const PERAWATAN = { '05': { catatan: 'Cat ulang dinding dan ganti kasur', selesaiHari: 3 } };

export const IKLAN_AWAL = { '03': true, '10': true, '12': false };

export const FOTO_KAMAR = {
  '03': require('../../assets/foto/kamar-03.webp'),
  '10': require('../../assets/foto/kamar-10.webp'),
  '12': require('../../assets/foto/kamar-12.webp'),
  '05': require('../../assets/foto/kamar-05.webp'),
};
export const FOTO_KERAN = require('../../assets/foto/laporan-keran.webp');

export const PENGELOLA = [
  { id: 'darmo', nama: 'Pak Darmo', peran: 'Penjaga kos, tinggal di paviliun depan', av: { kulit: 3, rambut: 'topi', baju: '#6E4A1F', latar: '#F7E5B8' } },
  { id: 'wening', nama: 'Bu Wening', peran: 'Pemilik kos', av: { kulit: 1, rambut: 'kerudung', baju: '#205C4C', kerudung: '#A3381F', latar: '#D5E7DC' } },
];

export const KATEGORI = [
  { id: 'listrik', label: 'Listrik', ikon: 'petir' },
  { id: 'air', label: 'Air & keran', ikon: 'air' },
  { id: 'perabot', label: 'Perabot', ikon: 'lemari' },
  { id: 'pintu', label: 'Pintu & kunci', ikon: 'kunci' },
  { id: 'internet', label: 'Internet', ikon: 'wifi' },
  { id: 'lain', label: 'Lainnya', ikon: 'titik' },
];
export const LOKASI = ['Kamar', 'Kamar mandi', 'Dapur bersama', 'Lorong', 'Jemuran', 'Parkiran'];
export const URGENSI = [
  { id: 'tunda', label: 'Bisa ditunda' },
  { id: 'mengganggu', label: 'Cukup mengganggu' },
  { id: 'darurat', label: 'Darurat' },
];

export const STATUS_TIKET = [
  { id: 'baru', label: 'Terkirim' },
  { id: 'dijadwalkan', label: 'Dijadwalkan' },
  { id: 'dikerjakan', label: 'Dikerjakan' },
  { id: 'selesai', label: 'Selesai' },
];

// jam = berapa jam sebelum sekarang; jadwalHari/jadwalJam = jadwal kunjungan relatif hari ini.
export const TIKET = [
  {
    id: 'T-0412', kamar: '08', judul: 'Lampu kamar mandi mati', kategori: 'listrik', lokasi: 'Kamar mandi', urgensi: 'mengganggu',
    catatan: 'Sudah coba ganti bohlam sendiri, tetap tidak menyala. Sepertinya saklarnya.',
    riwayat: [{ status: 'baru', jam: 3 }],
  },
  {
    id: 'T-0409', kamar: '02', judul: 'Keran wastafel dapur menetes', kategori: 'air', lokasi: 'Dapur bersama', urgensi: 'mengganggu',
    catatan: 'Menetes terus walau sudah diputar rapat. Lantai dapur jadi licin.', foto: 'keran',
    riwayat: [
      { status: 'baru', jam: 46 },
      { status: 'dijadwalkan', jam: 38, catatan: 'Pak Darmo cek sore ini pukul 16.00.' },
      { status: 'dikerjakan', jam: 29, catatan: 'Karet keran aus. Suku cadang dibeli besok pagi, sementara keran utama dapur ditutup.' },
    ],
  },
  {
    id: 'T-0405', kamar: '11', judul: 'Wifi lantai 2 sering putus', kategori: 'internet', lokasi: 'Lorong', urgensi: 'mengganggu',
    catatan: 'Putus-nyambung tiap malam sekitar jam 8–10. Di lantai 1 aman.',
    riwayat: [
      { status: 'baru', jam: 22 },
      { status: 'dijadwalkan', jam: 14, catatan: 'Teknisi wifi datang besok pukul 10.00 WIB.', jadwalHari: 1, jadwalJam: '10.00' },
    ],
  },
  {
    id: 'T-0398', kamar: '07', judul: 'Engsel pintu lemari lepas', kategori: 'perabot', lokasi: 'Kamar', urgensi: 'tunda',
    catatan: 'Pintu lemari kanan miring, sekrup engsel atas copot.',
    riwayat: [
      { status: 'baru', jam: 16 * 24 + 5 },
      { status: 'dijadwalkan', jam: 15 * 24 + 14, catatan: 'Pak Darmo datang besok pagi.' },
      { status: 'dikerjakan', jam: 14 * 24 + 12 },
      { status: 'selesai', jam: 14 * 24 + 11, catatan: 'Engsel diganti baru, pintu lemari sudah rapat lagi.' },
    ],
  },
];

export const SLOT_JADWAL = [
  { hari: 0, jam: '16.00' },
  { hari: 1, jam: '09.00' },
  { hari: 1, jam: '13.00' },
  { hari: 2, jam: '10.00' },
];

/** Pengumuman dibuat dari hari ini supaya tanggal acaranya selalu masuk akal. */
export function pengumuman(hari) {
  const sabtu = hariBerikut(hari, 6);
  const minggu = hariBerikut(hari, 0);
  return [
    {
      id: 'listrik', hariLalu: 1, penting: true, tag: 'Listrik',
      judul: 'Listrik padam Sabtu pagi',
      isi: `Ada pemeliharaan jaringan listrik di lingkungan kita pada ${hariTgl(sabtu)}, pukul 09.00–12.00 WIB. Isi daya ponsel dan laptop sebelumnya. Pompa air ikut mati, jadi tampung air secukupnya di ember.`,
    },
    {
      id: 'kerjabakti', hariLalu: 3, tag: 'Kegiatan',
      judul: 'Kerja bakti dan pengasapan nyamuk',
      isi: `${hariTgl(minggu)} pukul 07.00 kita bersihkan selokan dan jemuran bersama. Petugas pengasapan datang pukul 09.00, jadi tutup jendela dan simpan makanan di wadah tertutup.`,
    },
    {
      id: 'wifi', hariLalu: 9, tag: 'Wifi',
      judul: 'Kata sandi wifi sudah diganti',
      isi: 'Kata sandi baru ditempel di papan dekat tangga. Sengaja tidak dikirim lewat aplikasi supaya tidak tersebar ke luar kos.',
    },
    {
      id: 'sampah', hariLalu: 20, tag: 'Kebersihan',
      judul: 'Bak sampah pindah ke samping parkiran',
      isi: 'Sampah diangkut petugas setiap Selasa dan Jumat pagi. Pisahkan sampah basah dan kering, kardus dilipat dulu.',
    },
  ];
}

export const ATURAN = [
  { judul: 'Jam tamu', isi: 'Pukul 08.00–21.00 WIB. Tamu menunggu di ruang tamu depan, tidak masuk ke kamar.' },
  { judul: 'Tamu menginap', isi: 'Wajib izin pengelola, paling lama 2 malam, biaya Rp25.000 per malam.' },
  { judul: 'Jam tenang', isi: 'Pukul 22.00–05.00 WIB. Pelankan musik dan suara telepon.' },
  { judul: 'Gerbang', isi: 'Dikunci pukul 23.00 WIB. Tiap penghuni memegang kunci gembok gerbang sendiri.' },
  { judul: 'Pembagian lantai', isi: 'Lantai 1 khusus putra, lantai 2 khusus putri.' },
  { judul: 'Dapur', isi: 'Memasak hanya di dapur bersama lantai 1. Alat masak dicuci setelah dipakai.' },
  { judul: 'Sampah', isi: 'Buang ke bak samping parkiran sebelum pukul 07.00 pada hari angkut.' },
  { judul: 'Parkir', isi: 'Satu motor per penghuni, Rp25.000 per bulan. Mesin dimatikan saat masuk halaman.' },
  { judul: 'Pembayaran', isi: 'Paling lambat tanggal jatuh tempo. Tenggang 3 hari, lalu denda Rp10.000 per hari, paling banyak Rp150.000.' },
  { judul: 'Keluar kos', isi: 'Beri tahu paling lambat 30 hari sebelumnya. Deposit Rp500.000 kembali paling lambat 7 hari setelah kamar dicek.' },
];

export const CHAT_CEPAT = [
  { tanya: 'Pak, galon air minum di dapur habis.', jawab: 'Siap, Mbak. Galon baru saya antar ke dapur sebentar lagi.' },
  { tanya: 'Saya pulang agak malam, lewat jam 23.00.', jawab: 'Baik. Gerbang tetap pakai gembok, kuncinya Mbak pegang sendiri ya. Hati-hati di jalan.' },
  { tanya: 'Boleh ada saudara menginap 1 malam?', jawab: 'Boleh, Mbak. Isi nama tamunya di buku tamu depan, biayanya Rp25.000 per malam.' },
  { tanya: 'Tagihan bulan ini sudah bisa dibayar?', jawab: 'Sudah, Mbak. Tagihannya ada di menu Tagihan, bisa lewat QRIS atau transfer.' },
];

export const CALON_AWAL = [
  { id: 'c1', nama: 'Sinta', kamar: '10', jamLalu: 5, hariSurvei: 6, jam: '10.00', pesan: 'Kamar mandinya berbagi dengan berapa kamar?' },
  { id: 'c2', nama: 'Andre', kamar: '03', jamLalu: 27, hariSurvei: 'besok', jam: '16.00', pesan: 'Boleh bawa penanak nasi sendiri?' },
];
