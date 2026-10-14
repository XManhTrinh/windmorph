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
      expect(css).toContain(`:where([data-theme="ocean"][data-contrast="${contrast}"])`);
      expect(css).toContain(
        `:where([data-theme="ocean"][data-contrast="${contrast}"][data-mode="dark"])`,
      );
      expect(css).toContain(
        `:where([data-theme="ocean"][data-contrast="${contrast}"][data-mode="system"])`,
      );
    }
    expect(css.match(/@media \(prefers-color-scheme: dark\)/g)).toHaveLength(3);
    expect(css).toContain('color-scheme: dark;');
  });

  it('treats a missing data-contrast as standard', () => {
    expect(css).toContain(':where([data-theme="ocean"]:not([data-contrast])) {');
  });

  it('applies the default theme where no data-theme is set', () => {
    const defaultCss = generateThemeCss('baseline', baseline, { isDefault: true });
    expect(defaultCss).toContain(':where(:root:not([data-theme]):not([data-contrast])) {');
    expect(css).not.toContain(':root:not([data-theme])');
  });

  it('gives every selector zero specificity, so a plain consumer rule wins', () => {
    const defaultCss = generateThemeCss('baseline', baseline, { isDefault: true });
    for (const source of [css, defaultCss]) {
      const selectors = [...source.matchAll(/^([^\s@}][^{]*)\{/gm)].flatMap(([, list]) =>
        list!.split(',\n').map((selector) => selector.trim()),
      );
      expect(selectors.length).toBeGreaterThan(0);
      for (const selector of selectors) expect(selector).toMatch(/^:where\(.*\)$/);
    }
  });

  it('writes light before dark and system in each contrast level, so the mode rule wins', () => {
    for (const contrast of ['standard', 'medium', 'high']) {
      const base = `[data-theme="ocean"][data-contrast="${contrast}"]`;
      const light = css.indexOf(`:where(${base})`);
      const dark = css.indexOf(`:where(${base}[data-mode="dark"])`);
      const system = css.indexOf(`:where(${base}[data-mode="system"])`);
      expect(light).toBeGreaterThanOrEqual(0);
      expect(dark).toBeGreaterThan(light);
      expect(system).toBeGreaterThan(dark);
    }
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
