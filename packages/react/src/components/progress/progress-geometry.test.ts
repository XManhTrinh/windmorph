import { describe, expect, it } from 'vitest';
import {
  amplitudeFor,
  circularFlatArcs,
  circularWavyPaths,
  circularWavyShapes,
  circularWavyTrack,
  cubicBezier,
  emphasizedAccelerate,
  indeterminateCircular,
  indeterminateLinearFractions,
  circularSize,
  linearHeight,
  linearPaths,
  stopIndicator,
  waveSegment,
} from './progress-geometry';

const numbers = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);

describe('easing', () => {
  it('matches CSS cubic-bezier endpoints and shape', () => {
    const linear = cubicBezier(0, 0, 1, 1);
    expect(linear(0.3)).toBeCloseTo(0.3, 4);
    expect(emphasizedAccelerate(0)).toBe(0);
    expect(emphasizedAccelerate(1)).toBe(1);
    // Emphasized accelerate starts slowly.
    expect(emphasizedAccelerate(0.5)).toBeLessThan(0.2);
  });
});

describe('indeterminateLinearFractions', () => {
  it('follows Compose’s 1750ms keyframes', () => {
    expect(indeterminateLinearFractions(0)).toEqual([0, 0, 0, 0]);
    // At 1000ms the first head has arrived; its tail started at 250ms.
    const [firstTail, firstHead, secondTail, secondHead] = indeterminateLinearFractions(1000);
    expect(firstHead).toBe(1);
    expect(firstTail).toBeGreaterThan(0);
    expect(firstTail).toBeLessThan(1);
    expect(secondHead).toBeGreaterThan(0);
    expect(secondTail).toBeGreaterThan(0);
    // Everything but the second tail (900 + 850ms) has arrived just before the cycle ends.
    expect(indeterminateLinearFractions(1749)).toEqual([1, 1, expect.any(Number), 1]);
    expect(indeterminateLinearFractions(1750)).toEqual([0, 0, 0, 0]);
  });
});

describe('linear paths', () => {
  it('draws the active segment and the track after a 4px gap, inset for round caps', () => {
    const { active, track } = linearPaths(240, 4, [0, 0.5], 0, 0, 40);
    expect(active).toEqual(['M2 2L120 2']);
    // The track runs from the right end (inset 2px) back to 120 + 4 + 2 × 2.
    expect(track).toBe('M238 2L128 2M2 2');
  });

  it('shrinks the gap while progress enters and hides the active line below its cap', () => {
    // Compose's algorithm repeats the final point here; it draws nothing extra.
    expect(linearPaths(240, 4, [0, 0], 0, 0, 40)).toEqual({ active: [], track: 'M238 2L2 2L2 2' });
    const { active, track } = linearPaths(240, 4, [0, 3 / 240], 0, 0, 40);
    expect(active).toHaveLength(1);
    // Gap is min(head − cap, 4) = 1, plus both caps.
    expect(track).toBe('M238 2L8 2M2 2');
  });

  it('draws two lines and three track pieces when indeterminate', () => {
    const { active, track } = linearPaths(240, 4, [0.6, 0.8, 0.1, 0.3], 0, 0, 20);
    expect(active).toHaveLength(2);
    expect(track.match(/L/g)).toHaveLength(3);
  });

  it('waves 3px either side of the centre in a 10px box', () => {
    const d = waveSegment(0, 40, 10, 1, 40, 0);
    const ys = numbers(d).filter((_, i) => i % 2 === 1);
    // Quadratic control points sit at twice the peak; the curve itself peaks at 3px.
    expect(Math.max(...ys)).toBeCloseTo(5 + 6, 5);
    expect(Math.min(...ys)).toBeCloseTo(5 - 6, 5);
    expect(d.match(/Q/g)).toHaveLength(2);
    // Half amplitude halves it; zero is a straight line.
    expect(
      Math.max(...numbers(waveSegment(0, 40, 10, 0.5, 40, 0)).filter((_, i) => i % 2)),
    ).toBeCloseTo(8, 5);
    expect(waveSegment(0, 40, 10, 0, 40, 0)).toBe('M0 5L40 5');
  });

  it('moves the wave under a fixed segment', () => {
    const still = waveSegment(10, 90, 10, 1, 40, 0);
    const moved = waveSegment(10, 90, 10, 1, 40, 0.25);
    expect(moved).not.toBe(still);
    expect(numbers(moved)[0]).toBe(10);
    expect(numbers(moved).at(-2)).toBe(90);
    // A whole wavelength later the wave is back where it started.
    expect(waveSegment(10, 90, 10, 1, 40, 1)).toBe(still);
  });

  it('shrinks the stop dot when the progress reaches it', () => {
    expect(stopIndicator(240, 4, 0.5)).toEqual({ cx: 238, cy: 2, r: 2 });
    expect(stopIndicator(240, 4, 1)).toBeNull();
  });

  it('flattens the wave below 10% and above 95%', () => {
    expect([0.05, 0.1, 0.5, 0.95, 1].map(amplitudeFor)).toEqual([0, 0, 1, 0, 0]);
  });
});

describe('circular geometry', () => {
  it('leaves a (4px + stroke) gap either side of the arc', () => {
    const gap = 8 / (Math.PI * 40);
    expect(circularFlatArcs(0.5)).toEqual({
      active: 0.5,
      trackStart: 0.5 + gap,
      trackLength: 0.5 - 2 * gap,
    });
    // Small progress shrinks the gap with it.
    expect(circularFlatArcs(0.01).trackStart).toBeCloseTo(0.02, 6);
  });

  it('builds the wavy ring from a star with one wave per 15px of circumference', () => {
    // r = 48 / 2 − 2 = 22; 2π × 22 / 15 ≈ 9.2 → 9 waves.
    expect(circularWavyShapes().vertices).toBe(9);
    const flat = circularWavyPaths(0);
    const wavy = circularWavyPaths(1);
    expect(flat.active).not.toBe(wavy.active);
    // Both start at 12 o'clock.
    expect(numbers(flat.track).slice(0, 2)[0]).toBeCloseTo(24, 0);
    expect(numbers(wavy.active).slice(0, 2)[0]).toBeCloseTo(24, 0);
    // A part-way amplitude morphs between them.
    expect(circularWavyPaths(0.5).active).not.toBe(wavy.active);
  });

  it('spaces the wavy track after the arc', () => {
    const { start, length } = circularWavyTrack(0.5);
    const circumference = Math.PI * 44;
    expect(start).toBeCloseTo((0.5 * circumference + 8) / circumference, 6);
    expect(start + length).toBeCloseTo(1 - 8 / circumference, 6);
  });
});

describe('thickness', () => {
  const thick = { active: 8, track: 8 };

  it('sizes the box for the strokes and the wave (Compose’s thick samples)', () => {
    expect(linearHeight(false)).toBe(4);
    expect(linearHeight(true)).toBe(10);
    expect(linearHeight(true, thick)).toBe(14);
    expect(circularSize(false)).toBe(40);
    expect(circularSize(true)).toBe(48);
    expect(circularSize(true, thick)).toBe(52);
    expect(circularSize(false, { active: 4, track: 8 })).toBe(44);
  });

  it('takes an explicit circular size within the spec’s 24–240px, whatever the strokes', () => {
    expect(circularSize(false, undefined, 96)).toBe(96);
    expect(circularSize(true, thick, 96)).toBe(96);
    expect(circularSize(false, undefined, 12)).toBe(24);
    expect(circularSize(true, undefined, 1000)).toBe(240);
  });

  it('keeps Compose’s wavelength at other sizes: more waves around a bigger ring', () => {
    // 2πr / 15px, r = (size − stroke) / 2.
    expect(circularWavyShapes(48).vertices).toBe(Math.round((Math.PI * 44) / 15));
    expect(circularWavyShapes(240).vertices).toBe(Math.round((Math.PI * 236) / 15));
    expect(circularWavyShapes(24).vertices).toBe(5);
  });

  it('insets the line for the thicker cap and keeps the 3px wave', () => {
    const { active } = linearPaths(240, 8, [0, 0.5], 0, 0, 40, thick);
    expect(active).toEqual(['M4 4L120 4']);
    const ys = numbers(waveSegment(0, 40, 14, 1, 40, 0, 8)).filter((_, i) => i % 2 === 1);
    expect(Math.max(...ys)).toBeCloseTo(7 + 6, 5);
  });

  it('keeps the stop dot at 4px, inset by a quarter of a thicker track', () => {
    expect(stopIndicator(240, 8, 0.5, thick)).toEqual({ cx: 240 - 4 - 2 + 2, cy: 4, r: 2 });
  });
});

describe('indeterminateCircular', () => {
  it('follows Compose’s 6000ms cycle: 10% to 87% and back, turning clockwise', () => {
    expect(indeterminateCircular(0)).toEqual({ rotation: 0, sweep: 0.1 });
    expect(indeterminateCircular(3000).sweep).toBeCloseTo(0.87, 6);
    expect(indeterminateCircular(6000)).toEqual(indeterminateCircular(0));
    // 1080° a cycle plus a 90° step in the first 300ms of every 1500ms.
    expect(indeterminateCircular(300).rotation).toBeCloseTo(54 + 90, 6);
    expect(indeterminateCircular(1500).rotation).toBeCloseTo((270 + 90) % 360, 6);
    // Between steps only the slow turn moves it.
    expect(indeterminateCircular(1000).rotation - indeterminateCircular(900).rotation).toBeCloseTo(
      18,
      6,
    );
  });
});
