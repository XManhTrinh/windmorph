// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { carouselStyles } from './carousel-styles';

function* outputs() {
  for (const orientation of ['horizontal', 'vertical'] as const)
    for (const snapping of ['single', 'many', 'none'] as const)
      for (const flag of [true, false]) {
        const slots = carouselStyles({
          orientation,
          snapping,
          masked: flag,
          aspect: flag,
          interactive: flag,
          fullBleed: flag,
        });
        for (const slot of Object.values(slots)) yield slot();
      }
}

describe('carouselStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./carousel-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});

describe('carouselStyles overscroll', () => {
  const scroller = (orientation: 'horizontal' | 'vertical', fullBleed: boolean) =>
    carouselStyles({ orientation, fullBleed }).scroller().split(' ');

  it('contains overscroll on the carousel axis only, so a cross swipe scrolls the page', () => {
    expect(scroller('horizontal', false)).toContain('overscroll-x-contain');
    expect(scroller('vertical', false)).toContain('overscroll-y-contain');
    for (const orientation of ['horizontal', 'vertical'] as const)
      for (const fullBleed of [true, false])
        expect(scroller(orientation, fullBleed)).not.toContain('overscroll-contain');
  });

  it('hands a full-screen vertical carousel on to the page past its last item', () => {
    expect(scroller('vertical', true).filter((c) => c.startsWith('overscroll'))).toEqual([]);
  });
});
