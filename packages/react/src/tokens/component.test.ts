// @vitest-environment node
import { readFile, readdir } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import {
  color,
  componentTokenList,
  componentTokensCss,
  corner,
  defineComponentTokens,
  elevation,
  isComponentTokenSet,
  px,
  typeTokens,
} from './component';

/** Every non-test TypeScript source of the package, with its text. */
async function sources(): Promise<[string, string][]> {
  const root = new URL('../', import.meta.url);
  const entries = await readdir(root, { recursive: true });
  const files = entries.filter((file) => /\.tsx?$/u.test(file) && !/\.test\.tsx?$/u.test(file));
  return Promise.all(
    files.map(
      async (file) => [file, await readFile(new URL(file, root), 'utf8')] as [string, string],
    ),
  );
}

describe('component tokens in classes', () => {
  it('never puts a private token after an operator in an arbitrary value', async () => {
    // Tailwind turns `_` into a space in arbitrary values, and `+var(--_x)` inside a `calc()`
    // came out as `var(-- x)`, which Next's CSS parser rejects (found in an app, 2026-10-11).
    // `[var(--_x)]`, `calc((var(--_x)…` and `_var(--_x)` compile correctly; compute anything
    // more in a token's `derived` value or an inline style instead.
    const offenders: string[] = [];
    for (const [file, text] of await sources()) {
      for (const [match] of text.matchAll(/\[[^\]\s'"]*[-+*/,]var\(--_[^\]\s'"]*\]/gu)) {
        offenders.push(`${file}: ${match}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('hints the type of a variable in text and shadow arbitrary values', async () => {
    // `text-[var(--x)]` is ambiguous (colour or font size) and `shadow-[var(--x)]` doesn't
    // merge with a consumer's `shadow-elevation-3` in `cn()`, so both would keep our class
    // next to the consumer's. `text-[color:var(--x)]` and `shadow-[shadow:var(--x)]` merge.
    const offenders: string[] = [];
    for (const [file, text] of await sources()) {
      for (const [match] of text.matchAll(/(?:^|[\s'"`:])(?:text|shadow)-\[var\(/gu)) {
        offenders.push(`${file}: ${match.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('componentTokensCss', () => {
  it('writes a set without scopes exactly as before scopes existed', () => {
    // A set shaped like Windmorph Pro's: tokens, size and variant states, a derived value.
    // The expected CSS was generated before `scopes` was added, so Pro's output can't change.
    const set = defineComponentTokens({
      name: 'wm-sample-field',
      tokens: {
        'container-color': { value: color('surface-container-high'), description: 'Container.' },
        'container-shape': { value: corner('large'), description: 'Corners.' },
        height: { value: px(48), description: 'Height.' },
        ...Object.fromEntries(
          Object.entries(typeTokens('body-large')).map(([token, value]) => [
            token,
            { value, description: token },
          ]),
        ),
      },
      states: {
        size: {
          sm: { height: px(40), 'container-shape': corner('medium') },
          lg: { height: px(56) },
        },
        variant: { quiet: { 'container-color': 'transparent' } },
      },
      derived: {
        'corner-capped':
          'min(var(--_wm-sample-field-container-shape), calc(var(--_wm-sample-field-height) / 2))',
      },
    });
    expect(componentTokensCss(set)).toBe(
      [
        ':where([data-tokens~="wm-sample-field"]) {',
        '  --_wm-sample-field-container-color: var(--wm-sample-field-container-color, var(--md-sys-color-surface-container-high));',
        '  --_wm-sample-field-container-shape: var(--wm-sample-field-container-shape, var(--md-sys-shape-corner-large));',
        '  --_wm-sample-field-height: var(--wm-sample-field-height, 48px);',
        '  --_wm-sample-field-text-font: var(--wm-sample-field-text-font, var(--md-sys-typescale-body-large-font));',
        '  --_wm-sample-field-text-size: var(--wm-sample-field-text-size, var(--md-sys-typescale-body-large-size));',
        '  --_wm-sample-field-text-line-height: var(--wm-sample-field-text-line-height, var(--md-sys-typescale-body-large-line-height));',
        '  --_wm-sample-field-text-tracking: var(--wm-sample-field-text-tracking, var(--md-sys-typescale-body-large-tracking));',
        '  --_wm-sample-field-text-weight: var(--wm-sample-field-text-weight, var(--md-sys-typescale-body-large-weight));',
        '  --_wm-sample-field-corner-capped: min(var(--_wm-sample-field-container-shape), calc(var(--_wm-sample-field-height) / 2));',
        '}',
        '',
        ':where([data-tokens~="wm-sample-field"][data-size="sm"]) {',
        '  --_wm-sample-field-height: var(--wm-sample-field-height, 40px);',
        '  --_wm-sample-field-container-shape: var(--wm-sample-field-container-shape, var(--md-sys-shape-corner-medium));',
        '}',
        '',
        ':where([data-tokens~="wm-sample-field"][data-size="lg"]) {',
        '  --_wm-sample-field-height: var(--wm-sample-field-height, 56px);',
        '}',
        '',
        ':where([data-tokens~="wm-sample-field"][data-variant="quiet"]) {',
        '  --_wm-sample-field-container-color: var(--wm-sample-field-container-color, transparent);',
        '}',
      ].join('\n'),
    );
  });

  const scoped = defineComponentTokens({
    name: 'md-comp-sample',
    tokens: {},
    scopes: {
      variant: {
        filled: {
          prefix: 'md-comp-filled-sample',
          tokens: {
            'container-color': { value: color('primary'), description: 'Container.' },
          },
          fixed: { 'container-elevation': elevation(0) },
        },
        raised: {
          prefix: 'md-comp-raised-sample',
          tokens: {
            'container-color': { value: color('surface'), description: 'Container.' },
            'container-elevation': { value: elevation(1), description: 'Shadow.' },
          },
        },
      },
    },
  });

  it('writes each scope value with its own public prefix and its fixed values', () => {
    expect(componentTokensCss(scoped)).toBe(
      [
        ':where([data-tokens~="md-comp-sample"][data-variant="filled"]) {',
        '  --_md-comp-sample-container-color: var(--md-comp-filled-sample-container-color, var(--md-sys-color-primary));',
        '  --_md-comp-sample-container-elevation: var(--md-sys-elevation-level-0);',
        '}',
        '',
        ':where([data-tokens~="md-comp-sample"][data-variant="raised"]) {',
        '  --_md-comp-sample-container-color: var(--md-comp-raised-sample-container-color, var(--md-sys-color-surface));',
        '  --_md-comp-sample-container-elevation: var(--md-comp-raised-sample-container-elevation, var(--md-sys-elevation-level-1));',
        '}',
      ].join('\n'),
    );
  });

  it('lists every public variable with its scope', () => {
    expect(
      componentTokenList(scoped).map(({ name, token, scope }) => ({ name, token, scope })),
    ).toEqual([
      {
        name: '--md-comp-filled-sample-container-color',
        token: 'container-color',
        scope: { attribute: 'variant', value: 'filled' },
      },
      {
        name: '--md-comp-raised-sample-container-color',
        token: 'container-color',
        scope: { attribute: 'variant', value: 'raised' },
      },
      {
        name: '--md-comp-raised-sample-container-elevation',
        token: 'container-elevation',
        scope: { attribute: 'variant', value: 'raised' },
      },
    ]);
  });

  it('recognises a token set', () => {
    expect(isComponentTokenSet(scoped)).toBe(true);
    expect(isComponentTokenSet({ name: 'x' })).toBe(false);
    expect(isComponentTokenSet(null)).toBe(false);
  });
});
