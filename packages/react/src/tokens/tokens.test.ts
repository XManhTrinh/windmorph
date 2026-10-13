import { describe, expect, it } from 'vitest';
import {
  CORNERS,
  SPRINGS,
  STATE_OPACITIES,
  TYPE_SCALE,
  springPosition,
  springSettleDuration,
  springToLinearEasing,
  toMotionSpring,
} from '.';

/** Peak overshoot of a unit step spring, as a fraction of the travel. */
function overshoot(token: { dampingRatio: number; stiffness: number }) {
  let peak = 0;
  for (let t = 0; t < 2; t += 0.0005) peak = Math.max(peak, springPosition(token, t));
  return peak - 1;
}

describe('tokens', () => {
  it('matches the Compose shape scale', () => {
    expect(CORNERS).toEqual({
      none: '0px',
      'extra-small': '4px',
      small: '8px',
      medium: '12px',
      large: '16px',
      'large-increased': '20px',
      'extra-large': '28px',
      'extra-large-increased': '32px',
      'extra-extra-large': '48px',
      full: '9999px',
    });
  });

  it('matches the Compose state layer opacities', () => {
    expect(STATE_OPACITIES).toMatchObject({ hover: 0.08, focus: 0.1, pressed: 0.1, dragged: 0.16 });
  });

  it('has a baseline and an emphasized style for every type role', () => {
    const baseline = Object.keys(TYPE_SCALE).filter((role) => !role.endsWith('-emphasized'));
    expect(baseline).toHaveLength(15);
    for (const role of baseline) expect(TYPE_SCALE).toHaveProperty(`${role}-emphasized`);
  });
});

describe('springs', () => {
  it('overshoots as the M3 Expressive spec describes', () => {
    expect(overshoot(SPRINGS.expressive.spatial.fast)).toBeCloseTo(0.095, 2);
    expect(overshoot(SPRINGS.expressive.spatial.default)).toBeCloseTo(0.015, 2);
    expect(overshoot(SPRINGS.expressive.spatial.slow)).toBeCloseTo(0.015, 2);
    for (const speed of ['fast', 'default', 'slow'] as const) {
      expect(overshoot(SPRINGS.standard.spatial[speed])).toBeLessThan(0.002);
      expect(overshoot(SPRINGS.expressive.effects[speed])).toBeLessThanOrEqual(0);
    }
  });

  it('converts damping ratios to Motion damping coefficients', () => {
    expect(toMotionSpring(SPRINGS.expressive.spatial.fast)).toEqual({
      type: 'spring',
      stiffness: 800,
      damping: 33.94,
      mass: 1,
    });
    expect(toMotionSpring(SPRINGS.standard.effects.default).damping).toBe(80);
  });

  it('builds linear() easings that start at 0, end at 1 and overshoot like the spring', () => {
    const easing = springToLinearEasing(SPRINGS.expressive.spatial.fast);
    const points = easing.slice('linear('.length, -1).split(', ').map(Number);
    expect(points[0]).toBe(0);
    expect(points.at(-1)).toBe(1);
    expect(Math.max(...points)).toBeGreaterThan(1.08);
  });

  it('settles faster for stiffer springs', () => {
    const { fast, default: normal, slow } = SPRINGS.expressive.spatial;
    expect(springSettleDuration(fast)).toBeLessThan(springSettleDuration(normal));
    expect(springSettleDuration(normal)).toBeLessThan(springSettleDuration(slow));
  });
});
