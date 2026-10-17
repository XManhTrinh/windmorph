import { describe, expect, it } from 'vitest';
import { MaterialShapes, materialShapeNames } from './material-shapes';
import { Morph } from './morph';
import { morphToPath, polygonToPath } from './path';
import { RoundedPolygon } from './rounded-polygon';

describe('MaterialShapes', () => {
  it('has the 35 Expressive shapes', () => {
    expect(materialShapeNames).toHaveLength(35);
    expect(Object.keys(MaterialShapes)).toEqual(materialShapeNames);
  });

  it('caches each shape', () => {
    expect(MaterialShapes.Cookie9Sided).toBe(MaterialShapes.Cookie9Sided);
  });

  it.each(materialShapeNames)('normalizes %s into the unit square', (name) => {
    const shape = MaterialShapes[name];
    expect(shape).toBeInstanceOf(RoundedPolygon);
    // normalized() fits the longer side of the approximate bounds (which include control
    // points) to [0, 1] and centers the other; the exact outline lies within them.
    const [minX, minY, maxX, maxY] = shape.calculateBounds();
    expect(Math.max(maxX! - minX!, maxY! - minY!)).toBeCloseTo(1, 6);
    const exact = shape.calculateBounds([0, 0, 0, 0], false);
    expect(Math.min(exact[0]!, exact[1]!)).toBeGreaterThanOrEqual(-1e-6);
    expect(Math.max(exact[2]!, exact[3]!)).toBeLessThanOrEqual(1 + 1e-6);
  });

  // The loading indicator and FAB menu morph between arbitrary pairs, so every pair must match.
  it('morphs between every pair of shapes', () => {
    for (const a of materialShapeNames) {
      for (const b of materialShapeNames) {
        const morph = new Morph(MaterialShapes[a], MaterialShapes[b]);
        expect(morph.morphMatch.length, `${a} → ${b}`).toBeGreaterThan(0);
      }
    }
  });
});

describe('path serialization', () => {
  it('writes a closed SVG path of cubics', () => {
    const d = polygonToPath(MaterialShapes.Square, { scale: 24 });
    expect(d).toMatch(/^M[-\d. ]+(C[-\d. ]+)+Z$/);
    const curves = d.match(/C/g)!.length;
    expect(curves).toBe(MaterialShapes.Square.cubics.length);
  });

  it('scales and rounds coordinates', () => {
    const d = polygonToPath(RoundedPolygon.fromNumVertices(4, { centerX: 1, centerY: 1 }), {
      scale: 10,
    });
    // Starts at the first vertex, (2, 1) scaled by 10.
    expect(d.startsWith('M20 10C')).toBe(true);
    expect(d).not.toMatch(/\.\d{5,}/);
  });

  it('rotates about the pivot so the path starts at startAngle', () => {
    const square = RoundedPolygon.fromNumVertices(4, { centerX: 1, centerY: 1 });
    // The first vertex is at 0°; rotated to 90° (down, as y points down) it lands at (1, 2).
    expect(polygonToPath(square, { startAngle: 90 }).startsWith('M1 2C')).toBe(true);
  });

  it('repeats the outline when asked', () => {
    const shape = MaterialShapes.Circle;
    const once = polygonToPath(shape).match(/C/g)!.length;
    const twice = polygonToPath(shape, { repeatPath: true, closePath: false });
    expect(twice.match(/C/g)!.length).toBe(once * 2);
    expect(twice).toContain('L');
    expect(twice.endsWith('Z')).toBe(false);
  });

  it('serializes a morph at both ends', () => {
    const morph = new Morph(MaterialShapes.Circle, MaterialShapes.Cookie4Sided);
    const start = morphToPath(morph, 0);
    const end = morphToPath(morph, 1);
    expect(start).not.toBe(end);
    // Both ends have the same structure, which is what makes them animatable.
    expect(start.match(/C/g)!.length).toBe(end.match(/C/g)!.length);
  });
});
