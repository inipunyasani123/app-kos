import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KAMAR, TIPE, FASILITAS, GALERI, KOS, DEPOSIT, PARKIR, SEKITAR } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { hariTgl, tgl } from '../../lib/waktu';
import { T, Judul, Sub, Tombol, Foto, Chip, GrupChip, Lencana } from '../../ui/dasar';
import { Pelat, Tegel } from '../../ui/motif';
import { Ikon, Logo } from '../../ui/Ikon';
import { Tautan } from '../../ui/Tautan';
import { Svg, Path, Circle, Rect } from '../../ui/svg';
import { useLembar, useKabar } from '../../ui/lapisan';

const BISA = ['03', '05', '10', '12'];

export async function generateStaticParams() {
  return BISA.map((id) => ({ id }));
}

export function generateMetadata(_req, params) {
  const id = String(params?.id || '03');
  const k = KAMAR.find((x) => x.id === id) || KAMAR[2];
  const tp = TIPE[k.tipe];
  return meta({
    judul: `Kamar ${k.id} Tipe ${tp.nama}, ${rupiah(tp.harga)}/bln · Grendel`,
    deskripsi: `Kamar kos ${tp.ukuran} di ${KOS.nama} (rekaan), lantai ${k.lantai} khusus ${k.lantai === 1 ? 'putra' : 'putri'}: ${tp.fasilitas.map((f) => FASILITAS[f].label.toLowerCase()).join(', ')}. Jadwalkan survei.`.slice(0, 155),
    path: `/kamar/${k.id}`,
  });
}

const ATURAN_INTI = [
  { ikon: 'jam', judul: 'Jam tamu 08.00–21.00', isi: 'Tamu di ruang tamu depan, tidak masuk kamar.' },
  { ikon: 'orang', judul: 'Lantai dipisah', isi: 'Lantai 1 putra, lantai 2 putri.' },
  { ikon: 'gembok', judul: 'Gerbang dikunci 23.00', isi: 'Tiap penghuni pegang kunci gembok sendiri.' },
  { ikon: 'kasur', judul: 'Tamu menginap', isi: 'Izin pengelola, maks. 2 malam, Rp25.000/malam.' },
];

function PetaSekitar() {
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' }}>
      <View aria-hidden style={{ height: 120, backgroundColor: '#EFE6D6' }}>
        <Svg width="100%" height="120" viewBox="0 0 358 120">
          <Rect x="0" y="52" width="358" height="16" fill="#FFFBF3" />
          <Rect x="170" y="0" width="14" height="120" fill="#FFFBF3" />
          <Path d="M0 100 C80 92 120 110 200 100 S300 86 358 96" stroke="#FFFBF3" strokeWidth="10" fill="none" />
          {[[60, 30, W.biru], [290, 28, W.hijau], [250, 92, W.kunyit], [96, 92, W.bata]].map(([x, y, w], i) => (
            <Circle key={i} cx={x} cy={y} r="7" fill={w} stroke="#FFFBF3" strokeWidth="3" />
          ))}
        </Svg>
        <View style={{ position: 'absolute', left: 158, top: 40 }}>
          <Logo ukuran={38} label={null} />
        </View>
      </View>
      <View style={{ padding: 12, gap: 6 }}>
        {SEKITAR.map((s, i) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: [W.biru, W.hijau, W.kunyit, W.bata][i] }} />
            <T v="kecil" warna={W.tinta} style={{ flex: 1 }}>{s.label}</T>
            <T v="kuat" style={ANGKA}>{s.jarak}</T>
          </View>
        ))}
        <T v="mini">Jarak perkiraan; peta disederhanakan dan rekaan.</T>
      </View>
    </View>
  );
}

function TanyaWA({ k }) {
  const kabar = useKabar();
  const lembar = useLembar();
  const pesan = `Halo ${KOS.pemilik}, saya tertarik Kamar ${k.id} (Tipe ${TIPE[k.tipe].nama}) di ${KOS.nama}. Apakah masih tersedia? Kapan saya bisa survei?`;
  return (
    <>
      <T v="kecil">Pesan ini akan dikirim lewat WhatsApp ke pemilik. Di demo, nomornya disembunyikan.</T>
      <View style={{ backgroundColor: W.hijauMuda, borderRadius: 16, borderBottomRightRadius: 4, padding: 12, alignSelf: 'flex-end', maxWidth: '92%' }}>
        <T v="teks">{pesan}</T>
      </View>
      <Tombol jenis="hijau" ikon="chat" label="Kirim lewat WhatsApp (simulasi)" penuh onPress={() => { lembar.tutup(); kabar('Simulasi: pesan WhatsApp siap dikirim ke pemilik.'); }} />
    </>
  );
}

function Survei({ k, hari }) {
  const { mintaSurvei } = useToko();
  const kabar = useKabar();
  const lembar = useLembar();
  const [d, setD] = useState(1);
  const [jamPilih, setJam] = useState('16.00');
  return (
    <>
      <T v="kecil">{KOS.pengelola} akan menemani keliling kamar dan fasilitas bersama. Pilih waktu yang cocok.</T>
      <T v="label">Hari</T>
      <GrupChip label="Hari survei">
        {[1, 2, 3].map((x) => (
          <Chip key={x} label={hariTgl(hari + x)} aktif={d === x} onPress={() => setD(x)} kecil />
        ))}
      </GrupChip>
      <T v="label">Jam (WIB)</T>
      <GrupChip label="Jam survei">
        {['09.00', '13.00', '16.00', '19.00'].map((j) => (
          <Chip key={j} label={j} aktif={jamPilih === j} onPress={() => setJam(j)} kecil />
        ))}
      </GrupChip>
      <Tombol
        label="Kirim permintaan survei"
        ikon="kalender"
        ukuran="besar"
        penuh
        onPress={() => {
          mintaSurvei({ nama: 'Kamu (calon penghuni)', kamar: k.id, hariSurvei: hari + d, jam: jamPilih, pesan: 'Mau lihat kamar dulu.' });
          lembar.tutup();
          kabar(`Permintaan survei ${hariTgl(hari + d)} ${jamPilih} WIB terkirim (simulasi). Cek di mode pemilik → Iklan.`);
        }}
      />
    </>
  );
}

export default function HalamanKamar() {
  const { id } = useLocalSearchParams();
  const { data } = useToko();
  const lembar = useLembar();
  const insets = useSafeAreaInsets();
  const kid = BISA.includes(String(id)) ? String(id) : '03';
  const kamar = data.kamar.find((x) => x.id === kid);
  const tp = kamar.tipeData;
  const galeri = GALERI[kid];
  const tersedia = kamar.status === 'kosong';
  return (
    <View style={{ flex: 1, backgroundColor: W.kapur }}>
      <View role="banner" style={{ paddingTop: insets.top, backgroundColor: W.kapur }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Tautan href="/pemilik/iklan" aria-label="Kembali ke iklan pemilik" style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingRight: 8 }}>
            <Ikon nama="kiri" ukuran={18} warna={W.bata} tebal={2.2} />
            <T v="kuat" warna={W.bata}>Iklan pemilik</T>
          </Tautan>
          <Lencana teks="Tampilan calon penghuni" warna="gelap" ikon="mata" />
        </View>
        <Tegel tinggi={10} ubin={20} />
      </View>

      <ScrollView role="main" tabIndex={0} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 24 }}>
        <View style={{ gap: 6 }}>
          <Foto source={galeri[0].src} label={galeri[0].alt} utama style={{ borderRadius: 20 }}>
            <View style={{ position: 'absolute', left: 12, top: 12 }}>
              <Pelat nomor={kid} latar={W.hijau} teks={W.putih} ukuran={54} />
            </View>
            {galeri[0].sejenis ? (
              <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(34,28,23,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={[F.sedang, { fontSize: 12, color: W.kapur }]}>Foto kamar sejenis</Text>
              </View>
            ) : null}
          </Foto>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {galeri.slice(1).map((g) => (
              <View key={g.alt} style={{ flex: 1 }}>
                <Foto source={g.src} label={g.alt} style={{ borderRadius: 14 }} />
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 4 }}>
          <Judul>Kamar {kid} · Tipe {tp.nama}</Judul>
          <T v="kecil">{KOS.nama}, {KOS.wilayah} · lantai {kamar.lantai}, khusus {kamar.lantai === 1 ? 'putra' : 'putri'} · {tp.ukuran}</T>
        </View>

        {tersedia ? (
          <Lencana teks={`Tersedia · siap dihuni mulai ${tgl(data.hari)}`} warna="hijau" ikon="centang" />
        ) : (
          <View style={{ backgroundColor: W.kunyitMuda, borderRadius: 14, padding: 12, gap: 2 }}>
            <T v="kuat" warna={W.coklat}>{kamar.status === 'perawatan' ? `Sedang perawatan, perkiraan siap ${tgl(kamar.perawatan.selesai)}` : 'Kamar ini sudah terisi'}</T>
            <T v="mini" warna={W.coklat}>Kamu tetap bisa menjadwalkan survei untuk kamar sejenis.</T>
          </View>
        )}

        <View style={{ gap: 8 }}>
          <Sub level={2} v="h3">Fasilitas</Sub>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {tp.fasilitas.map((f) => (
              <View key={f} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 999, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 12, minHeight: 36 }}>
                <Ikon nama={FASILITAS[f].ikon} ukuran={16} warna={W.bata} />
                <Text style={[F.sedang, { fontSize: 13.5, color: W.tinta }]}>{FASILITAS[f].label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 6 }}>
          <Sub level={2} v="h3">Biaya</Sub>
          {[
            ['Sewa per bulan', rupiah(tp.harga)],
            ['Deposit (kembali saat keluar)', rupiah(DEPOSIT)],
            ['Parkir motor (opsional)', `${rupiah(PARKIR)}/bln`],
            ['Listrik', tp.fasilitas.includes('ac') ? 'Token sendiri' : 'Termasuk sewa'],
          ].map(([l, n]) => (
            <View key={l} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
              <T v="kecil">{l}</T>
              <T v="kuat" style={ANGKA}>{n}</T>
            </View>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Sub level={2} v="h3">Aturan inti</Sub>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ATURAN_INTI.map((a) => (
              <View key={a.judul} style={{ width: '48.5%', flexGrow: 1, backgroundColor: W.kertas, borderRadius: 16, borderWidth: 1, borderColor: W.garis, padding: 12, gap: 4 }}>
                <Ikon nama={a.ikon} ukuran={20} warna={W.bata} />
                <T v="kuat">{a.judul}</T>
                <T v="mini">{a.isi}</T>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Sub level={2} v="h3">Sekitar kos</Sub>
          <PetaSekitar />
        </View>
      </ScrollView>

      <View role="region" aria-label="Harga dan tindakan" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: W.tinta, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Math.max(insets.bottom, 10) }}>
        <View style={{ flex: 1 }}>
          <Text style={[F.judul, ANGKA, { fontSize: 20, lineHeight: 24, color: W.kunyit }]}>{rupiah(tp.harga)}</Text>
          <Text style={[F.sedang, { fontSize: 12, color: '#EDE4D6' }]}>per bulan</Text>
        </View>
        <Tombol jenis="garisTerang" ukuran="kecil" ikon="chat" label="Tanya WA" aksesLabel="Tanya lewat WhatsApp (simulasi)" onPress={() => lembar.buka({ judul: 'Tanya lewat WhatsApp', isi: <TanyaWA k={kamar} /> })} />
        <Tombol jenis="kunyit" ukuran="kecil" ikon="kalender" label="Survei" aksesLabel="Jadwalkan survei" onPress={() => lembar.buka({ judul: `Jadwalkan survei Kamar ${kid}`, isi: <Survei k={kamar} hari={data.hari} /> })} />
      </View>
    </View>
  );
}
