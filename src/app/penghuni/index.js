import { View, Text } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, TIPE, PENGELOLA } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, tglPendek, hariTgl, jarakHari, namaBulan, hariKe, jam, relatif } from '../../lib/waktu';
import { KAMAR_BY } from '../../lib/hitung';
import { Layar, T, Sub, Tombol, Ketuk, Kerangka, Lencana } from '../../ui/dasar';
import { Tegel, Gantungan, Stempel, Sosok } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { lencanaTagihan, METODE, LangkahTiket } from '../../ui/kos';

export function generateMetadata() {
  return meta({
    judul: 'Beranda Penghuni · Grendel Kos',
    deskripsi: 'Ringkasan untuk penghuni kos: tagihan bulan ini dan jatuh temponya, sisa kontrak sewa, status perbaikan, dan pengumuman terbaru dari pengelola.',
    path: '/penghuni',
  });
}

export default function BerandaPenghuni() {
  const { data } = useToko();
  return (
    <Layar judul="Ringkasan kamarmu" sub={`${KOS.nama} · ${KOS.wilayah}`}>
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={248} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Kerangka tinggi={196} style={{ flex: 1 }} />
            <Kerangka tinggi={196} style={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Kerangka tinggi={150} style={{ flex: 1 }} />
            <Kerangka tinggi={150} style={{ flex: 1 }} />
          </View>
        </>
      )}
    </Layar>
  );
}

function KartuTagihan({ p, hari }) {
  const t = p.tagihan;
  const l = lencanaTagihan(t, hari);
  const lunas = t.status === 'lunas';
  const sisa = t.jatuh - hari;
  return (
    <View style={{ backgroundColor: W.tinta, borderRadius: 26, overflow: 'hidden' }}>
      <Tegel tinggi={14} ubin={28} warna="gelap" />
      <View style={{ padding: 18, gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 24 }}>
          <Text style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: '#D9CDBB' }]}>SEWA {tglPendek(t.jatuh).toUpperCase()} – {tglPendek(t.akhir).toUpperCase()}</Text>
          {t.status !== 'segera' ? <Lencana {...l} /> : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[F.judul, ANGKA, { fontSize: 40, lineHeight: 48, color: W.kunyit }]}>{rupiah(t.total)}</Text>
          {lunas ? <Stempel warna={W.kunyit} kecil /> : null}
        </View>
        <Text style={[F.teks, { fontSize: 14, lineHeight: 20, color: '#EDE4D6' }]}>
          {lunas
            ? `Dibayar ${tgl(hariKe(t.bayar.ts))} lewat ${METODE[t.bayar.metode]}. Tagihan berikutnya terbit ${tgl(p.berikut.jatuh - 7)}.`
            : `Tagihan ${namaBulan(t.jatuh, false)} · bayar paling lambat ${hariTgl(t.jatuh)} (${jarakHari(t.jatuh, hari)}).`}
        </Text>
        {!lunas && t.denda ? (
          <Text style={[F.sedang, { fontSize: 13, color: '#F6C9BC' }]}>Termasuk denda telat {rupiah(t.denda)}.</Text>
        ) : null}
        {!lunas ? (
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 2 }} role="img" aria-label={sisa > 0 ? `${sisa} hari lagi sampai jatuh tempo` : 'Sudah lewat jatuh tempo'}>
            {Array.from({ length: 8 }).map((_, i) => {
              const hariSel = t.jatuh - 7 + i;
              const lewat = hariSel < hari;
              const kini = hariSel === hari;
              return (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: kini ? W.kunyit : lewat ? '#6B5F54' : 'transparent',
                    borderWidth: 1,
                    borderColor: i === 7 ? W.kunyit : '#6B5F54',
                  }}
                />
              );
            })}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          {lunas ? (
            <Tombol href="/penghuni/riwayat" jenis="kunyit" ikon="nota" label="Lihat kuitansi" />
          ) : (
            <Tombol href="/penghuni/bayar" jenis="kunyit" ikon="qr" label={`Bayar ${rupiah(t.total)}`} />
          )}
          <Tombol href="/penghuni/tagihan" jenis="garisTerang" label="Rincian" />
        </View>
      </View>
    </View>
  );
}

function Isi({ data }) {
  const p = data.demo;
  const hari = data.hari;
  const k = KAMAR_BY[p.kamar];
  const tipe = TIPE[k.tipe];
  const kon = data.kontrak;
  const sisaBln = Math.max(0, Math.round((kon.berakhir - hari) / 30.44));
  const tiketSaya = data.tiket.filter((t) => t.kamar === p.kamar);
  const aktif = tiketSaya.filter((t) => t.status !== 'selesai');
  const terakhir = aktif[0] || tiketSaya[0];
  const info = data.pengumuman[0];
  const darmo = PENGELOLA[0];

  return (
    <>
      {p.ingat && p.tagihan.status !== 'lunas' ? (
        <View style={{ flexDirection: 'row', gap: 10, backgroundColor: W.bataMuda, borderRadius: 16, padding: 12, alignItems: 'center' }}>
          <Ikon nama="lonceng" ukuran={20} warna={W.bataTua} />
          <T v="kecil" warna={W.bataTua} style={{ flex: 1 }}>
            {KOS.pemilik} mengirim pengingat tagihan {relatif(p.ingat, data.kini)} ({jam(p.ingat)} WIB).
          </T>
        </View>
      ) : null}

      <KartuTagihan p={p} hari={hari} />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Ketuk href="/penghuni/sewa" style={[ubin, { alignItems: 'center' }]}>
          <Gantungan nomor={k.id} kecil />
          <T v="kuat" style={{ textAlign: 'center' }}>Tipe {tipe.nama}</T>
          <T v="mini" style={{ textAlign: 'center' }}>Lantai {k.lantai} · {tipe.ukuran}</T>
        </Ketuk>
        <Ketuk href="/penghuni/sewa" style={ubin}>
          <T v="label">Sewa berakhir</T>
          <Text style={[F.judul, ANGKA, { fontSize: 22, lineHeight: 28, color: W.tinta }]}>{tgl(kon.berakhir)}</Text>
          <T v="kecil">{sisaBln} bulan lagi</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 'auto' }} aria-hidden>
            {Array.from({ length: kon.total }).map((_, i) => (
              <View key={i} style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: i < kon.bulanJalan ? W.bata : W.kapur, borderWidth: 1, borderColor: i < kon.bulanJalan ? W.bata : W.garisTua }} />
            ))}
          </View>
          <T v="mini">{kon.bulanJalan} dari {kon.total} bulan berjalan</T>
        </Ketuk>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {aktif.length ? (
          <Ketuk href="/penghuni/lapor" style={ubin}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="label">Perbaikan</T>
              <Ikon nama="obeng" ukuran={20} warna={W.bata} />
            </View>
            <T v="kuat" numberOfLines={3}>{aktif[0].judul}</T>
            <T v="mini">{aktif.length > 1 ? `+${aktif.length - 1} laporan lain · ` : ''}{relatif(aktif[0].diubah, data.kini)}</T>
            <View style={{ marginTop: 'auto', gap: 6 }}>
              <LangkahTiket tiket={aktif[0]} kini={data.kini} ringkas />
            </View>
          </Ketuk>
        ) : (
          <Ketuk href="/penghuni/lapor" style={[ubin, { backgroundColor: W.hijauMuda, borderColor: W.hijauMuda }]}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: W.hijau, alignItems: 'center', justifyContent: 'center' }}>
              <Ikon nama="centang" ukuran={24} warna={W.putih} tebal={2.6} />
            </View>
            <Text style={[F.judul, { fontSize: 22, lineHeight: 28, color: W.hijau }]}>Semua beres</Text>
            <T v="mini" warna={W.hijau}>Tidak ada kerusakan yang sedang dilaporkan{terakhir ? `; terakhir: ${terakhir.judul.toLowerCase()} (selesai)` : ''}.</T>
            <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <T v="kuat" warna={W.hijau}>Ada yang rusak? Lapor</T>
              <Ikon nama="kanan" ukuran={16} warna={W.hijau} tebal={2.2} />
            </View>
          </Ketuk>
        )}
        <Ketuk href="/penghuni/info" style={[ubin, { backgroundColor: W.kunyitMuda, borderColor: W.kunyitMuda }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="label" warna={W.coklat}>Pengumuman</T>
            <Ikon nama="toa" ukuran={20} warna={W.coklat} />
          </View>
          <T v="kuat" numberOfLines={3}>{info.judul}</T>
          <T v="mini" warna={W.coklat} style={{ marginTop: 'auto' }}>{info.hariLalu === 1 ? 'Kemarin' : `${info.hariLalu} hari lalu`} · {info.tag}</T>
        </Ketuk>
      </View>

      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14 }}>
        <Sosok av={darmo.av} ukuran={52} />
        <View style={{ flex: 1, gap: 2 }}>
          <Sub level={2} v="h3">Butuh bantuan?</Sub>
          <T v="mini">{darmo.nama}, {darmo.peran.toLowerCase()}. Layanan {String(KOS.jamBuka).padStart(2, '0')}.00–{KOS.jamTutup}.00 WIB.</T>
        </View>
        <Tombol href="/penghuni/sewa" jenis="gelap" ukuran="kecil" ikon="chat" label="Chat" aksesLabel={`Chat ${darmo.nama}`} />
      </View>
    </>
  );
}

const ubin = { flex: 1, minHeight: 196, backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 4 };
