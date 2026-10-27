import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Colours follow a `ThemeScope` and the mode only through the `--md-sys-color-*` roles.
 * Tailwind's `--color-*` theme variables are resolved once, at `:root`, so a class or style
 * that reads `var(--color-*)` keeps the root theme's colour inside a scope that changes it
 * (2026-10-13: the top app bar's scrolled fill and the slider's handle had done so). Every
 * style recipe, component and stylesheet in the package uses `var(--md-sys-color-*)`, or a
 * colour utility such as `bg-surface`, which Tailwind maps to the scoped role.
 */
const src = dirname(fileURLToPath(import.meta.url));

/** The package's source files, without its tests. */
function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (!/\.(ts|tsx|css)$/.test(entry.name) || /\.test\.tsx?$/.test(entry.name)) return [];
    return [path];
  });
}

describe('theme-scoped colours', () => {
  it('no source file reads a root-only var(--color-*)', () => {
    const hits = sourceFiles(src).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          line.includes('var(--color-') ? [`${relative(src, file)}:${index + 1}`] : [],
        ),
    );
    expect(hits, 'use var(--md-sys-color-*) instead').toEqual([]);
  });
});
