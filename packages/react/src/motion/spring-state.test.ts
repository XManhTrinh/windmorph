import { describe, expect, it } from 'vitest';
import { SPRINGS, springPosition } from '../tokens/motion';
import { springState, timeToReach } from './spring-state';

const springs = [
  SPRINGS.expressive.spatial.fast,
  SPRINGS.standard.spatial.default,
  SPRINGS.expressive.effects.default,
];

describe('springState', () => {
  it('starts where and as fast as it was given', () => {
    for (const spring of springs) {
      expect(springState(spring, -40, 300, 0)).toEqual({ displacement: -40, velocity: 300 });
    }
  });

  it('is the token’s step response from rest', () => {
    for (const spring of springs) {
      for (const t of [0.02, 0.1, 0.3]) {
        expect(1 + springState(spring, -1, 0, t).displacement).toBeCloseTo(
          springPosition(spring, t),
          9,
        );
      }
    }
  });

  it('gives the derivative of its position as its velocity', () => {
    for (const spring of springs) {
      const h = 1e-6;
      for (const t of [0.01, 0.07, 0.2]) {
        const before = springState(spring, 25, -120, t - h).displacement;
        const after = springState(spring, 25, -120, t + h).displacement;
        expect(springState(spring, 25, -120, t).velocity).toBeCloseTo(
          (after - before) / (2 * h),
          3,
        );
      }
    }
  });

  it('settles at its target', () => {
    for (const spring of springs) {
      const { displacement, velocity } = springState(spring, 100, 50, 3);
      expect(Math.abs(displacement)).toBeLessThan(1e-3);
      expect(Math.abs(velocity)).toBeLessThan(1e-2);
    }
  });
});

describe('timeToReach', () => {
  it('is when the step response first covers the fraction', () => {
    const spring = SPRINGS.expressive.effects.slow;
    expect(timeToReach(0, spring)).toBe(0);
    const t = timeToReach(0.5, spring);
    expect(springPosition(spring, t)).toBeCloseTo(0.5, 6);
  });
});
