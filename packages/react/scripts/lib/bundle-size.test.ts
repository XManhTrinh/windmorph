import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  budgetsFor,
  checkBudgets,
  componentEntries,
  gzipSize,
  measure,
  moduleClosure,
} from './bundle-size';

let dist: string;

function write(file: string, code: string) {
  mkdirSync(dirname(join(dist, file)), { recursive: true });
  writeFileSync(join(dist, file), code);
}

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'bundle-size-'));
  write(
    'index.js',
    [
      'import { cn } from "./utils/cn.js";',
      'import { Button } from "./components/button/Button.js";',
      'import { ButtonContext } from "./components/button/ButtonContext.js";',
      'import { Dialog, DialogTrigger, dialogStyles } from "./components/dialog/Dialog.js";',
      'export { Button, ButtonContext, Dialog, DialogTrigger, cn, dialogStyles };',
    ].join('\n'),
  );
  write('utils/cn.js', 'import { clsx } from "clsx";\nexport const cn = clsx;');
  write(
    'components/button/Button.js',
    'import { cn } from "../../utils/cn.js";\nimport { ButtonContext } from "./ButtonContext.js";\nimport { jsx } from "react/jsx-runtime";\nexport function Button() {}',
  );
  write('components/button/ButtonContext.js', 'export const ButtonContext = {};');
  write(
    'components/dialog/Dialog.js',
    'import { cn } from "../../utils/cn.js";\nexport function Dialog() {}\nexport function DialogTrigger() {}\nexport const dialogStyles = {};',
  );
});

afterAll(() => rmSync(dist, { recursive: true, force: true }));

describe('bundle size', () => {
  it('finds the component modules the main entry imports components from', () => {
    expect([...componentEntries(dist)]).toEqual([
      ['components/button/Button', ['Button']],
      ['components/dialog/Dialog', ['Dialog', 'DialogTrigger']],
    ]);
  });

  it("follows a module's library imports and leaves dependencies out", () => {
    expect(moduleClosure(dist, 'components/button/Button.js')).toEqual([
      'components/button/Button.js',
      'components/button/ButtonContext.js',
      'utils/cn.js',
    ]);
  });

  it('measures each component with what it imports', () => {
    const report = measure(dist);
    expect(report['components/button/Button']?.gzip).toBe(
      gzipSize(dist, moduleClosure(dist, 'components/button/Button.js')),
    );
    expect(report['components/button/Button']?.gzip).toBeGreaterThan(
      gzipSize(dist, ['components/button/Button.js']),
    );
  });

  it('passes within the tolerance and fails past it, without a budget or for a removed module', () => {
    const report = {
      'components/button/Button': { exports: ['Button'], gzip: 1010 },
      'components/fab/Fab': { exports: ['Fab'], gzip: 500 },
    };
    expect(
      checkBudgets(report, {
        tolerance: 0.02,
        budgets: { 'components/button/Button': 1000, 'components/fab/Fab': 500 },
      }),
    ).toEqual([]);
    expect(
      checkBudgets(report, {
        tolerance: 0.02,
        budgets: { 'components/button/Button': 900, 'components/menu/Menu': 100 },
      }).map(({ entry }) => entry),
    ).toEqual(['components/button/Button', 'components/fab/Fab', 'components/menu/Menu']);
  });

  it('writes budgets rounded up to the next 50 bytes', () => {
    expect(
      budgetsFor({ 'components/button/Button': { exports: ['Button'], gzip: 1001 } }, 0.02),
    ).toEqual({ tolerance: 0.02, budgets: { 'components/button/Button': 1050 } });
  });
});
