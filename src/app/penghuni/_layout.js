import { View } from 'react-native';
import { Slot } from 'expo-router';
import { useToko } from '../../lib/toko';
import { PENGHUNI, KOS } from '../../lib/data';
import { BilahAtas, BilahTab } from '../../ui/bilah';

const LARAS = PENGHUNI.find((p) => p.demo);

export default function LayoutPenghuni() {
  const { data } = useToko();
  const tiketAktif = data ? data.tiket.filter((t) => t.kamar === LARAS.kamar && t.status !== 'selesai').length : 0;
  const tagihan = data && data.demo.tagihan.status !== 'lunas' ? 1 : 0;
  return (
    <View style={{ flex: 1 }}>
      <BilahAtas nama={`Halo, ${LARAS.panggil}`} peran={`Kamar ${LARAS.kamar} · ${KOS.nama}`} av={LARAS.av} />
      <View role="main" style={{ flex: 1 }}>
        <Slot />
      </View>
      <BilahTab
        label="Menu penghuni"
        item={[
          { href: '/penghuni', label: 'Beranda', ikon: 'rumah', cocok: ['/penghuni'] },
          { href: '/penghuni/tagihan', label: 'Tagihan', ikon: 'nota', cocok: ['/penghuni/tagihan', '/penghuni/bayar', '/penghuni/riwayat'], jumlah: tagihan },
          { href: '/penghuni/lapor', label: 'Lapor', ikon: 'obeng', cocok: ['/penghuni/lapor'], jumlah: tiketAktif },
          { href: '/penghuni/info', label: 'Info', ikon: 'toa', cocok: ['/penghuni/info'] },
          { href: '/penghuni/sewa', label: 'Sewa', ikon: 'kunci', cocok: ['/penghuni/sewa'] },
        ]}
      />
    </View>
  );
}
