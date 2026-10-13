// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import {
  dockedToolbarStyles,
  floatingToolbarStyles,
  toolbarCollapseAnchor,
  toolbarFabStyles,
} from './toolbar-styles';

function* outputs() {
  for (const arrangement of ['space-between', 'centered'] as const)
    yield dockedToolbarStyles({ arrangement }).root();
  for (const orientation of ['horizontal', 'vertical'] as const) {
    for (const color of ['standard', 'vibrant'] as const)
      for (const hasFab of [false, true])
        for (const fabAt of ['start', 'end'] as const) {
          const slots = floatingToolbarStyles({ orientation, color, hasFab, fabAt });
          for (const slot of Object.values(slots)) yield slot();
        }
    for (const slot of ['leading', 'trailing'] as const)
      yield toolbarCollapseAnchor({ slot, orientation });
  }
  for (const color of ['standard', 'vibrant'] as const) {
    const slots = toolbarFabStyles({ color });
    yield* [slots.root(), slots.icon()];
  }
}

describe('toolbar styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./toolbar-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  // The spatial spring overshoots; a size shrinking to 0 would bounce back open by a pixel.
  it('collapses on the effects spring, which does not overshoot', () => {
    for (const hasFab of [false, true]) {
      const slots = floatingToolbarStyles({ hasFab });
      for (const slot of [slots.collapse(), slots.surface()]) {
        expect(slot).toMatch(
          /data-collapsed:\[transition-timing-function:var\(--md-sys-motion-spring-effects-fast-easing\)/,
        );
      }
    }
  });

  it('fades the surface out as it collapses, so no thin line is left at the end', () => {
    const surface = floatingToolbarStyles({ hasFab: true }).surface();
    expect(surface).toContain('data-collapsed:opacity-0');
    expect(surface).toMatch(/\[transition-property:[^\]]*opacity\]/);
  });
});
