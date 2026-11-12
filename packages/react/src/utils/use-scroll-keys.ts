'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

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
 * Reports whether `element` holds nothing that takes focus, now and as its content changes.
 * Returns what ends the watch.
 */
function watchTabStop(element: HTMLElement, onChange: (isTabStop: boolean) => void): () => void {
  const update = () => onChange(element.querySelector(TABBABLE) === null);
  update();
  const observer = new MutationObserver(update);
  observer.observe(element, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href', 'disabled', 'tabindex'],
  });
  return () => observer.disconnect();
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
 * The hook follows the element behind the ref: it can arrive after the first render, go, or be
 * replaced by another (a frame that leaves its pane out on some pages) while the component that
 * calls the hook stays mounted.
 *
 * @example
 * const pane = useRef<HTMLElement>(null);
 * const { tabIndex } = useScrollKeys(pane);
 * return <main ref={pane} tabIndex={tabIndex} className="overflow-y-auto">…</main>;
 */
export function useScrollKeys(ref: RefObject<HTMLElement | null>): ScrollKeysResult {
  const [isTabStop, setIsTabStop] = useState(false);
  /** The element watched for its tab stop, and what ends the watch. */
  const watched = useRef<{ element: HTMLElement; stop: () => void } | null>(null);

  /** Moves the watch to the element now behind the ref, and returns that element. */
  const follow = useCallback(() => {
    const element = ref.current;
    if (element === (watched.current?.element ?? null)) return element;
    watched.current?.stop();
    watched.current = element ? { element, stop: watchTabStop(element, setIsTabStop) } : null;
    if (!element) setIsTabStop(false);
    return element;
  }, [ref]);

  // A ref's element changes without telling anyone, so it is read again after every render of
  // this component, which covers an element this component (or a parent's render) swaps.
  useEffect(() => {
    follow();
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Read as the key goes down, never kept from an earlier render: a kept element can have
      // left the page, and focusing it does nothing. It also catches an element a child swapped
      // without this component rendering, before the browser acts on a Tab.
      const element = follow();
      if (!element || document.activeElement !== document.body) return;
      if (!SCROLL_KEYS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      element.focus({ preventScroll: true });
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      watched.current?.stop();
      watched.current = null;
    };
  }, [follow]);

  return { tabIndex: isTabStop ? 0 : -1 };
}
