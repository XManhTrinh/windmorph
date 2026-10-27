/**
 * Measures what each public component costs an app: the gzipped size of its module in the
 * built `dist/` plus every library module it imports statically, directly or not (modules it
 * loads with a dynamic `import()` load only when used, so they're left out). Dependencies (React,
 * React Aria, Motion, …) are left out: an app shares them between components, and they are
 * not this package's to budget.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

/** One component module and what it costs. */
export interface EntrySize {
  /** The public components it exports, e.g. `["Dialog", "DialogTrigger", …]`. */
  exports: string[];
  /** Gzipped bytes of the module and the library modules it imports. */
  gzip: number;
}

/** Every component module's size, keyed by its path in `dist` without `.js`. */
export type SizeReport = Record<string, EntrySize>;

/** Budgets per component module, in gzipped bytes, plus the growth allowed past them. */
export interface SizeBudgets {
  /** How far past its budget an entry may grow before the check fails, e.g. `0.02` for 2%. */
  tolerance: number;
  budgets: Record<string, number>;
}

/**
 * Static imports (`… from "./x.js"`, `import "./x.js"`). A dynamic `import("./x.js")` is
 * left out: its module loads only when the code that imports it runs (a `Menu`'s sheet on
 * first open), so the component doesn't cost it up front.
 */
const IMPORT = /(?:\bfrom\s*|\bimport\s*)["'](\.{1,2}\/[^"']+)["']/g;

/** A module's static relative imports, as paths in `dist`. */
function relativeImports(distDir: string, file: string, code: string): string[] {
  return [...code.matchAll(IMPORT)].map(([, specifier]) =>
    relative(distDir, normalize(join(dirname(join(distDir, file)), specifier!))),
  );
}

/** `file` and every library module it imports statically, directly or through others, sorted. */
export function moduleClosure(distDir: string, file: string): string[] {
  const seen = new Set<string>();
  const visit = (current: string) => {
    if (seen.has(current)) return;
    seen.add(current);
    const code = readFileSync(join(distDir, current), 'utf8');
    for (const imported of relativeImports(distDir, current, code)) visit(imported);
  };
  visit(file);
  return [...seen].sort();
}

/** Gzipped bytes of the files together, as a bundler would put them in one chunk. */
export function gzipSize(distDir: string, files: string[]): number {
  const code = files.map((file) => readFileSync(join(distDir, file), 'utf8')).join('\n');
  return gzipSync(code, { level: 9 }).length;
}

/** Whether an export name is a component (PascalCase, and not a React context). */
function isComponentName(name: string): boolean {
  return (
    /^[A-Z][A-Za-z0-9]*$/.test(name) && !name.endsWith('Context') && name !== name.toUpperCase()
  );
}

/**
 * The public component modules, read from the main entry's imports: each module under
 * `components/` or `composites/` that the entry imports a component from.
 */
export function componentEntries(distDir: string): Map<string, string[]> {
  const index = readFileSync(join(distDir, 'index.js'), 'utf8');
  const entries = new Map<string, string[]>();
  for (const [, names, specifier] of index.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*["'](\.\/(?:components|composites)\/[^"']+)["']/g,
  )) {
    const components = names!
      .split(',')
      .map((name) =>
        name
          .trim()
          .split(/\s+as\s+/)
          .pop()!,
      )
      .filter(isComponentName);
    if (components.length === 0) continue;
    const entry = specifier!.slice(2).replace(/\.js$/, '');
    entries.set(entry, [...(entries.get(entry) ?? []), ...components].sort());
  }
  return entries;
}

/** Every public component module's size, sorted by module path. */
export function measure(distDir: string): SizeReport {
  const report: SizeReport = {};
  for (const [entry, exports] of [...componentEntries(distDir)].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    report[entry] = { exports, gzip: gzipSize(distDir, moduleClosure(distDir, `${entry}.js`)) };
  }
  return report;
}

/** One problem the budget check found. */
export interface BudgetProblem {
  entry: string;
  message: string;
}

/**
 * Compares sizes with their budgets: an entry over its budget by more than the tolerance,
 * an entry without a budget, and a budget for an entry that no longer exists all fail.
 */
export function checkBudgets(report: SizeReport, budgets: SizeBudgets): BudgetProblem[] {
  const problems: BudgetProblem[] = [];
  for (const [entry, { gzip }] of Object.entries(report)) {
    const budget = budgets.budgets[entry];
    if (budget === undefined) {
      problems.push({ entry, message: `${gzip} B gzipped has no budget` });
    } else if (gzip > budget * (1 + budgets.tolerance)) {
      const over = ((gzip / budget - 1) * 100).toFixed(1);
      problems.push({
        entry,
        message: `${gzip} B gzipped is ${over}% over its ${budget} B budget`,
      });
    }
  }
  for (const entry of Object.keys(budgets.budgets)) {
    if (!(entry in report)) problems.push({ entry, message: 'has a budget but no longer exists' });
  }
  return problems;
}

/** Budgets that fit the current sizes, rounded up to the next 50 bytes. */
export function budgetsFor(report: SizeReport, tolerance: number): SizeBudgets {
  return {
    tolerance,
    budgets: Object.fromEntries(
      Object.entries(report).map(([entry, { gzip }]) => [entry, Math.ceil(gzip / 50) * 50]),
    ),
  };
}
