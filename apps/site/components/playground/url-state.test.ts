import { describe, expect, it } from 'vitest';
import type { ControlDef } from './controls-model';
import { decodeState, encodeState } from './url-state';

const controls: ControlDef[] = [
  { name: 'variant', kind: 'enum', label: 'variant', options: ['filled', 'outlined'] },
  { name: 'disabled', kind: 'boolean', label: 'disabled' },
  { name: 'count', kind: 'number', label: 'count' },
  { name: 'label', kind: 'string', label: 'label' },
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
});
