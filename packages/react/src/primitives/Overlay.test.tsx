import { render, screen } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeScope } from '../theme/ThemeScope';
import { Overlay } from './Overlay';

describe('Overlay', () => {
  it('portals to body and keeps the theme of where it was rendered', () => {
    render(
      <ThemeScope
        theme="forest"
        mode="dark"
        contrast="high"
        motion="standard"
        density={-2}
        data-testid="scope"
      >
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
    expect(wrapper).toHaveAttribute('data-density', '-2');
    expect(wrapper).toHaveStyle({ display: 'contents' });
  });

  it("takes its component's own density over the scope's", () => {
    render(
      <ThemeScope density={-1}>
        <Overlay density={-3}>
          <div>Menu</div>
        </Overlay>
      </ThemeScope>,
    );
    const wrapper = screen.getByText('Menu').closest('[data-overlay-scope]');
    expect(wrapper).toHaveAttribute('data-density', '-3');
  });

  it("puts the enclosing ThemeScopes' classes on its wrapper, so their variables reach it", () => {
    render(
      <ThemeScope className="brand-a p-4">
        <ThemeScope className="brand-b p-2">
          <Overlay>
            <div>Menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeScope>,
    );
    const wrapper = screen.getByText('Menu').closest('[data-overlay-scope]');
    expect(wrapper?.parentElement).toBe(document.body);
    // Merged outermost first with cn(), so the inner scope's conflicting class wins.
    expect(wrapper).toHaveClass('brand-a', 'brand-b', 'p-2');
    expect(wrapper).not.toHaveClass('p-4', 'text-on-surface');
  });

  it('has no class outside a ThemeScope', () => {
    render(
      <Overlay>
        <div>Menu</div>
      </Overlay>,
    );
    expect(screen.getByText('Menu').closest('[data-overlay-scope]')).not.toHaveAttribute('class');
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
