// @vitest-environment node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { materialShapePaths } from '../src/shapes/generated/material-shape-path-record';
import * as outlines from '../src/shapes/generated/material-shape-paths';
import { MaterialShapes } from '../src/shapes/material-shapes';
import { polygonToPath } from '../src/shapes/path';
import { materialShapePathFiles, shapeConstantName } from './lib/material-shape-paths';

const root = fileURLToPath(new URL('..', import.meta.url));
const { materialShapeNames } = outlines;

/** Every number in SVG path data, in order. */
const numbers = (path: string) => (path.match(/-?(?:\d+\.?\d*|\.\d+)/g) ?? []).map(Number);
/** The command letters, in order. */
const commands = (path: string) => path.replace(/[^A-Za-z]/g, '');

describe('precomputed shape outlines', () => {
  it.each(Object.entries(materialShapePathFiles()))(
    '%s is current (pnpm generate)',
    (file, source) => {
      expect(readFileSync(`${root}${file}`, 'utf8')).toBe(source);
    },
  );

  it('lists the names of the shape builders', () => {
    expect(materialShapeNames).toHaveLength(35);
    expect([...materialShapeNames]).toEqual(Object.keys(MaterialShapes));
    expect(Object.keys(materialShapePaths)).toEqual(Object.keys(MaterialShapes));
  });

  it.each(materialShapeNames)('%s matches the engine within 0.0005', (name) => {
    const shape = materialShapePaths[name];
    expect(shape.name).toBe(name);
    expect(outlines[shapeConstantName(name) as keyof typeof outlines]).toBe(shape);
    const engine = polygonToPath(MaterialShapes[name]);
    expect(commands(shape.path)).toBe(commands(engine));
    // Against the engine's unrounded coordinates, in the order the path writes them.
    const { cubics } = MaterialShapes[name];
    const expected = [
      cubics[0]!.anchor0X,
      cubics[0]!.anchor0Y,
      ...cubics.flatMap((c) => [
        c.control0X,
        c.control0Y,
        c.control1X,
        c.control1Y,
        c.anchor1X,
        c.anchor1Y,
      ]),
    ];
    const actual = numbers(shape.path);
    expect(actual).toHaveLength(expected.length);
    expect(numbers(engine)).toHaveLength(expected.length);
    const worst = Math.max(...actual.map((n, i) => Math.abs(n - expected[i]!)));
    expect(worst).toBeLessThanOrEqual(0.0005 + 1e-9);
    expect(shape.path).not.toMatch(/\.\d{4}/);
  });
});
