import { Hct, argbFromHex } from '@material/material-color-utilities';
import { describe, expect, it } from 'vitest';
import { BUILT_IN_THEMES, CONTRAST_LEVEL_NAMES, type ColorRole, type ThemeSeed } from '../tokens';
import { createTheme } from './create-theme';
import { generateThemeCss } from './css';
import { parsePalettes } from './parse-palettes';
import { generateSchemeColors } from './scheme';

const blue = { seed: '#1877F2', variant: 'vibrant' } as const;
const calmBlue: ThemeSeed = {
  ...blue,
  palettes: { neutral: 'tonal-spot', neutralVariant: 'tonal-spot' },
};

/** Roles whose tones come from the primary, secondary, tertiary or error palettes. */
const ACCENT = /^(on-)?(primary|secondary|tertiary|error|inverse-primary|surface-tint)/;
/** Roles whose tones come from the neutral or neutral-variant palettes. */
const NEUTRAL = /^(on-)?(surface|background)|^(outline|inverse-surface|inverse-on-surface)/;

const chroma = (hex: string) => Hct.fromInt(argbFromHex(hex)).chroma;

function contrast(a: string, b: string): number {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);
    const [r = 0, g = 0, bl = 0] = channels.map((c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (high + 0.05) / (low + 0.05);
}

const TEXT_PAIRS: [ColorRole, ColorRole][] = [
  ['on-primary', 'primary'],
  ['on-primary-container', 'primary-container'],
  ['on-secondary', 'secondary'],
  ['on-secondary-container', 'secondary-container'],
  ['on-tertiary', 'tertiary'],
  ['on-tertiary-container', 'tertiary-container'],
  ['on-error', 'error'],
  ['on-error-container', 'error-container'],
  ['on-surface', 'surface'],
  ['on-surface', 'surface-container-highest'],
  ['on-surface-variant', 'surface'],
  ['inverse-on-surface', 'inverse-surface'],
];

describe('createTheme palettes', () => {
  it('leaves every built-in theme unchanged without palettes', () => {
    for (const [name, seed] of Object.entries(BUILT_IN_THEMES)) {
      expect(generateThemeCss(name, { ...seed, palettes: {} })).toBe(generateThemeCss(name, seed));
    }
  });

  it('keeps the accents of the variant and calms the surfaces with tonal-spot neutrals', () => {
    for (const isDark of [false, true]) {
      for (const level of CONTRAST_LEVEL_NAMES) {
        const vibrant = generateSchemeColors(blue, isDark, level);
        const calm = generateSchemeColors(calmBlue, isDark, level);
        for (const role of Object.keys(vibrant) as ColorRole[]) {
          if (ACCENT.test(role)) expect(calm[role], `${role} ${level}`).toBe(vibrant[role]);
        }
        for (const role of ['surface', 'surface-container', 'background'] as const) {
          expect(NEUTRAL.test(role)).toBe(true);
          expect(chroma(calm[role]), role).toBeLessThan(chroma(vibrant[role]));
          expect(chroma(calm[role]), role).toBeLessThan(8);
        }
      }
    }
  });

  it('gives the calm blue its approved values (2026-10-08)', () => {
    const dark = generateSchemeColors(calmBlue, true, 'standard');
    const light = generateSchemeColors(calmBlue, false, 'standard');
    expect(dark.primary).toBe('#84adff');
    expect(dark.surface).toBe('#0d0e12');
    expect(light.primary).toBe('#0058bb');
    expect(light.surface).toBe('#f7f6fb');
  });

  it('builds a palette from a hex colour', () => {
    const lotus = { seed: '#D63A7A', variant: 'vibrant' } as const;
    const plain = generateSchemeColors(lotus, false, 'standard');
    const jadeTertiary = generateSchemeColors(
      { ...lotus, palettes: { tertiary: '#00A07A' } },
      false,
      'standard',
    );
    const jadeHue = Hct.fromInt(argbFromHex('#00A07A')).hue;
    expect(Math.abs(Hct.fromInt(argbFromHex(jadeTertiary.tertiary)).hue - jadeHue)).toBeLessThan(6);
    expect(jadeTertiary.tertiary).not.toBe(plain.tertiary);
    expect(jadeTertiary.primary).toBe(plain.primary);
  });

  it('keeps text readable on its container at standard contrast, whatever the palettes', () => {
    const themes: ThemeSeed[] = [
      ...Object.values(BUILT_IN_THEMES),
      calmBlue,
      { seed: '#D63A7A', variant: 'vibrant', palettes: { tertiary: '#00A07A' } },
      { seed: '#F26B38', variant: 'vibrant', palettes: { neutral: '#888888' } },
    ];
    for (const theme of themes) {
      for (const isDark of [false, true]) {
        const colors = generateSchemeColors(theme, isDark, 'standard');
        for (const [text, container] of TEXT_PAIRS) {
          expect(
            contrast(colors[text], colors[container]),
            `${theme.seed} ${isDark ? 'dark' : 'light'} ${text} on ${container}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });

  it('rejects unknown palettes and sources', () => {
    const bad = (palettes: Record<string, string>) => () =>
      generateSchemeColors({ ...blue, palettes } as ThemeSeed, false, 'standard');
    expect(bad({ accent: 'tonal-spot' })).toThrow(/Unknown palette "accent"/);
    expect(bad({ neutral: 'calm' })).toThrow(/scheme variant .* or a hex colour/);
    expect(bad({ tertiary: '#12' })).toThrow(/hex colour/);
  });

  it('records the palettes on the theme definition', () => {
    const theme = createTheme({ name: 'blue', ...calmBlue });
    expect(theme.palettes).toEqual(calmBlue.palettes);
    expect(theme.css).toContain('--md-sys-color-surface: #0d0e12;');
  });
});

describe('parsePalettes (the CLI --palette option)', () => {
  it('reads kebab- and camel-case names, repeated', () => {
    expect(
      parsePalettes(['neutral=tonal-spot', 'neutral-variant=tonal-spot', 'tertiary=#00A07A']),
    ).toEqual({ neutral: 'tonal-spot', neutralVariant: 'tonal-spot', tertiary: '#00A07A' });
    expect(parsePalettes(['neutralVariant=vibrant'])).toEqual({ neutralVariant: 'vibrant' });
  });

  it('rejects entries without a known name or a source', () => {
    expect(() => parsePalettes(['accent=vibrant'])).toThrow(/--palette expects/);
    expect(() => parsePalettes(['neutral'])).toThrow(/--palette expects/);
    expect(() => parsePalettes(['neutral='])).toThrow(/--palette expects/);
  });
});
