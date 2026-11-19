'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** What else counts as moving on from an overlay that's still loading. */
export interface DismissWhileLoadingOptions {
  /** ↓ or ↑ at the trigger: kept from toggling it shut, it picks the item to focus. */
  onArrow?: (focus: 'first' | 'last') => void;
  /** A primary press anywhere closes it (a context menu's region). */
  anyPress?: boolean;
  /** ↓ or ↑ at the trigger closes it, keeping the key's own use (a context menu's region). */
  closeOnArrow?: boolean;
  /** Typing in the trigger closes it (a field under a modal picker). */
  closeOnInput?: boolean;
  /**
   * A key with focus on the page itself closes it, as in the trigger (a context menu opened on
   * a region that takes no focus leaves focus on `<body>`).
   */
  keysFromPage?: boolean;
}

/**
 * While `waiting` (open, its code still loading), Escape, a press outside the trigger and focus
 * moving on from it (to another element, or by Tab out of the page, not a window switch) close
 * the overlay, so its code coming in opens nothing (library-internal).
 */
const MODIFIERS = new Set(['Shift', 'Control', 'Alt', 'Meta']);

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
      const { onArrow, closeOnArrow, keysFromPage } = latest.current.options;
      const onPage = event.target === page.body || event.target === page.documentElement;
      if (keysFromPage && onPage && !MODIFIERS.has(event.key) && event.key !== 'Tab') {
        dismiss();
        return;
      }
      const arrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
      if (event.key === 'Tab') tabbing = inside(event.target);
      else if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        dismiss();
      } else if (arrow && inside(event.target) && closeOnArrow) {
        dismiss();
      } else if (arrow && inside(event.target) && onArrow) {
        event.preventDefault();
        onArrow(event.key === 'ArrowUp' ? 'last' : 'first');
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const primary = event.button === 0 && latest.current.options.anyPress;
      if (primary || !inside(event.target)) dismiss();
    };
    // A Tab moves focus between its keydown and keyup.
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Tab') tabbing = false;
    };
    const onFocusIn = (event: Event) => {
      if (!inside(event.target)) dismiss();
    };
    // A blur to nothing closes it only after a Tab (not a window switch).
    const onFocusOut = (event: FocusEvent) => {
      if (tabbing && !inside(event.relatedTarget)) dismiss();
      tabbing = false;
    };
    const onInput = (event: Event) => {
      if (latest.current.options.closeOnInput && inside(event.target)) dismiss();
    };
    page.addEventListener('keydown', onKeyDown, true);
    page.addEventListener('keyup', onKeyUp, true);
    page.addEventListener('pointerdown', onPointerDown, true);
    page.addEventListener('focusin', onFocusIn, true);
    page.addEventListener('beforeinput', onInput, true);
    trigger.addEventListener('focusout', onFocusOut);
    return () => {
      page.removeEventListener('keydown', onKeyDown, true);
      page.removeEventListener('keyup', onKeyUp, true);
      page.removeEventListener('pointerdown', onPointerDown, true);
      page.removeEventListener('focusin', onFocusIn, true);
      page.removeEventListener('beforeinput', onInput, true);
      trigger.removeEventListener('focusout', onFocusOut);
    };
  }, [triggerRef, waiting]);
}
