import { act, renderHook, waitFor } from '@testing-library/react';
import { motionValue } from 'motion/react';
import { describe, expect, it } from 'vitest';
import { MaterialShapes } from '../shapes/material-shapes';
import { polygonToPath } from '../shapes/path';
import { getMorph, morphPathAt, useM3Morph, type MorphShape } from './use-m3-morph';

describe('morphPathAt', () => {
  it('caches morphs per shape pair', () => {
    const a = MaterialShapes.Circle;
    const b = MaterialShapes.Square;
    expect(getMorph(a, b)).toBe(getMorph(a, b));
    expect(getMorph(b, a)).not.toBe(getMorph(a, b));
  });

  it('draws a single shape as its polygon', () => {
    expect(morphPathAt(['Heart'], 0.4, { size: 24 })).toBe(
      polygonToPath(MaterialShapes.Heart, { scale: 24 }),
    );
    expect(morphPathAt([], 0)).toBe('');
  });

  it('accepts shape names and polygons interchangeably', () => {
    expect(morphPathAt(['Circle', MaterialShapes.Burst], 0.3)).toBe(
      morphPathAt([MaterialShapes.Circle, 'Burst'], 0.3),
    );
  });

  it('walks a sequence of shapes', () => {
    const shapes: MorphShape[] = ['Circle', 'Square', 'Triangle'];
    // 1.5 is halfway through the second morph.
    expect(morphPathAt(shapes, 1.5)).toBe(morphPathAt(['Square', 'Triangle'], 0.5));
    // Past the end extrapolates the last morph rather than wrapping.
    expect(morphPathAt(shapes, 2.2)).toBe(morphPathAt(['Square', 'Triangle'], 1.2));
    expect(morphPathAt(shapes, -0.2)).toBe(morphPathAt(['Circle', 'Square'], -0.2));
    expect(morphPathAt(shapes, -0.2)).not.toBe(morphPathAt(shapes, 0));
  });

  it('scales into the requested size', () => {
    const coords = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    const unit = coords(morphPathAt(['Circle', 'Square'], 0.5));
    const scaled = coords(morphPathAt(['Circle', 'Square'], 0.5, { size: 48 }));
    scaled.forEach((v, i) => expect(v).toBeCloseTo(unit[i]! * 48, 2));
    // Morphs use each polygon's unsplit feature cubics, whose arc control points can sit just
    // outside the unit square that normalized() fitted the split cubics into (as upstream).
    expect(Math.max(...scaled)).toBeLessThanOrEqual(48 * 1.01);
    expect(Math.min(...scaled)).toBeGreaterThanOrEqual(-48 * 0.01);
  });
});

describe('useM3Morph', () => {
  // Motion batches derived values to the next frame, hence the waitFor.
  it('follows the progress value', async () => {
    const progress = motionValue(0);
    const { result } = renderHook(() => useM3Morph(['Circle', 'Cookie9Sided'], progress));
    expect(result.current.get()).toBe(morphPathAt(['Circle', 'Cookie9Sided'], 0));
    act(() => progress.set(0.5));
    await waitFor(() =>
      expect(result.current.get()).toBe(morphPathAt(['Circle', 'Cookie9Sided'], 0.5)),
    );
  });

  it('updates when shapes or options change without a progress change', async () => {
    const progress = motionValue(1);
    const { result, rerender } = renderHook(
      ({ shapes, size }: { shapes: MorphShape[]; size: number }) =>
        useM3Morph(shapes, progress, { size }),
      { initialProps: { shapes: ['Circle', 'Square'], size: 24 } },
    );
    rerender({ shapes: ['Circle', 'Heart'], size: 24 });
    expect(result.current.get()).toBe(morphPathAt(['Circle', 'Heart'], 1, { size: 24 }));
    rerender({ shapes: ['Circle', 'Heart'], size: 48 });
    expect(result.current.get()).toBe(morphPathAt(['Circle', 'Heart'], 1, { size: 48 }));
    // Later progress changes use the new shapes too.
    act(() => progress.set(0));
    await waitFor(() =>
      expect(result.current.get()).toBe(morphPathAt(['Circle', 'Heart'], 0, { size: 48 })),
    );
  });
});
