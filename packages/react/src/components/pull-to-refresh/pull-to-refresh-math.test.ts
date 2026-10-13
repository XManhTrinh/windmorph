// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  POSITIONAL_THRESHOLD,
  distanceFraction,
  overshootRotation,
  passesThreshold,
  verticalOffset,
} from './pull-to-refresh-math';

describe('pull to refresh arithmetic (Compose PullToRefreshModifierNode)', () => {
  it("uses Compose's 80dp positional threshold", () => {
    expect(POSITIONAL_THRESHOLD).toBe(80);
  });

  it('moves the indicator at half the pull up to the threshold', () => {
    expect(verticalOffset(0, 80)).toBe(0);
    expect(verticalOffset(100, 80)).toBe(50);
    expect(verticalOffset(160, 80)).toBe(80);
    expect(verticalOffset(-20, 80)).toBe(0);
  });

  it('meets growing resistance past the threshold, up to twice it', () => {
    // 240px pulled: 120px adjusted, 50% over; tension 0.5 - 0.25 / 4 = 0.4375.
    expect(verticalOffset(240, 80)).toBeCloseTo(80 + 80 * 0.4375);
    // 480px pulled: 200% over, the most counted; tension 2 - 4 / 4 = 1.
    expect(verticalOffset(480, 80)).toBe(160);
    expect(verticalOffset(2000, 80)).toBe(160);
  });

  it('gives the distance fraction as the offset over the threshold', () => {
    expect(distanceFraction(100, 80)).toBe(0.625);
    expect(distanceFraction(160, 80)).toBe(1);
    expect(distanceFraction(480, 80)).toBe(2);
    expect(distanceFraction(100, 0)).toBe(0);
  });

  it('refreshes only past the threshold', () => {
    expect(passesThreshold(160, 80)).toBe(false);
    expect(passesThreshold(161, 80)).toBe(true);
    expect(passesThreshold(130, 64)).toBe(true);
  });

  it('turns the indicator back half a turn per threshold of overshoot', () => {
    expect(overshootRotation(0.5)).toBe(0);
    expect(overshootRotation(1)).toBe(0);
    expect(overshootRotation(1.5)).toBe(-90);
    expect(overshootRotation(2)).toBe(-180);
  });
});
