// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { textFieldStyles } from './text-field-styles';

function* outputs() {
  for (const variant of ['filled', 'outlined'] as const)
    for (const hasLabel of [false, true])
      for (const hasLeadingIcon of [false, true])
        for (const hasTrailingIcon of [false, true])
          for (const multiline of [false, true])
            for (const flag of [false, true]) {
              const slots = textFieldStyles({
                variant,
                hasLabel,
                hasLeadingIcon,
                hasTrailingIcon,
                multiline,
                fixedHeight: flag,
                supportingTextOnFocus: flag,
              });
              for (const slot of Object.values(slots)) yield slot();
            }
}

describe('textFieldStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./text-field-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  // M3 motion: opacity changes run on the effects springs (Compose `affixOpacity` uses
  // FastEffects), not Tailwind's default 150ms ease.
  it('fades the prefix and suffix on the fast effects spring', () => {
    const affix = textFieldStyles({ hasLabel: true }).affix();
    expect(affix).toContain(
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
    );
    expect(affix).toContain(
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    );
  });

  // A border is drawn in whole device pixels, so a width on an overshooting spring draws
  // 2 → 1 → 2px as it settles. The outline's width must use a spring that never overshoots.
  it('grows the outline on the fast effects spring, which never overshoots', () => {
    const outline = textFieldStyles({ variant: 'outlined', hasLabel: true }).outline();
    expect(outline).toContain('[transition-property:border-color,border-width]');
    expect(outline).not.toContain('spatial');
    expect(outline).toContain(
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    );
  });
});
