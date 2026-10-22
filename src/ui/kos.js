import { View, Text, Image } from 'react-native';
import { Svg, Path, Rect, Defs, Pattern } from './svg';
import { useId } from 'react';
import { W, F, ANGKA } from '../lib/tema';
import { rupiah, terbilang } from '../lib/uang';
import { tgl, tglPendek, tglPanjang, jam, relatif, namaBulan, hariKe, jarakHari } from '../lib/waktu';
import { KOS, STATUS_TIKET, KATEGORI, URGENSI, FOTO_KERAN, DENDA, TIPE } from '../lib/data';
import { KAMAR_BY } from '../lib/hitung';
import { T, Sub, Lencana, Garis } from './dasar';
import { Gerigi, Stempel } from './motif';
import { Ikon } from './Ikon';

export const METODE = { qris: 'QRIS', transfer: 'Transfer bank', tunai: 'Tunai ke pengelola' };

export function lencanaTagihan(t, hari) {
  switch (t.status) {
    case 'lunas':
      return { teks: 'Lunas', warna: 'hijau', ikon: 'centang' };
    case 'hariIni':
      return { teks: 'Jatuh tempo hari ini', warna: 'kunyit', ikon: 'jam' };
    case 'tenggang':
      return { teks: `Telat ${t.telat} hari · tenggang`, warna: 'kunyit', ikon: 'jam' };
    case 'telat':
      return { teks: `Telat ${t.telat} hari`, warna: 'bata', ikon: 'awas' };
    default:
      return { teks: `Jatuh tempo ${jarakHari(t.jatuh, hari)}`, warna: 'abu', ikon: 'kalender' };
  }
}

/** Kuitansi bergaya nota kertas: "sudah terima dari", terbilang, cap LUNAS. */
export function Kuitansi({ penghuni, periode, bayar, latar = W.kapur }) {
  const id = `ar${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const k = KAMAR_BY[penghuni.kamar];
  const hariBayar = hariKe(bayar.ts);
  return (
    <View role="group" aria-label={`Kuitansi ${bayar.no}`}>
      <Gerigi latar={latar} />
      <View style={{ backgroundColor: W.kertas, paddingHorizontal: 18, paddingVertical: 14, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={[F.judul, { fontSize: 22, letterSpacing: 3, color: W.tinta }]}>KUITANSI</Text>
          <T v="mini" style={ANGKA}>No. {bayar.no}</T>
        </View>
        <T v="mini">{KOS.nama} · {KOS.wilayah}</T>
        <Garis />
        <Isian label="Sudah terima dari" nilai={penghuni.nama} />
        <Isian label="Untuk pembayaran" nilai={`Sewa Kamar ${k.id} (Tipe ${TIPE[k.tipe].nama}) ${tglPendek(periode.jatuh)} – ${tgl(periode.akhir)}`} />
        <Isian label="Terbilang" nilai={terbilang(bayar.total)} miring />
        <View style={{ gap: 4 }}>
          <Rincian label="Sewa kamar" nilai={periode.sewa} />
          {periode.parkir ? <Rincian label="Parkir motor" nilai={periode.parkir} /> : null}
          {bayar.denda ? <Rincian label={`Denda telat ${bayar.telat} hari`} nilai={bayar.denda} /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <View style={{ height: 46, minWidth: 168, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1.5, borderColor: W.tinta, transform: [{ skewX: '-10deg' }], overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} aria-hidden>
              <Svg width="100%" height="46">
                <Defs>
                  <Pattern id={id} patternUnits="userSpaceOnUse" width="6" height="6">
                    <Path d="M0 6 6 0" stroke={W.garis} strokeWidth="1.2" />
                  </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="46" fill={`url(#${id})`} />
              </Svg>
            </View>
            <Text style={[F.judul, ANGKA, { fontSize: 22, color: W.tinta, transform: [{ skewX: '10deg' }] }]}>{rupiah(bayar.total)}</Text>
          </View>
          <Stempel tanggal={tgl(hariBayar).toUpperCase()} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 2, gap: 10 }}>
          <View style={{ gap: 2, flex: 1 }}>
            <T v="mini">Dibayar {tglPanjang(hariBayar)}, {jam(bayar.ts)} WIB</T>
            <T v="mini">Lewat {METODE[bayar.metode] || bayar.metode}{bayar.telat ? ` · telat ${bayar.telat} hari` : ' · tepat waktu'}</T>
          </View>
          <View style={{ alignItems: 'center', flexShrink: 0 }}>
            <View aria-hidden>
              <Svg width="74" height="28" viewBox="0 0 74 28">
                <Path d="M3 20c6-14 10-14 9-2-1 8 5-14 10-8s-2 12 4 8 6-12 10-9-1 9 4 8c5-1 7-10 11-9s-2 9 3 8 8-6 14-6" fill="none" stroke={W.biru} strokeWidth="1.6" strokeLinecap="round" />
              </Svg>
            </View>
            <T v="mini">{KOS.pemilik}</T>
          </View>
        </View>
      </View>
      <Gerigi latar={latar} bawah />
    </View>
  );
}

function Isian({ label, nilai, miring }) {
  return (
    <View style={{ gap: 1 }}>
      <T v="mini">{label}</T>
      <View style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: W.garisTua, paddingBottom: 3 }}>
        <Text style={[miring ? F.sedang : F.tebal, { fontSize: 14.5, lineHeight: 20, color: W.tinta, fontStyle: miring ? 'italic' : 'normal' }]}>{nilai}</Text>
      </View>
    </View>
  );
}

function Rincian({ label, nilai }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <T v="kecil">{label}</T>
      <T v="kecil" style={ANGKA}>{rupiah(nilai)}</T>
    </View>
  );
}

const WARNA_STATUS = { baru: W.bata, dijadwalkan: W.biru, dikerjakan: W.coklat, selesai: W.hijau };

export function lencanaTiket(status) {
  return {
    baru: { teks: 'Terkirim', warna: 'bata' },
    dijadwalkan: { teks: 'Dijadwalkan', warna: 'biru' },
    dikerjakan: { teks: 'Dikerjakan', warna: 'kunyit' },
    selesai: { teks: 'Selesai', warna: 'hijau', ikon: 'centang' },
  }[status];
}

/** Langkah status perbaikan: Terkirim → Dijadwalkan → Dikerjakan → Selesai, dengan waktu & catatan. */
export function LangkahTiket({ tiket, kini, ringkas }) {
  const idx = STATUS_TIKET.findIndex((s) => s.id === tiket.status);
  const catatan = [...tiket.riwayat].reverse().find((r) => r.catatan);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }} role="img" aria-label={`Status: ${STATUS_TIKET[idx].label}, langkah ${idx + 1} dari 4`}>
        {STATUS_TIKET.map((s, i) => (
          <View key={s.id} style={{ flex: i === 0 ? 0 : 1, flexDirection: 'row', alignItems: 'center' }}>
            {i > 0 ? <View style={{ flex: 1, height: 3, backgroundColor: i <= idx ? WARNA_STATUS[tiket.status] : W.garis }} /> : null}
            <View
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: i <= idx ? WARNA_STATUS[tiket.status] : W.kertas,
                borderWidth: 2,
                borderColor: i <= idx ? WARNA_STATUS[tiket.status] : W.garisTua,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {i < idx || tiket.status === 'selesai' ? <Ikon nama="centang" ukuran={11} warna={W.putih} tebal={3} /> : null}
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} aria-hidden>
        {STATUS_TIKET.map((s, i) => (
          <Text key={s.id} style={[i === idx ? F.pekat : F.sedang, { fontSize: 10.5, color: i <= idx ? W.tinta : W.abu, textAlign: i === 0 ? 'left' : i === 3 ? 'right' : 'center', flex: 1 }]}>
            {s.label}
          </Text>
        ))}
      </View>
      {!ringkas && catatan ? (
        <View style={{ backgroundColor: W.kapur, borderRadius: 12, padding: 10, gap: 2, borderLeftWidth: 3, borderLeftColor: WARNA_STATUS[tiket.status] }}>
          <T v="kecil" warna={W.tinta}>{catatan.catatan}</T>
          <T v="mini">{relatif(catatan.ts, kini)}{tiket.jadwal ? ` · jadwal ${jarakHari(tiket.jadwal.hari, hariKe(kini))} ${tiket.jadwal.jam} WIB` : ''}</T>
        </View>
      ) : null}
    </View>
  );
}

/** Kartu laporan kerusakan (dipakai penghuni & pemilik). */
export function KartuTiket({ tiket, kini, aksi, tampilKamar, level = 3 }) {
  const kat = KATEGORI.find((k) => k.id === tiket.kategori) || KATEGORI[5];
  const urg = URGENSI.find((u) => u.id === tiket.urgensi);
  const l = lencanaTiket(tiket.status);
  const foto = tiket.foto === 'keran' ? FOTO_KERAN : tiket.fotoUri ? { uri: tiket.fotoUri } : null;
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: W.kapur, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: W.garis }}>
          <Ikon nama={kat.ikon} ukuran={22} warna={W.bata} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Sub level={level} v="h3">{tiket.judul}</Sub>
          <T v="mini">
            {tampilKamar ? `Kamar ${tiket.kamar} · ` : ''}
            {tiket.lokasi} · {tiket.id} · {relatif(tiket.dibuat, kini)}
          </T>
        </View>
        {foto ? <Image source={foto} style={{ width: 56, height: 42, borderRadius: 8 }} aria-label={`Foto lampiran: ${tiket.judul}`} /> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Lencana {...l} />
        {urg ? <Lencana teks={urg.label} warna={urg.id === 'darurat' ? 'bata' : 'abu'} ikon={urg.id === 'darurat' ? 'awas' : undefined} /> : null}
        <Lencana teks={kat.label} warna="abu" />
      </View>
      {tiket.catatan ? <T v="kecil">“{tiket.catatan}”</T> : null}
      <LangkahTiket tiket={tiket} kini={kini} />
      {aksi}
    </View>
  );
}

export function AturanDenda() {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', height: 30, borderRadius: 10, overflow: 'hidden' }} role="img" aria-label={`Jatuh tempo, lalu ${DENDA.tenggang} hari tenggang tanpa denda, setelah itu denda ${rupiah(DENDA.perHari)} per hari sampai paling banyak ${rupiah(DENDA.maks)}`}>
        <View style={{ width: 84, backgroundColor: W.tinta, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[F.pekat, { color: W.kapur, fontSize: 9.5 }]} numberOfLines={1}>JATUH TEMPO</Text>
        </View>
        <View style={{ flex: 1.1, backgroundColor: W.kunyit, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[F.pekat, { color: W.tinta, fontSize: 9.5 }]} numberOfLines={1}>+{DENDA.tenggang} HARI TENGGANG</Text>
        </View>
        <View style={{ flex: 1.4, backgroundColor: W.bata, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[F.pekat, { color: W.putih, fontSize: 9.5 }]} numberOfLines={1}>DENDA PER HARI</Text>
        </View>
      </View>
      <T v="kecil">
        Bayar sampai {DENDA.tenggang} hari setelah jatuh tempo masih tanpa denda. Mulai hari ke-{DENDA.tenggang + 1}, denda {rupiah(DENDA.perHari)} per hari, paling banyak {rupiah(DENDA.maks)}.
      </T>
    </View>
  );
}

export { namaBulan };
