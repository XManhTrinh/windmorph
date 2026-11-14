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
    expect(outline).toContain('[transition-property:border-color,border-width,padding]');
    expect(outline).not.toContain('spatial');
    expect(outline).toContain(
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    );
  });

  // The notch starts 12px from the container's edge, 4px before the label at 16px, whatever
  // the border's width: with 12px inside the border the label sat 2px off-centre in its notch
  // (3px before it and 5px after), and the notch moved 1px each time the field took focus.
  it("takes the outline's border out of its padding, so the notch stays 12px from the edge", () => {
    const outline = textFieldStyles({ variant: 'outlined', hasLabel: true }).outline().split(' ');
    expect(outline).toContain('border');
    expect(outline).toContain('px-[11px]');
    for (const state of ['focus', 'error-focus']) {
      expect(outline).toContain(`group-data-[field-state=${state}]/field:border-2`);
      expect(outline).toContain(`group-data-[field-state=${state}]/field:px-[10px]`);
    }
    expect(outline).not.toContain('px-[12px]');
  });

  // The reduced-motion table: "the border, indicator and notch change at once; colours fade".
  it('changes the outline’s width and padding at once under reduced motion', () => {
    const outline = textFieldStyles({ variant: 'outlined', hasLabel: true }).outline().split(' ');
    expect(outline).toContain(
      'motion-reduce:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),0s,0s]',
    );
  });

  // MDC hides a filled field's floating label below 52px (`$minimum-height-for-filled-label`):
  // at density -2 and -3 it touched the value. The switch is a clamped step of the density.
  it('hides the floated label of a filled field below 52px and centres the value', () => {
    const slots = textFieldStyles({ variant: 'filled', hasLabel: true });
    expect(slots.container()).toContain(
      '[--m3-field-label-room:clamp(0,calc((var(--md-sys-density,0)+1.5)*100),1)]',
    );
    expect(slots.label()).toContain(
      'group-data-floated/field:opacity-[var(--m3-field-label-room)]',
    );
    expect(slots.field()).toContain(
      'pt-[calc(16px+var(--md-sys-density,0)*2px+8px*var(--m3-field-label-room))]',
    );
    // The outlined label sits on the border, so it always has room.
    expect(textFieldStyles({ variant: 'outlined', hasLabel: true }).label()).not.toContain(
      'opacity-[var(--m3-field-label-room)]',
    );
  });

  // A long hint or value was cut off mid-letter; the browser test checks the result.
  it('ends a hint or value longer than the field in an ellipsis', () => {
    expect(textFieldStyles().input().split(' ')).toEqual(
      expect.arrayContaining(['text-ellipsis', 'placeholder:text-ellipsis']),
    );
  });
});
