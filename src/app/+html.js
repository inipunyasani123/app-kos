import { Children, isValidElement } from 'react';
import { useServerDocumentContext } from 'expo-router/html';
import qrcode from 'qrcode-generator';

// Hanya berjalan di Node saat ekspor statis (tidak ikut bundel klien).
// Layar >= 768px: aplikasi di dalam bingkai ponsel + panel samping. Layar HP: aplikasi layar penuh.

const SITUS = 'https://app-kos.pintuweb.id';
const KONTAK = 'https://www.pintuweb.id/kontak?demo=kos';

function jalurQr(teks) {
  const qr = qrcode(0, 'M');
  qr.addData(teks);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
  return { n, d };
}

// Chunk JS Expo (script defer) dimuat setelah frame pertama terlukis. Tanpa ini, bila HTML dan skrip tiba
// bersamaan, peramban menjalankan ~1 MB JS dulu sebelum melukis halaman statis (FCP ponsel sempat 2,7 s).
// Urutan eksekusi tetap terjaga (async = false); preload di <head> tetap mengunduhnya sejak awal.
function pisahSkrip(nodes) {
  const src = [];
  const lain = [];
  Children.forEach(nodes, (n) => {
    if (isValidElement(n) && n.type === 'script' && n.props.src) src.push(n.props.src);
    else lain.push(n);
  });
  return { src, lain };
}
const pemuat = (src) =>
  `(function(){var s=${JSON.stringify(src)},d=0;function go(){if(d)return;d=1;var b=document.getElementById('bilah-demo');s.forEach(function(u){var e=document.createElement('script');e.src=u;e.async=false;document.body.insertBefore(e,b)})}requestAnimationFrame(function(){setTimeout(go,0)});setTimeout(go,3000)})();`;

// Ubin tegel (sama dengan komponen Tegel) untuk latar panggung desktop, versi lembut.
const UBIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='88' height='88' viewBox='0 0 40 40'><rect width='40' height='40' fill='%23F3ECDF'/><g fill='%23EDE3D5'><circle cx='0' cy='0' r='11'/><circle cx='40' cy='0' r='11'/><circle cx='0' cy='40' r='11'/><circle cx='40' cy='40' r='11'/></g><g fill='%23F3ECDF'><circle cx='0' cy='0' r='5.5'/><circle cx='40' cy='0' r='5.5'/><circle cx='0' cy='40' r='5.5'/><circle cx='40' cy='40' r='5.5'/></g><g fill='%23EEE5D8'><path d='M20 7.5C23.6 12.4 23.6 15.8 20 20 16.4 15.8 16.4 12.4 20 7.5z'/><path d='M20 7.5C23.6 12.4 23.6 15.8 20 20 16.4 15.8 16.4 12.4 20 7.5z' transform='rotate(90 20 20)'/><path d='M20 7.5C23.6 12.4 23.6 15.8 20 20 16.4 15.8 16.4 12.4 20 7.5z' transform='rotate(180 20 20)'/><path d='M20 7.5C23.6 12.4 23.6 15.8 20 20 16.4 15.8 16.4 12.4 20 7.5z' transform='rotate(270 20 20)'/></g></svg>`;

const CSS = `
@font-face{font-family:Karla;src:url(/fonts/karla-latin.woff2) format('woff2');font-weight:400 800;font-style:normal;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Patua One";src:url(/fonts/patuaone-latin.woff2) format('woff2');font-weight:400;font-style:normal;font-display:swap;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
html,body{height:100%;margin:0}
body{background:#F3ECDF;color:#221C17;font-family:Karla,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
#root{display:flex;flex:1;height:100%;min-height:0;min-width:0}
.panggung{flex:1;min-height:0;display:flex}
.ponsel{flex:1;display:flex;min-height:0;min-width:0}
.layar{flex:1;display:flex;min-height:0;min-width:0;position:relative}
.panel{display:none}
:focus-visible{outline:3px solid #A3381F;outline-offset:2px;box-shadow:0 0 0 2px #FFFBF3}
.layar [role=navigation] :focus-visible{outline-color:#E2A630}
input:focus-visible,textarea:focus-visible{outline-offset:0}
@media (min-width:768px){
  body{overflow:auto;height:auto;min-height:100%;background:#F3ECDF url("data:image/svg+xml,${UBIN_SVG}") repeat}
  .panggung{display:grid;grid-template-columns:414px minmax(280px,400px);gap:64px;align-items:center;justify-content:center;padding:24px;min-height:calc(100vh - 48px);box-sizing:border-box}
  .ponsel{flex:none;width:414px;height:min(868px,calc(100vh - 96px));min-height:560px;padding:12px;box-sizing:border-box;border-radius:58px;background:#1F1915;box-shadow:0 0 0 2px #3B312A,0 30px 60px -24px rgba(34,28,23,.55),0 12px 24px -12px rgba(34,28,23,.4);position:relative}
  .ponsel::after{content:"";position:absolute;top:4px;left:50%;width:56px;height:4px;margin-left:-28px;border-radius:4px;background:#3B312A}
  .layar{border-radius:46px;overflow:hidden;transform:translateZ(0);background:#F3ECDF}
  .panel{display:block;max-width:400px}
}
.panel-label{margin:0 0 10px;font:800 12px/1.3 Karla,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#5B5047}
.panel-merek{display:flex;align-items:center;gap:12px;margin:0 0 8px}
.panel-judul{margin:0;font:400 42px/1.02 "Patua One",Rockwell,Georgia,serif;color:#221C17;letter-spacing:-.01em}
.panel-tag{margin:10px 0 18px;font:400 15px/1.55 Karla,system-ui,sans-serif;color:#3F3730}
.fitur{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.fitur li{background:#FFFBF3;border:1px solid #DCCDB8;border-radius:18px;padding:12px 13px 13px;font:400 12.5px/1.45 Karla,system-ui,sans-serif;color:#5B5047}
.fitur li b{display:block;margin:5px 0 3px;font:700 14px/1.3 Karla,system-ui,sans-serif;color:#221C17}
.fitur .no{font:400 13px/1 "Patua One",Rockwell,Georgia,serif;color:#A3381F}
.fitur li.gelap{background:#221C17;border-color:#221C17;color:#E8DFD1}
.fitur li.gelap b{color:#FFFBF3}
.fitur li.gelap .no{color:#E2A630}
.qr{display:flex;gap:14px;align-items:center;background:#FFFBF3;border:1px solid #DCCDB8;border-radius:20px;padding:10px 14px 10px 10px;margin:0 0 14px}
.qr svg{flex:none;border-radius:10px;background:#fff}
.qr p{margin:0;font:400 13px/1.5 Karla,system-ui,sans-serif;color:#5B5047}
.qr p b{display:block;font:700 15px/1.3 Karla,system-ui,sans-serif;color:#221C17;margin-bottom:2px}
.cta{display:inline-flex;align-items:center;gap:10px;min-height:52px;padding:0 24px;border-radius:999px;background:#A3381F;color:#fff;font:700 16px/1 Karla,system-ui,sans-serif;text-decoration:none;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)}
.cta:hover{background:#8E2F19}
.catatan{margin:14px 0 0;font:400 12.5px/1.5 Karla,system-ui,sans-serif;color:#5B5047}
`;

const JSONLD = {
  '@context': 'https://schema.org',
  '@type': ['MobileApplication', 'WebApplication'],
  name: 'Grendel',
  alternateName: 'Grendel Kos',
  description:
    'Demo aplikasi pengelolaan kos fiktif untuk penghuni dan pemilik: tagihan sewa dan denda, pembayaran simulasi, kuitansi, laporan kerusakan, denah kamar, okupansi, dan pemasukan bulanan.',
  url: `${SITUS}/`,
  image: `${SITUS}/og.jpg`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Android, iOS, Web',
  inLanguage: 'id',
  isAccessibleForFree: true,
  creator: { '@type': 'Organization', name: 'PintuWeb', url: 'https://www.pintuweb.id' },
};

export default function Root({ children, pathname }) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();
  const alamat = `${SITUS}${pathname && pathname !== '/' ? pathname : '/'}`;
  const qr = jalurQr(alamat);
  const { src, lain } = pisahSkrip(bodyNodes);
  return (
    <html lang="id" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F3ECDF" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Grendel" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" href="/ikon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preload" href="/fonts/karla-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/patuaone-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <style id="kerangka" dangerouslySetInnerHTML={{ __html: CSS }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        <div className="panggung">
          <div className="ponsel">
            <div className="layar">{children}</div>
          </div>
          <aside className="panel" aria-labelledby="panel-judul">
            <p className="panel-label">Demo aplikasi Android · iOS · web</p>
            <div className="panel-merek">
              <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
                <rect width="48" height="48" rx="12" fill="#A3381F" />
                <circle cx="0" cy="0" r="9" fill="#E2A630" />
                <circle cx="48" cy="48" r="9" fill="#E2A630" />
                <rect x="10" y="20" width="28" height="8" rx="4" fill="#F3ECDF" />
                <rect x="28" y="13" width="6" height="15" rx="3" fill="#F3ECDF" />
                <circle cx="15" cy="24" r="2" fill="#A3381F" />
              </svg>
              <h2 id="panel-judul" className="panel-judul">Grendel</h2>
            </div>
            <p className="panel-tag">
              Aplikasi kos untuk penghuni dan pemilik. Contohnya Kos Ubin Kembang, 12 kamar di Tulungagung; semua nama dan angkanya rekaan.
            </p>
            <ul className="fitur">
              <li className="gelap">
                <span className="no">01</span>
                <b>Tagihan &amp; denda jelas</b>
                Tenggang 3 hari, bayar QRIS atau transfer (simulasi), kuitansi bercap lunas.
              </li>
              <li>
                <span className="no">02</span>
                <b>Lapor kerusakan</b>
                Foto, catatan, dan status perbaikan sampai selesai.
              </li>
              <li>
                <span className="no">03</span>
                <b>Denah &amp; pengingat</b>
                Status 12 kamar, riwayat ketepatan bayar, pengingat.
              </li>
              <li className="gelap">
                <span className="no">04</span>
                <b>Arus kas &amp; iklan</b>
                Masuk vs keluar 12 bulan dan halaman kamar untuk calon penghuni.
              </li>
            </ul>
            <div className="qr">
              <svg width="96" height="96" viewBox={`-2 -2 ${qr.n + 4} ${qr.n + 4}`} role="img" aria-label={`Kode QR menuju ${alamat}`} shapeRendering="crispEdges">
                <rect x="-2" y="-2" width={qr.n + 4} height={qr.n + 4} fill="#ffffff" />
                <path d={qr.d} fill="#221C17" />
              </svg>
              <p>
                <b>Coba di HP</b>
                Pindai kode ini dengan kamera, lalu pasang ke layar utama lewat menu peramban.
              </p>
            </div>
            <a className="cta" href={KONTAK}>
              Pesan aplikasi seperti ini <span aria-hidden="true">→</span>
            </a>
            <p className="catatan">Dibuat dengan React Native + Expo: satu kode untuk Android, iOS, dan web. Data contoh hanya tersimpan di peramban kamu.</p>
          </aside>
        </div>
        {lain}
        <script dangerouslySetInnerHTML={{ __html: pemuat(src) }} />
        <aside
          id="bilah-demo"
          aria-label="Tentang situs demo ini"
          style={{ display: 'block', margin: 0, padding: '12px 16px', background: '#0f1b33', color: '#dfe6f3', font: '400 13px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', textAlign: 'center', flex: 'none' }}
        >
          Situs demo buatan PintuWeb — nama dan isinya rekaan.{' '}
          <a href={KONTAK} style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
            Buat yang seperti ini →
          </a>
        </aside>
      </body>
    </html>
  );
}
