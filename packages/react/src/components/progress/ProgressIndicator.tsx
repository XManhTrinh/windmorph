'use client';

import { useAnimationFrame, useReducedMotion } from 'motion/react';
import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type RefObject,
} from 'react';
import { mergeProps, useObjectRef, useProgressBar } from 'react-aria';
import { cn } from '../../utils/cn';
import {
  AMPLITUDE_DURATION_MS,
  CIRCULAR_WAVELENGTH,
  LINEAR_INDETERMINATE_WAVELENGTH,
  LINEAR_WAVELENGTH,
  LINEAR_WIDTH,
  STROKE,
  WAVE_PERIOD_MS,
  amplitudeFor,
  circlePath,
  circularFlatArcs,
  circularSize,
  circularWavePeriod,
  circularWavyPaths,
  circularWavyShapes,
  circularWavyTrack,
  emphasizedAccelerate,
  indeterminateCircular,
  indeterminateLinearFractions,
  linearHeight,
  linearPaths,
  standard,
  stopIndicator,
  type Strokes,
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

interface ValueAnimation {
  from: number;
  to: number;
  /** When the animation started (frame time), null until the next frame. */
  start: number | null;
  /** The last value drawn. */
  last: number;
}

/** Compose's `ProgressIndicatorDefaults.ProgressAnimationSpec`: spring(1, 50), no bounce. */
const VALUE_SPRING_OMEGA = Math.sqrt(50);
/** Compose's wavy `ProgressAnimationSpec` lasts 500ms. */
const WAVY_VALUE_DURATION_MS = 500;

/**
 * A determinate value change eases instead of jumping ("Linear indicators animate from the
 * leading to the trailing edge along the track"): flat indicators on Compose's critically
 * damped spring (stiffness 50), wavy ones over 500ms (standard easing). Returns a reader for
 * animation frames and whether an animation is running; reduced motion jumps.
 */
function useAnimatedValue(
  target: number,
  wavy: boolean,
  indeterminate: boolean,
  reduceMotion: boolean,
) {
  const anim = useRef<ValueAnimation>({ from: target, to: target, start: 0, last: target });
  const wasIndeterminate = useRef(indeterminate);
  useLayoutEffect(() => {
    const a = anim.current;
    // Leaving indeterminate, the handoff eases into the value: start there, don't animate twice.
    if (indeterminate || wasIndeterminate.current) {
      anim.current = { from: target, to: target, start: 0, last: target };
    } else if (a.to !== target) {
      anim.current = { from: a.last, to: target, start: null, last: a.last };
    }
    wasIndeterminate.current = indeterminate;
  }, [target, indeterminate]);
  const read = (time: number) => {
    const a = anim.current;
    if (reduceMotion || a.from === a.to) return (a.last = a.to);
    if (a.start === null) a.start = time;
    const elapsed = Math.max(time - a.start, 0);
    let progress: number;
    if (wavy) {
      progress = standard(Math.min(elapsed / WAVY_VALUE_DURATION_MS, 1));
    } else {
      // Critically damped from rest: x(t) = 1 − (1 + ωt)·e^(−ωt).
      const wt = (VALUE_SPRING_OMEGA * elapsed) / 1000;
      progress = 1 - (1 + wt) * Math.exp(-wt);
      if (progress > 0.999) progress = 1;
    }
    if (progress >= 1) a.from = a.to;
    return (a.last = a.from + (a.to - a.from) * progress);
  };
  return { read, active: () => !reduceMotion && anim.current.from !== anim.current.to };
}

/**
 * When an indicator turns determinate, its last indeterminate frame eases into the value over
 * 500ms (standard easing) instead of jumping, as the spec shows. `record` keeps the frame the
 * loop last drew; `at(time)` gives the handoff's start and eased progress, or null.
 */
function useHandoff<T>(indeterminate: boolean, reduceMotion: boolean) {
  const last = useRef<T | null>(null);
  const handoff = useRef<{ from: T; start: number | null } | null>(null);
  const wasIndeterminate = useRef(indeterminate);
  useLayoutEffect(() => {
    if (wasIndeterminate.current && !indeterminate && last.current !== null && !reduceMotion) {
      handoff.current = { from: last.current, start: null };
    }
    if (indeterminate) handoff.current = null;
    wasIndeterminate.current = indeterminate;
  }, [indeterminate, reduceMotion]);
  return {
    record: (state: T) => {
      last.current = state;
    },
    at: (time: number) => {
      const h = handoff.current;
      if (!h) return null;
      if (h.start === null) h.start = time;
      const t = Math.min(Math.max((time - h.start) / AMPLITUDE_DURATION_MS, 0), 1);
      if (t >= 1) handoff.current = null;
      return { from: h.from, t: standard(t) };
    },
    active: () => handoff.current !== null,
  };
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** The strokes from the thickness props; the track follows the indicator unless set. */
const strokesFor = (thickness: number, trackThickness: number | undefined): Strokes => ({
  active: thickness,
  track: trackThickness ?? thickness,
});

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

/* ------------------------------------------------------------------ Shared */

interface SharedOwnProps {
  /** Progress from 0 to 1; leave it out for an indeterminate indicator. */
  value?: number;
  /** The M3 Expressive wavy indicator. @default false */
  wavy?: boolean;
  /**
   * Thickness of the active indicator in px. The spec's thick configuration is 8 (with the
   * track); the indicator grows to fit, keeping room for the wave. @default 4
   */
  thickness?: number;
  /** Thickness of the track in px. @default thickness */
  trackThickness?: number;
  /**
   * Draw the track (and the linear stop dot). Remove it inside a button, colouring the
   * indicator like the button's label: `classNames={{ indicator: 'stroke-current' }}`.
   * @default true
   */
  track?: boolean;
}

/* ------------------------------------------------------------------ Linear */

export interface LinearProgressIndicatorClassNames {
  /** The outer element, which carries the `progressbar` role. */
  root?: string;
  /** The track: the line behind the active indicator. */
  track?: string;
  /** The active indicator, the line that shows progress. */
  indicator?: string;
  /** The stop dot at the end of a determinate track. */
  stop?: string;
}

interface LinearOwnProps extends SharedOwnProps {
  /** The dot at the end of a determinate track (Compose draws it). @default true */
  stopIndicator?: boolean;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: LinearProgressIndicatorClassNames;
}

export type LinearProgressIndicatorProps = LinearOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof LinearOwnProps | 'children' | 'role'>;

/**
 * M3 linear progress indicator: determinate (`value`) or indeterminate, flat or wavy, with a
 * stop dot at the end of a determinate track. 240px wide by default; set the width with
 * `className` (`w-full`). `thickness` and `trackThickness` set the strokes (4px by default).
 * A wavy determinate indicator flattens below 10% and above 95%. It mirrors in right-to-left
 * layouts. When `value` arrives on an indeterminate indicator, the moving line eases into it.
 *
 * @example
 * <LinearProgressIndicator value={0.4} wavy aria-label="Uploading" className="w-full" />
 */
export function LinearProgressIndicator({
  value,
  wavy = false,
  thickness = STROKE,
  trackThickness,
  track: showTrack = true,
  stopIndicator: showStop = true,
  classNames,
  className,
  style,
  ref,
  ...rest
}: LinearProgressIndicatorProps) {
  const indeterminate = value === undefined;
  const v = clamp01(value ?? 0);
  const rootRef = useObjectRef(ref);
  const width = useWidth(rootRef);
  const strokes = strokesFor(thickness, trackThickness);
  const height = linearHeight(wavy, strokes);
  const reduceMotion = useReducedMotion() ?? false;
  const ampTarget = wavy ? (indeterminate ? 1 : amplitudeFor(v)) : 0;
  const amplitude = useAmplitude(ampTarget, reduceMotion);
  const handoff = useHandoff<number[]>(indeterminate, reduceMotion);
  const drawnValue = useAnimatedValue(v, wavy, indeterminate, reduceMotion);
  const { progressBarProps } = useProgressBar({
    ...rest,
    value: indeterminate ? undefined : v,
    minValue: 0,
    maxValue: 1,
    isIndeterminate: indeterminate,
  });

  /** The track and active paths for some line positions, wave amplitude and clock. */
  const paths = (fractions: number[], amp: number, now: number, wavelength: number) => {
    const offset = amp > 0 && !reduceMotion ? (now % WAVE_PERIOD_MS) / WAVE_PERIOD_MS : 0;
    return linearPaths(width, height, fractions, amp, offset, wavelength, strokes);
  };
  const determinate = [0, v, 0, 0];

  const trackRef = useRef<SVGPathElement>(null);
  const firstRef = useRef<SVGPathElement>(null);
  const secondRef = useRef<SVGPathElement>(null);
  useAnimationFrame((time) => {
    if (!indeterminate && !wavy && !handoff.active() && !drawnValue.active()) return;
    let fractions = indeterminate ? determinate : [0, drawnValue.read(time), 0, 0];
    let wavelength = LINEAR_WAVELENGTH;
    if (indeterminate) {
      fractions = indeterminateLinearFractions(time);
      wavelength = LINEAR_INDETERMINATE_WAVELENGTH;
      handoff.record(fractions);
    } else {
      const step = handoff.at(time);
      if (step) {
        fractions = step.from.map((f, i) => mix(f, determinate[i]!, step.t));
        wavelength = mix(LINEAR_INDETERMINATE_WAVELENGTH, LINEAR_WAVELENGTH, step.t);
      }
    }
    const drawn = paths(fractions, amplitude(time), time, wavelength);
    trackRef.current?.setAttribute('d', drawn.track);
    firstRef.current?.setAttribute('d', drawn.active[0] ?? '');
    secondRef.current?.setAttribute('d', drawn.active[1] ?? '');
  });

  // The first render is a deterministic frame (SSR-safe); animation frames take over.
  const initial = indeterminate
    ? paths(indeterminateLinearFractions(0), ampTarget, 0, LINEAR_INDETERMINATE_WAVELENGTH)
    : paths(determinate, ampTarget, 0, LINEAR_WAVELENGTH);
  const stop =
    !indeterminate && showTrack && showStop ? stopIndicator(width, height, v, strokes) : null;
  const styles = linearProgressStyles({ wavy });
  return (
    <div
      {...mergeProps(rest, progressBarProps)}
      ref={rootRef}
      // The component tokens' hook (progress-tokens.ts).
      data-tokens="md-comp-progress-indicator"
      data-indeterminate={indeterminate || undefined}
      style={{ '--m3-progress-height': `${height}px`, ...style } as CSSProperties}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className={styles.svg()}
      >
        {showTrack && (
          <path
            ref={trackRef}
            d={initial.track}
            strokeWidth={strokes.track}
            data-slot="track"
            className={styles.track({ class: classNames?.track })}
          />
        )}
        <path
          ref={firstRef}
          d={initial.active[0] ?? ''}
          strokeWidth={strokes.active}
          data-slot="indicator"
          className={styles.indicator({ class: classNames?.indicator })}
        />
        {/* Indeterminate indicators draw a second line. */}
        <path
          ref={secondRef}
          d={initial.active[1] ?? ''}
          strokeWidth={strokes.active}
          data-slot="indicator"
          className={styles.indicator({ class: classNames?.indicator })}
        />
        {stop && (
          <circle
            cx={stop.cx}
            cy={stop.cy}
            r={stop.r}
            data-slot="stop"
            className={styles.stop({ class: classNames?.stop })}
          />
        )}
      </svg>
    </div>
  );
}

/* ---------------------------------------------------------------- Circular */

export interface CircularProgressIndicatorClassNames {
  /** The outer element, which carries the `progressbar` role. */
  root?: string;
  /** The track: the ring behind the active indicator. */
  track?: string;
  /** The active indicator, the arc that shows progress. */
  indicator?: string;
}

interface CircularOwnProps extends SharedOwnProps {
  /**
   * The diameter in px. The spec: circular indicators "can range from 24dp to 240dp"; values
   * outside that range are clamped. The strokes keep their `thickness`; the ring and its wave
   * grow (more waves of the same length, as in Compose).
   * @default 40, or 48 when wavy, plus any extra thickness
   */
  size?: number;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
  classNames?: CircularProgressIndicatorClassNames;
}

export type CircularProgressIndicatorProps = CircularOwnProps &
  Naming &
  Omit<ComponentPropsWithRef<'div'>, keyof CircularOwnProps | 'children' | 'role'>;

interface CircularFrame {
  /** Degrees clockwise from 12 o'clock where the arc starts. */
  rotation: number;
  /** The arc's length as a fraction of the ring. */
  sweep: number;
}

/** Every attribute the circular indicator animates, for one frame. */
function circularAttributes(
  wavy: boolean,
  size: number,
  strokes: Strokes,
  { rotation, sweep }: CircularFrame,
  amplitude: number,
  offset: number,
) {
  const c = size / 2;
  const turn = (deg: number) => `rotate(${Math.round(deg * 100) / 100} ${c} ${c})`;
  if (!wavy) {
    const d = circlePath(size, Math.max(strokes.active, strokes.track));
    const arcs = circularFlatArcs(sweep, size, strokes.active);
    return {
      ring: turn(rotation),
      wave: '',
      trackD: d,
      trackDash: `${arcs.trackLength} 1`,
      trackOffset: -arcs.trackStart,
      activeD: d,
      activeDash: `${sweep} 1`,
      activeOffset: 0,
      visible: sweep > 0,
    };
  }
  const paths = circularWavyPaths(amplitude, size, strokes.active);
  const track = circularWavyTrack(sweep, size, strokes);
  return {
    ring: turn(rotation),
    // Shift the dash along the ring and turn the ring back: the wave moves, the arc stays.
    wave: turn(-offset * 360),
    trackD: paths.track,
    trackDash: `${track.length} 1`,
    trackOffset: -track.start,
    activeD: paths.active,
    activeDash: `${sweep} 2`,
    activeOffset: -offset,
    visible: sweep > 0,
  };
}

/**
 * M3 circular progress indicator: determinate (`value`) or indeterminate, flat (40px) or wavy
 * (48px), drawn clockwise from 12 o'clock over a track. A wavy indicator's wave travels
 * around the ring. `thickness` and `trackThickness` set the strokes (4px by default); the spec's
 * thick configuration (8px) makes it 44px, or 52px wavy. `size` sets the diameter (24–240px).
 * It isn't mirrored in right-to-left
 * layouts. For short waits, {@link LoadingIndicator} is recommended.
 *
 * @example
 * <CircularProgressIndicator value={0.7} wavy aria-label="Downloading" />
 * <CircularProgressIndicator aria-label="Loading" />
 */
export function CircularProgressIndicator({
  value,
  wavy = false,
  size: sizeProp,
  thickness = STROKE,
  trackThickness,
  track: showTrack = true,
  classNames,
  className,
  style,
  ref,
  ...rest
}: CircularProgressIndicatorProps) {
  const indeterminate = value === undefined;
  const v = clamp01(value ?? 0);
  const reduceMotion = useReducedMotion() ?? false;
  const strokes = strokesFor(thickness, trackThickness);
  const size = circularSize(wavy, strokes, sizeProp);
  const ampTarget = wavy ? (indeterminate ? 1 : amplitudeFor(v)) : 0;
  const amplitude = useAmplitude(ampTarget, reduceMotion);
  const handoff = useHandoff<CircularFrame>(indeterminate, reduceMotion);
  const drawnValue = useAnimatedValue(v, wavy, indeterminate, reduceMotion);
  const { progressBarProps } = useProgressBar({
    ...rest,
    value: indeterminate ? undefined : v,
    minValue: 0,
    maxValue: 1,
    isIndeterminate: indeterminate,
  });
  const styles = circularProgressStyles({ wavy });
  const period = circularWavePeriod(
    circularWavyShapes(size, CIRCULAR_WAVELENGTH, strokes.active).vertices,
  );
  const offsetAt = (amp: number, now: number) =>
    wavy && amp > 0 && !reduceMotion ? (now % period) / period : 0;
  const determinate: CircularFrame = { rotation: 0, sweep: v };

  const ringRef = useRef<SVGGElement>(null);
  const waveRef = useRef<SVGGElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const activeRef = useRef<SVGPathElement>(null);
  useAnimationFrame((time) => {
    if (!indeterminate && !wavy && !handoff.active() && !drawnValue.active()) return;
    let frame = indeterminate ? determinate : { rotation: 0, sweep: drawnValue.read(time) };
    if (indeterminate) {
      frame = indeterminateCircular(time);
      handoff.record(frame);
    } else {
      const step = handoff.at(time);
      // Keep turning clockwise to the next 12 o'clock while the arc takes the value.
      if (step) {
        const target = step.from.rotation === 0 ? 0 : 360;
        frame = {
          rotation: mix(step.from.rotation, target, step.t),
          sweep: mix(step.from.sweep, v, step.t),
        };
      }
    }
    const amp = amplitude(time);
    const a = circularAttributes(wavy, size, strokes, frame, amp, offsetAt(amp, time));
    ringRef.current?.setAttribute('transform', a.ring);
    waveRef.current?.setAttribute('transform', a.wave);
    const trackEl = trackRef.current;
    trackEl?.setAttribute('d', a.trackD);
    trackEl?.setAttribute('stroke-dasharray', a.trackDash);
    trackEl?.setAttribute('stroke-dashoffset', String(a.trackOffset));
    const activeEl = activeRef.current;
    activeEl?.setAttribute('d', a.activeD);
    activeEl?.setAttribute('stroke-dasharray', a.activeDash);
    activeEl?.setAttribute('stroke-dashoffset', String(a.activeOffset));
    activeEl?.setAttribute('visibility', a.visible ? 'visible' : 'hidden');
  });

  // The first render is a deterministic frame (SSR-safe); animation frames take over.
  const initial = circularAttributes(
    wavy,
    size,
    strokes,
    indeterminate ? indeterminateCircular(0) : determinate,
    ampTarget,
    0,
  );
  return (
    <div
      {...mergeProps(rest, progressBarProps)}
      ref={ref}
      // The component tokens' hook (progress-tokens.ts).
      data-tokens="md-comp-progress-indicator"
      data-indeterminate={indeterminate || undefined}
      style={{ '--m3-progress-size': `${size}px`, ...style } as CSSProperties}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <svg viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className={styles.svg()}>
        <g ref={ringRef} transform={initial.ring}>
          {showTrack && (
            <path
              ref={trackRef}
              d={initial.trackD}
              pathLength={1}
              strokeWidth={strokes.track}
              strokeDasharray={initial.trackDash}
              strokeDashoffset={initial.trackOffset}
              data-slot="track"
              className={styles.track({ class: classNames?.track })}
            />
          )}
          <g ref={waveRef} transform={initial.wave || undefined}>
            <path
              ref={activeRef}
              d={initial.activeD}
              pathLength={wavy ? 2 : 1}
              strokeWidth={strokes.active}
              strokeDasharray={initial.activeDash}
              strokeDashoffset={initial.activeOffset}
              visibility={initial.visible ? 'visible' : 'hidden'}
              data-slot="indicator"
              className={styles.indicator({ class: classNames?.indicator })}
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
