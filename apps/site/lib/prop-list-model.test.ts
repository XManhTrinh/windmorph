import { describe, expect, it } from 'vitest';
import type { PropsRecord } from './component-props';
import {
  groupPropItems,
  htmlAttributesNote,
  matchesPropFilter,
  matchOffsets,
  propAnchor,
  propCount,
  propDefaultView,
  propGroupOf,
  propListItems,
  propTypeMembers,
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

describe('propTypeMembers', () => {
  it("lists an enum's members as written, so strings and numbers differ", () => {
    expect(propTypeMembers({ type: 'enum', values: ['"sm"', '"md"'] })).toEqual(['"sm"', '"md"']);
    expect(propTypeMembers({ type: 'enum', values: ['1', '2'] })).toEqual(['1', '2']);
  });

  it('quotes the options of an enum generated before `values`', () => {
    expect(propTypeMembers({ type: 'enum', options: ['sm'] })).toEqual(['"sm"']);
  });

  it('splits any other type at its top-level bars', () => {
    expect(propTypeMembers({ type: 'boolean | "dialog"' })).toEqual(['boolean', '"dialog"']);
    expect(propTypeMembers({ type: '(value: string | number) => void' })).toEqual([
      '(value: string | number) => void',
    ]);
  });
});

describe('propDefaultView', () => {
  it('shows a default as code, and a sentence with code spans as prose', () => {
    expect(propDefaultView('"sm"')).toEqual({ kind: 'code', text: '"sm"' });
    expect(propDefaultView('40, or 48 when wavy')).toEqual({
      kind: 'code',
      text: '40, or 48 when wavy',
    });
    expect(propDefaultView('"small" (`full`\nfor circles)')).toEqual({
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
        typeMembers: ['string'],
        typeText: 'string',
        defaultValue: { kind: 'code', text: '"Close"' },
        defaultText: '"Close"',
        description: 'The close button.',
        keys: [],
      },
    ]);
  });

  it("leaves the playground's options out and writes the enum's members", () => {
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

describe('propGroupOf', () => {
  it('sorts props by name into Props, Events, Text and Styling', () => {
    expect(
      ['variant', 'onPress', 'onboarding', 'labels', 'strings', 'aria-label', 'aria-expanded'].map(
        propGroupOf,
      ),
    ).toEqual(['props', 'events', 'props', 'text', 'text', 'text', 'props']);
    expect(['className', 'classNames', 'style'].map(propGroupOf)).toEqual([
      'styling',
      'styling',
      'styling',
    ]);
  });
});

describe('groupPropItems', () => {
  const record = (name: string, required = false): PropsRecord => ({
    name,
    type: 'string',
    required,
  });

  it("folds React Aria's inherited props into their own group, last", () => {
    const groups = groupPropItems(
      propListItems('Button', [
        { ...record('onPressStart'), inherited: true },
        record('onPress'),
        record('variant'),
        { ...record('aria-describedby'), inherited: true },
      ]),
    );
    expect(groups.map(({ id, items }) => [id, items.map((item) => item.name)])).toEqual([
      ['props', ['variant']],
      ['events', ['onPress']],
      ['inherited', ['onPressStart', 'aria-describedby']],
    ]);
    expect(groups.at(-1)?.label).toBe('Inherited from React Aria');
  });

  it('keeps source order in each group, puts required props first, and drops empty groups', () => {
    const groups = groupPropItems(
      propListItems('Dialog', [
        record('className'),
        record('open'),
        record('onOpenChange'),
        record('children', true),
        record('labels'),
        record('size'),
        record('aria-label', true),
      ]),
    );
    expect(
      groups.map(({ id, label, items }) => [id, label, items.map((item) => item.name)]),
    ).toEqual([
      ['props', 'Props', ['children', 'open', 'size']],
      ['events', 'Events', ['onOpenChange']],
      ['text', 'Text', ['labels', 'aria-label']],
      ['styling', 'Styling', ['className']],
    ]);
  });

  it('gives a component with only plain props one group', () => {
    expect(groupPropItems(propListItems('Divider', [record('inset')])).map(({ id }) => id)).toEqual(
      ['props'],
    );
  });
});

describe('matchesPropFilter', () => {
  it('matches every word of the query, in any order, ignoring case', () => {
    const text = 'onOpenChange Called when the dialog opens or closes.';
    expect(matchesPropFilter(text, 'OPEN')).toBe(true);
    expect(matchesPropFilter(text, 'closes dialog')).toBe(true);
    expect(matchesPropFilter(text, 'dialog scrim')).toBe(false);
    expect(matchesPropFilter(text, '  ')).toBe(true);
  });
});

describe('propCount', () => {
  it('counts in words', () => {
    expect(propCount(1)).toBe('1 prop');
    expect(propCount(12)).toBe('12 props');
  });
});

describe('matchOffsets', () => {
  it("finds each word's occurrences, ignoring case, merging overlaps", () => {
    expect(matchOffsets('Close the dialog; closes on Escape', 'CLOSE')).toEqual([
      [0, 5],
      [18, 23],
    ]);
    expect(matchOffsets('scrimscrim', 'scrim crims')).toEqual([[0, 10]]);
    expect(matchOffsets('anything', ' ')).toEqual([]);
  });
});

describe('htmlAttributesNote', () => {
  it('names the element whose attributes the component accepts', () => {
    expect(htmlAttributesNote(['a', 'button'])).toBe(
      'Also accepts every `<a>` or `<button>` attribute.',
    );
    expect(htmlAttributesNote(['element'])).toMatch(/root element's HTML attributes/);
    expect(htmlAttributesNote(undefined)).toBeUndefined();
  });
});
