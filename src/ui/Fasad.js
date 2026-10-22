import { View, Text } from 'react-native';
import { Svg, Path, Rect, Circle, G, Defs, Pattern, Line } from './svg';
import { UbinIsi } from './motif';
import { W, F } from '../lib/tema';
import { useId } from 'react';

const DINDING = '#EEE2CE';
const KUSEN = '#3A2E25';

function Krepyak({ x, y, w = 46, h = 40 }) {
  const bilah = [];
  for (let i = 1; i < 7; i++) bilah.push(<Line key={i} x1={x + 3} y1={y + (h / 7) * i} x2={x + w / 2 - 2} y2={y + (h / 7) * i} stroke={W.hijauMuda} strokeWidth="1.2" />);
  const bilah2 = bilah.map((b, i) => <Line key={`b${i}`} x1={x + w / 2 + 2} y1={y + (h / 7) * (i + 1)} x2={x + w - 3} y2={y + (h / 7) * (i + 1)} stroke={W.hijauMuda} strokeWidth="1.2" />);
  return (
    <G>
      <Rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} fill={KUSEN} rx="2" />
      <Rect x={x} y={y} width={w / 2 - 1} height={h} fill={W.hijau} />
      <Rect x={x + w / 2 + 1} y={y} width={w / 2 - 1} height={h} fill={W.hijau} />
      {bilah}
      {bilah2}
      <Path d={`M${x - 6} ${y - 6} h${w + 12} l-4 -6 h${-(w + 4)} z`} fill={W.bata} />
    </G>
  );
}

/** Tampak depan Kos Ubin Kembang (ilustrasi buatan sendiri). */
export function Fasad() {
  const id = `fs${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <View style={{ width: '100%', aspectRatio: 360 / 230 }} aria-hidden>
      <Svg width="100%" height="100%" viewBox="0 0 360 230">
        <Defs>
          <Pattern id={id} patternUnits="userSpaceOnUse" width="16" height="16">
            <G transform="scale(0.4)">
              <UbinIsi p={{ dasar: W.kapur, sudut: W.bata, kelopak: W.tinta, permata: W.kunyit }} />
            </G>
          </Pattern>
        </Defs>
        {/* atap genteng */}
        <Path d="M30 58 64 24h232l34 34z" fill={W.bata} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Line key={i} x1={40 + i * 4} y1={52 - i * 6.5} x2={320 - i * 4} y2={52 - i * 6.5} stroke={W.bataTua} strokeWidth="1.4" opacity="0.6" />
        ))}
        <Rect x="26" y="56" width="308" height="7" fill={KUSEN} />
        {/* badan rumah dua lantai */}
        <Rect x="42" y="63" width="276" height="140" fill={DINDING} />
        <Rect x="42" y="124" width="276" height="6" fill={KUSEN} />
        {/* pagar balkon */}
        {Array.from({ length: 23 }).map((_, i) => (
          <Rect key={i} x={50 + i * 12} y="112" width="3" height="12" fill={KUSEN} />
        ))}
        <Rect x="46" y="109" width="268" height="4" fill={KUSEN} />
        {/* jendela lantai 2 */}
        <Krepyak x={64} y={72} />
        <Krepyak x={157} y={72} />
        <Krepyak x={250} y={72} />
        {/* lantai 1: jendela, pintu, jendela */}
        <Krepyak x={64} y={146} />
        <Krepyak x={250} y={146} />
        <Rect x="160" y="140" width="40" height="63" fill={KUSEN} rx="2" />
        <Rect x="164" y="144" width="15" height="59" fill={W.bataTua} />
        <Rect x="181" y="144" width="15" height="59" fill={W.bataTua} />
        <Circle cx="177" cy="176" r="1.8" fill={W.kunyit} />
        <Circle cx="183" cy="176" r="1.8" fill={W.kunyit} />
        <Path d="M154 140h52l-4-7h-44z" fill={W.bata} />
        {/* lampu teras */}
        <Rect x="208" y="146" width="4" height="10" fill={KUSEN} />
        <Circle cx="210" cy="159" r="4" fill={W.kunyit} />
        {/* lantai teras tegel */}
        <Rect x="20" y="203" width="320" height="16" fill={`url(#${id})`} />
        <Rect x="20" y="203" width="320" height="2" fill={KUSEN} opacity="0.5" />
        <Rect x="10" y="219" width="340" height="11" fill="#D8C7AE" />
        {/* pot tanaman */}
        {[[132, 0], [222, 1]].map(([x, k]) => (
          <G key={x}>
            <Circle cx={x} cy={186} r="10" fill={W.hijau} />
            <Circle cx={x - 7} cy={192} r="7" fill="#2E7562" />
            <Circle cx={x + 7} cy={191} r="7" fill="#2E7562" />
            <Path d={`M${x - 9} 196h18l-3 9h-12z`} fill={k ? W.bata : W.bataTua} />
          </G>
        ))}
        {/* tiang papan nama */}
        <Rect x="20" y="150" width="4" height="70" fill={KUSEN} />
        <Rect x="108" y="150" width="4" height="70" fill={KUSEN} />
        <Rect x="12" y="132" width="108" height="34" rx="3" fill={W.kapur} stroke={KUSEN} strokeWidth="2.5" />
      </Svg>
      <View style={{ position: 'absolute', left: `${(14 / 360) * 100}%`, top: `${(134 / 230) * 100}%`, width: `${(104 / 360) * 100}%`, height: `${(30 / 230) * 100}%`, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[F.pekat, { fontSize: 9, letterSpacing: 1.2, color: W.bata }]} numberOfLines={1}>TERIMA KOS</Text>
        <Text style={[F.tebal, { fontSize: 7, color: W.tinta }]} numberOfLines={1}>putra · putri</Text>
      </View>
    </View>
  );
}
