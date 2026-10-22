import { Platform } from 'react-native';

// Palet "tegel kunci": ubin semen lawas (merah oksida, hitam arang, krem kapur, kuning kunyit, hijau botol).
// Semua pasangan teks/latar di bawah sudah diuji kontrasnya (>= 4.5:1).
export const W = {
  kapur: '#F3ECDF', // latar halaman
  kertas: '#FFFBF3', // kartu
  tinta: '#221C17', // teks utama, pelat kamar terisi
  abu: '#5B5047', // teks kedua (6.6:1 di kapur)
  garis: '#DCCDB8',
  garisTua: '#B9A890',
  bata: '#A3381F', // warna utama (merah oksida)
  bataTua: '#7A2914',
  bataMuda: '#F4DACF',
  hijau: '#205C4C', // lunas / kamar tersedia
  hijauMuda: '#D5E7DC',
  kunyit: '#E2A630', // aksen isian (selalu dengan teks tinta)
  kunyitMuda: '#F7E5B8',
  coklat: '#6E4A1F', // teks di atas kunyit muda
  biru: '#2F4A6B', // perawatan / dijadwalkan
  biruMuda: '#DCE4EE',
  putih: '#FFFFFF',
};

const web = Platform.OS === 'web';
const SANS = 'Jakarta, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = '"Young Serif", Georgia, "Times New Roman", serif';

// Di web satu berkas font variabel dipakai dengan fontWeight; di Android/iOS tiap ketebalan punya nama sendiri.
export const F = {
  teks: web ? { fontFamily: SANS, fontWeight: '400' } : { fontFamily: 'Jakarta400' },
  sedang: web ? { fontFamily: SANS, fontWeight: '600' } : { fontFamily: 'Jakarta600' },
  tebal: web ? { fontFamily: SANS, fontWeight: '700' } : { fontFamily: 'Jakarta700' },
  pekat: web ? { fontFamily: SANS, fontWeight: '800' } : { fontFamily: 'Jakarta800' },
  judul: web ? { fontFamily: SERIF, fontWeight: '400' } : { fontFamily: 'YoungSerif' },
};

export const ANGKA = { fontVariant: ['tabular-nums'] };

export const R = { kecil: 10, sedang: 16, besar: 22 };

export const BAYANGAN = '0 1px 0 rgba(34,28,23,0.06), 0 6px 18px -10px rgba(34,28,23,0.35)';
