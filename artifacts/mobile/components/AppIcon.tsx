import React from "react";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, G } from "react-native-svg";

interface AppIconProps {
  size?: number;
}

export function AppIcon({ size = 64 }: AppIconProps) {
  const s = size;
  const r = s * 0.22;
  return (
    <Svg width={s} height={s} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#4C6FFF" />
          <Stop offset="100%" stopColor="#7C47FF" />
        </LinearGradient>
        <LinearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#A5B4FC" stopOpacity="0.6" />
        </LinearGradient>
        <LinearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#FFD700" />
          <Stop offset="100%" stopColor="#FF9500" />
        </LinearGradient>
      </Defs>

      {/* Background */}
      <Rect x="0" y="0" width="100" height="100" rx="22" fill="url(#bg)" />

      {/* Glass overlay */}
      <Rect x="0" y="0" width="100" height="50" rx="22" fill="rgba(255,255,255,0.06)" />

      {/* Brain outline - left hemisphere */}
      <Path
        d="M 30 62 Q 20 58 18 48 Q 16 38 22 30 Q 28 22 38 22 Q 44 22 48 28 L 48 72 Q 42 74 36 72 Q 30 68 30 62 Z"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2"
      />

      {/* Brain outline - right hemisphere */}
      <Path
        d="M 70 62 Q 80 58 82 48 Q 84 38 78 30 Q 72 22 62 22 Q 56 22 52 28 L 52 72 Q 58 74 64 72 Q 70 68 70 62 Z"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth="2"
      />

      {/* Center divider */}
      <Path d="M 48 26 L 52 26 L 52 74 L 48 74 Z" fill="rgba(255,255,255,0.3)" />

      {/* Neural nodes - left */}
      <Circle cx="30" cy="36" r="3.5" fill="url(#glow)" />
      <Circle cx="26" cy="50" r="3" fill="url(#glow)" />
      <Circle cx="34" cy="58" r="3" fill="url(#glow)" />

      {/* Neural nodes - right */}
      <Circle cx="70" cy="36" r="3.5" fill="url(#glow)" />
      <Circle cx="74" cy="50" r="3" fill="url(#glow)" />
      <Circle cx="66" cy="58" r="3" fill="url(#glow)" />

      {/* Lightning bolt center */}
      <Path
        d="M 53 32 L 46 52 L 51 52 L 47 68 L 58 46 L 53 46 L 57 32 Z"
        fill="url(#spark)"
        stroke="rgba(255,200,0,0.3)"
        strokeWidth="0.5"
      />

      {/* Top shimmer */}
      <Rect x="20" y="10" width="40" height="6" rx="3" fill="rgba(255,255,255,0.12)" />
    </Svg>
  );
}
