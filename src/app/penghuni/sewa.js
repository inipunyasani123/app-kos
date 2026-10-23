import { useState } from 'react';
import { View, Text } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, PENGELOLA, DEPOSIT, PEMBERITAHUAN_KELUAR, CHAT_CEPAT, TIPE, INVENTARIS_07, POTONGAN, DENDA, PARKIR, ATURAN } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah, terbilang } from '../../lib/uang';
import { tgl, jam, relatif, jamWib } from '../../lib/waktu';
import { KAMAR_BY, tglPeriode } from '../../lib/hitung';
import { Layar, T, Sub, Tombol, Kartu, Kerangka, Lencana, Chip, GrupChip, BarisInfo, Ketuk, Garis } from '../../ui/dasar';
import { Gantungan, Sosok, Gerigi, Stempel } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { useKabar, useLembar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Kontrak Sewa Kos, Perpanjang, dan Kontak · Grendel',
    deskripsi: 'Kontrak sewa kamar kos: tanggal mulai dan berakhir, ajukan perpanjangan 3–12 bulan, rencana berhenti dengan pemberitahuan 30 hari, dan obrolan pengelola.',
    path: '/penghuni/sewa',
  });
}

export default function Sewa() {
  const { data } = useToko();
  return (
    <Layar judul="Sewa & kontak" sub="Kontrak, perpanjangan, dan pengelola kos.">
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={250} />
          <Kerangka tinggi={220} />
        </>
      )}
    </Layar>
  );
}

function Perpanjang({ data }) {
  const { ajukanPerpanjang, batalPerpanjang } = useToko();
  const kabar = useKabar();
  const [bulan, setBulan] = useState(6);
  const kon = data.kontrak;
  const r = kon.perpanjang;
  if (r && r.status === 'menunggu')
    return (
      <Kartu style={{ gap: 10 }}>
        <Sub level={2} v="h3">Perpanjang sewa</Sub>
        <Lencana teks={`Menunggu persetujuan ${KOS.pemilik}`} warna="kunyit" ikon="jam" />
        <T v="kecil">
          Kamu mengajukan tambah {r.bulan} bulan {relatif(r.ts, data.kini)}. Kalau disetujui, kontrak berlaku sampai {tgl(tglPeriode(data.demo, kon.total + r.bulan) - 1)}.
        </T>
        <T v="mini">Coba setujui sendiri lewat mode Pemilik → Ringkas.</T>
        <Tombol jenis="garis" ukuran="kecil" label="Batalkan pengajuan" onPress={() => { batalPerpanjang(); kabar('Pengajuan perpanjangan dibatalkan.'); }} />
      </Kartu>
    );
  return (
    <Kartu style={{ gap: 10 }}>
      <Sub level={2} v="h3">Perpanjang sewa</Sub>
      {r && r.status === 'disetujui' ? <Lencana teks={`Disetujui: +${r.bulan} bulan`} warna="hijau" ikon="centang" /> : null}
      {r && r.status === 'ditolak' ? <Lencana teks="Pengajuan terakhir ditolak" warna="bata" /> : null}
      <GrupChip label="Lama perpanjangan">
        {[3, 6, 12].map((b) => (
          <Chip key={b} label={`${b} bulan`} aktif={bulan === b} onPress={() => setBulan(b)} />
        ))}
      </GrupChip>
      <T v="kecil">
        Kontrak baru berakhir <Text style={F.tebal}>{tgl(tglPeriode(data.demo, kon.total + bulan) - 1)}</Text>. Harga sewa tetap selama perpanjangan.
      </T>
      <Tombol label="Ajukan perpanjangan" ikon="ulang" onPress={() => { ajukanPerpanjang(bulan); kabar(`Pengajuan ${bulan} bulan terkirim ke ${KOS.pemilik}.`); }} />
    </Kartu>
  );
}

function Akhiri({ data }) {
  const { akhiri, batalAkhiri } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  const kon = data.kontrak;
  const p = data.demo;
  const batas = data.hari + PEMBERITAHUAN_KELUAR;
  const pilihan = [];
  for (let j = 0; pilihan.length < 2 && j < 40; j++) {
    const akhir = tglPeriode(p, j + 1) - 1;
    if (akhir >= batas) pilihan.push(akhir);
  }
  const [pilihIdx, setPilihIdx] = useState(0);
  const tanggal = pilihan[pilihIdx] ?? pilihan[0];
  const [alasan, setAlasan] = useState('Pindah kerja atau kuliah selesai');
  if (kon.akhiri)
    return (
      <Kartu style={{ gap: 10, borderColor: W.bata }}>
        <Sub level={2} v="h3">Rencana berhenti sewa</Sub>
        <Lencana teks={`Keluar ${tgl(kon.akhiri.hari)}`} warna="bata" ikon="keluar" />
        <T v="kecil">
          Alasan: {kon.akhiri.alasan.toLowerCase()}. {KOS.pengelola} akan cek kamar di hari terakhir; deposit {rupiah(DEPOSIT)} kembali paling lambat 7 hari setelahnya.
        </T>
        <Tombol jenis="garis" ukuran="kecil" label="Batalkan rencana" onPress={() => { batalAkhiri(); kabar('Rencana berhenti sewa dibatalkan.'); }} />
      </Kartu>
    );
  return (
    <Kartu style={{ gap: 10 }}>
      <Sub level={2} v="h3">Berhenti sewa</Sub>
      <T v="kecil">Beri tahu paling lambat {PEMBERITAHUAN_KELUAR} hari sebelumnya. Tanggal keluar mengikuti akhir periode sewa.</T>
      <GrupChip label="Tanggal keluar">
        {pilihan.map((d, i) => (
          <Chip key={d} label={tgl(d)} aktif={tanggal === d} onPress={() => setPilihIdx(i)} kecil />
        ))}
      </GrupChip>
      <GrupChip label="Alasan">
        {['Pindah kerja atau kuliah selesai', 'Pindah ke tempat lain', 'Lainnya'].map((a) => (
          <Chip key={a} label={a} aktif={alasan === a} onPress={() => setAlasan(a)} kecil />
        ))}
      </GrupChip>
      <View style={{ backgroundColor: W.kapur, borderRadius: 12, padding: 10 }}>
        <BarisInfo label="Tagihan terakhir" nilai={`periode s.d. ${tgl(tanggal)}`} />
        <BarisInfo label="Deposit" nilai={rupiah(DEPOSIT)} />
        <BarisInfo label="Potongan kerusakan baru" nilai="Rp0 (belum ada)" />
        <BarisInfo label="Perkiraan deposit kembali" nilai={rupiah(DEPOSIT)} kuat />
        <T v="mini">Saat keluar, kamar dicek bersama {KOS.pengelola} dan dibandingkan dengan berita acara serah kunci. Kondisi yang sudah tercatat tidak dipotong.</T>
      </View>
      <Tombol jenis="teks" ukuran="kecil" ikon="nota" label="Lihat berita acara serah kunci" onPress={() => lembar.buka({ judul: 'Berita acara serah kunci', isi: <BeritaAcara p={p} /> })} />
      <Tombol jenis="bahaya" label="Ajukan berhenti sewa" ikon="keluar" onPress={() => { akhiri(tanggal, alasan); kabar('Rencana keluar terkirim ke pengelola.'); }} />
    </Kartu>
  );
}

function KepalaDokumen({ judul, no }) {
  return (
    <View style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <Text style={[F.judul, { fontSize: 18, letterSpacing: 1, color: W.tinta, flex: 1 }]}>{judul}</Text>
        <T v="mini">{no}</T>
      </View>
      <T v="mini">{KOS.nama} · {KOS.wilayah}</T>
      <Garis style={{ marginTop: 6 }} />
    </View>
  );
}

function Kontrak({ p, kon }) {
  const kabar = useKabar();
  const tipe = TIPE.tegel;
  const pasal = [
    ['Sewa & tagihan', `Sewa ${rupiah(tipe.harga)} per bulan, parkir motor ${rupiah(PARKIR)}. Ditagih tiap tanggal ${new Date(p.fokus * 864e5).getUTCDate()}, terbit 7 hari sebelumnya.`],
    ['Denda telat', `Tenggang ${DENDA.tenggang} hari. Setelah itu ${rupiah(DENDA.perHari)} per hari, paling banyak ${rupiah(DENDA.maks)}.`],
    ['Perbaikan', 'Kerusakan karena pemakaian wajar ditanggung pemilik. Lapor lewat aplikasi; kerusakan karena kelalaian ditanggung penyewa.'],
    ['Tata tertib', `${ATURAN.length} aturan kos berlaku, termasuk jam tamu dan jam tenang (lihat menu Info).`],
    ['Keluar & deposit', `Pemberitahuan paling lambat ${PEMBERITAHUAN_KELUAR} hari. Deposit ${rupiah(DEPOSIT)} kembali paling lambat 7 hari setelah cek kamar.`],
  ];
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: W.garis }}>
      <KepalaDokumen judul="PERJANJIAN SEWA KAMAR" no={`PSK/${String(new Date(kon.mulai * 864e5).getUTCFullYear()).slice(2)}/07`} />
      <BarisInfo label="Pemilik" nilai={KOS.pemilikLengkap} />
      <BarisInfo label="Penyewa" nilai={p.nama} />
      <BarisInfo label="Kamar" nilai={`07 · Tipe Tegel · lantai 2`} />
      <BarisInfo label="Masa sewa" nilai={`${tgl(kon.mulai)} – ${tgl(kon.berakhir)}`} kuat />
      {pasal.map(([j, isi], i) => (
        <View key={j} style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={[F.judul, { width: 22, fontSize: 15, color: W.bata }]}>{i + 1}.</Text>
          <View style={{ flex: 1 }}>
            <T v="kuat">{j}</T>
            <T v="kecil">{isi}</T>
          </View>
        </View>
      ))}
      <T v="mini">Ditandatangani kedua pihak pada {tgl(kon.mulai)}. Dokumen ini contoh rekaan.</T>
      <Tombol jenis="gelap" ikon="nota" label="Unduh PDF (simulasi)" onPress={() => kabar('Simulasi: PDF kontrak tersimpan di perangkat.')} />
    </View>
  );
}

function BeritaAcara({ p }) {
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: W.garis }}>
      <KepalaDokumen judul="BERITA ACARA SERAH KUNCI" no="BA/07" />
      <T v="kecil">Kamar 07 diserahkan kepada {p.nama} pada {tgl(p.masuk)}, diperiksa bersama {KOS.pengelola}.</T>
      <View role="table" aria-label="Inventaris dan kondisi kamar saat masuk">
        {INVENTARIS_07.map((x) => (
          <View key={x.barang} role="row" style={{ flexDirection: 'row', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: W.garis }}>
            <Text role="cell" style={[F.sedang, { flex: 1, fontSize: 14, lineHeight: 19, color: W.tinta }]}>{x.barang}</Text>
            <Text role="cell" style={[F.teks, { flex: 1, fontSize: 13.5, lineHeight: 19, color: x.kondisi.startsWith('Baik') || x.kondisi === 'Menyala' ? W.hijau : W.coklat }]}>{x.kondisi}</Text>
          </View>
        ))}
      </View>
      <T v="kuat">Potongan deposit saat keluar</T>
      {POTONGAN.map((x) => (
        <BarisInfo key={x.label} label={x.label} nilai={x.nominal ? `${rupiah(x.nominal)} ${x.satuan}` : x.satuan} />
      ))}
      <T v="mini">Engsel lemari yang longgar sejak masuk sudah diganti lewat laporan T-0398, jadi tidak dihitung kerusakan.</T>
    </View>
  );
}

function KuitansiDeposit({ p }) {
  return (
    <View>
      <Gerigi />
      <View style={{ backgroundColor: W.kertas, padding: 16, gap: 8 }}>
        <KepalaDokumen judul="KUITANSI DEPOSIT" no="UK/DEP/07" />
        <BarisInfo label="Sudah terima dari" nilai={p.nama} />
        <BarisInfo label="Untuk" nilai="Deposit Kamar 07" />
        <T v="kecil" style={{ fontStyle: 'italic' }}>{terbilang(DEPOSIT)}</T>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[F.judul, ANGKA, { fontSize: 26, color: W.tinta }]}>{rupiah(DEPOSIT)}</Text>
          <Stempel kecil tanggal={tgl(p.masuk).toUpperCase()} />
        </View>
        <T v="mini">Dibayar {tgl(p.masuk)}. Dikembalikan saat keluar setelah kamar dicek.</T>
      </View>
      <Gerigi bawah />
    </View>
  );
}

function Dokumen({ data }) {
  const lembar = useLembar();
  const p = data.demo;
  const daftar = [
    { judul: 'Perjanjian sewa kamar', ket: `PDF simulasi · ${tgl(data.kontrak.mulai)}`, ikon: 'nota', isi: <Kontrak p={p} kon={data.kontrak} /> },
    { judul: 'Berita acara serah kunci', ket: `${INVENTARIS_07.length} barang dicek · acuan deposit`, ikon: 'kunci', isi: <BeritaAcara p={p} /> },
    { judul: 'Kuitansi deposit', ket: `${rupiah(DEPOSIT)} · ${tgl(p.masuk)}`, ikon: 'dompet', isi: <KuitansiDeposit p={p} /> },
  ];
  return (
    <View style={{ gap: 10 }}>
      <Sub level={2} v="h3">Dokumen</Sub>
      <View style={{ backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, overflow: 'hidden' }}>
        {daftar.map((d, i) => (
          <Ketuk
            key={d.judul}
            onPress={() => lembar.buka({ judul: d.judul, isi: d.isi })}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, minHeight: 64, borderTopWidth: i ? 1 : 0, borderTopColor: W.garis }}
          >
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: W.kapur, alignItems: 'center', justifyContent: 'center' }}>
              <Ikon nama={d.ikon} ukuran={20} warna={W.bata} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="kuat">{d.judul}</T>
              <T v="mini">{d.ket}</T>
            </View>
            <Ikon nama="kanan" ukuran={18} warna={W.abu} />
          </Ketuk>
        ))}
      </View>
    </View>
  );
}

function Obrolan({ data }) {
  const { kirimChat } = useToko();
  const pesan = [{ dari: 'darmo', teks: `Halo Mbak Laras, ada yang bisa dibantu? Saya standby ${String(KOS.jamBuka).padStart(2, '0')}.00–${KOS.jamTutup}.00 WIB.`, ts: null }, ...data.chat];
  const { h } = jamWib(data.kini);
  const buka = h >= KOS.jamBuka && h < KOS.jamTutup;
  return (
    <Kartu style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Sosok av={PENGELOLA[0].av} ukuran={40} />
        <View style={{ flex: 1 }}>
          <Sub level={2} v="h3">Obrolan dengan {PENGELOLA[0].nama}</Sub>
          <T v="mini">{buka ? 'Dalam jam layanan' : 'Di luar jam layanan, balasan bisa besok pagi'}</T>
        </View>
      </View>
      <View style={{ gap: 8 }} aria-live="polite">
        {pesan.map((m, i) => {
          const saya = m.dari === 'saya';
          return (
            <View key={i} style={{ alignSelf: saya ? 'flex-end' : 'flex-start', maxWidth: '84%', backgroundColor: saya ? W.bata : W.kapur, borderRadius: 16, borderBottomRightRadius: saya ? 4 : 16, borderBottomLeftRadius: saya ? 16 : 4, paddingHorizontal: 12, paddingVertical: 8 }}>
              <Text style={[F.teks, { fontSize: 14, lineHeight: 20, color: saya ? W.putih : W.tinta }]}>{m.teks}</Text>
              {m.ts ? <Text style={[F.teks, { fontSize: 12, color: saya ? '#FBE3DA' : W.abu, alignSelf: 'flex-end' }]}>{jam(m.ts)}</Text> : null}
            </View>
          );
        })}
      </View>
      <T v="label">Kirim cepat</T>
      <GrupChip label="Pesan cepat">
        {CHAT_CEPAT.map((c, i) => (
          <Chip key={i} peran="button" label={c.tanya} onPress={() => kirimChat(i)} kecil />
        ))}
      </GrupChip>
      <T v="mini">Nomor telepon pengelola tidak ditampilkan di demo ini.</T>
    </Kartu>
  );
}

function Isi({ data }) {
  const p = data.demo;
  const kon = data.kontrak;
  const k = KAMAR_BY[p.kamar];
  const tipe = TIPE[k.tipe];
  return (
    <>
      <View style={{ flexDirection: 'row', gap: 14, backgroundColor: W.kertas, borderRadius: 24, borderWidth: 1, borderColor: W.garis, padding: 14, alignItems: 'center' }}>
        <Gantungan nomor={k.id} />
        <View style={{ flex: 1, gap: 4 }}>
          <T v="label">Kontrak {kon.total} bulan</T>
          <BarisInfo label="Mulai" nilai={tgl(kon.mulai)} style={{ paddingVertical: 2 }} />
          <BarisInfo label="Berakhir" nilai={tgl(kon.berakhir)} kuat style={{ paddingVertical: 2 }} />
          <BarisInfo label="Sewa" nilai={`${rupiah(tipe.harga)}/bln`} style={{ paddingVertical: 2 }} />
          <BarisInfo label="Deposit" nilai={rupiah(DEPOSIT)} style={{ paddingVertical: 2 }} />
          <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }} role="img" aria-label={`${kon.bulanJalan} dari ${kon.total} bulan berjalan`}>
            {Array.from({ length: kon.total }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 8, borderRadius: 3, backgroundColor: i < kon.bulanJalan ? W.bata : W.garis }} />
            ))}
          </View>
          <T v="mini">{kon.bulanJalan} dari {kon.total} bulan berjalan · tagihan tiap tanggal {new Date(p.fokus * 864e5).getUTCDate()}</T>
        </View>
      </View>

      <Dokumen data={data} />
      <Perpanjang data={data} />
      <Akhiri data={data} />

      <View style={{ gap: 10 }}>
        <Sub level={2} v="h3">Pengelola</Sub>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {PENGELOLA.map((o) => (
            <View key={o.id} style={{ flex: 1, backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 12, gap: 6, alignItems: 'flex-start' }}>
              <Sosok av={o.av} ukuran={48} />
              <T v="kuat">{o.nama}</T>
              <T v="mini">{o.peran}</T>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Ikon nama="telepon" ukuran={14} warna={W.abu} />
                <T v="mini">Nomor disembunyikan</T>
              </View>
            </View>
          ))}
        </View>
      </View>

      <Obrolan data={data} />
    </>
  );
}
