// Diekspor sebagai dist/404.html supaya Vercel menyajikan halaman 404 bergaya (status 404).
import { meta } from '../lib/meta';
import TidakAda from './+not-found';

export function generateMetadata() {
  return meta({ judul: 'Halaman tidak ditemukan · Grendel', deskripsi: 'Alamat ini tidak ada di aplikasi kos Grendel.', path: '/404', noindex: true });
}

export default TidakAda;
