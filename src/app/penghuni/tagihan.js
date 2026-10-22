import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { DENDA, TIPE } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, tglPendek, hariTgl, jarakHari, namaBulan, hariKe } from '../../lib/waktu';
import { KAMAR_BY, denda } from '../../lib/hitung';
import { Layar, T, Sub, Tombol, Kartu, Kerangka, Lencana, BarisInfo, Garis } from '../../ui/dasar';
import { Ikon } from '../../ui/Ikon';
import { Gerigi } from '../../ui/motif';
import { lencanaTagihan, AturanDenda, METODE } from '../../ui/kos';

export function generateMetadata() {
  return meta({
    judul: 'Tagihan Sewa Kos dan Aturan Denda · Grendel',
    deskripsi: 'Rincian tagihan sewa kamar kos: sewa, parkir, denda telat yang dihitung terbuka, jatuh tempo dalam WIB, dan simulasi denda kalau terlambat membayar.',
    path: '/penghuni/tagihan',
  });
}

export default function Tagihan() {
  const { data } = useToko();
  return (
    <Layar judul="Tagihan" sub={data ? `Periode ${tglPendek(data.demo.tagihan.jatuh)} – ${tgl(data.demo.tagihan.akhir)}` : 'Periode sewa berjalan'}>
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={330} />
          <Kerangka tinggi={180} />
        </>
      )}
    </Layar>
  );
}

function Simulasi({ sewaParkir }) {
  const [hariTelat, setHariTelat] = useState(5);
  const d = denda(hariTelat);
  const kena = Math.max(0, hariTelat - DENDA.tenggang);
  const ubah = (n) => setHariTelat((x) => Math.max(0, Math.min(30, x + n)));
  const tombol = (n, ikon, label) => (
    <Pressable
      role="button"
      aria-label={label}
      onPress={() => ubah(n)}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: W.tinta, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 })}
    >
      <Ikon nama={ikon} ukuran={20} warna={W.kapur} tebal={2.4} />
    </Pressable>
  );
  return (
    <Kartu style={{ gap: 12 }}>
      <Sub level={2} v="h3">Hitung kalau telat</Sub>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        {tombol(-1, 'kiri', 'Kurangi satu hari')}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[F.judul, ANGKA, { fontSize: 30, lineHeight: 36, color: W.tinta }]}>{hariTelat}</Text>
          <T v="mini">hari setelah jatuh tempo</T>
        </View>
        {tombol(1, 'kanan', 'Tambah satu hari')}
      </View>
      <View aria-live="polite" style={{ backgroundColor: d ? W.bataMuda : W.hijauMuda, borderRadius: 14, padding: 12, gap: 2 }}>
        <Text style={[F.tebal, { fontSize: 15, color: d ? W.bataTua : W.hijau }]}>
          {d ? `Denda ${rupiah(d)} · total ${rupiah(sewaParkir + d)}` : `Tanpa denda · total ${rupiah(sewaParkir)}`}
        </Text>
        <T v="mini" warna={d ? W.bataTua : W.hijau}>
          {hariTelat <= DENDA.tenggang
            ? `Masih dalam ${DENDA.tenggang} hari tenggang.`
            : d === DENDA.maks
              ? `${kena} hari kena denda, tetapi dibatasi paling banyak ${rupiah(DENDA.maks)}.`
              : `${hariTelat} hari telat − ${DENDA.tenggang} hari tenggang = ${kena} hari × ${rupiah(DENDA.perHari)}.`}
        </T>
      </View>
    </Kartu>
  );
}

function Isi({ data }) {
  const p = data.demo;
  const t = p.tagihan;
  const hari = data.hari;
  const k = KAMAR_BY[p.kamar];
  const l = lencanaTagihan(t, hari);
  const lunas = t.status === 'lunas';
  const riwayat = p.periode.filter((x) => x.bayar).reverse().slice(0, 3);
  return (
    <>
      <View>
        <Gerigi />
        <View style={{ backgroundColor: W.kertas, padding: 16, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T v="label">Tagihan {namaBulan(t.jatuh)}</T>
            <Lencana {...l} />
          </View>
          <BarisInfo label={`Sewa Kamar ${k.id} · Tipe ${TIPE[k.tipe].nama}`} nilai={rupiah(t.sewa)} />
          <BarisInfo label="Parkir motor" nilai={rupiah(t.parkir)} />
          <BarisInfo
            label={t.denda ? `Denda telat ${t.telat} hari` : lunas ? 'Denda telat' : 'Denda telat (belum kena)'}
            nilai={rupiah(t.denda)}
            warna={t.denda ? W.bata : undefined}
          />
          <Garis style={{ marginVertical: 4 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <T v="kuat">Total</T>
            <Text style={[F.judul, ANGKA, { fontSize: 30, lineHeight: 36, color: W.tinta }]}>{rupiah(t.total)}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <Ikon nama="kalender" ukuran={18} warna={W.abu} />
            <T v="kecil" style={{ flex: 1 }}>
              {lunas
                ? `Lunas ${tgl(hariKe(t.bayar.ts))} lewat ${METODE[t.bayar.metode]}.`
                : `Jatuh tempo ${hariTgl(t.jatuh)}, ${jarakHari(t.jatuh, hari)}. Denda mulai ${tgl(t.jatuh + DENDA.tenggang + 1)}.`}
            </T>
          </View>
          <View style={{ marginTop: 10 }}>
            {lunas ? (
              <Tombol href="/penghuni/riwayat" jenis="gelap" ikon="nota" label="Lihat kuitansi" penuh />
            ) : (
              <Tombol href="/penghuni/bayar" ukuran="besar" ikon="qr" label={`Bayar ${rupiah(t.total)}`} penuh />
            )}
          </View>
        </View>
        <Gerigi bawah />
      </View>

      <Kartu style={{ gap: 10 }}>
        <Sub level={2} v="h3">Aturan denda</Sub>
        <AturanDenda />
      </Kartu>

      <Simulasi sewaParkir={t.sewa + t.parkir} />

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Sub level={2} v="h3">Pembayaran terakhir</Sub>
          <Tombol href="/penghuni/riwayat" jenis="teks" ukuran="kecil" label="Semua riwayat" ikonKanan="kanan" />
        </View>
        {riwayat.map((x) => (
          <View key={x.j} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas, borderRadius: 16, borderWidth: 1, borderColor: W.garis, padding: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: x.bayar.telat > DENDA.tenggang ? W.bataMuda : W.hijauMuda, alignItems: 'center', justifyContent: 'center' }}>
              <Ikon nama={x.bayar.telat > DENDA.tenggang ? 'awas' : 'centang'} ukuran={18} warna={x.bayar.telat > DENDA.tenggang ? W.bataTua : W.hijau} tebal={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="kuat">{namaBulan(x.jatuh)}</T>
              <T v="mini">{tgl(hariKe(x.bayar.ts))} · {METODE[x.bayar.metode]}{x.bayar.telat ? ` · telat ${x.bayar.telat} hari` : ''}</T>
            </View>
            <T v="kuat" style={ANGKA}>{rupiah(x.bayar.total)}</T>
          </View>
        ))}
      </View>
    </>
  );
}
