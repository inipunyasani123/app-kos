import { View, Text } from 'react-native';
import { W, F } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { ATURAN, KOS } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { tgl } from '../../lib/waktu';
import { Layar, T, Sub, Kerangka, Lencana } from '../../ui/dasar';
import { Tegel } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';

export function generateMetadata() {
  return meta({
    judul: 'Pengumuman dan Tata Tertib Kos · Grendel',
    deskripsi: 'Pengumuman dari pengelola kos (listrik padam, kerja bakti, wifi) dan tata tertib: jam tamu, jam tenang, gerbang, dapur, parkir, pembayaran, dan keluar kos.',
    path: '/penghuni/info',
  });
}

export default function Info() {
  const { data } = useToko();
  return (
    <Layar judul="Info kos" sub={`Dari pengelola ${KOS.nama}`} fokus>
      <View style={{ gap: 10 }}>
        <Sub level={2} v="h3">Pengumuman</Sub>
        {data ? (
          data.pengumuman.map((p) => (
            <View
              key={p.id}
              style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, borderLeftWidth: p.penting ? 5 : 1, borderLeftColor: p.penting ? W.bata : W.garis, padding: 14, gap: 6 }}
            >
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                {p.penting ? <Lencana teks="Penting" warna="bata" ikon="awas" /> : null}
                <Lencana teks={p.tag} />
                <T v="mini" style={{ marginLeft: 'auto' }}>{p.hariLalu === 1 ? 'Kemarin' : `${p.hariLalu} hari lalu`} · {tgl(data.hari - p.hariLalu)}</T>
              </View>
              <Sub level={3} v="h3">{p.judul}</Sub>
              <T v="kecil" warna={W.tinta}>{p.isi}</T>
            </View>
          ))
        ) : (
          <Kerangka tinggi={360} />
        )}
      </View>

      <View style={{ backgroundColor: W.tinta, borderRadius: 24, overflow: 'hidden', marginTop: 6 }}>
        <Tegel tinggi={22} ubin={22} warna="gelap" />
        <View style={{ padding: 16, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Ikon nama="papan" ukuran={22} warna={W.kunyit} />
            <Text role="heading" aria-level={2} style={[F.judul, { fontSize: 22, color: W.kapur }]}>
              Tata tertib
            </Text>
          </View>
          {ATURAN.map((a, i) => (
            <View key={a.judul} style={{ flexDirection: 'row', gap: 12, paddingVertical: 9, borderTopWidth: i ? 1 : 0, borderTopColor: '#3D342D' }}>
              <Text style={[F.judul, { width: 26, fontSize: 18, lineHeight: 22, color: W.kunyit }]}>{String(i + 1).padStart(2, '0')}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[F.tebal, { fontSize: 14.5, lineHeight: 20, color: W.kapur }]}>{a.judul}</Text>
                <Text style={[F.teks, { fontSize: 13.5, lineHeight: 19, color: '#DDD3C4' }]}>{a.isi}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Layar>
  );
}
