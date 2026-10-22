import { forwardRef } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Tautan } from './Tautan';
import { W, F, R, BAYANGAN } from '../lib/tema';
import { Ikon } from './Ikon';

const VARIAN = StyleSheet.create({
  teks: { ...F.teks, fontSize: 15, lineHeight: 22, color: W.tinta },
  kecil: { ...F.teks, fontSize: 13, lineHeight: 19, color: W.abu },
  mini: { ...F.sedang, fontSize: 12, lineHeight: 16, color: W.abu },
  label: { ...F.pekat, fontSize: 11, lineHeight: 14, letterSpacing: 1.4, color: W.abu, textTransform: 'uppercase' },
  h1: { ...F.judul, fontSize: 28, lineHeight: 34, color: W.tinta },
  h2: { ...F.judul, fontSize: 20, lineHeight: 26, color: W.tinta },
  h3: { ...F.tebal, fontSize: 16, lineHeight: 22, color: W.tinta },
  kuat: { ...F.tebal, fontSize: 15, lineHeight: 22, color: W.tinta },
  angka: { ...F.judul, fontSize: 34, lineHeight: 40, color: W.tinta, fontVariant: ['tabular-nums'] },
});

export const T = forwardRef(function T({ v = 'teks', warna, style, children, ...p }, ref) {
  return (
    <Text ref={ref} style={[VARIAN[v], warna ? { color: warna } : null, style]} {...p}>
      {children}
    </Text>
  );
});

/** Judul halaman (h1). */
export function Judul({ children, style, warna }) {
  return (
    <T v="h1" role="heading" aria-level={1} style={style} warna={warna}>
      {children}
    </T>
  );
}
export function Sub({ children, style, level = 2, v = 'h2', warna }) {
  return (
    <T v={v} role="heading" aria-level={level} style={style} warna={warna}>
      {children}
    </T>
  );
}

const JENIS = {
  utama: { bg: W.bata, fg: W.putih, garis: W.bata },
  gelap: { bg: W.tinta, fg: W.kapur, garis: W.tinta },
  hijau: { bg: W.hijau, fg: W.putih, garis: W.hijau },
  garis: { bg: 'transparent', fg: W.tinta, garis: W.garisTua },
  lembut: { bg: W.bataMuda, fg: W.bataTua, garis: W.bataMuda },
  terang: { bg: W.kertas, fg: W.tinta, garis: W.kertas },
  teks: { bg: 'transparent', fg: W.bata, garis: 'transparent' },
  kunyit: { bg: W.kunyit, fg: W.tinta, garis: W.kunyit },
  garisTerang: { bg: 'transparent', fg: W.kapur, garis: '#8C8173' },
  bahaya: { bg: 'transparent', fg: W.bataTua, garis: W.bata },
};
const UKURAN = { besar: { h: 52, f: 16, px: 20 }, sedang: { h: 44, f: 15, px: 16 }, kecil: { h: 36, f: 13.5, px: 12 } };

/** Tombol. Dengan `href` menjadi tautan (<a> di web). */
export function Tombol({ label, onPress, href, jenis = 'utama', ukuran = 'sedang', ikon, ikonKanan, disabled, aksesLabel, penuh, style, replace }) {
  const j = JENIS[jenis];
  const u = UKURAN[ukuran];
  const isi = ({ pressed, hovered }) => [
    {
      minHeight: u.h,
      paddingHorizontal: jenis === 'teks' ? 4 : u.px,
      borderRadius: 999,
      backgroundColor: j.bg,
      borderWidth: 1.5,
      borderColor: j.garis,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      alignSelf: penuh ? 'stretch' : 'flex-start',
      opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
      transform: pressed ? [{ scale: 0.98 }] : undefined,
    },
    hovered && !disabled && jenis !== 'teks' ? { boxShadow: BAYANGAN } : null,
    style,
  ];
  const anak = (
    <>
      {ikon ? <Ikon nama={ikon} ukuran={u.f + 4} warna={j.fg} /> : null}
      <Text style={[F.tebal, { color: j.fg, fontSize: u.f }]} numberOfLines={1}>
        {label}
      </Text>
      {ikonKanan ? <Ikon nama={ikonKanan} ukuran={u.f + 2} warna={j.fg} /> : null}
    </>
  );
  if (href) {
    return (
      <Tautan href={href} style={isi} aria-label={aksesLabel}>
        {anak}
      </Tautan>
    );
  }
  return (
    <Pressable role="button" onPress={onPress} disabled={disabled} aria-disabled={disabled || undefined} aria-label={aksesLabel} style={isi}>
      {anak}
    </Pressable>
  );
}

/** Tautan baris/ubin yang seluruh permukaannya bisa ditekan. */
export function Ketuk({ href, onPress, children, style, aksesLabel, role }) {
  const gaya = ({ pressed, hovered }) => [style, hovered ? { boxShadow: BAYANGAN } : null, pressed ? { opacity: 0.85 } : null];
  if (href)
    return (
      <Tautan href={href} style={gaya} aria-label={aksesLabel}>
        {children}
      </Tautan>
    );
  return (
    <Pressable role={role || 'button'} onPress={onPress} style={gaya} aria-label={aksesLabel}>
      {children}
    </Pressable>
  );
}

export function Kartu({ children, style, latar = W.kertas, ...p }) {
  return (
    <View style={[{ backgroundColor: latar, borderRadius: R.besar, borderWidth: 1, borderColor: W.garis, padding: 16 }, style]} {...p}>
      {children}
    </View>
  );
}

/** Pilihan tunggal/ganda bergaya chip. */
export function Chip({ label, aktif, onPress, ikon, peran = 'radio', kecil }) {
  return (
    <Pressable
      role={peran}
      aria-checked={aktif}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: kecil ? 32 : 38,
        paddingHorizontal: kecil ? 11 : 14,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: aktif ? W.tinta : W.garisTua,
        backgroundColor: aktif ? W.tinta : W.kertas,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {ikon ? <Ikon nama={ikon} ukuran={16} warna={aktif ? W.kapur : W.tinta} /> : null}
      <Text style={[F.sedang, { fontSize: kecil ? 13 : 14, color: aktif ? W.kapur : W.tinta }]}>{label}</Text>
    </Pressable>
  );
}

export function GrupChip({ label, children, style }) {
  return (
    <View role="radiogroup" aria-label={label} style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, style]}>
      {children}
    </View>
  );
}

const WARNA_LENCANA = {
  hijau: [W.hijauMuda, W.hijau],
  bata: [W.bataMuda, W.bataTua],
  kunyit: [W.kunyitMuda, W.coklat],
  biru: [W.biruMuda, W.biru],
  abu: ['#EAE0D0', W.abu],
  gelap: [W.tinta, W.kapur],
};
export function Lencana({ teks, warna = 'abu', ikon }) {
  const [bg, fg] = WARNA_LENCANA[warna];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: bg, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
      {ikon ? <Ikon nama={ikon} ukuran={13} warna={fg} tebal={2.2} /> : null}
      <Text style={[F.tebal, { fontSize: 12, lineHeight: 16, color: fg }]}>{teks}</Text>
    </View>
  );
}

export function Kerangka({ tinggi = 80, lebar = '100%', radius = R.besar, style }) {
  return <View style={[{ height: tinggi, width: lebar, borderRadius: radius, backgroundColor: '#E9DFCF' }, style]} aria-hidden />;
}

export function Garis({ style }) {
  return <View style={[{ height: 1, backgroundColor: W.garis }, style]} />;
}

export function BarisInfo({ label, nilai, kuat, warna, style }) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6 }, style]}>
      <T v="kecil" style={{ flex: 1 }}>{label}</T>
      <T v={kuat ? 'kuat' : 'teks'} warna={warna} style={{ textAlign: 'right', fontVariant: ['tabular-nums'] }}>{nilai}</T>
    </View>
  );
}

/** Kerangka layar: gulir, judul, tombol kembali opsional. */
export function Layar({ children, judul, sub, kembali, kembaliLabel = 'Kembali', kanan, kontenStyle, latar = W.kapur, fokus }) {
  // `fokus`: layar tanpa tombol/tautan tetap bisa digulir dengan papan ketik (tabIndex 0).
  return (
    <ScrollView tabIndex={fokus ? 0 : undefined} role={fokus ? 'region' : undefined} aria-label={fokus ? judul : undefined} style={{ flex: 1, backgroundColor: latar }} contentContainerStyle={[{ padding: 16, paddingBottom: 32, gap: 14 }, kontenStyle]} keyboardShouldPersistTaps="handled">
      {kembali ? (
        <Tautan href={kembali} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', minHeight: 32, paddingRight: 8 }}>
          <Ikon nama="kiri" ukuran={18} warna={W.bata} tebal={2.2} />
          <T v="kuat" warna={W.bata}>{kembaliLabel}</T>
        </Tautan>
      ) : null}
      {judul ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Judul>{judul}</Judul>
            {sub ? <T v="kecil">{sub}</T> : null}
          </View>
          {kanan}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

export { Foto } from './Foto';

export const web = Platform.OS === 'web';
