// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { tabsStyles } from './tabs-styles';

function* outputs() {
  for (const variant of ['primary', 'secondary'] as const)
    for (const scrollable of [false, true])
      for (const layout of ['text', 'icon-top', 'icon-start', 'icon-only'] as const) {
        const slots = tabsStyles({ variant, scrollable, layout });
        for (const slot of Object.values(slots)) yield slot();
      }
}

describe('tabsStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./tabs-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
