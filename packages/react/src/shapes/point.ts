/*
 * Port of androidx.graphics.shapes Point.kt and Utils.kt (Apache-2.0, see LICENSE-androidx.md).
 */

/** An immutable 2D point or vector. */
export class Point {
  constructor(
    readonly x: number,
    readonly y: number,
  ) {}

  /** Distance from (0, 0). */
  getDistance(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  getDistanceSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  dotProduct(other: Point): number {
    return this.x * other.x + this.y * other.y;
  }

  dotProductXY(otherX: number, otherY: number): number {
    return this.x * otherX + this.y * otherY;
  }

  /** Whether `other` turns clockwise from this vector (z of the cross product > 0). */
  clockwise(other: Point): boolean {
    return this.x * other.y - this.y * other.x > 0;
  }

  /** Unit vector in this direction. */
  getDirection(): Point {
    const d = this.getDistance();
    if (!(d > 0)) throw new Error("Can't get the direction of a 0-length vector");
    return this.div(d);
  }

  negate(): Point {
    return new Point(-this.x, -this.y);
  }

  minus(other: Point): Point {
    return new Point(this.x - other.x, this.y - other.y);
  }

  plus(other: Point): Point {
    return new Point(this.x + other.x, this.y + other.y);
  }

  times(operand: number): Point {
    return new Point(this.x * operand, this.y * operand);
  }

  div(operand: number): Point {
    return new Point(this.x / operand, this.y / operand);
  }

  rem(operand: number): Point {
    return new Point(this.x % operand, this.y % operand);
  }

  rotate90(): Point {
    return new Point(-this.y, this.x);
  }

  transformed(f: PointTransformer): Point {
    const [x, y] = f(this.x, this.y);
    return new Point(x, y);
  }
}

/** Maps a point to a new point, e.g. to scale or rotate a shape. */
export type PointTransformer = (x: number, y: number) => readonly [number, number];

export const Zero = new Point(0, 0);

/*
 * These epsilon values are used internally to determine when two points are the same, within
 * some reasonable roundoff error. The distance epsilon is smaller, with the intention that the
 * roundoff should not be larger than a pixel on any reasonable sized display.
 */
export const DistanceEpsilon = 1e-4;
export const AngleEpsilon = 1e-6;
/**
 * People see e.g. collinearity much more relaxed than what is mathematically correct; use this
 * for operations that allow higher tolerances.
 */
export const RelaxedDistanceEpsilon = 5e-3;

export const FloatPi = Math.PI;
export const TwoPi = 2 * Math.PI;

export function distance(x: number, y: number): number {
  return Math.sqrt(x * x + y * y);
}

export function distanceSquared(x: number, y: number): number {
  return x * x + y * y;
}

/** Unit vector in the direction of (x, y). */
export function directionVector(x: number, y: number): Point {
  const d = distance(x, y);
  if (!(d > 0)) throw new Error('Required distance greater than zero');
  return new Point(x / d, y / d);
}

export function directionVectorFromAngle(angleRadians: number): Point {
  return new Point(Math.cos(angleRadians), Math.sin(angleRadians));
}

export function radialToCartesian(
  radius: number,
  angleRadians: number,
  center: Point = Zero,
): Point {
  return directionVectorFromAngle(angleRadians).times(radius).plus(center);
}

export function square(x: number): number {
  return x * x;
}

/** Linearly interpolates between `start` and `stop`. */
export function interpolate(start: number, stop: number, fraction: number): number {
  return (1 - fraction) * start + fraction * stop;
}

export function interpolatePoint(start: Point, stop: Point, fraction: number): Point {
  return new Point(interpolate(start.x, stop.x, fraction), interpolate(start.y, stop.y, fraction));
}

/** Like `num % mod`, but always positive: positiveModulo(-4, 3) = 2. */
export function positiveModulo(num: number, mod: number): number {
  return ((num % mod) + mod) % mod;
}

/** Whether C is on the line through A and B, within `tolerance`. */
export function collinearIsh(
  aX: number,
  aY: number,
  bX: number,
  bY: number,
  cX: number,
  cY: number,
  tolerance: number = DistanceEpsilon,
): boolean {
  // The dot product of a perpendicular angle is 0. By rotating one of the vectors,
  // we save the calculations to convert the dot product to degrees afterwards.
  const ab = new Point(bX - aX, bY - aY).rotate90();
  const ac = new Point(cX - aX, cY - aY);
  const dotProduct = Math.abs(ab.dotProduct(ac));
  const relativeTolerance = tolerance * ab.getDistance() * ac.getDistance();
  return dotProduct < tolerance || dotProduct < relativeTolerance;
}

/** Approximates whether the corner at `current` is convex. */
export function convex(previous: Point, current: Point, next: Point): boolean {
  // (androidx b/369320447: fast, but not reliable.)
  return current.minus(previous).clockwise(next.minus(current));
}

/** Ternary search for the minimum of `f` between `v0` and `v1`. */
export function findMinimum(
  v0: number,
  v1: number,
  tolerance: number,
  f: (value: number) => number,
): number {
  let a = v0;
  let b = v1;
  while (b - a > tolerance) {
    const c1 = (2 * a + b) / 3;
    const c2 = (2 * b + a) / 3;
    if (f(c1) < f(c2)) b = c2;
    else a = c1;
  }
  return (a + b) / 2;
}
