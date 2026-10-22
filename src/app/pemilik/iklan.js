import { useState } from 'react';
import { View, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { FASILITAS, FOTO_KAMAR, KOS, APP, ATURAN, DEPOSIT } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, hariTgl, jarakHari, relatif } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Kerangka, Lencana, Chip, GrupChip, Foto } from '../../ui/dasar';
import { Pelat } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { useLembar, useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Iklan Kamar Kos Kosong untuk Calon Penghuni · Grendel',
    deskripsi: 'Kamar kos yang masih kosong lengkap dengan foto, ukuran, fasilitas, dan harga per bulan; pemilik menayangkan iklan dan menerima permintaan jadwal survei.',
    path: '/pemilik/iklan',
  });
}

// Kamar 05 belum punya foto sendiri saat selesai perawatan: pakai foto kamar sejenis (tipe Tegel).
const fotoUntuk = (id) => (id === '05' ? { src: FOTO_KAMAR['12'], sejenis: true } : { src: FOTO_KAMAR[id], sejenis: false });

const ALT = {
  '03': 'Kamar tidur dengan kasur besar, sandaran kepala kayu, lantai teraso, dan tirai jendela',
  '10': 'Kamar sederhana berlantai kayu dengan kasur, tirai lipat, dan dinding krem',
  '12': 'Kamar mungil dengan ranjang bersprei merah muda, lantai tegel kotak-kotak, dan jendela kaca hijau',
};

export default function Iklan() {
  const { data } = useToko();
  return (
    <Layar judul="Kamar kosong" sub="Iklan untuk calon penghuni, lengkap dengan foto dan harga.">
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={420} />
          <Kerangka tinggi={420} />
        </>
      )}
    </Layar>
  );
}

function Pratinjau({ k }) {
  const { mintaSurvei } = useToko();
  const kabar = useKabar();
  const lembar = useLembar();
  const [hari, setHari] = useState(1);
  const f = fotoUntuk(k.id);
  return (
    <>
      <Foto source={f.src} label={ALT[f.sejenis ? '12' : k.id]} style={{ borderRadius: 18 }} utama>
        <View style={{ position: 'absolute', left: 10, top: 10 }}>
          <Lencana teks="Dilihat calon penghuni" warna="gelap" ikon="mata" />
        </View>
      </Foto>
      <View style={{ gap: 2 }}>
        <Text style={[F.judul, { fontSize: 22, lineHeight: 28, color: W.tinta }]}>Kamar {k.id} · Tipe {k.tipeData.nama}</Text>
        <T v="kecil">{KOS.nama}, {KOS.wilayah} · lantai {k.lantai} khusus {k.lantai === 1 ? 'putra' : 'putri'}</T>
      </View>
      <Text style={[F.judul, ANGKA, { fontSize: 28, color: W.bata }]}>
        {rupiah(k.tipeData.harga)}
        <Text style={[F.sedang, { fontSize: 14, color: W.abu }]}> /bulan · deposit {rupiah(DEPOSIT)}</Text>
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {k.tipeData.fasilitas.map((x) => (
          <View key={x} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 999, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 10, paddingVertical: 6 }}>
            <Ikon nama={FASILITAS[x].ikon} ukuran={16} warna={W.bata} />
            <Text style={[F.sedang, { fontSize: 13, color: W.tinta }]}>{FASILITAS[x].label}</Text>
          </View>
        ))}
      </View>
      <T v="kecil">Aturan singkat: {ATURAN.slice(0, 3).map((a) => `${a.judul.toLowerCase()} ${a.isi.split('.')[0].toLowerCase()}`).join('; ')}.</T>
      <View style={{ gap: 8, backgroundColor: W.kertas, borderRadius: 16, borderWidth: 1, borderColor: W.garis, padding: 12 }}>
        <T v="label">Minta jadwal survei</T>
        <GrupChip label="Hari survei">
          {[1, 2, 3].map((d) => (
            <Chip key={d} label={hariTgl(k.hariIni + d)} aktif={hari === d} onPress={() => setHari(d)} kecil />
          ))}
        </GrupChip>
        <Tombol
          label="Kirim permintaan survei"
          ikon="kalender"
          penuh
          onPress={() => {
            mintaSurvei({ nama: 'Kamu (calon penghuni)', kamar: k.id, hariSurvei: k.hariIni + hari, jam: '16.00', pesan: 'Mau lihat kamar dulu.' });
            lembar.tutup();
            kabar('Simulasi: permintaan survei masuk ke pemilik.');
          }}
        />
      </View>
    </>
  );
}

function KartuIklan({ k, hari, utama }) {
  const { iklan } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  const f = fotoUntuk(k.id);
  const tautan = `${APP.url}/pemilik/iklan`;
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 24, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' }}>
      <Foto source={f.src} label={ALT[f.sejenis ? '12' : k.id]} utama={utama}>
        <View style={{ position: 'absolute', left: 12, top: 12 }}>
          <Pelat nomor={k.id} latar={W.hijau} teks={W.putih} ukuran={50} />
        </View>
        <View style={{ position: 'absolute', right: 12, top: 12 }}>
          <Lencana teks={k.iklan ? 'Tayang' : 'Draf'} warna={k.iklan ? 'hijau' : 'gelap'} ikon={k.iklan ? 'centang' : undefined} />
        </View>
        {f.sejenis ? (
          <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(34,28,23,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={[F.sedang, { fontSize: 11.5, color: W.kapur }]}>Foto kamar sejenis</Text>
          </View>
        ) : null}
      </Foto>
      <View style={{ padding: 14, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Sub level={2} v="h3">Kamar {k.id} · Tipe {k.tipeData.nama}</Sub>
            <T v="mini">Lantai {k.lantai} ({k.lantai === 1 ? 'putra' : 'putri'}) · {k.tipeData.ukuran}</T>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[F.judul, ANGKA, { fontSize: 20, color: W.tinta }]}>{rupiah(k.tipeData.harga)}</Text>
            <T v="mini">per bulan</T>
          </View>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {k.tipeData.fasilitas.map((x) => (
            <View key={x} style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: W.kapur, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 }}>
              <Ikon nama={FASILITAS[x].ikon} ukuran={14} warna={W.bata} />
              <Text style={[F.sedang, { fontSize: 12, color: W.tinta }]}>{FASILITAS[x].label}</Text>
            </View>
          ))}
        </View>
        <T v="mini">Kosong sejak {k.kosongSejak != null ? `${tgl(k.kosongSejak)} (${jarakHari(k.kosongSejak, hari)})` : 'hari ini'} · siap dihuni hari ini</T>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
          <Tombol ukuran="kecil" jenis={k.iklan ? 'garis' : 'hijau'} ikon="papan" label={k.iklan ? 'Tarik iklan' : 'Tayangkan'} onPress={() => { iklan(k.id, !k.iklan); kabar(k.iklan ? `Iklan Kamar ${k.id} ditarik.` : `Iklan Kamar ${k.id} tayang.`); }} />
          <Tombol ukuran="kecil" jenis="gelap" ikon="mata" label="Pratinjau" aksesLabel={`Pratinjau iklan Kamar ${k.id}`} onPress={() => lembar.buka({ judul: `Iklan Kamar ${k.id}`, isi: <Pratinjau k={{ ...k, hariIni: hari }} /> })} />
          <Tombol
            ukuran="kecil"
            jenis="garis"
            ikon="salin"
            label="Salin tautan"
            aksesLabel={`Salin tautan iklan Kamar ${k.id}`}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(tautan);
                kabar('Tautan iklan disalin (simulasi).');
              } catch {
                kabar('Tidak bisa menyalin di peramban ini.');
              }
            }}
          />
        </View>
      </View>
    </View>
  );
}

function Isi({ data }) {
  const kosong = data.kamar.filter((k) => k.status === 'kosong');
  return (
    <>
      {kosong.length ? (
        kosong.map((k, i) => <KartuIklan key={k.id} k={k} hari={data.hari} utama={i === 0} />)
      ) : (
        <View style={{ padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTua }}>
          <T v="kecil">Semua kamar terisi. Iklan otomatis disembunyikan.</T>
        </View>
      )}
      <View style={{ gap: 10 }}>
        <Sub level={2} v="h3">Permintaan survei ({data.calon.length})</Sub>
        {data.calon.map((c) => (
          <View key={c.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: W.kunyitMuda, alignItems: 'center', justifyContent: 'center' }}>
              <Ikon nama="kalender" ukuran={20} warna={W.coklat} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T v="kuat">{c.nama} · Kamar {c.kamar}</T>
              <T v="mini">Survei {hariTgl(c.hariSurvei)} pukul {c.jam} WIB · masuk {relatif(c.ts, data.kini)}</T>
              {c.pesan ? <T v="kecil" warna={W.tinta}>“{c.pesan}”</T> : null}
            </View>
          </View>
        ))}
      </View>
    </>
  );
}
