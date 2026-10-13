import { describe, expect, it } from 'vitest';
import { COLOR_ROLES } from '../tokens';
import { createTheme } from './create-theme';
import { generateThemeCss } from './css';
import { generateSchemeColors } from './scheme';

const baseline = { seed: '#6750A4', variant: 'tonal-spot' } as const;

describe('generateSchemeColors', () => {
  it('resolves every colour role with the 2025 spec', () => {
    const colors = generateSchemeColors(baseline, false, 'standard');
    expect(Object.keys(colors)).toEqual([...COLOR_ROLES]);
    expect(colors.primary).toBe('#655789');
    for (const value of Object.values(colors)) expect(value).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('produces different light, dark and high-contrast schemes', () => {
    const light = generateSchemeColors(baseline, false, 'standard');
    const dark = generateSchemeColors(baseline, true, 'standard');
    const high = generateSchemeColors(baseline, false, 'high');
    expect(dark.surface).not.toBe(light.surface);
    expect(high['on-surface-variant']).not.toBe(light['on-surface-variant']);
  });

  it('rejects invalid seeds', () => {
    expect(() =>
      generateSchemeColors({ seed: 'purple', variant: 'tonal-spot' }, false, 'standard'),
    ).toThrow(/hex colour/);
  });
});

describe('generateThemeCss', () => {
  const css = generateThemeCss('ocean', { seed: '#0061A4', variant: 'tonal-spot' });

  it('emits light, dark and system blocks for each contrast level', () => {
    for (const contrast of ['standard', 'medium', 'high']) {
      // Light block: the selector ends the rule (or the list, for the standard fallback).
      expect(css).toMatch(
        new RegExp(`\\[data-theme="ocean"\\]\\[data-contrast="${contrast}"\\](,| \\{)`),
      );
      expect(css).toContain(`[data-theme="ocean"][data-contrast="${contrast}"][data-mode="dark"]`);
      expect(css).toContain(
        `[data-theme="ocean"][data-contrast="${contrast}"][data-mode="system"]`,
      );
    }
    expect(css.match(/@media \(prefers-color-scheme: dark\)/g)).toHaveLength(3);
    expect(css).toContain('color-scheme: dark;');
  });

  it('treats a missing data-contrast as standard', () => {
    expect(css).toContain('[data-theme="ocean"]:not([data-contrast]) {');
  });

  it('applies the default theme where no data-theme is set', () => {
    const defaultCss = generateThemeCss('baseline', baseline, { isDefault: true });
    expect(defaultCss).toContain(':root:not([data-theme]):not([data-contrast]) {');
    expect(css).not.toContain(':root:not([data-theme])');
  });
});

describe('createTheme', () => {
  it('returns a named definition with CSS for the requested contrast levels', () => {
    const theme = createTheme({ name: 'acme', seed: '#0B57D0', contrast: 'high' });
    expect(theme).toMatchObject({ name: 'acme', seed: '#0B57D0', variant: 'tonal-spot' });
    expect(theme.contrast).toEqual(['high']);
    expect(theme.css).toContain('[data-theme="acme"][data-contrast="high"]');
    expect(theme.css).not.toContain('data-contrast="standard"');
  });

  it('rejects names that are not valid data-theme values', () => {
    expect(() => createTheme({ name: 'Acme Blue', seed: '#0B57D0' })).toThrow(/kebab-case/);
  });
});
