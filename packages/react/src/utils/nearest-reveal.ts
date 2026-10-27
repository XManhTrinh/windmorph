import { useLayoutEffect, type RefObject } from 'react';

/**
 * Arrow keys must not jump the page. When keyboard focus moves to an item, React Aria
 * reveals it by calling `scrollIntoView({ block: 'center', inline: 'center' })` on the
 * collection's root whenever the root isn't wholly on screen, which scrolls every ancestor,
 * the window included, to centre the root (176px for a tab row, 200px for a list taller
 * than the window), and then reveals the item. The root's own `scrollIntoView` asks for the
 * nearest position instead, so the page moves only as far as the item needs (2026-10-15).
 */
export function useNearestReveal(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.scrollIntoView = (arg?: boolean | ScrollIntoViewOptions) =>
      Element.prototype.scrollIntoView?.call(
        root,
        typeof arg === 'object' ? { ...arg, block: 'nearest', inline: 'nearest' } : arg,
      );
    return () => {
      Reflect.deleteProperty(root, 'scrollIntoView');
    };
  }, [rootRef]);
}
