import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TokoProvider } from '../lib/toko';
import { useFontKos } from '../lib/font';
import { Lapisan } from '../ui/lapisan';
import { W } from '../lib/tema';

// Slot (bukan Stack/Tabs) supaya bundel web kecil; Slot tetap memakai riwayat bertumpuk,
// jadi tombol kembali Android berjalan normal.
export default function Akar() {
  const siap = useFontKos();
  if (!siap) return null;
  return (
    <TokoProvider>
      <View style={{ flex: 1, backgroundColor: W.kapur }}>
        <Lapisan>
          <Slot />
        </Lapisan>
      </View>
      <StatusBar style="dark" />
    </TokoProvider>
  );
}
