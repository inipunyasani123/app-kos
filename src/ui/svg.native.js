// Android/iOS: react-native-svg dengan antarmuka yang sama seperti svg.web.js.
import RNSvg, { Path, Rect, Circle, Ellipse, G, Line, Polygon, Defs, Pattern } from 'react-native-svg';

export function Svg({ width, height, viewBox, children, label, style }) {
  return (
    <RNSvg
      width={width}
      height={height}
      viewBox={viewBox}
      style={style}
      accessible={!!label}
      accessibilityLabel={label}
      importantForAccessibility={label ? 'yes' : 'no-hide-descendants'}
    >
      {children}
    </RNSvg>
  );
}
export { Path, Rect, Circle, Ellipse, G, Line, Polygon, Defs, Pattern };
