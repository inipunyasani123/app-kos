// Semua logika tanggal memakai WIB (UTC+7, tanpa musim panas), tidak bergantung zona waktu perangkat.
// "Nomor hari" = jumlah hari sejak 1 Jan 1970 menurut kalender WIB, sehingga new Date(n * HARI) dibaca
// dengan getUTC*() memberi tanggal WIB yang benar.
export const HARI = 864e5;
const GESER = 7 * 3600e3;

export const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
export const NAMA_HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const hariKe = (ts) => Math.floor((ts + GESER) / HARI);
/** Cap waktu (ms) untuk nomor hari n pada jam:menit WIB. */
export const cap = (n, jam = 0, menit = 0) => n * HARI - GESER + (jam * 60 + menit) * 60e3;

export function pecah(n) {
  const d = new Date(n * HARI);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate(), dow: d.getUTCDay() };
}

export function jamWib(ts) {
  const d = new Date(ts + GESER);
  return { h: d.getUTCHours(), min: d.getUTCMinutes() };
}

/** Nomor hari `n` digeser `k` bulan; tanggal dipotong ke akhir bulan bila perlu (31 Jan + 1 bln = 28/29 Feb). */
export function tambahBulan(n, k) {
  const { y, m, d } = pecah(n);
  const awal = new Date(Date.UTC(y, m + k, 1));
  const ty = awal.getUTCFullYear();
  const tm = awal.getUTCMonth();
  const akhir = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return Math.round(Date.UTC(ty, tm, Math.min(d, akhir)) / HARI);
}

export const kunciBulan = (n) => {
  const { y, m } = pecah(n);
  return y * 12 + m;
};

export function tgl(n) {
  const { y, m, d } = pecah(n);
  return `${d} ${BLN[m]} ${y}`;
}
export function tglPendek(n) {
  const { m, d } = pecah(n);
  return `${d} ${BLN[m]}`;
}
export function tglPanjang(n) {
  const { y, m, d, dow } = pecah(n);
  return `${NAMA_HARI[dow]}, ${d} ${BULAN[m]} ${y}`;
}
export function hariTgl(n) {
  const { m, d, dow } = pecah(n);
  return `${NAMA_HARI[dow]}, ${d} ${BLN[m]}`;
}
export function namaBulan(n, tahun = true) {
  const { y, m } = pecah(n);
  return tahun ? `${BULAN[m]} ${y}` : BULAN[m];
}

const dua = (x) => String(x).padStart(2, '0');
export function jam(ts) {
  const { h, min } = jamWib(ts);
  return `${dua(h)}.${dua(min)}`;
}

/** "baru saja", "12 menit lalu", "3 jam lalu", "kemarin 14.05", "4 hari lalu", lalu tanggal. */
export function relatif(ts, kini) {
  const sel = kini - ts;
  if (sel < 60e3) return 'baru saja';
  if (sel < 3600e3) return `${Math.floor(sel / 60e3)} menit lalu`;
  const beda = hariKe(kini) - hariKe(ts);
  if (beda === 0) return `${Math.floor(sel / 3600e3)} jam lalu`;
  if (beda === 1) return `kemarin ${jam(ts)}`;
  if (beda < 7) return `${beda} hari lalu`;
  return tgl(hariKe(ts));
}

/** "hari ini", "besok", "lusa", "4 hari lagi", "kemarin", "3 hari lalu" */
export function jarakHari(n, hariIni) {
  const s = n - hariIni;
  if (s === 0) return 'hari ini';
  if (s === 1) return 'besok';
  if (s === 2) return 'lusa';
  if (s > 0) return `${s} hari lagi`;
  if (s === -1) return 'kemarin';
  return `${-s} hari lalu`;
}

/** Nomor hari untuk hari tertentu dalam minggu (0 = Minggu) yang paling dekat setelah n. */
export function hariBerikut(n, dow) {
  const sel = (dow - pecah(n).dow + 7) % 7 || 7;
  return n + sel;
}
