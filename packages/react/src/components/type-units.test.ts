// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/*
 * Text goes through the type roles (`text-<role>`, `typescale()`), which are in rem so they
 * follow the reader's browser font size. A px font size, line height or tracking in a
 * component would ignore that setting (WCAG 1.4.4).
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const SOURCE = /\.tsx?$/;
// Zero sizes nothing (a pending button's hidden name suffix takes no room with it).
const PX_TEXT = [
  /\b(?:text|leading|tracking)-\[-?[\d.]+px\]/,
  /\bfont-?size\s*:\s*['"]?-?(?!0(?:px)?(?![\d.]))[\d.]+(?:px)?\b/i,
  /\b(?:fontSize|lineHeight|letterSpacing)\s*[:=]\s*\{?\s*['"]?-?(?!0(?:px)?(?![\d.]))[\d.]+/,
  /\[(?:font-size|line-height|letter-spacing):-?[\d.]+px\]/,
];

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return SOURCE.test(entry.name) && !entry.name.includes('.test.') ? [path] : [];
  });
}

describe('type units', () => {
  it('no component, composite or primitive sets text in px', () => {
    const found = ['components', 'composites', 'primitives'].flatMap((folder) =>
      sources(join(root, folder)).flatMap((file) =>
        readFileSync(file, 'utf8')
          .split('\n')
          .flatMap((line, index) =>
            PX_TEXT.some((pattern) => pattern.test(line))
              ? [`${file.slice(root.length)}:${index + 1}: ${line.trim()}`]
              : [],
          ),
      ),
    );
    expect(found).toEqual([]);
  });
});
