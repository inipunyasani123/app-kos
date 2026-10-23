import { useState } from 'react';
import { View, Text, TextInput, Image, Pressable, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { W, F } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KATEGORI, LOKASI, URGENSI, KOS, RUSAK_CEPAT } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { Layar, T, Sub, Tombol, Kartu, Kerangka, Chip, GrupChip } from '../../ui/dasar';
import { Ikon } from '../../ui/Ikon';
import { KartuTiket } from '../../ui/kos';
import { useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Lapor Kerusakan Kamar Kos dengan Foto · Grendel',
    deskripsi: 'Penghuni melapor kerusakan kamar kos dengan kategori, lokasi, foto, dan catatan, lalu memantau statusnya dari terkirim, dijadwalkan, sampai selesai.',
    path: '/penghuni/lapor',
  });
}

export default function Lapor() {
  const { data } = useToko();
  const [buka, setBuka] = useState(false);
  return (
    <Layar judul="Lapor kerusakan" sub={`Laporan langsung masuk ke ${KOS.pengelola} dan ${KOS.pemilik}.`}>
      {buka ? (
        <Formulir tutup={() => setBuka(false)} />
      ) : (
        <Tombol label="Buat laporan baru" ikon="tambah" ukuran="besar" penuh onPress={() => setBuka(true)} />
      )}
      {data ? <Daftar data={data} /> : <Kerangka tinggi={260} />}
    </Layar>
  );
}

const gayaInput = {
  ...F.teks,
  fontSize: 15,
  color: W.tinta,
  backgroundColor: W.kertas,
  borderWidth: 1.5,
  borderColor: W.garisTua,
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 11,
};

/** Kecilkan foto di web (kanvas) supaya muat disimpan di localStorage. */
async function perkecil(uri) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return uri;
  return new Promise((selesai) => {
    const img = new window.Image();
    img.onload = () => {
      const skala = Math.min(1, 640 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * skala);
      c.height = Math.round(img.height * skala);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try {
        selesai(c.toDataURL('image/jpeg', 0.6));
      } catch {
        selesai(uri);
      }
    };
    img.onerror = () => selesai(uri);
    img.src = uri;
  });
}

function Formulir({ tutup }) {
  const { lapor } = useToko();
  const kabar = useKabar();
  const [kategori, setKategori] = useState('air');
  const [lokasi, setLokasi] = useState('Kamar mandi');
  const [urgensi, setUrgensi] = useState('mengganggu');
  const [judul, setJudul] = useState('');
  const [cepat, setCepat] = useState([]);
  const pilihJenis = (k) => {
    setKategori(k);
    setLokasi(RUSAK_CEPAT[k].lokasi);
    setCepat([]);
  };
  const tandai = (x) => {
    setCepat((c) => (c.includes(x) ? c.filter((y) => y !== x) : [...c, x]));
    if (galat) setGalat('');
  };
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState(null);
  const [galat, setGalat] = useState('');

  const ambil = async (kamera) => {
    try {
      if (kamera && Platform.OS !== 'web') {
        const izin = await ImagePicker.requestCameraPermissionsAsync();
        if (!izin.granted) return kabar('Izin kamera ditolak.');
      }
      const opsi = { mediaTypes: ['images'], quality: 0.6, allowsEditing: false };
      const r = kamera ? await ImagePicker.launchCameraAsync(opsi) : await ImagePicker.launchImageLibraryAsync(opsi);
      if (!r.canceled && r.assets?.[0]) setFoto(await perkecil(r.assets[0].uri));
    } catch {
      kabar('Foto tidak bisa dibuka.');
    }
  };

  const kirim = () => {
    const isi = judul.trim() || cepat.join(', ');
    if (isi.length < 4) {
      setGalat('Pilih salah satu kerusakan di atas, atau tulis singkat minimal 4 huruf.');
      return;
    }
    lapor({ kamar: '07', judul: isi.charAt(0).toUpperCase() + isi.slice(1), kategori, lokasi, urgensi, catatan: catatan.trim(), fotoUri: foto || undefined });
    kabar('Laporan terkirim ke pengelola.');
    tutup();
  };

  return (
    <Kartu style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Sub level={2} v="h2">Laporan baru</Sub>
        <Tombol jenis="teks" ukuran="kecil" label="Batal" onPress={tutup} />
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Jenis kerusakan</T>
        <GrupChip label="Jenis kerusakan">
          {KATEGORI.map((k) => (
            <Chip key={k.id} label={k.label} ikon={k.ikon} aktif={kategori === k.id} onPress={() => pilihJenis(k.id)} kecil />
          ))}
        </GrupChip>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Apa yang rusak (boleh lebih dari satu)</T>
        <View role="group" aria-label="Apa yang rusak" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {RUSAK_CEPAT[kategori].pilihan.map((x) => (
            <Chip key={x} peran="checkbox" label={x} aktif={cepat.includes(x)} onPress={() => tandai(x)} kecil />
          ))}
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Di mana</T>
        <GrupChip label="Lokasi kerusakan">
          {LOKASI.map((l) => (
            <Chip key={l} label={l} aktif={lokasi === l} onPress={() => setLokasi(l)} kecil />
          ))}
        </GrupChip>
      </View>

      <View style={{ gap: 6 }}>
        <Text nativeID="lbl-judul" style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: W.abu }]}>ATAU TULIS SENDIRI</Text>
        <TextInput
          value={judul}
          onChangeText={(v) => {
            setJudul(v);
            if (galat) setGalat('');
          }}
          placeholder="mis. Keran kamar mandi bocor"
          placeholderTextColor="#7A6F64"
          aria-labelledby="lbl-judul"
          aria-label="Tulis sendiri apa yang rusak"
          aria-invalid={galat ? true : undefined}
          maxLength={60}
          style={[gayaInput, galat ? { borderColor: W.bata } : null]}
        />
        {galat ? (
          <Text role="alert" style={[F.sedang, { fontSize: 13, color: W.bataTua }]}>
            {galat}
          </Text>
        ) : null}
      </View>

      <View style={{ gap: 6 }}>
        <Text nativeID="lbl-catatan" style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: W.abu }]}>CATATAN (BOLEH KOSONG)</Text>
        <TextInput
          value={catatan}
          onChangeText={setCatatan}
          placeholder="Sejak kapan, sudah dicoba apa, kapan kamu ada di kamar."
          placeholderTextColor="#7A6F64"
          aria-labelledby="lbl-catatan"
          aria-label="Catatan"
          multiline
          numberOfLines={3}
          maxLength={280}
          style={[gayaInput, { minHeight: 88, textAlignVertical: 'top' }]}
        />
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Seberapa mendesak</T>
        <GrupChip label="Tingkat urgensi">
          {URGENSI.map((u) => (
            <Chip key={u.id} label={u.label} aktif={urgensi === u.id} onPress={() => setUrgensi(u.id)} kecil />
          ))}
        </GrupChip>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Ikon nama="jam" ukuran={16} warna={W.abu} />
          <T v="mini" style={{ flex: 1 }}>
            {URGENSI.find((u) => u.id === urgensi).label}: {URGENSI.find((u) => u.id === urgensi).waktu} (perkiraan pengelola).
          </T>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <T v="label">Foto</T>
        {foto ? (
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Image source={{ uri: foto }} style={{ width: 96, height: 72, borderRadius: 10, backgroundColor: W.garis }} aria-label="Pratinjau foto kerusakan" />
            <Tombol jenis="garis" ukuran="kecil" ikon="silang" label="Hapus foto" onPress={() => setFoto(null)} />
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Tombol jenis="garis" ukuran="kecil" ikon="foto" label="Pilih dari galeri" onPress={() => ambil(false)} />
            {Platform.OS !== 'web' ? <Tombol jenis="garis" ukuran="kecil" ikon="kamera" label="Kamera" onPress={() => ambil(true)} /> : null}
          </View>
        )}
        <T v="mini">Foto membantu {KOS.pengelola} menyiapkan alat dan suku cadang sebelum datang.</T>
      </View>

      <Tombol label="Kirim laporan" ikon="kirim" ukuran="besar" penuh onPress={kirim} />
    </Kartu>
  );
}

function Daftar({ data }) {
  const milik = data.tiket.filter((t) => t.kamar === '07');
  const aktif = milik.filter((t) => t.status !== 'selesai');
  const selesai = milik.filter((t) => t.status === 'selesai');
  return (
    <>
      <View style={{ gap: 10 }}>
        <Sub level={2} v="h3">Sedang diproses ({aktif.length})</Sub>
        {aktif.length ? (
          aktif.map((t) => <KartuTiket key={t.id} tiket={t} kini={data.kini} />)
        ) : (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTua }}>
            <Ikon nama="centang" ukuran={20} warna={W.hijau} />
            <T v="kecil" style={{ flex: 1 }}>Tidak ada laporan aktif. Kalau sudah kirim, coba buka mode Pemilik untuk memprosesnya.</T>
          </View>
        )}
      </View>
      {selesai.length ? (
        <View style={{ gap: 10 }}>
          <Sub level={2} v="h3">Selesai</Sub>
          {selesai.map((t) => (
            <KartuTiket key={t.id} tiket={t} kini={data.kini} />
          ))}
        </View>
      ) : null}
    </>
  );
}
