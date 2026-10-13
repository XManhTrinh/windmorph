// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { dialogStyles } from './dialog-styles';

describe('dialogStyles', () => {
  const classes = collectClasses(
    [false, true].flatMap((hasIcon) =>
      (['never', 'always', 'compact'] as const).flatMap((fullScreen) =>
        Object.values(dialogStyles({ hasIcon, fullScreen })).map((slot) => slot()),
      ),
    ),
  );

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./dialog-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
