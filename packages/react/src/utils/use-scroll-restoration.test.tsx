import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollRestoration } from './use-scroll-restoration';

function Pane({ pageKey }: { pageKey: string }) {
  const ref = useRef<HTMLElement>(null);
  useScrollRestoration(ref, { pageKey });
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

/** How the document was loaded, as `performance` reports it. */
const loadedBy = (type: string) =>
  vi
    .spyOn(performance, 'getEntriesByType')
    .mockReturnValue([{ type } as unknown as PerformanceEntry]);

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
    vi.advanceTimersByTime(1600);
    pane().scrollTop = 0;
    frame();
    expect(pane().scrollTop).toBe(0);
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
