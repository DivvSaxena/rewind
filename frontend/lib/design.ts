/**
 * Centralised design system for Rewind.
 *
 * Every color, font, and reusable class string lives here so the landing
 * page, debugger, and any future surface stay consistent. Components should
 * import from this file instead of hardcoding values.
 *
 * Two theme surfaces:
 *  - "dark"  : the debugger and the landing hero (zinc palette)
 *  - "light" : the warm white landing sections (stone palette)
 */

/* ------------------------------------------------------------------ */
/* Raw palette (hex values, usable in canvas / SVG / inline styles)    */
/* ------------------------------------------------------------------ */

export const palette = {
  accent: "#38bdf8", // sky-400, the product accent
  accentDeep: "#0284c7", // sky-600, accent on light backgrounds
  selected: "#f472b6", // pink, selected graph node
  warmWhite: "#faf6f0", // light section background
  warmWhiteDeep: "#f4efe7", // light footer background
  darkBg: "#0a0a0c", // graph canvas background
  linkGray: "#64748b", // graph edge base color
} as const;

/** Node colors by Cognee type, shared by the graph canvas and any legend. */
export const graphColors = {
  types: {
    Entity: "#60a5fa",
    EntityType: "#a78bfa",
    TextSummary: "#f59e0b",
    DocumentChunk: "#fb923c",
    TextDocument: "#f97316",
    NodeSet: "#34d399",
  } as Record<string, string>,
  fallback: "#94a3b8",
  highlight: palette.accent,
  selected: palette.selected,
  background: palette.darkBg,
  link: palette.linkGray,
} as const;

/** Graph animation and opacity constants. */
export const graphFx = {
  dimOpacity: 0.15,
  fadeOpacity: 0.08,
  animationMs: 350,
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fonts = {
  /** Canvas contexts cannot use CSS vars, so the family is spelled out. */
  sansCanvas: '"Plus Jakarta Sans", sans-serif',
} as const;

/* ------------------------------------------------------------------ */
/* Reusable Tailwind class strings                                     */
/* ------------------------------------------------------------------ */

export const ui = {
  /* Buttons */
  buttonPrimary:
    "rounded-md bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500",
  buttonHero:
    "rounded-md bg-zinc-100 px-6 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-white",
  buttonGhostDark:
    "rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100",

  /* Inputs */
  inputDark:
    "rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-sky-500",

  /* Panels and overlays (dark surface) */
  panelDark: "rounded-xl border border-zinc-800 bg-zinc-950/85 backdrop-blur",
  cardDark: "rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl",
  overlayDark: "bg-zinc-950/70 backdrop-blur-sm",
  chipDark:
    "rounded-md border border-zinc-800 bg-zinc-900/80 px-2 py-1 text-[11px] text-zinc-400",

  /* Cards (light surface) */
  cardLight:
    "rounded-lg border border-stone-200 bg-white/70 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-stone-300 hover:bg-white hover:shadow-xl hover:shadow-stone-900/5",

  /* Text */
  eyebrowLight:
    "text-xs font-semibold uppercase tracking-[0.25em] text-sky-600",
  headingLight: "font-semibold tracking-tight text-zinc-900",
  mutedDark: "text-zinc-400",
  mutedLight: "text-zinc-600",

  /* Footer (light surface) */
  footerHeading:
    "text-[11px] font-semibold uppercase tracking-widest text-stone-400",
  footerLink: "text-xs text-stone-500 transition-colors hover:text-zinc-900",
} as const;
