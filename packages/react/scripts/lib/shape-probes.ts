/**
 * Shape probes: what drawing a static M3 shape costs an app, measured by bundling tiny entries
 * against the built `dist/primitives.js` the way an app's bundler would (tree-shaken, minified,
 * dependencies left out) and gzipping the result. The component budgets can't see this: they
 * count whole modules, and the precomputed outlines are 35 constants in one module, of which a
 * bundler keeps only those imported.
 *
 * Each probe also lists the `dist` modules its bundle kept, so a probe fails if a static
 * outline pulls in the shape engine (`material-shapes.js`, `rounded-polygon.js`) again.
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'tsdown';

/** One probe: an entry's code and its budget in gzipped bytes. */
export interface ShapeProbe {
  name: string;
  /** What the entry imports from `@windmorph/react/primitives`, and what it exports. */
  code: (primitives: string) => string;
  /** Gzipped bytes allowed: the whole bundle's, or its growth over `over`'s. */
  budget: number;
  /** An earlier probe whose size this one's budget is counted from. */
  over?: string;
}

/** A probe's result. */
export interface ShapeProbeResult {
  name: string;
  /** Gzipped bytes of the minified bundle. */
  gzip: number;
  /** What the budget counts: `gzip`, or its growth over the `over` probe. */
  measured: number;
  budget: number;
  over?: string;
  /** The `dist` modules the bundle kept, e.g. `shapes/mask.js`. */
  modules: string[];
}

/** Modules of the shape engine, which a static outline must never pull in. */
export const SHAPE_ENGINE_MODULES = ['shapes/material-shapes.js', 'shapes/rounded-polygon.js'];

const MASK_ALONE = 'materialShapeMask alone';

/**
 * The probes. Budgets (2026-10-17): one outline adds about its own path to the mask helper
 * (Cookie12Sided's is about 390 B gzipped, SoftBoom's, the largest, about 2.2 kB), and the
 * whole record costs all 35 outlines, by design.
 */
export const SHAPE_PROBES: ShapeProbe[] = [
  {
    name: MASK_ALONE,
    code: (p) => `import { materialShapeMask } from '${p}';\nexport default materialShapeMask;\n`,
    budget: 300,
  },
  {
    name: 'materialShapeMask(cookie12SidedShape)',
    code: (p) =>
      `import { cookie12SidedShape, materialShapeMask } from '${p}';\nexport default materialShapeMask(cookie12SidedShape);\n`,
    budget: 600,
    over: MASK_ALONE,
  },
  {
    name: 'materialShapeMask(softBoomShape)',
    code: (p) =>
      `import { materialShapeMask, softBoomShape } from '${p}';\nexport default materialShapeMask(softBoomShape);\n`,
    budget: 2560,
    over: MASK_ALONE,
  },
  {
    name: 'materialShapePaths (every outline)',
    code: (p) => `import { materialShapePaths } from '${p}';\nexport default materialShapePaths;\n`,
    budget: 11000,
  },
];

async function bundle(entry: string, outDir: string, minify: boolean): Promise<string> {
  await build({
    config: false,
    entry: { probe: entry },
    outDir,
    format: 'esm',
    platform: 'browser',
    target: 'es2023',
    minify,
    dts: false,
    sourcemap: false,
    clean: true,
    logLevel: 'silent',
    // Dependencies (React, React Aria, Motion, …) are an app's to share, not this package's.
    deps: { neverBundle: [/^[^./]/] },
  });
  const [file] = readdirSync(outDir).filter((name) => name.endsWith('.js'));
  return readFileSync(join(outDir, file!), 'utf8');
}

/** Bundles and measures every probe against `distDir`. */
export async function runShapeProbes(
  distDir: string,
  probes: ShapeProbe[] = SHAPE_PROBES,
): Promise<ShapeProbeResult[]> {
  const dir = mkdtempSync(join(tmpdir(), 'windmorph-shape-probe-'));
  try {
    const results: ShapeProbeResult[] = [];
    for (const [index, probe] of probes.entries()) {
      const entry = join(dir, `probe-${index}.js`);
      writeFileSync(entry, probe.code(join(distDir, 'primitives.js')));
      const minified = await bundle(entry, join(dir, `min-${index}`), true);
      // Unminified output keeps a `//#region <path>` comment per module it kept.
      const readable = await bundle(entry, join(dir, `src-${index}`), false);
      const modules = [...readable.matchAll(/^\/\/#region (?:.*\/)?dist\/(.+)$/gm)]
        .map(([, path]) => path!)
        .sort();
      const gzip = gzipSync(minified, { level: 9 }).length;
      const base = results.find(({ name }) => name === probe.over);
      results.push({
        name: probe.name,
        gzip,
        measured: base ? gzip - base.gzip : gzip,
        budget: probe.budget,
        over: probe.over,
        modules,
      });
    }
    return results;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Problems with the probes' results: over budget, or the shape engine pulled in. */
export function checkShapeProbes(results: ShapeProbeResult[]): string[] {
  return results.flatMap(({ name, measured, budget, over, modules }) => [
    ...(measured > budget
      ? [
          `${name}: ${measured} B gzipped${over ? ` over ${over}` : ''} is past its ${budget} B budget`,
        ]
      : []),
    ...modules
      .filter((module) => SHAPE_ENGINE_MODULES.includes(module))
      .map((module) => `${name}: bundles the shape engine (${module})`),
  ]);
}
