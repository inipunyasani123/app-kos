import { Svg, Path, Circle, Rect } from './svg';
import { W } from '../lib/tema';

// Set ikon garis buatan sendiri (kisi 24, garis 1,8).
const P = {
  rumah: 'M3.5 10.5 12 3.5l8.5 7V20a.8.8 0 0 1-.8.8H15v-6H9v6H4.3a.8.8 0 0 1-.8-.8z',
  nota: 'M6 3h12v18l-3-1.8L12 21l-3-1.8L6 21z M9 8h6 M9 11.5h6 M9 15h3.5',
  obeng: 'M14.7 6.3a4 4 0 0 0-5.3 5.1L3.5 17.3l3.2 3.2 5.9-5.9a4 4 0 0 0 5.1-5.3l-2.5 2.5-2.4-.6-.6-2.4z',
  toa: 'M3.5 10v4h3l7 4V6l-7 4z M16.5 9a3.2 3.2 0 0 1 0 6 M6.5 14l1 5h2.4l-1-4.5',
  kunci: 'M11 12.5 20 3.5 M16.5 7l2.8 2.8 M14.3 9.2l2 2',
  pintu: 'M5.5 20.5V4.3a.8.8 0 0 1 .8-.8h11.4a.8.8 0 0 1 .8.8v16.2 M3 20.5h18 M15 12.2h.01',
  grafik: 'M5 20V11 M10.5 20V5 M16 20v-6.5 M3 20.5h18',
  denah: 'M3.5 3.5h17v17h-17z M3.5 10h10 M13.5 3.5v11 M8.5 10v10.5 M13.5 14.5h7',
  lonceng: 'M6 16v-5a6 6 0 1 1 12 0v5l1.8 2H4.2z M10 20.5a2.1 2.1 0 0 0 4 0',
  qr: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2.5v2.5H14z M18 18h2v2h-2z M14 18.5h1.5 M18 14h2',
  bank: 'M3 9.5 12 4.5l9 5 M5.5 10v8 M10 10v8 M14 10v8 M18.5 10v8 M3 20.5h18',
  centang: 'M5 12.5 9.5 17 19 7.5',
  kiri: 'M15 5l-7 7 7 7',
  kanan: 'M9 5l7 7-7 7',
  bawah: 'M5 9l7 7 7-7',
  tambah: 'M12 5v14 M5 12h14',
  kamera: 'M4 8.2h3.2l1.8-2.7h6l1.8 2.7H20V19H4z',
  silang: 'M6.5 6.5l11 11 M17.5 6.5l-11 11',
  jam: 'M12 7.5V12l3 2',
  awas: 'M12 3.8 2.8 19.8h18.4z M12 10v4.5 M12 17.2h.01',
  telepon: 'M5.2 4h3.6l1.9 4.8-2.4 1.5a11 11 0 0 0 5.4 5.4l1.5-2.4 4.8 1.9v3.6a1 1 0 0 1-1 1A16.2 16.2 0 0 1 4.2 5a1 1 0 0 1 1-1',
  chat: 'M4 5h16v11H9.2L4 20z M8 9.5h8 M8 12.5h5',
  kalender: 'M3.5 5.5h17v15h-17z M3.5 10h17 M8 3v4.5 M16 3v4.5',
  wifi: 'M2.5 9a14.5 14.5 0 0 1 19 0 M5.5 12.5a10 10 0 0 1 13 0 M8.7 16a5.2 5.2 0 0 1 6.6 0 M12 19.5h.01',
  salju: 'M12 3v18 M4.2 7.5l15.6 9 M4.2 16.5l15.6-9 M9.5 4.5 12 7l2.5-2.5 M9.5 19.5 12 17l2.5 2.5',
  kipas: 'M12 12c0-4.8 3.6-7 6-5.2s.4 6.2-6 5.2 M12 12c4.3 2.6 3.6 8 .7 8.3s-5-4.2-.7-8.3 M12 12c-4-2.3-8.6.2-7.7 2.9S10.6 17.6 12 12',
  air: 'M12 3.5s6 6.4 6 10.8a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z',
  kasur: 'M3 18.5V7 M3 14h18v4.5 M21 14v-2.5a3 3 0 0 0-3-3h-7.5V14 M3 18.5h18',
  lemari: 'M5 3.5h14v16H5z M12 3.5v16 M10 11.5h.01 M14 11.5h.01 M6.5 19.5v1.5 M17.5 19.5v1.5',
  meja: 'M3 9h18 M5 9v11 M19 9v11 M5 14h14',
  jendela: 'M4.5 3.5h15v17h-15z M12 3.5v17 M4.5 12h15',
  petir: 'M13 2.5 4.5 14h7l-1 7.5 9-12h-7z',
  titik: 'M5.5 12h.01 M12 12h.01 M18.5 12h.01',
  bagikan: 'M15.8 6.6 8.2 11 M8.2 13l7.6 4.4',
  salin: 'M8.5 8.5h11v11h-11z M15.5 8.5V5.2a.7.7 0 0 0-.7-.7H5.2a.7.7 0 0 0-.7.7v9.6a.7.7 0 0 0 .7.7h3.3',
  tukar: 'M7 4 3 8l4 4 M3 8h14 M17 20l4-4-4-4 M21 16H7',
  info: 'M12 11v6 M12 7.6h.01',
  gembok: 'M5 11h14v10H5z M8 11V7.5a4 4 0 0 1 8 0V11 M12 15v2',
  orang: 'M3.5 20a5.5 5.5 0 0 1 11 0 M16 4.8a3.3 3.3 0 0 1 0 6.4 M17.5 14.2A5.4 5.4 0 0 1 20.5 20',
  foto: 'M3.5 5h17v14h-17z M20.5 15.5l-5-5-8.5 8.5',
  kirim: 'M3.5 11.8 20.5 4l-6.6 16.5-3-7.2z M10.9 13.3 20.5 4',
  keluar: 'M14.5 4h4.2a.8.8 0 0 1 .8.8v14.4a.8.8 0 0 1-.8.8h-4.2 M10 8l-4 4 4 4 M6 12h10',
  ulang: 'M19.5 11a7.5 7.5 0 1 0-2.2 5.3 M19.5 4.5V11H13',
  mata: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z',
  papan: 'M3.5 5h17v9.5h-17z M8 14.5V21 M16 14.5V21 M7 8.5h10 M7 11.3h6',
  dompet: 'M4 7.5h15.2a.8.8 0 0 1 .8.8V19H4.8a.8.8 0 0 1-.8-.8z M4 7.5 15 4.5v3 M16.5 13.2h.01',
  motor: 'M5.5 17.5h4l3.5-6h3l2.5 6 M13 11.5l-1.5-3H9 M15 8.5h2.5',
  sapu: 'M14 3.5 9.5 12 M6 12h7.5l2 8.5H4z M8 16.5l-.8 4 M11.5 16.5v4',
};

// Bagian lingkaran untuk ikon yang tidak bisa satu path.
const LINGKAR = {
  kunci: [[7.5, 16.5, 4]],
  kamera: [[12, 13.3, 3.4]],
  jam: [[12, 12, 8.5]],
  info: [[12, 12, 8.5]],
  bagikan: [[18, 5.5, 2.4], [6, 12, 2.4], [18, 18.5, 2.4]],
  orang: [[9, 8, 3.5]],
  foto: [[8.8, 9.6, 1.6]],
  mata: [[12, 12, 3]],
  kipas: [[12, 12, 1.2]],
  motor: [[5.5, 17.5, 2.8], [18.5, 17.5, 2.8]],
};

export function Ikon({ nama, ukuran = 22, warna = W.tinta, tebal = 1.8, label }) {
  const d = P[nama];
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 24 24" label={label}>
      {d ? <Path d={d} fill="none" stroke={warna} strokeWidth={tebal} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {(LINGKAR[nama] || []).map(([cx, cy, r], i) => (
        <Circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={warna} strokeWidth={tebal} />
      ))}
    </Svg>
  );
}

/** Logo Grendel: grendel (slot pintu) di dalam ubin. */
export function Logo({ ukuran = 36, latar = W.bata, isi = W.kapur }) {
  return (
    <Svg width={ukuran} height={ukuran} viewBox="0 0 48 48" label="Logo Grendel">
      <Rect x="0" y="0" width="48" height="48" rx="12" fill={latar} />
      <Circle cx="0" cy="0" r="9" fill={W.kunyit} />
      <Circle cx="48" cy="48" r="9" fill={W.kunyit} />
      <Rect x="10" y="20" width="28" height="8" rx="4" fill={isi} />
      <Rect x="28" y="13" width="6" height="15" rx="3" fill={isi} />
      <Circle cx="15" cy="24" r="2" fill={latar} />
    </Svg>
  );
}
