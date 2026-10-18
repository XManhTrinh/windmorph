import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { compiledCss } from '../../test/tailwind-classes';
import { iconButtonStyles } from '../components/icon-button/icon-button-styles';
import { TouchTarget } from './TouchTarget';

/** `c` as Tailwind writes it in a selector (`h-[48px]` → `h-\[48px\]`). */
const cssEscape = (c: string) => c.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
const regexEscape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The height and width that the rules Tailwind generates for `classes` set (preflight aside). */
async function targetSize(classes: Iterable<string>) {
  const list = [...classes];
  const css = await compiledCss(list);
  const values = (property: string) =>
    list.flatMap((c) => {
      const selector = regexEscape(`.${cssEscape(c)}`);
      const rule = css.match(new RegExp(`${selector}[^{]*\\{([^]*?)\\}`))?.[1] ?? '';
      return [...rule.matchAll(new RegExp(`(?:^|[;{\\s])${property}:\\s*([^;}]+)`, 'g'))].map(
        (match) => match[1]!.trim(),
      );
    });
  return { height: values('height'), width: values('width'), css };
}

describe('TouchTarget', () => {
  it('is hidden from assistive technology and marked for layout checks', () => {
    const { container } = render(<TouchTarget />);
    const target = container.firstElementChild!;
    expect(target).toHaveAttribute('aria-hidden', 'true');
    expect(target).toHaveAttribute('data-touch-target', '');
  });

  // Layout is in px and type in rem (docs/architecture.md, Typography): a target sized in rem
  // grew with a reader's 200% font size and overlapped its neighbours across px gaps.
  it('sizes its 48px target in px, so it ignores the root font size', async () => {
    const { container } = render(<TouchTarget />);
    const { height, width } = await targetSize(container.firstElementChild!.classList);
    expect(height).toEqual(['48px']);
    expect(width).toEqual(['max(100%, 48px)']);
  });

  it("matches the M icon button's ::after target, also in px", async () => {
    const classes = iconButtonStyles({ size: 'md' })
      .content()
      .split(/\s+/)
      .filter((c) => /^after:[hw]-/.test(c));
    const { height, width } = await targetSize(classes);
    expect(height).toEqual(['48px']);
    expect(width).toEqual(['max(100%, 48px)']);
  });
});
