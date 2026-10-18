/**
 * Bundle-size budgets for the public components, measured from the built `dist/` (see
 * `scripts/lib/bundle-size.ts` for what an entry's size counts).
 *
 * - `report`: writes `dist/bundle-size.json`, which the docs site shows on each component's
 *   API tab. Runs as the last step of `build`.
 * - `check` (CI): fails when a component is over its budget in `bundle-size.json` by more
 *   than the tolerance, has no budget, or a budget names a module that's gone.
 * - `check --update`: rewrites the budgets to the current sizes, for a deliberate change.
 *
 * `check` also runs the shape probes (`scripts/lib/shape-probes.ts`): what a static M3 shape
 * costs an app once its bundler tree-shakes the precomputed outlines, with fixed budgets.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { budgetsFor, checkBudgets, measure, type SizeBudgets } from './lib/bundle-size';
import { checkShapeProbes, runShapeProbes } from './lib/shape-probes';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = `${root}dist`;
const budgetsFile = `${root}bundle-size.json`;
/** The growth allowed past a budget before the check fails. */
const TOLERANCE = 0.02;

const [command, flag] = argv.slice(2);
const report = measure(distDir);

function kB(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

if (command === 'report') {
  writeFileSync(`${distDir}/bundle-size.json`, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Measured ${Object.keys(report).length} component modules.`);
} else if (command === 'check' && flag === '--update') {
  writeFileSync(budgetsFile, `${JSON.stringify(budgetsFor(report, TOLERANCE), null, 2)}\n`);
  console.log(`Wrote budgets for ${Object.keys(report).length} component modules.`);
} else if (command === 'check') {
  const budgets = JSON.parse(readFileSync(budgetsFile, 'utf8')) as SizeBudgets;
  for (const [entry, { gzip }] of Object.entries(report)) {
    const budget = budgets.budgets[entry];
    console.log(`${entry.padEnd(48)} ${kB(gzip).padStart(9)}${budget ? ` / ${kB(budget)}` : ''}`);
  }
  const probes = await runShapeProbes(distDir);
  console.log('\nShape probes (tree-shaken, minified):');
  for (const { name, gzip, measured, budget, over } of probes) {
    const counted = over ? `+${measured} B over ${over}` : `${gzip} B`;
    console.log(`${name.padEnd(48)} ${counted} / ${budget} B`);
  }
  const problems = checkBudgets(report, budgets);
  const probeProblems = checkShapeProbes(probes);
  if (problems.length > 0) {
    console.error(
      `\nBundle-size check failed:\n  ${problems.map(({ entry, message }) => `${entry}: ${message}`).join('\n  ')}\n\nIf the growth is intended, run \`pnpm --filter @windmorph/react size:update\` and commit bundle-size.json.`,
    );
  }
  if (probeProblems.length > 0) {
    console.error(`\nShape probe check failed:\n  ${probeProblems.join('\n  ')}`);
  }
  if (problems.length > 0 || probeProblems.length > 0) exit(1);
  console.log(
    `\nAll ${Object.keys(report).length} component modules and ${probes.length} shape probes are within budget.`,
  );
} else {
  console.error('Usage: bundle-size.ts report | check [--update]');
  exit(1);
}
