/*
 * Port of androidx.graphics.shapes FloatMapping.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import { DistanceEpsilon, positiveModulo } from './point';

/** Whether `progress` lies in `[from, to]`, where the range may wrap around 1. */
export function progressInRange(progress: number, from: number, to: number): boolean {
  return to >= from ? progress >= from && progress <= to : progress >= from || progress <= to;
}

/** Maps `x` through the piecewise-linear, wrapping function given by the two value lists. */
export function linearMap(
  xValues: readonly number[],
  yValues: readonly number[],
  x: number,
): number {
  if (!(x >= 0 && x <= 1)) throw new Error(`Invalid progress: ${x}`);
  const n = xValues.length;
  const segmentStartIndex = xValues.findIndex((_, i) =>
    progressInRange(x, xValues[i]!, xValues[(i + 1) % n]!),
  );
  const segmentEndIndex = (segmentStartIndex + 1) % n;
  const segmentSizeX = positiveModulo(xValues[segmentEndIndex]! - xValues[segmentStartIndex]!, 1);
  const segmentSizeY = positiveModulo(yValues[segmentEndIndex]! - yValues[segmentStartIndex]!, 1);
  const positionInSegment =
    segmentSizeX < 0.001 ? 0.5 : positiveModulo(x - xValues[segmentStartIndex]!, 1) / segmentSizeX;
  return positiveModulo(yValues[segmentStartIndex]! + segmentSizeY * positionInSegment, 1);
}

/**
 * A bidirectional mapping between two progress spaces, both `[0, 1)` and wrapping. Each
 * mapping pair anchors one source progress to one target progress.
 */
export class DoubleMapper {
  static readonly Identity = new DoubleMapper([0, 0], [0.5, 0.5]);

  private readonly sourceValues: number[];
  private readonly targetValues: number[];

  constructor(...mappings: readonly (readonly [number, number])[]) {
    this.sourceValues = mappings.map(([source]) => source);
    this.targetValues = mappings.map(([, target]) => target);
    // Both lists must increase monotonically, except for at most one wrap-around.
    validateProgress(this.sourceValues);
    validateProgress(this.targetValues);
  }

  map(x: number): number {
    return linearMap(this.sourceValues, this.targetValues, x);
  }

  mapBack(x: number): number {
    return linearMap(this.targetValues, this.sourceValues, x);
  }
}

/**
 * Checks that every progress value is in `[0, 1)` and that the list (including the last to
 * first pair) increases monotonically, wrapping at most once. `(0.3, 0.6, 0)` is valid;
 * `(0.5, 0, 0.7)` is not.
 */
export function validateProgress(p: readonly number[]): void {
  let prev = p[p.length - 1]!;
  let wraps = 0;
  for (const curr of p) {
    if (!(curr >= 0 && curr < 1)) {
      throw new Error(`FloatMapping - Progress outside of range: ${p.join(', ')}`);
    }
    if (!(progressDistance(curr, prev) > DistanceEpsilon)) {
      throw new Error(`FloatMapping - Progress repeats a value: ${p.join(', ')}`);
    }
    if (curr < prev) {
      wraps++;
      if (wraps > 1) {
        throw new Error(`FloatMapping - Progress wraps more than once: ${p.join(', ')}`);
      }
    }
    prev = curr;
  }
}

/** Distance between two wrapping progress values: 0.99 and 0 are 0.01 apart. */
export function progressDistance(p1: number, p2: number): number {
  const d = Math.abs(p1 - p2);
  return Math.min(d, 1 - d);
}
