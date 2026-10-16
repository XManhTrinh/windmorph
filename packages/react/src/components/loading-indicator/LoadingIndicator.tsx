'use client';

import { useAnimationFrame, useReducedMotion } from 'motion/react';
import { useMemo, useRef, type ComponentPropsWithRef, type CSSProperties } from 'react';
import { mergeProps, useProgressBar } from 'react-aria';
import type { MorphShape } from '../../primitives/morph-path';
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
import { mergeDataTokens } from '../../utils/split-data-attributes';

/** The spec's range for a loading indicator's size, in px. */
const MIN_SIZE = 24;
const MAX_SIZE = 240;

export interface LoadingIndicatorClassNames {
  /** The box the shape is drawn in (`contained`: the circle behind it). */
  root?: string;
  /** The `<svg>` drawing the shape; it fills with `currentColor`. */
  indicator?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface LoadingIndicatorOwnProps {
  /**
   * Progress from 0 to 1, for a progress-driven gesture such as pull to refresh. Leave it out
   * (the usual case) for an indeterminate indicator, which morphs through its shapes while
   * rotating. Don't switch one indicator from indeterminate to determinate: the spec says a
   * loading indicator never turns into a progress indicator; use a progress indicator instead.
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
  /**
   * The box's size in px. The spec: "Loading indicators default to 48dp, but the size is
   * flexible. It should be between 24dp to 240dp"; the shape keeps its ratio to the box.
   * Values outside that range are clamped. @default 48
   */
  size?: number;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
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
 * rotates, for short indeterminate waits (under 5 seconds). `value` (0–1) makes it follow a
 * gesture's progress, morphing from a circle to a soft burst; never switch one instance from
 * indeterminate to determinate (use a progress indicator for work whose progress becomes
 * known). Rendered as `role="progressbar"`, so it needs a name. Under
 * `prefers-reduced-motion` the indeterminate indicator only rotates.
 *
 * The box is 48px; set `size` (24–240px, the spec's range) or a `size-*` class, and the shape
 * scales with it.
 *
 * @example
 * <LoadingIndicator aria-label="Loading messages" />
 * <LoadingIndicator variant="contained" aria-label="Refreshing" />
 */
export function LoadingIndicator({
  value,
  variant,
  shapes,
  size,
  classNames,
  className,
  style,
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
      // The component tokens' hooks (loading-indicator-tokens.ts); `data-variant` is also public.
      data-tokens={mergeDataTokens('md-comp-loading-indicator', rest)}
      data-variant={variant ?? 'default'}
      data-indeterminate={indeterminate || undefined}
      style={
        size === undefined
          ? style
          : ({
              '--m3-loading-indicator-size': `${Math.min(Math.max(size, MIN_SIZE), MAX_SIZE)}px`,
              ...style,
            } as CSSProperties)
      }
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg
        viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        aria-hidden="true"
        overflow="visible"
        data-slot="indicator"
        className={styles.indicator({ class: classNames?.indicator })}
      >
        <g ref={groupRef} transform={frameTransform(initial)}>
          <path ref={pathRef} d={framePath(prepared, initial)} />
        </g>
      </svg>
    </div>
  );
}
