'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/**
 * Arrow keys must not jump the page. When keyboard focus moves to an item, React Aria
 * reveals it by calling `scrollIntoView({ block: 'center', inline: 'center' })` on the
 * collection's root whenever the root isn't wholly on screen, which scrolls every ancestor,
 * the window included, to centre the root (176px for a tab row, 200px for a list taller
 * than the window), and then reveals the item. The root's own `scrollIntoView` asks for the
 * nearest position instead, so the page moves only as far as the item needs (2026-10-15).
 *
 * Public in `/primitives` (2026-11-17) for collections built on React Aria's hooks outside
 * the core, such as a grid that scrolls inside a box of its own.
 *
 * @param rootRef The element React Aria's collection hook was given: a list, tab row or grid.
 * @example
 * const ref = useRef<HTMLTableElement>(null);
 * const { gridProps } = useTable(props, state, ref);
 * useNearestReveal(ref);
 */
export function useNearestReveal(rootRef: RefObject<HTMLElement | null>) {
  // The root patched now: checked after every commit, so a root that mounts later (once data
  // loads) or is replaced is patched too, and the one before it given back its own.
  const patched = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root === patched.current) return;
    if (patched.current) Reflect.deleteProperty(patched.current, 'scrollIntoView');
    patched.current = root;
    if (!root) return;
    root.scrollIntoView = (arg?: boolean | ScrollIntoViewOptions) =>
      Element.prototype.scrollIntoView?.call(
        root,
        typeof arg === 'object' ? { ...arg, block: 'nearest', inline: 'nearest' } : arg,
      );
  });
  useLayoutEffect(
    () => () => {
      if (patched.current) Reflect.deleteProperty(patched.current, 'scrollIntoView');
      patched.current = null;
    },
    [],
  );
}
