/*
 * Port of androidx.graphics.shapes commonTest TestUtils.kt (Apache-2.0, see LICENSE-androidx.md).
 * Test-only: not imported by the library.
 */
import { expect } from 'vitest';
import type { Cubic } from './cubic';
import { Corner, type Feature } from './features';
import type { RoundedPolygon } from './rounded-polygon';
import { Point, type PointTransformer } from './point';

const Epsilon = 1e-4;

export function assertPointsEqualish(expected: Point, actual: Point) {
  expect(
    Math.abs(expected.x - actual.x),
    `${expected.x},${expected.y} vs ${actual.x},${actual.y}`,
  ).toBeLessThanOrEqual(Epsilon);
  expect(
    Math.abs(expected.y - actual.y),
    `${expected.x},${expected.y} vs ${actual.x},${actual.y}`,
  ).toBeLessThanOrEqual(Epsilon);
}

export const equalish = (f0: number, f1: number, epsilon: number) => Math.abs(f0 - f1) < epsilon;

export const pointsEqualish = (p0: Point, p1: Point) =>
  equalish(p0.x, p1.x, Epsilon) && equalish(p0.y, p1.y, Epsilon);

const anchor0 = (c: Cubic) => new Point(c.anchor0X, c.anchor0Y);
const control0 = (c: Cubic) => new Point(c.control0X, c.control0Y);
const control1 = (c: Cubic) => new Point(c.control1X, c.control1Y);
const anchor1 = (c: Cubic) => new Point(c.anchor1X, c.anchor1Y);
export const cubicPoints = { anchor0, control0, control1, anchor1 };

export const cubicsEqualish = (c0: Cubic, c1: Cubic) =>
  pointsEqualish(anchor0(c0), anchor0(c1)) &&
  pointsEqualish(anchor1(c0), anchor1(c1)) &&
  pointsEqualish(control0(c0), control0(c1)) &&
  pointsEqualish(control1(c0), control1(c1));

export function assertCubicsEqualish(expected: Cubic, actual: Cubic) {
  assertPointsEqualish(anchor0(expected), anchor0(actual));
  assertPointsEqualish(control0(expected), control0(actual));
  assertPointsEqualish(control1(expected), control1(actual));
  assertPointsEqualish(anchor1(expected), anchor1(actual));
}

export function assertCubicListsEqualish(expected: readonly Cubic[], actual: readonly Cubic[]) {
  expect(actual.length).toBe(expected.length);
  expected.forEach((cubic, i) => assertCubicsEqualish(cubic, actual[i]!));
}

export function assertPointGreaterish(expected: Point, actual: Point) {
  expect(actual.x).toBeGreaterThanOrEqual(expected.x - Epsilon);
  expect(actual.y).toBeGreaterThanOrEqual(expected.y - Epsilon);
}

export function assertPointLessish(expected: Point, actual: Point) {
  expect(actual.x).toBeLessThanOrEqual(expected.x + Epsilon);
  expect(actual.y).toBeLessThanOrEqual(expected.y + Epsilon);
}

export function assertEqualish(expected: number, actual: number, message?: string) {
  expect(Math.abs(expected - actual), message ?? `${expected} vs ${actual}`).toBeLessThanOrEqual(
    Epsilon,
  );
}

export function assertInBounds(shape: readonly Cubic[], minPoint: Point, maxPoint: Point) {
  for (const cubic of shape) {
    for (const p of [anchor0(cubic), control0(cubic), control1(cubic), anchor1(cubic)]) {
      assertPointGreaterish(minPoint, p);
      assertPointLessish(maxPoint, p);
    }
  }
}

export const identityTransform = (): PointTransformer => (x, y) => [x, y];
export const scaleTransform =
  (sx: number, sy: number): PointTransformer =>
  (x, y) => [x * sx, y * sy];
export const translateTransform =
  (dx: number, dy: number): PointTransformer =>
  (x, y) => [x + dx, y + dy];

export function assertFeaturesEqualish(expected: Feature, actual: Feature) {
  assertCubicListsEqualish(expected.cubics, actual.cubics);
  expect(actual.constructor).toBe(expected.constructor);
  if (expected instanceof Corner && actual instanceof Corner) {
    expect(actual.convex).toBe(expected.convex);
  }
}

export function assertPolygonsEqualish(expected: RoundedPolygon, actual: RoundedPolygon) {
  assertCubicListsEqualish(expected.cubics, actual.cubics);
  expect(actual.features.length).toBe(expected.features.length);
  expected.features.forEach((feature, i) => assertFeaturesEqualish(feature, actual.features[i]!));
}
