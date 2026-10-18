'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Measures an element's natural length on one axis (its used `width` or `height`, in
 * fractional px and untouched by transforms, as a scaled-down hidden FAB is), again whenever
 * it resizes, so a wrapper can animate its own width or height between 0 and that length.
 * A length in px lets a spring's overshoot show, which a `0fr ↔ 1fr` grid track can't (it
 * never passes its content's size). The element must keep its natural size while the
 * wrapper is closed (`w-max` / `h-max`, or `shrink-0`). The size is `undefined` until
 * measured (and on the server), so the wrapper can fall back to its natural size.
 *
 * `resized` is true for one frame after the content itself changed size (a web font
 * arriving, new text): the wrapper should follow it at once (`data-resized`, no
 * transition), as a grid track would, instead of springing to it.
 */
export function useNaturalSize<T extends HTMLElement = HTMLElement>(
  axis: 'width' | 'height' = 'width',
  enabled = true,
) {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<number>();
  const [resized, setResized] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    let measured: number | undefined;
    const measure = () => {
      const used = parseFloat(getComputedStyle(element)[axis]);
      const next = Number.isNaN(used) ? undefined : used;
      if (next === measured) return;
      if (measured !== undefined) setResized(true);
      measured = next;
      setSize(next);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [axis, enabled]);
  useEffect(() => {
    if (!resized) return;
    const frame = requestAnimationFrame(() => setResized(false));
    return () => cancelAnimationFrame(frame);
  }, [resized, size]);
  return [ref, size, resized] as const;
}
