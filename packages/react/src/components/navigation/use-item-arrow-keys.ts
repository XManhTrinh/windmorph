import type { KeyboardEvent } from 'react';

const isUsable = (element: HTMLElement) =>
  !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true';

/**
 * Arrow-key focus movement between navigation items (M3 rail: "Use arrows to move between
 * navigation items"). Up / Down (or Left / Right along a bar, mirrored right to left) move
 * focus to the previous or next item, wrapping, and Home / End to the first or last. Focus
 * moves without choosing a destination; Tab keeps working as usual.
 */
export function onItemArrowKeys(orientation: 'vertical' | 'horizontal') {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const list = event.currentTarget;
    const rtl = getComputedStyle(list).direction === 'rtl';
    const previousKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';
    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;
    const items = [...list.querySelectorAll<HTMLElement>('[data-nav-item]')].filter(isUsable);
    if (items.length === 0) return;
    const index = items.findIndex((item) => item.contains(document.activeElement));
    if (index === -1) return;
    let target: HTMLElement;
    if (event.key === 'Home') target = items[0]!;
    else if (event.key === 'End') target = items[items.length - 1]!;
    else {
      const step = event.key === nextKey ? 1 : -1;
      target = items[(index + step + items.length) % items.length]!;
    }
    event.preventDefault();
    target.focus();
  };
}
