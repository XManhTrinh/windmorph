// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { chipStyles } from './chip-styles';

function* outputs() {
  for (const kind of ['assist', 'suggestion', 'filter', 'input'] as const)
    for (const elevated of [false, true])
      for (const leading of ['none', 'icon', 'avatar'] as const)
        for (const trailing of [false, true]) {
          const slots = chipStyles({ kind, elevated, leading, trailing });
          for (const slot of Object.values(slots)) yield slot();
        }
}

describe('chipStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./chip-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
