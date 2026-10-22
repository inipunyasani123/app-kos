import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bangun, nomorKuitansi, denda as hitungDenda } from './hitung';
import { CHAT_CEPAT } from './data';
import { hariKe } from './waktu';

// Yang disimpan hanya catatan aksi pengguna; data contoh selalu dihitung ulang dari hari ini (WIB).
const KUNCI = 'grendel-kos:v1';
const KOSONG = { bayar: {}, ingat: {}, tiketBaru: [], tiket: {}, kamar: {}, iklan: {}, kontrak: null, akhiri: null, chat: [], calon: [] };

const Ctx = createContext(null);

export function TokoProvider({ children }) {
  const [aksi, setAksi] = useState(null);
  const [kini, setKini] = useState(0);
  const timer = useRef([]);

  useEffect(() => {
    let batal = false;
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
      })
      .catch(() => {
        if (batal) return;
        setKini(Date.now());
        setAksi(KOSONG);
      });
    const t = timer.current;
    return () => {
      batal = true;
      t.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!aksi) return;
    AsyncStorage.setItem(KUNCI, JSON.stringify(aksi)).catch(() => {
      // Penyimpanan penuh atau diblokir (mode privat): coba lagi tanpa foto lampiran.
      try {
        const ringan = { ...aksi, tiketBaru: aksi.tiketBaru.map((t) => ({ ...t, fotoUri: undefined })) };
        AsyncStorage.setItem(KUNCI, JSON.stringify(ringan)).catch(() => {});
      } catch {}
    });
  }, [aksi]);

  const ubah = useCallback((fn) => {
    setKini(Date.now());
    setAksi((a) => fn(a));
  }, []);

  const data = useMemo(() => (aksi ? bangun(kini, aksi) : null), [aksi, kini]);

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
    aturUlang() {
      ubah(() => KOSONG);
    },
  }), [ubah]);

  const nilai = useMemo(() => ({ data, siap: !!data, ...aksiAksi }), [data, aksiAksi]);
  return <Ctx.Provider value={nilai}>{children}</Ctx.Provider>;
}

export function useToko() {
  return useContext(Ctx);
}
