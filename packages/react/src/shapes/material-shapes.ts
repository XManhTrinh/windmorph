/*
 * Port of androidx.compose.material3 MaterialShapes.kt (Apache-2.0, see LICENSE-androidx.md).
 */
import { CornerRounding } from './corner-rounding';
import { Point, type PointTransformer } from './point';
import { RoundedPolygon } from './rounded-polygon';
import { circle, rectangle, star } from './shapes';

const cornerRound15 = new CornerRounding(0.15);
const cornerRound20 = new CornerRounding(0.2);
const cornerRound30 = new CornerRounding(0.3);
const cornerRound50 = new CornerRounding(0.5);
const cornerRound100 = new CornerRounding(1);

const toRadians = (degrees: number) => (degrees / 360) * 2 * Math.PI;

/** Compose `Matrix().rotateZ(degrees)`: rotation about the origin. */
function rotate(degrees: number): PointTransformer {
  const a = toRadians(degrees);
  const c = Math.cos(a);
  const s = Math.sin(a);
  return (x, y) => [x * c - y * s, x * s + y * c];
}

function scale(sx: number, sy: number): PointTransformer {
  return (x, y) => [x * sx, y * sy];
}

const rotateNeg45 = rotate(-45);
const rotateNeg90 = rotate(-90);
const rotateNeg135 = rotate(-135);

interface PointNRound {
  readonly o: Point;
  readonly r: CornerRounding;
}

const pnr = (x: number, y: number, r: CornerRounding = CornerRounding.Unrounded): PointNRound => ({
  o: new Point(x, y),
  r,
});

const angleDegrees = (p: Point) => (Math.atan2(p.y, p.x) * 180) / Math.PI;

function rotateDegrees(p: Point, angle: number, center: Point): Point {
  const a = toRadians(angle);
  const off = p.minus(center);
  return new Point(
    off.x * Math.cos(a) - off.y * Math.sin(a),
    off.x * Math.sin(a) + off.y * Math.cos(a),
  ).plus(center);
}

function doRepeat(
  points: readonly PointNRound[],
  reps: number,
  center: Point,
  mirroring: boolean,
): PointNRound[] {
  const result: PointNRound[] = [];
  if (mirroring) {
    const angles = points.map((p) => angleDegrees(p.o.minus(center)));
    const distances = points.map((p) => p.o.minus(center).getDistance());
    const actualReps = reps * 2;
    const sectionAngle = 360 / actualReps;
    for (let it = 0; it < actualReps; it++) {
      for (let index = 0; index < points.length; index++) {
        const i = it % 2 === 0 ? index : points.length - 1 - index;
        if (i > 0 || it % 2 === 0) {
          const a = toRadians(
            sectionAngle * it +
              (it % 2 === 0 ? angles[i]! : sectionAngle - angles[i]! + 2 * angles[0]!),
          );
          const finalPoint = new Point(Math.cos(a), Math.sin(a)).times(distances[i]!).plus(center);
          result.push({ o: finalPoint, r: points[i]!.r });
        }
      }
    }
  } else {
    const np = points.length;
    for (let it = 0; it < np * reps; it++) {
      const point = rotateDegrees(points[it % np]!.o, (Math.floor(it / np) * 360) / reps, center);
      result.push({ o: point, r: points[it % np]!.r });
    }
  }
  return result;
}

function customPolygon(
  points: readonly PointNRound[],
  reps: number,
  { center = new Point(0.5, 0.5), mirroring = false } = {},
): RoundedPolygon {
  const actualPoints = doRepeat(points, reps, center, mirroring);
  return RoundedPolygon.fromVertices(
    actualPoints.flatMap((p) => [p.o.x, p.o.y]),
    {
      perVertexRounding: actualPoints.map((p) => p.r),
      centerX: center.x,
      centerY: center.y,
    },
  );
}

const builders = {
  Circle: () => circle({ numVertices: 10 }),
  Square: () => rectangle({ width: 1, height: 1, rounding: cornerRound30 }),
  Slanted: () =>
    customPolygon(
      [
        pnr(0.926, 0.97, new CornerRounding(0.189, 0.811)),
        pnr(-0.021, 0.967, new CornerRounding(0.187, 0.057)),
      ],
      2,
    ),
  Arch: () =>
    RoundedPolygon.fromNumVertices(4, {
      perVertexRounding: [cornerRound100, cornerRound100, cornerRound20, cornerRound20],
    }).transformed(rotateNeg135),
  Fan: () =>
    customPolygon(
      [
        pnr(1.004, 1.0, new CornerRounding(0.148, 0.417)),
        pnr(0.0, 1.0, new CornerRounding(0.151)),
        pnr(0.0, -0.003, new CornerRounding(0.148)),
        pnr(0.978, 0.02, new CornerRounding(0.803)),
      ],
      1,
    ),
  Arrow: () =>
    customPolygon(
      [
        pnr(0.5, 0.892, new CornerRounding(0.313)),
        pnr(-0.216, 1.05, new CornerRounding(0.207)),
        pnr(0.499, -0.16, new CornerRounding(0.215, 1.0)),
        pnr(1.225, 1.06, new CornerRounding(0.211)),
      ],
      1,
    ),
  SemiCircle: () =>
    rectangle({
      width: 1.6,
      height: 1,
      perVertexRounding: [cornerRound20, cornerRound20, cornerRound100, cornerRound100],
    }),
  Oval: () => circle().transformed(scale(1, 0.64)).transformed(rotateNeg45),
  Pill: () =>
    customPolygon(
      [
        pnr(0.961, 0.039, new CornerRounding(0.426)),
        pnr(1.001, 0.428),
        pnr(1.0, 0.609, new CornerRounding(1.0)),
      ],
      2,
      { mirroring: true },
    ),
  Triangle: () =>
    RoundedPolygon.fromNumVertices(3, { rounding: cornerRound20 }).transformed(rotateNeg90),
  Diamond: () =>
    customPolygon(
      [
        pnr(0.5, 1.096, new CornerRounding(0.151, 0.524)),
        pnr(0.04, 0.5, new CornerRounding(0.159)),
      ],
      2,
    ),
  ClamShell: () =>
    customPolygon(
      [
        pnr(0.171, 0.841, new CornerRounding(0.159)),
        pnr(-0.02, 0.5, new CornerRounding(0.14)),
        pnr(0.17, 0.159, new CornerRounding(0.159)),
      ],
      2,
    ),
  Pentagon: () =>
    customPolygon(
      [
        pnr(0.5, -0.009, new CornerRounding(0.172)),
        pnr(1.03, 0.365, new CornerRounding(0.164)),
        pnr(0.828, 0.97, new CornerRounding(0.169)),
      ],
      1,
      { mirroring: true },
    ),
  Gem: () =>
    customPolygon(
      [
        pnr(0.499, 1.023, new CornerRounding(0.241, 0.778)),
        pnr(-0.005, 0.792, new CornerRounding(0.208)),
        pnr(0.073, 0.258, new CornerRounding(0.228)),
        pnr(0.433, -0.0, new CornerRounding(0.491)),
      ],
      1,
      { mirroring: true },
    ),
  Sunny: () => star(8, { innerRadius: 0.8, rounding: cornerRound15 }),
  VerySunny: () =>
    customPolygon(
      [pnr(0.5, 1.08, new CornerRounding(0.085)), pnr(0.358, 0.843, new CornerRounding(0.085))],
      8,
    ),
  Cookie4Sided: () =>
    customPolygon(
      [pnr(1.237, 1.236, new CornerRounding(0.258)), pnr(0.5, 0.918, new CornerRounding(0.233))],
      4,
    ),
  Cookie6Sided: () =>
    customPolygon(
      [pnr(0.723, 0.884, new CornerRounding(0.394)), pnr(0.5, 1.099, new CornerRounding(0.398))],
      6,
    ),
  Cookie7Sided: () =>
    star(7, { innerRadius: 0.75, rounding: cornerRound50 }).transformed(rotateNeg90),
  Cookie9Sided: () =>
    star(9, { innerRadius: 0.8, rounding: cornerRound50 }).transformed(rotateNeg90),
  Cookie12Sided: () =>
    star(12, { innerRadius: 0.8, rounding: cornerRound50 }).transformed(rotateNeg90),
  Ghostish: () =>
    customPolygon(
      [
        pnr(0.5, 0, new CornerRounding(1.0)),
        pnr(1, 0, new CornerRounding(1.0)),
        pnr(1, 1.14, new CornerRounding(0.254, 0.106)),
        pnr(0.575, 0.906, new CornerRounding(0.253)),
      ],
      1,
      { mirroring: true },
    ),
  Clover4Leaf: () =>
    customPolygon([pnr(0.5, 0.074), pnr(0.725, -0.099, new CornerRounding(0.476))], 4, {
      mirroring: true,
    }),
  Clover8Leaf: () =>
    customPolygon([pnr(0.5, 0.036), pnr(0.758, -0.101, new CornerRounding(0.209))], 8),
  Burst: () =>
    customPolygon(
      [pnr(0.5, -0.006, new CornerRounding(0.006)), pnr(0.592, 0.158, new CornerRounding(0.006))],
      12,
    ),
  SoftBurst: () =>
    customPolygon(
      [pnr(0.193, 0.277, new CornerRounding(0.053)), pnr(0.176, 0.055, new CornerRounding(0.053))],
      10,
    ),
  Boom: () =>
    customPolygon(
      [pnr(0.457, 0.296, new CornerRounding(0.007)), pnr(0.5, -0.051, new CornerRounding(0.007))],
      15,
    ),
  SoftBoom: () =>
    customPolygon(
      [
        pnr(0.733, 0.454),
        pnr(0.839, 0.437, new CornerRounding(0.532)),
        pnr(0.949, 0.449, new CornerRounding(0.439, 1.0)),
        pnr(0.998, 0.478, new CornerRounding(0.174)),
      ],
      16,
      { mirroring: true },
    ),
  Flower: () =>
    customPolygon(
      [
        pnr(0.37, 0.187),
        pnr(0.416, 0.049, new CornerRounding(0.381)),
        pnr(0.479, 0.001, new CornerRounding(0.095)),
      ],
      8,
      { mirroring: true },
    ),
  Puffy: () =>
    customPolygon(
      [
        pnr(0.5, 0.053),
        pnr(0.545, -0.04, new CornerRounding(0.405)),
        pnr(0.67, -0.035, new CornerRounding(0.426)),
        pnr(0.717, 0.066, new CornerRounding(0.574)),
        pnr(0.722, 0.128),
        pnr(0.777, 0.002, new CornerRounding(0.36)),
        pnr(0.914, 0.149, new CornerRounding(0.66)),
        pnr(0.926, 0.289, new CornerRounding(0.66)),
        pnr(0.881, 0.346),
        pnr(0.94, 0.344, new CornerRounding(0.126)),
        pnr(1.003, 0.437, new CornerRounding(0.255)),
      ],
      2,
      { mirroring: true },
    ).transformed(scale(1, 0.742)),
  PuffyDiamond: () =>
    customPolygon(
      [
        pnr(0.87, 0.13, new CornerRounding(0.146)),
        pnr(0.818, 0.357),
        pnr(1.0, 0.332, new CornerRounding(0.853)),
      ],
      4,
      { mirroring: true },
    ),
  PixelCircle: () =>
    customPolygon(
      [
        pnr(0.5, 0.0),
        pnr(0.704, 0.0),
        pnr(0.704, 0.065),
        pnr(0.843, 0.065),
        pnr(0.843, 0.148),
        pnr(0.926, 0.148),
        pnr(0.926, 0.296),
        pnr(1.0, 0.296),
      ],
      2,
      { mirroring: true },
    ),
  PixelTriangle: () =>
    customPolygon(
      [
        pnr(0.11, 0.5),
        pnr(0.113, 0.0),
        pnr(0.287, 0.0),
        pnr(0.287, 0.087),
        pnr(0.421, 0.087),
        pnr(0.421, 0.17),
        pnr(0.56, 0.17),
        pnr(0.56, 0.265),
        pnr(0.674, 0.265),
        pnr(0.675, 0.344),
        pnr(0.789, 0.344),
        pnr(0.789, 0.439),
        pnr(0.888, 0.439),
      ],
      1,
      { mirroring: true },
    ),
  Bun: () =>
    customPolygon(
      [
        pnr(0.796, 0.5),
        pnr(0.853, 0.518, cornerRound100),
        pnr(0.992, 0.631, cornerRound100),
        pnr(0.968, 1.0, cornerRound100),
      ],
      2,
      { mirroring: true },
    ),
  Heart: () =>
    customPolygon(
      [
        pnr(0.5, 0.268, new CornerRounding(0.016)),
        pnr(0.792, -0.066, new CornerRounding(0.958)),
        pnr(1.064, 0.276, new CornerRounding(1.0)),
        pnr(0.501, 0.946, new CornerRounding(0.129)),
      ],
      1,
      { mirroring: true },
    ),
} satisfies Record<string, () => RoundedPolygon>;

export type MaterialShapeName = keyof typeof builders;

export const materialShapeNames = Object.keys(builders) as MaterialShapeName[];

const cache = new Map<MaterialShapeName, RoundedPolygon>();

/**
 * The 35 Material 3 Expressive shapes, normalized to the unit square. Each shape is built
 * on first access and cached.
 */
export const MaterialShapes = Object.defineProperties(
  {} as Readonly<Record<MaterialShapeName, RoundedPolygon>>,
  Object.fromEntries(
    materialShapeNames.map((name) => [
      name,
      {
        enumerable: true,
        get(): RoundedPolygon {
          let shape = cache.get(name);
          if (!shape) {
            shape = builders[name]().normalized();
            cache.set(name, shape);
          }
          return shape;
        },
      },
    ]),
  ),
);
