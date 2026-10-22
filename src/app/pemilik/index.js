import { useState, useId } from 'react';
import { View, Text, Pressable } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, KAMAR } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah, rupiahRingkas } from '../../lib/uang';
import { tgl, namaBulan, BLN, BULAN, relatif } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Ketuk, Kerangka, Lencana, Chip, GrupChip } from '../../ui/dasar';
import { Cincin, Sosok } from '../../ui/motif';
import { Svg, Path, Defs, Pattern, Rect } from '../../ui/svg';
import { Ikon } from '../../ui/Ikon';
import { useKabar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Dasbor Pemilik Kos: Okupansi dan Pemasukan · Grendel',
    deskripsi: 'Ringkasan pemilik kos: okupansi 12 kamar, sewa yang diterima bulan ini, grafik pemasukan 6 bulan, penghuni telat bayar, dan laporan kerusakan baru.',
    path: '/pemilik',
  });
}

export default function RingkasPemilik() {
  const { data } = useToko();
  return (
    <Layar judul="Ringkasan" sub={data ? `${namaBulan(data.hari)} · ${KOS.nama}` : KOS.nama}>
      {data ? (
        <Isi data={data} />
      ) : (
        <>
          <Kerangka tinggi={176} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Kerangka tinggi={200} style={{ flex: 1 }} />
            <Kerangka tinggi={200} style={{ flex: 1 }} />
          </View>
          <Kerangka tinggi={300} />
        </>
      )}
    </Layar>
  );
}

const TINGGI = 150;

function Grafik({ grafik }) {
  const [pilih, setPilih] = useState(grafik.length - 1);
  const [tabel, setTabel] = useState(false);
  const idArsir = `ar${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const maks = Math.max(...grafik.map((g) => g.total), 1);
  const atas = Math.ceil(maks / 2.5e6) * 2.5e6;
  const iMaks = grafik.findIndex((g) => g.total === maks);
  const g = grafik[pilih];
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Sub level={2} v="h3">Uang masuk per bulan</Sub>
          <T v="mini">Sewa, parkir, dan denda yang diterima · 6 bulan</T>
        </View>
        <GrupChip label="Tampilan grafik">
          <Chip label="Grafik" aktif={!tabel} onPress={() => setTabel(false)} kecil />
          <Chip label="Tabel" aktif={tabel} onPress={() => setTabel(true)} kecil />
        </GrupChip>
      </View>

      {tabel ? (
        <View role="table" aria-label="Uang masuk per bulan">
          <View role="row" style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: W.garis }}>
            <Text role="columnheader" style={[F.tebal, { flex: 1.2, fontSize: 12.5, color: W.abu }]}>Bulan</Text>
            <Text role="columnheader" style={[F.tebal, { flex: 1.2, fontSize: 12.5, color: W.abu, textAlign: 'right' }]}>Uang masuk</Text>
            <Text role="columnheader" style={[F.tebal, { flex: 0.8, fontSize: 12.5, color: W.abu, textAlign: 'right' }]}>Terisi</Text>
          </View>
          {grafik.map((b) => (
            <View role="row" key={b.kb} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: W.garis }}>
              <Text role="cell" style={[F.teks, { flex: 1.2, fontSize: 14, color: W.tinta }]}>{BULAN[b.m]}{b.berjalan ? ' (berjalan)' : ''}</Text>
              <Text role="cell" style={[F.tebal, ANGKA, { flex: 1.2, fontSize: 14, color: W.tinta, textAlign: 'right' }]}>{rupiah(b.total)}</Text>
              <Text role="cell" style={[F.teks, ANGKA, { flex: 0.8, fontSize: 14, color: W.tinta, textAlign: 'right' }]}>{b.terisi}/{KAMAR.length}</Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={{ backgroundColor: W.kapur, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }} aria-live="polite">
            <T v="kecil" warna={W.tinta}>{BULAN[g.m]} {g.y}{g.berjalan ? ' (berjalan)' : ''}</T>
            <T v="kuat" style={ANGKA}>{rupiah(g.total)} · {g.terisi}/{KAMAR.length} kamar</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 34, height: TINGGI, justifyContent: 'space-between' }} aria-hidden>
              {[atas, atas / 2, 0].map((v) => (
                <Text key={v} style={[F.teks, ANGKA, { fontSize: 10.5, color: W.abu, textAlign: 'right', marginTop: v === atas ? -6 : 0, marginBottom: v === 0 ? -6 : 0 }]}>{rupiahRingkas(v)}</Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ height: TINGGI, flexDirection: 'row', alignItems: 'flex-end' }}>
                {[0, 0.5, 1].map((f) => (
                  <View key={f} style={{ position: 'absolute', left: 0, right: 0, bottom: f * TINGGI, height: 1, backgroundColor: f === 0 ? W.garisTua : '#EADFCF' }} />
                ))}
                {grafik.map((b, i) => {
                  const h = Math.max(4, (b.total / atas) * TINGGI);
                  const label = i === iMaks || b.berjalan;
                  return (
                    <Pressable
                      key={b.kb}
                      role="button"
                      aria-label={`${BULAN[b.m]}: ${rupiah(b.total)}, ${b.terisi} dari ${KAMAR.length} kamar terisi`}
                      aria-pressed={pilih === i}
                      onPress={() => setPilih(i)}
                      onHoverIn={() => setPilih(i)}
                      style={{ flex: 1, height: TINGGI, alignItems: 'center', justifyContent: 'flex-end' }}
                    >
                      {label ? (
                        <Text style={[F.tebal, ANGKA, { fontSize: 10.5, color: W.tinta, marginBottom: 3 }]}>{rupiahRingkas(b.total)}</Text>
                      ) : null}
                      <View style={{ width: 22, height: h, borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden', backgroundColor: b.berjalan ? W.bataMuda : pilih === i ? W.bataTua : W.bata }}>
                        {b.berjalan ? (
                          <Svg width={22} height={h}>
                            <Defs>
                              <Pattern id={idArsir} patternUnits="userSpaceOnUse" width="6" height="6">
                                <Path d="M0 6 6 0" stroke={pilih === i ? W.bataTua : W.bata} strokeWidth="2" />
                              </Pattern>
                            </Defs>
                            <Rect x="0" y="0" width="22" height={h} fill={`url(#${idArsir})`} />
                          </Svg>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 6 }} aria-hidden>
                {grafik.map((b) => (
                  <Text key={b.kb} style={[b.berjalan ? F.pekat : F.sedang, { flex: 1, textAlign: 'center', fontSize: 11.5, color: b.berjalan ? W.tinta : W.abu }]}>
                    {BLN[b.m]}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <T v="mini">Batang berarsir = bulan berjalan, belum semua penghuni jatuh tempo. Sentuh batang untuk melihat angkanya.</T>
        </>
      )}
    </View>
  );
}

function Permintaan({ data }) {
  const { putusPerpanjang } = useToko();
  const kabar = useKabar();
  const r = data.kontrak.perpanjang;
  const keluar = data.kontrak.akhiri;
  const laras = data.demo;
  const ada = (r && r.status === 'menunggu') || keluar;
  if (!ada) return null;
  return (
    <View style={{ gap: 10 }}>
      <Sub level={2} v="h3">Permintaan penghuni</Sub>
      {r && r.status === 'menunggu' ? (
        <View style={{ backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1.5, borderColor: W.kunyit, padding: 14, gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Sosok av={laras.av} ukuran={40} />
            <View style={{ flex: 1 }}>
              <T v="kuat">{laras.nama} · Kamar {laras.kamar}</T>
              <T v="mini">Minta perpanjang {r.bulan} bulan · {relatif(r.ts, data.kini)}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tombol jenis="hijau" ukuran="kecil" ikon="centang" label="Setujui" onPress={() => { putusPerpanjang('disetujui'); kabar(`Perpanjangan ${laras.panggil} disetujui.`); }} />
            <Tombol jenis="garis" ukuran="kecil" label="Tolak" onPress={() => { putusPerpanjang('ditolak'); kabar('Pengajuan ditolak.'); }} />
          </View>
        </View>
      ) : null}
      {keluar ? (
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: W.bataMuda, borderRadius: 18, padding: 12 }}>
          <Ikon nama="keluar" ukuran={20} warna={W.bataTua} />
          <T v="kecil" warna={W.bataTua} style={{ flex: 1 }}>
            {laras.panggil} (Kamar {laras.kamar}) berencana keluar {tgl(keluar.hari)}. Siapkan iklan kamar.
          </T>
        </View>
      ) : null}
    </View>
  );
}

function Isi({ data }) {
  const kamar = data.kamar;
  const terisi = kamar.filter((k) => k.status === 'terisi').length;
  const kosong = kamar.filter((k) => k.status === 'kosong');
  const rawat = kamar.filter((k) => k.status === 'perawatan').length;
  const telat = data.penghuni.filter((p) => p.tagihan.status === 'telat');
  const belum = data.penghuni.filter((p) => p.tagihan.status !== 'lunas');
  const dendaTotal = telat.reduce((s, p) => s + p.tagihan.denda, 0);
  const tiketBaru = data.tiket.filter((t) => t.status === 'baru');
  const tiketAktif = data.tiket.filter((t) => t.status !== 'selesai');
  const persen = data.ditagih ? data.diterima / data.ditagih : 0;
  const okupansi = terisi / kamar.length;

  return (
    <>
      <View style={{ backgroundColor: W.tinta, borderRadius: 24, padding: 18, gap: 8 }}>
        <Text style={[F.pekat, { fontSize: 11, letterSpacing: 1.4, color: '#D9CDBB' }]}>SEWA DITERIMA · {namaBulan(data.hari).toUpperCase()}</Text>
        <Text style={[F.pekat, ANGKA, { fontSize: 36, lineHeight: 42, color: W.kapur }]}>{rupiah(data.diterima)}</Text>
        <Text style={[F.teks, { fontSize: 13.5, color: '#EDE4D6' }]}>dari {rupiah(data.ditagih)} yang jatuh tempo bulan ini</Text>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: '#4A3F37', overflow: 'hidden', marginTop: 4 }} role="progressbar" aria-valuenow={Math.round(persen * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Persentase sewa diterima bulan ini">
          <View style={{ width: `${Math.round(persen * 100)}%`, height: 10, borderRadius: 5, backgroundColor: W.kunyit }} />
        </View>
        <Text style={[F.sedang, { fontSize: 12.5, color: '#D9CDBB' }]}>{Math.round(persen * 100)}% tertagih · {belum.length} penghuni belum bayar periode ini</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Ketuk href="/pemilik/kamar" style={[ubin, { alignItems: 'center' }]}>
          <T v="label" style={{ alignSelf: 'flex-start' }}>Okupansi</T>
          <Cincin nilai={okupansi} ukuran={100} tebal={12}>
            <Text style={[F.pekat, ANGKA, { fontSize: 24, color: W.tinta }]}>{Math.round(okupansi * 100)}%</Text>
            <Text style={[F.sedang, { fontSize: 11, color: W.abu }]}>{terisi}/{kamar.length} kamar</Text>
          </Cincin>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Legenda warna={W.bata} teks={`${terisi} terisi`} />
            <Legenda warna={W.bataMuda} teks={`${kosong.length} kosong · ${rawat} perawatan`} />
          </View>
        </Ketuk>
        <View style={{ flex: 1, gap: 12 }}>
          <Ketuk href="/pemilik/tagihan" style={[ubinKecil, { backgroundColor: telat.length ? W.bataMuda : W.hijauMuda, borderColor: telat.length ? W.bataMuda : W.hijauMuda }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="label" warna={telat.length ? W.bataTua : W.hijau}>Telat bayar</T>
              <Ikon nama={telat.length ? 'awas' : 'centang'} ukuran={18} warna={telat.length ? W.bataTua : W.hijau} />
            </View>
            <Text style={[F.pekat, ANGKA, { fontSize: 26, lineHeight: 32, color: telat.length ? W.bataTua : W.hijau }]}>{telat.length} orang</Text>
            <T v="mini" warna={telat.length ? W.bataTua : W.hijau}>{telat.length ? `denda berjalan ${rupiah(dendaTotal)}` : 'semua aman'}</T>
          </Ketuk>
          <Ketuk href="/pemilik/tiket" style={[ubinKecil, { backgroundColor: W.kunyitMuda, borderColor: W.kunyitMuda }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="label" warna={W.coklat}>Laporan</T>
              <Ikon nama="obeng" ukuran={18} warna={W.coklat} />
            </View>
            <Text style={[F.pekat, ANGKA, { fontSize: 26, lineHeight: 32, color: W.coklat }]}>{tiketBaru.length} baru</Text>
            <T v="mini" warna={W.coklat}>{tiketAktif.length} sedang ditangani</T>
          </Ketuk>
        </View>
      </View>

      <Grafik grafik={data.grafik} />

      <Permintaan data={data} />

      <Ketuk href="/pemilik/iklan" style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: W.kertas, borderRadius: 20, borderWidth: 1, borderColor: W.garis, padding: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: W.hijauMuda, alignItems: 'center', justifyContent: 'center' }}>
          <Ikon nama="papan" ukuran={22} warna={W.hijau} />
        </View>
        <View style={{ flex: 1 }}>
          <T v="kuat">{kosong.length} kamar kosong · {kosong.filter((k) => k.iklan).length} tayang</T>
          <T v="mini">{data.calon.length} calon penghuni minta jadwal survei</T>
        </View>
        <Ikon nama="kanan" ukuran={18} warna={W.abu} />
      </Ketuk>
    </>
  );
}

function Legenda({ warna, teks }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: warna }} />
      <Text style={[F.sedang, { fontSize: 11.5, color: W.abu }]}>{teks}</Text>
    </View>
  );
}

const ubin = { flex: 1, backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 10 };
const ubinKecil = { flex: 1, borderRadius: 20, borderWidth: 1, padding: 12, gap: 2 };
