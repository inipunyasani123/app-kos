// Semua angka turunan (tagihan, denda, status bayar, pemasukan, okupansi, tiket) dihitung dari
// "hari ini" WIB + catatan aksi pengguna yang tersimpan di perangkat. Data contoh tidak pernah basi.
import {
  PENGHUNI, MANTAN, KAMAR, TIPE, PARKIR, DENDA, TERBIT_HARI, PERAWATAN, IKLAN_AWAL, TIKET,
  KONTRAK_BULAN, CALON_AWAL, DEPOSIT, BIAYA_TETAP, BIAYA_SEKALI, BIAYA_PERBAIKAN, listrikBulan, pengumuman,
} from './data';
import { hariKe, tambahBulan, kunciBulan, cap, pecah, hariBerikut } from './waktu';

export const KAMAR_BY = Object.fromEntries(KAMAR.map((k) => [k.id, k]));

export function denda(telatHari) {
  const kena = Math.max(0, telatHari - DENDA.tenggang);
  return Math.min(DENDA.maks, kena * DENDA.perHari);
}

export function nomorKuitansi(kamar, jatuh) {
  const { y, m } = pecah(jatuh);
  return `UK/${String(y).slice(2)}${String(m + 1).padStart(2, '0')}/${kamar}`;
}

const METODE_SEED = ['qris', 'transfer', 'qris', 'tunai'];

/** Tanggal jatuh tempo periode j, dijangkarkan ke periode fokus supaya jaraknya dari hari ini selalu tepat. */
export const tglPeriode = (p, j) => tambahBulan(p.fokus, j - p.bulanKe);

function susunPeriode(p, idx, hari, aksi) {
  const fokus = hari + p.d;
  const masuk = tambahBulan(fokus, -p.bulanKe);
  const sewa = TIPE[KAMAR_BY[p.kamar].tipe].harga;
  const parkir = p.parkir ? PARKIR : 0;
  const periode = [];
  for (let j = 0; j <= p.bulanKe + 1; j++) {
    const jatuh = tambahBulan(fokus, j - p.bulanKe);
    const akhir = tambahBulan(fokus, j + 1 - p.bulanKe) - 1;
    let bayar = aksi.bayar?.[p.kamar]?.[j] || null;
    if (!bayar && (j < p.bulanKe || (j === p.bulanKe && p.lunas))) {
      const tl = j < p.bulanKe ? p.telat[j % p.telat.length] : -1;
      const hariBayar = Math.min(jatuh + tl, hari);
      const telat = Math.max(0, hariBayar - jatuh);
      const dd = denda(telat);
      bayar = {
        ts: cap(hariBayar, 8 + ((j * 5 + idx) % 11), (j * 17 + idx * 7) % 60),
        metode: METODE_SEED[(j + idx) % METODE_SEED.length],
        telat,
        denda: dd,
        total: sewa + parkir + dd,
        no: nomorKuitansi(p.kamar, jatuh),
      };
    }
    periode.push({ j, jatuh, akhir, sewa, parkir, bayar });
  }
  return { masuk, fokus, periode, sewa, parkir };
}

function statusTagihan(per, hari) {
  if (per.bayar) return { status: 'lunas', telat: per.bayar.telat, denda: per.bayar.denda, total: per.bayar.total };
  const s = hari - per.jatuh;
  const telat = Math.max(0, s);
  const dd = denda(telat);
  let status = 'segera';
  if (s === 0) status = 'hariIni';
  else if (s > 0 && s <= DENDA.tenggang) status = 'tenggang';
  else if (s > DENDA.tenggang) status = 'telat';
  return { status, telat, denda: dd, total: per.sewa + per.parkir + dd };
}

export function bangun(kini, aksi) {
  const hari = hariKe(kini);

  const penghuni = PENGHUNI.map((p, idx) => {
    const { masuk, fokus, periode, sewa, parkir } = susunPeriode(p, idx, hari, aksi);
    const belum = periode.filter((x) => !x.bayar && x.jatuh <= hari + TERBIT_HARI);
    const lunas = periode.filter((x) => x.bayar);
    const aktif = belum[0] || lunas[lunas.length - 1];
    const st = statusTagihan(aktif, hari);
    const berikut = periode.find((x) => x.jatuh > aktif.jatuh) || null;
    // Kontrak 12 bulanan bergulir; ketepatan bayar 12 periode terakhir (sampai periode aktif).
    const blok = Math.max(1, Math.ceil((aktif.j + 1) / KONTRAK_BULAN));
    const kontrak = { mulai: masuk, berakhir: tambahBulan(fokus, blok * KONTRAK_BULAN - p.bulanKe) - 1, deposit: DEPOSIT };
    const ketepatan = [];
    for (let j = aktif.j - 11; j <= aktif.j; j++) {
      const x = periode[j];
      if (!x) ketepatan.push({ j, jatuh: tambahBulan(fokus, j - p.bulanKe), nilai: 'belum' });
      else if (!x.bayar) ketepatan.push({ j, jatuh: x.jatuh, nilai: statusTagihan(x, hari).status === 'telat' ? 'telat' : 'berjalan' });
      else ketepatan.push({ j, jatuh: x.jatuh, nilai: x.bayar.telat > DENDA.tenggang ? 'telat' : x.bayar.telat > 0 ? 'tenggang' : 'tepat', telat: x.bayar.telat });
    }
    return { ...p, masuk, fokus, periode, sewa, parkir, tagihan: { ...aktif, ...st }, berikut, kontrak, ketepatan, ingat: aksi.ingat?.[p.kamar] || null };
  });

  // Satu pengelompokan status bayar dipakai bersama oleh Ringkas dan tab Bayar (hitungan selalu sama).
  const kelompok = { telat: [], tenggang: [], segera: [], lunas: [] };
  for (const p of penghuni) {
    const s = p.tagihan.status;
    kelompok[s === 'hariIni' ? 'tenggang' : s].push(p);
  }
  for (const k of Object.keys(kelompok)) kelompok[k].sort((a, b) => a.tagihan.jatuh - b.tagihan.jatuh);
  const terkumpul = kelompok.lunas.reduce((t, p) => t + p.tagihan.total, 0);
  const ditunggu = [...kelompok.telat, ...kelompok.tenggang, ...kelompok.segera].reduce((t, p) => t + p.tagihan.total, 0);
  const penghuniBy = Object.fromEntries(penghuni.map((p) => [p.kamar, p]));

  // Kamar dan statusnya
  const kamar = KAMAR.map((k) => {
    const p = penghuniBy[k.id];
    const m = MANTAN.find((x) => x.kamar === k.id);
    const seed = p ? 'terisi' : PERAWATAN[k.id] ? 'perawatan' : 'kosong';
    const status = p ? 'terisi' : aksi.kamar?.[k.id] || seed;
    const iklan = status === 'kosong' && (aksi.iklan?.[k.id] ?? IKLAN_AWAL[k.id] ?? false);
    return {
      ...k,
      tipeData: TIPE[k.tipe],
      status,
      penghuni: p || null,
      kosongSejak: m ? hari - m.keluar : null,
      perawatan: status === 'perawatan' ? { catatan: PERAWATAN[k.id]?.catatan || 'Perbaikan kamar', selesai: hari + (PERAWATAN[k.id]?.selesaiHari ?? 3) } : null,
      iklan,
    };
  });

  // Semua pembayaran (penghuni sekarang + penghuni lama) untuk grafik pemasukan
  const bayarSemua = [];
  for (const p of penghuni) for (const x of p.periode) if (x.bayar) bayarSemua.push({ ts: x.bayar.ts, total: x.bayar.total, kamar: p.kamar });
  const mantan = MANTAN.map((m) => {
    const keluar = hari - m.keluar;
    const masuk = tambahBulan(keluar, -m.lama);
    const harga = TIPE[KAMAR_BY[m.kamar].tipe].harga + (m.parkir ? PARKIR : 0);
    for (let j = 0; j < m.lama; j++) {
      const jatuh = tambahBulan(masuk, j);
      if (jatuh <= hari) bayarSemua.push({ ts: cap(jatuh, 10), total: harga, kamar: m.kamar });
    }
    return { ...m, masukHari: masuk, keluarHari: keluar };
  });

  const bulanIni = kunciBulan(hari);

  // Pengeluaran: biaya rutin per bulan (yang tanggalnya sudah lewat), biaya sekali, dan perbaikan dari tiket selesai.
  const keluarSemua = [];
  for (let i = 11; i >= 0; i--) {
    const kb = bulanIni - i;
    const y = Math.floor(kb / 12);
    const m = kb % 12;
    for (const b of BIAYA_TETAP) {
      const n = Math.round(Date.UTC(y, m, b.tanggal) / 864e5);
      if (n <= hari) keluarSemua.push({ id: `${b.id}-${kb}`, label: b.label, ikon: b.ikon, nominal: b.nominal ?? listrikBulan(kb), hari: n, jenis: 'rutin' });
    }
  }
  for (const b of BIAYA_SEKALI) keluarSemua.push({ id: b.id, label: b.label, ikon: b.ikon, nominal: b.nominal, hari: hari - b.hariLalu, jenis: 'sekali' });

  const grafik = [];
  for (let i = 11; i >= 0; i--) {
    const kb = bulanIni - i;
    const y = Math.floor(kb / 12);
    const m = kb % 12;
    const tengah = Math.round(Date.UTC(y, m, 15) / 864e5);
    const titik = i === 0 ? hari : tengah;
    const total = bayarSemua.filter((b) => kunciBulan(hariKe(b.ts)) === kb && b.ts <= kini).reduce((s, b) => s + b.total, 0);
    const terisi = penghuni.filter((p) => p.masuk <= titik).length + mantan.filter((x) => x.masukHari <= titik && x.keluarHari > titik).length;
    grafik.push({ kb, m, y, total, terisi, berjalan: i === 0 });
  }

  // Tertagih bulan ini: periode yang jatuh tempo di bulan kalender ini
  let ditagih = 0;
  let diterima = 0;
  for (const p of penghuni)
    for (const x of p.periode)
      if (kunciBulan(x.jatuh) === bulanIni) {
        ditagih += x.sewa + x.parkir;
        if (x.bayar) diterima += x.bayar.total;
      }

  // Tiket kerusakan: contoh + buatan pengguna, ditambah perubahan status yang disimpan
  const tiketContoh = TIKET.map((t) => ({
    ...t,
    riwayat: t.riwayat.map((r) => ({
      status: r.status,
      ts: kini - r.jam * 3600e3,
      catatan: r.catatan,
      jadwal: r.jadwalHari != null ? { hari: hari + r.jadwalHari, jam: r.jadwalJam } : undefined,
    })),
  }));
  const tiket = [...(aksi.tiketBaru || []), ...tiketContoh]
    .map((t) => {
      const tambahan = aksi.tiket?.[t.id] || [];
      const riwayat = [...t.riwayat, ...tambahan];
      const akhir = riwayat[riwayat.length - 1];
      const jadwal = [...riwayat].reverse().find((r) => r.jadwal)?.jadwal || null;
      return { ...t, riwayat, status: akhir.status, dibuat: riwayat[0].ts, diubah: akhir.ts, jadwal };
    })
    .sort((a, b) => b.diubah - a.diubah);

  for (const t of tiket) {
    if (t.status !== 'selesai') continue;
    const biaya = t.biaya ?? BIAYA_PERBAIKAN[t.kategori] ?? 0;
    if (biaya) keluarSemua.push({ id: `perbaikan-${t.id}`, label: `Perbaikan: ${t.judul.toLowerCase()} (Kamar ${t.kamar})`, ikon: 'obeng', nominal: biaya, hari: hariKe(t.diubah), jenis: 'perbaikan' });
  }
  for (const g of grafik) {
    g.keluar = keluarSemua.filter((k) => kunciBulan(k.hari) === g.kb).reduce((t, k) => t + k.nominal, 0);
    g.bersih = g.total - g.keluar;
  }
  const keluarBulanIni = keluarSemua.filter((k) => kunciBulan(k.hari) === bulanIni).sort((a, b) => b.hari - a.hari);

  // Kontrak penghuni demo (Kamar 07)
  const demo = penghuni.find((p) => p.demo);
  const perpanjang = aksi.kontrak || null;
  const tambahBln = perpanjang?.status === 'disetujui' ? perpanjang.bulan : 0;
  const kontrak = {
    mulai: demo.masuk,
    berakhir: tglPeriode(demo, KONTRAK_BULAN + tambahBln) - 1,
    bulanJalan: demo.periode.filter((x) => x.jatuh <= hari).length,
    total: KONTRAK_BULAN + tambahBln,
    perpanjang,
    akhiri: aksi.akhiri || null,
  };

  const calon = [...(aksi.calon || []), ...CALON_AWAL.map((c) => ({
    ...c,
    ts: kini - c.jamLalu * 3600e3,
    hariSurvei: c.hariSurvei === 'besok' ? hari + 1 : hariBerikut(hari, c.hariSurvei),
  }))];

  return {
    kini, hari, penghuni, penghuniBy, demo, kamar, grafik, ditagih, diterima, tiket, kontrak, calon,
    kelompok, terkumpul, ditunggu, keluarBulanIni, pengingat: !!aksi.pengingat, dibalas: aksi.dibalas || {},
    pengumuman: pengumuman(hari),
    chat: aksi.chat || [],
  };
}

export const LABEL_STATUS = {
  lunas: 'Lunas',
  segera: 'Belum jatuh tempo',
  hariIni: 'Jatuh tempo hari ini',
  tenggang: 'Masa tenggang',
  telat: 'Telat bayar',
};
