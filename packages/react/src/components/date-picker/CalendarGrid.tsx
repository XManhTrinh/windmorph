'use client';

import {
  endOfMonth,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  isToday,
  startOfWeek,
  type CalendarDate,
} from '@internationalized/date';
import { useRef } from 'react';
import {
  mergeProps,
  useCalendarCell,
  useCalendarGrid,
  useDateFormatter,
  useLocale,
} from 'react-aria';
import type { CalendarState, RangeCalendarState } from 'react-stately';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import type { datePickerStyles } from './date-picker-styles';

type AnyCalendarState = CalendarState | RangeCalendarState;

const isRangeState = (state: AnyCalendarState): state is RangeCalendarState =>
  'highlightedRange' in state;

/**
 * The month grid of a date or date range picker (React Aria `useCalendarGrid`). Weekdays
 * are column headers named by their full name, which a hover shows too (M3: "the tooltip
 * is available on hover"). `month` draws one month of a multi-month list: days of other
 * months are left out, and the weekday row is for assistive technology only.
 */
export function CalendarGrid({
  state,
  styles,
  month,
  classNames,
}: {
  state: AnyCalendarState;
  styles: ReturnType<typeof datePickerStyles>;
  month?: CalendarDate;
  /** Consumer classes for the weekday headers and the days. */
  classNames?:
    | { weekday?: string | undefined; day?: string | undefined; rangeBand?: string | undefined }
    | undefined;
}) {
  const { locale } = useLocale();
  const start = month ?? state.visibleRange.start;
  const { gridProps, weekDays } = useCalendarGrid(
    month
      ? { startDate: month, endDate: endOfMonth(month), weekdayStyle: 'narrow' }
      : { weekdayStyle: 'narrow' },
    state,
  );
  const longWeekday = useDateFormatter({ weekday: 'long' });
  const firstDay = startOfWeek(start, locale);
  // Compose always lays out six weeks, so the picker keeps its height between months.
  return (
    <table {...gridProps} className={styles.grid()}>
      <thead className={month ? 'sr-only' : undefined}>
        <tr>
          {weekDays.map((day, index) => {
            const name = longWeekday.format(
              firstDay.add({ days: index }).toDate(getLocalTimeZone()),
            );
            return (
              <th
                key={index}
                scope="col"
                abbr={name}
                title={name}
                className={styles.weekday({ class: classNames?.weekday })}
              >
                {day}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex, start)
              .map((date, index) =>
                date && (!month || isSameMonth(date, month)) ? (
                  <CalendarCell
                    key={index}
                    state={state}
                    date={date}
                    styles={styles}
                    shownMonth={start}
                    className={classNames?.day}
                    rangeBandClassName={classNames?.rangeBand}
                  />
                ) : (
                  <td key={index} aria-hidden="true" className={styles.cell()} />
                ),
              )}
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
  shownMonth,
  className,
  rangeBandClassName,
}: {
  state: AnyCalendarState;
  date: CalendarDate;
  styles: ReturnType<typeof datePickerStyles>;
  shownMonth: CalendarDate;
  className: string | undefined;
  /** Classes for a cell the range band spans. */
  rangeBandClassName: string | undefined;
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
  // Days of the months around this one (the docked picker shows them) can't be chosen.
  const isOutside = isOutsideVisibleRange || !isSameMonth(date, shownMonth);
  const disabled = isDisabled || isUnavailable;
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: disabled || isOutside, isPressed },
    ref,
  );

  // Range: the ends are filled circles; the days between sit on the band.
  let range: 'start' | 'middle' | 'end' | undefined;
  let filled = isSelected;
  if (isRangeState(state) && state.highlightedRange && isSelected && !isOutside) {
    const { start, end } = state.highlightedRange;
    const isStart = isSameDay(date, start);
    const isEnd = isSameDay(date, end);
    filled = isStart || isEnd;
    range = isStart && isEnd ? undefined : isStart ? 'start' : isEnd ? 'end' : 'middle';
  }

  return (
    <td
      {...cellProps}
      data-slot="cell"
      data-range={range}
      className={styles.cell({ class: range ? rangeBandClassName : undefined })}
    >
      <div
        {...mergeProps(buttonProps, interactionProps)}
        {...dataAttributes}
        ref={ref}
        data-slot="day"
        data-selected={(filled && !isOutside) || undefined}
        data-in-range={range === 'middle' || undefined}
        data-today={(isToday(date, getLocalTimeZone()) && !isOutside) || undefined}
        data-disabled={disabled || undefined}
        data-outside={isOutside || undefined}
        className={styles.day({ class: className })}
      >
        {formattedDate}
      </div>
    </td>
  );
}
