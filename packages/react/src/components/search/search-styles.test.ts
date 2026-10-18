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
        for (const tone of ['default', 'appBar', 'scrolled'] as const)
          for (const textAlign of ['start', 'center'] as const) {
            const slots = searchBarStyles({ inAppBar, hasLeading, hasTrailing, tone, textAlign });
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

  // Forced colours drop backgrounds, so the pill and the docked dropdown need a
  // system-colour edge (WCAG 1.4.11).
  it('draws the pill and the docked dropdown with a system-colour edge in forced colours', () => {
    const styles = searchBarStyles();
    for (const slot of [styles.field(), styles.dropdown()]) {
      expect(slot.split(' ')).toEqual(
        expect.arrayContaining(['forced-colors:border', 'forced-colors:border-[CanvasText]']),
      );
    }
  });

  // The app bar's slots pass their colour to icon buttons; the search slots didn't, so the
  // full-screen Back button was `on-surface-variant` and ignored the icon colour tokens.
  it('passes the slot colour to icon buttons in the leading and trailing slots', () => {
    const styles = searchBarStyles({ hasLeading: true, hasTrailing: true });
    for (const slot of [styles.leading(), styles.trailing()]) {
      expect(slot.split(' ')).toContain('[--md-comp-icon-button-icon-color:currentColor]');
    }
  });

  // Two 40px trailing buttons: their 48px targets meet edge to edge inside the slot.
  it('spaces two trailing buttons so their targets never overlap', () => {
    expect(searchBarStyles().trailing().split(' ')).toEqual(
      expect.arrayContaining(['gap-[8px]', 'px-[4px]']),
    );
  });
});
