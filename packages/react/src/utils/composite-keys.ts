import type { KeyboardEvent } from 'react';

/*
 * What the composite widgets' keyboard handlers share: which move a key asks for, where it
 * lands, and when to leave a key alone. The handlers live in `toolbar-keys.ts` and
 * `radio-group-keys.ts`, so each component loads only the pattern it uses.
 */

/** The axis a composite widget's arrow keys move along. */
export type KeyOrientation = 'horizontal' | 'vertical';

/** Text entry keeps its arrow, Home and End keys for the caret (APG toolbar pattern). */
export const TEXT_ENTRY =
  'textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="checkbox"], [type="radio"], [type="submit"], [type="reset"], [type="image"], [type="range"], [type="color"], [type="file"])';

export function isRtl(root: Element): boolean {
  return getComputedStyle(root).direction === 'rtl';
}

/** The move a key asks for: one step either way, or to an end. */
export type Move = 1 | -1 | 'first' | 'last';

export function moveFor(
  key: string,
  axes: 'horizontal' | 'vertical' | 'both',
  rtl: boolean,
): Move | null {
  const horizontal = axes !== 'vertical';
  const vertical = axes !== 'horizontal';
  switch (key) {
    case 'ArrowRight':
      return horizontal ? (rtl ? -1 : 1) : null;
    case 'ArrowLeft':
      return horizontal ? (rtl ? 1 : -1) : null;
    case 'ArrowDown':
      return vertical ? 1 : null;
    case 'ArrowUp':
      return vertical ? -1 : null;
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    default:
      return null;
  }
}

/** The item a move lands on, wrapping from one end to the other. */
export function target<T>(items: T[], current: number, move: Move): T | undefined {
  if (move === 'first') return items[0];
  if (move === 'last') return items.at(-1);
  return items[(current + move + items.length) % items.length];
}

export function hasModifier(event: KeyboardEvent) {
  return event.altKey || event.ctrlKey || event.metaKey;
}
