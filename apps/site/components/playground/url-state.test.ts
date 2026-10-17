import { describe, expect, it } from 'vitest';
import type { ControlDef } from './controls-model';
import { decodeState, encodeState } from './url-state';

const controls: ControlDef[] = [
  { name: 'variant', kind: 'enum', label: 'variant', options: ['filled', 'outlined'] },
  { name: 'disabled', kind: 'boolean', label: 'disabled' },
  { name: 'count', kind: 'number', label: 'count' },
  { name: 'label', kind: 'string', label: 'label' },
  { name: 'ratio', kind: 'number', label: 'ratio', range: { min: 0, max: 0.5, step: 0.05 } },
];

describe('url-state', () => {
  it('round-trips typed values through discrete query keys', () => {
    const values = { variant: 'outlined', disabled: true, count: 3, label: 'Save' };
    const query = encodeState(values, controls);
    const decoded = decodeState(new URLSearchParams(query), controls);
    expect(decoded).toEqual(values);
  });

  it('drops empty/undefined values from the query', () => {
    const query = encodeState({ variant: '', disabled: false, label: undefined }, controls);
    const params = new URLSearchParams(query);
    expect(params.has('variant')).toBe(false);
    expect(params.has('label')).toBe(false);
    expect(params.get('disabled')).toBe('false');
  });

  it('ignores invalid values and unknown keys (falls back to defaults)', () => {
    const params = new URLSearchParams('variant=nope&disabled=maybe&count=abc&label=ok&mystery=1');
    const decoded = decodeState(params, controls);
    expect(decoded).toEqual({ label: 'ok' });
  });

  it('coerces booleans and finite numbers', () => {
    const params = new URLSearchParams('disabled=true&count=42');
    expect(decodeState(params, controls)).toEqual({ disabled: true, count: 42 });
  });

  it('clamps a number into its slider range, snapped to the step', () => {
    expect(decodeState(new URLSearchParams('ratio=0.9'), controls)).toEqual({ ratio: 0.5 });
    expect(decodeState(new URLSearchParams('ratio=-1'), controls)).toEqual({ ratio: 0 });
    expect(decodeState(new URLSearchParams('ratio=0.12'), controls)).toEqual({ ratio: 0.1 });
    expect(decodeState(new URLSearchParams('ratio='), controls)).toEqual({});
  });

  it('loads a link shared before the panel was grouped: the keys are the prop names', () => {
    // A link from the earlier flat panel, with a value the range now clamps.
    const params = new URLSearchParams('variant=outlined&disabled=true&count=7&ratio=2');
    expect(decodeState(params, controls)).toEqual({
      variant: 'outlined',
      disabled: true,
      count: 7,
      ratio: 0.5,
    });
  });
});
