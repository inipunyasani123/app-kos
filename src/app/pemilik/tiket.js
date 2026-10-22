import { useState } from 'react';
import { View } from 'react-native';
import { W } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { SLOT_JADWAL, KOS } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { jarakHari, hariTgl } from '../../lib/waktu';
import { Layar, T, Tombol, Kerangka, Chip, GrupChip, Sub } from '../../ui/dasar';
import { Ikon } from '../../ui/Ikon';
import { KartuTiket } from '../../ui/kos';
import { useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Tiket Kerusakan Kos untuk Pemilik · Grendel',
    deskripsi: 'Pemilik dan pengelola kos menerima laporan kerusakan dari penghuni lengkap dengan foto, menjadwalkan kunjungan, lalu menandai dikerjakan dan selesai.',
    path: '/pemilik/tiket',
  });
}

export default function Tiket() {
  const { data } = useToko();
  const [tab, setTab] = useState('aktif');
  return (
    <Layar judul="Laporan kerusakan" sub={`Dari penghuni, ditangani ${KOS.pengelola}.`}>
      {data ? (
        <Isi data={data} tab={tab} setTab={setTab} />
      ) : (
        <>
          <Kerangka tinggi={40} />
          <Kerangka tinggi={300} />
          <Kerangka tinggi={300} />
        </>
      )}
    </Layar>
  );
}

function Aksi({ t, hari }) {
  const { ubahTiket } = useToko();
  const kabar = useKabar();
  const [pilihJadwal, setPilihJadwal] = useState(false);
  const [slot, setSlot] = useState(1);
  if (t.status === 'selesai') return null;
  if (t.status === 'baru') {
    if (!pilihJadwal) return <Tombol ukuran="kecil" ikon="kalender" label="Jadwalkan kunjungan" onPress={() => setPilihJadwal(true)} />;
    return (
      <View style={{ gap: 8, backgroundColor: W.kapur, borderRadius: 14, padding: 10 }}>
        <T v="label">Kapan {KOS.pengelola} datang?</T>
        <GrupChip label="Pilih jadwal kunjungan">
          {SLOT_JADWAL.map((s, i) => (
            <Chip key={i} label={`${jarakHari(hari + s.hari, hari).replace(/^./, (c) => c.toUpperCase())} ${s.jam}`} aktif={slot === i} onPress={() => setSlot(i)} kecil />
          ))}
        </GrupChip>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Tombol
            ukuran="kecil"
            ikon="centang"
            label="Simpan jadwal"
            onPress={() => {
              const s = SLOT_JADWAL[slot];
              ubahTiket(t.id, 'dijadwalkan', `${KOS.pengelola} datang ${hariTgl(hari + s.hari)} pukul ${s.jam} WIB.`, { hari: hari + s.hari, jam: s.jam });
              kabar(`Jadwal terkirim ke penghuni Kamar ${t.kamar}.`);
            }}
          />
          <Tombol ukuran="kecil" jenis="teks" label="Batal" onPress={() => setPilihJadwal(false)} />
        </View>
      </View>
    );
  }
  if (t.status === 'dijadwalkan')
    return (
      <Tombol
        ukuran="kecil"
        jenis="gelap"
        ikon="obeng"
        label="Mulai dikerjakan"
        onPress={() => {
          ubahTiket(t.id, 'dikerjakan', `${KOS.pengelola} sedang mengerjakan.`);
          kabar('Status: dikerjakan.');
        }}
      />
    );
  return (
    <Tombol
      ukuran="kecil"
      jenis="hijau"
      ikon="centang"
      label="Tandai selesai"
      onPress={() => {
        ubahTiket(t.id, 'selesai', 'Sudah diperbaiki dan dicek bersama penghuni.');
        kabar(`Laporan ${t.id} selesai.`);
      }}
    />
  );
}

function Isi({ data, tab, setTab }) {
  const aktif = data.tiket.filter((t) => t.status !== 'selesai');
  const selesai = data.tiket.filter((t) => t.status === 'selesai');
  const daftar = tab === 'aktif' ? aktif : selesai;
  return (
    <>
      <GrupChip label="Saring laporan">
        <Chip label={`Perlu ditangani ${aktif.length}`} aktif={tab === 'aktif'} onPress={() => setTab('aktif')} />
        <Chip label={`Selesai ${selesai.length}`} aktif={tab === 'selesai'} onPress={() => setTab('selesai')} />
      </GrupChip>
      {daftar.length ? (
        <View style={{ gap: 12 }}>
          {daftar.map((t) => (
            <KartuTiket key={t.id} tiket={t} kini={data.kini} tampilKamar level={2} aksi={<Aksi t={t} hari={data.hari} />} />
          ))}
        </View>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: W.garisTua }}>
          <Ikon nama="centang" ukuran={20} warna={W.hijau} />
          <T v="kecil" style={{ flex: 1 }}>Tidak ada laporan di sini.</T>
        </View>
      )}
      <View style={{ gap: 6, marginTop: 4 }}>
        <Sub level={2} v="h3">Alur laporan</Sub>
        <T v="kecil">Penghuni mengirim laporan dari menu Lapor. Setiap perubahan status di sini langsung terlihat di aplikasi penghuni, lengkap dengan jadwal kunjungannya.</T>
      </View>
    </>
  );
}
