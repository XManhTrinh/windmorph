'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, type SyntheticEvent } from 'react';

/** The element that scrolls `element`: its nearest scrolling ancestor, else the page. */
function scrollerOf(element: Element): Element {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (/auto|scroll|overlay/.test(overflowY) && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return document.scrollingElement ?? document.documentElement;
}

interface Pressed {
  element: Element;
  /** Its viewport top when it was pressed. */
  top: number;
  scroller: Element;
  /** The scroller's position then: if it has scrolled since, the press is stale. */
  scrollTop: number;
}

/** Inputs that mean the reader is scrolling or acting again, so the hold lets go. */
const RELEASE_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/** The container's event handlers {@link useKeepPressedInPlace} returns. */
export interface KeepPressedInPlaceResult {
  /**
   * Notes the pressed element: the container's `onPointerDownCapture` and `onKeyDownCapture`,
   * and its `onClickCapture` for a virtual click (`event.detail === 0`).
   */
  capture: (event: SyntheticEvent) => void;
  /**
   * Forgets a press that changed nothing, by the next task: the container's
   * `onPointerUpCapture`, `onKeyUpCapture` and `onClickCapture`.
   */
  release: () => void;
}

/**
 * Keeps the element a person pressed where it was on screen while the content above it changes
 * size because of that press. When a press opens one item while an open item above it folds
 * (a one-at-a-time tree or accordion), the pressed element would otherwise slide up by the
 * folded height, off the window when the fold starts above it; with this hook its scroller
 * scrolls by the folded height on every frame instead, so nothing moves out from under the
 * person. The core `List` uses it for its tree grid (2026-10-17).
 *
 * **When to use it:** in a container of your own whose items open and fold in response to a
 * press, where an item above the pressed one can fold (or grow) at the same time. Pair it with
 * `overflow-anchor: none` on the folding parts: the browser's scroll anchoring then holds the
 * pressed element on its own whenever it is the first thing showing below them, and this hook
 * covers the rest (the anchor the browser picks above it, such as the folding item's own header
 * or content above the container) and browsers without scroll anchoring.
 *
 * **Wiring:** put `capture` on the container as `onPointerDownCapture` and `onKeyDownCapture`,
 * and `release` as `onPointerUpCapture` and `onKeyUpCapture`. A virtual click (assistive tech,
 * `event.detail === 0`) presses with no pointer or key down before it, so `onClickCapture`
 * calls `capture` for it, then `release` for every click.
 *
 * **What it notes:** on a pointer down, a key down or a virtual click, the element `selector`
 * finds from the event's target (`closest`), its top on screen, its scroller (the nearest
 * scrolling ancestor, else the page) and the scroller's position. A press outside `selector`
 * clears it.
 *
 * **When it acts:** when `version` next changes (any value that changes whenever the content
 * the press changed does, such as the open keys or the rows shown): in a layout effect, before
 * the change paints, it scrolls by however far the element moved, which covers a change with no
 * motion (reduced motion); then again on every animation frame while `settling` is true (the
 * folding parts are still moving), and once more after.
 *
 * **When it lets go:** on the next wheel, touch, pointer down or key down anywhere (the person
 * is scrolling or acting again), when `settling` turns false, when the element leaves the page,
 * or on unmount. It ignores a press after which the scroller moved before the change (the
 * person scrolled), and forgets a press that changed nothing by the next task, so it never holds
 * a later, unrelated change.
 *
 * @param selector A CSS selector for the pressable items (`'[role=row]'`).
 * @param version Changes whenever the content changes.
 * @param settling Whether the content is still moving after the change (parts still folding).
 * @returns `capture` and `release`, the container's event handlers.
 */
export function useKeepPressedInPlace(
  selector: string,
  version: unknown,
  settling: boolean,
): KeepPressedInPlaceResult {
  const pressed = useRef<Pressed | null>(null);
  const settlingRef = useRef(settling);
  settlingRef.current = settling;
  const stopHold = useRef<(() => void) | null>(null);

  const capture = useCallback(
    (event: SyntheticEvent) => {
      const element = (event.target as Element).closest?.(selector);
      if (!element) {
        pressed.current = null;
        return;
      }
      const scroller = scrollerOf(element);
      pressed.current = {
        element,
        top: element.getBoundingClientRect().top,
        scroller,
        scrollTop: scroller.scrollTop,
      };
    },
    [selector],
  );

  // A press's change commits before the next task, so a press that changed nothing is
  // forgotten then and never holds a later, unrelated change.
  const release = useCallback(() => {
    const current = pressed.current;
    setTimeout(() => {
      if (pressed.current === current) pressed.current = null;
    });
  }, []);

  useLayoutEffect(() => {
    const press = pressed.current;
    if (!press) return;
    pressed.current = null;
    const { element, top, scroller } = press;
    if (scroller.scrollTop !== press.scrollTop) return;
    stopHold.current?.();

    let frame = 0;
    const view = scroller.ownerDocument.defaultView!;
    const stop = () => {
      cancelAnimationFrame(frame);
      for (const type of RELEASE_EVENTS) view.removeEventListener(type, stop, true);
      if (stopHold.current === stop) stopHold.current = null;
    };
    const keep = () => {
      if (!element.isConnected) return stop();
      const delta = element.getBoundingClientRect().top - top;
      if (Math.abs(delta) >= 0.5) {
        scroller.scrollTo({ top: scroller.scrollTop + delta, behavior: 'instant' });
      }
    };
    // Before this commit paints (a change with no motion moves things at once), then on
    // every frame while the content settles, and once more after.
    keep();
    const tick = () => {
      keep();
      if (settlingRef.current) frame = requestAnimationFrame(tick);
      else stop();
    };
    frame = requestAnimationFrame(tick);
    for (const type of RELEASE_EVENTS) view.addEventListener(type, stop, true);
    stopHold.current = stop;
  }, [version]);

  useEffect(() => () => stopHold.current?.(), []);

  return { capture, release };
}
