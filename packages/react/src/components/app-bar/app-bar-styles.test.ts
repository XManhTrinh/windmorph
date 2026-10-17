// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { topAppBarStyles } from './app-bar-styles';
import { appBarTokenSet } from './app-bar-tokens';

function* outputs() {
  for (const variant of ['small', 'medium', 'large'] as const)
    for (const titleAlign of ['start', 'center'] as const)
      for (const hasNavigation of [false, true])
        for (const hasSubtitle of [false, true])
          for (const scrolling of [false, true])
            for (const pinned of [false, true])
              for (const twoRows of [false, true])
                for (const scrolledColor of ['container', 'transparent'] as const) {
                  const slots = topAppBarStyles({
                    variant,
                    titleAlign,
                    hasNavigation,
                    hasSubtitle,
                    scrolling,
                    pinned,
                    twoRows,
                    scrolledColor,
                  });
                  for (const slot of Object.values(slots)) yield slot();
                }
}

describe('topAppBarStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(new URL('./app-bar-styles.ts', import.meta.url), classes),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('reads the surface roles where the bar is, so a theme scope or dark mode applies', () => {
    // The blend of the container tokens is worked out on the bar's own element.
    const { root, row } = topAppBarStyles({ variant: 'medium', twoRows: true });
    for (const slot of [root(), row()]) {
      expect(slot).toContain('bg-[var(--_md-comp-app-bar-container-color-blend)]');
      expect(slot).not.toContain('var(--color-');
    }
    expect(appBarTokenSet.derived?.['container-color-blend']).toContain(
      'var(--_md-comp-app-bar-on-scroll-container-color)',
    );
    expect(appBarTokenSet.tokens['on-scroll-container-color'].value).toBe(
      'var(--md-sys-color-surface-container)',
    );
    expect(appBarTokenSet.tokens['container-color'].value).toBe('var(--md-sys-color-surface)');
  });
});
