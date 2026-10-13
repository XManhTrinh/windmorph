// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { menuStyles } from './menu-styles';

const POSITIONS = ['only', 'first', 'middle', 'last'] as const;
const CORNERS = ['nested', 'plain'] as const;

function* outputs() {
  for (const variant of ['standard', 'vibrant'] as const)
    for (const groupPosition of POSITIONS)
      for (const itemTop of CORNERS)
        for (const itemBottom of CORNERS)
          for (const hasDescription of [false, true])
            yield* Object.values(
              menuStyles({ variant, groupPosition, itemTop, itemBottom, hasDescription }),
            ).map((slot) => slot());
}

describe('menuStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./menu-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
