'use client';

import { useEffect, useState, type RefObject } from 'react';

/** The keys that scroll a page. */
const SCROLL_KEYS = new Set(['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp']);

/** What takes focus with Tab. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface ScrollKeysResult {
  /**
   * The `tabIndex` for the scrolling element: `0` while it holds nothing that takes focus, so a
   * text-only page can be reached and scrolled from the keyboard, and `-1` otherwise, so every
   * other page has no extra tab stop. Either way the element can take focus.
   */
  tabIndex: 0 | -1;
}

/**
 * Sends the scroll keys to an element that scrolls by itself (an app frame's pane) while nothing
 * has focus. Page Down, Page Up, Home, End, Space and the arrows otherwise go to the window,
 * which has nothing to scroll in such a frame, so the page doesn't move until a click in the
 * pane or a Tab to it. As one of those keys goes down with focus on the body and no Ctrl, Alt
 * or Meta held, the element takes focus (without scrolling), and the browser scrolls it with
 * that same press.
 *
 * Put the returned `tabIndex` on the element: it is a tab stop only while it holds nothing that
 * takes focus (watched as its content changes), as browsers do for a scrolling region.
 *
 * @example
 * const pane = useRef<HTMLElement>(null);
 * const { tabIndex } = useScrollKeys(pane);
 * return <main ref={pane} tabIndex={tabIndex} className="overflow-y-auto">…</main>;
 */
export function useScrollKeys(ref: RefObject<HTMLElement | null>): ScrollKeysResult {
  const [isTabStop, setIsTabStop] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== document.body || !SCROLL_KEYS.has(event.key)) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      element.focus({ preventScroll: true });
    };
    const update = () => setIsTabStop(element.querySelector(TABBABLE) === null);
    update();
    const observer = new MutationObserver(update);
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'disabled', 'tabindex'],
    });
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [ref]);

  return { tabIndex: isTabStop ? 0 : -1 };
}
