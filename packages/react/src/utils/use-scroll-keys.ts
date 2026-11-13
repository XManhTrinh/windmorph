'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { isTabbable, TABBABLE } from './focus';

/** The keys that scroll a page up and down. */
export const SCROLL_KEYS: ReadonlySet<string> = new Set([
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
  'ArrowDown',
  'ArrowUp',
]);

/**
 * The attributes that change whether something inside takes focus with Tab: what makes an
 * element focusable or disabled, and what hides it. `class` and `style` are left out: animated
 * content writes them on every frame. Rendering that changes without one of these (a class, a
 * media query) is read at the next change.
 */
const TAB_STOP_ATTRIBUTES = [
  'href',
  'disabled',
  'tabindex',
  'contenteditable',
  'type',
  'hidden',
  'inert',
  'open',
];

export interface ScrollKeysResult {
  /**
   * The `tabIndex` for the scrolling element: `0` while it holds nothing that takes focus, so a
   * text-only page can be reached and scrolled from the keyboard, and `-1` otherwise, so every
   * other page has no extra tab stop. Either way the element can take focus.
   */
  tabIndex: 0 | -1;
}

/**
 * Whether `root` holds anything Tab would reach, by the library's own rule (`tabbables` in
 * `utils/focus.ts`). It is asked as a whole page changes, so it walks to the first one and
 * stops there, and doesn't walk at all where nothing could be one. What is around `root` isn't
 * counted: a modal overlay makes the rest of the page `inert` while it is open, which says
 * nothing about what `root` holds.
 */
function hasTabbable(root: Element): boolean {
  if (!root.querySelector(TABBABLE)) return false;
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node as HTMLElement;
    if (el.matches(TABBABLE) && isTabbable(el, root)) return true;
  }
  return false;
}

/**
 * Reports whether `element` holds nothing Tab would reach, now and as its content changes: at
 * most once a frame, however often the content changes. Returns what ends the watch.
 */
function watchTabStop(element: HTMLElement, onChange: (isTabStop: boolean) => void): () => void {
  let frame = 0;
  const update = () => {
    frame = 0;
    onChange(!hasTabbable(element));
  };
  update();
  const observer = new MutationObserver(() => {
    frame ||= requestAnimationFrame(update);
  });
  observer.observe(element, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: TAB_STOP_ATTRIBUTES,
  });
  return () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
  };
}

/** Whether the element is on screen for the person: rendered, visible, not inert, in the window. */
function isOnScreen(element: Element): boolean {
  if (element.closest('[inert]')) return false;
  // jsdom has no `checkVisibility`: every element counts as rendered there. `visibility` is
  // asked for under both of the option's names (the earlier one, for the browsers that knew
  // only it).
  if (
    'checkVisibility' in element &&
    !element.checkVisibility({ visibilityProperty: true, checkVisibilityCSS: true })
  ) {
    return false;
  }
  const view = element.ownerDocument.defaultView;
  if (!view) return false;
  const { top, bottom, left, right } = element.getBoundingClientRect();
  return bottom > 0 && right > 0 && top < view.innerHeight && left < view.innerWidth;
}

/**
 * The element a browser scrolls with the keys while nothing has focus: the nearest ancestor of
 * what the person last pressed that scrolls up and down. Null when that press was on something
 * that doesn't scroll (so the keys go to the window), is no longer on screen (a sheet since
 * closed), or never happened.
 */
function scrollerOf(pressed: Node | null | undefined): Element | null {
  let element = pressed instanceof Element ? pressed : (pressed?.parentElement ?? null);
  if (!element?.isConnected) return null;
  const { body, documentElement } = element.ownerDocument;
  for (
    ;
    element && element !== body && element !== documentElement;
    element = element.parentElement
  ) {
    const { overflowY } = getComputedStyle(element);
    // More than a rounding's worth to scroll: a sideways scroller computes `auto` here too.
    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      element.scrollHeight - element.clientHeight > 1
    ) {
      return isOnScreen(element) ? element : null;
    }
  }
  return null;
}

/**
 * Sends the scroll keys to an element that scrolls by itself (an app frame's pane) while nothing
 * has focus. Page Down, Page Up, Home, End, Space and the arrows otherwise go to the window,
 * which has nothing to scroll in such a frame, so the page doesn't move until a click in the
 * pane or a Tab to it. As one of those keys goes down with focus on the body and no Ctrl, Alt
 * or Meta held, the element takes focus (without scrolling), and the browser scrolls it with
 * that same press.
 *
 * The keys stay with another scrolling element the person last pressed in (a side sheet's
 * content, a list beside the pane): browsers scroll that one while nothing has focus, and the
 * pane doesn't take the keys from it.
 *
 * Put the returned `tabIndex` on the element: it is a tab stop only while it holds nothing Tab
 * would reach (watched as its content changes), as browsers do for a scrolling region.
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
  /**
   * What the person last pressed, which decides where a browser sends the scroll keys. Held
   * weakly, so a part that has left the page isn't kept alive by it.
   */
  const pressed = useRef<WeakRef<Node> | null>(null);

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
    const onPointerDown = (event: PointerEvent) => {
      pressed.current = event.target instanceof Node ? new WeakRef(event.target) : null;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // Read as the key goes down, never kept from an earlier render: a kept element can have
      // left the page, and focusing it does nothing. It also catches an element a child swapped
      // without this component rendering, before the browser acts on a Tab.
      const element = follow();
      if (!element || document.activeElement !== document.body) return;
      if (!SCROLL_KEYS.has(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      // The browser already has somewhere to send the key: leave it there.
      const scroller = scrollerOf(pressed.current?.deref());
      if (scroller && scroller !== element) return;
      element.focus({ preventScroll: true });
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      watched.current?.stop();
      watched.current = null;
      pressed.current = null;
    };
  }, [follow]);

  return { tabIndex: isTabStop ? 0 : -1 };
}
