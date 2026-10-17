/**
 * Copies the Tailwind stylesheet into dist and builds the precompiled stylesheet for
 * projects that do not use Tailwind.
 */
import { execFileSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

await cp(`${root}src/styles`, `${root}dist/styles`, {
  recursive: true,
  filter: (source) => !source.endsWith('compiled.css') && !source.endsWith('.gitignore'),
});

execFileSync(
  'tailwindcss',
  ['-i', 'src/styles/compiled.css', '-o', 'dist/styles.compiled.css', '--minify'],
  { cwd: root, stdio: 'inherit' },
);
