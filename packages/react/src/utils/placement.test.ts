import { describe, expect, it } from 'vitest';
import { toAriaPlacement } from './placement';

describe('toAriaPlacement', () => {
  it('turns hyphenated logical placements into React Aria physical ones', () => {
    expect(toAriaPlacement('bottom-start', false)).toBe('bottom left');
    expect(toAriaPlacement('bottom-start', true)).toBe('bottom right');
    expect(toAriaPlacement('top-end', false)).toBe('top right');
    expect(toAriaPlacement('end-top', false)).toBe('right top');
    expect(toAriaPlacement('start', true)).toBe('right');
    expect(toAriaPlacement('top', false)).toBe('top');
  });
});
