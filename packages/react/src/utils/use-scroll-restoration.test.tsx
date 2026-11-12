import { fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollRestoration } from './use-scroll-restoration';

function Pane({ pageKey, holdFor }: { pageKey: string; holdFor?: number }) {
  const ref = useRef<HTMLElement>(null);
  useScrollRestoration(ref, { pageKey, ...(holdFor !== undefined && { holdFor }) });
  return <main ref={ref} data-testid="pane" />;
}

const pane = () => screen.getByTestId('pane');

/** The Navigation API's target, stubbed: jsdom has none. */
let navigation: EventTarget;

/** Back or forward, as the Navigation API reports it before the page changes. */
const traverse = (hashChange = false) =>
  navigation.dispatchEvent(
    Object.assign(new Event('navigate'), { navigationType: 'traverse', hashChange }),
  );

/** How the document was loaded, and at which address, as `performance` reports it. */
const loadedBy = (type: string) =>
  vi
    .spyOn(performance, 'getEntriesByType')
    .mockReturnValue([{ type, name: location.href } as unknown as PerformanceEntry]);

/** What is kept in storage, by page. */
const stored = (): Record<string, number> =>
  JSON.parse(sessionStorage.getItem('windmorph-scroll') ?? '{}') as Record<string, number>;

/** Page `/a` back through history at 300, its position held; returns `rerender`. */
function restoredA(holdFor?: number) {
  const { rerender } = render(<Pane pageKey="/a" holdFor={holdFor} />);
  pane().scrollTop = 300;
  fireEvent.pointerDown(document.body);
  rerender(<Pane pageKey="/b" holdFor={holdFor} />);
  traverse();
  rerender(<Pane pageKey="/a" holdFor={holdFor} />);
  expect(pane().scrollTop).toBe(300);
  return rerender;
}

const address = location.href;

/** One animation frame of the hold. */
const frame = () => vi.advanceTimersByTime(20);

beforeEach(() => {
  sessionStorage.clear();
  navigation = new EventTarget();
  vi.stubGlobal('navigation', navigation);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  history.replaceState(null, '', address);
});

describe('useScrollRestoration', () => {
  it('starts a new page at its top, and restores each page on back and forward', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    expect(pane().scrollTop).toBe(0);

    pane().scrollTop = 120;
    traverse();
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);

    traverse();
    rerender(<Pane pageKey="/b" />);
    expect(pane().scrollTop).toBe(120);
  });

  it('takes a position when the person sets off, never from a scroll after the page changed', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.keyDown(document.body, { key: 'Enter' });
    // A router scrolls the element to the new page's top before the page changes.
    pane().scrollTop = 0;
    rerender(<Pane pageKey="/b" />);
    traverse();
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
  });

  it('holds a restored position while content arrives, until the person scrolls', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    traverse();
    rerender(<Pane pageKey="/a" />);
    // Something moves it (a router, or content not yet tall enough): it goes back.
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(300);
    // The person scrolls: the hold lets go at once.
    fireEvent.wheel(window);
    pane().scrollTop = 50;
    frame();
    expect(pane().scrollTop).toBe(50);
  });

  it('lets go by itself after the hold', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    traverse();
    rerender(<Pane pageKey="/a" />);
    // Still held near the end of its 1.5 seconds, and let go after them.
    vi.advanceTimersByTime(1400);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(300);
    vi.advanceTimersByTime(200);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(0);
  });

  it('holds for as long as holdFor says', () => {
    restoredA(400);
    vi.advanceTimersByTime(300);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(300);
    vi.advanceTimersByTime(200);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(0);
  });

  it.each(['wheel', 'touchstart', 'pointerdown', 'keydown'])(
    'lets go of the hold on a %s',
    (type) => {
      restoredA();
      fireEvent(
        window,
        type === 'keydown' ? new KeyboardEvent(type, { key: 'ArrowDown' }) : new Event(type),
      );
      pane().scrollTop = 50;
      frame();
      expect(pane().scrollTop).toBe(50);
    },
  );

  it('keeps holding through a key that repeats, as the back shortcut does when held', () => {
    restoredA();
    fireEvent.keyDown(window, { key: 'ArrowLeft', altKey: true, repeat: true });
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(300);
  });

  it('does not hold again once the hold has ended, when the same page runs its effect again', () => {
    const rerender = restoredA();
    fireEvent.wheel(window);
    pane().scrollTop = 50;
    // An option changes: the page is the same, and the person has scrolled since.
    rerender(<Pane pageKey="/a" holdFor={1000} />);
    frame();
    expect(pane().scrollTop).toBe(50);
  });

  it('stops holding when it unmounts', () => {
    const { unmount } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent(window, new Event('pagehide'));
    unmount();
    loadedBy('reload');
    const reloaded = render(<Pane pageKey="/a" />);
    const element = pane();
    expect(element.scrollTop).toBe(300);
    reloaded.unmount();
    element.scrollTop = 0;
    frame();
    expect(element.scrollTop).toBe(0);
  });

  it('restores and holds under Strict Mode, whose effects run twice', () => {
    sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300 }));
    loadedBy('reload');
    render(
      <StrictMode>
        <Pane pageKey="/a" />
      </StrictMode>,
    );
    expect(pane().scrollTop).toBe(300);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(300);
  });

  it('keeps what it had for a page while its restored position is still being held', () => {
    restoredA();
    // Content still arriving leaves the element short of the position as the person goes back
    // again: the page keeps its 300.
    pane().scrollTop = 0;
    traverse();
    expect(stored()['/a']).toBe(300);
    fireEvent(window, new Event('pagehide'));
    expect(stored()['/a']).toBe(300);
  });

  it('restores each page when two steps back begin before the first page shows', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    pane().scrollTop = 120;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/c" />);
    traverse();
    traverse();
    rerender(<Pane pageKey="/b" />);
    expect(pane().scrollTop).toBe(120);
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
  });

  it('starts a page first seen through history, with nothing kept for it, at its top', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    rerender(<Pane pageKey="/b" />);
    pane().scrollTop = 200;
    traverse();
    rerender(<Pane pageKey="/c" />);
    expect(pane().scrollTop).toBe(0);
  });

  it('keeps at most 200 pages, dropping the oldest', () => {
    const { rerender } = render(<Pane pageKey="/0" />);
    for (let page = 0; page < 205; page++) {
      rerender(<Pane pageKey={`/${page}`} />);
      pane().scrollTop = page + 1;
      fireEvent.pointerDown(document.body);
    }
    const kept = stored();
    expect(Object.keys(kept)).toHaveLength(200);
    expect(kept['/4']).toBeUndefined();
    expect(kept['/5']).toBe(6);
    expect(kept['/204']).toBe(205);
  });

  it('moves the element at once with scrollTo, where it has one', () => {
    const scrollTo = vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollTop = options.top ?? 0;
    });
    const prototype = HTMLElement.prototype as { scrollTo?: unknown };
    const original = Object.getOwnPropertyDescriptor(prototype, 'scrollTo');
    Object.defineProperty(prototype, 'scrollTo', { configurable: true, value: scrollTo });
    try {
      restoredA();
      expect(scrollTo).toHaveBeenLastCalledWith({ top: 300, behavior: 'instant' });
    } finally {
      if (original) Object.defineProperty(prototype, 'scrollTo', original);
      else delete prototype.scrollTo;
    }
  });

  it('restores on a reload only the page the document was loaded with', () => {
    sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300, '/b': 250 }));
    loadedBy('reload');
    const first = render(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
    first.unmount();
    // A link has been followed since, and the hook mounts again (a frame left and come back
    // to): the page it shows isn't the reloaded one.
    history.pushState(null, '', '/elsewhere');
    render(<Pane pageKey="/b" />);
    expect(pane().scrollTop).toBe(0);
  });

  it('tells the loaded page by its history entry where the Navigation API gives it', () => {
    sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300 }));
    loadedBy('reload');
    const entries = { activation: { entry: { key: 'loaded' } }, currentEntry: { key: 'later' } };
    vi.stubGlobal('navigation', Object.assign(navigation, entries));
    const later = render(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(0);
    later.unmount();
    entries.currentEntry.key = 'loaded';
    Object.assign(navigation, entries);
    render(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
  });

  it('restores after a reload from sessionStorage, and leaves a fresh visit alone', () => {
    const first = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent(window, new Event('pagehide'));
    first.unmount();

    loadedBy('reload');
    const reloaded = render(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
    reloaded.unmount();

    loadedBy('navigate');
    render(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(0);
  });

  it('treats a traverse within the page (a hash) and a held key as no page change', () => {
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    pane().scrollTop = 120;
    fireEvent.pointerDown(document.body);
    // Back within the page: the next page change is a new page.
    traverse(true);
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(0);

    // A key still held as back begins repeats; it doesn't cancel the restore.
    pane().scrollTop = 40;
    traverse();
    fireEvent.keyDown(document.body, { key: 'ArrowLeft', repeat: true });
    rerender(<Pane pageKey="/b" />);
    expect(pane().scrollTop).toBe(120);
  });

  it('falls back to popstate where the Navigation API is missing', () => {
    vi.stubGlobal('navigation', undefined);
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    fireEvent.popState(window);
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
  });

  it('takes a step back within the page for what it is, where the Navigation API is missing', () => {
    vi.stubGlobal('navigation', undefined);
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    // Back to an earlier fragment of the same page: `popstate`, then `hashchange`.
    fireEvent.popState(window);
    fireEvent(window, new Event('hashchange'));
    // A page change with no press or key before it (a script's) is then a new page.
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(0);
  });

  it('writes to storage only when the position changed', () => {
    render(<Pane pageKey="/a" />);
    const write = vi.spyOn(Storage.prototype, 'setItem');
    pane().scrollTop = 300;
    fireEvent.keyDown(document.body, { key: 'a' });
    expect(write).toHaveBeenCalledTimes(1);
    // Typing on: nothing moved, so nothing is written.
    fireEvent.keyDown(document.body, { key: 'b' });
    fireEvent.pointerDown(document.body);
    expect(write).toHaveBeenCalledTimes(1);
    pane().scrollTop = 420;
    fireEvent.keyDown(document.body, { key: 'c' });
    expect(write).toHaveBeenCalledTimes(2);
    expect(JSON.parse(sessionStorage.getItem('windmorph-scroll')!)).toEqual({ '/a': 420 });
  });

  it('reads the positions again under another storage key', () => {
    sessionStorage.setItem('other', JSON.stringify({ '/b': 250 }));
    function Keyed({ pageKey, storageKey }: { pageKey: string; storageKey?: string }) {
      const ref = useRef<HTMLElement>(null);
      useScrollRestoration(ref, { pageKey, ...(storageKey && { storageKey }) });
      return <main ref={ref} data-testid="pane" />;
    }
    const { rerender } = render(<Keyed pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    traverse();
    rerender(<Keyed pageKey="/b" storageKey="other" />);
    expect(pane().scrollTop).toBe(250);
    // The first key's positions stay under the first key.
    expect(JSON.parse(sessionStorage.getItem('windmorph-scroll')!)).toEqual({ '/a': 300 });
    expect(JSON.parse(sessionStorage.getItem('other')!)).toEqual({ '/b': 250 });
  });

  it('keeps positions in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const { rerender } = render(<Pane pageKey="/a" />);
    pane().scrollTop = 300;
    fireEvent.pointerDown(document.body);
    rerender(<Pane pageKey="/b" />);
    traverse();
    rerender(<Pane pageKey="/a" />);
    expect(pane().scrollTop).toBe(300);
  });

  describe('in a frame that leaves the element out on some pages', () => {
    /** Stays mounted while its pane is left out (a page laid out without it) and comes back. */
    function Frame({ pageKey, withPane = true }: { pageKey: string; withPane?: boolean }) {
      const ref = useRef<HTMLElement>(null);
      useScrollRestoration(ref, { pageKey });
      // Keyed, so the pane that comes back is a new element, as in a frame with two layouts.
      return withPane ? (
        <main key="pane" ref={ref} data-testid="pane" />
      ) : (
        <main key="plain" data-testid="plain" />
      );
    }

    it('restores a page on the way back from a page without the element', () => {
      const { rerender } = render(<Frame pageKey="/a" />);
      pane().scrollTop = 300;
      fireEvent.pointerDown(document.body);
      rerender(<Frame pageKey="/plain" withPane={false} />);
      traverse();
      rerender(<Frame pageKey="/a" />);
      expect(pane().scrollTop).toBe(300);
    });

    it('restores on an element that arrives after the page has changed', () => {
      sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300 }));
      loadedBy('reload');
      const { rerender } = render(<Frame pageKey="/a" withPane={false} />);
      rerender(<Frame pageKey="/a" />);
      frame();
      expect(pane().scrollTop).toBe(300);
    });

    it('holds the position on an element that replaces the first on the same page', () => {
      function Rekeyed({ id }: { id: number }) {
        const ref = useRef<HTMLElement>(null);
        useScrollRestoration(ref, { pageKey: '/a' });
        return <main key={id} ref={ref} data-testid="pane" />;
      }
      sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300 }));
      loadedBy('reload');
      const { rerender } = render(<Rekeyed id={1} />);
      const first = pane();
      rerender(<Rekeyed id={2} />);
      expect(pane()).not.toBe(first);
      frame();
      expect(pane().scrollTop).toBe(300);
      // The element that left is no longer written.
      first.scrollTop = 0;
      frame();
      expect(first.scrollTop).toBe(0);
    });

    it('starts a page followed to from a page without the element at its top', () => {
      sessionStorage.setItem('windmorph-scroll', JSON.stringify({ '/a': 300 }));
      // The visit begins with a reload of the page without the element: the reload restores
      // that page, not the one a link leads to next.
      loadedBy('reload');
      const { rerender } = render(<Frame pageKey="/plain" withPane={false} />);
      fireEvent.pointerDown(document.body);
      rerender(<Frame pageKey="/a" />);
      expect(pane().scrollTop).toBe(0);
    });
  });
});
