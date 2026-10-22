import { APP } from './data';

const OG = `${APP.url}/og.jpg`;

/** Metadata per rute untuk generateMetadata() (dirender ke HTML statis saat build). */
export function meta({ judul, deskripsi, path = '/', noindex = false }) {
  const url = path === '/' ? `${APP.url}/` : `${APP.url}${path}`;
  return {
    title: judul,
    description: deskripsi,
    applicationName: 'Grendel',
    authors: { name: 'PintuWeb', url: 'https://www.pintuweb.id' },
    creator: 'PintuWeb',
    publisher: 'PintuWeb',
    alternates: noindex ? undefined : { canonical: url },
    robots: noindex
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    formatDetection: { telephone: false },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      url,
      siteName: 'Grendel · demo aplikasi PintuWeb',
      title: judul,
      description: deskripsi,
      images: [{ url: OG, width: 1200, height: 630, alt: 'Aplikasi kos Grendel: tagihan sewa, laporan kerusakan, dan denah kamar di layar ponsel' }],
    },
    twitter: { card: 'summary_large_image', title: judul, description: deskripsi, images: [OG] },
  };
}
