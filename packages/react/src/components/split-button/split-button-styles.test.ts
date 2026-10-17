// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { splitButtonStyles } from './split-button-styles';

function* outputs() {
  for (const variant of ['filled', 'elevated', 'tonal', 'outlined'] as const)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const slots = splitButtonStyles({ variant, size });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('splitButtonStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./split-button-styles.ts', import.meta.url),
          new URL('../button/button-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
