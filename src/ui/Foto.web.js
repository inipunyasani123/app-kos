import { createElement } from 'react';
import { View } from 'react-native';
import { W } from '../lib/tema';

// Web: <img> asli supaya foto sudah ada di HTML statis (Image RN-web baru memuat sumber setelah JavaScript jalan).
export function Foto({ source, rasio = 4 / 3, label, style, children, utama }) {
  const uri = typeof source === 'object' && source ? source.uri : source;
  return (
    <View style={[{ width: '100%', aspectRatio: rasio, overflow: 'hidden', backgroundColor: W.garis }, style]}>
      {createElement('img', {
        src: uri,
        alt: label || '',
        width: source?.width,
        height: source?.height,
        decoding: 'async',
        loading: utama ? 'eager' : 'lazy',
        fetchPriority: utama ? 'high' : undefined,
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
      })}
      {children}
    </View>
  );
}
