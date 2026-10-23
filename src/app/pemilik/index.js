import { useState, useId } from 'react';
import { View, Text, Pressable } from 'react-native';
import { W, F, ANGKA } from '../../lib/tema';
import { meta } from '../../lib/meta';
import { KOS, KAMAR } from '../../lib/data';
import { useToko } from '../../lib/toko';
import { rupiah, rupiahRingkas } from '../../lib/uang';
import { tgl, tglPendek, namaBulan, BLN, BULAN, relatif } from '../../lib/waktu';
import { Layar, T, Sub, Tombol, Ketuk, Chip, GrupChip } from '../../ui/dasar';
import { Cincin, Sosok } from '../../ui/motif';
import { Svg, Path, Defs, Pattern, Rect } from '../../ui/svg';
import { Ikon } from '../../ui/Ikon';
import { GRUP, perluDiingatkan, PratinjauPengingat } from '../../ui/bayar';
import { useKabar, useLembar } from '../../ui/lapisan';

export function generateMetadata() {
  return meta({
    judul: 'Dasbor Pemilik Kos: Okupansi dan Arus Kas · Grendel',
    deskripsi: 'Ringkasan pemilik kos: status bayar periode berjalan, arus kas masuk dan keluar, okupansi 12 kamar, grafik 6–12 bulan, dan laporan kerusakan baru.',
    path: '/pemilik',
  });
}

export default function RingkasPemilik() {
  const { data } = useToko();
  return (
    <Layar judul="Ringkasan" sub={`${namaBulan(data.hari)} · ${KOS.nama}`}>
      <Isi data={data} />
    </Layar>
  );
}

/** Kartu periode berjalan: batang bersegmen 4 kelompok yang sama persis dengan tab Bayar. */
function KartuPeriode({ data }) {
  const lembar = useLembar();
  const kel = data.kelompok;
  const total = data.penghuni.length;
  const diingat = perluDiingatkan(kel);
  return (
    <View style={{ backgroundColor: W.tinta, borderRadius: 24, padding: 18, gap: 10 }}>
      <Text style={[F.pekat, { fontSize: 12, letterSpacing: 1.2, color: '#D9CDBB' }]}>TAGIHAN PERIODE BERJALAN · {total} PENGHUNI</Text>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-end' }}>
        <View style={{ flex: 1.1 }}>
          <Text style={[F.sedang, { fontSize: 13, color: '#D9CDBB' }]}>Terkumpul</Text>
          <Text style={[F.pekat, ANGKA, { fontSize: 26, lineHeight: 32, color: W.kapur }]}>{rupiah(data.terkumpul)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[F.sedang, { fontSize: 13, color: '#D9CDBB' }]}>Masih ditunggu</Text>
          <Text style={[F.pekat, ANGKA, { fontSize: 20, lineHeight: 32, color: W.kunyit }]}>{rupiah(data.ditunggu)}</Text>
        </View>
      </View>
      <View
        style={{ flexDirection: 'row', height: 14, borderRadius: 7, overflow: 'hidden', gap: 2, backgroundColor: W.tinta }}
        role="img"
        aria-label={GRUP.map((g) => `${kel[g.id].length} ${g.label.toLowerCase()}`).join(', ')}
      >
        {[...GRUP].reverse().map((g) =>
          kel[g.id].length ? <View key={g.id} style={{ flex: kel[g.id].length, backgroundColor: g.batang }} /> : null,
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6 }}>
        {[...GRUP].reverse().map((g) => (
          <View key={g.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: g.batang }} />
            <Text style={[F.sedang, ANGKA, { fontSize: 13, color: '#EDE4D6' }]}>
              {kel[g.id].length} {g.label.toLowerCase()}
            </Text>
          </View>
        ))}
      </View>
      {diingat.length ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: '#3D342D', paddingTop: 10 }}>
          <View style={{ flexDirection: 'row' }} aria-hidden>
            {diingat.slice(0, 4).map((p, i) => (
              <View key={p.kamar} style={{ marginLeft: i ? -8 : 0, borderRadius: 16, borderWidth: 2, borderColor: W.tinta }}>
                <Sosok av={p.av} ukuran={30} />
              </View>
            ))}
          </View>
          <Text style={[F.sedang, { flex: 1, fontSize: 13, lineHeight: 18, color: '#EDE4D6' }]}>
            {diingat.map((p) => p.panggil).join(', ')} {diingat === kel.segera ? 'segera jatuh tempo' : 'perlu diingatkan'}
          </Text>
          <Tombol
            jenis="kunyit"
            ukuran="kecil"
            ikon="lonceng"
            label="Ingatkan"
            aksesLabel={`Ingatkan ${diingat.length} penghuni`}
            onPress={() => lembar.buka({ judul: 'Kirim pengingat', isi: <PratinjauPengingat daftar={diingat} hari={data.hari} /> })}
          />
        </View>
      ) : null}
      <Tombol href="/pemilik/tagihan" jenis="garisTerang" ukuran="kecil" label="Lihat status bayar" ikonKanan="kanan" />
    </View>
  );
}

function RincianKeluar({ daftar, bulan }) {
  return (
    <>
      <T v="kecil">Semua pengeluaran {bulan} yang sudah dibayar. Biaya perbaikan masuk otomatis saat tiket ditandai selesai.</T>
      {daftar.map((k) => (
        <View key={k.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, borderBottomWidth: 1, borderBottomColor: W.garis }}>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: k.jenis === 'perbaikan' ? W.kunyitMuda : W.kertas, borderWidth: 1, borderColor: W.garis, alignItems: 'center', justifyContent: 'center' }}>
            <Ikon nama={k.ikon} ukuran={18} warna={W.bata} />
          </View>
          <View style={{ flex: 1 }}>
            <T v="kecil" warna={W.tinta}>{k.label}</T>
            <T v="mini">{tgl(k.hari)}</T>
          </View>
          <T v="kuat" style={ANGKA}>{rupiah(k.nominal)}</T>
        </View>
      ))}
    </>
  );
}

function ArusKas({ data }) {
  const lembar = useLembar();
  const g = data.grafik[data.grafik.length - 1];
  const maks = Math.max(g.total, g.keluar, 1);
  const bulan = namaBulan(data.hari, false);
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 16, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Sub level={2} v="h3">Arus kas {bulan}</Sub>
        <T v="mini">sampai hari ini</T>
      </View>
      {[
        ['Masuk', g.total, W.hijau],
        ['Keluar', g.keluar, W.bata],
      ].map(([l, n, w]) => (
        <View key={l} style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="kecil" warna={W.tinta}>{l}</T>
            <T v="kuat" style={ANGKA}>{rupiah(n)}</T>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: W.kapur, overflow: 'hidden' }} aria-hidden>
            <View style={{ width: `${Math.max(2, (n / maks) * 100)}%`, height: 10, borderRadius: 5, backgroundColor: w }} />
          </View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', borderTopWidth: 1, borderTopColor: W.garis, paddingTop: 8 }}>
        <T v="kuat">Bersih</T>
        <Text style={[F.judul, ANGKA, { fontSize: 26, lineHeight: 32, color: g.bersih >= 0 ? W.hijau : W.bataTua }]}>{rupiah(g.bersih)}</Text>
      </View>
      <Tombol
        jenis="garis"
        ukuran="kecil"
        ikon="nota"
        label={`Rincian pengeluaran (${data.keluarBulanIni.length})`}
        onPress={() => lembar.buka({ judul: `Pengeluaran ${bulan}`, isi: <RincianKeluar daftar={data.keluarBulanIni} bulan={bulan} /> })}
      />
    </View>
  );
}

const TINGGI = 150;

function Grafik({ grafikSemua }) {
  const [rentang, setRentang] = useState(6);
  const [tabel, setTabel] = useState(false);
  const grafik = grafikSemua.slice(-rentang);
  const [pilih, setPilih] = useState(null);
  const idArsir = `ar${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const maks = Math.max(...grafik.map((g) => Math.max(g.total, g.keluar)), 1);
  const atas = Math.ceil(maks / 2.5e6) * 2.5e6;
  const iMaks = grafik.findIndex((g) => g.total === Math.max(...grafik.map((x) => x.total)));
  const ip = pilih == null || pilih >= grafik.length ? grafik.length - 1 : pilih;
  const g = grafik[ip];
  const tebal = rentang === 6 ? 14 : 8;
  return (
    <View style={{ backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 16, gap: 12 }}>
      <View style={{ gap: 2 }}>
        <Sub level={2} v="h3">Uang masuk & keluar</Sub>
        <T v="mini">Sewa, parkir, dan denda yang diterima dibanding pengeluaran kos</T>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <GrupChip label="Rentang grafik">
          <Chip label="6 bulan" aktif={rentang === 6} onPress={() => { setRentang(6); setPilih(null); }} kecil />
          <Chip label="12 bulan" aktif={rentang === 12} onPress={() => { setRentang(12); setPilih(null); }} kecil />
        </GrupChip>
        <GrupChip label="Tampilan">
          <Chip label="Grafik" aktif={!tabel} onPress={() => setTabel(false)} kecil />
          <Chip label="Tabel" aktif={tabel} onPress={() => setTabel(true)} kecil />
        </GrupChip>
      </View>

      {tabel ? (
        <View role="table" aria-label={`Uang masuk dan keluar ${rentang} bulan`}>
          <View role="row" style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: W.garis }}>
            {['Bulan', 'Masuk', 'Keluar', 'Bersih'].map((h, i) => (
              <Text key={h} role="columnheader" style={[F.tebal, { flex: i ? 1.15 : 0.8, fontSize: 12.5, color: W.abu, textAlign: i ? 'right' : 'left' }]}>{h}</Text>
            ))}
          </View>
          {grafik.map((b) => (
            <View role="row" key={b.kb} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: W.garis }}>
              <Text role="cell" style={[F.teks, { flex: 0.8, fontSize: 13.5, color: W.tinta }]}>{BLN[b.m]}{b.berjalan ? '*' : ''}</Text>
              <Text role="cell" style={[F.teks, ANGKA, { flex: 1.15, fontSize: 13.5, color: W.tinta, textAlign: 'right' }]}>{rupiahRingkas(b.total)}</Text>
              <Text role="cell" style={[F.teks, ANGKA, { flex: 1.15, fontSize: 13.5, color: W.tinta, textAlign: 'right' }]}>{rupiahRingkas(b.keluar)}</Text>
              <Text role="cell" style={[F.tebal, ANGKA, { flex: 1.15, fontSize: 13.5, color: b.bersih >= 0 ? W.hijau : W.bataTua, textAlign: 'right' }]}>{rupiahRingkas(b.bersih)}</Text>
            </View>
          ))}
          <T v="mini" style={{ marginTop: 6 }}>* bulan berjalan. Angka dalam juta (jt) / ribu (rb) rupiah.</T>
        </View>
      ) : (
        <>
          <View style={{ backgroundColor: W.kapur, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2 }} aria-live="polite">
            <T v="kuat">{BULAN[g.m]} {g.y}{g.berjalan ? ' (berjalan)' : ''} · {g.terisi}/{KAMAR.length} kamar</T>
            <T v="kecil" style={ANGKA}>Masuk {rupiah(g.total)} · keluar {rupiah(g.keluar)} · bersih {rupiah(g.bersih)}</T>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }} aria-hidden>
            {[
              [W.hijau, 'Masuk'],
              [W.bata, 'Keluar'],
            ].map(([w, l]) => (
              <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: w }} />
                <Text style={[F.sedang, { fontSize: 13, color: W.abu }]}>{l}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 34, height: TINGGI, justifyContent: 'space-between' }} aria-hidden>
              {[atas, atas / 2, 0].map((v) => (
                <Text key={v} style={[F.teks, ANGKA, { fontSize: 12, color: W.abu, textAlign: 'right', marginTop: v === atas ? -7 : 0, marginBottom: v === 0 ? -7 : 0 }]}>{rupiahRingkas(v)}</Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ height: TINGGI, flexDirection: 'row', alignItems: 'flex-end' }}>
                {[0, 0.5, 1].map((f) => (
                  <View key={f} style={{ position: 'absolute', left: 0, right: 0, bottom: f * TINGGI, height: 1, backgroundColor: f === 0 ? W.garisTua : '#EADFCF' }} />
                ))}
                {grafik.map((b, i) => {
                  const hm = Math.max(4, (b.total / atas) * TINGGI);
                  const hk = Math.max(4, (b.keluar / atas) * TINGGI);
                  const label = rentang === 6 || i === iMaks || b.berjalan;
                  const aktif = ip === i;
                  return (
                    <Pressable
                      key={b.kb}
                      role="button"
                      aria-label={`${label ? `${rupiahRingkas(b.total)}, ` : ''}${BULAN[b.m]} ${b.y}: masuk ${rupiah(b.total)}, keluar ${rupiah(b.keluar)}, ${b.terisi} dari ${KAMAR.length} kamar terisi`}
                      aria-pressed={aktif}
                      onPress={() => setPilih(i)}
                      onHoverIn={() => setPilih(i)}
                      style={{ flex: 1, height: TINGGI, alignItems: 'center', justifyContent: 'flex-end', borderRadius: 6, backgroundColor: aktif ? 'rgba(34,28,23,0.05)' : 'transparent' }}
                    >
                      {label ? <Text style={[F.tebal, ANGKA, { fontSize: 12, color: W.tinta, marginBottom: 3 }]}>{rupiahRingkas(b.total).replace(' jt', '')}</Text> : null}
                      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                        <View style={{ width: tebal, height: hm, borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: 'hidden', backgroundColor: b.berjalan ? W.hijauMuda : W.hijau }}>
                          {b.berjalan ? (
                            <Svg width={tebal} height={hm}>
                              <Defs>
                                <Pattern id={idArsir} patternUnits="userSpaceOnUse" width="6" height="6">
                                  <Path d="M0 6 6 0" stroke={W.hijau} strokeWidth="2" />
                                </Pattern>
                              </Defs>
                              <Rect x="0" y="0" width={tebal} height={hm} fill={`url(#${idArsir})`} />
                            </Svg>
                          ) : null}
                        </View>
                        <View style={{ width: tebal, height: hk, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: W.bata }} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', marginTop: 6 }} aria-hidden>
                {grafik.map((b, i) => (
                  <Text key={b.kb} style={[b.berjalan ? F.pekat : F.sedang, { flex: 1, textAlign: 'center', fontSize: 12, color: b.berjalan ? W.tinta : W.abu }]}>
                    {rentang === 6 ? BLN[b.m] : BLN[b.m].slice(0, 1)}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <T v="mini">Angka di atas batang = uang masuk (juta rupiah). Batang hijau berarsir = bulan berjalan. Sentuh batang untuk melihat rinciannya.</T>
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
  if (!((r && r.status === 'menunggu') || keluar)) return null;
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

function Legenda({ warna, teks }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: warna }} />
      <Text style={[F.sedang, { fontSize: 12, color: W.abu }]}>{teks}</Text>
    </View>
  );
}

function Isi({ data }) {
  const kamar = data.kamar;
  const terisi = kamar.filter((k) => k.status === 'terisi').length;
  const kosong = kamar.filter((k) => k.status === 'kosong');
  const rawat = kamar.filter((k) => k.status === 'perawatan').length;
  const tiketBaru = data.tiket.filter((t) => t.status === 'baru');
  const tiketAktif = data.tiket.filter((t) => t.status !== 'selesai');
  const okupansi = terisi / kamar.length;
  const menunggu = data.calon.filter((c) => !data.dibalas[c.id]).length;
  return (
    <>
      <KartuPeriode data={data} />
      <ArusKas data={data} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Ketuk href="/pemilik/kamar" style={[ubin, { alignItems: 'center' }]}>
          <T v="label" style={{ alignSelf: 'flex-start' }}>Okupansi</T>
          <Cincin nilai={okupansi} ukuran={100} tebal={12}>
            <Text style={[F.pekat, ANGKA, { fontSize: 24, color: W.tinta }]}>{Math.round(okupansi * 100)}%</Text>
            <Text style={[F.sedang, { fontSize: 12, color: W.abu }]}>{terisi}/{kamar.length} kamar</Text>
          </Cincin>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <Legenda warna={W.bata} teks={`${terisi} terisi`} />
            <Legenda warna={W.bataMuda} teks={`${kosong.length} kosong · ${rawat} perawatan`} />
          </View>
        </Ketuk>
        <View style={{ flex: 1, gap: 12 }}>
          <Ketuk href="/pemilik/tiket" style={[ubinKecil, { backgroundColor: W.kunyitMuda, borderColor: W.kunyitMuda }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="label" warna={W.coklat}>Laporan</T>
              <Ikon nama="obeng" ukuran={18} warna={W.coklat} />
            </View>
            <Text style={[F.pekat, ANGKA, { fontSize: 24, lineHeight: 30, color: W.coklat }]}>{tiketBaru.length} baru</Text>
            <T v="mini" warna={W.coklat}>{tiketAktif.length} sedang ditangani</T>
          </Ketuk>
          <Ketuk href="/pemilik/iklan" style={[ubinKecil, { backgroundColor: W.hijauMuda, borderColor: W.hijauMuda }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="label" warna={W.hijau}>Kamar kosong</T>
              <Ikon nama="papan" ukuran={18} warna={W.hijau} />
            </View>
            <Text style={[F.pekat, ANGKA, { fontSize: 24, lineHeight: 30, color: W.hijau }]}>{kosong.length} kamar</Text>
            <T v="mini" warna={W.hijau}>{menunggu ? `${menunggu} calon menunggu jawaban` : `${kosong.filter((k) => k.iklan).length} tayang di iklan`}</T>
          </Ketuk>
        </View>
      </View>
      <Grafik grafikSemua={data.grafik} />
      <Permintaan data={data} />
    </>
  );
}

const ubin = { flex: 1, backgroundColor: W.kertas, borderRadius: 22, borderWidth: 1, borderColor: W.garis, padding: 14, gap: 10 };
const ubinKecil = { flex: 1, borderRadius: 20, borderWidth: 1, padding: 12, gap: 2 };
