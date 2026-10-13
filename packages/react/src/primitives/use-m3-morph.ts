'use client';

import { useTransform, type MotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { MaterialShapes, type MaterialShapeName } from '../shapes/material-shapes';
import { Morph } from '../shapes/morph';
import { morphToPath, polygonToPath } from '../shapes/path';
import type { RoundedPolygon } from '../shapes/rounded-polygon';

export type MorphShape = RoundedPolygon | MaterialShapeName;

export interface M3MorphOptions {
  /**
   * Scales the unit-square shapes, e.g. to the SVG `viewBox` size. Default 1. Mid-morph
   * control points can poke up to ~1% outside the square, so give the `<svg>`
   * `overflow="visible"` or a little padding.
   */
  size?: number;
  /** Rotates each frame so its first point sits at this angle (degrees). Default 0. */
  startAngle?: number;
}

// Matching is the expensive part of a morph, so pairs are shared across components.
const morphCache = new WeakMap<RoundedPolygon, WeakMap<RoundedPolygon, Morph>>();

/** The (cached) morph between two shapes. */
export function getMorph(from: RoundedPolygon, to: RoundedPolygon): Morph {
  let byEnd = morphCache.get(from);
  if (!byEnd) morphCache.set(from, (byEnd = new WeakMap()));
  let morph = byEnd.get(to);
  if (!morph) byEnd.set(to, (morph = new Morph(from, to)));
  return morph;
}

const resolve = (shape: MorphShape) => (typeof shape === 'string' ? MaterialShapes[shape] : shape);

/**
 * SVG path data for `shapes` at `progress`, where 0 is the first shape, 1 the second and so
 * on. Values outside `[0, n - 1]` extrapolate the first or last morph, so springs can
 * overshoot.
 */
export function morphPathAt(
  shapes: readonly MorphShape[],
  progress: number,
  { size = 1, startAngle = 0 }: M3MorphOptions = {},
): string {
  if (shapes.length === 0) return '';
  if (shapes.length === 1) return polygonToPath(resolve(shapes[0]!), { scale: size, startAngle });
  const index = Math.min(Math.max(Math.floor(progress), 0), shapes.length - 2);
  const morph = getMorph(resolve(shapes[index]!), resolve(shapes[index + 1]!));
  // Rotation pivots in shape space, before scaling; normalized shapes center on (0.5, 0.5).
  return morphToPath(morph, progress - index, {
    scale: size,
    startAngle,
    rotationPivotX: 0.5,
    rotationPivotY: 0.5,
  });
}

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
