// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { bottomSheetStyles, sideSheetStyles } from './sheet-styles';

function* outputs() {
  for (const slot of Object.values(bottomSheetStyles())) yield slot();
  for (const variant of ['modal', 'standard'] as const)
    for (const detached of [false, true]) {
      const slots = sideSheetStyles({ variant, detached });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('sheet styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./sheet-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
