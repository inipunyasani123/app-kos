import { View } from 'react-native';
import { Slot } from 'expo-router';
import { useToko } from '../../lib/toko';
import { PENGELOLA, KOS } from '../../lib/data';
import { BilahAtas, BilahTab } from '../../ui/bilah';

const WENING = PENGELOLA[1];

export default function LayoutPemilik() {
  const { data } = useToko();
  const telat = data ? data.penghuni.filter((p) => p.tagihan.status === 'telat').length : 0;
  const baru = data ? data.tiket.filter((t) => t.status === 'baru').length : 0;
  return (
    <View style={{ flex: 1 }}>
      <BilahAtas nama={`${WENING.nama} · Pemilik`} peran={`12 kamar · ${KOS.wilayah.split(',')[0]}`} av={WENING.av} keMode="penghuni" />
      <View role="main" style={{ flex: 1 }}>
        <Slot />
      </View>
      <BilahTab
        label="Menu pemilik"
        item={[
          { href: '/pemilik', label: 'Ringkas', ikon: 'grafik', cocok: ['/pemilik'] },
          { href: '/pemilik/kamar', label: 'Kamar', ikon: 'denah', cocok: ['/pemilik/kamar'] },
          { href: '/pemilik/tagihan', label: 'Bayar', ikon: 'dompet', cocok: ['/pemilik/tagihan'], jumlah: telat },
          { href: '/pemilik/tiket', label: 'Tiket', ikon: 'obeng', cocok: ['/pemilik/tiket'], jumlah: baru },
          { href: '/pemilik/iklan', label: 'Iklan', ikon: 'papan', cocok: ['/pemilik/iklan'] },
        ]}
      />
    </View>
  );
}
