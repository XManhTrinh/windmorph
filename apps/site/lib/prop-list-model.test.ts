import { describe, expect, it } from 'vitest';
import {
  propAnchor,
  propDefaultView,
  propListItems,
  propTypeText,
  propTypeView,
  splitTopLevelUnion,
} from './prop-list-model';

describe('splitTopLevelUnion', () => {
  it('splits only at the top level', () => {
    expect(
      splitTopLevelUnion(
        '"a|b" | ((value: string | number) => void) | Array<1 | 2> | { x: 1 | 2 } | null',
      ),
    ).toEqual([
      '"a|b"',
      '((value: string | number) => void)',
      'Array<1 | 2>',
      '{ x: 1 | 2 }',
      'null',
    ]);
  });

  it("doesn't take an arrow for a closing generic", () => {
    expect(splitTopLevelUnion('Map<string, (a: 1) => void> | string')).toEqual([
      'Map<string, (a: 1) => void>',
      'string',
    ]);
  });

  it('returns a type that is not a union as its only member', () => {
    expect(splitTopLevelUnion('ReactNode')).toEqual(['ReactNode']);
  });
});

describe('propTypeView', () => {
  it("shows an enum's members as written, so strings and numbers differ", () => {
    expect(propTypeView({ type: 'enum', values: ['"sm"', '"md"'] })).toEqual({
      kind: 'union',
      values: ['"sm"', '"md"'],
    });
    expect(propTypeView({ type: 'enum', values: ['1', '2'] })).toEqual({
      kind: 'union',
      values: ['1', '2'],
    });
  });

  it('quotes the options of an enum generated before `values`', () => {
    expect(propTypeView({ type: 'enum', options: ['sm'] })).toEqual({
      kind: 'union',
      values: ['"sm"'],
    });
  });

  it('shows a union of plain members as chips', () => {
    expect(propTypeView({ type: 'boolean | "dialog" | "menu"' })).toEqual({
      kind: 'union',
      values: ['boolean', '"dialog"', '"menu"'],
    });
  });

  it('keeps a short type on the header line and blocks a long one', () => {
    expect(propTypeView({ type: 'ReactNode' })).toEqual({ kind: 'inline', text: 'ReactNode' });
    const long = 'ReactElement<unknown, string | JSXElementConstructor<any>>';
    expect(propTypeView({ type: long })).toEqual({ kind: 'block', text: long });
  });

  it('writes a view back as TypeScript', () => {
    expect(propTypeText(propTypeView({ type: 'enum', values: ['"a"', '"b"'] }))).toBe('"a" | "b"');
    expect(propTypeText(propTypeView({ type: 'string' }))).toBe('string');
  });
});

describe('propDefaultView', () => {
  it('shows a short default as a chip, a long one as a block, and a sentence as prose', () => {
    expect(propDefaultView('"sm"')).toEqual({ kind: 'inline', text: '"sm"' });
    expect(propDefaultView('40, or 48 when wavy, plus any extra thickness')).toEqual({
      kind: 'block',
      text: '40, or 48 when wavy, plus any extra thickness',
    });
    expect(propDefaultView('"small" (`full` for circles)')).toEqual({
      kind: 'prose',
      text: '"small" (`full` for circles)',
    });
  });

  it('has no view for a missing or empty default', () => {
    expect(propDefaultView(undefined)).toBeUndefined();
    expect(propDefaultView(' ')).toBeUndefined();
  });
});

describe('propAnchor', () => {
  it('scopes the anchor to the component and keeps the dotted key', () => {
    expect(propAnchor('BottomSheet', 'labels.close')).toBe('prop-BottomSheet-labels.close');
  });

  it('turns characters a fragment would trip on into hyphens', () => {
    expect(propAnchor('useTheme-returns', 'set mode/now')).toBe(
      'prop-useTheme-returns-set-mode-now',
    );
  });
});

describe('propListItems', () => {
  it("nests an object prop's keys under it, each with its own anchor and default", () => {
    const [open, labels] = propListItems('Sheet', [
      { name: 'open', type: 'boolean', required: true, description: 'Controlled open state.' },
      {
        name: 'labels',
        type: 'Partial<SheetLabels>',
        required: false,
        description: 'Words the sheet announces.',
        keys: [
          {
            name: 'labels.close',
            type: 'string',
            required: false,
            defaultValue: '"Close"',
            description: 'The close button.',
          },
        ],
      },
    ]);
    expect(open).toMatchObject({ id: 'prop-Sheet-open', required: true, keys: [] });
    expect(labels!.keys).toEqual([
      {
        id: 'prop-Sheet-labels.close',
        name: 'labels.close',
        required: false,
        type: { kind: 'inline', text: 'string' },
        typeText: 'string',
        defaultValue: { kind: 'inline', text: '"Close"' },
        defaultText: '"Close"',
        description: 'The close button.',
        keys: [],
      },
    ]);
  });

  it("leaves the playground's options out and shows the enum's members", () => {
    const [size] = propListItems('Button', [
      {
        name: 'size',
        type: 'enum',
        required: false,
        options: ['sm', 'md'],
        values: ['"sm"', '"md"'],
      },
    ]);
    expect(size).not.toHaveProperty('options');
    expect(size!.typeText).toBe('"sm" | "md"');
  });
});
