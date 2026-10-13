// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { buttonStyles } from './button-styles';

function* outputs() {
  for (const variant of ['filled', 'elevated', 'tonal', 'outlined', 'text'] as const)
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl'] as const)
      for (const shape of ['round', 'square'] as const)
        for (const toggle of [false, true])
          for (const hasLeadingIcon of [false, true])
            for (const connected of ['none', 'leading', 'middle', 'trailing'] as const) {
              const slots = buttonStyles({
                variant,
                size,
                shape,
                toggle,
                hasLeadingIcon,
                connected,
              });
              yield* [slots.root(), slots.content(), slots.label(), slots.icon()];
            }
}

describe('buttonStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./button-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
