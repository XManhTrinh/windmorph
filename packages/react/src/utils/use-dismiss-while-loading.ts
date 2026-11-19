'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** What else counts as moving on from an overlay that's still loading. */
export interface DismissWhileLoadingOptions {
  /**
   * ↓ or ↑ (with Alt too) at the trigger: kept from toggling it shut, it asks for the first or
   * the last item, focused once it opens.
   */
  onArrow?: (focus: 'first' | 'last') => void;
  /** A primary press anywhere closes it, the trigger's included (a context menu's region). */
  anyPress?: boolean;
  /** Typing in the trigger closes it (a field's text box, under a modal picker). */
  closeOnInput?: boolean;
}

/**
 * While `waiting` (open, its code still loading, nothing in the page yet), Escape, a press
 * outside the trigger and focus moving on from it (to another element, or by Tab out of the
 * page; a window or tab switch isn't moving on) close the overlay, so the code coming in opens
 * nothing (library-internal). A layout effect: its listeners go before the arrived overlay
 * takes focus.
 */
export function useDismissWhileLoading(
  triggerRef: RefObject<HTMLElement | null>,
  waiting: boolean,
  close: () => void,
  options: DismissWhileLoadingOptions = {},
) {
  const latest = useRef({ close, options });
  useLayoutEffect(() => {
    latest.current = { close, options };
  });
  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!waiting || !trigger) return;
    const page = trigger.ownerDocument;
    const inside = (node: EventTarget | null) => node instanceof Node && trigger.contains(node);
    const dismiss = () => latest.current.close();
    let tabbing = false;
    const onKeyDown = (event: KeyboardEvent) => {
      const { onArrow } = latest.current.options;
      if (event.key === 'Tab') tabbing = true;
      else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      } else if (
        onArrow &&
        inside(event.target) &&
        (event.key === 'ArrowDown' || event.key === 'ArrowUp')
      ) {
        event.preventDefault();
        onArrow(event.key === 'ArrowUp' ? 'last' : 'first');
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const primary = event.button === 0 && latest.current.options.anyPress;
      if (primary || !inside(event.target)) dismiss();
    };
    const onFocusIn = (event: Event) => {
      if (!inside(event.target)) dismiss();
    };
    // Focus leaving for nothing closes it only after a Tab: a window or tab switch, or a
    // screen reader moving its cursor, blurs with nothing to go to too.
    const onFocusOut = (event: FocusEvent) => {
      if (tabbing && !inside(event.relatedTarget)) dismiss();
      tabbing = false;
    };
    const onInput = (event: Event) => {
      if (latest.current.options.closeOnInput && inside(event.target)) dismiss();
    };
    page.addEventListener('keydown', onKeyDown, true);
    page.addEventListener('pointerdown', onPointerDown, true);
    page.addEventListener('focusin', onFocusIn, true);
    page.addEventListener('beforeinput', onInput, true);
    trigger.addEventListener('focusout', onFocusOut);
    return () => {
      page.removeEventListener('keydown', onKeyDown, true);
      page.removeEventListener('pointerdown', onPointerDown, true);
      page.removeEventListener('focusin', onFocusIn, true);
      page.removeEventListener('beforeinput', onInput, true);
      trigger.removeEventListener('focusout', onFocusOut);
    };
  }, [triggerRef, waiting]);
}
