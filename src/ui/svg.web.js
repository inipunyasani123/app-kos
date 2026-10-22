// Web: elemen <svg> DOM biasa, tanpa memuat react-native-svg ke bundle web.
import { createElement } from 'react';

const el = (tag) =>
  function SvgEl({ children, ...p }) {
    return createElement(tag, p, children);
  };

export function Svg({ width, height, viewBox, children, label, style }) {
  return createElement(
    'svg',
    {
      width,
      height,
      viewBox,
      xmlns: 'http://www.w3.org/2000/svg',
      focusable: 'false',
      ...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true }),
      style: { display: 'block', flexShrink: 0, ...(style || {}) },
    },
    children,
  );
}
export const Path = el('path');
export const Rect = el('rect');
export const Circle = el('circle');
export const Ellipse = el('ellipse');
export const G = el('g');
export const Line = el('line');
export const Polygon = el('polygon');
export const Defs = el('defs');
export const Pattern = el('pattern');
