/**
 * M3 colour roles, built-in themes and contrast levels.
 *
 * Role names are the kebab-case form of the `MaterialDynamicColors` methods in
 * `@material/material-color-utilities`, plus the custom-colour roles (`success`,
 * `warning`; see {@link CUSTOM_COLOR_ROLES}). They become `--md-sys-color-<role>` CSS
 * variables and `bg-<role>` / `text-<role>` / … Tailwind utilities.
 */

export const COLOR_ROLES = [
  'primary',
  'on-primary',
  'primary-container',
  'on-primary-container',
  'inverse-primary',
  'primary-fixed',
  'primary-fixed-dim',
  'on-primary-fixed',
  'on-primary-fixed-variant',
  'secondary',
  'on-secondary',
  'secondary-container',
  'on-secondary-container',
  'secondary-fixed',
  'secondary-fixed-dim',
  'on-secondary-fixed',
  'on-secondary-fixed-variant',
  'tertiary',
  'on-tertiary',
  'tertiary-container',
  'on-tertiary-container',
  'tertiary-fixed',
  'tertiary-fixed-dim',
  'on-tertiary-fixed',
  'on-tertiary-fixed-variant',
  'error',
  'on-error',
  'error-container',
  'on-error-container',
  'background',
  'on-background',
  'surface',
  'surface-dim',
  'surface-bright',
  'surface-container-lowest',
  'surface-container-low',
  'surface-container',
  'surface-container-high',
  'surface-container-highest',
  'on-surface',
  'surface-variant',
  'on-surface-variant',
  'inverse-surface',
  'inverse-on-surface',
  'outline',
  'outline-variant',
  'shadow',
  'scrim',
  'surface-tint',
  'success',
  'on-success',
  'success-container',
  'on-success-container',
  'warning',
  'on-warning',
  'warning-container',
  'on-warning-container',
] as const;

/** An M3 colour role, such as `primary` or `on-surface-variant` (`--md-sys-color-<role>`). */
export type ColorRole = (typeof COLOR_ROLES)[number];

/**
 * Colours M3 has no key colour for, generated the way Material Theme Builder makes "custom
 * colours": each gets colour, on-colour, container and on-container roles, with the error
 * roles' tone rules (so the same contrast as error), harmonised toward the theme's seed.
 */
export const CUSTOM_COLORS = ['success', 'warning'] as const;
export type CustomColorName = (typeof CUSTOM_COLORS)[number];

/** The four roles of each custom colour. */
export const CUSTOM_COLOR_ROLES = COLOR_ROLES.filter((role) =>
  CUSTOM_COLORS.some((name) => role.includes(name)),
);

/** The default custom colours; only their hue and chroma matter, not their lightness. */
export const DEFAULT_CUSTOM_COLORS: Readonly<Record<CustomColorName, `#${string}`>> = {
  success: '#1E8E3E',
  warning: '#F9AB00',
};

/** Scheme variants supported by the 2025 colour spec. */
export const SCHEME_VARIANTS = ['tonal-spot', 'neutral', 'vibrant', 'expressive'] as const;
export type SchemeVariant = (typeof SCHEME_VARIANTS)[number];

/**
 * The six tonal palettes an M3 scheme is built from: the "core colours" of Material Theme
 * Builder. Every colour role takes its tone from one of them.
 */
export const PALETTE_NAMES = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'neutral',
  'neutralVariant',
] as const;
export type PaletteName = (typeof PALETTE_NAMES)[number];

/**
 * Where a palette comes from: a scheme variant (that palette from that variant of the same
 * seed) or a hex colour (a palette built from its hue and chroma, as Material Theme Builder
 * does for a core colour).
 */
export type PaletteSource = SchemeVariant | `#${string}`;

/** Per-palette sources; any palette left out comes from the theme's own `variant`. */
export type ThemePalettes = Partial<Record<PaletteName, PaletteSource>>;

export interface ThemeSeed {
  seed: string;
  variant: SchemeVariant;
  /**
   * Takes some palettes from elsewhere, e.g. `{ neutral: 'tonal-spot', neutralVariant:
   * 'tonal-spot' }` for vivid accents on calm surfaces, or `{ tertiary: '#00A07A' }` for a
   * brand's own tertiary colour. Roles still take their tones from the M3 spec, so contrast
   * is unchanged.
   */
  palettes?: ThemePalettes;
  /** The success and warning colours; each defaults to {@link DEFAULT_CUSTOM_COLORS}. */
  customColors?: Partial<Record<CustomColorName, `#${string}`>>;
  /**
   * Turns each custom colour's hue up to 15° toward the seed, as Material Theme Builder
   * does, so it belongs to the theme. `false` keeps a brand's exact status colours.
   * @default true
   */
  harmonize?: boolean;
}

/** The six built-in themes: each one's seed colour and scheme variant. */
export const BUILT_IN_THEMES = {
  baseline: { seed: '#6750A4', variant: 'tonal-spot' },
  ocean: { seed: '#0061A4', variant: 'tonal-spot' },
  forest: { seed: '#386A20', variant: 'tonal-spot' },
  sunset: { seed: '#A04100', variant: 'tonal-spot' },
  rose: { seed: '#9C4146', variant: 'tonal-spot' },
  slate: { seed: '#545F71', variant: 'neutral' },
} as const satisfies Record<string, ThemeSeed>;

export type BuiltInThemeName = keyof typeof BUILT_IN_THEMES;
/** The built-in themes' names, in order: `baseline`, `ocean`, `forest`, `sunset`, `rose`, `slate`. */
export const BUILT_IN_THEME_NAMES = Object.keys(BUILT_IN_THEMES) as BuiltInThemeName[];
export const DEFAULT_THEME: BuiltInThemeName = 'baseline';

export const COLOR_MODES = ['light', 'dark', 'system'] as const;
export type ColorMode = (typeof COLOR_MODES)[number];
export type ResolvedColorMode = Exclude<ColorMode, 'system'>;

/** Contrast levels and the `contrastLevel` passed to the colour library. */
export const CONTRAST_LEVELS = { standard: 0, medium: 0.5, high: 1 } as const;
export type ContrastLevel = keyof typeof CONTRAST_LEVELS;
/** The contrast levels' names: `standard`, `medium` and `high`. */
export const CONTRAST_LEVEL_NAMES = Object.keys(CONTRAST_LEVELS) as ContrastLevel[];
