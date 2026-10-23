import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tglPendek } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Ketuk } from '../../ui/dasar';
import { Sosok } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { GRUP, ketHari, perluDiingatkan, PratinjauPengingat, RincianPenghuni } from '../../ui/bayar';
import { useLembar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Status Bayar Semua Penghuni Kos · Grendel',
    deskripsi: 'Pemilik kos memantau status bayar tiap penghuni (lunas, belum jatuh tempo, tenggang, telat dengan denda), mengirim pengingat, dan mencatat bayar tunai.',
    path: '/pemilik/tagihan',
  });
}

export default function StatusBayar() {
  const { data } = useToko();
  return (
    <Layar judul="Status bayar" sub="Periode berjalan tiap penghuni, dikelompokkan dari yang paling mendesak.">
      <Isi data={data} />
    </Layar>
  );
}

function Baris({ p, hari, g, buka }) {
  const t = p.tagihan;
  return (
    <Ketuk
      onPress={buka}
      aksesLabel={`${p.nama}, Kamar ${p.kamar}, ${rupiah(t.total)}, ${ketHari(p, hari)}. Buka rincian.`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 64, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: W.kertas, borderRadius: 16, borderWidth: 1, borderColor: g.id === 'telat' ? W.bata : W.garis }}
    >
      <Sosok av={p.av} ukuran={40} />
      <View style={{ flex: 1, gap: 1 }}>
        <T v="kuat" numberOfLines={1}>{p.nama}</T>
        <T v="mini">
          Kamar {p.kamar} · jatuh tempo {tglPendek(t.jatuh)}
          {p.ingat && g.id !== 'lunas' ? ' · diingatkan' : ''}
        </T>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 2 }}>
        <T v="kuat" style={ANGKA}>{rupiah(t.total)}</T>
        <Text style={[F.tebal, ANGKA, { fontSize: 12.5, color: g.warna }]}>{ketHari(p, hari)}</Text>
      </View>
      <Ikon nama="kanan" ukuran={16} warna={W.abu} />
    </Ketuk>
  );
}

function Isi({ data }) {
  const lembar = useLembar();
  const [lunasTerbuka, setLunasTerbuka] = useState(false);
  const kel = data.kelompok;
  const diingat = perluDiingatkan(kel);
  const buka = (p) => lembar.buka({ judul: `${p.panggil} · Kamar ${p.kamar}`, isi: <RincianPenghuni kamar={p.kamar} /> });
  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {GRUP.map((g) => (
          <View key={g.id} style={{ width: '47.5%', flexGrow: 1, backgroundColor: g.latar, borderRadius: 18, padding: 12 }}>
            <Text style={[F.pekat, ANGKA, { fontSize: 28, lineHeight: 34, color: g.warna }]}>{kel[g.id].length}</Text>
            <Text style={[F.sedang, { fontSize: 13.5, color: g.warna }]}>{g.label}</Text>
            <Text style={[F.teks, ANGKA, { fontSize: 12.5, color: g.warna }]}>{rupiah(kel[g.id].reduce((s, p) => s + p.tagihan.total, 0))}</Text>
          </View>
        ))}
      </View>
      {diingat.length ? (
        <Tombol
          label={`Ingatkan ${diingat === kel.segera ? 'yang segera jatuh tempo' : 'yang telat & tenggang'} (${diingat.length})`}
          ikon="lonceng"
          penuh
          onPress={() => lembar.buka({ judul: 'Kirim pengingat', isi: <PratinjauPengingat daftar={diingat} hari={data.hari} /> })}
        />
      ) : null}
      {GRUP.map((g) => {
        const daftar = kel[g.id];
        const ciut = g.id === 'lunas';
        const terbuka = !ciut || lunasTerbuka;
        return (
          <View key={g.id} style={{ gap: 8 }}>
            {ciut ? (
              <Pressable
                role="button"
                aria-expanded={terbuka}
                onPress={() => setLunasTerbuka((x) => !x)}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}
              >
                <Sub level={2} v="h3">{g.label} ({daftar.length})</Sub>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <T v="kuat" warna={W.bata}>{terbuka ? 'Ciutkan' : 'Tampilkan'}</T>
                  <View style={{ transform: [{ rotate: terbuka ? '180deg' : '0deg' }] }}>
                    <Ikon nama="bawah" ukuran={18} warna={W.bata} tebal={2.2} />
                  </View>
                </View>
              </Pressable>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: g.batang }} />
                <Sub level={2} v="h3">{g.label} ({daftar.length})</Sub>
              </View>
            )}
            {terbuka
              ? daftar.length
                ? daftar.map((p) => <Baris key={p.kamar} p={p} hari={data.hari} g={g} buka={() => buka(p)} />)
                : <T v="mini">Tidak ada.</T>
              : null}
          </View>
        );
      })}
    </>
  );
}
