'use client';

import type { CalendarDate } from '@internationalized/date';
import {
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { mergeProps, useLocale } from 'react-aria';
import type { CalendarState, RangeCalendarState } from 'react-stately';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { IconButton } from '../icon-button/IconButton';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';

/* Behaviour shared by the modal date pickers and the docked one. */

/** A day can be chosen: inside the range and not turned away. */
export const isSelectable = (state: CalendarState | RangeCalendarState, date: CalendarDate) =>
  !state.isCellDisabled(date) && !state.isCellUnavailable(date);

/**
 * Keys the M3 date picker keyboard table adds to React Aria's grid: Enter closes and
 * saves (once a range has both ends), Shift+M moves to the month menu and Shift+Y to the
 * year menu. Runs in the capture phase, before the grid handles Enter.
 */
export function usePickerKeys(
  state: CalendarState | RangeCalendarState,
  {
    onConfirm,
    onMonthMenu,
    onYearMenu,
  }: { onConfirm?: (() => void) | undefined; onMonthMenu: () => void; onYearMenu: () => void },
) {
  return (event: KeyboardEvent<HTMLElement>) => {
    const inGrid = (event.target as Element).closest('[role="grid"]') !== null;
    if (event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const key = event.key.toLowerCase();
      if (key === 'm' || key === 'y') {
        event.preventDefault();
        event.stopPropagation();
        if (key === 'm') onMonthMenu();
        else onYearMenu();
        return;
      }
    }
    if (event.key !== 'Enter' || !inGrid || !onConfirm) return;
    if (!isSelectable(state, state.focusedDate)) return;
    // A range is done when this Enter picks its second end.
    if ('anchorDate' in state && !state.anchorDate) return;
    onConfirm();
  };
}

/**
 * Pages months with a horizontal swipe (M3: "To navigate across months, swipe
 * horizontally"), mirrored in right-to-left layouts, and slides each new month in from
 * the side it comes from.
 */
export function useMonthSwipe(state: CalendarState | RangeCalendarState) {
  const { direction } = useLocale();
  const start = state.visibleRange.start;
  const [shown, setShown] = useState<{
    month: CalendarDate;
    direction: 'next' | 'previous' | undefined;
  }>({ month: start, direction: undefined });
  if (shown.month.compare(start) !== 0) {
    setShown({ month: start, direction: start.compare(shown.month) > 0 ? 'next' : 'previous' });
  }
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const swipeProps: HTMLAttributes<HTMLElement> = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      origin.current =
        event.pointerType === 'mouse'
          ? null
          : { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const from = origin.current;
      origin.current = null;
      if (!from || from.id !== event.pointerId) return;
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const forward = dx < 0 !== (direction === 'rtl');
      if (forward && !state.isNextVisibleRangeInvalid()) state.focusNextPage();
      if (!forward && !state.isPreviousVisibleRangeInvalid()) state.focusPreviousPage();
    },
    onPointerCancel: () => {
      origin.current = null;
    },
  };
  return { swipeProps, slideKey: start.toString(), slideDirection: shown.direction };
}

/** How far a finger travels sideways before it counts as a swipe. */
const SWIPE_DISTANCE = 48;

/** An icon button with a plain tooltip naming its keyboard shortcut (M3 date picker accessibility). */
export function ShortcutIconButton({
  icon,
  label,
  tooltip,
  onPress,
  disabled,
}: {
  icon: ReactElement;
  label: string;
  tooltip: string;
  onPress: () => void;
  disabled?: boolean | undefined;
}) {
  return (
    <TooltipTrigger>
      <IconButton
        variant="standard"
        icon={icon}
        aria-label={label}
        onPress={onPress}
        disabled={disabled}
      />
      <LazyTooltip>{tooltip}</LazyTooltip>
    </TooltipTrigger>
  );
}

/**
 * Moves focus between a roving group's enabled options with the arrow keys (left and
 * right mirrored in right-to-left layouts), skipping disabled ones.
 */
export function moveFocus(event: KeyboardEvent<HTMLElement>, steps: Record<string, number>) {
  const step = steps[event.key];
  if (step === undefined) return;
  event.preventDefault();
  const options = [...(event.currentTarget.parentElement?.children ?? [])] as HTMLElement[];
  const index = options.indexOf(event.currentTarget);
  const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
  const horizontal = event.key === 'ArrowLeft' || event.key === 'ArrowRight';
  const delta = rtl && horizontal ? -step : step;
  for (let i = index + delta; i >= 0 && i < options.length; i += delta) {
    if (!options[i]!.hasAttribute('data-disabled')) {
      options[i]!.focus();
      return;
    }
  }
}

/**
 * One option of a year or month list: a radio in a roving group, with M3 state layers,
 * disabled (still focusable, announced as unavailable) outside the allowed dates.
 */
export function ChoiceButton({
  selected,
  disabled,
  steps,
  onPick,
  className,
  children,
  'data-current': current,
}: {
  selected: boolean;
  disabled: boolean;
  /** Arrow keys and how many options each moves. */
  steps: Record<string, number>;
  onPick: () => void;
  className: string;
  children: ReactNode;
  'data-current'?: true | undefined;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled, onPress: onPick },
    ref,
  );
  return (
    <button
      {...mergeProps(interactionProps, {
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => moveFocus(event, steps),
      })}
      {...dataAttributes}
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={selected ? 0 : -1}
      data-selected={selected || undefined}
      data-current={current}
      data-disabled={disabled || undefined}
      className={className}
    >
      {children}
    </button>
  );
}
