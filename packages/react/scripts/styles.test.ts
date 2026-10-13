// @vitest-environment node
import { compile } from '@tailwindcss/node';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { generateTailwindThemeCss, generateTokensCss } from './lib/token-css';

const base = fileURLToPath(new URL('../src/styles/', import.meta.url));

async function build(candidates: string[]) {
  const compiler = await compile(`@import 'tailwindcss';\n@import './styles.css';`, {
    base,
    onDependency: () => {},
  });
  return compiler.build(candidates);
}

/** The declarations of the first rule whose selector contains `selector`. */
function rule(css: string, selector: string): string {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`No rule for ${selector}`);
  let depth = 0;
  let i = css.indexOf('{', start);
  const from = i;
  for (; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) break;
  }
  return css.slice(from, i + 1);
}

describe('styles.css', () => {
  let css: string;

  beforeAll(async () => {
    css = await build([
      'bg-primary',
      'text-on-surface',
      'text-body-large',
      'font-brand',
      'rounded-corner-full',
      'shadow-elevation-3',
      'ease-m3-spatial-fast',
      'duration-m3-spatial-fast',
      'medium:bg-primary',
      'dark:bg-surface',
      'state-layer',
      'focus-ring',
      'focus-ring-inset',
    ]);
  });

  it('maps utilities to M3 system tokens', () => {
    expect(rule(css, '.bg-primary')).toContain('background-color: var(--md-sys-color-primary)');
    expect(rule(css, '.text-on-surface')).toContain('color: var(--md-sys-color-on-surface)');
    const body = rule(css, '.text-body-large');
    expect(body).toContain('var(--md-sys-typescale-body-large-size)');
    expect(body).toContain('var(--md-sys-typescale-body-large-line-height)');
    expect(body).toContain('var(--md-sys-typescale-body-large-tracking)');
    expect(body).toContain('var(--md-sys-typescale-body-large-weight)');
    expect(rule(css, '.rounded-corner-full')).toContain('var(--md-sys-shape-corner-full)');
    expect(rule(css, '.shadow-elevation-3')).toContain('var(--md-sys-elevation-level-3)');
    expect(rule(css, '.ease-m3-spatial-fast')).toContain(
      'var(--md-sys-motion-spring-spatial-fast-easing)',
    );
    expect(rule(css, '.duration-m3-spatial-fast')).toContain(
      'var(--md-sys-motion-spring-spatial-fast-duration)',
    );
  });

  it('adds the M3 window size classes as breakpoints', () => {
    expect(css).toMatch(/@media \(width >= 600px\)\s*\{\s*\.medium\\:bg-primary/);
  });

  it('drives dark: from data-mode, including system mode', () => {
    expect(css).toContain('[data-mode="dark"]');
    expect(css).toMatch(/prefers-color-scheme: dark[^}]*data-mode="system"/);
  });

  it('ships all built-in themes and the token variables', () => {
    for (const theme of ['baseline', 'ocean', 'forest', 'sunset', 'rose', 'slate']) {
      expect(css).toContain(`[data-theme="${theme}"]`);
    }
    expect(css).toContain('--md-sys-state-hover-state-layer-opacity: 0.08');
    expect(css).toContain('--md-sys-motion-spring-spatial-fast-easing: linear(');
  });

  it('keeps interaction utilities layout-neutral', () => {
    const layoutProperties =
      /\b(position|overflow|transform|translate|z-index|contain|will-change|filter)\s*:/;
    for (const utility of ['.state-layer', '.focus-ring', '.focus-ring-inset']) {
      expect(rule(css, utility)).not.toMatch(layoutProperties);
    }
    expect(rule(css, '.state-layer')).toContain('background-image');
    expect(rule(css, '.focus-ring')).toContain('outline');
  });

  it('registers the animatable state-layer properties', () => {
    expect(css).toContain('@property --m3-state-opacity');
    expect(css).toContain('@property --m3-ripple-radius');
  });
});

describe('generated CSS', () => {
  it('switches spring tokens with data-motion and reduced motion', () => {
    const tokens = generateTokensCss();
    expect(tokens).toContain(':root,\n[data-motion="expressive"]');
    expect(tokens).toContain('[data-motion="standard"]');
    expect(tokens).toMatch(/prefers-reduced-motion: reduce\) \{\n:root,\n\[data-motion\]/);
  });

  it('is deterministic', () => {
    expect(generateTokensCss()).toBe(generateTokensCss());
    expect(generateTailwindThemeCss()).toBe(generateTailwindThemeCss());
  });
});
