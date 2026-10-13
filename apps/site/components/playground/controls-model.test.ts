import { describe, expect, it } from 'vitest';
import type { PropsRecord } from '../../lib/component-props';
import { inferControls } from './controls-model';

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
});
