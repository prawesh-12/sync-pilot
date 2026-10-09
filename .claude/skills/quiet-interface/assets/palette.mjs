// Generates a full quiet-interface colour token set from a brand colour.
//
//   node palette.mjs --accent "#6d5efc"                  dark and light, warm neutral base
//   node palette.mjs --accent "#0f9d58" --hue 150         neutrals leaning toward the brand
//   node palette.mjs --accent "#e5484d" --contrast high   wider text and surface steps
//   node palette.mjs --accent "#2f6fe0" --chroma 0        perfectly neutral greys
//
// Prints CSS for :root (dark) and :root[data-theme="light"] to paste over the colour section of
// tokens.css. Everything is computed in OKLCH, so equal lightness steps look equal.

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(" ")
    .split("--")
    .filter(Boolean)
    .map((part) => {
      const [key, ...rest] = part.trim().split(/\s+/);
      return [key, rest.join(" ").replace(/^["']|["']$/g, "")];
    }),
);

const accentHex = args.accent ?? "#3b82f6";
const baseHue = Number(args.hue ?? 75);
const baseChroma = Number(args.chroma ?? 0.003);
const high = args.contrast === "high";

// sRGB <-> OKLab <-> OKLCH (Björn Ottosson's reference matrices)
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(n.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360 };
}

function oklchToRgb({ l, c, h }) {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
}

// Lower chroma until the colour fits sRGB, so bright accents never clip to a different hue.
function oklchToHex(color) {
  let { c } = color;
  let rgb = oklchToRgb({ ...color, c });
  while (rgb.some((v) => v < -0.0005 || v > 1.0005) && c > 0) {
    c -= 0.002;
    rgb = oklchToRgb({ ...color, c });
  }
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255))
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

const grey = (l, c = baseChroma) => oklchToHex({ l, c, h: baseHue });
const accent = hexToOklch(accentHex);
const tone = (l, c) => oklchToHex({ l, c: Math.min(c, accent.c), h: accent.h });

// Text steps spread further apart under high contrast.
const t = high ? [0.98, 0.88, 0.76, 0.68, 0.52] : [0.96, 0.83, 0.69, 0.61, 0.5];
const tl = high ? [0.12, 0.28, 0.42, 0.52, 0.72] : [0.2, 0.35, 0.5, 0.6, 0.76];

const dark = {
  "bg-chrome": grey(high ? 0.15 : 0.18),
  "bg-panel": grey(high ? 0.19 : 0.21),
  "bg-sunken": grey(0.165),
  "bg-raised": grey(0.245),
  "bg-hover": grey(0.26),
  "bg-active": grey(0.3),
  "bg-selected": grey(0.28),
  "text-primary": grey(t[0]),
  "text-secondary": grey(t[1], baseChroma + 0.001),
  "text-tertiary": grey(t[2], baseChroma + 0.001),
  "text-quaternary": grey(t[3], baseChroma + 0.001),
  "text-disabled": grey(t[4], baseChroma + 0.001),
  accent: tone(Math.min(Math.max(accent.l, 0.58), 0.68), accent.c),
  "accent-hover": tone(Math.min(Math.max(accent.l, 0.58), 0.68) + 0.06, accent.c),
  "accent-pressed": tone(Math.min(Math.max(accent.l, 0.58), 0.68) - 0.05, accent.c),
  "accent-text": tone(0.76, Math.min(accent.c, 0.13)),
};

const light = {
  "bg-chrome": grey(0.962),
  "bg-panel": grey(0.991),
  "bg-sunken": grey(0.951),
  "bg-raised": "#ffffff",
  "bg-hover": grey(0.945),
  "bg-active": grey(high ? 0.89 : 0.915),
  "bg-selected": grey(0.93),
  "text-primary": grey(tl[0]),
  "text-secondary": grey(tl[1], baseChroma + 0.002),
  "text-tertiary": grey(tl[2], baseChroma + 0.002),
  "text-quaternary": grey(tl[3], baseChroma + 0.002),
  "text-disabled": grey(tl[4], baseChroma + 0.002),
  accent: tone(Math.min(Math.max(accent.l, 0.5), 0.6), accent.c),
  "accent-hover": tone(Math.min(Math.max(accent.l, 0.5), 0.6) + 0.05, accent.c),
  "accent-pressed": tone(Math.min(Math.max(accent.l, 0.5), 0.6) - 0.06, accent.c),
  "accent-text": tone(0.5, accent.c),
};

const rgba = (hex, alpha) => {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function block(selector, vars, lines, focusAlpha, subtleAlpha) {
  const body = Object.entries(vars).map(([k, v]) => `  --${k}: ${v};`);
  body.push(`  --accent-subtle: ${rgba(vars.accent, subtleAlpha)};`);
  body.push(`  --focus-ring: ${rgba(vars["accent-text"], focusAlpha)};`);
  body.push(...lines.map((line) => `  ${line}`));
  return `${selector} {\n${body.join("\n")}\n}`;
}

console.log(
  [
    `/* accent ${accentHex}, base hue ${baseHue}, base chroma ${baseChroma}, contrast ${high ? "high" : "default"} */`,
    block(
      ":root",
      dark,
      [
        "--border-subtle: rgba(255, 255, 255, 0.05);",
        "--border-default: rgba(255, 255, 255, 0.07);",
        `--border-strong: rgba(255, 255, 255, ${high ? 0.16 : 0.12});`,
      ],
      0.6,
      0.16,
    ),
    block(
      ':root[data-theme="light"]',
      light,
      [
        "--border-subtle: rgba(0, 0, 0, 0.06);",
        "--border-default: rgba(0, 0, 0, 0.09);",
        `--border-strong: rgba(0, 0, 0, ${high ? 0.2 : 0.15});`,
      ],
      0.5,
      0.1,
    ),
  ].join("\n\n"),
);
