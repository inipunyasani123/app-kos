// Semua angka turunan (tagihan, denda, status bayar, pemasukan, okupansi, tiket) dihitung dari
// "hari ini" WIB + catatan aksi pengguna yang tersimpan di perangkat. Data contoh tidak pernah basi.
import {
  PENGHUNI, MANTAN, KAMAR, TIPE, PARKIR, DENDA, TERBIT_HARI, PERAWATAN, IKLAN_AWAL, TIKET,
  KONTRAK_BULAN, CALON_AWAL, pengumuman,
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

function susunPeriode(p, idx, hari, aksi) {
  const fokus = hari + p.d;
  const masuk = tambahBulan(fokus, -p.bulanKe);
  const sewa = TIPE[KAMAR_BY[p.kamar].tipe].harga;
  const parkir = p.parkir ? PARKIR : 0;
  const periode = [];
  for (let j = 0; j <= p.bulanKe + 1; j++) {
    const jatuh = tambahBulan(masuk, j);
    const akhir = tambahBulan(masuk, j + 1) - 1;
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
  return { masuk, periode, sewa, parkir };
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
    const { masuk, periode, sewa, parkir } = susunPeriode(p, idx, hari, aksi);
    const belum = periode.filter((x) => !x.bayar && x.jatuh <= hari + TERBIT_HARI);
    const lunas = periode.filter((x) => x.bayar);
    const aktif = belum[0] || lunas[lunas.length - 1];
    const st = statusTagihan(aktif, hari);
    const berikut = periode.find((x) => x.jatuh > aktif.jatuh) || null;
    return { ...p, masuk, periode, sewa, parkir, tagihan: { ...aktif, ...st }, berikut, ingat: aksi.ingat?.[p.kamar] || null };
  });
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
  const grafik = [];
  for (let i = 5; i >= 0; i--) {
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

  // Kontrak penghuni demo (Kamar 07)
  const demo = penghuni.find((p) => p.demo);
  const perpanjang = aksi.kontrak || null;
  const tambahBln = perpanjang?.status === 'disetujui' ? perpanjang.bulan : 0;
  const kontrak = {
    mulai: demo.masuk,
    berakhir: tambahBulan(demo.masuk, KONTRAK_BULAN + tambahBln) - 1,
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
