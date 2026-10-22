import { View, ScrollView } from 'react-native';
import { W } from '../lib/tema';
import { meta } from '../lib/meta';
import { T, Judul, Tombol } from '../ui/dasar';
import { Gantungan, Tegel } from '../ui/motif';

export function generateMetadata() {
  return meta({ judul: 'Halaman tidak ditemukan · Grendel', deskripsi: 'Alamat ini tidak ada di aplikasi kos Grendel.', path: '/404', noindex: true });
}

export default function TidakAda() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: W.kapur }} contentContainerStyle={{ flexGrow: 1 }}>
      <View role="main" style={{ flex: 1 }}>
        <Tegel tinggi={56} ubin={28} warna="gelap" />
        <View style={{ flex: 1, padding: 24, gap: 14, alignItems: 'flex-start', justifyContent: 'center' }}>
          <View style={{ transform: [{ rotate: '-8deg' }], alignSelf: 'center', marginBottom: 6 }}>
            <Gantungan nomor="404" warna={W.tinta} teks={W.kunyit} keterangan="kunci salah" />
          </View>
          <T v="label">Galat 404</T>
          <Judul>Kuncinya tidak cocok dengan pintu mana pun.</Judul>
          <T warna={W.abu}>Halaman yang kamu cari tidak ada atau sudah pindah. Coba mulai lagi dari depan.</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
            <Tombol href="/" label="Ke halaman depan" ikon="rumah" />
            <Tombol href="/penghuni" jenis="garis" label="Beranda penghuni" />
          </View>
        </View>
        <Tegel tinggi={28} ubin={28} warna="lembut" />
      </View>
    </ScrollView>
  );
}
