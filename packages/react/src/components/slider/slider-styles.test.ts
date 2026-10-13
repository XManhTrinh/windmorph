// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { sliderStyles } from './slider-styles';

function* outputs() {
  for (const orientation of ['horizontal', 'vertical'] as const)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const) {
      const slots = sliderStyles({ orientation, size });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('sliderStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./slider-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
