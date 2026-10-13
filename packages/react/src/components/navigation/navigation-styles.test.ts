// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { navItemStyles } from './nav-item-styles';
import { navigationBarStyles, navigationRailStyles } from './navigation-styles';

function* outputs() {
  for (const layout of ['rail-top', 'rail-start', 'bar-top', 'bar-start'] as const)
    for (const enterLabel of [false, true]) {
      const slots = navItemStyles({ layout, enterLabel });
      for (const slot of Object.values(slots)) yield slot();
    }
  for (const expanded of [false, true])
    for (const sheetEntry of ['grow', 'slide'] as const) {
      const slots = navigationRailStyles({ expanded, sheetEntry });
      for (const slot of Object.values(slots)) yield slot();
    }
  for (const arrangement of ['equal', 'centered'] as const) {
    const slots = navigationBarStyles({ arrangement });
    for (const slot of Object.values(slots)) yield slot();
  }
}

describe('navigation styles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./nav-item-styles.ts', import.meta.url),
          new URL('./navigation-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });
});
