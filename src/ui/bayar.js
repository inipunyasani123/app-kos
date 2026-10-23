import { View, Text } from 'react-native';
import { W, F, ANGKA } from '../lib/tema';
import { KOS, DENDA, TIPE } from '../lib/data';
import { KAMAR_BY } from '../lib/hitung';
import { useToko } from '../lib/toko';
import { rupiah } from '../lib/uang';
import { tgl, tglPendek, hariKe, jam, namaBulan } from '../lib/waktu';
import { T, Sub, Tombol, Lencana, BarisInfo } from './dasar';
import { Sosok } from './motif';
import { lencanaTagihan, METODE, RiwayatKetepatan } from './kos';
import { useLembar, useKabar } from './lapisan';

// Empat kelompok status bayar. Dipakai bersama oleh batang Ringkas dan ubin/bagian tab Bayar.
export const GRUP = [
  { id: 'telat', label: 'Telat', latar: W.bataMuda, warna: W.bataTua, batang: W.bata },
  { id: 'tenggang', label: 'Tenggang & hari ini', latar: W.kunyitMuda, warna: W.coklat, batang: W.kunyit },
  { id: 'segera', label: 'Belum jatuh tempo', latar: '#EAE0D0', warna: W.abu, batang: '#9C8F7E' },
  { id: 'lunas', label: 'Lunas', latar: W.hijauMuda, warna: W.hijau, batang: W.hijau },
];

/** Keterangan hari yang ringkas untuk baris status bayar. */
export function ketHari(p, hari) {
  const t = p.tagihan;
  if (t.status === 'lunas') return `lunas ${tglPendek(hariKe(t.bayar.ts))}`;
  if (t.status === 'telat') return `telat ${t.telat} hari`;
  if (t.status === 'tenggang') return `tenggang, hari ke-${t.telat}`;
  if (t.status === 'hariIni') return 'jatuh tempo hari ini';
  return `${t.jatuh - hari} hari lagi`;
}

export function pesanPengingat(p) {
  const t = p.tagihan;
  const lewat = t.status === 'telat' || t.status === 'tenggang';
  return `Halo ${p.panggil}, tagihan Kamar ${p.kamar} untuk sewa ${tglPendek(t.jatuh)} – ${tglPendek(t.akhir)} sebesar ${rupiah(t.total)} ${lewat ? `sudah lewat jatuh tempo ${t.telat} hari` : t.status === 'hariIni' ? 'jatuh tempo hari ini' : `jatuh tempo ${tgl(t.jatuh)}`}. Bisa dibayar lewat menu Tagihan di aplikasi Grendel. Terima kasih. (${KOS.pemilik})`;
}

/** Penghuni yang perlu diingatkan: sudah lewat/jatuh tempo hari ini dulu, lalu yang belum jatuh tempo. */
export function perluDiingatkan(kelompok) {
  const mendesak = [...kelompok.telat, ...kelompok.tenggang];
  return mendesak.length ? mendesak : kelompok.segera;
}

export function PratinjauPengingat({ daftar, hari }) {
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
            <Sosok av={p.av} ukuran={32} />
            <T v="kecil" warna={W.tinta} style={{ flex: 1 }}>
              {p.nama} · Kamar {p.kamar}
            </T>
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

/** Rincian satu penghuni (lembar bawah dari tab Bayar dan denah kamar). Membaca data langsung dari toko. */
export function RincianPenghuni({ kamar }) {
  const { data, ingatkan, bayar } = useToko();
  const kabar = useKabar();
  const p = data.penghuniBy[kamar];
  if (!p) return null;
  const t = p.tagihan;
  const k = KAMAR_BY[kamar];
  const lunas = t.status === 'lunas';
  const kontrak = p.demo ? data.kontrak : p.kontrak;
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Sosok av={p.av} ukuran={52} />
        <View style={{ flex: 1, gap: 1 }}>
          <T v="kuat">{p.nama}</T>
          <T v="mini">
            {p.kerja} · Kamar {kamar} · Tipe {TIPE[k.tipe].nama}
          </T>
        </View>
      </View>

      <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: t.status === 'telat' ? W.bata : W.garis, padding: 14, gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <T v="label">Sewa {tglPendek(t.jatuh)} – {tglPendek(t.akhir)}</T>
          <Lencana {...lencanaTagihan(t, data.hari)} />
        </View>
        <BarisInfo label={`Sewa + parkir`} nilai={rupiah(t.sewa + t.parkir)} />
        {t.denda ? <BarisInfo label="Denda telat" nilai={rupiah(t.denda)} warna={W.bataTua} /> : null}
        <BarisInfo label={lunas ? 'Dibayar' : 'Total ditagih'} nilai={rupiah(t.total)} kuat />
        {t.denda && !lunas ? (
          <T v="mini" warna={W.bataTua}>
            {t.telat} hari telat − {DENDA.tenggang} hari tenggang = {t.telat - DENDA.tenggang} × {rupiah(DENDA.perHari)}
            {t.denda === DENDA.maks ? ` (dibatasi ${rupiah(DENDA.maks)})` : ''}
          </T>
        ) : null}
        <T v="mini">
          {lunas
            ? `Lunas ${tgl(hariKe(t.bayar.ts))} lewat ${METODE[t.bayar.metode]}. Berikutnya ${tglPendek(p.berikut.jatuh)}.`
            : `Jatuh tempo ${tgl(t.jatuh)}${p.ingat ? ` · diingatkan ${jam(p.ingat)} WIB` : ''}.`}
        </T>
      </View>

      {!lunas ? (
        <View style={{ gap: 8 }}>
          <T v="label">Pratinjau pengingat</T>
          <View style={{ backgroundColor: W.kertas, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: W.garis }}>
            <T v="kecil" warna={W.tinta}>{pesanPengingat(p)}</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            <Tombol
              ukuran="kecil"
              jenis={p.ingat ? 'garis' : 'utama'}
              ikon="lonceng"
              label={p.ingat ? `Ingatkan lagi` : 'Kirim pengingat'}
              aksesLabel={`Kirim pengingat ke ${p.nama}`}
              onPress={() => {
                ingatkan([p.kamar]);
                kabar(`Pengingat terkirim ke ${p.panggil}.`);
              }}
            />
            <Tombol
              ukuran="kecil"
              jenis="garis"
              ikon="dompet"
              label="Catat bayar tunai"
              aksesLabel={`Catat bayar tunai ${p.nama}`}
              onPress={() => {
                bayar(p.kamar, t.j, 'tunai', t.sewa + t.parkir, t.jatuh);
                kabar(`Pembayaran tunai ${p.panggil} dicatat, kuitansi terbit.`);
              }}
            />
          </View>
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Tombol ukuran="kecil" jenis="hijau" ikon="chat" label="WhatsApp" aksesLabel={`Kirim WhatsApp ke ${p.nama} (simulasi)`} onPress={() => kabar('Simulasi: nomor penghuni disembunyikan di demo.')} style={{ flex: 1 }} />
        <Tombol ukuran="kecil" jenis="garis" ikon="telepon" label="Telepon" aksesLabel={`Telepon ${p.nama} (simulasi)`} onPress={() => kabar('Simulasi: nomor penghuni disembunyikan di demo.')} style={{ flex: 1 }} />
      </View>

      <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 4 }}>
        <Sub level={3} v="h3">Kontrak</Sub>
        <BarisInfo label="Mulai" nilai={tgl(kontrak.mulai)} />
        <BarisInfo label="Berakhir" nilai={tgl(kontrak.berakhir)} kuat />
        <BarisInfo label="Deposit" nilai={rupiah(p.kontrak.deposit)} />
      </View>

      <View style={{ backgroundColor: W.kertas, borderRadius: 18, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 8 }}>
        <Sub level={3} v="h3">Ketepatan bayar 12 bulan</Sub>
        <RiwayatKetepatan ketepatan={p.ketepatan} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }} aria-hidden>
          {[
            [W.hijau, 'Tepat'],
            [W.kunyit, 'Tenggang'],
            [W.bata, 'Telat'],
          ].map(([w, l]) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: w }} />
              <Text style={[F.sedang, { fontSize: 12, color: W.abu }]}>{l}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

