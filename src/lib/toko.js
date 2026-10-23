import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bangun, nomorKuitansi, denda as hitungDenda } from './hitung';
import { CHAT_CEPAT } from './data';
import { hariKe } from './waktu';

// Yang disimpan hanya catatan aksi pengguna; data contoh selalu dihitung ulang dari hari ini (WIB).
const KUNCI = 'grendel-kos:v1';
const KOSONG = { bayar: {}, ingat: {}, tiketBaru: [], tiket: {}, kamar: {}, iklan: {}, kontrak: null, akhiri: null, chat: [], calon: [], pengingat: false, dibalas: {} };

const Ctx = createContext(null);

// HTML statis dirender dengan data contoh pada waktu build. Saat hidrasi, klien membaca cap waktu yang sama
// dari penanda di DOM, sehingga render pertama identik (tanpa hydration mismatch). Setelah itu waktu diganti ke
// sekarang dan isian tersimpan dimuat.
const KINI_RENDER = Date.now();
function kiniAwal() {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const v = Number(document.getElementById('kini-bangun')?.getAttribute('data-kini'));
    if (v) return v;
  }
  return KINI_RENDER;
}

export function TokoProvider({ children }) {
  const [aksi, setAksi] = useState(KOSONG);
  const [kini, setKini] = useState(kiniAwal);
  const [kiniHtml] = useState(kini);
  const [dimuat, setDimuat] = useState(false);
  const timer = useRef([]);

  useEffect(() => {
    let batal = false;
    setKini(Date.now());
    AsyncStorage.getItem(KUNCI)
      .then((raw) => {
        if (batal) return;
        let isi = KOSONG;
        try {
          if (raw) isi = { ...KOSONG, ...JSON.parse(raw) };
        } catch {
          isi = KOSONG;
        }
        setKini(Date.now());
        setAksi(isi);
        setDimuat(true);
      })
      .catch(() => {
        if (!batal) setDimuat(true);
      });
    const t = timer.current;
    return () => {
      batal = true;
      t.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!dimuat) return;
    AsyncStorage.setItem(KUNCI, JSON.stringify(aksi)).catch(() => {
      // Penyimpanan penuh atau diblokir (mode privat): coba lagi tanpa foto lampiran.
      try {
        const ringan = { ...aksi, tiketBaru: aksi.tiketBaru.map((t) => ({ ...t, fotoUri: undefined })) };
        AsyncStorage.setItem(KUNCI, JSON.stringify(ringan)).catch(() => {});
      } catch {}
    });
  }, [aksi, dimuat]);

  const ubah = useCallback((fn) => {
    setKini(Date.now());
    setAksi((a) => fn(a));
  }, []);

  const data = useMemo(() => bangun(kini, aksi), [aksi, kini]);

  const aksiAksi = useMemo(() => ({
    /** Penghuni membayar periode j (QRIS/transfer) atau pemilik mencatat bayar tunai. */
    bayar(kamar, j, metode, sewaParkir, jatuh) {
      const ts = Date.now();
      const telat = Math.max(0, hariKe(ts) - jatuh);
      const dd = hitungDenda(telat);
      const rec = { ts, metode, telat, denda: dd, total: sewaParkir + dd, no: nomorKuitansi(kamar, jatuh) };
      ubah((a) => ({ ...a, bayar: { ...a.bayar, [kamar]: { ...(a.bayar[kamar] || {}), [j]: rec } } }));
      return rec;
    },
    ingatkan(kamarList) {
      const ts = Date.now();
      ubah((a) => ({ ...a, ingat: { ...a.ingat, ...Object.fromEntries(kamarList.map((k) => [k, ts])) } }));
    },
    lapor(t) {
      const ts = Date.now();
      // Nomor 1000–9999 dari cap waktu: tidak bentrok dengan nomor tiket contoh (T-03xx/T-04xx).
      const id = `T-${1000 + (Math.floor(ts / 1000) % 9000)}`;
      ubah((a) => ({ ...a, tiketBaru: [{ ...t, id, riwayat: [{ status: 'baru', ts }] }, ...a.tiketBaru] }));
      return id;
    },
    ubahTiket(id, status, catatan, jadwal) {
      const ts = Date.now();
      ubah((a) => ({ ...a, tiket: { ...a.tiket, [id]: [...(a.tiket[id] || []), { status, ts, catatan, jadwal }] } }));
    },
    statusKamar(id, status) {
      ubah((a) => ({ ...a, kamar: { ...a.kamar, [id]: status } }));
    },
    iklan(id, tayang) {
      ubah((a) => ({ ...a, iklan: { ...a.iklan, [id]: tayang } }));
    },
    ajukanPerpanjang(bulan) {
      ubah((a) => ({ ...a, kontrak: { bulan, ts: Date.now(), status: 'menunggu' } }));
    },
    putusPerpanjang(status) {
      ubah((a) => (a.kontrak ? { ...a, kontrak: { ...a.kontrak, status, tsPutus: Date.now() } } : a));
    },
    batalPerpanjang() {
      ubah((a) => ({ ...a, kontrak: null }));
    },
    akhiri(hariKeluar, alasan) {
      ubah((a) => ({ ...a, akhiri: { hari: hariKeluar, alasan, ts: Date.now() } }));
    },
    batalAkhiri() {
      ubah((a) => ({ ...a, akhiri: null }));
    },
    kirimChat(i) {
      const q = CHAT_CEPAT[i];
      const ts = Date.now();
      ubah((a) => ({ ...a, chat: [...a.chat, { dari: 'saya', teks: q.tanya, ts }] }));
      timer.current.push(
        setTimeout(() => ubah((a) => ({ ...a, chat: [...a.chat, { dari: 'darmo', teks: q.jawab, ts: Date.now() }] })), 1400),
      );
    },
    mintaSurvei(c) {
      ubah((a) => ({ ...a, calon: [{ ...c, id: `c${Date.now()}`, ts: Date.now() }, ...a.calon] }));
    },
    /** Pengingat H-3 sisi penghuni (simulasi lokal). */
    setPengingat(nyala) {
      ubah((a) => ({ ...a, pengingat: nyala }));
    },
    balasCalon(id) {
      ubah((a) => ({ ...a, dibalas: { ...a.dibalas, [id]: Date.now() } }));
    },
    aturUlang() {
      ubah(() => KOSONG);
    },
  }), [ubah]);

  const nilai = useMemo(() => ({ data, siap: dimuat, ...aksiAksi }), [data, dimuat, aksiAksi]);
  return (
    <Ctx.Provider value={nilai}>
      {Platform.OS === 'web' ? <View nativeID="kini-bangun" dataSet={{ kini: String(kiniHtml) }} style={{ display: 'none' }} /> : null}
      {children}
    </Ctx.Provider>
  );
}

export function useToko() {
  return useContext(Ctx);
}
