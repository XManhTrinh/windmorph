// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { dialogStyles } from './dialog-styles';

describe('dialogStyles', () => {
  const placements = ['center', 'top', 'bottom', 'start', 'end'] as const;
  const classes = collectClasses(
    [false, true].flatMap((flag) =>
      (['never', 'always', 'compact'] as const).flatMap((fullScreen) =>
        placements.flatMap((placement) =>
          Object.values(
            dialogStyles({
              hasIcon: flag,
              fullScreen,
              placement,
              bottomBar: flag,
              divider: flag,
              dividers: flag,
              origin: flag,
              instant: flag,
              transition: flag ? 'scale' : 'reveal',
            }),
          ).map((slot) => slot()),
        ),
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
