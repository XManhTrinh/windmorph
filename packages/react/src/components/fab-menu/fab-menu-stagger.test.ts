import { describe, expect, it } from 'vitest';
import { springStep, staggerSteps } from './fab-menu-stagger';

describe('springStep', () => {
  it('is the critically damped step response for effects springs', () => {
    const spring = { dampingRatio: 1, stiffness: 800 };
    const omega = Math.sqrt(800);
    expect(springStep(spring, 0)).toBe(0);
    expect(springStep(spring, 0.05)).toBeCloseTo(1 - (1 + omega * 0.05) * Math.exp(-omega * 0.05));
    expect(springStep(spring, 1)).toBeCloseTo(1, 6);
  });

  it('overshoots for underdamped springs', () => {
    const peak = Math.PI / (Math.sqrt(800) * 0.8);
    expect(springStep({ dampingRatio: 0.6, stiffness: 800 }, peak)).toBeCloseTo(
      1 + Math.exp((-0.6 * Math.PI) / 0.8),
      6,
    );
  });
});

describe('staggerSteps', () => {
  const nonDecreasing = (times: number[]) =>
    times.every((time, i) => i === 0 || time >= times[i - 1]!);

  it('opens from the button upwards, one item at a time', () => {
    const steps = staggerSteps(0, 4);
    expect(steps.map((s) => s.count)).toEqual([1, 2, 3, 4]);
    expect(steps[0]!.at).toBeGreaterThan(0);
    expect(nonDecreasing(steps.map((s) => s.at))).toBe(true);
    // Within one item of the target the spring ends and snaps, so the last two show together.
    expect(steps[3]!.at).toBe(steps[2]!.at);
    // The slow effects spring (stiffness 800) finishes the stagger in about 95ms.
    expect(steps[3]!.at).toBeGreaterThan(80);
    expect(steps[3]!.at).toBeLessThan(110);
  });

  it('closes from the top: the farthest item hides at once', () => {
    const steps = staggerSteps(4, 0);
    expect(steps.map((s) => s.count)).toEqual([3, 2, 1, 0]);
    expect(steps[0]!.at).toBe(0);
    expect(nonDecreasing(steps.map((s) => s.at))).toBe(true);
    // Under one item the truncated count is 0 anyway, so the snap adds no extra step.
    expect(steps[3]!.at).toBeGreaterThan(steps[2]!.at);
  });

  it('shows or hides a single item immediately', () => {
    expect(staggerSteps(0, 1)).toEqual([{ at: 0, count: 1 }]);
    expect(staggerSteps(1, 0)).toEqual([{ at: 0, count: 0 }]);
  });

  it('retargets from wherever the count is', () => {
    expect(staggerSteps(2, 5).map((s) => s.count)).toEqual([3, 4, 5]);
    expect(staggerSteps(3, 3)).toEqual([]);
  });
});
