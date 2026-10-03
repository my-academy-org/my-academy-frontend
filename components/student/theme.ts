import type { CSSProperties } from "react";

/**
 * Re-points the design system's brand scale at the academy's colour, so every
 * `brand-*` utility (buttons, focus rings, progress) inside the student area
 * wears the academy's identity instead of the platform's green.
 */
const scale: [shade: number, mix: number, base: "white" | "black" | null][] = [
  [50, 7, "white"],
  [100, 14, "white"],
  [200, 28, "white"],
  [300, 48, "white"],
  [400, 76, "white"],
  [500, 100, null],
  [600, 88, "black"],
  [700, 74, "black"],
  [800, 60, "black"],
  [900, 46, "black"],
  [950, 32, "black"],
];

export function accentTheme(accent: string): CSSProperties {
  const vars: Record<string, string> = { "--accent": accent };
  for (const [shade, mix, base] of scale) {
    vars[`--color-brand-${shade}`] = base ? `color-mix(in oklab, var(--accent) ${mix}%, ${base})` : "var(--accent)";
  }
  return vars as CSSProperties;
}
