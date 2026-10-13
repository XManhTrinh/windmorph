// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { listMediaStyles, listStyles } from './list-styles';

function* outputs() {
  for (const variant of ['standard', 'segmented'] as const)
    for (const interactive of [false, true])
      for (const lines of [1, 2, 3] as const) {
        const slots = listStyles({ variant, interactive, lines });
        for (const slot of Object.values(slots)) yield slot();
      }
  for (const dividers of ['full', 'inset'] as const) yield listStyles({ dividers }).item();
  yield listStyles({ nested: true }).item();
  for (const lines of [1, 2, 3] as const) {
    const slots = listStyles({ headlineLines: lines, supportingTextLines: lines });
    yield slots.headline();
    yield slots.supporting();
  }
  for (const kind of ['image', 'video', 'avatar'] as const)
    for (const size of ['small', 'large'] as const) {
      const slots = listMediaStyles({ kind, size });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('listStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./list-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
