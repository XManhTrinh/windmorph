// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { extendedFabStyles, fabStyles } from './fab-styles';

const COLORS = [
  'primary-container',
  'secondary-container',
  'tertiary-container',
  'primary',
  'secondary',
  'tertiary',
] as const;

function* outputs() {
  for (const color of COLORS)
    for (const lowered of [false, true]) {
      for (const size of ['default', 'medium', 'large'] as const) {
        const slots = fabStyles({ color, lowered, size });
        yield* [slots.root(), slots.icon()];
      }
      for (const size of ['sm', 'md', 'lg'] as const)
        for (const hasIcon of [false, true]) {
          const slots = extendedFabStyles({ color, lowered, size, hasIcon });
          yield* [
            slots.root(),
            slots.content(),
            slots.icon(),
            slots.collapse(),
            slots.label(),
            slots.text(),
          ];
        }
    }
}

describe('fabStyles / extendedFabStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./fab-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
