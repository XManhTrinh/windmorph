// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { fabMenuStyles } from './fab-menu-styles';

function* outputs() {
  for (const color of ['primary', 'secondary', 'tertiary'] as const)
    for (const size of ['default', 'medium', 'large'] as const)
      for (const align of ['start', 'center', 'end'] as const) {
        const slots = fabMenuStyles({ color, size, align });
        for (const slot of Object.values(slots)) yield slot();
      }
}

describe('fabMenuStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./fab-menu-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
