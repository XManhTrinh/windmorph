import {
  CONTRAST_LEVEL_NAMES,
  type ContrastLevel,
  type CustomColorName,
  type SchemeVariant,
  type ThemePalettes,
} from '../tokens/color';
import { assertThemeName, generateThemeCss } from './css';

export interface CreateThemeOptions {
  /** Theme name used in `data-theme`. Lowercase kebab-case, e.g. `"acme"`. */
  name: string;
  /** Seed colour as hex, e.g. `"#0B57D0"`. */
  seed: string;
  /** Colour scheme variant. Defaults to `"tonal-spot"`. */
  variant?: SchemeVariant;
  /**
   * Takes some of the scheme's palettes from elsewhere: another variant of the same seed, or
   * a hex colour. `{ neutral: 'tonal-spot', neutralVariant: 'tonal-spot' }` gives vivid
   * accents on calm surfaces; `{ tertiary: '#00A07A' }` sets a brand's own tertiary colour.
   */
  palettes?: ThemePalettes;
  /**
   * The success and warning colours (docs/plans/custom-colors.md); each defaults to a green
   * and an amber. Only hue and chroma matter: the tones follow M3's error roles.
   */
  customColors?: Partial<Record<CustomColorName, `#${string}`>>;
  /** Turns the custom colours' hues toward the seed, as Material Theme Builder does. @default true */
  harmonize?: boolean;
  /** Contrast level(s) to generate. Defaults to all three. */
  contrast?: ContrastLevel | readonly ContrastLevel[];
}

/** A generated colour theme, ready to pass to `ThemeProvider`'s `themes` prop. */
export interface ThemeDefinition {
  name: string;
  seed: string;
  variant: SchemeVariant;
  palettes: ThemePalettes;
  customColors: Partial<Record<CustomColorName, `#${string}`>>;
  harmonize: boolean;
  contrast: readonly ContrastLevel[];
  /** Light, dark and system-mode CSS for each contrast level. */
  css: string;
}

/**
 * Generates a custom colour theme from a seed colour with the M3 2025 colour spec.
 * Works at runtime and on the server; for static sites prefer the CLI, which writes
 * the same CSS to a file.
 *
 * @example
 * const acme = createTheme({ name: 'acme', seed: '#0B57D0' });
 * <ThemeProvider themes={['baseline', acme]} defaultTheme="acme">…</ThemeProvider>
 *
 * // Vivid accents on calm, nearly neutral surfaces.
 * createTheme({
 *   name: 'blue',
 *   seed: '#1877F2',
 *   variant: 'vibrant',
 *   palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
 * });
 *
 * // A brand's own status colours, at their exact hues.
 * createTheme({ name: 'shop', seed: '#0B57D0', customColors: { success: '#0B8043' }, harmonize: false });
 */
export function createTheme({
  name,
  seed,
  variant = 'tonal-spot',
  palettes = {},
  customColors = {},
  harmonize = true,
  contrast = CONTRAST_LEVEL_NAMES,
}: CreateThemeOptions): ThemeDefinition {
  assertThemeName(name);
  const contrastLevels: readonly ContrastLevel[] =
    typeof contrast === 'string' ? [contrast] : contrast;
  return {
    name,
    seed,
    variant,
    palettes,
    customColors,
    harmonize,
    contrast: contrastLevels,
    css: generateThemeCss(
      name,
      { seed, variant, palettes, customColors, harmonize },
      { contrastLevels },
    ),
  };
}
