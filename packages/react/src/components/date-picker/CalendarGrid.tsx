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
import { mergeProps, useCalendarCell, useCalendarGrid, useLocale } from 'react-aria';
import type { CalendarState, RangeCalendarState } from 'react-stately';
import { usePageDateFormatter } from '../../primitives/use-page-formatters';
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
  // The weekdays in the page's locale, as the headline and menus: React Aria's are in its own,
  // which in a region laid out the other way is the locale in another script.
  const narrowWeekday = usePageDateFormatter({ weekday: 'narrow' });
  const longWeekday = usePageDateFormatter({ weekday: 'long' });
  const firstDay = startOfWeek(start, locale);
  // Compose always lays out six weeks, so the picker keeps its height between months.
  return (
    <table {...gridProps} className={styles.grid()}>
      <thead className={month ? 'sr-only' : undefined}>
        <tr>
          {weekDays.map((_, index) => {
            const day = firstDay.add({ days: index }).toDate(getLocalTimeZone());
            const name = longWeekday.format(day);
            return (
              <th
                key={index}
                scope="col"
                abbr={name}
                title={name}
                className={styles.weekday({ class: classNames?.weekday })}
              >
                {narrowWeekday.format(day)}
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
  } = useCalendarCell({ date }, state, ref);
  // The day in the page's digits, as React Aria writes it (its calendar, the state's time zone):
  // React Aria's own `formattedDate` is in its locale, which in a region laid out the other way
  // takes the new script's digits (`ar-Latn-EG` writes an Arabic page's days in Latin ones).
  const dayFormat = usePageDateFormatter({
    day: 'numeric',
    timeZone: state.timeZone,
    calendar: date.calendar.identifier,
  });
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
        {dayFormat.format(date.toDate(state.timeZone))}
      </div>
    </td>
  );
}
