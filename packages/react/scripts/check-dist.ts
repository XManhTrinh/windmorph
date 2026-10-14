/**
 * Post-build checks on dist:
 * - every source module marked "use client" keeps the directive in its output,
 * - no output path contains node_modules (npm would drop it when publishing),
 * - every relative import has a file extension (plain Node ESM can load it),
 * - public type declarations do not reference the vendored colour library,
 * - both stylesheets carry the component tokens (`generated/components.css`).
 */
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

async function files(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => `${entry.parentPath}/${entry.name}`.replace(root, ''));
}

const errors: string[] = [];
const sourceFiles = (await files(`${root}src`)).filter((file) => /\.tsx?$/.test(file));
const distFiles = await files(`${root}dist`);

for (const file of sourceFiles) {
  if (file.includes('.test.')) continue;
  const source = await readFile(`${root}${file}`, 'utf8');
  if (!/^['"]use client['"];/.test(source)) continue;
  const output = file.replace(/^src\//, 'dist/').replace(/\.tsx?$/, '.js');
  const built = await readFile(`${root}${output}`, 'utf8').catch(() => null);
  if (built === null) errors.push(`${output} missing for "use client" module ${file}`);
  else if (!built.startsWith('"use client";'))
    errors.push(`${output} lost its "use client" directive`);
}

for (const file of distFiles) {
  if (file.includes('node_modules')) errors.push(`${file} is inside node_modules`);
  if (file.endsWith('.js')) {
    const code = await readFile(`${root}${file}`, 'utf8');
    for (const [, specifier] of code.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)) {
      if (!specifier?.endsWith('.js'))
        errors.push(`${file} imports "${specifier}" without an extension`);
    }
  }
  if (file.endsWith('.d.ts')) {
    const types = await readFile(`${root}${file}`, 'utf8');
    if (/(?:from\s+|import\()['"]@material\/material-color-utilities/.test(types)) {
      errors.push(`${file} references @material/material-color-utilities`);
    }
  }
}

const tailwindEntry = await readFile(`${root}dist/styles/styles.css`, 'utf8');
if (!tailwindEntry.includes("@import './generated/components.css';")) {
  errors.push('dist/styles/styles.css does not import generated/components.css');
}
const componentsCss = await readFile(`${root}dist/styles/generated/components.css`, 'utf8').catch(
  () => null,
);
if (componentsCss === null) {
  errors.push('dist/styles/generated/components.css is missing');
} else {
  const compiled = await readFile(`${root}dist/styles.compiled.css`, 'utf8');
  const variables = [...componentsCss.matchAll(/(--_md-comp-[\w-]+):/g)].map(([, name]) => name!);
  const missing = [...new Set(variables)].filter((name) => !compiled.includes(name));
  if (missing.length > 0) {
    errors.push(`dist/styles.compiled.css lacks component tokens: ${missing.join(', ')}`);
  }
}

if (errors.length > 0) {
  console.error(`dist check failed:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`dist check passed (${distFiles.length} files).`);
