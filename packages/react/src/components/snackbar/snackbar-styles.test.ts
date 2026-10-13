// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { snackbarHostStyles, snackbarStyles } from './snackbar-styles';

function* outputs() {
  for (const newLine of [false, true])
    for (const dismissible of [false, true]) {
      const slots = snackbarStyles({ newLine, dismissible });
      for (const slot of Object.values(slots)) yield slot();
    }
  for (const slot of Object.values(snackbarHostStyles())) yield slot();
}

describe('snackbar styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./snackbar-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
