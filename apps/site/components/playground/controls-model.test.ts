import { describe, expect, it } from 'vitest';
import type { PropsRecord } from '../../lib/component-props';
import { controlApplies, inferControls, switchRecords } from './controls-model';

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
      ['allowsCustomValue', 'maxRows', 'selectionMode'],
      { selectionMode: ['single', 'multiple'] },
      { allowsCustomValue: false, maxRows: 4, selectionMode: 'single' },
    );
    expect(controls.map((control) => [control.name, control.kind])).toEqual([
      ['allowsCustomValue', 'boolean'],
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
