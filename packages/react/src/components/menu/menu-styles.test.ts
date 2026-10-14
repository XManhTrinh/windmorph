// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { menuStyles, persistentScrollbar } from './menu-styles';

const POSITIONS = ['only', 'first', 'middle', 'last'] as const;
const CORNERS = ['nested', 'outer', 'plain'] as const;

function* outputs() {
  for (const variant of ['standard', 'vibrant'] as const)
    for (const layout of ['gap', 'divider'] as const)
      for (const morph of [false, true])
        for (const groupPosition of POSITIONS)
          for (const itemTop of CORNERS)
            for (const itemBottom of CORNERS)
              for (const hasDescription of [false, true])
                yield* Object.values(
                  menuStyles({
                    variant,
                    layout,
                    morph,
                    groupPosition,
                    itemTop,
                    itemBottom,
                    hasDescription,
                  }),
                ).map((slot) => slot());
}

describe('menuStyles', () => {
  const classes = collectClasses(outputs());

  it('writes every class literally so Tailwind can find it', async () => {
    expect(await nonLiteralClasses(new URL('./menu-styles.ts', import.meta.url), classes)).toEqual(
      [],
    );
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  it('sizes items from the Menu token files: body-large, 16px sides, a 12px icon gap', () => {
    const styles = menuStyles();
    const item = styles.item().split(' ');
    expect(item).toContain('px-[16px]');
    expect(item).toContain('text-body-large');
    expect(item).not.toContain('text-label-large');
    expect(styles.icon().split(' ')).toContain('me-[12px]');
    // Trailing text (the shortcut) is label-small.
    expect(styles.trailing().split(' ')).toContain('text-label-small');
  });

  it('gives a scrolling menu the persistent scrollbar (M3)', () => {
    for (const layout of ['gap', 'divider'] as const) {
      const menu = menuStyles({ layout }).menu();
      for (const part of persistentScrollbar) expect(menu).toContain(part);
    }
  });
});
