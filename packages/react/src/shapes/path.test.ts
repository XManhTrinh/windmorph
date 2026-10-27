import { describe, expect, it } from 'vitest';
import { Cubic } from './cubic';
import { cubicsToPath } from './path';

describe('cubicsToPath', () => {
  it('rounds to four decimals', () => {
    expect(cubicsToPath([Cubic.straightLine(0.123456, 0, 1, 0.98765)], { closePath: false })).toBe(
      'M0.1235 0C0.4156 0.3292 0.7078 0.6584 1 0.9877',
    );
  });

  it('writes the same path for values a few bits apart on a rounding boundary', () => {
    // 0.45625 is a boundary at four decimals; Node and browsers can land a hair either side.
    const below = cubicsToPath([Cubic.straightLine(0.45624999999999993, 0, 1, 1)]);
    const above = cubicsToPath([Cubic.straightLine(0.45625000000000004, 0, 1, 1)]);
    expect(below).toBe(above);
  });
});
