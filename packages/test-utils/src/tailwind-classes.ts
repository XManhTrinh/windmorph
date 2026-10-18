import { compile } from '@tailwindcss/node';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Splits slot outputs into individual classes. */
export function collectClasses(outputs: Iterable<string | undefined>): string[] {
  const classes = new Set<string>();
  for (const output of outputs) {
    if (typeof output !== 'string') continue;
    for (const c of output.split(/\s+/)) if (c) classes.add(c);
  }
  return [...classes];
}

/**
 * Classes that do not appear literally in any of the source files (Tailwind would never
 * see them). Pass every file the recipe draws classes from, including `extend`ed bases.
 */
export async function nonLiteralClasses(
  sourceUrls: URL | URL[],
  classes: string[],
): Promise<string[]> {
  const urls = Array.isArray(sourceUrls) ? sourceUrls : [sourceUrls];
  const sources = await Promise.all(urls.map((url) => readFile(fileURLToPath(url), 'utf8')));
  return classes.filter((c) => !sources.some((source) => source.includes(c)));
}

/**
 * Classes that Tailwind plus the given stylesheets (absolute paths, in import order) do not
 * generate a rule for. Named group and peer markers (`group/control`) have no rule of their
 * own: other recipes' variants select them, so they are skipped.
 */
export async function uncompiledClasses(
  classes: string[],
  stylesheets: readonly [string, ...string[]],
): Promise<string[]> {
  const imports = stylesheets.map((path) => `@import ${JSON.stringify(path)};`).join('\n');
  const compiler = await compile(`@import 'tailwindcss';\n${imports}`, {
    base: dirname(stylesheets[0]),
    onDependency: () => {},
  });
  const css = compiler.build(classes);
  const escape = (c: string) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
  return classes.filter((c) => !/^(group|peer)\/[\w-]+$/.test(c) && !css.includes(`.${escape(c)}`));
}
