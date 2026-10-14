import { fileURLToPath } from 'node:url';
import { compile } from '@tailwindcss/node';
import { dirname, resolve } from 'node:path';
import { uncompiledClasses as uncompiledClassesIn } from '@windmorph/test-utils/tailwind-classes';

export { collectClasses, nonLiteralClasses } from '@windmorph/test-utils/tailwind-classes';

// Resolved from this file's path: Vite rewrites `new URL(path, import.meta.url)` into a
// served asset URL under jsdom, which `fileURLToPath` rejects.
const STYLES = resolve(dirname(fileURLToPath(import.meta.url)), '../src/styles/styles.css');

/** Classes that Tailwind plus this package's stylesheet do not generate a rule for. */
export const uncompiledClasses = (classes: string[]) => uncompiledClassesIn(classes, [STYLES]);

/** The CSS that Tailwind plus this package's stylesheet generate for the given classes. */
export async function compiledCss(classes: Iterable<string>): Promise<string> {
  const compiler = await compile(`@import 'tailwindcss';\n@import ${JSON.stringify(STYLES)};`, {
    base: dirname(STYLES),
    onDependency: () => {},
  });
  return compiler.build([...classes]);
}
