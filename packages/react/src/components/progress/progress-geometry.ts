import { getMorph } from '../../primitives/use-m3-morph';
import { CornerRounding } from '../../shapes/corner-rounding';
import { cubicsToPath, polygonToPath } from '../../shapes/path';
import type { RoundedPolygon } from '../../shapes/rounded-polygon';
import { circle, star } from '../../shapes/shapes';

/*
 * Geometry and timing of Compose's progress indicators (ProgressIndicator.kt,
 * WavyProgressIndicator.kt, Linear/CircularWavyProgressModifiers.kt and the
 * Linear/CircularProgressIndicator tokens), as pure functions of the inputs.
 */

export const STROKE = 4;
export const GAP = 4;
export const STOP = 4;
const CAP = STROKE / 2;

export const LINEAR_WIDTH = 240;
export const LINEAR_FLAT_HEIGHT = 4;
export const LINEAR_WAVE_HEIGHT = 10;
export const LINEAR_WAVELENGTH = 40;
export const LINEAR_INDETERMINATE_WAVELENGTH = 20;

export const CIRCULAR_FLAT_SIZE = 40;
export const CIRCULAR_WAVE_SIZE = 48;
export const CIRCULAR_WAVELENGTH = 15;
const MIN_CIRCULAR_VERTICES = 5;

/** The wave travels one wavelength per second (`waveSpeed = wavelength`). */
export const WAVE_PERIOD_MS = 1000;
/** Amplitude changes take `DurationLong2` (500ms). */
export const AMPLITUDE_DURATION_MS = 500;

/** CSS-style cubic-bézier easing, solved for x by Newton–Raphson with a bisection fallback. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bez = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const slope = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const d = slope(x1, x2, t);
      if (Math.abs(d) < 1e-6) break;
      t -= (bez(x1, x2, t) - x) / d;
    }
    if (t < 0 || t > 1 || Math.abs(bez(x1, x2, t) - x) > 1e-5) {
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 40; i++) {
        t = (lo + hi) / 2;
        if (bez(x1, x2, t) < x) lo = t;
        else hi = t;
      }
    }
    return bez(y1, y2, t);
  };
}

/** `EasingEmphasizedAccelerateCubicBezier`. */
export const emphasizedAccelerate = cubicBezier(0.3, 0, 0.8, 0.15);
/** `EasingStandardCubicBezier`. */
export const standard = cubicBezier(0.2, 0, 0, 1);

/** `WavyProgressIndicatorDefaults.indicatorAmplitude`: no wave below 10% or above 95%. */
export const amplitudeFor = (progress: number) => (progress <= 0.1 || progress >= 0.95 ? 0 : 1);

/**
 * Compose's indeterminate linear keyframes over a 1750ms cycle: each value eases from 0 to 1
 * (emphasized accelerate) between its delay and delay + duration, then holds at 1.
 * Returns [firstTail, firstHead, secondTail, secondHead] as fractions of the width.
 */
export function indeterminateLinearFractions(elapsedMs: number): number[] {
  const t = elapsedMs % 1750;
  const at = (delay: number, duration: number) =>
    emphasizedAccelerate(Math.min(Math.max((t - delay) / duration, 0), 1));
  return [at(250, 1000), at(0, 1000), at(900, 850), at(650, 850)];
}

const clampNum = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
const fmt = (n: number) => String(Math.round(n * 100) / 100);

/**
 * One wavy (or flat) stroke segment from x0 to x1. The wave is Compose's: quadratic
 * half-waves with their control point halfway along, peaking at (height − stroke) / 2,
 * scaled by `amplitude` about the centre line and shifted by `waveOffset` wavelengths.
 */
export function waveSegment(
  x0: number,
  x1: number,
  height: number,
  amplitude: number,
  wavelength: number,
  waveOffset: number,
): string {
  const mid = height / 2;
  if (amplitude === 0 || x1 <= x0) return `M${fmt(x0)} ${fmt(mid)}L${fmt(x1)} ${fmt(mid)}`;
  const shift = waveOffset * wavelength;
  const half = wavelength / 2;
  const peak = (height - STROKE) * amplitude;
  const wave = (u: number) => {
    const k = Math.floor(u / half);
    const t = (u - k * half) / half;
    const sign = k % 2 === 0 ? 1 : -1;
    return {
      y: mid + peak * 2 * t * (1 - t) * sign,
      slope: (peak * sign * 2 * (1 - 2 * t)) / half,
    };
  };
  let d = `M${fmt(x0)} ${fmt(wave(x0 + shift).y)}`;
  let u = x0 + shift;
  const end = x1 + shift;
  while (u < end - 1e-6) {
    const next = Math.min((Math.floor(u / half + 1e-9) + 1) * half, end);
    const { y, slope } = wave(u);
    // Each half-wave is a parabola, so its restriction to [u, next] is exactly this quadratic.
    const cx = (u + next) / 2 - shift;
    const cy = y + (slope * (next - u)) / 2;
    d += `Q${fmt(cx)} ${fmt(cy)} ${fmt(next - shift)} ${fmt(wave(next).y)}`;
    u = next;
  }
  return d;
}

export interface LinearPaths {
  active: string[];
  track: string;
}

/**
 * Compose `LinearProgressDrawingCache.updateDrawPaths`: the active segments (tail/head
 * pairs) and the track filling the gaps between them, inset for the round caps, with a 4px
 * gap that shrinks while the progress is still entering.
 */
export function linearPaths(
  width: number,
  height: number,
  fractions: readonly number[],
  amplitude: number,
  waveOffset: number,
  wavelength: number,
): LinearPaths {
  const mid = height / 2;
  const active: string[] = [];
  let track = '';
  let nextEnd = width - CAP;
  track += `M${fmt(nextEnd)} ${fmt(mid)}`;
  let gap = GAP;
  let activeVisible = false;
  for (let i = 0; i < fractions.length / 2; i++) {
    const start = fractions[i * 2]!;
    const end = fractions[i * 2 + 1]!;
    const tail = start * width;
    const head = end * width;
    if (i === 0) {
      gap = head < CAP ? 0 : Math.min(head - CAP, GAP);
      activeVisible = head >= CAP;
    }
    const adjHead = clampNum(head, CAP, width - CAP);
    const adjTail = clampNum(tail, CAP, width - CAP);
    if (Math.abs(end - start) > 0 && head >= CAP) {
      active.push(waveSegment(adjTail, adjHead, height, amplitude, wavelength, waveOffset));
    }
    const spacing = activeVisible ? gap + CAP * 2 : gap;
    if (nextEnd > adjHead + spacing) {
      track += `L${fmt(Math.max(CAP, adjHead + spacing))} ${fmt(mid)}`;
    }
    if (head > tail) {
      nextEnd = Math.max(CAP, adjTail - spacing);
      track += `M${fmt(nextEnd)} ${fmt(mid)}`;
    }
  }
  if (nextEnd > CAP) track += `L${fmt(CAP)} ${fmt(mid)}`;
  return { active, track };
}

/**
 * The stop indicator (Compose `drawStopIndicator`, wavy version): a 4px dot at the track's
 * end that shrinks once the progress reaches it.
 */
export function stopIndicator(width: number, height: number, progress: number) {
  let size = Math.min(STROKE, STOP);
  let x = width - size;
  const progressX = width * progress + CAP;
  if (x <= progressX) {
    size = Math.max(0, size - (progressX - x));
    x = progressX;
  }
  return size > 0 ? { cx: x + size / 2, cy: height / 2, r: size / 2 } : null;
}

/* --------------------------------------------------------------------- Circular */

/**
 * Flat circular indicator (Compose `CircularProgressIndicator`): the arc and the track as
 * fractions of a circle starting at 12 o'clock, the gap being (4px + stroke) of circumference.
 */
export function circularFlatArcs(progress: number, size = CIRCULAR_FLAT_SIZE) {
  const gap = (GAP + STROKE) / (Math.PI * size);
  const g = Math.min(progress, gap);
  return {
    active: progress,
    trackStart: progress + g,
    trackLength: Math.max(0, 1 - progress - 2 * g),
  };
}

/** A circle path from 12 o'clock, clockwise, for `pathLength="1"` dashes. */
export function circlePath(size: number) {
  const r = (size - STROKE) / 2;
  const c = size / 2;
  return `M${c} ${c - r}A${r} ${r} 0 1 1 ${c} ${c + r}A${r} ${r} 0 1 1 ${c} ${c - r}Z`;
}

const wavyShapes = new Map<number, { track: RoundedPolygon; active: RoundedPolygon }>();

/** Compose `CircularShapes`: a circle and a 0.75-inner-radius star with matched vertices. */
export function circularWavyShapes(size = CIRCULAR_WAVE_SIZE, wavelength = CIRCULAR_WAVELENGTH) {
  const r = size / 2 - STROKE / 2;
  const vertices = Math.max(MIN_CIRCULAR_VERTICES, Math.round((2 * Math.PI * r) / wavelength));
  let shapes = wavyShapes.get(vertices);
  if (!shapes) {
    shapes = {
      track: circle({ numVertices: vertices }).normalized(),
      active: star(vertices, {
        innerRadius: 0.75,
        rounding: new CornerRounding(0.35, 0.4),
        innerRounding: new CornerRounding(0.5),
      }).normalized(),
    };
    wavyShapes.set(vertices, shapes);
  }
  return { ...shapes, vertices };
}

/**
 * Paths for the wavy circular indicator, scaled to (size − stroke) and centred, starting at
 * 12 o'clock: the flat track circle and the active ring morphed from that circle towards
 * the star by `amplitude`.
 */
export function circularWavyPaths(amplitude: number, size = CIRCULAR_WAVE_SIZE) {
  const { track, active } = circularWavyShapes(size);
  const scale = size - STROKE;
  const offset = STROKE / 2;
  const place = { scale, translateX: offset, translateY: offset, startAngle: 270 };
  // The active ring is drawn twice (Compose's `repeatPath`), so a dash shifted along it by
  // the wave offset never runs off the end; give it `pathLength="2"`.
  const twice = { ...place, repeatPath: true, closePath: false };
  const activePolygon: RoundedPolygon | null =
    amplitude >= 1 ? active : amplitude <= 0 ? track : null;
  const activePath = activePolygon
    ? polygonToPath(activePolygon, twice)
    : cubicsToPath(getMorph(track, active).asCubics(amplitude), {
        ...twice,
        rotationPivotX: 0.5,
        rotationPivotY: 0.5,
      });
  return { track: polygonToPath(track, place), active: activePath };
}

/**
 * Track spacing for the wavy circle (Compose `updateDrawPaths`): the gap plus both caps,
 * shrinking while the progress is smaller, as fractions of the circumference.
 */
export function circularWavyTrack(progress: number, size = CIRCULAR_WAVE_SIZE) {
  const length = Math.PI * (size - STROKE);
  const stop = progress * length;
  const spacing = Math.min(stop, CAP) * 2 + Math.min(stop, GAP);
  const start = (stop + spacing) / length;
  const end = (length - spacing) / length;
  return { start, length: Math.max(0, end - start) };
}

/** One revolution of the circular wave takes a second per vertex (Compose). */
export const circularWavePeriod = (vertices: number) => WAVE_PERIOD_MS * vertices;
