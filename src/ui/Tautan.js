import { Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Tautan internal: <a href> di web (bisa dibuka di tab baru, terbaca sebagai link), navigasi klien saat diklik.
// Dipakai sebagai pengganti <Link asChild>, yang membuang style berbentuk fungsi milik Pressable.
export function Tautan({ href, children, ...p }) {
  const router = useRouter();
  const tekan = (e) => {
    if (Platform.OS === 'web' && e) {
      if (e.defaultPrevented || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || (e.button != null && e.button !== 0)) return;
      e.preventDefault?.();
    }
    router.navigate(href);
  };
  return (
    <Pressable {...p} href={href} role="link" onPress={tekan}>
      {children}
    </Pressable>
  );
}
