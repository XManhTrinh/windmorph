'use client';

import { useAnimationFrame, useReducedMotion } from 'motion/react';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type RefObject,
} from 'react';
import { mergeProps, useObjectRef, useProgressBar } from 'react-aria';
import { cn } from '../../utils/cn';
import {
  AMPLITUDE_DURATION_MS,
  CIRCULAR_FLAT_SIZE,
  CIRCULAR_WAVE_SIZE,
  LINEAR_FLAT_HEIGHT,
  LINEAR_INDETERMINATE_WAVELENGTH,
  LINEAR_WAVE_HEIGHT,
  LINEAR_WAVELENGTH,
  LINEAR_WIDTH,
  WAVE_PERIOD_MS,
  amplitudeFor,
  circlePath,
  circularFlatArcs,
  circularWavePeriod,
  circularWavyPaths,
  circularWavyShapes,
  circularWavyTrack,
  emphasizedAccelerate,
  indeterminateLinearFractions,
  linearPaths,
  standard,
  stopIndicator,
} from './progress-geometry';
import { circularProgressStyles, linearProgressStyles } from './progress-styles';

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

const clamp01 = (value: number) => (Number.isNaN(value) ? 0 : Math.min(Math.max(value, 0), 1));

interface AmplitudeAnimation {
  from: number;
  to: number;
  /** Frame time the animation started at; null until the next frame. */
  start: number | null;
  /** The last amplitude drawn. */
  last: number;
}

/**
 * Compose animates a wavy indicator's amplitude over 500ms (standard easing growing,
 * emphasized-accelerate shrinking) whenever its target changes. Returns a reader for
 * animation frames, timed by the frame loop; renders use the target directly.
 */
function useAmplitude(target: number, reduceMotion: boolean) {
  const anim = useRef<AmplitudeAnimation>({ from: target, to: target, start: 0, last: target });
  useLayoutEffect(() => {
    const a = anim.current;
    if (a.to === target) return;
    anim.current = { from: a.last, to: target, start: null, last: a.last };
  }, [target]);
  return (time: number) => {
    const a = anim.current;
    if (reduceMotion) return (a.last = target);
    if (a.start === null) a.start = time;
    const t = Math.min(Math.max((time - a.start) / AMPLITUDE_DURATION_MS, 0), 1);
    const eased = a.to > a.from ? standard(t) : emphasizedAccelerate(t);
    return (a.last = a.from + (a.to - a.from) * eased);
  };
}

function useWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(LINEAR_WIDTH);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || LINEAR_WIDTH);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/* ------------------------------------------------------------------ Linear */

export interface LinearProgressIndicatorClassNames {
  root?: string;
  track?: string;
  indicator?: string;
  stop?: string;
}

interface LinearOwnProps {
  /** Progress from 0 to 1; leave it out for an indeterminate indicator. */
  value?: number;
  /** The M3 Expressive wavy indicator. @default false */
  wavy?: boolean;
  /** The dot at the end of a determinate track (Compose draws it). @default true */
  stopIndicator?: boolean;
  classNames?: LinearProgressIndicatorClassNames;
}

export type LinearProgressIndicatorProps = LinearOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof LinearOwnProps | 'children' | 'role'>;

/**
 * M3 linear progress indicator: determinate (`value`) or indeterminate, flat or wavy, with a
 * stop dot at the end of a determinate track. 240px wide by default; set the width with
 * `className` (`w-full`). A wavy determinate indicator flattens below 10% and above 95%.
 *
 * @example
 * <LinearProgressIndicator value={0.4} wavy aria-label="Uploading" className="w-full" />
 */
export function LinearProgressIndicator({
  value,
  wavy = false,
  stopIndicator: showStop = true,
  classNames,
  className,
  ref,
  ...rest
}: LinearProgressIndicatorProps) {
  const indeterminate = value === undefined;
  const v = clamp01(value ?? 0);
  const rootRef = useObjectRef(ref);
  const width = useWidth(rootRef);
  const height = wavy ? LINEAR_WAVE_HEIGHT : LINEAR_FLAT_HEIGHT;
  const reduceMotion = useReducedMotion() ?? false;
  const amplitude = useAmplitude(wavy ? (indeterminate ? 1 : amplitudeFor(v)) : 0, reduceMotion);
  const { progressBarProps } = useProgressBar({
    ...rest,
    value: indeterminate ? undefined : v,
    minValue: 0,
    maxValue: 1,
    isIndeterminate: indeterminate,
  });

  const ampTarget = wavy ? (indeterminate ? 1 : amplitudeFor(v)) : 0;
  /** A frame at `time` (the loop's ms, for the indeterminate keyframes) and `now` (clock). */
  const frame = (time: number, amp: number, now: number) => {
    const offset = amp > 0 && !reduceMotion ? (now % WAVE_PERIOD_MS) / WAVE_PERIOD_MS : 0;
    return {
      paths: linearPaths(
        width,
        height,
        indeterminate ? indeterminateLinearFractions(time) : [0, v],
        amp,
        offset,
        indeterminate ? LINEAR_INDETERMINATE_WAVELENGTH : LINEAR_WAVELENGTH,
      ),
      stop: !indeterminate && showStop ? stopIndicator(width, height, v) : null,
    };
  };

  const trackRef = useRef<SVGPathElement>(null);
  const firstRef = useRef<SVGPathElement>(null);
  const secondRef = useRef<SVGPathElement>(null);
  useAnimationFrame((time) => {
    if (!indeterminate && !wavy) return;
    const { paths } = frame(time, amplitude(time), time);
    trackRef.current?.setAttribute('d', paths.track);
    firstRef.current?.setAttribute('d', paths.active[0] ?? '');
    secondRef.current?.setAttribute('d', paths.active[1] ?? '');
  });

  // The first render is a deterministic frame (SSR-safe); animation frames take over.
  const initial = frame(0, ampTarget, 0);
  const styles = linearProgressStyles({ wavy });
  return (
    <div
      {...mergeProps(rest, progressBarProps)}
      ref={rootRef}
      data-indeterminate={indeterminate || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className={styles.svg()}
      >
        <path
          ref={trackRef}
          d={initial.paths.track}
          className={styles.track({ class: classNames?.track })}
        />
        <path
          ref={firstRef}
          d={initial.paths.active[0] ?? ''}
          className={styles.indicator({ class: classNames?.indicator })}
        />
        {/* Indeterminate indicators draw a second line. */}
        <path
          ref={secondRef}
          d={initial.paths.active[1] ?? ''}
          className={styles.indicator({ class: classNames?.indicator })}
        />
        {initial.stop && (
          <circle
            cx={initial.stop.cx}
            cy={initial.stop.cy}
            r={initial.stop.r}
            className={styles.stop({ class: classNames?.stop })}
          />
        )}
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- Circular */

export interface CircularProgressIndicatorClassNames {
  root?: string;
  track?: string;
  indicator?: string;
}

interface CircularOwnProps {
  /** Progress from 0 to 1. (Indeterminate circular progress is replaced by `LoadingIndicator`.) */
  value: number;
  /** The M3 Expressive wavy indicator (48px). @default false */
  wavy?: boolean;
  classNames?: CircularProgressIndicatorClassNames;
}

export type CircularProgressIndicatorProps = CircularOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof CircularOwnProps | 'children' | 'role'>;

/**
 * M3 circular progress indicator (determinate): an arc from 12 o'clock over a track, flat
 * (40px) or wavy (48px), whose wave travels around the ring. M3 Expressive replaces the
 * indeterminate circular indicator with {@link LoadingIndicator}.
 *
 * @example
 * <CircularProgressIndicator value={0.7} wavy aria-label="Downloading" />
 */
export function CircularProgressIndicator({
  value,
  wavy = false,
  classNames,
  className,
  ref,
  ...rest
}: CircularProgressIndicatorProps) {
  const v = clamp01(value);
  const reduceMotion = useReducedMotion() ?? false;
  const amplitude = useAmplitude(wavy ? amplitudeFor(v) : 0, reduceMotion);
  const { progressBarProps } = useProgressBar({ ...rest, value: v, minValue: 0, maxValue: 1 });
  const styles = circularProgressStyles({ wavy });
  const size = wavy ? CIRCULAR_WAVE_SIZE : CIRCULAR_FLAT_SIZE;

  const groupRef = useRef<SVGGElement>(null);
  const activeRef = useRef<SVGPathElement>(null);
  const period = circularWavePeriod(circularWavyShapes(size).vertices);
  const ampTarget = wavy ? amplitudeFor(v) : 0;
  const wavyFrame = (amp: number, now: number) => {
    const offset = amp > 0 && !reduceMotion ? (now % period) / period : 0;
    return { offset, paths: circularWavyPaths(amp, size) };
  };
  useAnimationFrame((time) => {
    if (!wavy) return;
    const { offset, paths } = wavyFrame(amplitude(time), time);
    activeRef.current?.setAttribute('d', paths.active);
    activeRef.current?.setAttribute('stroke-dashoffset', String(-offset));
    // Shift the dash along the ring and turn the ring back: the wave moves, the arc stays.
    groupRef.current?.setAttribute('transform', `rotate(${-offset * 360} ${size / 2} ${size / 2})`);
  });

  let content;
  if (!wavy) {
    const arcs = circularFlatArcs(v, size);
    const d = circlePath(size);
    content = (
      <>
        <path
          d={d}
          pathLength={1}
          strokeDasharray={`${arcs.trackLength} 1`}
          strokeDashoffset={-arcs.trackStart}
          className={styles.track({ class: classNames?.track })}
        />
        {v > 0 && (
          <path
            d={d}
            pathLength={1}
            strokeDasharray={`${arcs.active} 1`}
            className={styles.indicator({ class: classNames?.indicator })}
          />
        )}
      </>
    );
  } else {
    const initial = wavyFrame(ampTarget, 0);
    const track = circularWavyTrack(v, size);
    content = (
      <>
        <path
          d={initial.paths.track}
          pathLength={1}
          strokeDasharray={`${track.length} 1`}
          strokeDashoffset={-track.start}
          className={styles.track({ class: classNames?.track })}
        />
        {v > 0 && (
          <g ref={groupRef}>
            <path
              ref={activeRef}
              d={initial.paths.active}
              pathLength={2}
              strokeDasharray={`${v} 2`}
              strokeDashoffset={-initial.offset}
              className={styles.indicator({ class: classNames?.indicator })}
            />
          </g>
        )}
      </>
    );
  }

  return (
    <div
      {...mergeProps(rest, progressBarProps)}
      ref={ref}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={styles.svg()}>
        {content}
      </svg>
    </div>
  );
}
