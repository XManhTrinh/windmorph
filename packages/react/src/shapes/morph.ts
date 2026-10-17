/*
 * Port of androidx.graphics.shapes Morph.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import { Cubic, MutableCubic } from './cubic';
import { featureMapper } from './feature-mapping';
import { AngleEpsilon, interpolate, positiveModulo } from './point';
import { LengthMeasurer, MeasuredPolygon } from './polygon-measure';
import type { RoundedPolygon } from './rounded-polygon';

/**
 * Animates between two polygons. The outlines are matched corner to corner, and each matched
 * pair of cubics is interpolated by `progress` (0 = `start`, 1 = `end`).
 */
export class Morph {
  /** Matched start/end cubic pairs. */
  readonly morphMatch: readonly (readonly [Cubic, Cubic])[];

  constructor(
    private readonly start: RoundedPolygon,
    private readonly end: RoundedPolygon,
  ) {
    this.morphMatch = Morph.match(start, end);
  }

  /** The bounds containing both shapes (and so every in-between shape). */
  calculateBounds(bounds: number[] = new Array(4).fill(0), approximate = true): number[] {
    this.start.calculateBounds(bounds, approximate);
    const [minX, minY, maxX, maxY] = bounds as [number, number, number, number];
    this.end.calculateBounds(bounds, approximate);
    return unionBounds(bounds, minX, minY, maxX, maxY);
  }

  /** Bounds that contain both shapes at any rotation about their centers. */
  calculateMaxBounds(bounds: number[] = new Array(4).fill(0)): number[] {
    this.start.calculateMaxBounds(bounds);
    const [minX, minY, maxX, maxY] = bounds as [number, number, number, number];
    this.end.calculateMaxBounds(bounds);
    return unionBounds(bounds, minX, minY, maxX, maxY);
  }

  /** The in-between shape's cubics. The last anchor is snapped onto the first to close it. */
  asCubics(progress: number): Cubic[] {
    const result: Cubic[] = [];
    let firstCubic: Cubic | undefined;
    let lastCubic: Cubic | undefined;
    for (const [a, b] of this.morphMatch) {
      const cubic = new Cubic(a.points.map((p, i) => interpolate(p, b.points[i]!, progress)));
      firstCubic ??= cubic;
      if (lastCubic) result.push(lastCubic);
      lastCubic = cubic;
    }
    if (lastCubic && firstCubic) {
      result.push(
        Cubic.of(
          lastCubic.anchor0X,
          lastCubic.anchor0Y,
          lastCubic.control0X,
          lastCubic.control0Y,
          lastCubic.control1X,
          lastCubic.control1Y,
          firstCubic.anchor0X,
          firstCubic.anchor0Y,
        ),
      );
    }
    return result;
  }

  /** Allocation-free iteration: `mutableCubic` is rewritten for every matched pair. */
  forEachCubic(
    progress: number,
    callback: (cubic: MutableCubic) => void,
    mutableCubic: MutableCubic = new MutableCubic(),
  ): void {
    for (const [a, b] of this.morphMatch) {
      mutableCubic.interpolate(a, b, progress);
      callback(mutableCubic);
    }
  }

  static match(p1: RoundedPolygon, p2: RoundedPolygon): [Cubic, Cubic][] {
    const measuredPolygon1 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p1);
    const measuredPolygon2 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p2);

    // Maps progress on either shape to the matching progress on the other.
    const doubleMapper = featureMapper(measuredPolygon1.features, measuredPolygon2.features);

    // Cut the second outline where progress 0 of the first one maps to, and rotate it so both
    // outlines start together.
    const polygon2CutPoint = doubleMapper.map(0);
    const bs1 = measuredPolygon1;
    const bs2 = measuredPolygon2.cutAndShift(polygon2CutPoint);

    const ret: [Cubic, Cubic][] = [];
    let i1 = 0;
    let i2 = 0;
    let b1 = bs1.get(i1++);
    let b2 = bs2.get(i2++);
    while (b1 && b2) {
      // Ending progress of each current cubic, from shape 1's perspective.
      const b1a = i1 === bs1.size ? 1 : b1.endOutlineProgress;
      const b2a =
        i2 === bs2.size
          ? 1
          : doubleMapper.mapBack(positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1));
      const minb = Math.min(b1a, b2a);
      // Whichever cubic extends past the one that ends first is cut there.
      let seg1;
      let newb1;
      if (b1a > minb + AngleEpsilon) [seg1, newb1] = b1.cutAtProgress(minb);
      else [seg1, newb1] = [b1, bs1.get(i1++)];
      let seg2;
      let newb2;
      if (b2a > minb + AngleEpsilon) {
        [seg2, newb2] = b2.cutAtProgress(
          positiveModulo(doubleMapper.map(minb) - polygon2CutPoint, 1),
        );
      } else {
        [seg2, newb2] = [b2, bs2.get(i2++)];
      }
      ret.push([seg1.cubic, seg2.cubic]);
      b1 = newb1;
      b2 = newb2;
    }
    if (b1 || b2) throw new Error("Expected both Polygon's Cubic to be fully matched");
    return ret;
  }
}

function unionBounds(
  bounds: number[],
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): number[] {
  bounds[0] = Math.min(minX, bounds[0]!);
  bounds[1] = Math.min(minY, bounds[1]!);
  bounds[2] = Math.max(maxX, bounds[2]!);
  bounds[3] = Math.max(maxY, bounds[3]!);
  return bounds;
}
