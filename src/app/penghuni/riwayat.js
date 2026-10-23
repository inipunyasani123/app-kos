import { View, Text, Share, Platform } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { DENDA } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, namaBulan, hariKe } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Ketuk, Kerangka, Lencana } from '../../ui/dasar';
import { Ikon } from '../../ui/Ikon';
import { Kuitansi, METODE } from '../../ui/kos';
import { useLembar, useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Riwayat Bayar Kos dan Kuitansi · Grendel',
    deskripsi: 'Riwayat pembayaran sewa kos per bulan lengkap dengan kuitansi bercap lunas, angka terbilang, metode bayar, dan catatan telat atau tepat waktu.',
    path: '/penghuni/riwayat',
  });
}

export default function Riwayat() {
  const { data } = useToko();
  return (
    <Layar kembali="/penghuni/tagihan" kembaliLabel="Tagihan" judul="Riwayat bayar" sub="Ketuk satu bulan untuk membuka kuitansinya.">
      {data ? <Isi data={data} /> : <Kerangka tinggi={420} />}
    </Layar>
  );
}

function IsiKuitansi({ p, x }) {
  const kabar = useKabar();
  const bagikan = async () => {
    const teks = `Kuitansi ${x.bayar.no}: ${p.nama}, sewa Kamar ${p.kamar} ${namaBulan(x.jatuh)}, ${rupiah(x.bayar.total)}, lunas ${tgl(hariKe(x.bayar.ts))}.`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        await navigator.clipboard?.writeText(teks);
        kabar('Ringkasan kuitansi disalin.');
      } else {
        await Share.share({ message: teks });
      }
    } catch {
      kabar('Tidak bisa membagikan dari peramban ini.');
    }
  };
  return (
    <>
      <Kuitansi penghuni={p} periode={x} bayar={x.bayar} />
      <Tombol jenis="gelap" ikon="bagikan" label="Bagikan kuitansi" onPress={bagikan} penuh />
    </>
  );
}

function Isi({ data }) {
  const p = data.demo;
  const lembar = useLembar();
  const lunas = p.periode.filter((x) => x.bayar);
  const tepat = lunas.filter((x) => x.bayar.telat <= DENDA.tenggang).length;
  const total = lunas.reduce((s, x) => s + x.bayar.total, 0);
  const urut = [...lunas].reverse();
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1.3, backgroundColor: W.tinta, borderRadius: 20, padding: 14, gap: 2 }}>
          <Text style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: '#D9CDBB' }]}>TOTAL DIBAYAR</Text>
          <Text style={[F.judul, ANGKA, { fontSize: 24, lineHeight: 30, color: W.kunyit }]}>{rupiah(total)}</Text>
          <Text style={[F.teks, { fontSize: 12.5, color: '#EDE4D6' }]}>sejak {tgl(p.masuk)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: W.hijauMuda, borderRadius: 20, padding: 14, gap: 2 }}>
          <T v="label" warna={W.hijau}>Tanpa denda</T>
          <Text style={[F.judul, ANGKA, { fontSize: 24, lineHeight: 30, color: W.hijau }]}>
            {tepat}/{lunas.length}
          </Text>
          <T v="mini" warna={W.hijau}>kali bayar</T>
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Sub level={2} v="h3">Per bulan</Sub>
        {urut.map((x) => {
          const telat = x.bayar.telat;
          return (
            <Ketuk
              key={x.j}
              onPress={() => lembar.buka({ judul: `Kuitansi ${namaBulan(x.jatuh)}`, isi: <IsiKuitansi p={p} x={x} /> })}
              aksesLabel={`Kuitansi ${namaBulan(x.jatuh)}, ${rupiah(x.bayar.total)}, ${telat ? `telat ${telat} hari` : 'tepat waktu'}`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: W.kertas, borderRadius: 16, borderWidth: 1, borderColor: W.garis, padding: 12 }}
            >
              <View style={{ width: 44, alignItems: 'center' }}>
                <Text style={[F.judul, ANGKA, { fontSize: 20, color: W.tinta }]}>{String(new Date(x.jatuh * 864e5).getUTCMonth() + 1).padStart(2, '0')}</Text>
                <T v="mini">{new Date(x.jatuh * 864e5).getUTCFullYear()}</T>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <T v="kuat">{namaBulan(x.jatuh, false)}</T>
                <T v="mini">{tgl(hariKe(x.bayar.ts))} · {METODE[x.bayar.metode]}</T>
                <Lencana
                  teks={telat > DENDA.tenggang ? `Telat ${telat} hari · denda ${rupiah(x.bayar.denda)}` : telat ? `Telat ${telat} hari · tenggang` : 'Tepat waktu'}
                  warna={telat > DENDA.tenggang ? 'bata' : telat ? 'kunyit' : 'hijau'}
                />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <T v="kuat" style={ANGKA}>{rupiah(x.bayar.total)}</T>
                <Ikon nama="nota" ukuran={18} warna={W.bata} />
              </View>
            </Ketuk>
          );
        })}
      </View>
    </>
  );
}
