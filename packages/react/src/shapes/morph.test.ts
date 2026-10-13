// Ports of androidx.graphics.shapes commonTest FloatMappingTest, PolygonMeasureTest,
// FeatureMappingTest and MorphTest (Apache-2.0, see LICENSE-androidx.md).
import { describe, expect, it } from 'vitest';
import { CornerRounding } from './corner-rounding';
import { Cubic } from './cubic';
import { doMapping, featureDistSquared } from './feature-mapping';
import { Feature } from './features';
import { DoubleMapper } from './float-mapping';
import { Morph } from './morph';
import { LengthMeasurer, MeasuredPolygon, type MeasuredCubic } from './polygon-measure';
import { RoundedPolygon } from './rounded-polygon';
import { circle, star } from './shapes';
import { assertEqualish, cubicsEqualish } from './test-utils';

describe('DoubleMapper', () => {
  // JS numbers are 64-bit, so the tests androidx skips on its JS target (float rounding near
  // the wrap boundary) run here too.
  function validateMapping(mapper: DoubleMapper, expectedFunction: (x: number) => number) {
    for (let i = 0; i < 10000; i++) {
      const source = i / 10000;
      const target = expectedFunction(source);
      assertEqualish(target, mapper.map(source));
      assertEqualish(source, mapper.mapBack(target));
    }
  }

  it('maps identity', () => validateMapping(DoubleMapper.Identity, (x) => x));

  it('maps a simple mapping', () =>
    // The first half of the source maps to the first quarter of the target.
    validateMapping(new DoubleMapper([0, 0], [0.5, 0.25]), (x) =>
      x < 0.5 ? x / 2 : (3 * x - 1) / 2,
    ));

  it('maps when the target wraps', () =>
    validateMapping(new DoubleMapper([0, 0.5], [0.1, 0.6]), (x) => (x + 0.5) % 1));

  it('maps when the source wraps', () =>
    validateMapping(new DoubleMapper([0.5, 0], [0.1, 0.6]), (x) => (x + 0.5) % 1));

  it('maps when both wrap', () =>
    validateMapping(
      new DoubleMapper([0.5, 0.5], [0.75, 0.75], [0.1, 0.1], [0.49, 0.49]),
      (x) => x,
    ));

  it('maps multiple points', () =>
    validateMapping(new DoubleMapper([0.4, 0.2], [0.5, 0.22], [0, 0.8]), (x) => {
      if (x < 0.4) return (0.8 + x) % 1;
      if (x < 0.5) return 0.2 + (x - 0.4) / 5;
      // A source change of 0.5 maps to a target change of 0.58.
      return 0.22 + (x - 0.5) * 1.16;
    }));

  it('rejects a target that wraps twice', () => {
    expect(() => new DoubleMapper([0, 0], [0.3, 0.6], [0.6, 0.3], [0.9, 0.9])).toThrow();
  });

  it('rejects a source that wraps twice', () => {
    expect(() => new DoubleMapper([0, 0], [0.6, 0.3], [0.3, 0.6], [0.9, 0.9])).toThrow();
  });
});

describe('MeasuredPolygon', () => {
  const measurer = new LengthMeasurer();

  function cubicsOf(measured: MeasuredPolygon): MeasuredCubic[] {
    return Array.from({ length: measured.size }, (_, i) => measured.get(i)!);
  }

  function irregularPolygonMeasure(
    polygon: RoundedPolygon,
    extraChecks: (measured: MeasuredPolygon) => void = () => {},
  ) {
    const measured = MeasuredPolygon.measurePolygon(measurer, polygon);
    const cubics = cubicsOf(measured);
    expect(cubics[0]!.startOutlineProgress).toBe(0);
    expect(cubics[cubics.length - 1]!.endOutlineProgress).toBe(1);
    cubics.forEach((cubic, index) => {
      if (index > 0) expect(cubic.startOutlineProgress).toBe(cubics[index - 1]!.endOutlineProgress);
      expect(cubic.endOutlineProgress).toBeGreaterThanOrEqual(cubic.startOutlineProgress);
    });
    for (const { progress } of measured.features) {
      expect(progress >= 0 && progress < 1).toBe(true);
    }
    extraChecks(measured);
  }

  function regularPolygonMeasure(sides: number) {
    irregularPolygonMeasure(RoundedPolygon.fromNumVertices(sides), (measured) => {
      expect(measured.size).toBe(sides);
      cubicsOf(measured).forEach((cubic, index) =>
        assertEqualish(index / sides, cubic.startOutlineProgress),
      );
    });
  }

  it.each([3, 5, 8, 12, 20])('measures a sharp %i-gon', (sides) => regularPolygonMeasure(sides));

  it.each([0.15, 0.5, 1])('measures a hexagon rounded by %f', (radius) =>
    irregularPolygonMeasure(
      RoundedPolygon.fromNumVertices(6, { rounding: new CornerRounding(radius) }),
    ),
  );

  it('approximates a circle within 1.5% of its true length', () => {
    const polygon = circle({ numVertices: 4 });
    const actual = polygon.cubics.reduce((sum, c) => sum + measurer.measureCubic(c), 0);
    const expected = 2 * Math.PI;
    expect(Math.abs(actual - expected)).toBeLessThanOrEqual(0.015 * expected);
  });

  it('measures an irregular triangle', () =>
    irregularPolygonMeasure(
      RoundedPolygon.fromVertices([0, -1, 1, 1, 0, 0.5, -1, 1], {
        perVertexRounding: [
          new CornerRounding(0.2, 0.5),
          new CornerRounding(0.2, 0.5),
          new CornerRounding(0.4, 0),
          new CornerRounding(0.2, 0.5),
        ],
      }),
    ));

  it('measures a square with one rounded corner', () =>
    irregularPolygonMeasure(
      RoundedPolygon.fromVertices([-1, -1, 1, -1, 1, 1, -1, 1], {
        perVertexRounding: [
          CornerRounding.Unrounded,
          CornerRounding.Unrounded,
          new CornerRounding(0.5, 0.5),
          CornerRounding.Unrounded,
        ],
      }),
    ));

  it('measures the diagonal sides of an hourglass', () => {
    const diagonal = Math.SQRT2;
    const horizontal = 2;
    const total = 4 * diagonal + 2 * horizontal;
    const expected = [diagonal, horizontal, diagonal, diagonal, horizontal, diagonal].map(
      (d) => d / total,
    );
    irregularPolygonMeasure(
      RoundedPolygon.fromVertices([0, 0, 1, 1, -1, 1, 0, 0, -1, -1, 1, -1]),
      (measured) => {
        expect(measured.size).toBe(expected.length);
        cubicsOf(measured).forEach((cubic, index) =>
          assertEqualish(expected[index]!, cubic.endOutlineProgress - cubic.startOutlineProgress),
        );
      },
    );
  });

  it('handles an empty last feature', () =>
    irregularPolygonMeasure(
      RoundedPolygon.fromFeatures([
        Feature.buildConvexCorner([Cubic.straightLine(0, 0, 1, 1)]),
        Feature.buildConvexCorner([Cubic.straightLine(1, 1, 1, 0)]),
        Feature.buildConvexCorner([Cubic.straightLine(1, 0, 0, 0)]),
        Feature.buildConvexCorner([Cubic.straightLine(0, 0, 0, 0)]),
      ]),
    ));
});

describe('feature mapping', () => {
  const triangleWithRoundings = RoundedPolygon.fromNumVertices(3, {
    rounding: new CornerRounding(0.2),
  });
  const triangle = RoundedPolygon.fromNumVertices(3);
  const square = RoundedPolygon.fromNumVertices(4);

  /** The squared distances between mapped features, largest first. */
  function mappedDistances(p1: RoundedPolygon, p2: RoundedPolygon): number[] {
    const f1 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p1).features;
    const f2 = MeasuredPolygon.measurePolygon(new LengthMeasurer(), p2).features;
    return doMapping(f1, f2)
      .map(([progress1, progress2]) =>
        featureDistSquared(
          f1.find((f) => f.progress === progress1)!.feature,
          f2.find((f) => f.progress === progress2)!.feature,
        ),
      )
      .sort((a, b) => b - a);
  }

  it('maps a rounded triangle to a sharp one', () => {
    for (const d of mappedDistances(triangleWithRoundings, triangle)) expect(d).toBeLessThan(0.1);
  });

  it.each([
    ['triangle to square', triangle, square],
    ['square to triangle', square, triangle],
  ])('maps %s: one exact match and two close ones', (_, p1, p2) => {
    const distances = mappedDistances(p1, p2);
    expect(distances).toHaveLength(3);
    assertEqualish(distances[0]!, distances[1]!);
    expect(distances[0]).toBeLessThan(0.3);
    expect(distances[2]).toBeLessThan(1e-6);
  });

  it('maps complicated shapes without crashing', () => {
    const checkmark = RoundedPolygon.fromVertices([
      400, -304, 240, -464, 296, -520, 400, -416, 664, -680, 720, -624, 400, -304,
    ]).normalized();
    const verySunny = star(8, {
      innerRadius: 0.65,
      rounding: new CornerRounding(0.15),
    }).normalized();
    const distances = mappedDistances(checkmark, verySunny);
    // Most checkmark vertices map to a feature in the other shape, and closely.
    expect(distances.length).toBeGreaterThanOrEqual(6);
    expect(distances[0]).toBeLessThan(0.15);
  });
});

describe('Morph', () => {
  const poly1 = RoundedPolygon.fromNumVertices(3, { centerX: 0.5, centerY: 0.5 });
  const poly2 = RoundedPolygon.fromNumVertices(4, { centerX: 0.5, centerY: 0.5 });

  it('reproduces the shape it morphs from and to', () => {
    // Every cubic of a self-morph must exist in the source shape (zero-length curves may be
    // optimized out, so the lists need not match one to one).
    const cubics = new Morph(poly1, poly1).asCubics(0);
    expect(cubics.length).toBeGreaterThan(0);
    for (const morphCubic of cubics) {
      expect(poly1.cubics.some((c) => cubicsEqualish(morphCubic, c))).toBe(true);
    }
  });

  // Not in androidx: checks the endpoints and closure of a morph between different shapes.
  it('starts and ends at its two shapes and stays closed', () => {
    const morph = new Morph(poly1, poly2);
    for (const progress of [0, 0.5, 1]) {
      const cubics = morph.asCubics(progress);
      const first = cubics[0]!;
      const last = cubics[cubics.length - 1]!;
      expect(last.anchor1X).toBe(first.anchor0X);
      expect(last.anchor1Y).toBe(first.anchor0Y);
      cubics.slice(1).forEach((cubic, i) => {
        assertEqualish(cubics[i]!.anchor1X, cubic.anchor0X);
        assertEqualish(cubics[i]!.anchor1Y, cubic.anchor0Y);
      });
    }
    const atEnd = morph.asCubics(1);
    for (const cubic of atEnd) {
      // Every anchor at progress 1 lies on the square's outline (|x-.5| or |y-.5| at max).
      const onSquare = [
        [cubic.anchor0X, cubic.anchor0Y],
        [cubic.anchor1X, cubic.anchor1Y],
      ].every(([x, y]) => {
        const r = Math.abs(x! - 0.5) + Math.abs(y! - 0.5);
        return Math.abs(r - 1) < 1e-3;
      });
      expect(onSquare).toBe(true);
    }
  });

  it('bounds contain both shapes', () => {
    const [minX, minY, maxX, maxY] = new Morph(poly1, poly2).calculateBounds();
    assertEqualish(-0.5, minX!);
    assertEqualish(-0.5, minY!);
    assertEqualish(1.5, maxX!);
    assertEqualish(1.5, maxY!);
  });

  it('forEachCubic matches asCubics apart from the closing snap', () => {
    const morph = new Morph(poly1, poly2);
    const expected = morph.asCubics(0.3);
    const actual: Cubic[] = [];
    morph.forEachCubic(0.3, (c) => actual.push(new Cubic(c.points)));
    expect(actual).toHaveLength(expected.length);
    actual.forEach((c, i) => expect(cubicsEqualish(c, expected[i]!)).toBe(true));
  });
});
