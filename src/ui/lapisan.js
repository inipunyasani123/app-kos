import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, ScrollView, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { W, F, BAYANGAN } from '../lib/tema';
import { Ikon } from './Ikon';

// Lembar bawah (bottom sheet) dan kabar singkat (toast) dirender DI DALAM akar aplikasi, bukan portal ke
// <body>, supaya di web tetap berada di dalam bingkai ponsel.
const LembarCtx = createContext(null);
const KabarCtx = createContext(null);

export function useLembar() {
  return useContext(LembarCtx);
}
export function useKabar() {
  return useContext(KabarCtx);
}

export function Lapisan({ children }) {
  const [lembar, setLembar] = useState(null);
  const [kabar, setKabar] = useState(null);
  const pemicu = useRef(null);
  const judulRef = useRef(null);
  const tKabar = useRef(null);
  const insets = useSafeAreaInsets();

  const buka = useCallback((l) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') pemicu.current = document.activeElement;
    setLembar(l);
  }, []);
  const tutup = useCallback(() => {
    setLembar(null);
    if (Platform.OS === 'web') setTimeout(() => pemicu.current?.focus?.(), 0);
  }, []);
  const tampil = useCallback((teks) => {
    clearTimeout(tKabar.current);
    setKabar({ teks, k: Date.now() });
    tKabar.current = setTimeout(() => setKabar(null), 3200);
  }, []);

  useEffect(() => () => clearTimeout(tKabar.current), []);

  // Web: Escape menutup lembar, fokus pindah ke judul lembar saat dibuka.
  useEffect(() => {
    if (!lembar || Platform.OS !== 'web') return undefined;
    const t = setTimeout(() => judulRef.current?.focus?.(), 30);
    const tekan = (e) => {
      if (e.key === 'Escape') tutup();
    };
    document.addEventListener('keydown', tekan);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', tekan);
    };
  }, [lembar, tutup]);

  const nilaiLembar = useMemo(() => ({ buka, tutup }), [buka, tutup]);

  return (
    <LembarCtx.Provider value={nilaiLembar}>
      <KabarCtx.Provider value={tampil}>
        <View style={{ flex: 1 }} inert={lembar ? true : undefined} aria-hidden={lembar ? true : undefined}>
          {children}
        </View>
        {lembar ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
            <Pressable
              onPress={tutup}
              aria-label="Tutup"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(34,28,23,0.5)' }}
              tabIndex={-1}
            />
            <View
              role="dialog"
              aria-modal
              aria-label={lembar.judul}
              style={{ maxHeight: '88%', backgroundColor: W.kapur, borderTopLeftRadius: 26, borderTopRightRadius: 26, boxShadow: BAYANGAN, paddingBottom: insets.bottom }}
            >
              <View style={{ alignItems: 'center', paddingTop: 8 }}>
                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: W.garisTua }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, gap: 12 }}>
                <Text ref={judulRef} tabIndex={-1} role="heading" aria-level={2} style={[F.judul, { flex: 1, fontSize: 20, lineHeight: 26, color: W.tinta }]}>
                  {lembar.judul}
                </Text>
                <Pressable
                  role="button"
                  aria-label="Tutup"
                  onPress={tutup}
                  style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: W.kertas, borderWidth: 1, borderColor: W.garis }}
                >
                  <Ikon nama="silang" ukuran={18} />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 14 }} keyboardShouldPersistTaps="handled">
                {lembar.isi}
              </ScrollView>
            </View>
          </View>
        ) : null}
        <View
          role="status"
          aria-live="polite"
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, right: 16, bottom: 92 + insets.bottom, alignItems: 'center' }}
        >
          {kabar ? (
            <View key={kabar.k} style={{ backgroundColor: W.tinta, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', gap: 10, alignItems: 'center', boxShadow: BAYANGAN, maxWidth: 360 }}>
              <Ikon nama="centang" ukuran={18} warna={W.kunyit} tebal={2.4} />
              <Text style={[F.sedang, { color: W.kapur, fontSize: 14, lineHeight: 20, flexShrink: 1 }]}>{kabar.teks}</Text>
            </View>
          ) : null}
        </View>
      </KabarCtx.Provider>
    </LembarCtx.Provider>
  );
}
