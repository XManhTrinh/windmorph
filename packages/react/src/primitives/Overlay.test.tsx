import { render, screen } from '@testing-library/react';
import { useLayoutEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '../theme/ThemeProvider';
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

  it("carries only what differs from <html>, so an app's :root values reach it", () => {
    render(
      <ThemeProvider defaultTheme="ocean" defaultMotion="standard" storage="none">
        <Overlay>
          <div>Page menu</div>
        </Overlay>
        <ThemeScope density={-2}>
          <Overlay>
            <div>Dense menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'ocean');
    const page = screen.getByText('Page menu').closest('[data-overlay-scope]')!;
    for (const name of [
      'data-theme',
      'data-mode',
      'data-contrast',
      'data-motion',
      'data-density',
    ]) {
      expect(page).not.toHaveAttribute(name);
    }
    const dense = screen.getByText('Dense menu').closest('[data-overlay-scope]')!;
    expect(dense).toHaveAttribute('data-density', '-2');
    expect(dense).not.toHaveAttribute('data-theme');
    expect(dense).not.toHaveAttribute('data-motion');
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

  it("sets the enclosing ThemeScopes' inline CSS variables on its wrapper", () => {
    render(
      <ThemeScope style={{ '--md-comp-menu-container-color': 'red', padding: 4 } as object}>
        <ThemeScope style={{ '--md-comp-menu-container-color': 'blue', '--x': '1' } as object}>
          <Overlay>
            <div>Menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeScope>,
    );
    const wrapper = screen.getByText('Menu').closest<HTMLElement>('[data-overlay-scope]');
    // The inner scope wins; only variables travel, not the scope's own layout styles.
    expect(wrapper?.style.getPropertyValue('--md-comp-menu-container-color')).toBe('blue');
    expect(wrapper?.style.getPropertyValue('--x')).toBe('1');
    expect(wrapper?.style.padding).toBe('');
    expect(wrapper).toHaveStyle({ display: 'contents' });
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
