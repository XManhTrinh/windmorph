/*
 * Port of androidx.graphics.shapes Cubic.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import {
  DistanceEpsilon,
  Point,
  convex,
  directionVector,
  distance,
  interpolate,
  type PointTransformer,
} from './point';

const inUnit = (t: number) => t >= 0 && t <= 1;

/**
 * A cubic Bézier curve: two anchor points and two control points, stored as
 * `[anchor0X, anchor0Y, control0X, control0Y, control1X, control1Y, anchor1X, anchor1Y]`.
 */
export class Cubic {
  readonly points: number[];

  constructor(points: readonly number[] = new Array(8).fill(0)) {
    if (points.length !== 8) throw new Error('Points array size should be 8');
    this.points = [...points];
  }

  static of(
    anchor0X: number,
    anchor0Y: number,
    control0X: number,
    control0Y: number,
    control1X: number,
    control1Y: number,
    anchor1X: number,
    anchor1Y: number,
  ): Cubic {
    return new Cubic([
      anchor0X,
      anchor0Y,
      control0X,
      control0Y,
      control1X,
      control1Y,
      anchor1X,
      anchor1Y,
    ]);
  }

  static fromPoints(anchor0: Point, control0: Point, control1: Point, anchor1: Point): Cubic {
    return Cubic.of(
      anchor0.x,
      anchor0.y,
      control0.x,
      control0.y,
      control1.x,
      control1.y,
      anchor1.x,
      anchor1.y,
    );
  }

  get anchor0X() {
    return this.points[0]!;
  }
  get anchor0Y() {
    return this.points[1]!;
  }
  get control0X() {
    return this.points[2]!;
  }
  get control0Y() {
    return this.points[3]!;
  }
  get control1X() {
    return this.points[4]!;
  }
  get control1Y() {
    return this.points[5]!;
  }
  get anchor1X() {
    return this.points[6]!;
  }
  get anchor1Y() {
    return this.points[7]!;
  }

  /** The point on the curve at parameter `t` (0..1). */
  pointOnCurve(t: number): Point {
    const u = 1 - t;
    return new Point(
      this.anchor0X * (u * u * u) +
        this.control0X * (3 * t * u * u) +
        this.control1X * (3 * t * t * u) +
        this.anchor1X * (t * t * t),
      this.anchor0Y * (u * u * u) +
        this.control0Y * (3 * t * u * u) +
        this.control1Y * (3 * t * t * u) +
        this.anchor1Y * (t * t * t),
    );
  }

  zeroLength(): boolean {
    return (
      Math.abs(this.anchor0X - this.anchor1X) < DistanceEpsilon &&
      Math.abs(this.anchor0Y - this.anchor1Y) < DistanceEpsilon
    );
  }

  convexTo(next: Cubic): boolean {
    return convex(
      new Point(this.anchor0X, this.anchor0Y),
      new Point(this.anchor1X, this.anchor1Y),
      new Point(next.anchor1X, next.anchor1Y),
    );
  }

  /**
   * Bounds as `[minX, minY, maxX, maxY]`. `approximate` uses the hull of anchors and controls,
   * which is cheaper and never smaller than the true bounds.
   */
  calculateBounds(bounds: number[] = new Array(4).fill(0), approximate = false): number[] {
    // A curve might be of zero-length, with both anchors co-located: return the point itself.
    if (this.zeroLength()) {
      bounds[0] = this.anchor0X;
      bounds[1] = this.anchor0Y;
      bounds[2] = this.anchor0X;
      bounds[3] = this.anchor0Y;
      return bounds;
    }
    let minX = Math.min(this.anchor0X, this.anchor1X);
    let minY = Math.min(this.anchor0Y, this.anchor1Y);
    let maxX = Math.max(this.anchor0X, this.anchor1X);
    let maxY = Math.max(this.anchor0Y, this.anchor1Y);
    if (approximate) {
      bounds[0] = Math.min(minX, Math.min(this.control0X, this.control1X));
      bounds[1] = Math.min(minY, Math.min(this.control0Y, this.control1Y));
      bounds[2] = Math.max(maxX, Math.max(this.control0X, this.control1X));
      bounds[3] = Math.max(maxY, Math.max(this.control0Y, this.control1Y));
      return bounds;
    }

    // The derivative is a quadratic Bézier; solve for t with the quadratic formula.
    const extremaTs = (p0: number, c0: number, c1: number, p1: number): number[] => {
      const a = -p0 + 3 * c0 - 3 * c1 + p1;
      const b = 2 * p0 - 4 * c0 + 2 * c1;
      const c = -p0 + c0;
      if (Math.abs(a) < DistanceEpsilon) {
        // A single root when a is 0.
        if (b !== 0) {
          const t = (2 * c) / (-2 * b);
          return inUnit(t) ? [t] : [];
        }
        return [];
      }
      const s = b * b - 4 * a * c;
      if (s < 0) return [];
      return [(-b + Math.sqrt(s)) / (2 * a), (-b - Math.sqrt(s)) / (2 * a)].filter(inUnit);
    };

    for (const t of extremaTs(this.anchor0X, this.control0X, this.control1X, this.anchor1X)) {
      const x = this.pointOnCurve(t).x;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    for (const t of extremaTs(this.anchor0Y, this.control0Y, this.control1Y, this.anchor1Y)) {
      const y = this.pointOnCurve(t).y;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  /** Splits the curve at `t` into two curves. */
  split(t: number): [Cubic, Cubic] {
    const u = 1 - t;
    const p = this.pointOnCurve(t);
    return [
      Cubic.of(
        this.anchor0X,
        this.anchor0Y,
        this.anchor0X * u + this.control0X * t,
        this.anchor0Y * u + this.control0Y * t,
        this.anchor0X * (u * u) + this.control0X * (2 * u * t) + this.control1X * (t * t),
        this.anchor0Y * (u * u) + this.control0Y * (2 * u * t) + this.control1Y * (t * t),
        p.x,
        p.y,
      ),
      Cubic.of(
        p.x,
        p.y,
        this.control0X * (u * u) + this.control1X * (2 * u * t) + this.anchor1X * (t * t),
        this.control0Y * (u * u) + this.control1Y * (2 * u * t) + this.anchor1Y * (t * t),
        this.control1X * u + this.anchor1X * t,
        this.control1Y * u + this.anchor1Y * t,
        this.anchor1X,
        this.anchor1Y,
      ),
    ];
  }

  /** The same curve drawn in the opposite direction. */
  reverse(): Cubic {
    return Cubic.of(
      this.anchor1X,
      this.anchor1Y,
      this.control1X,
      this.control1Y,
      this.control0X,
      this.control0Y,
      this.anchor0X,
      this.anchor0Y,
    );
  }

  plus(o: Cubic): Cubic {
    return new Cubic(this.points.map((v, i) => v + o.points[i]!));
  }

  times(x: number): Cubic {
    return new Cubic(this.points.map((v) => v * x));
  }

  div(x: number): Cubic {
    return this.times(1 / x);
  }

  equals(other: Cubic): boolean {
    return this.points.every((v, i) => v === other.points[i]);
  }

  transformed(f: PointTransformer): Cubic {
    const points = [...this.points];
    for (let i = 0; i < 8; i += 2) {
      const [x, y] = f(points[i]!, points[i + 1]!);
      points[i] = x;
      points[i + 1] = y;
    }
    return new Cubic(points);
  }

  toString(): string {
    return `anchor0: (${this.anchor0X}, ${this.anchor0Y}) control0: (${this.control0X}, ${this.control0Y}), control1: (${this.control1X}, ${this.control1Y}), anchor1: (${this.anchor1X}, ${this.anchor1Y})`;
  }

  /** A straight line, as a cubic with controls one and two thirds along it. */
  static straightLine(x0: number, y0: number, x1: number, y1: number): Cubic {
    return Cubic.of(
      x0,
      y0,
      interpolate(x0, x1, 1 / 3),
      interpolate(y0, y1, 1 / 3),
      interpolate(x0, x1, 2 / 3),
      interpolate(y0, y1, 2 / 3),
      x1,
      y1,
    );
  }

  /** A circular arc of up to 180° around (centerX, centerY) from (x0, y0) to (x1, y1). */
  static circularArc(
    centerX: number,
    centerY: number,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
  ): Cubic {
    const p0d = directionVector(x0 - centerX, y0 - centerY);
    const p1d = directionVector(x1 - centerX, y1 - centerY);
    const rotatedP0 = p0d.rotate90();
    const rotatedP1 = p1d.rotate90();
    const clockwise = rotatedP0.dotProductXY(x1 - centerX, y1 - centerY) >= 0;
    const cosa = p0d.dotProduct(p1d);
    if (cosa > 0.999) return Cubic.straightLine(x0, y0, x1, y1); // p0 ~= p1
    const k =
      ((((distance(x0 - centerX, y0 - centerY) * 4) / 3) *
        (Math.sqrt(2 * (1 - cosa)) - Math.sqrt(1 - cosa * cosa))) /
        (1 - cosa)) *
      (clockwise ? 1 : -1);
    return Cubic.of(
      x0,
      y0,
      x0 + rotatedP0.x * k,
      y0 + rotatedP0.y * k,
      x1 - rotatedP1.x * k,
      y1 - rotatedP1.y * k,
      x1,
      y1,
    );
  }

  /** A zero-length cubic at (x0, y0). */
  static empty(x0: number, y0: number): Cubic {
    return Cubic.of(x0, y0, x0, y0, x0, y0, x0, y0);
  }
}

/** A cubic whose points can be rewritten in place (used per animation frame by Morph). */
export class MutableCubic extends Cubic {
  transform(f: PointTransformer): void {
    for (let i = 0; i < 8; i += 2) {
      const [x, y] = f(this.points[i]!, this.points[i + 1]!);
      this.points[i] = x;
      this.points[i + 1] = y;
    }
  }

  interpolate(c1: Cubic, c2: Cubic, progress: number): void {
    for (let i = 0; i < 8; i++) {
      this.points[i] = interpolate(c1.points[i]!, c2.points[i]!, progress);
    }
  }
}
