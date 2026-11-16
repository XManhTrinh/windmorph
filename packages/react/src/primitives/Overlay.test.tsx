import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UNSAFE_PortalProvider } from 'react-aria';
import { use, useLayoutEffect, useRef, type Context, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog, DialogContent } from '../components/dialog/Dialog';
import { ThemeProvider } from '../theme/ThemeProvider';
import { ThemeScope } from '../theme/ThemeScope';
import { ContainerButtonContext } from './ButtonContext';
import { ChipSetDisabledContext } from './ChipSetContext';
import { Overlay } from './Overlay';
import { DialogTriggerContext, SheetTriggerContext } from './OverlayTriggerContext';
import { ToggleGroupStateContext } from './ToggleGroupStateContext';
import { ToolbarContext } from './ToolbarContext';
import { TooltipPlacementContext } from './TooltipPlacementContext';
import { RichContext, TooltipContext } from './TooltipTriggerContext';
import { TriggerContext } from './TriggerContext';

const THEME_ATTRIBUTES = [
  'data-theme',
  'data-mode',
  'data-contrast',
  'data-motion',
  'data-density',
] as const;

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
    for (const name of THEME_ATTRIBUTES) expect(page).not.toHaveAttribute(name);
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

  it('leaves behind every context of what it was opened from', () => {
    // Each context set where the overlay is rendered, to a value its own reset never is.
    const outside = {} as never;
    const set = <T,>(context: Context<T>, value: T) => ({
      context: context as unknown as Context<unknown>,
      value,
    });
    const buttons = set(ContainerButtonContext, outside);
    const chipSet = set(ChipSetDisabledContext, true);
    const opener = [
      set(TriggerContext, outside),
      set(TooltipContext, outside),
      set(RichContext, outside),
      set(DialogTriggerContext, outside),
      set(SheetTriggerContext, outside),
      set(ToolbarContext, outside),
      buttons,
      set(TooltipPlacementContext, 'bottom'),
      set(ToggleGroupStateContext, outside),
      chipSet,
    ];
    const seen = new Map<Context<unknown>, unknown>();
    function Probe() {
      for (const { context } of opener) seen.set(context, use(context));
      return null;
    }
    render(
      opener.reduceRight<ReactNode>(
        (content, { context, value }) => (
          <context.Provider value={value}>{content}</context.Provider>
        ),
        <Overlay>
          <Probe />
        </Overlay>,
      ),
    );
    expect(seen.size).toBe(opener.length);
    for (const { context, value } of opener) expect(seen.get(context)).not.toBe(value);
    expect(seen.get(buttons.context)).toEqual({});
    expect(seen.get(chipSet.context)).toBe(false);
  });

  describe('giving focus back', () => {
    /** Where focus is each time the document changes, until `stop()`. */
    async function watchFocus() {
      // Changes already made are told in a microtask of their own, which would come first.
      await Promise.resolve();
      const focused: (Element | null)[] = [];
      const observer = new MutationObserver(() => focused.push(document.activeElement));
      observer.observe(document.body, { childList: true, subtree: true });
      return { focused, stop: () => observer.disconnect() };
    }

    function Nested({ open, menu }: { open: boolean; menu: boolean }) {
      return (
        <>
          <button type="button">Open</button>
          {open && (
            <Overlay>
              <button type="button">Options</button>
              {menu && (
                <Overlay>
                  <button type="button">Remove</button>
                </Overlay>
              )}
            </Overlay>
          )}
        </>
      );
    }

    it('gives focus back from an overlay opened in it when both leave together', async () => {
      const { rerender } = render(<Nested open={false} menu={false} />);
      const opener = screen.getByRole('button', { name: 'Open' });
      act(() => opener.focus());
      rerender(<Nested open menu={false} />);
      act(() => screen.getByRole('button', { name: 'Options' }).focus());
      rerender(<Nested open menu />);
      act(() => screen.getByRole('button', { name: 'Remove' }).focus());
      // A menu's action closes the dialog it is in: both leave in one commit. Focus was in the
      // menu, a portal of its own, and the menu's opener left with the dialog.
      const watch = await watchFocus();
      rerender(<Nested open={false} menu={false} />);
      await act(async () => {});
      watch.stop();
      expect(watch.focused).not.toContain(document.body);
      expect(opener).toHaveFocus();
    });

    it("lets an app take the hand-back over, as React Aria's focus scope does", async () => {
      const { rerender } = render(<Nested open={false} menu={false} />);
      const opener = screen.getByRole('button', { name: 'Open' });
      act(() => opener.focus());
      rerender(<Nested open menu={false} />);
      act(() => screen.getByRole('button', { name: 'Options' }).focus());
      const restores: EventTarget[] = [];
      const takeOver = (event: Event) => {
        restores.push(event.target!);
        event.preventDefault();
      };
      document.addEventListener('react-aria-focus-scope-restore', takeOver);
      try {
        rerender(<Nested open={false} menu={false} />);
        // Before React Aria's own restore, a frame later.
        await Promise.resolve();
        expect(restores).toEqual([opener]);
        expect(opener).not.toHaveFocus();
        // React Aria's scope tries a frame later, with focus still on <body>: the app hears of
        // the hand-back once, and focus stays where the app leaves it.
        await act(() => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve))));
        expect(restores).toEqual([opener]);
        expect(opener).not.toHaveFocus();
      } finally {
        document.removeEventListener('react-aria-focus-scope-restore', takeOver);
      }
    });
  });

  describe('in full screen', () => {
    /** Puts `element` in full screen as the browser would, telling the page. */
    function fullscreen(element: Element | null) {
      Object.defineProperty(document, 'fullscreenElement', { value: element, configurable: true });
      act(() => {
        document.dispatchEvent(new Event('fullscreenchange'));
      });
    }

    it('opens inside the element in full screen, and stays there until it closes', () => {
      const player = document.createElement('div');
      document.body.append(player);
      fullscreen(player);
      const { unmount } = render(
        <Overlay>
          <div>Speed</div>
        </Overlay>,
      );
      expect(player).toContainElement(screen.getByText('Speed'));
      // Still drawn in the player after full screen; moving would build it again.
      fullscreen(null);
      expect(player).toContainElement(screen.getByText('Speed'));
      unmount();
      render(
        <Overlay>
          <div>Quality</div>
        </Overlay>,
      );
      expect(screen.getByText('Quality').closest('[data-overlay-scope]')?.parentElement).toBe(
        document.body,
      );
      player.remove();
    });

    it('keeps an open overlay where it is as full screen starts and ends, content and all', async () => {
      const player = document.createElement('div');
      document.body.append(player);
      render(
        <Overlay>
          <input aria-label="Name" />
        </Overlay>,
      );
      const input = screen.getByRole('textbox', { name: 'Name' });
      await userEvent.type(input, 'Ada');
      // Moved to the element in full screen, its content was built again: a new, empty field,
      // and focus gone from it.
      fullscreen(player);
      expect(screen.getByRole('textbox', { name: 'Name' })).toBe(input);
      expect(input).toHaveValue('Ada');
      expect(input).toHaveFocus();
      expect(input.closest('[data-overlay-scope]')?.parentElement).toBe(document.body);
      fullscreen(null);
      expect(screen.getByRole('textbox', { name: 'Name' })).toBe(input);
      expect(input).toHaveValue('Ada');
      player.remove();
    });

    it('lets an element inside an open dialog go full screen without building the dialog again', () => {
      render(
        <Dialog open aria-label="Clip">
          <DialogContent>
            <div data-testid="player">Clip</div>
          </DialogContent>
        </Dialog>,
      );
      const player = screen.getByTestId('player');
      // Built again inside itself, the player left the document, and full screen with it.
      fullscreen(player);
      expect(player.isConnected).toBe(true);
      expect(screen.getByTestId('player')).toBe(player);
      fullscreen(null);
      expect(screen.getByTestId('player')).toBe(player);
    });

    it('stays in body, as on the page, while the whole page is in full screen', () => {
      for (const page of [document.documentElement, document.body]) {
        fullscreen(page);
        const { unmount } = render(
          <ThemeProvider defaultTheme="ocean" storage="none">
            <Overlay>
              <div>Menu</div>
            </Overlay>
          </ThemeProvider>,
        );
        const wrapper = screen.getByText('Menu').closest('[data-overlay-scope]')!;
        expect(wrapper.parentElement).toBe(document.body);
        for (const name of THEME_ATTRIBUTES) expect(wrapper).not.toHaveAttribute(name);
        unmount();
      }
      fullscreen(null);
    });

    it('stays in body for an element that draws none of its children', () => {
      const video = document.createElement('video');
      const field = document.createElement('input');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      svg.append(group);
      document.body.append(video, field, svg);
      for (const element of [video, field, svg, group]) {
        fullscreen(element);
        const { unmount } = render(
          <Overlay>
            <div>Captions</div>
          </Overlay>,
        );
        expect(screen.getByText('Captions').closest('[data-overlay-scope]')?.parentElement).toBe(
          document.body,
        );
        unmount();
      }
      fullscreen(null);
      video.remove();
      field.remove();
      svg.remove();
    });

    it("carries only what differs from where it's drawn, so an app's :root values reach it", () => {
      const player = document.createElement('div');
      document.body.append(player);
      function Page({ open }: { open: boolean }) {
        return (
          <ThemeProvider defaultTheme="ocean" storage="none">
            {open && (
              <Overlay>
                <div>Page menu</div>
              </Overlay>
            )}
            <ThemeScope theme="forest">
              {open && (
                <Overlay>
                  <div>Forest menu</div>
                </Overlay>
              )}
              <div data-testid="forest-player">
                {open && (
                  <Overlay>
                    <div>Player menu</div>
                  </Overlay>
                )}
              </div>
            </ThemeScope>
          </ThemeProvider>
        );
      }
      const { rerender } = render(<Page open={false} />);
      fullscreen(player);
      rerender(<Page open />);
      const page = screen.getByText('Page menu').closest('[data-overlay-scope]')!;
      expect(page.parentElement).toBe(player);
      for (const name of THEME_ATTRIBUTES) expect(page).not.toHaveAttribute(name);
      // Declared in another theme than the player inherits: the colours go with it.
      const forest = screen.getByText('Forest menu').closest('[data-overlay-scope]')!;
      expect(forest.parentElement).toBe(player);
      expect(forest).toHaveAttribute('data-theme', 'forest');
      expect(forest).toHaveAttribute('data-mode');
      expect(forest).toHaveAttribute('data-contrast');
      expect(forest).not.toHaveAttribute('data-motion');
      expect(forest).not.toHaveAttribute('data-density');
      rerender(<Page open={false} />);

      // A player inside that scope inherits its theme, so an overlay drawn in it needs none.
      const forestPlayer = screen.getByTestId('forest-player');
      fullscreen(forestPlayer);
      rerender(<Page open />);
      const inPlayer = screen.getByText('Player menu').closest('[data-overlay-scope]')!;
      expect(inPlayer.parentElement).toBe(forestPlayer);
      for (const name of THEME_ATTRIBUTES) expect(inPlayer).not.toHaveAttribute(name);
      fullscreen(null);
      player.remove();
    });

    it("leaves the place to the caller's container and an app's portal provider first", () => {
      const player = document.createElement('div');
      const own = document.createElement('div');
      const provided = document.createElement('div');
      document.body.append(player, own, provided);
      fullscreen(player);
      render(
        <UNSAFE_PortalProvider getContainer={() => provided}>
          <Overlay portalContainer={own}>
            <div>Own</div>
          </Overlay>
          <Overlay>
            <div>Provided</div>
          </Overlay>
        </UNSAFE_PortalProvider>,
      );
      expect(own).toContainElement(screen.getByText('Own'));
      expect(provided).toContainElement(screen.getByText('Provided'));
      fullscreen(null);
      player.remove();
      own.remove();
      provided.remove();
    });
  });
});
