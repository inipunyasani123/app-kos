import { View, Text, Pressable } from 'react-native';
import { usePathname } from 'expo-router';
import { Tautan } from './Tautan';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { W, F } from '../lib/tema';
import { Ikon, Logo } from './Ikon';
import { Tegel, Sosok } from './motif';

/** Bilah atas: identitas pengguna + tombol ganti mode, diakhiri jalur tegel tipis. */
export function BilahAtas({ nama, peran, av }) {
  const insets = useSafeAreaInsets();
  return (
    <View role="banner" style={{ backgroundColor: W.kapur, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 }}>
        {av ? <Sosok av={av} ukuran={40} /> : <Logo ukuran={40} />}
        <View style={{ flex: 1 }}>
          <Text style={[F.tebal, { fontSize: 15, lineHeight: 20, color: W.tinta }]} numberOfLines={1}>
            {nama}
          </Text>
          <Text style={[F.teks, { fontSize: 12.5, lineHeight: 17, color: W.abu }]} numberOfLines={1}>
            {peran}
          </Text>
        </View>
        <Tautan
          href="/"
          aria-label="Ganti mode: kembali ke pilihan penghuni atau pemilik"
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1.5, borderColor: W.garisTua, opacity: pressed ? 0.8 : 1 })}
        >
          <Ikon nama="tukar" ukuran={16} />
          <Text style={[F.tebal, { fontSize: 13, color: W.tinta }]}>Ganti mode</Text>
        </Tautan>
      </View>
      <Tegel tinggi={10} ubin={20} />
    </View>
  );
}

/** Bilah tab bawah. `cocok` menentukan tab aktif untuk sub-halaman (mis. /penghuni/bayar → Tagihan). */
export function BilahTab({ label, item }) {
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const aktifIdx = item.reduce((best, it, i) => {
    const hit = it.cocok.some((c) => (c.endsWith('*') ? path.startsWith(c.slice(0, -1)) : path === c));
    return hit ? i : best;
  }, 0);
  return (
    <View
      role="navigation"
      aria-label={label}
      style={{ flexDirection: 'row', backgroundColor: W.tinta, paddingBottom: Math.max(insets.bottom, 6), paddingTop: 6, paddingHorizontal: 6 }}
    >
      {item.map((it, i) => {
        const aktif = i === aktifIdx;
        return (
          <Tautan
              key={it.href}
              href={it.href}
              aria-current={aktif ? 'page' : undefined}
              aria-label={it.jumlah ? `${it.label}, ${it.jumlah} perlu dilihat` : undefined}
              style={({ pressed }) => ({ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 54, marginHorizontal: 1, borderRadius: 14, opacity: pressed ? 0.8 : 1, gap: 3 })}
            >
              <View style={{ width: 46, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: aktif ? W.kunyit : 'transparent' }}>
                <Ikon nama={it.ikon} ukuran={20} warna={aktif ? W.tinta : W.kapur} tebal={aktif ? 2.1 : 1.8} />
              </View>
              <Text style={[aktif ? F.pekat : F.sedang, { fontSize: 11, lineHeight: 14, color: aktif ? W.kunyit : '#E8DFD1' }]} numberOfLines={1}>
                {it.label}
              </Text>
              {it.jumlah ? (
                <View aria-hidden style={{ position: 'absolute', top: 2, right: '22%', minWidth: 18, height: 18, borderRadius: 9, backgroundColor: W.bata, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: W.tinta }}>
                  <Text style={[F.pekat, { fontSize: 10, color: W.putih }]}>{it.jumlah}</Text>
                </View>
              ) : null}
          </Tautan>
        );
      })}
    </View>
  );
}
