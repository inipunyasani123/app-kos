import { useId } from 'react';
import { View, Text } from 'react-native';
import { Svg, Path, Rect, Circle, Ellipse, G, Defs, Pattern, Polygon } from './svg';
import { W, F, ANGKA } from '../lib/tema';

const bersihId = (s) => s.replace(/[^a-zA-Z0-9_-]/g, '');

const PALET_TEGEL = {
  bata: { dasar: W.kapur, sudut: W.bata, kelopak: W.tinta, permata: W.kunyit, inti: W.bata },
  gelap: { dasar: W.tinta, sudut: W.bata, kelopak: W.kapur, permata: W.kunyit, inti: W.bata },
  lembut: { dasar: W.kapur, sudut: '#E6D3BC', kelopak: '#E1D2BF', permata: '#EEDDB8', inti: '#E6D3BC' },
  hijau: { dasar: W.hijauMuda, sudut: W.hijau, kelopak: W.kertas, permata: W.kunyit, inti: W.hijau },
};

/** Satu ubin "tegel kunci" 40x40: lingkaran seperempat di sudut, kembang empat kelopak di tengah. */
export function UbinIsi({ p }) {
  const kelopak = 'M20 7.5C23.6 12.4 23.6 15.8 20 20 16.4 15.8 16.4 12.4 20 7.5z';
  return (
    <G>
      <Rect x="0" y="0" width="40" height="40" fill={p.dasar} />
      {[[0, 0], [40, 0], [0, 40], [40, 40]].map(([x, y]) => (
        <G key={`${x}-${y}`}>
          <Circle cx={x} cy={y} r="11" fill={p.sudut} />
          <Circle cx={x} cy={y} r="5.5" fill={p.dasar} />
        </G>
      ))}
      {[0, 90, 180, 270].map((r) => (
        <Path key={r} d={kelopak} fill={p.kelopak} transform={`rotate(${r} 20 20)`} />
      ))}
      <Circle cx="20" cy="20" r="2.6" fill={p.permata} />
      {[[20, 0], [0, 20], [40, 20], [20, 40]].map(([x, y]) => (
        <Polygon key={`d${x}${y}`} points={`${x},${y - 4} ${x + 4},${y} ${x},${y + 4} ${x - 4},${y}`} fill={p.permata} />
      ))}
    </G>
  );
}

/** Bidang bermotif tegel. Lebar/tinggi dalam piksel; `ubin` = ukuran satu tegel. */
export function Tegel({ lebar = '100%', tinggi = 40, ubin = 40, warna = 'bata', style }) {
  const id = `tg${bersihId(useId())}`;
  const p = PALET_TEGEL[warna];
  return (
    <View style={[{ height: tinggi, width: lebar, overflow: 'hidden' }, style]} aria-hidden>
      <Svg width="100%" height={tinggi}>
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width={ubin} height={ubin}>
            <G transform={`scale(${ubin / 40})`}>
              <UbinIsi p={p} />
            </G>
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/** Gantungan kunci kamar: badan plastik dengan lubang dan ring logam. */
export function Gantungan({ nomor, warna = W.bata, teks = W.kapur, kecil = false, keterangan }) {
  const lebar = kecil ? 64 : 92;
  const tinggi = kecil ? 92 : 132;
  return (
    <View style={{ width: lebar + 6, height: tinggi + 22, alignItems: 'center' }} aria-hidden>
      <View style={{ position: 'absolute', top: 0 }}>
        <Svg width={kecil ? 30 : 40} height={kecil ? 30 : 40} viewBox="0 0 40 40">
          <Circle cx="20" cy="20" r="15" fill="none" stroke="#8E8778" strokeWidth="4" />
          <Circle cx="20" cy="20" r="15" fill="none" stroke="#D9D3C6" strokeWidth="1.4" strokeDasharray="20 74" />
        </Svg>
      </View>
      <View
        style={{
          marginTop: kecil ? 18 : 24,
          width: lebar,
          height: tinggi,
          borderRadius: kecil ? 14 : 20,
          borderTopLeftRadius: lebar / 2,
          borderTopRightRadius: lebar / 2,
          backgroundColor: warna,
          alignItems: 'center',
          paddingTop: kecil ? 10 : 14,
          boxShadow: 'inset 0 -6px 0 rgba(0,0,0,0.12), 0 6px 14px -8px rgba(34,28,23,0.6)',
        }}
      >
        <View style={{ width: kecil ? 12 : 16, height: kecil ? 12 : 16, borderRadius: 10, backgroundColor: W.kapur, borderWidth: 2, borderColor: 'rgba(0,0,0,0.18)' }} />
        <Text style={[F.pekat, { color: teks, fontSize: kecil ? 8 : 10, letterSpacing: 2, marginTop: kecil ? 8 : 12 }]}>KAMAR</Text>
        <Text style={[F.judul, ANGKA, { color: teks, fontSize: kecil ? 30 : 44, lineHeight: kecil ? 36 : 52 }]}>{nomor}</Text>
        {keterangan ? <Text style={[F.sedang, { color: teks, fontSize: 10, opacity: 0.9 }]}>{keterangan}</Text> : null}
      </View>
    </View>
  );
}

/** Pelat nomor enamel bergaya lama (garis dalam ganda). */
export function Pelat({ nomor, latar = W.tinta, teks = W.kapur, ukuran = 44, garis }) {
  return (
    <View
      style={{
        minWidth: ukuran,
        height: ukuran * 0.78,
        borderRadius: 8,
        backgroundColor: latar,
        padding: 3,
      }}
      aria-hidden
    >
      <View style={{ flex: 1, borderRadius: 5, borderWidth: 1.2, borderColor: garis || teks, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
        <Text style={[F.judul, ANGKA, { color: teks, fontSize: ukuran * 0.42, lineHeight: ukuran * 0.5 }]}>{nomor}</Text>
      </View>
    </View>
  );
}

/** Stempel tinta "LUNAS" yang miring. */
export function Stempel({ teks = 'LUNAS', warna = W.hijau, kecil = false, tanggal }) {
  return (
    <View style={{ transform: [{ rotate: '-11deg' }], alignSelf: 'flex-start' }} aria-hidden>
      <View style={{ borderWidth: kecil ? 2 : 3, borderColor: warna, borderRadius: 8, padding: 2, opacity: 0.92 }}>
        <View style={{ borderWidth: 1, borderColor: warna, borderRadius: 5, paddingHorizontal: kecil ? 8 : 14, paddingVertical: kecil ? 2 : 4, alignItems: 'center' }}>
          <Text style={[F.judul, { color: warna, fontSize: kecil ? 14 : 24, letterSpacing: kecil ? 2 : 4 }]}>{teks}</Text>
          {tanggal ? <Text style={[F.tebal, ANGKA, { color: warna, fontSize: 9, letterSpacing: 1 }]}>{tanggal}</Text> : null}
        </View>
      </View>
    </View>
  );
}

/** Tepi kertas bergerigi untuk kuitansi. */
export function Gerigi({ warna = W.kertas, latar = W.kapur, bawah = false }) {
  const id = `gr${bersihId(useId())}`;
  return (
    <View style={{ height: 8, backgroundColor: latar, transform: bawah ? [{ scaleY: -1 }] : undefined }} aria-hidden>
      <Svg width="100%" height={8}>
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width="12" height="8">
            <Path d="M0 8 6 1l6 7z" fill={warna} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width="100%" height="8" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const KULIT = ['#F2D3B3', '#DDAE86', '#BA845C', '#8C5B3C'];
const RAMBUT = '#2B211B';

/** Ilustrasi orang TANPA wajah: kepala polos, rambut/kerudung, baju. */
export function Sosok({ av, ukuran = 44 }) {
  const kulit = KULIT[av.kulit ?? 1];
  const kepala = <Ellipse cx="32" cy="26" rx="10.5" ry="12" fill={kulit} />;
  let belakang = null;
  let depan = null;
  if (av.rambut === 'panjang') {
    belakang = <Path d="M19.5 27c-1.6-12.5 4.6-17 12.5-17s14.1 4.5 12.5 17l1.6 17c-5.6 2.5-22.6 2.5-28.2 0z" fill={RAMBUT} />;
    depan = <Path d="M21.5 25c0-8 4.6-11.6 10.5-11.6S42.5 17 42.5 25c-3.6-4.8-6.6-6.8-11.4-6.4-4.2.3-7 2.4-9.6 6.4z" fill={RAMBUT} />;
  } else if (av.rambut === 'pendek') {
    depan = <Path d="M21.4 25c-1.2-9.4 4-13.6 10.6-13.6 7.4 0 11.8 4.4 10.6 13.6-1.6-4.6-4.8-6.8-10.6-6.8s-9 2.2-10.6 6.8z" fill={RAMBUT} />;
  } else if (av.rambut === 'ikal') {
    depan = (
      <G fill={RAMBUT}>
        {[[23, 19, 5], [28, 15, 5.5], [34, 14.5, 5.5], [40, 18, 5], [42, 23.5, 3.6], [21.5, 24, 3.6]].map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} />
        ))}
      </G>
    );
  } else if (av.rambut === 'cepol') {
    depan = (
      <G fill={RAMBUT}>
        <Circle cx="32" cy="10.5" r="6" />
        <Path d="M21.5 25.5c-.8-8.8 4-12.8 10.5-12.8s11.3 4 10.5 12.8c-2.6-4.4-5.6-6.4-10.5-6.4s-7.9 2-10.5 6.4z" />
      </G>
    );
  } else if (av.rambut === 'topi') {
    depan = (
      <G>
        <Path d="M21 22.5c0-7.6 4.8-11.4 11-11.4s11 3.8 11 11.4z" fill={av.topi || W.tinta} />
        <Rect x="30" y="20.6" width="18" height="3.6" rx="1.8" fill={av.topi || W.tinta} />
      </G>
    );
  }
  const kerudung = av.rambut === 'kerudung';
  return (
    <View style={{ width: ukuran, height: ukuran, borderRadius: ukuran / 2, overflow: 'hidden', backgroundColor: av.latar || W.kunyitMuda }} aria-hidden>
      <Svg width={ukuran} height={ukuran} viewBox="0 0 64 64">
        {belakang}
        <Rect x="28" y="34" width="8" height="9" fill={kulit} />
        <Path d="M9 66c0-15.5 10.4-23.5 23-23.5S55 50.5 55 66z" fill={av.baju} />
        {kerudung ? (
          <G>
            <Path d="M19.6 30c-.9-12.4 4.9-18.6 12.4-18.6S45.3 17.6 44.4 30c-.3 4 3.6 8.2 8.6 13.2-6.2 5.8-35.8 5.8-42 0 5-5 8.9-9.2 8.6-13.2z" fill={av.kerudung || W.kunyit} />
            <Ellipse cx="32" cy="27.5" rx="8" ry="9.6" fill={kulit} />
          </G>
        ) : (
          <G>
            {kepala}
            {depan}
          </G>
        )}
      </Svg>
    </View>
  );
}

/** Cincin persentase (okupansi). */
export function Cincin({ nilai, ukuran = 104, tebal = 12, warna = W.bata, jalur = W.bataMuda, children, label }) {
  const r = (ukuran - tebal) / 2;
  const kel = 2 * Math.PI * r;
  return (
    <View style={{ width: ukuran, height: ukuran, alignItems: 'center', justifyContent: 'center' }} role={label ? 'img' : undefined} aria-label={label}>
      <View style={{ position: 'absolute', top: 0, left: 0 }}>
        <Svg width={ukuran} height={ukuran} viewBox={`0 0 ${ukuran} ${ukuran}`}>
          <Circle cx={ukuran / 2} cy={ukuran / 2} r={r} fill="none" stroke={jalur} strokeWidth={tebal} />
          <Circle
            cx={ukuran / 2}
            cy={ukuran / 2}
            r={r}
            fill="none"
            stroke={warna}
            strokeWidth={tebal}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0.01, nilai) * kel} ${kel}`}
            transform={`rotate(-90 ${ukuran / 2} ${ukuran / 2})`}
          />
        </Svg>
      </View>
      {children}
    </View>
  );
}

/** QR simulasi (bukan kode pembayaran sungguhan): pola acak tetap + tiga penanda sudut. */
export function QrSimulasi({ ukuran = 200, benih = 7 }) {
  const n = 25;
  const s = ukuran / n;
  let x = benih * 9301 + 49297;
  const acak = () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
  const kotak = [];
  const diPenanda = (i, j) => (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (!diPenanda(i, j) && acak() > 0.52) kotak.push(`M${i * s} ${j * s}h${s}v${s}h-${s}z`);
  const penanda = (ox, oy) => (
    <G key={`${ox}${oy}`}>
      <Rect x={ox * s} y={oy * s} width={7 * s} height={7 * s} fill={W.tinta} />
      <Rect x={(ox + 1) * s} y={(oy + 1) * s} width={5 * s} height={5 * s} fill={W.putih} />
      <Rect x={(ox + 2) * s} y={(oy + 2) * s} width={3 * s} height={3 * s} fill={W.tinta} />
    </G>
  );
  return (
    <Svg width={ukuran} height={ukuran} viewBox={`0 0 ${ukuran} ${ukuran}`} label="Kode QR simulasi, tidak bisa dipakai membayar">
      <Rect x="0" y="0" width={ukuran} height={ukuran} fill={W.putih} />
      <Path d={kotak.join('')} fill={W.tinta} />
      {penanda(0, 0)}
      {penanda(n - 7, 0)}
      {penanda(0, n - 7)}
    </Svg>
  );
}

