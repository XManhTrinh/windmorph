import { BUILT_IN_THEME_NAMES, createTheme, type ThemeProviderProps } from '@windmorph/react';

/**
 * The Windmorph logo's colours (docs/plans/site-theme.md): its blue strokes average `#1F5AAB`
 * and its right-hand stroke is teal `#2CDECE`. `vibrant` keeps the blue a real blue (tonal
 * spot dulls it to slate), and the teal becomes the tertiary palette.
 */
const LOGO_BLUE = '#1F5AAB';
const LOGO_TEAL = '#2CDECE';

/** The logo's blue and teal on near-neutral surfaces (the neutrals come from tonal spot). */
export const SITE_THEME = createTheme({
  name: 'windmorph',
  seed: LOGO_BLUE,
  variant: 'vibrant',
  palettes: { tertiary: LOGO_TEAL, neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
});

/**
 * The site's default theme (2026-10-11): the docs site only. The library's built-in
 * themes and its own default (`baseline`) are unchanged, so apps using the package aren't
 * affected.
 */
export const SITE_DEFAULT_THEME = SITE_THEME.name;

/** Every theme the site's display settings offer: the logo's theme, then the six built-ins. */
export const SITE_THEMES: NonNullable<ThemeProviderProps['themes']> = [
  SITE_THEME,
  ...BUILT_IN_THEME_NAMES,
];
