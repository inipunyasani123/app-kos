import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Platform, Animated, Easing, AccessibilityInfo, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah } from '../../lib/uang';
import { tgl, tglPendek, namaBulan, hariTgl, jarakHari, hariKe, jam } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Kartu, Kerangka, Lencana, BarisInfo } from '../../ui/dasar';
import { Ikon } from '../../ui/Ikon';
import { QrSimulasi, Stempel, Tegel, Gantungan, Gerigi } from '../../ui/motif';
import { Kuitansi, METODE } from '../../ui/kos';
import { useKabar, useLembar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Bayar Sewa Kos lewat QRIS atau Transfer · Grendel',
    deskripsi: 'Simulasi pembayaran sewa kos: pilih QRIS atau transfer ke virtual account, konfirmasi, lalu kuitansi bercap lunas langsung tersimpan di riwayat.',
    path: '/penghuni/bayar',
  });
}

export default function Bayar() {
  const { data } = useToko();
  return (
    <Layar kembali="/penghuni/tagihan" kembaliLabel="Tagihan" judul="Bayar sewa">
      {data ? <Alur data={data} /> : <Kerangka tinggi={420} />}
    </Layar>
  );
}

const PILIHAN = [
  { id: 'qris', judul: 'QRIS', isi: 'Pindai dengan aplikasi bank atau dompet digital apa pun.', ikon: 'qr' },
  { id: 'transfer', judul: 'Transfer bank', isi: 'Ke nomor virtual account khusus Kamar 07, dicek otomatis.', ikon: 'bank' },
];

function HitungMundur({ detik }) {
  const [sisa, setSisa] = useState(detik);
  useEffect(() => {
    const t = setInterval(() => setSisa((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const m = String(Math.floor(sisa / 60)).padStart(2, '0');
  const s = String(sisa % 60).padStart(2, '0');
  return <Text style={[F.tebal, ANGKA, { fontSize: 14, color: W.bataTua }]}>Berlaku {m}.{s}</Text>;
}

/** Layar hasil: kuitansi mini tergantung pada gantungan kunci kamar + stempel LUNAS yang dicap sekali. */
function LayarLunas({ p, per, rec, pengingat }) {
  const { setPengingat } = useToko();
  const lembar = useLembar();
  const kabar = useKabar();
  const cap = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let batal = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((kurangi) => {
        if (batal) return;
        if (kurangi) cap.setValue(1);
        else Animated.timing(cap, { toValue: 1, duration: 420, delay: 180, easing: Easing.out(Easing.back(1.6)), useNativeDriver: Platform.OS !== 'web' }).start();
      })
      .catch(() => cap.setValue(1));
    return () => {
      batal = true;
    };
  }, [cap]);
  const bagikan = async () => {
    const teks = `Kuitansi ${rec.no}: ${p.nama}, sewa Kamar ${p.kamar} ${tglPendek(per.jatuh)} – ${tgl(per.akhir)}, ${rupiah(rec.total)}, lunas ${tgl(hariKe(rec.ts))} ${jam(rec.ts)} WIB.`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
        await navigator.clipboard?.writeText(teks);
        kabar('Ringkasan kuitansi disalin.');
      } else await Share.share({ message: teks });
    } catch {
      kabar('Tidak bisa membagikan dari peramban ini.');
    }
  };
  const skala = cap.interpolate({ inputRange: [0, 1], outputRange: [1.6, 1] });
  return (
    <>
      <View aria-live="polite" style={{ alignItems: 'center', gap: 2 }}>
        <Text style={[F.judul, { fontSize: 26, lineHeight: 32, color: W.hijau, textAlign: 'center' }]}>Pembayaran diterima</Text>
        <T v="kecil" style={{ textAlign: 'center' }}>Tagihan {namaBulan(per.jatuh, false)} lunas. {KOS.pemilik} juga melihatnya di mode pemilik.</T>
      </View>
      <View style={{ alignItems: 'center' }}>
        <View style={{ zIndex: 2, marginBottom: -46, transform: [{ rotate: '-6deg' }] }}>
          <Gantungan nomor={p.kamar} kecil />
        </View>
        <View style={{ alignSelf: 'stretch' }}>
          <Gerigi />
          <View style={{ backgroundColor: W.kertas, paddingHorizontal: 18, paddingTop: 54, paddingBottom: 16, gap: 8 }}>
            <Text style={[F.judul, ANGKA, { fontSize: 38, lineHeight: 46, color: W.tinta, textAlign: 'center' }]}>{rupiah(rec.total)}</Text>
            <BarisInfo label="Untuk" nilai={`Sewa ${tglPendek(per.jatuh)} – ${tglPendek(per.akhir)}`} />
            <BarisInfo label="Lewat" nilai={METODE[rec.metode]} />
            <BarisInfo label="Waktu" nilai={`${tglPendek(hariKe(rec.ts))}, ${jam(rec.ts)} WIB`} />
            <BarisInfo label="No. kuitansi" nilai={rec.no} kuat />
            <Animated.View style={{ position: 'absolute', right: 12, top: 8, opacity: cap, transform: [{ scale: skala }] }}>
              <Stempel tanggal={tgl(hariKe(rec.ts)).toUpperCase()} kecil />
            </Animated.View>
          </View>
          <Gerigi bawah />
        </View>
      </View>
      <Tombol
        label="Lihat kuitansi"
        ikon="nota"
        ukuran="besar"
        penuh
        onPress={() => lembar.buka({ judul: `Kuitansi ${namaBulan(per.jatuh)}`, isi: <Kuitansi penghuni={p} periode={per} bayar={rec} /> })}
      />
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
        <Tombol jenis="garis" ikon="bagikan" label="Bagikan" onPress={bagikan} />
        {!pengingat ? (
          <Tombol
            jenis="garis"
            ikon="lonceng"
            label="Ingatkan bulan depan"
            onPress={() => {
              setPengingat(true);
              kabar(`Pengingat H-3 dipasang untuk tagihan berikutnya (simulasi).`);
            }}
          />
        ) : null}
        <Tombol href="/penghuni" jenis="teks" ikon="rumah" label="Ke beranda" />
      </View>
    </>
  );
}

function Alur({ data }) {
  const { bayar } = useToko();
  const kabar = useKabar();
  const p = data.demo;
  const t = p.tagihan;
  const [metode, setMetode] = useState('qris');
  const [langkah, setLangkah] = useState('pilih');
  const [hasil, setHasil] = useState(null);
  const tm = useRef(null);
  useEffect(() => () => clearTimeout(tm.current), []);

  const va = `8807 ${p.kamar}26 ${String(t.jatuh).slice(-4)} ${String(t.total).slice(0, 3)}`;
  const konfirmasi = () => {
    setLangkah('proses');
    tm.current = setTimeout(() => {
      const rec = bayar(p.kamar, t.j, metode, t.sewa + t.parkir, t.jatuh);
      setHasil({ per: t, rec });
      setLangkah('sukses');
    }, 1600);
  };

  if (t.status === 'lunas' && !hasil) {
    return (
      <Kartu style={{ gap: 10, alignItems: 'flex-start' }}>
        <Stempel />
        <Sub level={2} v="h3">Tidak ada tagihan yang perlu dibayar</Sub>
        <T v="kecil">Tagihan {namaBulan(p.berikut.jatuh)} terbit {tgl(p.berikut.jatuh - 7)} dan jatuh tempo {hariTgl(p.berikut.jatuh)}.</T>
        <Tombol href="/penghuni/riwayat" jenis="gelap" label="Lihat kuitansi" ikon="nota" />
      </Kartu>
    );
  }

  if (langkah === 'sukses' && hasil) return <LayarLunas p={p} per={hasil.per} rec={hasil.rec} pengingat={data.pengingat} />;

  return (
    <>
      <View style={{ backgroundColor: W.tinta, borderRadius: 22, overflow: 'hidden' }}>
        <View style={{ padding: 16, gap: 2 }}>
          <Text style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: '#D9CDBB' }]}>KAMAR {p.kamar} · SEWA {tglPendek(t.jatuh).toUpperCase()} – {tglPendek(t.akhir).toUpperCase()}</Text>
          <Text style={[F.judul, ANGKA, { fontSize: 36, lineHeight: 44, color: W.kunyit }]}>{rupiah(t.total)}</Text>
          <Text style={[F.teks, { fontSize: 13, color: '#EDE4D6' }]}>
            Sewa {rupiah(t.sewa)} + parkir {rupiah(t.parkir)}{t.denda ? ` + denda ${rupiah(t.denda)}` : ''} · jatuh tempo {jarakHari(t.jatuh, data.hari)}
          </Text>
        </View>
        <Tegel tinggi={10} ubin={20} warna="gelap" />
      </View>

      {langkah === 'pilih' ? (
        <View style={{ gap: 10 }}>
          <Sub level={2} v="h3">Pilih cara bayar</Sub>
          <View role="radiogroup" aria-label="Cara bayar" style={{ gap: 10 }}>
            {PILIHAN.map((o) => {
              const aktif = metode === o.id;
              return (
                <Pressable
                  key={o.id}
                  role="radio"
                  aria-checked={aktif}
                  onPress={() => setMetode(o.id)}
                  style={({ pressed }) => ({ flexDirection: 'row', gap: 12, alignItems: 'center', padding: 14, borderRadius: 18, borderWidth: 2, borderColor: aktif ? W.bata : W.garis, backgroundColor: aktif ? W.kertas : W.kapur, opacity: pressed ? 0.9 : 1 })}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: aktif ? W.bata : W.kertas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: aktif ? W.bata : W.garis }}>
                    <Ikon nama={o.ikon} ukuran={22} warna={aktif ? W.putih : W.tinta} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <T v="kuat">{o.judul}</T>
                    <T v="mini">{o.isi}</T>
                  </View>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: aktif ? W.bata : W.garisTua, alignItems: 'center', justifyContent: 'center' }}>
                    {aktif ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: W.bata }} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <T v="mini">Mau bayar tunai? Serahkan ke {KOS.pengelola}; pemilik akan mencatatnya dan kuitansinya muncul di sini.</T>
          <Tombol label="Lanjut" ikonKanan="kanan" ukuran="besar" penuh onPress={() => setLangkah(metode)} />
        </View>
      ) : null}

      {langkah === 'qris' ? (
        <Kartu style={{ gap: 12, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', alignItems: 'center' }}>
            <Sub level={2} v="h3">QRIS {KOS.nama}</Sub>
            <HitungMundur detik={600} />
          </View>
          <View style={{ padding: 10, backgroundColor: W.putih, borderRadius: 16, borderWidth: 1, borderColor: W.garis }}>
            <QrSimulasi ukuran={196} benih={Number(p.kamar) + t.j} />
          </View>
          <View style={{ backgroundColor: W.kunyitMuda, borderRadius: 12, padding: 10, alignSelf: 'stretch' }}>
            <T v="mini" warna={W.coklat}>Ini QR simulasi untuk demo. Jangan dipindai untuk membayar sungguhan.</T>
          </View>
          <Tombol label="Saya sudah bayar" ukuran="besar" penuh onPress={konfirmasi} ikon="centang" />
          <Tombol label="Ganti cara bayar" jenis="teks" onPress={() => setLangkah('pilih')} />
        </Kartu>
      ) : null}

      {langkah === 'transfer' ? (
        <Kartu style={{ gap: 12 }}>
          <Sub level={2} v="h3">Transfer ke virtual account</Sub>
          <View style={{ backgroundColor: W.kapur, borderRadius: 14, padding: 14, gap: 6 }}>
            <T v="mini">Nomor virtual account (simulasi)</T>
            <Text style={[F.judul, ANGKA, { fontSize: 24, letterSpacing: 1, color: W.tinta }]} selectable>
              {va}
            </Text>
            <T v="mini">Atas nama: KOS UBIN KEMBANG · Nominal harus pas {rupiah(t.total)}</T>
            <Tombol
              jenis="garis"
              ukuran="kecil"
              ikon="salin"
              label="Salin nomor"
              onPress={async () => {
                try {
                  await Clipboard.setStringAsync(va.replace(/\s/g, ''));
                  kabar('Nomor virtual account disalin.');
                } catch {
                  kabar('Salin manual dari layar, ya.');
                }
              }}
            />
          </View>
          {['Buka aplikasi bank atau ATM, pilih Transfer → Virtual Account.', `Masukkan nomor di atas, pastikan nama tujuan KOS UBIN KEMBANG.`, `Bayar tepat ${rupiah(t.total)}, lalu kembali ke sini.`].map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <Text style={[F.judul, { fontSize: 16, color: W.bata, width: 18 }]}>{i + 1}</Text>
              <T v="kecil" style={{ flex: 1 }}>{s}</T>
            </View>
          ))}
          <Tombol label="Saya sudah transfer" ukuran="besar" penuh onPress={konfirmasi} ikon="centang" />
          <Tombol label="Ganti cara bayar" jenis="teks" onPress={() => setLangkah('pilih')} />
        </Kartu>
      ) : null}

      {langkah === 'proses' ? (
        <Kartu style={{ alignItems: 'center', gap: 10, paddingVertical: 24 }} aria-live="polite">
          <ActivityIndicator color={W.bata} size="large" aria-label="Memeriksa pembayaran" />
          <T v="kuat">Memeriksa pembayaran…</T>
          <Lencana teks={Platform.OS === 'web' ? 'Simulasi di peramban' : 'Simulasi di perangkat'} />
        </Kartu>
      ) : null}
    </>
  );
}
