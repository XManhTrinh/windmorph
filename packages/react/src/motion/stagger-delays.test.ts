import { describe, expect, it } from 'vitest';
import { staggerSteps } from '../components/fab-menu/fab-menu-stagger';
import { SPRINGS, springSettleDuration } from '../tokens/motion';
import { staggerDelays } from './stagger-delays';

describe('staggerDelays', () => {
  it('starts the first item at once and the rest one after another', () => {
    const delays = staggerDelays(6);
    expect(delays).toHaveLength(6);
    expect(delays[0]).toBe(0);
    for (let index = 1; index < delays.length; index++) {
      expect(delays[index]!).toBeGreaterThan(delays[index - 1]!);
    }
  });

  it('keeps any number of items within one spring’s time', () => {
    const limit = springSettleDuration(SPRINGS.expressive.effects.slow) / 1000;
    for (const count of [2, 12, 84, 365]) {
      expect(Math.max(...staggerDelays(count))).toBeLessThan(limit);
    }
  });

  it('is the FAB menu’s model: the times its spring passes each item', () => {
    const delays = staggerDelays(5);
    const steps = staggerSteps(0, 5);
    for (const { at, count } of steps.slice(0, -1)) {
      expect(Math.round(delays[count]! * 1000)).toBe(at);
    }
  });

  it('is empty for no items', () => {
    expect(staggerDelays(0)).toEqual([]);
  });
});
