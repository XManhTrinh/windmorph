// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { cardStyles } from './card-styles';

function* outputs() {
  for (const variant of ['filled', 'elevated', 'outlined'] as const)
    for (const interactive of [false, true]) yield cardStyles({ variant, interactive });
}

describe('cardStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./card-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
