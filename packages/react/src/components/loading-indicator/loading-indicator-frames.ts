import { getMorph, type MorphShape } from '../../primitives/use-m3-morph';
import { MaterialShapes, type MaterialShapeName } from '../../shapes/material-shapes';
import type { Morph } from '../../shapes/morph';
import { cubicsToPath } from '../../shapes/path';
import type { RoundedPolygon } from '../../shapes/rounded-polygon';

/*
 * Geometry and timing of Compose's LoadingIndicator.kt (LoadingIndicatorTokens: 48px
 * container, 38px active indicator). Kept as pure functions so frames can be tested.
 */

export const CONTAINER_SIZE = 48;
const ACTIVE_SIZE = 38;
const CENTER = CONTAINER_SIZE / 2;

export const GLOBAL_ROTATION_MS = 4666;
export const MORPH_INTERVAL_MS = 650;
const QUARTER_ROTATION = 90;

/** Compose `LoadingIndicatorDefaults.IndeterminateIndicatorPolygons`. */
export const INDETERMINATE_SHAPES: readonly MaterialShapeName[] = [
  'SoftBurst',
  'Cookie9Sided',
  'Pentagon',
  'Pill',
  'Sunny',
  'Cookie4Sided',
  'Oval',
];

let determinateShapes: readonly RoundedPolygon[] | undefined;

/**
 * Compose `DeterminateIndicatorPolygons`: a circle rotated by 18° (so it morphs smoothly
 * into the soft burst, rotated the same way), then the soft burst.
 */
export function getDeterminateShapes(): readonly RoundedPolygon[] {
  if (!determinateShapes) {
    const a = (18 * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const circle = MaterialShapes.Circle.transformed((x, y) => [x * c - y * s, x * s + y * c]);
    determinateShapes = [circle, MaterialShapes.SoftBurst];
  }
  return determinateShapes;
}

/*
 * The indeterminate morph spring: dampingRatio 0.6, stiffness 200, visibilityThreshold 0.1.
 * Compose ends a spring at its estimated duration (SpringEstimation.kt: the time the
 * oscillation envelope falls to the threshold, truncated to whole milliseconds), ~297ms.
 */
const DAMPING_RATIO = 0.6;
const STIFFNESS = 200;
const VISIBILITY_THRESHOLD = 0.1;
const OMEGA = Math.sqrt(STIFFNESS);
const DECAY = DAMPING_RATIO * OMEGA;
const OMEGA_D = OMEGA * Math.sqrt(1 - DAMPING_RATIO * DAMPING_RATIO);
const ENVELOPE = Math.hypot(1, DECAY / OMEGA_D);

export const MORPH_DURATION_MS = Math.trunc(
  (1000 * Math.log(VISIBILITY_THRESHOLD / ENVELOPE)) / -DECAY,
);

/** The morph spring's value `ms` after starting from 0 towards 1 at rest. */
export function morphSpring(ms: number): number {
  const t = ms / 1000;
  return (
    1 - Math.exp(-DECAY * t) * (Math.cos(OMEGA_D * t) + (DECAY / OMEGA_D) * Math.sin(OMEGA_D * t))
  );
}

export interface Frame {
  /** Index of the active morph. */
  index: number;
  /** Progress of the active morph; the indeterminate spring overshoots past 1. */
  progress: number;
  /** Clockwise rotation in degrees. */
  rotation: number;
}

/**
 * Compose's indeterminate loop at `elapsedMs`. Every 650ms a morph springs to the next shape;
 * when it finishes, the next morph starts at 0 and the target angle gains a quarter turn
 * (starting from a quarter turn). The shape turns by `progress × 90°` plus that angle plus a
 * linear full turn every 4666ms.
 */
export function indeterminateFrame(elapsedMs: number, morphCount: number): Frame {
  const cycle = Math.floor(elapsedMs / MORPH_INTERVAL_MS);
  const local = elapsedMs - cycle * MORPH_INTERVAL_MS;
  const finished = local >= MORPH_DURATION_MS;
  const index = (cycle + (finished ? 1 : 0)) % morphCount;
  const progress = finished ? 0 : morphSpring(local);
  const target = (QUARTER_ROTATION * (cycle + (finished ? 2 : 1))) % 360;
  const global = ((elapsedMs % GLOBAL_ROTATION_MS) / GLOBAL_ROTATION_MS) * 360;
  return { index, progress, rotation: (progress * QUARTER_ROTATION + target + global) % 360 };
}

/**
 * Reduced motion: the first shape turns at the global rate, without morphing or the
 * springy quarter turns.
 */
export function reducedMotionFrame(elapsedMs: number): Frame {
  return {
    index: 0,
    progress: 0,
    rotation: ((elapsedMs % GLOBAL_ROTATION_MS) / GLOBAL_ROTATION_MS) * 360,
  };
}

/**
 * Compose's determinate drawing: `value` (0–1) walks the morph sequence and turns the shape
 * counter-clockwise by up to 180°.
 */
export function determinateFrame(value: number, morphCount: number): Frame {
  const v = Number.isNaN(value) ? 0 : Math.min(Math.max(value, 0), 1);
  const index = Math.min(Math.floor(morphCount * v), morphCount - 1);
  const progress = v === 1 && index === morphCount - 1 ? 1 : (v * morphCount) % 1;
  return { index, progress, rotation: -v * 180 };
}

export interface PreparedShapes {
  morphs: readonly Morph[];
  /** Path scale: the container size × Compose's scale factor. */
  scale: number;
}

const resolve = (shape: MorphShape) => (typeof shape === 'string' ? MaterialShapes[shape] : shape);
const normalizedCache = new WeakMap<RoundedPolygon, RoundedPolygon>();

function normalized(polygon: RoundedPolygon): RoundedPolygon {
  let result = normalizedCache.get(polygon);
  if (!result) normalizedCache.set(polygon, (result = polygon.normalized()));
  return result;
}

/**
 * Compose `calculateScaleFactor`: shrinks the shapes so none clips as it rotates (a pill
 * counts by its longer side), times the 38/48 active-indicator scale.
 */
export function scaleFactor(polygons: readonly RoundedPolygon[]): number {
  let factor = 1;
  for (const polygon of polygons) {
    const [l, t, r, b] = polygon.calculateBounds();
    const [ml, mt, mr, mb] = polygon.calculateMaxBounds();
    factor = Math.min(factor, Math.max((r! - l!) / (mr! - ml!), (b! - t!) / (mb! - mt!)));
  }
  return (factor * ACTIVE_SIZE) / CONTAINER_SIZE;
}

/** The morph sequence (wrapping back to the start when `circular`) and the path scale. */
export function prepareShapes(shapes: readonly MorphShape[], circular: boolean): PreparedShapes {
  if (shapes.length < 2) throw new Error('LoadingIndicator needs at least two shapes');
  const polygons = shapes.map(resolve);
  const unit = polygons.map(normalized);
  const morphs: Morph[] = [];
  for (let i = 0; i < unit.length; i++) {
    if (i + 1 < unit.length) morphs.push(getMorph(unit[i]!, unit[i + 1]!));
    else if (circular) morphs.push(getMorph(unit[i]!, unit[0]!));
  }
  return { morphs, scale: CONTAINER_SIZE * scaleFactor(polygons) };
}

/**
 * Compose `processPath`: the morph frame scaled and centred in the 48px box by its
 * control-point bounds (what Compose's `Path.getBounds()` measures).
 */
export function framePath({ morphs, scale }: PreparedShapes, frame: Frame): string {
  const cubics = morphs[frame.index]!.asCubics(frame.progress);
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { points } of cubics) {
    for (let i = 0; i < 8; i += 2) {
      minX = Math.min(minX, points[i]!);
      maxX = Math.max(maxX, points[i]!);
      minY = Math.min(minY, points[i + 1]!);
      maxY = Math.max(maxY, points[i + 1]!);
    }
  }
  return cubicsToPath(cubics, {
    scale,
    translateX: CENTER - ((minX + maxX) / 2) * scale,
    translateY: CENTER - ((minY + maxY) / 2) * scale,
  });
}

/** SVG rotation about the box centre. */
export const frameTransform = ({ rotation }: Frame) =>
  `rotate(${Math.round(rotation * 100) / 100} ${CENTER} ${CENTER})`;
