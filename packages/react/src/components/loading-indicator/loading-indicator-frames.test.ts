import { describe, expect, it } from 'vitest';
import { MaterialShapes } from '../../shapes/material-shapes';
import {
  GLOBAL_ROTATION_MS,
  INDETERMINATE_SHAPES,
  MORPH_DURATION_MS,
  MORPH_INTERVAL_MS,
  determinateFrame,
  framePath,
  getDeterminateShapes,
  indeterminateFrame,
  morphSpring,
  prepareShapes,
  reducedMotionFrame,
  scaleFactor,
} from './loading-indicator-frames';

const coords = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);

describe('morph spring', () => {
  it('ends at Compose’s estimated duration for a 0.1 threshold', () => {
    // envelope 1.25·e^(−8.485t) = 0.1 → t = 0.2977s, truncated to whole milliseconds.
    expect(MORPH_DURATION_MS).toBe(297);
  });

  it('starts at rest and overshoots by about 9.5%', () => {
    expect(morphSpring(0)).toBe(0);
    const peakMs = (Math.PI / (Math.sqrt(200) * 0.8)) * 1000;
    expect(morphSpring(peakMs)).toBeCloseTo(1 + Math.exp((-0.6 * Math.PI) / 0.8), 6);
    expect(Math.abs(morphSpring(MORPH_DURATION_MS) - 1)).toBeLessThan(0.1);
  });
});

describe('indeterminateFrame', () => {
  const n = INDETERMINATE_SHAPES.length;

  it('starts on the first morph a quarter turn in', () => {
    expect(indeterminateFrame(0, n)).toEqual({ index: 0, progress: 0, rotation: 90 });
  });

  it('moves to the next morph and a further quarter turn when the spring finishes', () => {
    const global = (ms: number) => ((ms % GLOBAL_ROTATION_MS) / GLOBAL_ROTATION_MS) * 360;
    const done = indeterminateFrame(MORPH_DURATION_MS, n);
    expect(done).toMatchObject({ index: 1, progress: 0 });
    expect(done.rotation).toBeCloseTo(180 + global(MORPH_DURATION_MS), 6);
    // Nothing moves but the global rotation until the next interval starts.
    const waiting = indeterminateFrame(MORPH_INTERVAL_MS - 1, n);
    expect(waiting).toMatchObject({ index: 1, progress: 0 });
    expect(indeterminateFrame(MORPH_INTERVAL_MS, n)).toMatchObject({ index: 1, progress: 0 });
  });

  it('turns smoothly across the snap to the next morph', () => {
    const before = indeterminateFrame(MORPH_DURATION_MS - 1, n);
    const after = indeterminateFrame(MORPH_DURATION_MS, n);
    expect(Math.abs(after.rotation - before.rotation)).toBeLessThan(10);
  });

  it('wraps around the sequence', () => {
    expect(indeterminateFrame(n * MORPH_INTERVAL_MS, n).index).toBe(0);
    expect(indeterminateFrame(n * MORPH_INTERVAL_MS + MORPH_DURATION_MS, n).index).toBe(1);
  });

  it('only rotates under reduced motion', () => {
    expect(reducedMotionFrame(GLOBAL_ROTATION_MS / 4)).toEqual({
      index: 0,
      progress: 0,
      rotation: 90,
    });
  });
});

describe('determinateFrame', () => {
  it('morphs and turns counter-clockwise by up to half a turn', () => {
    expect(determinateFrame(0, 1)).toEqual({ index: 0, progress: 0, rotation: -0 });
    expect(determinateFrame(0.5, 1)).toEqual({ index: 0, progress: 0.5, rotation: -90 });
    expect(determinateFrame(1, 1)).toEqual({ index: 0, progress: 1, rotation: -180 });
  });

  it('walks a longer sequence', () => {
    expect(determinateFrame(0.5, 2)).toMatchObject({ index: 1, progress: 0 });
    expect(determinateFrame(0.75, 2)).toMatchObject({ index: 1, progress: 0.5 });
    expect(determinateFrame(1, 2)).toMatchObject({ index: 1, progress: 1 });
  });

  it('clamps out-of-range values and treats NaN as 0', () => {
    expect(determinateFrame(1.5, 1)).toEqual(determinateFrame(1, 1));
    expect(determinateFrame(-1, 1)).toEqual(determinateFrame(0, 1));
    expect(determinateFrame(Number.NaN, 1)).toEqual(determinateFrame(0, 1));
  });
});

describe('shapes', () => {
  it('builds circular and open morph sequences', () => {
    expect(prepareShapes(INDETERMINATE_SHAPES, true).morphs).toHaveLength(7);
    expect(prepareShapes(getDeterminateShapes(), false).morphs).toHaveLength(1);
    expect(() => prepareShapes(['Circle'], false)).toThrow();
  });

  it('scales so rotating shapes never clip, times 38/48', () => {
    const factor = scaleFactor(INDETERMINATE_SHAPES.map((name) => MaterialShapes[name]));
    expect(factor).toBeLessThan(38 / 48);
    expect(factor).toBeGreaterThan(0.5);
    // A circle's max bounds equal its bounds, so it alone gets the full active scale.
    expect(scaleFactor([MaterialShapes.Circle, MaterialShapes.Circle])).toBeCloseTo(38 / 48, 2);
  });

  it('centres every frame in the 48px box', () => {
    const prepared = prepareShapes(INDETERMINATE_SHAPES, true);
    for (const index of [0, 3, 6]) {
      const values = coords(framePath(prepared, { index, progress: 0.4, rotation: 0 }));
      const xs = values.filter((_, i) => i % 2 === 0);
      const ys = values.filter((_, i) => i % 2 === 1);
      expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(24, 2);
      expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(24, 2);
      // A rotating shape stays inside the box.
      for (const [x, y] of xs.map((x, i) => [x, ys[i]!] as const)) {
        expect(Math.hypot(x - 24, y - 24)).toBeLessThanOrEqual(24 * 1.02);
      }
    }
  });
});
