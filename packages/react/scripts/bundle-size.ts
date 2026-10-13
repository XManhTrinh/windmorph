/**
 * Bundle-size budgets for the public components, measured from the built `dist/` (see
 * `scripts/lib/bundle-size.ts` for what an entry's size counts).
 *
 * - `report`: writes `dist/bundle-size.json`, which the docs site shows on each component's
 *   API tab. Runs as the last step of `build`.
 * - `check` (CI): fails when a component is over its budget in `bundle-size.json` by more
 *   than the tolerance, has no budget, or a budget names a module that's gone.
 * - `check --update`: rewrites the budgets to the current sizes, for a deliberate change.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { argv, exit } from 'node:process';
import { fileURLToPath } from 'node:url';
import { budgetsFor, checkBudgets, measure, type SizeBudgets } from './lib/bundle-size';

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
  const problems = checkBudgets(report, budgets);
  if (problems.length > 0) {
    console.error(
      `\nBundle-size check failed:\n  ${problems.map(({ entry, message }) => `${entry}: ${message}`).join('\n  ')}\n\nIf the growth is intended, run \`pnpm --filter @windmorph/react size:update\` and commit bundle-size.json.`,
    );
    exit(1);
  }
  console.log(`\nAll ${Object.keys(report).length} component modules are within budget.`);
} else {
  console.error('Usage: bundle-size.ts report | check [--update]');
  exit(1);
}
