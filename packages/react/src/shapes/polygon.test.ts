// Ports of androidx.graphics.shapes commonTest CornerRoundingTest, FeaturesTest, PolygonTest,
// RoundedPolygonTest and ShapesTest (Apache-2.0, see LICENSE-androidx.md).
import { describe, expect, it } from 'vitest';
import { CornerRounding } from './corner-rounding';
import { Cubic } from './cubic';
import { Corner, Edge, Feature } from './features';
import { Point } from './point';
import { RoundedPolygon } from './rounded-polygon';
import { circle, pill, pillStar, rectangle, star } from './shapes';
import {
  assertCubicListsEqualish,
  assertCubicsEqualish,
  assertEqualish,
  assertFeaturesEqualish,
  assertInBounds,
  assertPointsEqualish,
  assertPolygonsEqualish,
  cubicPoints,
  identityTransform,
  scaleTransform,
  translateTransform,
} from './test-utils';

const unit = { min: new Point(-1, -1), max: new Point(1, 1) };

describe('CornerRounding', () => {
  it('stores radius and smoothing', () => {
    expect(new CornerRounding()).toMatchObject({ radius: 0, smoothing: 0 });
    expect(CornerRounding.Unrounded).toMatchObject({ radius: 0, smoothing: 0 });
    expect(new CornerRounding(5)).toMatchObject({ radius: 5, smoothing: 0 });
    expect(new CornerRounding(0, 0.5)).toMatchObject({ radius: 0, smoothing: 0.5 });
    expect(new CornerRounding(5, 0.5)).toMatchObject({ radius: 5, smoothing: 0.5 });
  });
});

describe('Feature', () => {
  it('cannot be empty', () => {
    expect(() => Feature.buildConvexCorner([])).toThrow();
    expect(() => Feature.buildConcaveCorner([])).toThrow();
    expect(() => Feature.buildIgnorableFeature([])).toThrow();
  });

  it('must be continuous', () => {
    const cubics = [Cubic.straightLine(0, 0, 1, 1), Cubic.straightLine(10, 10, 11, 11)];
    expect(() => Feature.buildConvexCorner(cubics)).toThrow();
    expect(() => Feature.buildConcaveCorner(cubics)).toThrow();
    expect(() => Feature.buildIgnorableFeature(cubics)).toThrow();
  });

  it('builds corners, edges and ignorable features', () => {
    const cubic = Cubic.straightLine(0, 0, 1, 0);
    assertFeaturesEqualish(new Corner([cubic], false), Feature.buildConcaveCorner([cubic]));
    assertFeaturesEqualish(new Corner([cubic], true), Feature.buildConvexCorner([cubic]));
    assertFeaturesEqualish(new Edge([cubic]), Feature.buildEdge(cubic));
    assertFeaturesEqualish(new Edge([cubic]), Feature.buildIgnorableFeature([cubic]));
  });
});

describe('RoundedPolygon', () => {
  const rounding = new CornerRounding(0.1);
  const perVertexRounding = [rounding, rounding, rounding, rounding];
  const square = RoundedPolygon.fromNumVertices(4);
  const roundedSquare = RoundedPolygon.fromNumVertices(4, { rounding: new CornerRounding(0.2) });
  const pentagon = RoundedPolygon.fromNumVertices(5);
  const diamond = [1, 0, 0, 1, -1, 0, 0, -1];

  it('builds regular polygons inside their radius', () => {
    expect(() => RoundedPolygon.fromNumVertices(2)).toThrow();
    assertInBounds(square.cubics, unit.min, unit.max);
    assertInBounds(
      RoundedPolygon.fromNumVertices(4, { radius: 2 }).cubics,
      new Point(-2, -2),
      new Point(2, 2),
    );
    assertInBounds(
      RoundedPolygon.fromNumVertices(4, { centerX: 1, centerY: 2 }).cubics,
      new Point(0, 1),
      new Point(2, 3),
    );
    assertInBounds(RoundedPolygon.fromNumVertices(4, { rounding }).cubics, unit.min, unit.max);
    assertInBounds(
      RoundedPolygon.fromNumVertices(4, { perVertexRounding }).cubics,
      unit.min,
      unit.max,
    );
  });

  it('builds polygons from vertices', () => {
    expect(() => RoundedPolygon.fromVertices([1, 0, 0, 1])).toThrow();
    assertInBounds(RoundedPolygon.fromVertices(diamond).cubics, unit.min, unit.max);
    const offset = diamond.map((v, i) => v + (i % 2 === 0 ? 1 : 2));
    assertInBounds(
      RoundedPolygon.fromVertices(offset, { centerX: 1, centerY: 2 }).cubics,
      new Point(0, 1),
      new Point(2, 3),
    );
    assertInBounds(RoundedPolygon.fromVertices(diamond, { rounding }).cubics, unit.min, unit.max);
    assertInBounds(
      RoundedPolygon.fromVertices(diamond, { perVertexRounding }).cubics,
      unit.min,
      unit.max,
    );
  });

  it('copies a polygon through its features', () => {
    assertInBounds(new RoundedPolygon(square.features, square.center).cubics, unit.min, unit.max);
  });

  it('requires at least two continuous features', () => {
    expect(() => RoundedPolygon.fromFeatures([])).toThrow();
    expect(() => RoundedPolygon.fromFeatures([new Corner([Cubic.empty(0, 0)])])).toThrow();
    expect(() =>
      RoundedPolygon.fromFeatures([
        Feature.buildEdge(Cubic.straightLine(0, 0, 1, 0)),
        Feature.buildEdge(Cubic.straightLine(10, 10, 20, 20)),
      ]),
    ).toThrow();
  });

  it.each([
    ['square', () => rectangle()],
    ['rounded square', () => rectangle({ rounding: new CornerRounding(0.5, 0.2) })],
    ['pill', () => pill()],
    ['pill star', () => pillStar({ rounding: new CornerRounding(0.5, 0.2) })],
  ])('reconstructs a %s from its features', (_, build) => {
    const base = build();
    assertPolygonsEqualish(base, RoundedPolygon.fromFeatures(base.features));
  });

  it('reconstructs circles and stars from their features', () => {
    for (let i = 3; i <= 20; i++) {
      for (const base of [
        circle({ numVertices: i }),
        star(i),
        star(i, { rounding: new CornerRounding(0.5, 0.2) }),
      ]) {
        assertPolygonsEqualish(base, RoundedPolygon.fromFeatures(base.features));
      }
    }
  });

  it('computes the center from the vertices', () => {
    const polygon = RoundedPolygon.fromVertices([0, 0, 1, 0, 0, 1, 1, 1]);
    assertEqualish(0.5, polygon.centerX);
    assertEqualish(0.5, polygon.centerY);
    assertPointsEqualish(new Point(0, 0), square.center);
  });

  it('shares space between roundings before smoothing', () => {
    const polygon = RoundedPolygon.fromVertices([0, 0, 1, 0, 0.5, 1], {
      perVertexRounding: [
        new CornerRounding(1, 0),
        new CornerRounding(1, 1),
        CornerRounding.Unrounded,
      ],
    });
    // Not enough room on p0 -> p1 even for the roundings, so the corners meet in the middle.
    const lowerEdge = polygon.features.find((f) => f instanceof Edge)!;
    expect(lowerEdge.cubics).toHaveLength(1);
    const edge = lowerEdge.cubics[0]!;
    assertEqualish(0.5, edge.anchor0X);
    assertEqualish(0, edge.anchor0Y);
    assertEqualish(0.5, edge.anchor1X);
    assertEqualish(0, edge.anchor1Y);
  });

  it('calculates bounds', () => {
    for (const approximate of [true, false]) {
      const [l, t, r, b] = square.calculateBounds(undefined, approximate);
      assertEqualish(-1, l!);
      assertEqualish(-1, t!);
      assertEqualish(1, r!);
      assertEqualish(1, b!);
    }
    // Approximate bounds of a rounded square are larger because of its control points.
    const rough = roundedSquare.calculateBounds();
    const exact = roundedSquare.calculateBounds(undefined, false);
    expect(exact[2]! - exact[0]!).toBeLessThan(rough[2]! - rough[0]!);
    const bounds = pentagon.calculateBounds();
    const maxBounds = pentagon.calculateMaxBounds();
    expect(maxBounds[2]! - maxBounds[0]!).toBeGreaterThan(bounds[2]! - bounds[0]!);
  });

  it('calculates bounds for shapes in negative space', () => {
    const polygon = RoundedPolygon.fromVertices([-3, -3, -2, -3, -2, -2]);
    const [l, t, r, b] = polygon.calculateBounds(undefined, false);
    expect([l, t, r, b]).toEqual([-3, -3, -2, -2]);
  });

  it('transforms', () => {
    const copy = square.transformed(identityTransform());
    expect(copy.cubics).toHaveLength(square.cubics.length);
    square.cubics.forEach((cubic, i) => assertCubicsEqualish(cubic, copy.cubics[i]!));
    const offset = new Point(1, 2);
    const moved = square.transformed(translateTransform(offset.x, offset.y)).cubics;
    square.cubics.forEach((cubic, i) => {
      for (const part of Object.values(cubicPoints)) {
        assertPointsEqualish(part(cubic).plus(offset), part(moved[i]!));
      }
    });
  });

  it('keeps cubics equal to the non-zero cubics of its features', () => {
    const nonzero = square.features.flatMap((f) => f.cubics).filter((c) => !c.zeroLength());
    assertCubicListsEqualish(square.cubics, nonzero);
  });

  it('handles empty polygons and empty sides', () => {
    const empty = RoundedPolygon.fromNumVertices(6, {
      radius: 0,
      rounding: new CornerRounding(0.1),
    });
    expect(empty.cubics).toHaveLength(1);
    const stillEmpty = empty.transformed(scaleTransform(10, 20));
    expect(stillEmpty.cubics).toHaveLength(1);
    expect(stillEmpty.cubics[0]!.zeroLength()).toBe(true);
    assertCubicListsEqualish(
      RoundedPolygon.fromVertices([0, 0, 1, 0, 1, 0, 0, 1]).cubics,
      RoundedPolygon.fromVertices([0, 0, 1, 0, 0, 1]).cubics,
    );
  });
});

describe('Shapes', () => {
  const Epsilon = 0.01;
  const origin = new Point(0, 0);
  const dist = (a: Point, b: Point) => b.minus(a).getDistance();

  const expectOnRadii = (p: Point, r1: number, r2 = r1, center = origin) => {
    const d = dist(center, p);
    expect(
      Math.abs(d - r1) <= Epsilon || Math.abs(d - r2) <= Epsilon,
      `${d} not on ${r1}/${r2}`,
    ).toBe(true);
  };

  const expectCircle = (cubics: readonly Cubic[], radius = 1, center = origin) => {
    for (const cubic of cubics) {
      for (let t = 0; t <= 1; t += 0.1) {
        expect(Math.abs(dist(center, cubic.pointOnCurve(t)) - radius)).toBeLessThanOrEqual(Epsilon);
      }
    }
  };

  it('builds circles', () => {
    expect(() => circle({ numVertices: 2 })).toThrow();
    expectCircle(circle().cubics);
    expectCircle(circle({ numVertices: 3 }).cubics);
    expectCircle(circle({ numVertices: 20 }).cubics);
    expectCircle(circle({ radius: 3 }).cubics, 3);
    expectCircle(circle({ centerX: 1, centerY: 2 }).cubics, 1, new Point(1, 2));
  });

  it('builds stars on their radii', () => {
    for (const [shape, r, ir, center] of [
      [star(4, { innerRadius: 0.5 }), 1, 0.5, origin],
      [star(4, { innerRadius: 0.5, centerX: 1, centerY: 2 }), 1, 0.5, new Point(1, 2)],
      [star(4, { radius: 4, innerRadius: 2 }), 4, 2, origin],
    ] as const) {
      for (const cubic of shape.cubics) {
        expectOnRadii(cubicPoints.anchor0(cubic), r, ir, center);
        expectOnRadii(cubicPoints.anchor1(cubic), r, ir, center);
      }
    }
  });

  it('builds rounded stars within bounds', () => {
    const rounding = new CornerRounding(0.1);
    const innerRounding = new CornerRounding(0.2);
    const perVertexRounding = Array.from({ length: 4 }, () => [rounding, innerRounding]).flat();
    for (const shape of [
      star(4, { innerRadius: 0.5, rounding }),
      star(4, { innerRadius: 0.5, innerRounding }),
      star(4, { innerRadius: 0.5, rounding, innerRounding }),
      star(4, { innerRadius: 0.5, perVertexRounding }),
    ]) {
      assertInBounds(shape.cubics, unit.min, unit.max);
    }
    expect(() => star(6, { innerRadius: 0.5, perVertexRounding })).toThrow();
  });
});
