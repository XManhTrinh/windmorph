'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Closes an overlay that's open while its code loads (`onDemand`), before any of it is in the
 * page to take Escape, a press outside or focus (library-internal: a menu's sheet, pages in
 * place and container, and a select's sheet). While `waiting`, Escape, a press outside the
 * trigger and focus moving on from it close it, so the code coming in later opens nothing: a
 * menu opened as its code loaded couldn't be dismissed, and took focus from wherever it had
 * gone as the code came (2026-11-19). A layout effect, so its listeners are gone before the
 * arrived overlay takes focus in its own effects.
 */
export function useDismissWhileLoading(
  triggerRef: RefObject<HTMLElement | null>,
  waiting: boolean,
  close: () => void,
) {
  const latest = useRef(close);
  useLayoutEffect(() => {
    latest.current = close;
  });
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!waiting || !trigger) return;
    const page = trigger.ownerDocument;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      latest.current();
    };
    const outside = (node: EventTarget | null) => !(node instanceof Node && trigger.contains(node));
    const onLeave = (event: Event) => {
      if (outside(event.target)) latest.current();
    };
    // Focus leaving the trigger for nothing (Tab past the page's last control) too.
    const onBlur = (event: FocusEvent) => {
      if (outside(event.relatedTarget)) latest.current();
    };
    page.addEventListener('keydown', onKeyDown, true);
    page.addEventListener('pointerdown', onLeave, true);
    page.addEventListener('focusin', onLeave, true);
    trigger.addEventListener('focusout', onBlur);
    return () => {
      page.removeEventListener('keydown', onKeyDown, true);
      page.removeEventListener('pointerdown', onLeave, true);
      page.removeEventListener('focusin', onLeave, true);
      trigger.removeEventListener('focusout', onBlur);
    };
  }, [triggerRef, waiting]);
}
