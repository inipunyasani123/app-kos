import { useState } from 'react';
import { View, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { FASILITAS, GALERI, APP } from '../../lib/data';
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

function KartuIklan({ k, hari, utama }) {
  const { iklan } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  const f = GALERI[k.id][0];
  const tautan = `${APP.url}/kamar/${k.id}`;
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 24, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' }}>
      <Foto source={f.src} label={f.alt} utama={utama}>
        <View style={{ position: 'absolute', left: 12, top: 12 }}>
          <Pelat nomor={k.id} latar={W.hijau} teks={W.putih} ukuran={50} />
        </View>
        <View style={{ position: 'absolute', right: 12, top: 12 }}>
          <Lencana teks={k.iklan ? 'Tayang' : 'Draf'} warna={k.iklan ? 'hijau' : 'gelap'} ikon={k.iklan ? 'centang' : undefined} />
        </View>
        <View style={{ position: 'absolute', right: 12, bottom: 12, backgroundColor: 'rgba(34,28,23,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <Ikon nama="foto" ukuran={14} warna={W.kapur} />
          <Text style={[F.sedang, { fontSize: 12, color: W.kapur }]}>{GALERI[k.id].length} foto</Text>
        </View>
        {f.sejenis ? (
          <View style={{ position: 'absolute', left: 12, bottom: 12, backgroundColor: 'rgba(34,28,23,0.85)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={[F.sedang, { fontSize: 12, color: W.kapur }]}>Foto kamar sejenis</Text>
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
          <Tombol ukuran="kecil" jenis="gelap" ikon="mata" label="Pratinjau" aksesLabel={`Pratinjau iklan Kamar ${k.id} seperti dilihat calon penghuni`} href={`/kamar/${k.id}`} />
          <Tombol
            ukuran="kecil"
            jenis="garis"
            ikon="salin"
            label="Salin tautan"
            aksesLabel={`Salin tautan iklan Kamar ${k.id}`}
            onPress={async () => {
              try {
                await Clipboard.setStringAsync(tautan);
                kabar('Tautan halaman iklan disalin.');
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
  const { balasCalon } = useToko();
  const kabar = useKabar();
  const kosong = data.kamar.filter((k) => k.status === 'kosong');
  const menunggu = data.calon.filter((c) => !data.dibalas[c.id]).length;
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
        <Sub level={2} v="h3">Calon penghuni</Sub>
        {menunggu ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: W.kunyitMuda, borderRadius: 16, padding: 12 }}>
            <Ikon nama="chat" ukuran={20} warna={W.coklat} />
            <T v="kuat" warna={W.coklat} style={{ flex: 1 }}>{menunggu} calon menunggu jawaban</T>
          </View>
        ) : null}
        {data.calon.map((c) => {
          const dibalas = data.dibalas[c.id];
          return (
            <View key={c.id} style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: dibalas ? W.garis : W.kunyit, padding: 12, gap: 8 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: W.kunyitMuda, alignItems: 'center', justifyContent: 'center' }}>
                  <Ikon nama="kalender" ukuran={20} warna={W.coklat} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="kuat">{c.nama} · Kamar {c.kamar}</T>
                  <T v="mini">Survei {hariTgl(c.hariSurvei)} pukul {c.jam} WIB · masuk {relatif(c.ts, data.kini)}</T>
                  {c.pesan ? <T v="kecil" warna={W.tinta}>“{c.pesan}”</T> : null}
                </View>
              </View>
              {dibalas ? (
                <Lencana teks={`Dibalas ${relatif(dibalas, data.kini)}`} warna="hijau" ikon="centang" />
              ) : (
                <Tombol
                  ukuran="kecil"
                  jenis="gelap"
                  ikon="kirim"
                  label="Balas & konfirmasi survei"
                  aksesLabel={`Balas ${c.nama} dan konfirmasi survei`}
                  onPress={() => {
                    balasCalon(c.id);
                    kabar(`Simulasi: jawaban terkirim ke ${c.nama}.`);
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}
