import { Hct, argbFromHex } from '@material/material-color-utilities';
import { describe, expect, it } from 'vitest';
import {
  BUILT_IN_THEMES,
  BUILT_IN_THEME_NAMES,
  CONTRAST_LEVEL_NAMES,
  CUSTOM_COLORS,
  CUSTOM_COLOR_ROLES,
  SCHEME_VARIANTS,
  type ColorRole,
} from '../tokens/color';
import { createTheme } from './create-theme';
import { parseCustomColors } from './parse-palettes';
import { generateSchemeColors } from './scheme';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => {
    const value = parseInt(hex.slice(index, index + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

const hue = (hex: string) => Hct.fromInt(argbFromHex(hex)).hue;

/**
 * WCAG 2.2 AA for normal text on every custom colour's pairs (on-colour on colour, and
 * on-container on container), and 3:1 for the colour itself on the surface (non-text).
 */
function expectReadable(colors: Record<ColorRole, string>, where: string): void {
  for (const color of CUSTOM_COLORS) {
    const pairs = [
      [`on-${color}`, color],
      [`on-${color}-container`, `${color}-container`],
    ] as const satisfies readonly (readonly [ColorRole, ColorRole])[];
    for (const [text, background] of pairs) {
      expect(
        contrast(colors[text], colors[background]),
        `${where}: ${text} ${colors[text]} on ${background} ${colors[background]}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
    expect(
      contrast(colors[color], colors.surface),
      `${where}: ${color} on surface`,
    ).toBeGreaterThanOrEqual(3);
  }
}

describe('custom colours (success, warning)', () => {
  it('adds four roles for each', () => {
    expect(CUSTOM_COLOR_ROLES).toEqual([
      'success',
      'on-success',
      'success-container',
      'on-success-container',
      'warning',
      'on-warning',
      'warning-container',
      'on-warning-container',
    ]);
  });

  it('is readable in every built-in theme, mode and contrast level', () => {
    for (const name of BUILT_IN_THEME_NAMES) {
      for (const isDark of [false, true]) {
        for (const level of CONTRAST_LEVEL_NAMES) {
          const colors = generateSchemeColors(BUILT_IN_THEMES[name], isDark, level);
          expectReadable(colors, `${name} ${isDark ? 'dark' : 'light'} ${level}`);
        }
      }
    }
  });

  // Seeds and brand colours chosen to stress the tone solver: very light, very dark,
  // saturated and near-grey seeds, and status colours of every lightness. One test per
  // seed and variant: together they build 720 schemes, too slow for one test on CI.
  const seeds = ['#0B57D0', '#FFEB3B', '#00140A', '#E91E63', '#9E9E9E'] as const;
  const brands = [
    { success: '#0B8043', warning: '#E37400' },
    { success: '#B9F6CA', warning: '#FFF59D' },
    { success: '#003300', warning: '#4E2600' },
  ] as const;
  const consumerThemes = seeds.flatMap((seed) =>
    SCHEME_VARIANTS.map((variant) => [seed, variant] as const),
  );

  it.each(consumerThemes)(
    'is readable in consumer themes (%s %s): brand colours, harmonised or exact',
    (seed, variant) => {
      for (const [index, customColors] of brands.entries()) {
        for (const harmonize of [true, false]) {
          for (const isDark of [false, true]) {
            for (const level of CONTRAST_LEVEL_NAMES) {
              const colors = generateSchemeColors(
                { seed, variant, customColors, harmonize },
                isDark,
                level,
              );
              const where = `${seed} ${variant} brand ${index} harmonize=${String(harmonize)} ${isDark ? 'dark' : 'light'} ${level}`;
              expectReadable(colors, where);
            }
          }
        }
      }
    },
  );

  it('keeps green and amber, harmonised toward the seed', () => {
    const colors = generateSchemeColors(BUILT_IN_THEMES.baseline, false, 'standard');
    expect(hue(colors.success)).toBeGreaterThan(120);
    expect(hue(colors.success)).toBeLessThan(180);
    expect(hue(colors.warning)).toBeGreaterThan(40);
    expect(hue(colors.warning)).toBeLessThan(100);
  });

  it('takes a brand colour, exactly when harmonising is off', () => {
    const seed = { seed: '#6750A4', variant: 'tonal-spot' as const };
    const brand = { customColors: { success: '#0B8043' as const } };
    const harmonised = generateSchemeColors({ ...seed, ...brand }, false, 'standard');
    const exact = generateSchemeColors({ ...seed, ...brand, harmonize: false }, false, 'standard');
    expect(Math.abs(hue(exact.success) - hue('#0B8043'))).toBeLessThan(3);
    expect(harmonised.success).not.toBe(exact.success);
  });

  it('writes the roles into theme CSS', () => {
    const { css } = createTheme({ name: 'acme', seed: '#0B57D0', contrast: 'standard' });
    for (const role of CUSTOM_COLOR_ROLES) expect(css).toContain(`--md-sys-color-${role}:`);
  });

  it('reads the CLI entries and refuses unknown ones', () => {
    expect(parseCustomColors(['success=#0B8043', 'warning=#E37400'])).toEqual({
      success: '#0B8043',
      warning: '#E37400',
    });
    expect(() => parseCustomColors(['info=#0B8043'])).toThrow(/success, warning/);
    expect(() => parseCustomColors(['success'])).toThrow();
  });
});
