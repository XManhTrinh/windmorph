'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

const RESET = ['height', 'overflow', 'transition'] as const;

/**
 * Compose's `SizeTransform` for a view that swaps its content (the date picker's calendar ↔
 * text input): call `capture()` just before the swap, and when `key` changes the element's
 * height moves from the captured height to its new one on the default spatial spring,
 * clipped, instead of jumping (2026-10-17). Inline styles exist only while it moves, so a
 * consumer's height class still decides the size at rest; a height that doesn't change, or
 * a spring with no duration (reduced motion), skips it.
 */
export function useSizeTransform<E extends HTMLElement>(key: unknown) {
  const ref = useRef<E | null>(null);
  const from = useRef<number | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const start = from.current;
    from.current = null;
    if (!element || start === null) return;
    for (const property of RESET) element.style.removeProperty(property);
    const end = element.getBoundingClientRect().height;
    if (Math.abs(end - start) < 0.5) return;
    element.style.height = `${start}px`;
    element.style.overflow = 'hidden';
    // Applies the start height before the transition is set.
    void element.offsetHeight;
    element.style.transition =
      'height var(--md-sys-motion-spring-spatial-default-duration) var(--md-sys-motion-spring-spatial-default-easing)';
    const reset = () => {
      for (const property of RESET) element.style.removeProperty(property);
    };
    if (parseFloat(getComputedStyle(element).transitionDuration) === 0) return reset();
    element.style.height = `${end}px`;
    const onEnd = (event: TransitionEvent) => {
      if (event.target === element && event.propertyName === 'height') reset();
    };
    element.addEventListener('transitionend', onEnd);
    element.addEventListener('transitioncancel', onEnd);
    return () => {
      element.removeEventListener('transitionend', onEnd);
      element.removeEventListener('transitioncancel', onEnd);
    };
  }, [key]);

  /** The element that changes height (a ref callback). */
  const attach = useCallback((element: E | null) => {
    ref.current = element;
  }, []);
  /** Records the height to start from; call it right before the content changes. */
  const capture = useCallback(() => {
    if (ref.current) from.current = ref.current.getBoundingClientRect().height;
  }, []);
  return { attach, capture };
}
