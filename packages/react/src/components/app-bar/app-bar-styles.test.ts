// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { topAppBarStyles } from './app-bar-styles';

function* outputs() {
  for (const variant of ['small', 'medium', 'large'] as const)
    for (const titleAlign of ['start', 'center'] as const)
      for (const hasNavigation of [false, true])
        for (const hasSubtitle of [false, true])
          for (const scrolling of [false, true])
            for (const twoRows of [false, true]) {
              const slots = topAppBarStyles({
                variant,
                titleAlign,
                hasNavigation,
                hasSubtitle,
                scrolling,
                twoRows,
              });
              for (const slot of Object.values(slots)) yield slot();
            }
}

describe('topAppBarStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./app-bar-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
