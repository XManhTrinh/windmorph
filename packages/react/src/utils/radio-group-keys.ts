import type { FocusEvent, KeyboardEvent } from 'react';
import { hasModifier, isRtl, moveFor, target, TEXT_ENTRY } from './composite-keys';
import { tabbables } from './focus';

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
