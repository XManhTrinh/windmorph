import { describe, expect, it } from 'vitest';
import { DENSITIES, densityAttribute, isDensity } from './density';

describe('density', () => {
  it('has the four M3 web levels, 0 first', () => {
    expect(DENSITIES).toEqual([0, -1, -2, -3]);
  });

  it('recognises levels as numbers or attribute text', () => {
    expect(isDensity(-2)).toBe(true);
    expect(isDensity('-3')).toBe(true);
    expect(isDensity('0')).toBe(true);
    expect(isDensity(-4)).toBe(false);
    expect(isDensity('1')).toBe(false);
    expect(isDensity('')).toBe(false);
    expect(isDensity(null)).toBe(false);
  });

  it('writes the attribute only when a level is set', () => {
    expect(densityAttribute(undefined)).toEqual({});
    expect(densityAttribute(0)).toEqual({ 'data-density': '0' });
    expect(densityAttribute(-3)).toEqual({ 'data-density': '-3' });
  });
});
