'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * While `waiting` (open, its code still loading, nothing in the page yet), Escape, a press
 * outside the trigger and focus leaving it close the overlay, so the code coming in opens
 * nothing (library-internal). A layout effect: its listeners go before the arrived overlay
 * takes focus.
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
    // Focus leaving for nothing, too (Tab past the page's last control).
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
