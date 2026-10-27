import type { KeyboardEvent } from 'react';
import {
  hasModifier,
  isRtl,
  moveFor,
  target,
  TEXT_ENTRY,
  type KeyOrientation,
} from './composite-keys';
import { tabbables } from './focus';

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
