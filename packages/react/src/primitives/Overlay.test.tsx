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

  it("re-resolves the theme on each scope layer that restyles it (a scope's shadow colour)", () => {
    render(
      <ThemeProvider storage="none">
        <ThemeScope className="brand-shadow">
          <Overlay>
            <div>Dialog</div>
          </Overlay>
        </ThemeScope>
        <ThemeScope data-testid="restyled" className="brand-shadow" />
      </ThemeProvider>,
    );
    // A class may set a colour role, so the elevation, declared on [data-theme], resolves again.
    expect(screen.getByTestId('restyled')).toHaveAttribute('data-theme', 'baseline');
    const wrapper = screen.getByText('Dialog').closest('[data-overlay-scope]');
    expect(wrapper).toHaveClass('brand-shadow');
    expect(wrapper).toHaveAttribute('data-theme', 'baseline');
    expect(wrapper).not.toHaveAttribute('data-motion');
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

  it("repeats the enclosing ThemeScopes' inline CSS variables around its content", () => {
    render(
      <ThemeScope style={{ '--md-comp-menu-container-color': 'red', padding: 4 } as object}>
        <ThemeScope style={{ '--md-comp-menu-container-color': 'blue', '--x': '1' } as object}>
          <Overlay>
            <div>Menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeScope>,
    );
    const content = screen.getByText('Menu');
    const wrapper = content.closest<HTMLElement>('[data-overlay-scope]')!;
    const inner = content.parentElement!.closest<HTMLElement>('div')!;
    // Each scope's variables on its own layer, the inner one closest to the content, so it wins;
    // only variables travel, not the scope's own layout styles.
    expect(wrapper.style.getPropertyValue('--md-comp-menu-container-color')).toBe('red');
    expect(wrapper.style.padding).toBe('');
    expect(wrapper).toContainElement(inner);
    expect(inner.style.getPropertyValue('--md-comp-menu-container-color')).toBe('blue');
    expect(inner.style.getPropertyValue('--x')).toBe('1');
    for (const layer of [wrapper, inner]) expect(layer).toHaveStyle({ display: 'contents' });
  });

  it("repeats the enclosing ThemeScopes' classes around its content, so their variables reach it", () => {
    render(
      <ThemeScope className="brand-a p-4">
        <ThemeScope className="brand-b p-2">
          <Overlay>
            <div>Menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeScope>,
    );
    const content = screen.getByText('Menu');
    const wrapper = content.closest('[data-overlay-scope]');
    expect(wrapper?.parentElement).toBe(document.body);
    expect(wrapper).toHaveClass('brand-a', 'p-4');
    expect(wrapper).not.toHaveClass('text-on-surface');
    expect(content.closest('.brand-b')).not.toBe(wrapper);
    expect(wrapper).toContainElement(content.closest<HTMLElement>('.brand-b'));
  });

  it("lets an inner scope's class win over an outer scope's inline variable, as on the page", () => {
    render(
      <ThemeScope style={{ '--x': 'outer' } as object}>
        <ThemeScope className="inner-x">
          <Overlay>
            <div>Menu</div>
          </Overlay>
        </ThemeScope>
      </ThemeScope>,
    );
    const content = screen.getByText('Menu');
    const wrapper = content.closest<HTMLElement>('[data-overlay-scope]')!;
    const inner = content.closest<HTMLElement>('.inner-x')!;
    // The class sits on a layer inside the one with the inline variable, so its value is the
    // nearer declaration (they used to share one element, where the inline style won).
    expect(wrapper.style.getPropertyValue('--x')).toBe('outer');
    expect(inner).not.toBe(wrapper);
    expect(wrapper).toContainElement(inner);
    expect(inner.style.getPropertyValue('--x')).toBe('');
    expect(inner).toHaveAttribute('data-theme', wrapper.getAttribute('data-theme')!);
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
