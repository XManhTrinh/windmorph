'use client';

import {
  getLocalTimeZone,
  getWeeksInMonth,
  isSameDay,
  isToday,
  type CalendarDate,
} from '@internationalized/date';
import { useRef } from 'react';
import { mergeProps, useCalendarCell, useCalendarGrid, useLocale } from 'react-aria';
import type { CalendarState, RangeCalendarState } from 'react-stately';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import type { datePickerStyles } from './date-picker-styles';

type AnyCalendarState = CalendarState | RangeCalendarState;

const isRangeState = (state: AnyCalendarState): state is RangeCalendarState =>
  'highlightedRange' in state;

/** The month grid of a date or date range picker (React Aria `useCalendarGrid`). */
export function CalendarGrid({
  state,
  styles,
}: {
  state: AnyCalendarState;
  styles: ReturnType<typeof datePickerStyles>;
}) {
  const { locale } = useLocale();
  const { gridProps, headerProps, weekDays } = useCalendarGrid({ weekdayStyle: 'narrow' }, state);
  const weeks = getWeeksInMonth(state.visibleRange.start, locale);
  // Compose always lays out six weeks, so the picker keeps its height between months.
  return (
    <table {...gridProps} className={styles.grid()}>
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th key={index} className={styles.weekday()}>
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <tr key={weekIndex}>
            {weekIndex < weeks
              ? state
                  .getDatesInWeek(weekIndex)
                  .map((date, index) =>
                    date ? (
                      <CalendarCell key={index} state={state} date={date} styles={styles} />
                    ) : (
                      <td key={index} className={styles.cell()} />
                    ),
                  )
              : Array.from({ length: 7 }, (_, index) => (
                  <td key={index} aria-hidden="true" className={styles.cell()} />
                ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CalendarCell({
  state,
  date,
  styles,
}: {
  state: AnyCalendarState;
  date: CalendarDate;
  styles: ReturnType<typeof datePickerStyles>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    isUnavailable,
    isPressed,
    formattedDate,
  } = useCalendarCell({ date }, state, ref);
  const disabled = isDisabled || isUnavailable;
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled || isOutsideVisibleRange, isPressed },
    ref,
  );

  // Range: the ends are filled circles; the days between sit on the band.
  let range: 'start' | 'middle' | 'end' | undefined;
  let filled = isSelected;
  if (isRangeState(state) && state.highlightedRange && isSelected && !isOutsideVisibleRange) {
    const { start, end } = state.highlightedRange;
    const isStart = isSameDay(date, start);
    const isEnd = isSameDay(date, end);
    filled = isStart || isEnd;
    range = isStart && isEnd ? undefined : isStart ? 'start' : isEnd ? 'end' : 'middle';
  }

  return (
    <td {...cellProps} data-range={range} className={styles.cell()}>
      <div
        {...mergeProps(buttonProps, interactionProps)}
        {...dataAttributes}
        ref={ref}
        data-selected={filled || undefined}
        data-in-range={range === 'middle' || undefined}
        data-today={isToday(date, getLocalTimeZone()) || undefined}
        data-disabled={disabled || undefined}
        data-outside={isOutsideVisibleRange || undefined}
        className={styles.day()}
      >
        {formattedDate}
      </div>
    </td>
  );
}
