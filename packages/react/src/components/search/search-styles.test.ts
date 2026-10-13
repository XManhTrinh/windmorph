// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { searchAppBarStyles, searchBarStyles } from './search-styles';

function* outputs() {
  for (const inAppBar of [false, true])
    for (const hasLeading of [false, true])
      for (const hasTrailing of [false, true])
        for (const tone of ['default', 'scrolled', 'transparent'] as const) {
          const slots = searchBarStyles({ inAppBar, hasLeading, hasTrailing, tone });
          for (const slot of Object.values(slots)) yield slot();
        }
  for (const scrolling of [false, true]) {
    const slots = searchAppBarStyles({ scrolling });
    for (const slot of Object.values(slots)) yield slot();
  }
}

describe('search styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./search-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
