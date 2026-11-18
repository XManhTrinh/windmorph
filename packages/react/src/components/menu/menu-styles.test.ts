// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  compiledCss,
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

  // Forced colours drop backgrounds and shadows, so a menu needs a system-colour edge
  // (WCAG 1.4.11): on the one surface (divider), on each group (gap), never in a sheet.
  it('outlines every menu surface in forced colours, but not inside a sheet', () => {
    const edge = 'forced-colors:outline-solid';
    expect(menuStyles({ layout: 'divider' }).menu().split(' ')).toContain(edge);
    expect(menuStyles({ layout: 'divider' }).group().split(' ')).not.toContain(edge);
    expect(menuStyles({ layout: 'gap' }).group().split(' ')).toContain(edge);
    expect(menuStyles({ layout: 'gap' }).group().split(' ')).toContain(
      'forced-colors:outline-[CanvasText]',
    );
    expect(menuStyles({ layout: 'divider', embedded: true }).menu().split(' ')).toContain(
      'forced-colors:outline-none',
    );
  });

  // Pages shown in place come in only once a page has changed (the first page opens with the
  // menu's reveal), and with `slide` from the end edge going forward and the start edge going
  // back, swapped in right to left (`submenuTransition`).
  it('brings a page in after a page change, sliding from the reading direction', async () => {
    const styles = menuStyles();
    const css = (
      await compiledCss([...styles.page().split(' '), ...styles.pages().split(' ')])
    ).replace(/\s+/g, ' ');
    expect(css).toMatch(
      /@starting-style \{ \[data-page-direction\] \S+ \{ translate: calc\(var\(--m3-menu-page-x,0px\) \* var\(--m3-menu-page-sign,1\)\) 0;/,
    );
    expect(css).toMatch(/\[data-page-direction\] \S+starting\\:opacity-0 \{ opacity: 0%;/);
    expect(css).toContain(
      '[data-page-transition="slide"][data-page-direction="forward"] { --m3-menu-page-x: 30px; }',
    );
    expect(css).toContain(
      '[data-page-transition="slide"][data-page-direction="back"] { --m3-menu-page-x: -30px; }',
    );
    expect(css).toContain(
      ':where(:dir(rtl), [dir="rtl"], [dir="rtl"] *) { --m3-menu-page-sign: -1; }',
    );
    // The sheet's container tells its pages the same.
    for (const part of styles
      .pages()
      .split(' ')
      .filter((c) => c.includes('page-'))) {
      expect(styles.sheetContent().split(' ')).toContain(part);
    }
    // `instant` changes pages with no motion.
    expect(menuStyles({ instant: true }).sheetPanel().split(' ')).toContain(
      '[transition-property:none]',
    );
    expect(menuStyles({ instant: true }).page().split(' ')).toContain('[transition-property:none]');
  });

  // Group headings line up with the item labels: both 16px inside the group's padding.
  it('starts group headings 16px in, level with the item labels', () => {
    const styles = menuStyles();
    expect(styles.group().split(' ')).toContain('p-[4px]');
    expect(styles.heading().split(' ')).toContain('ps-[16px]');
    expect(styles.item().split(' ')).toContain('px-[16px]');
  });

  // An app that sets the selected colours gets every part of a selected item in them.
  it("paints a selected item's tick, icons and description with its label's token", () => {
    const token =
      'group-data-selected/item:text-[color:var(--_md-comp-menus-menu-item-selected-label-text-color)]';
    for (const variant of ['standard', 'vibrant'] as const) {
      const styles = menuStyles({ variant });
      for (const slot of [styles.icon(), styles.description(), styles.trailing()]) {
        expect(slot.split(' '), variant).toContain(token);
        // No fixed role is left for the selected state.
        expect(slot, variant).not.toMatch(/group-data-selected\/item:(\S+:)?text-on-tertiary/);
      }
    }
  });
});
