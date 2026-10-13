/*
 * Port of androidx.graphics.shapes PolygonMeasure.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import type { Cubic } from './cubic';
import { Corner, type Feature } from './features';
import { DistanceEpsilon, Point, positiveModulo } from './point';
import type { RoundedPolygon } from './rounded-polygon';

/** A feature together with its progress along the polygon outline. */
export interface ProgressableFeature {
  readonly progress: number;
  readonly feature: Feature;
}

export interface Measurer {
  /** A non-negative measure of the cubic, e.g. its length. */
  measureCubic(c: Cubic): number;
  /** The `t` at which the cubic's measure from its start reaches `m`. */
  findCubicCutPoint(c: Cubic, m: number): number;
}

/** Approximates arc length with a 3-segment polyline (≥ 98.5% of the true length). */
export class LengthMeasurer implements Measurer {
  private readonly segments = 3;

  measureCubic(c: Cubic): number {
    return this.closestProgressTo(c, Infinity)[1];
  }

  findCubicCutPoint(c: Cubic, m: number): number {
    return this.closestProgressTo(c, m)[0];
  }

  private closestProgressTo(cubic: Cubic, threshold: number): [number, number] {
    let total = 0;
    let remainder = threshold;
    let prev = new Point(cubic.anchor0X, cubic.anchor0Y);
    for (let i = 1; i <= this.segments; i++) {
      const progress = i / this.segments;
      const point = cubic.pointOnCurve(progress);
      const segment = point.minus(prev).getDistance();
      if (segment >= remainder) {
        return [progress - (1 - remainder / segment) / this.segments, threshold];
      }
      remainder -= segment;
      total += segment;
      prev = point;
    }
    return [1, total];
  }
}

/** A cubic with its `[start, end]` progress range along the polygon outline. */
export class MeasuredCubic {
  readonly measuredSize: number;

  constructor(
    private readonly measurer: Measurer,
    readonly cubic: Cubic,
    private start: number,
    private end: number,
  ) {
    if (!(end >= start)) {
      throw new Error(
        'endOutlineProgress is expected to be equal or greater than startOutlineProgress',
      );
    }
    this.measuredSize = measurer.measureCubic(cubic);
  }

  get startOutlineProgress(): number {
    return this.start;
  }

  get endOutlineProgress(): number {
    return this.end;
  }

  updateProgressRange(start = this.start, end = this.end): void {
    if (!(end >= start)) {
      throw new Error(
        'endOutlineProgress is expected to be equal or greater than startOutlineProgress',
      );
    }
    this.start = start;
    this.end = end;
  }

  cutAtProgress(cutOutlineProgress: number): [MeasuredCubic, MeasuredCubic] {
    // Float error upstream can land the cut just outside this cubic; clamp it.
    const bounded = Math.min(Math.max(cutOutlineProgress, this.start), this.end);
    const relativeProgress = (bounded - this.start) / (this.end - this.start);
    const t = this.measurer.findCubicCutPoint(this.cubic, relativeProgress * this.measuredSize);
    if (!(t >= 0 && t <= 1)) throw new Error('Cubic cut point is expected to be between 0 and 1');
    const [c1, c2] = this.cubic.split(t);
    return [
      new MeasuredCubic(this.measurer, c1, this.start, bounded),
      new MeasuredCubic(this.measurer, c2, bounded, this.end),
    ];
  }

  toString(): string {
    return `MeasuredCubic(outlineProgress=[${this.start} .. ${this.end}], size=${this.measuredSize}, cubic=${this.cubic})`;
  }
}

/** A polygon's cubics, measured and mapped to outline progress in `[0, 1]`. */
export class MeasuredPolygon {
  private readonly cubics: readonly MeasuredCubic[];

  private constructor(
    private readonly measurer: Measurer,
    readonly features: readonly ProgressableFeature[],
    cubics: readonly Cubic[],
    outlineProgress: readonly number[],
  ) {
    if (outlineProgress.length !== cubics.length + 1) {
      throw new Error('Outline progress size is expected to be the cubics size + 1');
    }
    if (outlineProgress[0] !== 0) {
      throw new Error('First outline progress value is expected to be zero');
    }
    if (outlineProgress[outlineProgress.length - 1] !== 1) {
      throw new Error('Last outline progress value is expected to be one');
    }
    const measured: MeasuredCubic[] = [];
    let startOutlineProgress = 0;
    for (let i = 0; i < cubics.length; i++) {
      // Filter out "empty" cubics.
      if (outlineProgress[i + 1]! - outlineProgress[i]! > DistanceEpsilon) {
        measured.push(
          new MeasuredCubic(measurer, cubics[i]!, startOutlineProgress, outlineProgress[i + 1]!),
        );
        startOutlineProgress = outlineProgress[i + 1]!;
      }
    }
    // Empty cubics may have been dropped at the end; the last one must still end at 1.
    measured[measured.length - 1]!.updateProgressRange(undefined, 1);
    this.cubics = measured;
  }

  get size(): number {
    return this.cubics.length;
  }

  get(index: number): MeasuredCubic | undefined {
    return this.cubics[index];
  }

  /** Cuts the outline at `cuttingPoint` and shifts it so that point becomes progress 0. */
  cutAndShift(cuttingPoint: number): MeasuredPolygon {
    if (!(cuttingPoint >= 0 && cuttingPoint <= 1)) {
      throw new Error('Cutting point is expected to be between 0 and 1');
    }
    if (cuttingPoint < DistanceEpsilon) return this;
    const n = this.cubics.length;
    const targetIndex = this.cubics.findIndex(
      (c) => cuttingPoint >= c.startOutlineProgress && cuttingPoint <= c.endOutlineProgress,
    );
    const [b1, b2] = this.cubics[targetIndex]!.cutAtProgress(cuttingPoint);

    // The tail of the cut cubic, every other cubic in order, then the head of the cut cubic.
    const retCubics = [b2.cubic];
    for (let i = 1; i < n; i++) retCubics.push(this.cubics[(i + targetIndex) % n]!.cubic);
    retCubics.push(b1.cubic);

    const retOutlineProgress: number[] = [0];
    for (let index = 1; index <= n; index++) {
      const cubicIndex = (targetIndex + index - 1) % n;
      retOutlineProgress.push(
        positiveModulo(this.cubics[cubicIndex]!.endOutlineProgress - cuttingPoint, 1),
      );
    }
    retOutlineProgress.push(1);

    const newFeatures = this.features.map((f) => ({
      progress: positiveModulo(f.progress - cuttingPoint, 1),
      feature: f.feature,
    }));
    return new MeasuredPolygon(this.measurer, newFeatures, retCubics, retOutlineProgress);
  }

  static measurePolygon(measurer: Measurer, polygon: RoundedPolygon): MeasuredPolygon {
    const cubics: Cubic[] = [];
    const featureToCubic: [Feature, number][] = [];
    // Collect the cubics; each corner is represented by its middle cubic.
    for (const feature of polygon.features) {
      feature.cubics.forEach((cubic, cubicIndex) => {
        if (feature instanceof Corner && cubicIndex === Math.floor(feature.cubics.length / 2)) {
          featureToCubic.push([feature, cubics.length]);
        }
        cubics.push(cubic);
      });
    }

    const measures = [0];
    for (const cubic of cubics) {
      const size = measurer.measureCubic(cubic);
      if (!(size >= 0))
        throw new Error('Measured cubic is expected to be greater or equal to zero');
      measures.push(measures[measures.length - 1]! + size);
    }
    const totalMeasure = measures[measures.length - 1]!;
    const outlineProgress = measures.map((m) => m / totalMeasure);

    const features = featureToCubic.map(([feature, ix]) => ({
      progress: positiveModulo((outlineProgress[ix]! + outlineProgress[ix + 1]!) / 2, 1),
      feature,
    }));
    return new MeasuredPolygon(measurer, features, cubics, outlineProgress);
  }
}
