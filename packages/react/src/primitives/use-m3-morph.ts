'use client';

import { useTransform, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { morphPathAt, type M3MorphOptions, type MorphShape } from './morph-path';

/**
 * Morphs through Material shapes with a Motion value, for an `m.path`'s `d`. Shapes are the
 * 35 `MaterialShapes` (by name) or any normalized `RoundedPolygon`; corners are matched
 * between consecutive shapes as in Compose.
 *
 * Reduced motion is the caller's call: snap `progress` instead of springing it.
 *
 * @example
 * const progress = useSpring(0, useM3Spring('spatial'));
 * const d = useM3Morph(['Circle', 'Cookie9Sided'], progress, { size: 48 });
 * <svg viewBox="0 0 48 48"><m.path d={d} /></svg>
 */
export function useM3Morph(
  shapes: readonly MorphShape[],
  progress: MotionValue<number>,
  options: M3MorphOptions = {},
): MotionValue<string> {
  const { size = 1, startAngle = 0 } = options;
  const compute = (p: number) => morphPathAt(shapes, p, { size, startAngle });
  const computeRef = useRef(compute);
  const d = useTransform(progress, (p) => computeRef.current(p));
  // New shapes or options update the path without waiting for progress to change. This runs
  // every render; morphs are cached, so it costs one path build.
  useLayoutEffect(() => {
    computeRef.current = compute;
    const next = compute(progress.get());
    if (next !== d.get()) d.set(next);
  });
  return d;
}
