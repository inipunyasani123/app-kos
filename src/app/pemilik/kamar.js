import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { W, F, ANGKA, BAYANGAN } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { FASILITAS, FOTO_KAMAR } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, jarakHari, jam } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Kerangka, Lencana, Chip, GrupChip, BarisInfo, Foto } from '../../ui/dasar';
import { Pelat, Tegel, Sosok } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { RincianPenghuni } from '../../ui/bayar';
import { useLembar, useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Denah Kamar Kos dan Statusnya · Grendel',
    deskripsi: 'Denah 12 kamar kos di dua lantai dengan status terisi, kosong, atau perawatan; detail penghuni, status bayar, fasilitas, dan harga tiap kamar.',
    path: '/pemilik/kamar',
  });
}

const GAYA_STATUS = {
  terisi: { latar: W.tinta, teks: W.kapur, label: 'Terisi' },
  kosong: { latar: W.hijau, teks: W.putih, label: 'Kosong' },
  perawatan: { latar: W.kunyit, teks: W.tinta, label: 'Perawatan' },
};

export default function Denah() {
  const { data } = useToko();
  const [saring, setSaring] = useState('semua');
  return (
    <Layar judul="Denah kamar" sub="12 kamar di 2 lantai. Ketuk kamar untuk detailnya.">
      {data ? (
        <Isi data={data} saring={saring} setSaring={setSaring} />
      ) : (
        <>
          <Kerangka tinggi={40} />
          <Kerangka tinggi={270} />
          <Kerangka tinggi={270} />
        </>
      )}
    </Layar>
  );
}

function DetailKamar({ id }) {
  const { data, ingatkan, bayar, statusKamar, iklan } = useToko();
  const kabar = useKabar();
  const lembar = useLembar();
  if (!data) return null;
  const k = data.kamar.find((x) => x.id === id);
  const p = k.penghuni;
  const g = GAYA_STATUS[k.status];
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Pelat nomor={k.id} latar={g.latar} teks={g.teks} ukuran={64} />
        <View style={{ flex: 1, gap: 2 }}>
          <T v="kuat">Tipe {k.tipeData.nama} · Lantai {k.lantai} ({k.lantai === 1 ? 'putra' : 'putri'})</T>
          <T v="kecil">{k.tipeData.ukuran} · {rupiah(k.tipeData.harga)}/bulan</T>
          <Lencana teks={g.label} warna={k.status === 'terisi' ? 'gelap' : k.status === 'kosong' ? 'hijau' : 'kunyit'} />
        </View>
      </View>

      {p ? <RincianPenghuni kamar={k.id} /> : null}

      {k.status === 'kosong' ? (
        <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 10 }}>
          <T v="kecil">Kosong sejak {k.kosongSejak != null ? `${tgl(k.kosongSejak)} (${jarakHari(k.kosongSejak, data.hari)})` : 'hari ini'}.</T>
          <Lencana teks={k.iklan ? 'Tayang di iklan' : 'Belum diiklankan'} warna={k.iklan ? 'hijau' : 'abu'} />
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Tombol ukuran="kecil" jenis="gelap" ikon="mata" label="Halaman calon penghuni" href={`/kamar/${k.id}`} />
            <Tombol ukuran="kecil" ikon="papan" label={k.iklan ? 'Tarik iklan' : 'Tayangkan iklan'} jenis={k.iklan ? 'garis' : 'hijau'} onPress={() => { iklan(k.id, !k.iklan); kabar(k.iklan ? 'Iklan ditarik.' : 'Iklan kamar tayang.'); }} />
            <Tombol ukuran="kecil" jenis="garis" ikon="sapu" label="Tandai perawatan" onPress={() => { statusKamar(k.id, 'perawatan'); kabar(`Kamar ${k.id} ditandai perawatan.`); }} />
          </View>
        </View>
      ) : null}

      {k.status === 'perawatan' ? (
        <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' }}>
          {FOTO_KAMAR[k.id] ? <Foto source={FOTO_KAMAR[k.id]} label={`Kamar ${k.id} sedang dicat ulang, lantai ditutup plastik`} /> : null}
          <View style={{ padding: 14, gap: 8 }}>
            <T v="kuat">{k.perawatan.catatan}</T>
            <T v="kecil">Perkiraan selesai {tgl(k.perawatan.selesai)} ({jarakHari(k.perawatan.selesai, data.hari)}).</T>
            <Tombol ukuran="kecil" jenis="hijau" ikon="centang" label="Selesai, tandai kosong" onPress={() => { statusKamar(k.id, 'kosong'); kabar(`Kamar ${k.id} siap dihuni.`); lembar.tutup(); }} />
          </View>
        </View>
      ) : null}

      <View style={{ gap: 8 }}>
        <T v="label">Fasilitas</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {k.tipeData.fasilitas.map((f) => (
            <View key={f} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 999, borderWidth: 1, borderColor: W.garis, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Ikon nama={FASILITAS[f].ikon} ukuran={16} warna={W.bata} />
              <Text style={[F.sedang, { fontSize: 13, color: W.tinta }]}>{FASILITAS[f].label}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

function Petak({ k, redup, buka }) {
  // Kamar di luar saringan dibuat pudar tanpa opacity, supaya teksnya tetap lolos kontras.
  const g = redup ? { ...GAYA_STATUS[k.status], latar: '#D9CEBF', teks: W.tinta } : GAYA_STATUS[k.status];
  const sub = k.status === 'terisi' ? k.penghuni.panggil : k.status === 'kosong' ? 'Tersedia' : 'Perawatan';
  const telat = k.penghuni && k.penghuni.tagihan.status === 'telat';
  const ket = telat ? `Telat ${k.penghuni.tagihan.telat} hari` : k.tipeData.nama;
  return (
    <Pressable
      role="button"
      aria-label={`Kamar ${k.id}, ${g.label}${k.penghuni ? `, ${k.penghuni.nama}` : ''}${telat ? ', telat bayar' : ''}`}
      onPress={buka}
      style={({ pressed, hovered }) => ({
        flex: 1,
        minHeight: 96,
        borderRadius: 14,
        backgroundColor: redup ? W.kapur : W.kertas,
        borderWidth: 1.5,
        borderColor: redup ? W.garis : k.status === 'perawatan' ? W.kunyit : W.garis,
        borderStyle: k.status === 'perawatan' ? 'dashed' : 'solid',
        padding: 8,
        gap: 6,
        alignItems: 'center',
        opacity: pressed ? 0.85 : 1,
        boxShadow: hovered ? BAYANGAN : undefined,
      })}
    >
      <Pelat nomor={k.id} latar={g.latar} teks={g.teks} ukuran={46} />
      <Text style={[F.tebal, { fontSize: 12.5, color: W.tinta }]} numberOfLines={1}>{sub}</Text>
      <Text style={[telat ? F.tebal : F.teks, { fontSize: 12, color: telat ? W.bataTua : W.abu }]} numberOfLines={1}>{ket}</Text>
      {telat ? (
        <View style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9, backgroundColor: W.bata, alignItems: 'center', justifyContent: 'center' }}>
          <Ikon nama="awas" ukuran={12} warna={W.putih} tebal={2.4} />
        </View>
      ) : null}
    </Pressable>
  );
}

function Lantai({ no, kamar, saring, buka }) {
  const baris = [kamar.slice(0, 3), kamar.slice(3, 6)];
  return (
    <View style={{ backgroundColor: W.kapur, borderRadius: 22, borderWidth: 1.5, borderColor: W.garisTua, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: W.kertas, borderBottomWidth: 1, borderBottomColor: W.garis }}>
        <Sub level={2} v="h3">Lantai {no}</Sub>
        <T v="mini">{no === 1 ? 'Putra · dapur bersama' : 'Putri · jemuran atas'}</T>
      </View>
      <View style={{ padding: 10, gap: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {baris[0].map((k) => (
            <Petak key={k.id} k={k} redup={saring !== 'semua' && k.status !== saring} buka={() => buka(k)} />
          ))}
        </View>
        <View style={{ marginVertical: 8, borderRadius: 8, overflow: 'hidden' }}>
          <Tegel tinggi={22} ubin={22} warna="lembut" />
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 }}>
            <View style={{ backgroundColor: W.kapur, paddingHorizontal: 8, borderRadius: 6 }}>
              <Text style={[F.pekat, { fontSize: 12, letterSpacing: 2, color: W.abu }]}>SELASAR</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {baris[1].map((k) => (
            <Petak key={k.id} k={k} redup={saring !== 'semua' && k.status !== saring} buka={() => buka(k)} />
          ))}
        </View>
      </View>
    </View>
  );
}

function Isi({ data, saring, setSaring }) {
  const lembar = useLembar();
  const hitung = (s) => data.kamar.filter((k) => k.status === s).length;
  const buka = (k) => lembar.buka({ judul: `Kamar ${k.id}`, isi: <DetailKamar id={k.id} /> });
  return (
    <>
      <GrupChip label="Saring status kamar">
        <Chip label={`Semua ${data.kamar.length}`} aktif={saring === 'semua'} onPress={() => setSaring('semua')} kecil />
        <Chip label={`Terisi ${hitung('terisi')}`} aktif={saring === 'terisi'} onPress={() => setSaring('terisi')} kecil />
        <Chip label={`Kosong ${hitung('kosong')}`} aktif={saring === 'kosong'} onPress={() => setSaring('kosong')} kecil />
        <Chip label={`Perawatan ${hitung('perawatan')}`} aktif={saring === 'perawatan'} onPress={() => setSaring('perawatan')} kecil />
      </GrupChip>
      <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }} aria-hidden>
        {Object.entries(GAYA_STATUS).map(([s, g]) => (
          <View key={s} style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <View style={{ width: 14, height: 14, borderRadius: 4, backgroundColor: g.latar }} />
            <Text style={[F.sedang, { fontSize: 12, color: W.abu }]}>{g.label}</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: W.bata, alignItems: 'center', justifyContent: 'center' }}>
            <Ikon nama="awas" ukuran={9} warna={W.putih} tebal={3} />
          </View>
          <Text style={[F.sedang, { fontSize: 12, color: W.abu }]}>Telat bayar</Text>
        </View>
      </View>
      <Lantai no={2} kamar={data.kamar.filter((k) => k.lantai === 2)} saring={saring} buka={buka} />
      <Lantai no={1} kamar={data.kamar.filter((k) => k.lantai === 1)} saring={saring} buka={buka} />
    </>
  );
}
