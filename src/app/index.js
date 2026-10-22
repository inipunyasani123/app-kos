import { View, Text, ScrollView, Pressable } from 'react-native';
import { Tautan } from '../ui/Tautan';
import { W, F, BAYANGAN } from '../lib/tema';
import { meta } from '../lib/meta';
import { KOS } from '../lib/data';
import { useToko } from '../lib/toko';
import { T, Judul, Tombol } from '../ui/dasar';
import { Logo, Ikon } from '../ui/Ikon';
import { Gantungan, Tegel } from '../ui/motif';
import { Fasad } from '../ui/Fasad';
import { useKabar } from '../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Grendel: Aplikasi Kos untuk Penghuni dan Pemilik',
    deskripsi: 'Demo aplikasi kos Android, iOS, dan web: tagihan sewa dan denda yang jelas, bayar QRIS simulasi, kuitansi, lapor kerusakan, denah kamar, dan pemasukan.',
    path: '/',
  });
}

function PintuMode({ href, warna, teks, nomor, judul, isi, ikon }) {
  return (
      <Tautan
        href={href}
        style={({ pressed, hovered }) => ({
          flex: 1,
          backgroundColor: warna,
          borderRadius: 24,
          padding: 14,
          paddingTop: 10,
          gap: 6,
          opacity: pressed ? 0.9 : 1,
          transform: pressed ? [{ scale: 0.985 }] : undefined,
          boxShadow: hovered ? BAYANGAN : undefined,
        })}
      >
        <View style={{ alignItems: 'center' }}>
          <Gantungan nomor={nomor} kecil warna={W.kapur} teks={warna} />
        </View>
        <Text style={[F.judul, { fontSize: 22, lineHeight: 26, color: teks }]}>{judul}</Text>
        <Text style={[F.teks, { fontSize: 13, lineHeight: 18, color: teks, opacity: 0.92 }]}>{isi}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Text style={[F.tebal, { fontSize: 14, color: teks }]}>Masuk</Text>
          <Ikon nama={ikon} ukuran={18} warna={teks} tebal={2.2} />
        </View>
      </Tautan>
  );
}

export default function Sambutan() {
  const { aturUlang } = useToko();
  const kabar = useKabar();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: W.kapur }} contentContainerStyle={{ paddingBottom: 28 }}>
      <View role="main" style={{ gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16 }}>
          <Logo ukuran={38} />
          <Text style={[F.judul, { fontSize: 24, color: W.tinta, flex: 1 }]}>Grendel</Text>
          <View style={{ borderWidth: 1.5, borderColor: W.tinta, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 }}>
            <Text style={[F.pekat, { fontSize: 11, letterSpacing: 1.2, color: W.tinta }]}>DEMO</Text>
          </View>
        </View>

        <View style={{ marginHorizontal: 16, borderRadius: 26, overflow: 'hidden', backgroundColor: W.kunyitMuda, borderWidth: 1, borderColor: W.garis }}>
          <View style={{ paddingHorizontal: 10, paddingTop: 14 }}>
            <Fasad />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: W.tinta, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Text style={[F.tebal, { color: W.kapur, fontSize: 14 }]}>{KOS.nama}</Text>
            <Text style={[F.teks, { color: '#E8DFD1', fontSize: 12.5 }]}>12 kamar · {KOS.wilayah.split(',')[1].trim()}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Judul>Bayar kos, lapor kerusakan, pantau kamar.</Judul>
          <T v="teks" warna={W.abu}>
            Satu aplikasi untuk penghuni dan pemilik {KOS.nama}. Usaha, nama, dan angkanya rekaan; coba saja dua sisinya.
          </T>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <T v="label">Masuk sebagai</T>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PintuMode
              href="/penghuni"
              warna={W.bata}
              teks={W.putih}
              nomor="07"
              judul="Penghuni"
              isi="Laras, Kamar 07. Tagihan, kuitansi, lapor kerusakan, kontrak."
              ikon="kanan"
            />
            <PintuMode
              href="/pemilik"
              warna={W.tinta}
              teks={W.kapur}
              nomor="12"
              judul="Pemilik"
              isi="Bu Wening. Denah kamar, status bayar, pemasukan, iklan."
              ikon="kanan"
            />
          </View>
        </View>

        <View style={{ marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: W.garis, backgroundColor: W.kertas, overflow: 'hidden' }}>
          <Tegel tinggi={8} ubin={16} warna="bata" />
          <View style={{ padding: 14, gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Ikon nama="info" ukuran={20} warna={W.bata} />
              <T v="kecil" style={{ flex: 1 }}>
                Tanggal tagihan dan laporan mengikuti hari ini (WIB). Pembayaran hanya simulasi, dan semua isianmu disimpan di perangkat ini saja.
              </T>
            </View>
            <Tombol
              jenis="teks"
              ukuran="kecil"
              ikon="ulang"
              label="Atur ulang data demo"
              onPress={() => {
                aturUlang();
                kabar('Data demo kembali seperti semula.');
              }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
