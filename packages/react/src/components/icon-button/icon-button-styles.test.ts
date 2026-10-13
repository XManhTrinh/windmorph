// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { iconButtonStyles } from './icon-button-styles';

function* outputs() {
  for (const variant of ['standard', 'filled', 'tonal', 'outlined'] as const)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const)
      for (const width of ['narrow', 'default', 'wide'] as const)
        for (const shape of ['round', 'square'] as const)
          for (const toggle of [false, true])
            for (const connected of ['none', 'leading', 'middle', 'trailing'] as const) {
              const slots = iconButtonStyles({ variant, size, width, shape, toggle, connected });
              yield* [slots.root(), slots.content(), slots.icon()];
            }
}

describe('iconButtonStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./icon-button-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
