import { describe, expect, it } from 'vitest';
import type { PropsRecord } from '../../lib/component-props';
import {
  clampToRange,
  controlApplies,
  groupControls,
  groupOf,
  inferControls,
  isSegmented,
  switchRecords,
} from './controls-model';

const props: PropsRecord[] = [
  { name: 'variant', type: 'enum', required: false, options: ['filled', 'outlined', 'text'] },
  { name: 'size', type: 'enum', required: false, options: ['xs', 'sm'] },
  { name: 'disabled', type: 'boolean', required: false },
  { name: 'count', type: 'number', required: false },
  { name: 'label', type: 'string', required: false },
];

describe('inferControls', () => {
  it('maps JSON types to control kinds in surfaced order', () => {
    const controls = inferControls(props, ['variant', 'disabled', 'count', 'label']);
    expect(controls.map((control) => [control.name, control.kind])).toEqual([
      ['variant', 'enum'],
      ['disabled', 'boolean'],
      ['count', 'number'],
      ['label', 'string'],
    ]);
  });

  it('reads enum members from the JSON options', () => {
    const controls = inferControls(props, ['variant']);
    expect(controls[0]?.options).toEqual(['filled', 'outlined', 'text']);
  });

  it('lets enumOptions override the JSON options', () => {
    const controls = inferControls(props, ['variant'], { variant: ['text', 'filled'] });
    expect(controls[0]?.options).toEqual(['text', 'filled']);
  });

  it('takes the kind of a prop missing from the JSON from its default', () => {
    const controls = inferControls(
      props,
      ['allowCustomValue', 'maxRows', 'selectionMode'],
      { selectionMode: ['single', 'multiple'] },
      { allowCustomValue: false, maxRows: 4, selectionMode: 'single' },
    );
    expect(controls.map((control) => [control.name, control.kind])).toEqual([
      ['allowCustomValue', 'boolean'],
      ['maxRows', 'number'],
      ['selectionMode', 'enum'],
    ]);
  });

  it('every surfaced enum prop resolves a non-empty option list', () => {
    const controls = inferControls(props, ['variant', 'size']);
    for (const control of controls) {
      expect(control.kind).toBe('enum');
      expect(control.options?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it('an override picks the control for a prop with no natural one', () => {
    const slots: PropsRecord[] = [
      { name: 'leadingIcon', type: 'ReactElement', required: false },
      { name: 'title', type: 'ReactNode', required: false },
      { name: 'variant', type: 'enum', required: false, options: ['a', 'b'] },
    ];
    const controls = inferControls(
      slots,
      ['leadingIcon', 'title', 'variant'],
      undefined,
      {},
      {
        leadingIcon: 'boolean',
        title: 'string',
      },
    );
    expect(controls.map((control) => [control.name, control.kind])).toEqual([
      ['leadingIcon', 'boolean'],
      ['title', 'string'],
      ['variant', 'enum'],
    ]);
  });
});

describe('component switch', () => {
  const switcher = {
    control: 'kind',
    components: { icon: 'Fab', extended: 'ExtendedFab' },
  };
  const componentProps = {
    Fab: [
      { name: 'size', type: 'enum', required: false, options: ['default', 'medium', 'large'] },
      { name: 'tooltip', type: 'boolean', required: false },
    ],
    ExtendedFab: [
      { name: 'size', type: 'enum', required: false, options: ['sm', 'md', 'lg'] },
      { name: 'expanded', type: 'boolean', required: false },
    ],
  };

  it("reads the shown component's records first, then a sibling's own, then the switch", () => {
    const records = switchRecords(switcher, componentProps, 'ExtendedFab', false);
    expect(records.map((record) => record.name)).toEqual(['size', 'expanded', 'tooltip', 'kind']);
    expect(records[0]?.options).toEqual(['sm', 'md', 'lg']);
    expect(records.at(-1)?.options).toEqual(['icon', 'extended']);
  });

  it("lists every sibling's options of a shared prop for the URL", () => {
    const [size] = switchRecords(switcher, componentProps, 'Fab', true);
    expect(size?.options).toEqual(['default', 'medium', 'large', 'sm', 'md', 'lg']);
  });

  it("hides a sibling's own props, keeping the switch and controls no sibling takes", () => {
    const applies = controlApplies(switcher, componentProps, 'Fab');
    expect(['kind', 'size', 'tooltip', 'expanded', 'icon'].filter(applies)).toEqual([
      'kind',
      'size',
      'tooltip',
      'icon',
    ]);
    expect(controlApplies(undefined, componentProps, 'Fab')('expanded')).toBe(true);
  });
});

describe('groupOf', () => {
  it('puts style choices in Appearance', () => {
    expect(groupOf('variant', 'enum')).toBe('appearance');
    expect(groupOf('size', 'enum')).toBe('appearance');
    expect(groupOf('elevated', 'boolean')).toBe('appearance');
    expect(groupOf('thickness', 'number')).toBe('appearance');
    expect(groupOf('fab.color', 'enum')).toBe('appearance');
  });

  it('puts text and slots switched on and off in Content', () => {
    expect(groupOf('label', 'string')).toBe('content');
    expect(groupOf('leadingIcon', 'boolean', true)).toBe('content');
    expect(groupOf('actions', 'boolean', true)).toBe('content');
    expect(groupOf('icons', 'boolean')).toBe('content');
  });

  it('puts states, selection and opening in Behaviour', () => {
    expect(groupOf('disabled', 'boolean')).toBe('behaviour');
    expect(groupOf('selectionMode', 'enum')).toBe('behaviour');
    expect(groupOf('open', 'boolean')).toBe('behaviour');
    expect(groupOf('href', 'string')).toBe('behaviour');
    expect(groupOf('value', 'number')).toBe('behaviour');
    expect(groupOf('defaultDetent', 'enum')).toBe('behaviour');
  });

  it('puts forced states, replays and names for assistive tech in Advanced', () => {
    expect(groupOf('dragged', 'boolean')).toBe('advanced');
    expect(groupOf('appear', 'boolean')).toBe('advanced');
    expect(groupOf('prefixLabel', 'string')).toBe('advanced');
    expect(groupOf('fab.dragged', 'boolean')).toBe('advanced');
    expect(groupOf('titleAs', 'enum')).toBe('advanced');
  });
});

describe('groupControls', () => {
  it('orders the sections and keeps each control in its order, leaving out empty ones', () => {
    const groups = groupControls([
      { name: 'disabled', kind: 'boolean', label: 'disabled', group: 'behaviour' },
      { name: 'variant', kind: 'enum', label: 'variant', group: 'appearance' },
      { name: 'dragged', kind: 'boolean', label: 'dragged', group: 'advanced' },
      { name: 'size', kind: 'enum', label: 'size', group: 'appearance' },
    ]);
    expect(groups.map(({ group, controls }) => [group, controls.map((def) => def.name)])).toEqual([
      ['appearance', ['variant', 'size']],
      ['behaviour', ['disabled']],
      ['advanced', ['dragged']],
    ]);
  });
});

describe('clampToRange', () => {
  it('keeps a number inside the range, on a step', () => {
    expect(clampToRange(7, { min: 0, max: 5 })).toBe(5);
    expect(clampToRange(0.33, { min: 0, max: 1, step: 0.05 })).toBe(0.35);
    expect(clampToRange(0.1 + 0.2, { min: 0, max: 1, step: 0.1 })).toBe(0.3);
    expect(clampToRange(-3, { min: 1, max: 4 })).toBe(1);
  });
});

describe('isSegmented', () => {
  it('fits two short options in a button group, and sends the rest to a select', () => {
    expect(isSegmented(['round', 'square'])).toBe(true);
    expect(isSegmented(['inline', 'hidden'])).toBe(true);
    expect(isSegmented(['sm', 'md', 'lg'])).toBe(false);
    expect(isSegmented(['auto', 'top', 'bottom'])).toBe(false);
    expect(isSegmented(['none', 'single', 'multiple'])).toBe(false);
    expect(isSegmented(['xs', 'sm', 'md', 'lg'])).toBe(false);
    expect(isSegmented(['bottom-start', 'bottom-end', 'top'])).toBe(false);
  });
});
