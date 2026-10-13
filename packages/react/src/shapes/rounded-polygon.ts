/*
 * Port of androidx.graphics.shapes RoundedPolygon.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import { CornerRounding } from './corner-rounding';
import { Cubic } from './cubic';
import { Corner, Edge, type Feature } from './features';
import {
  DistanceEpsilon,
  Point,
  convex,
  directionVector,
  distance,
  distanceSquared,
  interpolatePoint,
  radialToCartesian,
  square,
  type PointTransformer,
} from './point';

/**
 * A closed shape made of cubic Bézier curves, built from vertices with optional per-corner
 * rounding (or from features). Its `features` (corners and edges) drive morph matching.
 */
export class RoundedPolygon {
  readonly cubics: readonly Cubic[];

  constructor(
    readonly features: readonly Feature[],
    readonly center: Point,
  ) {
    this.cubics = buildCubics(features, center);
    let prev = this.cubics[this.cubics.length - 1]!;
    for (const cubic of this.cubics) {
      if (
        Math.abs(cubic.anchor0X - prev.anchor1X) > DistanceEpsilon ||
        Math.abs(cubic.anchor0Y - prev.anchor1Y) > DistanceEpsilon
      ) {
        throw new Error(
          'RoundedPolygon must be contiguous, with the anchor points of all curves matching the anchor points of the preceding and succeeding cubics',
        );
      }
      prev = cubic;
    }
  }

  get centerX(): number {
    return this.center.x;
  }

  get centerY(): number {
    return this.center.y;
  }

  /** A regular polygon with `numVertices` vertices on a circle of `radius`. */
  static fromNumVertices(
    numVertices: number,
    {
      radius = 1,
      centerX = 0,
      centerY = 0,
      rounding = CornerRounding.Unrounded,
      perVertexRounding,
    }: {
      radius?: number;
      centerX?: number;
      centerY?: number;
      rounding?: CornerRounding;
      perVertexRounding?: readonly CornerRounding[];
    } = {},
  ): RoundedPolygon {
    return RoundedPolygon.fromVertices(
      verticesFromNumVerts(numVertices, radius, centerX, centerY),
      {
        rounding,
        perVertexRounding,
        centerX,
        centerY,
      },
    );
  }

  /** A polygon through `vertices` (`[x0, y0, x1, y1, …]`), with optional corner rounding. */
  static fromVertices(
    vertices: readonly number[],
    {
      rounding = CornerRounding.Unrounded,
      perVertexRounding,
      centerX,
      centerY,
    }: {
      rounding?: CornerRounding;
      perVertexRounding?: readonly CornerRounding[];
      centerX?: number;
      centerY?: number;
    } = {},
  ): RoundedPolygon {
    if (vertices.length < 6) throw new Error('Polygons must have at least 3 vertices');
    if (vertices.length % 2 === 1) throw new Error('The vertices array should have even size');
    if (perVertexRounding && perVertexRounding.length * 2 !== vertices.length) {
      throw new Error(
        'perVertexRounding list should be either null or the same size as the number of vertices (vertices.size / 2)',
      );
    }
    const n = vertices.length / 2;
    const vertex = (i: number) => new Point(vertices[i * 2]!, vertices[i * 2 + 1]!);
    const roundedCorners: RoundedCorner[] = [];
    for (let i = 0; i < n; i++) {
      roundedCorners.push(
        new RoundedCorner(
          vertex((i + n - 1) % n),
          vertex(i),
          vertex((i + 1) % n),
          perVertexRounding?.[i] ?? rounding,
        ),
      );
    }

    // For each side, check if there is enough space for the cuts; if not, split the space,
    // first for round cuts, then for smoothing. Each entry is [how much of expectedRoundCut,
    // how much of expectedCut] the side from corner i to corner i+1 allows.
    const cutAdjusts = roundedCorners.map((corner, ix) => {
      const next = roundedCorners[(ix + 1) % n]!;
      const expectedRoundCut = corner.expectedRoundCut + next.expectedRoundCut;
      const expectedCut = corner.expectedCut + next.expectedCut;
      const a = vertex(ix);
      const b = vertex((ix + 1) % n);
      const sideSize = distance(a.x - b.x, a.y - b.y);
      if (expectedRoundCut > sideSize) return [sideSize / expectedRoundCut, 0] as const;
      if (expectedCut > sideSize) {
        return [1, (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut)] as const;
      }
      return [1, 1] as const;
    });

    const corners = roundedCorners.map((corner, i) => {
      // allowedCuts[0]: side from the previous corner; allowedCuts[1]: side to the next one.
      const allowedCuts = [0, 1].map((delta) => {
        const [roundCutRatio, cutRatio] = cutAdjusts[(i + n - 1 + delta) % n]!;
        return (
          corner.expectedRoundCut * roundCutRatio +
          (corner.expectedCut - corner.expectedRoundCut) * cutRatio
        );
      });
      return corner.getCubics(allowedCuts[0]!, allowedCuts[1]!);
    });

    const features: Feature[] = [];
    for (let i = 0; i < n; i++) {
      const isConvex = convex(vertex((i + n - 1) % n), vertex(i), vertex((i + 1) % n));
      features.push(new Corner(corners[i]!, isConvex));
      const end = corners[i]![corners[i]!.length - 1]!;
      const start = corners[(i + 1) % n]![0]!;
      features.push(
        new Edge([Cubic.straightLine(end.anchor1X, end.anchor1Y, start.anchor0X, start.anchor0Y)]),
      );
    }

    const center =
      centerX === undefined || centerY === undefined
        ? calculateCenter(vertices)
        : new Point(centerX, centerY);
    return new RoundedPolygon(features, center);
  }

  /** A polygon from existing features; the center defaults to the average of their anchors. */
  static fromFeatures(
    features: readonly Feature[],
    centerX?: number,
    centerY?: number,
  ): RoundedPolygon {
    if (features.length < 2) throw new Error('Polygons must have at least 2 features');
    const vertices: number[] = [];
    for (const feature of features) {
      for (const cubic of feature.cubics) vertices.push(cubic.anchor0X, cubic.anchor0Y);
    }
    const computed = calculateCenter(vertices);
    return new RoundedPolygon(
      features,
      new Point(
        centerX === undefined || Number.isNaN(centerX) ? computed.x : centerX,
        centerY === undefined || Number.isNaN(centerY) ? computed.y : centerY,
      ),
    );
  }

  transformed(f: PointTransformer): RoundedPolygon {
    return new RoundedPolygon(
      this.features.map((feature) => feature.transformed(f)),
      this.center.transformed(f),
    );
  }

  /** Scales and translates the shape into the unit square (0..1), centred if not square. */
  normalized(): RoundedPolygon {
    const bounds = this.calculateBounds();
    const width = bounds[2]! - bounds[0]!;
    const height = bounds[3]! - bounds[1]!;
    const side = Math.max(width, height);
    // Center the shape if bounds are not a square.
    const offsetX = (side - width) / 2 - bounds[0]!;
    const offsetY = (side - height) / 2 - bounds[1]!;
    return this.transformed((x, y) => [(x + offsetX) / side, (y + offsetY) / side]);
  }

  /** Bounds of a circle around the center that contains the shape at any rotation. */
  calculateMaxBounds(bounds: number[] = new Array(4).fill(0)): number[] {
    let maxDistSquared = 0;
    for (const cubic of this.cubics) {
      const anchorDistance = distanceSquared(
        cubic.anchor0X - this.centerX,
        cubic.anchor0Y - this.centerY,
      );
      const middle = cubic.pointOnCurve(0.5);
      const middleDistance = distanceSquared(middle.x - this.centerX, middle.y - this.centerY);
      maxDistSquared = Math.max(maxDistSquared, anchorDistance, middleDistance);
    }
    const d = Math.sqrt(maxDistSquared);
    bounds[0] = this.centerX - d;
    bounds[1] = this.centerY - d;
    bounds[2] = this.centerX + d;
    bounds[3] = this.centerY + d;
    return bounds;
  }

  /** `[minX, minY, maxX, maxY]`; `approximate` (default) uses control-point hulls. */
  calculateBounds(bounds: number[] = new Array(4).fill(0), approximate = true): number[] {
    // Kotlin seeds the maxima with Float.MIN_VALUE (the smallest positive float), which is wrong
    // for shapes entirely in negative space; -Infinity is used instead.
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    for (const cubic of this.cubics) {
      cubic.calculateBounds(bounds, approximate);
      minX = Math.min(minX, bounds[0]!);
      minY = Math.min(minY, bounds[1]!);
      maxX = Math.max(maxX, bounds[2]!);
      maxY = Math.max(maxY, bounds[3]!);
    }
    bounds[0] = minX;
    bounds[1] = minY;
    bounds[2] = maxX;
    bounds[3] = maxY;
    return bounds;
  }

  toString(): string {
    return `[RoundedPolygon. Cubics = ${this.cubics.join(', ')} || Features = ${this.features.join(', ')} || Center = (${this.centerX}, ${this.centerY})]`;
  }
}

function buildCubics(features: readonly Feature[], center: Point): Cubic[] {
  // The first/last mechanism ensures that the final anchor point exactly matches the first:
  // points even slightly off can introduce rendering artifacts.
  const result: Cubic[] = [];
  let firstCubic: Cubic | undefined;
  let lastCubic: Cubic | undefined;
  let firstFeatureSplitStart: Cubic[] | undefined;
  let firstFeatureSplitEnd: Cubic[] | undefined;
  if (features.length > 0 && features[0]!.cubics.length === 3) {
    const [start, end] = features[0]!.cubics[1]!.split(0.5);
    firstFeatureSplitStart = [features[0]!.cubics[0]!, start];
    firstFeatureSplitEnd = [end, features[0]!.cubics[2]!];
  }
  // Iterating one past the features allows inserting the initial split cubic, if any.
  for (let i = 0; i <= features.length; i++) {
    let featureCubics: readonly Cubic[];
    if (i === 0 && firstFeatureSplitEnd) featureCubics = firstFeatureSplitEnd;
    else if (i === features.length) {
      if (firstFeatureSplitStart) featureCubics = firstFeatureSplitStart;
      else break;
    } else featureCubics = features[i]!.cubics;

    for (const cubic of featureCubics) {
      // Skip zero-length curves; they add nothing and can trigger rendering artifacts.
      if (!cubic.zeroLength()) {
        if (lastCubic) result.push(lastCubic);
        lastCubic = cubic;
        firstCubic ??= cubic;
      } else if (lastCubic) {
        // Dropping several near-zero curves in a row can add enough discontinuity to throw
        // later, so the last cubic always takes the latest anchor point.
        const points = [...lastCubic.points];
        points[6] = cubic.anchor1X;
        points[7] = cubic.anchor1Y;
        lastCubic = new Cubic(points);
      }
    }
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
  } else {
    // Empty / 0-sized polygon.
    result.push(Cubic.empty(center.x, center.y));
  }
  return result;
}

export function calculateCenter(vertices: readonly number[]): Point {
  let cumulativeX = 0;
  let cumulativeY = 0;
  for (let i = 0; i < vertices.length; i += 2) {
    cumulativeX += vertices[i]!;
    cumulativeY += vertices[i + 1]!;
  }
  return new Point(cumulativeX / (vertices.length / 2), cumulativeY / (vertices.length / 2));
}

function verticesFromNumVerts(
  numVertices: number,
  radius: number,
  centerX: number,
  centerY: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < numVertices; i++) {
    const vertex = radialToCartesian(radius, (Math.PI / numVertices) * 2 * i).plus(
      new Point(centerX, centerY),
    );
    result.push(vertex.x, vertex.y);
  }
  return result;
}

class RoundedCorner {
  readonly d1: Point;
  readonly d2: Point;
  readonly cornerRadius: number;
  readonly smoothing: number;
  readonly cosAngle: number;
  readonly sinAngle: number;
  readonly expectedRoundCut: number;
  /** Center of the rounding circle; equals p1 when there is no rounding. */
  center = new Point(0, 0);

  constructor(
    readonly p0: Point,
    readonly p1: Point,
    readonly p2: Point,
    rounding?: CornerRounding,
  ) {
    const v01 = p0.minus(p1);
    const v21 = p2.minus(p1);
    const d01 = v01.getDistance();
    const d21 = v21.getDistance();
    if (d01 > 0 && d21 > 0) {
      this.d1 = v01.div(d01);
      this.d2 = v21.div(d21);
      this.cornerRadius = rounding?.radius ?? 0;
      this.smoothing = rounding?.smoothing ?? 0;
      // Cosine of the angle at p1: dot product of unit vectors to the other two vertices.
      this.cosAngle = this.d1.dotProduct(this.d2);
      this.sinAngle = Math.sqrt(1 - square(this.cosAngle));
      // How much to cut, measured on a side, to get the required radius:
      // tan(A/2) = sinA / (1 + cosA), where tan(A/2) = radius / cut.
      this.expectedRoundCut =
        this.sinAngle > 1e-3 ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle : 0;
    } else {
      // One (or both) of the sides is empty.
      this.d1 = new Point(0, 0);
      this.d2 = new Point(0, 0);
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
    }
  }

  /** Smoothing lengthens the cut: 0 equals expectedRoundCut, 1 doubles it. */
  get expectedCut(): number {
    return (1 + this.smoothing) * this.expectedRoundCut;
  }

  getCubics(allowedCut0: number, allowedCut1: number = allowedCut0): Cubic[] {
    // The smaller cut sets the radius; extra space on one side can go to smoothing.
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    if (
      this.expectedRoundCut < DistanceEpsilon ||
      allowedCut < DistanceEpsilon ||
      this.cornerRadius < DistanceEpsilon
    ) {
      this.center = this.p1;
      return [Cubic.straightLine(this.p1.x, this.p1.y, this.p1.x, this.p1.y)];
    }
    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const actualSmoothing0 = this.calculateActualSmoothingValue(allowedCut0);
    const actualSmoothing1 = this.calculateActualSmoothingValue(allowedCut1);
    const actualR = (this.cornerRadius * actualRoundCut) / this.expectedRoundCut;
    const centerDistance = Math.sqrt(square(actualR) + square(actualRoundCut));
    this.center = this.p1.plus(this.d1.plus(this.d2).div(2).getDirection().times(centerDistance));
    const circleIntersection0 = this.p1.plus(this.d1.times(actualRoundCut));
    const circleIntersection2 = this.p1.plus(this.d2.times(actualRoundCut));
    const flanking0 = this.computeFlankingCurve(
      actualRoundCut,
      actualSmoothing0,
      this.p1,
      this.p0,
      circleIntersection0,
      circleIntersection2,
      this.center,
      actualR,
    );
    const flanking2 = this.computeFlankingCurve(
      actualRoundCut,
      actualSmoothing1,
      this.p1,
      this.p2,
      circleIntersection2,
      circleIntersection0,
      this.center,
      actualR,
    ).reverse();
    return [
      flanking0,
      Cubic.circularArc(
        this.center.x,
        this.center.y,
        flanking0.anchor1X,
        flanking0.anchor1Y,
        flanking2.anchor0X,
        flanking2.anchor0Y,
      ),
      flanking2,
    ];
  }

  private calculateActualSmoothingValue(allowedCut: number): number {
    if (allowedCut > this.expectedCut) return this.smoothing;
    if (allowedCut > this.expectedRoundCut) {
      return (
        (this.smoothing * (allowedCut - this.expectedRoundCut)) /
        (this.expectedCut - this.expectedRoundCut)
      );
    }
    return 0;
  }

  private computeFlankingCurve(
    actualRoundCut: number,
    actualSmoothingValues: number,
    corner: Point,
    sideStart: Point,
    circleSegmentIntersection: Point,
    otherCircleSegmentIntersection: Point,
    circleCenter: Point,
    actualR: number,
  ): Cubic {
    const sideDirection = sideStart.minus(corner).getDirection();
    const curveStart = corner.plus(
      sideDirection.times(actualRoundCut * (1 + actualSmoothingValues)),
    );
    // Cut a part of the circle section proportional to 1 - smooth (full section at 0).
    const p = interpolatePoint(
      circleSegmentIntersection,
      circleSegmentIntersection.plus(otherCircleSegmentIntersection).div(2),
      actualSmoothingValues,
    );
    // The flanking curve ends on the circle.
    const curveEnd = circleCenter.plus(
      directionVector(p.x - circleCenter.x, p.y - circleCenter.y).times(actualR),
    );
    // The control on the circle side is where the tangent at curveEnd meets the side.
    const circleTangent = curveEnd.minus(circleCenter).rotate90();
    const anchorEnd =
      lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ??
      circleSegmentIntersection;
    // 2/3 comes from design tools.
    const anchorStart = curveStart.plus(anchorEnd.times(2)).div(3);
    return Cubic.fromPoints(curveStart, anchorStart, anchorEnd, curveEnd);
  }
}

function lineIntersection(p0: Point, d0: Point, p1: Point, d1: Point): Point | undefined {
  const rotatedD1 = d1.rotate90();
  const den = d0.dotProduct(rotatedD1);
  if (Math.abs(den) < DistanceEpsilon) return undefined;
  const num = p1.minus(p0).dotProduct(rotatedD1);
  // Equivalent to abs(den / num) < DistanceEpsilon without dividing.
  if (Math.abs(den) < DistanceEpsilon * Math.abs(num)) return undefined;
  return p0.plus(d0.times(num / den));
}
