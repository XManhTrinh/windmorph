// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { chipSetStyles, chipStyles } from './chip-styles';

function* outputs() {
  for (const kind of ['assist', 'suggestion', 'filter', 'input'] as const)
    for (const split of ['none', 'two', 'removeOnly'] as const)
      for (const elevated of [false, true])
        for (const outline of ['standard', 'strong'] as const)
          for (const leading of ['none', 'icon', 'avatar'] as const)
            for (const trailing of [false, true]) {
              const slots = chipStyles({ kind, split, elevated, outline, leading, trailing });
              for (const slot of Object.values(slots)) yield slot();
            }
  for (const layout of ['wrap', 'scroll'] as const) yield chipSetStyles({ layout }).root();
}

describe('chipStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./chip-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it("raises a two-part chip from its buttons' hover, never while one is pressed or focused", () => {
    const flat = chipStyles({ kind: 'filter', split: 'two', trailing: true }).root().split(' ');
    expect(flat).toContain(
      'data-selected:has-data-hovered:not-has-data-pressed:not-has-data-focus-visible:not-data-dragged:shadow-elevation-1',
    );
    const elevated = chipStyles({ kind: 'filter', split: 'two', elevated: true, trailing: true })
      .root()
      .split(' ');
    expect(elevated).toContain(
      'has-data-hovered:not-has-data-pressed:not-has-data-focus-visible:not-data-dragged:shadow-elevation-2',
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
