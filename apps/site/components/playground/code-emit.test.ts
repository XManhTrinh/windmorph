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
      codeSlots: { menu: '<Menu aria-label="More"><MenuItem>Rename</MenuItem></Menu>' },
      codeChildren: 'Save',
    });
    expect(code).toContain("import { SplitButton, Menu, MenuItem } from '@windmorph/react';");
  });

  it('leaves out the members and import lines the snippet does not use', () => {
    const code = emitSnippet({
      component: 'Alert',
      values: { actions: false },
      surfacedProps: ['actions'],
      toggledSlots: { actions: '<Button>Retry</Button>' },
      importMembers: ['Button'],
      codeImports: ["import { RetryIcon } from './icons';"],
      codeChildren: 'Failed.',
    });
    expect(code).toContain("import { Alert } from '@windmorph/react';");
    expect(code).not.toContain('RetryIcon');
  });

  it('writes a toggled string literal as an attribute string', () => {
    const code = emitSnippet({
      component: 'Dialog',
      values: { origin: true, icon: true },
      surfacedProps: ['origin', 'icon'],
      toggledSlots: { origin: '"trigger"', icon: '<DeleteIcon />' },
    });
    expect(code).toContain('<Dialog\n  origin="trigger"\n  icon={<DeleteIcon />}\n');
  });

  it('wraps the element, indented, in its trigger', () => {
    const code = emitSnippet({
      component: 'Dialog',
      values: {},
      surfacedProps: [],
      importMembers: ['Button', 'DialogTrigger'],
      codeWrap: { before: '<DialogTrigger>\n  <Button>Open</Button>', after: '</DialogTrigger>' },
      codeChildren: 'Body',
    });
    expect(code).toContain(
      '<DialogTrigger>\n  <Button>Open</Button>\n  <Dialog>\n    Body\n  </Dialog>\n</DialogTrigger>',
    );
    expect(code).toContain("import { Dialog, Button, DialogTrigger } from '@windmorph/react';");
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

describe('emitSnippet toggled slots', () => {
  const input = {
    component: 'Button',
    surfacedProps: ['leadingIcon'],
    toggledSlots: { leadingIcon: '<EditIcon />' },
    codeChildren: 'Edit',
  };

  it('writes the slot while its switch is on', () => {
    expect(emitSnippet({ ...input, values: { leadingIcon: true } })).toContain(
      'leadingIcon={<EditIcon />}',
    );
  });

  it('writes nothing while its switch is off', () => {
    expect(emitSnippet({ ...input, values: { leadingIcon: false } })).not.toContain('leadingIcon');
  });
});

describe('emitSnippet slot controls', () => {
  it("writes a slot's JSX from the values and keeps `slot.prop` controls off the element", () => {
    const code = emitSnippet({
      component: 'FloatingToolbar',
      values: { fab: true, 'fab.iconTransition': 'rotate' },
      surfacedProps: ['fab', 'fab.iconTransition'],
      toggledSlots: {
        fab: (values) => `<ToolbarFab iconTransition="${String(values['fab.iconTransition'])}" />`,
      },
    });
    expect(code).toContain('fab={<ToolbarFab iconTransition="rotate" />}');
    expect(code).not.toContain('fab.iconTransition=');
  });
});
