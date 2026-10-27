// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { radioGroupStyles, radioStyles } from './radio-styles';

function* outputs() {
  yield* Object.values(radioStyles()).map((slot) => slot());
  for (const orientation of ['vertical', 'horizontal'] as const)
    for (const disabled of [false, true])
      yield* Object.values(radioGroupStyles({ orientation, disabled })).map((slot) => slot());
}

describe('radioStyles / radioGroupStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./radio-styles.ts', import.meta.url),
          new URL('../../primitives/selection-control-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
