import { describe, expect, it } from 'vitest';
import { emitSnippet, normalizeDefault, propDefaultsFrom } from './code-emit';

describe('normalizeDefault', () => {
  it('strips quotes and dedupes the quirky duplicated default', () => {
    expect(normalizeDefault('"filled"\n"filled"')).toBe('filled');
    expect(normalizeDefault('"filled"\nfilled')).toBe('filled');
    expect(normalizeDefault('"sm"')).toBe('sm');
    expect(normalizeDefault('false')).toBe('false');
  });
});

describe('propDefaultsFrom', () => {
  it('builds a normalised default lookup', () => {
    const defaults = propDefaultsFrom([
      { name: 'variant', type: 'enum', required: false, defaultValue: '"filled"\n"filled"' },
      { name: 'size', type: 'enum', required: false, defaultValue: '"sm"' },
    ]);
    expect(defaults).toEqual({ variant: 'filled', size: 'sm' });
  });
});

describe('emitSnippet', () => {
  it('omits props equal to the authoritative default', () => {
    const code = emitSnippet({
      component: 'Button',
      values: { variant: 'filled', size: 'sm' },
      surfacedProps: ['variant', 'size'],
      defaultProps: { variant: 'filled', size: 'sm' },
      codeChildren: 'Label',
    });
    expect(code).toContain("import { Button } from '@windmorph/react';");
    expect(code).not.toContain('variant=');
    expect(code).toContain('<Button>');
    expect(code).toContain('Label');
  });

  it('falls back to the normalised JSON default when the descriptor omits one', () => {
    const code = emitSnippet({
      component: 'Button',
      values: { variant: 'filled' },
      surfacedProps: ['variant'],
      propDefaults: propDefaultsFrom([
        { name: 'variant', type: 'enum', required: false, defaultValue: '"filled"\n"filled"' },
      ]),
    });
    expect(code).not.toContain('variant=');
  });

  it('emits non-default enums quoted and booleans shorthand', () => {
    const code = emitSnippet({
      component: 'Button',
      values: { variant: 'outlined', disabled: true },
      surfacedProps: ['variant', 'disabled'],
      defaultProps: { variant: 'filled', disabled: false },
      codeChildren: 'Save',
    });
    expect(code).toContain('variant="outlined"');
    expect(code).toContain('disabled');
    expect(code).not.toContain('disabled={true}');
  });

  it('merges extra @windmorph/react import members into one import line', () => {
    const code = emitSnippet({
      component: 'SplitButton',
      values: {},
      surfacedProps: [],
      importMembers: ['Menu', 'MenuItem'],
      codeChildren: 'Save',
    });
    expect(code).toContain("import { SplitButton, Menu, MenuItem } from '@windmorph/react';");
  });

  it('emits an icon slot that is self-contained (inline SVG, no site-local identifier)', () => {
    const iconSvg = '<svg viewBox="0 -960 960 960"><path d="M0 0h10" /></svg>';
    const code = emitSnippet({
      component: 'IconButton',
      values: {},
      surfacedProps: [],
      codeSlots: { icon: iconSvg, 'aria-label': '"Favorite"' },
    });
    expect(code).toContain('icon={<svg');
    expect(code).toContain('aria-label={"Favorite"}');
    expect(code).not.toMatch(/icon=\{<[A-Z][A-Za-z]*Icon/);
  });
});

describe('emitSnippet import source', () => {
  it('imports Pro components from @windmorph/react-pro', () => {
    const snippet = emitSnippet({
      component: 'Avatar',
      values: {},
      surfacedProps: [],
      importFrom: '@windmorph/react-pro',
    });
    expect(snippet).toContain("import { Avatar } from '@windmorph/react-pro';");
  });

  it('defaults to @windmorph/react', () => {
    expect(emitSnippet({ component: 'Button', values: {}, surfacedProps: [] })).toContain(
      "from '@windmorph/react';",
    );
  });
});
