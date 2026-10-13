'use client';

import { useAnimationFrame, useReducedMotion } from 'motion/react';
import { useMemo, useRef, type ComponentPropsWithRef } from 'react';
import { mergeProps, useProgressBar } from 'react-aria';
import type { MorphShape } from '../../primitives/use-m3-morph';
import type { RoundedPolygon } from '../../shapes/rounded-polygon';
import { cn } from '../../utils/cn';
import {
  CONTAINER_SIZE,
  INDETERMINATE_SHAPES,
  determinateFrame,
  framePath,
  frameTransform,
  getDeterminateShapes,
  indeterminateFrame,
  prepareShapes,
  reducedMotionFrame,
  type Frame,
} from './loading-indicator-frames';
import { loadingIndicatorStyles, type LoadingIndicatorVariant } from './loading-indicator-styles';

export interface LoadingIndicatorClassNames {
  root?: string;
  /** The `<svg>` drawing the shape; it fills with `currentColor`. */
  indicator?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface LoadingIndicatorOwnProps {
  /**
   * Progress from 0 to 1. Leave it out for an indeterminate indicator, which morphs
   * through its shapes while rotating.
   */
  value?: number;
  /** `contained` draws the indicator on a `primary-container` circle. @default "default" */
  variant?: LoadingIndicatorVariant;
  /**
   * At least two shapes (`MaterialShapes` names or `RoundedPolygon`s). Defaults to
   * Compose's sequences: seven shapes when indeterminate, circle → soft burst when
   * determinate.
   */
  shapes?: readonly [MorphShape, MorphShape, ...MorphShape[]];
  classNames?: LoadingIndicatorClassNames;
}

export type LoadingIndicatorProps = LoadingIndicatorOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, 'children' | 'role' | keyof LoadingIndicatorOwnProps>;

const polygonIds = new WeakMap<RoundedPolygon, number>();
let nextPolygonId = 0;
const shapeKey = (shape: MorphShape) => {
  if (typeof shape === 'string') return shape;
  let id = polygonIds.get(shape);
  if (id === undefined) polygonIds.set(shape, (id = nextPolygonId++));
  return `#${id}`;
};

/**
 * M3 Expressive loading indicator: a shape that morphs through Material shapes while it
 * rotates. Indeterminate by default; pass `value` (0–1) for a determinate indicator that
 * morphs from a circle to a soft burst as it fills. Rendered as `role="progressbar"`, so it
 * needs a name. Under `prefers-reduced-motion` the indeterminate indicator only rotates.
 *
 * The box is 48px; size it with `className` (e.g. `size-24`) and the shape scales with it.
 *
 * @example
 * <LoadingIndicator aria-label="Loading messages" />
 * <LoadingIndicator variant="contained" value={0.4} aria-label="Uploading" />
 */
export function LoadingIndicator({
  value,
  variant,
  shapes,
  classNames,
  className,
  ref,
  ...rest
}: LoadingIndicatorProps) {
  const indeterminate = value === undefined;
  const sequence = shapes ?? (indeterminate ? INDETERMINATE_SHAPES : getDeterminateShapes());
  const key = sequence.map(shapeKey).join();
  // The key captures the sequence's contents, so inline arrays don't re-prepare.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const prepared = useMemo(() => prepareShapes(sequence, indeterminate), [key, indeterminate]);
  const reduceMotion = useReducedMotion() ?? false;

  const { progressBarProps } = useProgressBar({
    ...rest,
    value: indeterminate ? undefined : Number.isNaN(value) ? 0 : value,
    minValue: 0,
    maxValue: 1,
    isIndeterminate: indeterminate,
  });

  const frameAt = (elapsedMs: number): Frame =>
    !indeterminate
      ? determinateFrame(value ?? 0, prepared.morphs.length)
      : reduceMotion
        ? reducedMotionFrame(elapsedMs)
        : indeterminateFrame(elapsedMs, prepared.morphs.length);

  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  // Indeterminate frames are written straight to the DOM; React renders only the first.
  useAnimationFrame((elapsedMs) => {
    if (!indeterminate) return;
    const frame = frameAt(elapsedMs);
    groupRef.current?.setAttribute('transform', frameTransform(frame));
    pathRef.current?.setAttribute('d', framePath(prepared, frame));
  });

  const initial = frameAt(0);
  const styles = loadingIndicatorStyles({ variant });

  return (
    <div
      {...mergeProps(rest, progressBarProps)}
      ref={ref}
      data-indeterminate={indeterminate || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg
        viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        aria-hidden="true"
        overflow="visible"
        className={styles.indicator({ class: classNames?.indicator })}
      >
        <g ref={groupRef} transform={frameTransform(initial)}>
          <path ref={pathRef} d={framePath(prepared, initial)} />
        </g>
      </svg>
    </div>
  );
}
