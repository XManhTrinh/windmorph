import { render, screen } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeScope } from '../theme/ThemeScope';
import { Overlay } from './Overlay';

describe('Overlay', () => {
  it('portals to body and keeps the theme of where it was rendered', () => {
    render(
      <ThemeScope theme="forest" mode="dark" contrast="high" motion="standard" data-testid="scope">
        <Overlay>
          <div>Menu</div>
        </Overlay>
      </ThemeScope>,
    );
    const content = screen.getByText('Menu');
    expect(screen.getByTestId('scope')).not.toContainElement(content);
    const wrapper = content.closest('[data-overlay-scope]');
    expect(wrapper?.parentElement).toBe(document.body);
    expect(wrapper).toHaveAttribute('data-theme', 'forest');
    expect(wrapper).toHaveAttribute('data-mode', 'dark');
    expect(wrapper).toHaveAttribute('data-contrast', 'high');
    expect(wrapper).toHaveAttribute('data-motion', 'standard');
    expect(wrapper).toHaveStyle({ display: 'contents' });
  });

  it('keeps the text direction of where it was rendered', () => {
    render(
      <div dir="rtl">
        <Overlay>
          <div>Menu</div>
        </Overlay>
      </div>,
    );
    const wrapper = screen.getByText('Menu').closest('[data-overlay-scope]');
    expect(wrapper?.parentElement).toBe(document.body);
    expect(wrapper).toHaveAttribute('dir', 'rtl');
  });

  it("has the direction before the content's layout effects run, without resolving styles", () => {
    // jsdom has neither `CSS.supports` nor `:dir()`; stand in for a browser's.
    vi.stubGlobal('CSS', { supports: () => true, escape: (value: string) => value });
    const matches = vi.spyOn(Element.prototype, 'matches').mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ':dir(rtl)' && this.closest('[dir="rtl"]') !== null;
    });
    const seen: (string | undefined)[] = [];
    function Content() {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        seen.push(ref.current?.closest<HTMLElement>('[data-overlay-scope]')?.dir);
      }, []);
      return <div ref={ref}>Menu</div>;
    }
    try {
      render(
        <div dir="rtl">
          <Overlay>
            <Content />
          </Overlay>
        </div>,
      );
      expect(seen).toEqual(['rtl']);
    } finally {
      matches.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('marks a top-layer overlay so a modal underneath keeps it visible', () => {
    const { rerender } = render(
      <Overlay>
        <div>Menu</div>
      </Overlay>,
    );
    const wrapper = () => screen.getByText('Menu').closest('[data-overlay-scope]');
    expect(wrapper()).not.toHaveAttribute('data-react-aria-top-layer');
    rerender(
      <Overlay topLayer>
        <div>Menu</div>
      </Overlay>,
    );
    expect(wrapper()).toHaveAttribute('data-react-aria-top-layer');
  });
});
