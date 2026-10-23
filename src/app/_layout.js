import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { JUDUL } from '../lib/judul';
import { TokoProvider } from '../lib/toko';
import { useFontKos } from '../lib/font';
import { Lapisan } from '../ui/lapisan';
import { W } from '../lib/tema';

/** Web: judul tab ikut berganti saat pindah halaman di dalam aplikasi (HTML statis sudah benar sejak awal). */
function JudulTab() {
  const path = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const judul = JUDUL[path] ?? JUDUL['/404'];
    if (document.title !== judul) document.title = judul;
  }, [path]);
  return null;
}

// Slot (bukan Stack/Tabs) supaya bundel web kecil; Slot tetap memakai riwayat bertumpuk,
// jadi tombol kembali Android berjalan normal.
export default function Akar() {
  const siap = useFontKos();
  if (!siap) return null;
  return (
    <TokoProvider>
      <JudulTab />
      <View style={{ flex: 1, backgroundColor: W.kapur }}>
        <Lapisan>
          <Slot />
        </Lapisan>
      </View>
      <StatusBar style="dark" />
    </TokoProvider>
  );
}
