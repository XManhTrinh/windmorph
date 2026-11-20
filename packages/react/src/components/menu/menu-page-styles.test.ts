// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  collectClasses,
  compiledCss,
  nonLiteralClasses,
  uncompiledClasses,
} from '../../../test/tailwind-classes';
import { menuPageStyles } from './menu-page-styles';
import { menuPageStack } from './menu-styles';

const outputs = [false, true].flatMap((instant) =>
  Object.values(menuPageStyles({ instant })).map((slot) => slot()),
);

describe('menuPageStyles', () => {
  const classes = collectClasses(outputs);

  it('writes every class literally so Tailwind can find it', async () => {
    expect(
      await nonLiteralClasses(
        [
          new URL('./menu-page-styles.ts', import.meta.url),
          new URL('./menu-styles.ts', import.meta.url),
        ],
        classes,
      ),
    ).toEqual([]);
  });

  it('only uses classes that Tailwind and the M3 stylesheet generate', async () => {
    expect(await uncompiledClasses(classes)).toEqual([]);
  });

  // Pages shown in place come in only once a page has changed (the first page opens with the
  // menu's reveal), and with `slide` from the end edge going forward and the start edge going
  // back, swapped in right to left (`submenuTransition`).
  it('brings a page in after a page change, sliding from the reading direction', async () => {
    const styles = menuPageStyles();
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
    // The popover's pages stack as the sheet's do, and the sheet's container tells its pages
    // the same direction.
    for (const rule of menuPageStack) expect(styles.pages().split(' ')).toContain(rule);
    for (const part of styles
      .pages()
      .split(' ')
      .filter((c) => c.includes('page-'))) {
      expect(styles.sheetPages().split(' ')).toContain(part);
    }
    // `instant` changes pages with no motion.
    expect(menuPageStyles({ instant: true }).panel().split(' ')).toContain(
      '[transition-property:none]',
    );
    expect(menuPageStyles({ instant: true }).page().split(' ')).toContain(
      '[transition-property:none]',
    );
  });
});
