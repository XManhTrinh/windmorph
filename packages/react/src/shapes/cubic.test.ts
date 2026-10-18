// Port of androidx.graphics.shapes commonTest CubicTest.kt (Apache-2.0, see LICENSE-androidx.md).
import { describe, expect, it } from 'vitest';
import { Cubic } from './cubic';
import { Point } from './point';
import {
  assertCubicsEqualish,
  assertPointsEqualish,
  cubicPoints,
  identityTransform,
  scaleTransform,
  translateTransform,
} from './test-utils';

// These points create a roughly circular arc in the upper-right quadrant around (0, 0).
const zero = new Point(0, 0);
const p0 = new Point(1, 0);
const p1 = new Point(1, 0.5);
const p2 = new Point(0.5, 1);
const p3 = new Point(0, 1);
const cubic = Cubic.fromPoints(p0, p1, p2, p3);
const { anchor0, control0, control1, anchor1 } = cubicPoints;

function assertBetween(end0: Point, end1: Point, actual: Point) {
  expect(Math.min(end0.x, end1.x)).toBeLessThanOrEqual(actual.x);
  expect(Math.min(end0.y, end1.y)).toBeLessThanOrEqual(actual.y);
  expect(Math.max(end0.x, end1.x)).toBeGreaterThanOrEqual(actual.x);
  expect(Math.max(end0.y, end1.y)).toBeGreaterThanOrEqual(actual.y);
}

describe('Cubic', () => {
  it('constructs from points', () => {
    expect(anchor0(cubic)).toEqual(p0);
    expect(control0(cubic)).toEqual(p1);
    expect(control1(cubic)).toEqual(p2);
    expect(anchor1(cubic)).toEqual(p3);
  });

  it('builds a circular arc between the given points', () => {
    const arc = Cubic.circularArc(zero.x, zero.y, p0.x, p0.y, p3.x, p3.y);
    expect(anchor0(arc)).toEqual(p0);
    expect(anchor1(arc)).toEqual(p3);
  });

  it('divides', () => {
    assertCubicsEqualish(cubic, cubic.div(1));
    const half = cubic.div(2);
    assertPointsEqualish(p0.div(2), anchor0(half));
    assertPointsEqualish(p1.div(2), control0(half));
    assertPointsEqualish(p2.div(2), control1(half));
    assertPointsEqualish(p3.div(2), anchor1(half));
  });

  it('multiplies', () => {
    const same = cubic.times(1);
    expect(anchor0(same)).toEqual(p0);
    expect(anchor1(same)).toEqual(p3);
    const double = cubic.times(2);
    assertPointsEqualish(p0.times(2), anchor0(double));
    assertPointsEqualish(p1.times(2), control0(double));
    assertPointsEqualish(p2.times(2), control1(double));
    assertPointsEqualish(p3.times(2), anchor1(double));
  });

  it('adds', () => {
    const offset = cubic.times(2);
    const sum = cubic.plus(offset);
    assertPointsEqualish(p0.plus(anchor0(offset)), anchor0(sum));
    assertPointsEqualish(p1.plus(control0(offset)), control0(sum));
    assertPointsEqualish(p2.plus(control1(offset)), control1(sum));
    assertPointsEqualish(p3.plus(anchor1(offset)), anchor1(sum));
  });

  it('reverses', () => {
    const reversed = cubic.reverse();
    expect(anchor0(reversed)).toEqual(p3);
    expect(control0(reversed)).toEqual(p2);
    expect(control1(reversed)).toEqual(p1);
    expect(anchor1(reversed)).toEqual(p0);
  });

  it('builds a straight line with controls between its ends', () => {
    const line = Cubic.straightLine(p0.x, p0.y, p3.x, p3.y);
    expect(anchor0(line)).toEqual(p0);
    expect(anchor1(line)).toEqual(p3);
    assertBetween(p0, p3, control0(line));
    assertBetween(p0, p3, control1(line));
  });

  it('splits', () => {
    const [split0, split1] = cubic.split(0.5);
    expect(anchor0(split0)).toEqual(anchor0(cubic));
    expect(anchor1(split1)).toEqual(anchor1(cubic));
    assertBetween(anchor0(cubic), anchor1(cubic), anchor1(split0));
    assertBetween(anchor0(cubic), anchor1(cubic), anchor0(split1));
  });

  it('finds points on the curve', () => {
    assertBetween(anchor0(cubic), anchor1(cubic), cubic.pointOnCurve(0.5));
    const line = Cubic.straightLine(p0.x, p0.y, p3.x, p3.y);
    assertPointsEqualish(
      new Point(p0.x + 0.5 * (p3.x - p0.x), p0.y + 0.5 * (p3.y - p0.y)),
      line.pointOnCurve(0.5),
    );
  });

  it('transforms', () => {
    assertCubicsEqualish(cubic, cubic.transformed(identityTransform()));
    assertCubicsEqualish(cubic.times(3), cubic.transformed(scaleTransform(3, 3)));
    const translation = new Point(200, 300);
    const moved = cubic.transformed(translateTransform(200, 300));
    assertPointsEqualish(anchor0(cubic).plus(translation), anchor0(moved));
    assertPointsEqualish(control0(cubic).plus(translation), control0(moved));
    assertPointsEqualish(control1(cubic).plus(translation), control1(moved));
    assertPointsEqualish(anchor1(cubic).plus(translation), anchor1(moved));
  });

  it('has zero length when empty', () => {
    expect(Cubic.empty(10, 10).zeroLength()).toBe(true);
  });
});
