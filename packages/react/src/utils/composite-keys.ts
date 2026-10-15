import type { FocusEvent, KeyboardEvent } from 'react';
import { tabbables } from './focus';

/** The axis a composite widget's arrow keys move along. */
export type KeyOrientation = 'horizontal' | 'vertical';

/** Text entry keeps its arrow, Home and End keys for the caret (APG toolbar pattern). */
const TEXT_ENTRY =
  'textarea, [contenteditable]:not([contenteditable="false"]), input:not([type="button"], [type="checkbox"], [type="radio"], [type="submit"], [type="reset"], [type="image"], [type="range"], [type="color"], [type="file"])';

function isRtl(root: Element): boolean {
  return getComputedStyle(root).direction === 'rtl';
}

/** The move a key asks for: one step either way, or to an end. */
type Move = 1 | -1 | 'first' | 'last';

function moveFor(key: string, axes: 'horizontal' | 'vertical' | 'both', rtl: boolean): Move | null {
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
function target<T>(items: T[], current: number, move: Move): T | undefined {
  if (move === 'first') return items[0];
  if (move === 'last') return items.at(-1);
  return items[(current + move + items.length) % items.length];
}

function hasModifier(event: KeyboardEvent) {
  return event.altKey || event.ctrlKey || event.metaKey;
}

/**
 * The WAI-ARIA APG toolbar keys, for a toolbar's `onKeyDownCapture`: the arrow keys along
 * its orientation move focus to the next or previous control, wrapping at the ends, and
 * Home and End move to the first and last (left and right follow the laid-out direction).
 * A text field keeps these keys for its caret. Handled keys stop here, so a group nested
 * in the toolbar doesn't move focus too. Returns whether the key was handled.
 */
export function toolbarKeyDown(event: KeyboardEvent<HTMLElement>, orientation: KeyOrientation) {
  const root = event.currentTarget;
  const from = event.target as HTMLElement;
  if (hasModifier(event) || from.matches(TEXT_ENTRY)) return false;
  const move = moveFor(event.key, orientation, isRtl(root));
  if (move === null) return false;
  const items = tabbables(root);
  const current = items.findIndex((item) => item === from || item.contains(from));
  if (current < 0) return false;
  event.preventDefault();
  event.stopPropagation();
  target(items, current, move)?.focus();
  return true;
}

/** A group's radios that can be checked, in order. */
function radios(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('[role="radio"]')].filter(
    (radio) =>
      !radio.matches(':disabled, [aria-disabled="true"]') &&
      !radio.closest('[hidden], [inert]') &&
      (!('checkVisibility' in radio) || radio.checkVisibility()),
  );
}

/**
 * The WAI-ARIA APG radio group keys, for a single-selection group of toggle buttons with
 * `role="radio"`: every arrow key moves to the next or previous radio and checks it,
 * wrapping at the ends (left and right follow the laid-out direction), and Home and End
 * check the first and last. The radio is checked with a click, as a native radio's arrow
 * keys do, so its press handlers run. Other controls in the group (a button group's overflow
 * button) stay on the arrow keys' path without being checked, as in the APG toolbar that
 * holds a radio group. Returns whether the key was handled.
 */
export function radioGroupKeyDown(event: KeyboardEvent<HTMLElement>) {
  const root = event.currentTarget;
  const from = event.target as HTMLElement;
  if (hasModifier(event) || from.matches(TEXT_ENTRY)) return false;
  const move = moveFor(event.key, 'both', isRtl(root));
  if (move === null) return false;
  const choices = radios(root);
  const items = [...new Set([...tabbables(root), ...choices])].sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  );
  const current = items.findIndex((item) => item === from || item.contains(from));
  if (current < 0) return false;
  event.preventDefault();
  event.stopPropagation();
  const next = target(items, current, move);
  if (!next || next === items[current]) return true;
  next.focus();
  if (choices.includes(next) && next.getAttribute('aria-checked') !== 'true') next.click();
  return true;
}

/**
 * Tab into a radio group lands on its checked radio (WAI-ARIA APG), for the group's
 * `onFocus`: when focus arrives from outside on another radio, it moves to the checked one.
 * Returns whether the group has a checked radio (so the caller's own focus restoring
 * applies only when it hasn't).
 */
export function focusCheckedRadio(event: FocusEvent<HTMLElement>): boolean {
  const root = event.currentTarget;
  const from = event.relatedTarget as Node | null;
  if (from && root.contains(from)) return false;
  const checked = radios(root).find((radio) => radio.getAttribute('aria-checked') === 'true');
  if (!checked) return false;
  if (checked !== event.target && (event.target as Element).matches('[role="radio"]'))
    checked.focus();
  return true;
}
