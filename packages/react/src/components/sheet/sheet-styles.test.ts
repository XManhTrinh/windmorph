// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { MOTION_SCHEMES, SPRINGS, springPosition } from '../../tokens/motion';
import { bottomSheetStyles, sideSheetStyles } from './sheet-styles';

function* outputs() {
  for (const slot of Object.values(bottomSheetStyles())) yield slot();
  for (const variant of ['modal', 'standard'] as const)
    for (const detached of [false, true]) {
      const slots = sideSheetStyles({ variant, detached });
      for (const slot of Object.values(slots)) yield slot();
    }
}

describe('sheet styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./sheet-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('exits far enough that the fast spatial spring overshoots out of view', () => {
    const exit = 1.12;
    for (const scheme of MOTION_SCHEMES) {
      const spring = SPRINGS[scheme].spatial.fast;
      let peak = 0;
      for (let t = 0; t < 1; t += 0.0005) peak = Math.max(peak, springPosition(spring, t));
      // Springing back from its peak, the sheet's near edge must stay past the window edge.
      expect(exit * (2 - peak)).toBeGreaterThanOrEqual(1);
    }
    const bottom = bottomSheetStyles().motion();
    expect(bottom).toContain('data-exiting:translate-y-[112%]');
    const side = sideSheetStyles().motion();
    expect(side).toContain('data-exiting:translate-x-[112%]');
    expect(side).toContain('rtl:data-exiting:-translate-x-[112%]');
  });

  it('never scrolls side sheet content horizontally', () => {
    expect(sideSheetStyles().content()).toContain('overflow-x-hidden');
  });

  it('caps a side sheet at 400px, even when a consumer widens it', () => {
    expect(sideSheetStyles().panel({ class: 'w-[480px]' })).toContain('max-w-[400px]');
  });
});
