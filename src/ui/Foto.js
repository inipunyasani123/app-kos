import { View, Image } from 'react-native';
import { W } from '../lib/tema';

/** Foto dengan rasio tetap (Android/iOS). Versi web ada di Foto.web.js. */
export function Foto({ source, rasio = 4 / 3, label, style, children }) {
  return (
    <View style={[{ width: '100%', aspectRatio: rasio, overflow: 'hidden', backgroundColor: W.garis }, style]}>
      <Image source={source} resizeMode="cover" aria-label={label} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      {children}
    </View>
  );
}
