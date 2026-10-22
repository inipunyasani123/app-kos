import { useState } from 'react';
import { View, Text } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, PENGELOLA, DEPOSIT, PEMBERITAHUAN_KELUAR, CHAT_CEPAT, TIPE } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, tambahBulan, jam, relatif, jamWib } from '../../lib/waktu';
import { KAMAR_BY } from '../../lib/hitung';
import { Layar, T, Sub, Tombol, Kartu, Kerangka, Lencana, Chip, GrupChip, BarisInfo } from '../../ui/dasar';
import { Gantungan, Sosok } from '../../ui/motif';
import { Ikon } from '../../ui/Ikon';
import { useKabar } from '../../ui/lapisan';

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
          Kamu mengajukan tambah {r.bulan} bulan {relatif(r.ts, data.kini)}. Kalau disetujui, kontrak berlaku sampai {tgl(tambahBulan(kon.mulai, kon.total + r.bulan) - 1)}.
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
        Kontrak baru berakhir <Text style={F.tebal}>{tgl(tambahBulan(kon.mulai, kon.total + bulan) - 1)}</Text>. Harga sewa tetap selama perpanjangan.
      </T>
      <Tombol label="Ajukan perpanjangan" ikon="ulang" onPress={() => { ajukanPerpanjang(bulan); kabar(`Pengajuan ${bulan} bulan terkirim ke ${KOS.pemilik}.`); }} />
    </Kartu>
  );
}

function Akhiri({ data }) {
  const { akhiri, batalAkhiri } = useToko();
  const kabar = useKabar();
  const kon = data.kontrak;
  const p = data.demo;
  const batas = data.hari + PEMBERITAHUAN_KELUAR;
  const pilihan = [];
  for (let j = 0; pilihan.length < 2 && j < 40; j++) {
    const akhir = tambahBulan(p.masuk, j + 1) - 1;
    if (akhir >= batas) pilihan.push(akhir);
  }
  const [tanggal, setTanggal] = useState(pilihan[0]);
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
        {pilihan.map((d) => (
          <Chip key={d} label={tgl(d)} aktif={tanggal === d} onPress={() => setTanggal(d)} kecil />
        ))}
      </GrupChip>
      <GrupChip label="Alasan">
        {['Pindah kerja atau kuliah selesai', 'Pindah ke tempat lain', 'Lainnya'].map((a) => (
          <Chip key={a} label={a} aktif={alasan === a} onPress={() => setAlasan(a)} kecil />
        ))}
      </GrupChip>
      <View style={{ backgroundColor: W.kapur, borderRadius: 12, padding: 10 }}>
        <BarisInfo label="Tagihan terakhir" nilai={`periode s.d. ${tgl(tanggal)}`} />
        <BarisInfo label="Deposit kembali" nilai={rupiah(DEPOSIT)} kuat />
      </View>
      <Tombol jenis="bahaya" label="Ajukan berhenti sewa" ikon="keluar" onPress={() => { akhiri(tanggal, alasan); kabar('Rencana keluar terkirim ke pengelola.'); }} />
    </Kartu>
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
              {m.ts ? <Text style={[F.teks, { fontSize: 11, color: saya ? '#FBE3DA' : W.abu, alignSelf: 'flex-end' }]}>{jam(m.ts)}</Text> : null}
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
          <T v="mini">{kon.bulanJalan} dari {kon.total} bulan berjalan · tagihan tiap tanggal {new Date(p.masuk * 864e5).getUTCDate()}</T>
        </View>
      </View>

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
