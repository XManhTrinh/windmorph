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
    for (const snapping of ['single', 'none'] as const) {
      const slots = carouselStyles({ orientation, snapping });
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
