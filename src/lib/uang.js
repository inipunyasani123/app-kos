// Format rupiah ditulis sendiri (tanpa Intl) supaya hasilnya sama di Hermes, Node, dan peramban.
export function rupiah(n) {
  const neg = n < 0;
  const s = String(Math.round(Math.abs(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '−' : ''}Rp${s}`;
}

/** Ringkas untuk sumbu grafik: 7,4 jt / 850 rb */
export function rupiahRingkas(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',').replace(',0', '')} jt`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} rb`;
  return String(n);
}

const SATUAN = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function eja(n) {
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) return `${SATUAN[Math.floor(n / 10)]} puluh${n % 10 ? ` ${SATUAN[n % 10]}` : ''}`;
  if (n < 200) return `seratus${n - 100 ? ` ${eja(n - 100)}` : ''}`;
  if (n < 1000) return `${SATUAN[Math.floor(n / 100)]} ratus${n % 100 ? ` ${eja(n % 100)}` : ''}`;
  if (n < 2000) return `seribu${n - 1000 ? ` ${eja(n - 1000)}` : ''}`;
  if (n < 1e6) return `${eja(Math.floor(n / 1000))} ribu${n % 1000 ? ` ${eja(n % 1000)}` : ''}`;
  if (n < 1e9) return `${eja(Math.floor(n / 1e6))} juta${n % 1e6 ? ` ${eja(n % 1e6)}` : ''}`;
  return `${eja(Math.floor(n / 1e9))} miliar${n % 1e9 ? ` ${eja(n % 1e9)}` : ''}`;
}

/** Terbilang ala kuitansi: "delapan ratus tujuh puluh lima ribu rupiah" */
export function terbilang(n) {
  if (!n) return 'nol rupiah';
  return `${eja(Math.round(n))} rupiah`;
}
