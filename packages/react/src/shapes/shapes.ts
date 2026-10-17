/*
 * Port of androidx.graphics.shapes Shapes.kt (Apache-2.0, see LICENSE-androidx.md):
 * factory functions for common RoundedPolygon shapes.
 */
import { CornerRounding } from './corner-rounding';
import { FloatPi, Point, TwoPi, interpolate, radialToCartesian } from './point';
import { RoundedPolygon } from './rounded-polygon';

/** A circle approximated by a rounded regular polygon with `numVertices` vertices. */
export function circle({
  numVertices = 8,
  radius = 1,
  centerX = 0,
  centerY = 0,
}: {
  numVertices?: number;
  radius?: number;
  centerX?: number;
  centerY?: number;
} = {}): RoundedPolygon {
  if (numVertices < 3) throw new Error('Circle must have at least three vertices');
  // Half of the angle between two adjacent vertices on the polygon.
  const theta = FloatPi / numVertices;
  // Radius of the underlying polygon, given the desired radius of the circle.
  const polygonRadius = radius / Math.cos(theta);
  return RoundedPolygon.fromNumVertices(numVertices, {
    rounding: new CornerRounding(radius),
    radius: polygonRadius,
    centerX,
    centerY,
  });
}

/** A rectangle, optionally with rounded corners. */
export function rectangle({
  width = 2,
  height = 2,
  rounding = CornerRounding.Unrounded,
  perVertexRounding,
  centerX = 0,
  centerY = 0,
}: {
  width?: number;
  height?: number;
  rounding?: CornerRounding;
  perVertexRounding?: readonly CornerRounding[];
  centerX?: number;
  centerY?: number;
} = {}): RoundedPolygon {
  const left = centerX - width / 2;
  const top = centerY - height / 2;
  const right = centerX + width / 2;
  const bottom = centerY + height / 2;
  return RoundedPolygon.fromVertices([right, bottom, left, bottom, left, top, right, top], {
    rounding,
    perVertexRounding,
    centerX,
    centerY,
  });
}

/** A star with `numVerticesPerRadius` points, alternating between `radius` and `innerRadius`. */
export function star(
  numVerticesPerRadius: number,
  {
    radius = 1,
    innerRadius = 0.5,
    rounding = CornerRounding.Unrounded,
    innerRounding,
    perVertexRounding,
    centerX = 0,
    centerY = 0,
  }: {
    radius?: number;
    innerRadius?: number;
    rounding?: CornerRounding;
    innerRounding?: CornerRounding;
    perVertexRounding?: readonly CornerRounding[];
    centerX?: number;
    centerY?: number;
  } = {},
): RoundedPolygon {
  if (radius <= 0 || innerRadius <= 0) throw new Error('Star radii must both be greater than 0');
  if (innerRadius >= radius) throw new Error('innerRadius must be less than radius');
  // Inner rounding without per-vertex rounding: alternate outer and inner rounding.
  const pvRounding =
    perVertexRounding ??
    (innerRounding
      ? Array.from({ length: numVerticesPerRadius }, () => [rounding, innerRounding]).flat()
      : undefined);
  return RoundedPolygon.fromVertices(
    starVerticesFromNumVerts(numVerticesPerRadius, radius, innerRadius, centerX, centerY),
    { rounding, perVertexRounding: pvRounding, centerX, centerY },
  );
}

/** A pill: a rectangle with fully rounded ends. */
export function pill({
  width = 2,
  height = 1,
  smoothing = 0,
  centerX = 0,
  centerY = 0,
}: {
  width?: number;
  height?: number;
  smoothing?: number;
  centerX?: number;
  centerY?: number;
} = {}): RoundedPolygon {
  if (!(width > 0 && height > 0))
    throw new Error('Pill shapes must have positive width and height');
  const wHalf = width / 2;
  const hHalf = height / 2;
  return RoundedPolygon.fromVertices(
    [
      wHalf + centerX,
      hHalf + centerY,
      -wHalf + centerX,
      hHalf + centerY,
      -wHalf + centerX,
      -hHalf + centerY,
      wHalf + centerX,
      -hHalf + centerY,
    ],
    { rounding: new CornerRounding(Math.min(wHalf, hHalf), smoothing), centerX, centerY },
  );
}

/** A star whose vertices lie along a pill outline. */
export function pillStar({
  width = 2,
  height = 1,
  numVerticesPerRadius = 8,
  innerRadiusRatio = 0.5,
  rounding = CornerRounding.Unrounded,
  innerRounding,
  perVertexRounding,
  vertexSpacing = 0.5,
  startLocation = 0,
  centerX = 0,
  centerY = 0,
}: {
  width?: number;
  height?: number;
  numVerticesPerRadius?: number;
  innerRadiusRatio?: number;
  rounding?: CornerRounding;
  innerRounding?: CornerRounding;
  perVertexRounding?: readonly CornerRounding[];
  vertexSpacing?: number;
  startLocation?: number;
  centerX?: number;
  centerY?: number;
} = {}): RoundedPolygon {
  if (!(width > 0 && height > 0))
    throw new Error('Pill shapes must have positive width and height');
  if (!(innerRadiusRatio > 0 && innerRadiusRatio <= 1)) {
    throw new Error('innerRadius must be between 0 and 1');
  }
  const pvRounding =
    perVertexRounding ??
    (innerRounding
      ? Array.from({ length: numVerticesPerRadius }, () => [rounding, innerRounding]).flat()
      : undefined);
  return RoundedPolygon.fromVertices(
    pillStarVerticesFromNumVerts(
      numVerticesPerRadius,
      width,
      height,
      innerRadiusRatio,
      vertexSpacing,
      startLocation,
      centerX,
      centerY,
    ),
    { rounding, perVertexRounding: pvRounding, centerX, centerY },
  );
}

function pillStarVerticesFromNumVerts(
  numVerticesPerRadius: number,
  width: number,
  height: number,
  innerRadius: number,
  vertexSpacing: number,
  startLocation: number,
  centerX: number,
  centerY: number,
): number[] {
  // Walk the perimeter of the underlying pill outline and place each vertex by its distance
  // ("t") along it, in one of the sections: vertical edges, the four circular corners, and the
  // horizontal edges (either the vertical or horizontal edges have zero length).
  const endcapRadius = Math.min(width, height);
  const vSegLen = Math.max(height - width, 0);
  const hSegLen = Math.max(width - height, 0);
  const vSegHalf = vSegLen / 2;
  const hSegHalf = hSegLen / 2;
  // vertexSpacing spaces the inner (0) or outer (1) vertices on the end caps like those along
  // the edges; the default (0.5) averages them.
  const circlePerimeter = TwoPi * endcapRadius * interpolate(innerRadius, 1, vertexSpacing);
  const perimeter = 2 * hSegLen + 2 * vSegLen + circlePerimeter;
  // Start t of each part of the outline.
  const sections = new Array<number>(11);
  sections[0] = 0;
  sections[1] = vSegLen / 2;
  sections[2] = sections[1] + circlePerimeter / 4;
  sections[3] = sections[2] + hSegLen;
  sections[4] = sections[3] + circlePerimeter / 4;
  sections[5] = sections[4] + vSegLen;
  sections[6] = sections[5] + circlePerimeter / 4;
  sections[7] = sections[6] + hSegLen;
  sections[8] = sections[7] + circlePerimeter / 4;
  sections[9] = sections[8] + vSegLen / 2;
  sections[10] = perimeter;
  const tPerVertex = perimeter / (2 * numVerticesPerRadius);
  let inner = false;
  let currSecIndex = 0;
  let secStart = 0;
  let secEnd = sections[1];
  // t = 0 is on the positive x axis; startLocation (0..1) moves it along the perimeter.
  let t = startLocation * perimeter;
  const result: number[] = [];
  const rectBR = new Point(hSegHalf, vSegHalf);
  const rectBL = new Point(-hSegHalf, vSegHalf);
  const rectTL = new Point(-hSegHalf, -vSegHalf);
  const rectTR = new Point(hSegHalf, -vSegHalf);
  for (let i = 0; i < numVerticesPerRadius * 2; i++) {
    // t can start (and end) after 0; handle crossing past 0 again.
    const boundedT = t % perimeter;
    if (boundedT < secStart) currSecIndex = 0;
    while (boundedT >= sections[(currSecIndex + 1) % sections.length]!) {
      currSecIndex = (currSecIndex + 1) % sections.length;
      secStart = sections[currSecIndex]!;
      secEnd = sections[(currSecIndex + 1) % sections.length]!;
    }
    const tInSection = boundedT - secStart;
    const tProportion = tInSection / (secEnd - secStart);
    const currRadius = inner ? endcapRadius * innerRadius : endcapRadius;
    let vertex: Point;
    switch (currSecIndex) {
      case 0:
        vertex = new Point(currRadius, tProportion * vSegHalf);
        break;
      case 1:
        vertex = radialToCartesian(currRadius, (tProportion * FloatPi) / 2).plus(rectBR);
        break;
      case 2:
        vertex = new Point(hSegHalf - tProportion * hSegLen, currRadius);
        break;
      case 3:
        vertex = radialToCartesian(currRadius, FloatPi / 2 + (tProportion * FloatPi) / 2).plus(
          rectBL,
        );
        break;
      case 4:
        vertex = new Point(-currRadius, vSegHalf - tProportion * vSegLen);
        break;
      case 5:
        vertex = radialToCartesian(currRadius, FloatPi + (tProportion * FloatPi) / 2).plus(rectTL);
        break;
      case 6:
        vertex = new Point(-hSegHalf + tProportion * hSegLen, -currRadius);
        break;
      case 7:
        vertex = radialToCartesian(currRadius, FloatPi * 1.5 + (tProportion * FloatPi) / 2).plus(
          rectTR,
        );
        break;
      default:
        vertex = new Point(currRadius, -vSegHalf + tProportion * vSegHalf);
    }
    result.push(vertex.x + centerX, vertex.y + centerY);
    t += tPerVertex;
    inner = !inner;
  }
  return result;
}

function starVerticesFromNumVerts(
  numVerticesPerRadius: number,
  radius: number,
  innerRadius: number,
  centerX: number,
  centerY: number,
): number[] {
  const result: number[] = [];
  for (let i = 0; i < numVerticesPerRadius; i++) {
    let vertex = radialToCartesian(radius, (FloatPi / numVerticesPerRadius) * 2 * i);
    result.push(vertex.x + centerX, vertex.y + centerY);
    vertex = radialToCartesian(innerRadius, (FloatPi / numVerticesPerRadius) * (2 * i + 1));
    result.push(vertex.x + centerX, vertex.y + centerY);
  }
  return result;
}
