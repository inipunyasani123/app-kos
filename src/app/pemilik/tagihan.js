import { View, Text } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, DENDA } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, tglPendek, namaBulan, jam, hariKe } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Kerangka, Lencana } from '../../ui/dasar';
import { Sosok } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { lencanaTagihan, METODE } from '../../ui/kos';
import { useLembar, useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Status Bayar Semua Penghuni Kos · Grendel',
    deskripsi: 'Pemilik kos memantau status bayar tiap penghuni (lunas, belum jatuh tempo, tenggang, telat dengan denda), mengirim pengingat, dan mencatat bayar tunai.',
    path: '/pemilik/tagihan',
  });
}

const URUTAN = { telat: 0, tenggang: 1, hariIni: 2, segera: 3, lunas: 4 };

export default function StatusBayar() {
  const { data } = useToko();
  return (
    <Layar judul="Status bayar" sub="Periode berjalan setiap penghuni, diurutkan dari yang paling mendesak.">
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={150} />
          <Kerangka tinggi={420} />
        </>
      )}
    </Layar>
  );
}

function pesanPengingat(p) {
  const t = p.tagihan;
  const telat = t.status === 'telat' || t.status === 'tenggang';
  return `Halo ${p.panggil}, tagihan Kamar ${p.kamar} periode ${namaBulan(t.jatuh)} sebesar ${rupiah(t.total)} ${telat ? `sudah lewat jatuh tempo ${t.telat} hari` : `jatuh tempo ${tgl(t.jatuh)}`}. Bisa dibayar lewat menu Tagihan di aplikasi Grendel. Terima kasih. (${KOS.pemilik})`;
}

function PratinjauPengingat({ daftar, hari }) {
  const { ingatkan } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  return (
    <>
      <T v="kecil">Pesan ini masuk sebagai notifikasi di aplikasi penghuni. Contoh untuk {daftar[0].panggil}:</T>
      <View style={{ backgroundColor: W.kertas, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: W.garis }}>
        <T v="teks">{pesanPengingat(daftar[0])}</T>
      </View>
      <View style={{ gap: 6 }}>
        <T v="label">Penerima ({daftar.length})</T>
        {daftar.map((p) => (
          <View key={p.kamar} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Sosok av={p.av} ukuran={30} />
            <T v="kecil" warna={W.tinta} style={{ flex: 1 }}>{p.nama} · Kamar {p.kamar}</T>
            <Lencana {...lencanaTagihan(p.tagihan, hari)} />
          </View>
        ))}
      </View>
      <Tombol
        label={`Kirim ke ${daftar.length} penghuni`}
        ikon="kirim"
        ukuran="besar"
        penuh
        onPress={() => {
          ingatkan(daftar.map((p) => p.kamar));
          lembar.tutup();
          kabar(`Pengingat terkirim ke ${daftar.length} penghuni.`);
        }}
      />
    </>
  );
}

function Isi({ data }) {
  const { ingatkan, bayar } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  const urut = [...data.penghuni].sort((a, b) => URUTAN[a.tagihan.status] - URUTAN[b.tagihan.status] || a.tagihan.jatuh - b.tagihan.jatuh);
  const hitung = (s) => data.penghuni.filter((p) => s.includes(p.tagihan.status)).length;
  const belum = urut.filter((p) => p.tagihan.status !== 'lunas' && p.tagihan.status !== 'segera');
  const belumSemua = urut.filter((p) => p.tagihan.status !== 'lunas');
  const kotak = [
    { label: 'Telat', n: hitung(['telat']), latar: W.bataMuda, warna: W.bataTua },
    { label: 'Tenggang & hari ini', n: hitung(['tenggang', 'hariIni']), latar: W.kunyitMuda, warna: W.coklat },
    { label: 'Belum jatuh tempo', n: hitung(['segera']), latar: '#EAE0D0', warna: W.abu },
    { label: 'Lunas', n: hitung(['lunas']), latar: W.hijauMuda, warna: W.hijau },
  ];
  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {kotak.map((k) => (
          <View key={k.label} style={{ width: '47.5%', flexGrow: 1, backgroundColor: k.latar, borderRadius: 18, padding: 12 }}>
            <Text style={[F.pekat, ANGKA, { fontSize: 28, lineHeight: 34, color: k.warna }]}>{k.n}</Text>
            <Text style={[F.sedang, { fontSize: 13, color: k.warna }]}>{k.label}</Text>
          </View>
        ))}
      </View>
      {belumSemua.length ? (
        <Tombol
          label={`Ingatkan semua yang belum bayar (${(belum.length ? belum : belumSemua).length})`}
          ikon="lonceng"
          penuh
          onPress={() => lembar.buka({ judul: 'Kirim pengingat', isi: <PratinjauPengingat daftar={belum.length ? belum : belumSemua} hari={data.hari} /> })}
        />
      ) : null}
      <View style={{ gap: 10 }}>
        <Sub level={2} v="h3">Penghuni ({urut.length})</Sub>
        {urut.map((p) => {
          const t = p.tagihan;
          const l = lencanaTagihan(t, data.hari);
          const lunas = t.status === 'lunas';
          return (
            <View key={p.kamar} style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: t.status === 'telat' ? W.bata : W.garis, padding: 12, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Sosok av={p.av} ukuran={42} />
                <View style={{ flex: 1, gap: 1 }}>
                  <T v="kuat" numberOfLines={1}>{p.nama}</T>
                  <T v="mini">Kamar {p.kamar} · jatuh tempo {tglPendek(t.jatuh)}</T>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <T v="kuat" style={ANGKA}>{rupiah(t.total)}</T>
                  <Lencana {...l} />
                </View>
              </View>
              {t.denda && !lunas ? (
                <T v="mini" warna={W.bataTua}>
                  Denda {rupiah(t.denda)}: {t.telat} hari telat − {DENDA.tenggang} hari tenggang = {t.telat - DENDA.tenggang} × {rupiah(DENDA.perHari)}
                </T>
              ) : null}
              {lunas ? (
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Ikon nama="centang" ukuran={16} warna={W.hijau} tebal={2.4} />
                  <T v="mini">Dibayar {tgl(hariKe(t.bayar.ts))} lewat {METODE[t.bayar.metode]} · berikutnya {tglPendek(p.berikut.jatuh)}</T>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Tombol
                    ukuran="kecil"
                    jenis={p.ingat ? 'garis' : 'gelap'}
                    ikon="lonceng"
                    label={p.ingat ? `Diingatkan ${jam(p.ingat)}` : 'Ingatkan'}
                    aksesLabel={`Ingatkan ${p.nama}`}
                    onPress={() => {
                      ingatkan([p.kamar]);
                      kabar(`Pengingat terkirim ke ${p.panggil}.`);
                    }}
                  />
                  <Tombol
                    ukuran="kecil"
                    jenis="garis"
                    ikon="dompet"
                    label="Catat tunai"
                    aksesLabel={`Catat bayar tunai ${p.nama}`}
                    onPress={() => {
                      bayar(p.kamar, t.j, 'tunai', t.sewa + t.parkir, t.jatuh);
                      kabar(`Pembayaran tunai ${p.panggil} dicatat, kuitansi terbit.`);
                    }}
                  />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </>
  );
}
