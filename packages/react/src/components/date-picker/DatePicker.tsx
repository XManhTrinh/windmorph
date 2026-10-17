'use client';

import {
  CalendarDate,
  createCalendar,
  getLocalTimeZone,
  maxDate,
  minDate,
  startOfWeek,
  toCalendarDate,
  today,
  type DateValue,
} from '@internationalized/date';
import {
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type TransitionEvent,
} from 'react';
import {
  mergeProps,
  useCalendar,
  useDateFormatter,
  useLocale,
  useRangeCalendar,
  type AriaButtonProps,
} from 'react-aria';
import {
  useCalendarState,
  useRangeCalendarState,
  type CalendarState,
  type RangeCalendarState,
} from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { useSizeTransform } from './use-size-transform';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';
import { CalendarGrid } from './CalendarGrid';
import { ChoiceButton, ShortcutIconButton, useMonthSwipe, usePickerKeys } from './calendar-parts';
import type { Density } from '../../tokens/density';
import { DateInput, type DateInputLabels } from './DateInput';
import { datePickerStyles } from './date-picker-styles';
import { PickerDialogContext } from './picker-dialog-context';
import {
  ArrowDropDownIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
} from './picker-icons';

/** The picker's labels, for localisation. */
export interface DatePickerLabels extends DateInputLabels {
  /** The header's title in calendar mode. @default "Select date", or "Select dates" for a range */
  title: string;
  /**
   * The title in text input mode (the M3 modal date input's "Enter date").
   * @default "Enter date", or "Enter dates" for a range
   */
  inputTitle: string;
  /** Headline when nothing is selected. @default "Selected date" / "Start date – End date" */
  noSelection: string;
  /** The previous month button. @default "Previous month" */
  previousMonth: string;
  /** The next month button. @default "Next month" */
  nextMonth: string;
  /** Tooltip of the previous-month button, naming its shortcut. @default "Previous month (Page Up)" */
  previousMonthTooltip: string;
  /** Tooltip of the next-month button, naming its shortcut. @default "Next month (Page Down)" */
  nextMonthTooltip: string;
  /** The month and year button while the days show. @default "Switch to selecting a year" */
  showYears: string;
  /** The month and year button while the years show. @default "Switch to selecting a day" */
  showDays: string;
  /** Tooltip of the month and year button, naming its shortcut. @default "Choose a year (Shift+Y)" */
  yearsTooltip: string;
  /** Name of the year list. @default "Year" */
  yearList: string;
  /** The mode toggle in calendar mode. @default "Switch to text input mode" */
  inputMode: string;
  /** The mode toggle in text input mode. @default "Switch to calendar input mode" */
  calendarMode: string;
  /** Label of the input mode's field. @default "Date" */
  dateLabel: string;
  /** Label of a range's start field in input mode. @default "Start date" */
  startDateLabel: string;
  /**
   * Label of a range's end field in input mode, and the headline's end while a range is
   * being picked ("Mar 20 – End date"). @default "End date"
   */
  endDateLabel: string;
}

export interface DatePickerClassNames {
  /** The picker's root; `className` is merged here too. */
  root?: string;
  /** The header: title, headline and mode toggle. */
  header?: string;
  /** The header's title ("Select date"). */
  title?: string;
  /** The header's headline: the chosen date or range. */
  headline?: string;
  /** The calendar or the text input below the header. */
  body?: string;
  /** The weekday names above the days. */
  weekday?: string;
  /** Each day of the calendar. */
  day?: string;
  /** Each year of the year list. */
  year?: string;
  /** The month and year button above the days, which shows the year list. */
  yearButton?: string;
  /** Each month's subhead in the range picker's scrolling month list. */
  monthSubhead?: string;
}

export interface DateRangePickerClassNames extends DatePickerClassNames {
  /**
   * The band behind a range's days: each calendar cell it spans (`data-range` is `start`,
   * `middle` or `end`), whose background paints it.
   */
  rangeBand?: string;
}

interface DatePickerCommonProps {
  /** Earliest date allowed; earlier days are disabled. */
  min?: DateValue;
  /** Latest date allowed; later days are disabled. */
  max?: DateValue;
  /** Returns `true` for a day that can't be picked (it shows disabled). */
  isDateUnavailable?: (date: DateValue) => boolean;
  /** Show the header (title, headline and mode toggle). @default true */
  showHeader?: boolean;
  /** Show the calendar ↔ text input toggle. @default true */
  showModeToggle?: boolean;
  /** Start in calendar or text input mode. @default "calendar" */
  defaultMode?: 'calendar' | 'input';
  /**
   * First and last years of the year list (and of a range's month list). Years outside
   * `min` / `max` are shown disabled. @default [1900, 2100]
   */
  yearRange?: [number, number];
  /** Words the picker shows and announces, with English defaults. */
  labels?: Partial<DatePickerLabels>;
  /**
   * Web density of the input mode's text fields, `0` to `-3`: each step takes 4px off them
   * (56px at 0, 44px at -3). The calendar keeps its size: M3 doesn't make date pickers denser,
   * since their 48px day targets are part of their accessibility. Left out, the fields take
   * the density of the nearest `ThemeProvider` or `ThemeScope`.
   * @default 0
   */
  density?: Density;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: DatePickerClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type DatePickerProps = DatePickerCommonProps & {
  /** The selected date (controlled); `null` for none. */
  value?: CalendarDate | null;
  /** Initial date when uncontrolled. @default null */
  defaultValue?: CalendarDate | null;
  /** Called with the date the user picks or types. */
  onChange?: (value: CalendarDate) => void;
};

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export type DateRangePickerProps = Omit<DatePickerCommonProps, 'classNames'> & {
  /** Classes for each part, by slot. */
  classNames?: DateRangePickerClassNames;
  /** The selected range (controlled); `null` for none. */
  value?: DateRange | null;
  /** Initial range when uncontrolled. @default null */
  defaultValue?: DateRange | null;
  /** Called with the range once both its start and end are picked or typed. */
  onChange?: (value: DateRange) => void;
  /**
   * `scroll` lists the months one under another and scrolls vertically, as the M3 modal
   * range picker does; `paged` shows one month at a time with previous / next buttons and
   * a year list, like the date picker. @default "scroll"
   */
  monthLayout?: 'scroll' | 'paged';
};

/**
 * M3 modal date picker (Compose's `DatePicker`): a header with the selected date, a month
 * grid you page with the arrows, a horizontal swipe or Page Up / Down, a year list, and a
 * text input mode. Put it in a {@link PickerDialog} for the modal form; {@link DateField}
 * is the docked form. Values are `@internationalized/date` dates.
 *
 * @example
 * <DatePicker value={date} onChange={setDate} />
 */
export function DatePicker(props: DatePickerProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <SingleDatePicker {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

/**
 * M3 date range picker (Compose's `DateRangePicker`): select a start and an end date on a
 * vertically scrolling list of months, or type them in input mode.
 *
 * @example
 * <DateRangePicker value={range} onChange={setRange} />
 */
export function DateRangePicker(props: DateRangePickerProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <RangeDatePicker {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

type Inner<P> = P & { directionRef: (element: HTMLElement | null) => void };

function SingleDatePicker(props: Inner<DatePickerProps>) {
  const { locale } = useLocale();
  const confirm = useContext(PickerDialogContext);
  const [value, setValue] = useControlledState(
    props.value,
    props.defaultValue ?? null,
    props.onChange as (value: CalendarDate | null) => void,
  );
  const state = useCalendarState({
    value,
    onChange: (date) => setValue(date as CalendarDate),
    minValue: props.min,
    maxValue: props.max,
    isDateUnavailable: props.isDateUnavailable,
    locale,
    createCalendar,
  });
  const formatter = useDateFormatter({ dateStyle: 'medium' });
  const labels = props.labels ?? {};
  const headline = value
    ? formatter.format(value.toDate(getLocalTimeZone()))
    : (labels.noSelection ?? 'Selected date');
  return (
    <PickerFrame
      {...props}
      range={false}
      state={state}
      headline={headline}
      input={
        <DateInput
          label={labels.dateLabel ?? 'Date'}
          value={value}
          onCommit={(date) => date && setValue(date)}
          onEnter={(date) => date && confirm?.requestConfirm()}
          min={props.min}
          max={props.max}
          isDateUnavailable={props.isDateUnavailable}
          labels={labels}
          density={props.density}
          className="w-full"
        />
      }
    />
  );
}

/** Whole months from `from` to `to`. */
const monthsBetween = (from: CalendarDate, to: CalendarDate) =>
  (to.year - from.year) * 12 + (to.month - from.month);

function RangeDatePicker({ monthLayout = 'scroll', ...props }: Inner<DateRangePickerProps>) {
  const { locale } = useLocale();
  const confirm = useContext(PickerDialogContext);
  const [value, setValue] = useControlledState(
    props.value,
    props.defaultValue ?? null,
    props.onChange as (value: DateRange | null) => void,
  );
  // The scrolling list shows every month of the year range (within min / max) at once.
  const [firstYear, lastYear] = props.yearRange ?? [1900, 2100];
  const scroll = monthLayout === 'scroll';
  const listStart = maxDate(
    new CalendarDate(firstYear, 1, 1),
    props.min ? toCalendarDate(props.min) : null,
  )!;
  const listEnd = minDate(
    new CalendarDate(lastYear, 12, 31),
    props.max ? toCalendarDate(props.max) : null,
  )!;
  const state = useRangeCalendarState({
    value,
    onChange: (range) => setValue(range as DateRange),
    minValue: scroll ? listStart : props.min,
    maxValue: scroll ? listEnd : props.max,
    isDateUnavailable: props.isDateUnavailable,
    visibleDuration: scroll ? { months: monthsBetween(listStart, listEnd) + 1 } : undefined,
    locale,
    createCalendar,
  });
  const formatter = useDateFormatter({ month: 'short', day: 'numeric' });
  const labels = props.labels ?? {};
  const format = (date: CalendarDate) => formatter.format(date.toDate(getLocalTimeZone()));
  // While a new range is being picked, its first day is the start and the end is still open
  // (Compose's headline: "Mar 20 – End date"), not the range it replaces.
  const anchor = state.anchorDate;
  const headline = anchor
    ? `${format(anchor)} – ${labels.endDateLabel ?? 'End date'}`
    : value
      ? `${format(value.start)} – ${format(value.end)}`
      : (labels.noSelection ?? 'Start date – End date');
  const common = {
    min: props.min,
    max: props.max,
    isDateUnavailable: props.isDateUnavailable,
    labels,
    density: props.density,
    className: 'w-full',
  };
  return (
    <PickerFrame
      {...props}
      range
      scroll={scroll}
      state={state}
      headline={headline}
      input={
        <>
          <DateInput
            {...common}
            label={labels.startDateLabel ?? 'Start date'}
            value={value?.start ?? null}
            onCommit={(start) =>
              start && setValue({ start, end: value && value.end >= start ? value.end : start })
            }
          />
          <DateInput
            {...common}
            label={labels.endDateLabel ?? 'End date'}
            value={value?.end ?? null}
            onCommit={(end) =>
              end && setValue({ start: value && value.start <= end ? value.start : end, end })
            }
            onEnter={(end) => end && value && confirm?.requestConfirm()}
          />
        </>
      }
    />
  );
}

function PickerFrame({
  range,
  scroll = false,
  state,
  headline,
  input,
  showHeader = true,
  showModeToggle = true,
  defaultMode = 'calendar',
  yearRange = [1900, 2100],
  labels = {},
  ref,
  className,
  style,
  classNames,
  directionRef,
  ...rest
}: Inner<Omit<DatePickerCommonProps, 'classNames'>> & {
  classNames?: DateRangePickerClassNames | undefined;
  range: boolean;
  scroll?: boolean;
  state: CalendarState | RangeCalendarState;
  headline: string;
  input: ReactNode;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: unknown;
}) {
  const { data } = splitDataAttributes(rest);
  const [mode, setMode] = useState(defaultMode);
  // Set once the mode has been switched, so only a switch animates (not the first render).
  const [switched, setSwitched] = useState(false);
  const [years, setYears] = useState(false);
  // The picker's height follows the view on the default spatial spring (Compose's
  // `SizeTransform` in its display mode animation), as the views swap.
  const { attach: attachSize, capture: captureSize } = useSizeTransform<HTMLDivElement>(mode);
  const styles = datePickerStyles({ range });
  const title =
    mode === 'input'
      ? (labels.inputTitle ?? (range ? 'Enter dates' : 'Enter date'))
      : (labels.title ?? (range ? 'Select dates' : 'Select date'));
  const bodyProps = {
    styles,
    years,
    setYears,
    yearRange,
    labels,
    className: classNames?.body,
    classNames,
  };
  return (
    <div
      {...data}
      ref={(element) => {
        attachSize(element);
        directionRef(element);
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      style={style}
      // The modal date picker's component tokens (date-picker-tokens.ts).
      data-tokens={mergeDataTokens('md-comp-date-picker-modal', data)}
      data-years={years || undefined}
      data-mode={mode}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {showHeader && (
        <div className={styles.header({ class: classNames?.header })}>
          <div className={styles.title({ class: classNames?.title })}>{title}</div>
          <div className={styles.headlineRow()}>
            <div
              aria-live="polite"
              data-slot="headline"
              className={styles.headline({ class: classNames?.headline })}
            >
              {headline}
            </div>
            {showModeToggle && (
              <IconButton
                variant="standard"
                // The picker's surface isn't dense, only its input mode's fields.
                density={0}
                icon={mode === 'calendar' ? <EditIcon /> : <CalendarIcon />}
                aria-label={
                  mode === 'calendar'
                    ? (labels.inputMode ?? 'Switch to text input mode')
                    : (labels.calendarMode ?? 'Switch to calendar input mode')
                }
                onPress={() => {
                  captureSize();
                  setSwitched(true);
                  setMode(mode === 'calendar' ? 'input' : 'calendar');
                }}
              />
            )}
          </div>
        </div>
      )}
      <div key={mode} data-enter={switched ? mode : undefined} className={styles.modeView()}>
        {mode === 'input' ? (
          <div className={styles.input({ class: classNames?.body })}>{input}</div>
        ) : range && scroll ? (
          <RangeMonthList state={state as RangeCalendarState} {...bodyProps} />
        ) : range ? (
          <RangeCalendarBody state={state as RangeCalendarState} {...bodyProps} />
        ) : (
          <SingleCalendarBody state={state as CalendarState} {...bodyProps} />
        )}
      </div>
    </div>
  );
}

interface BodyProps {
  styles: ReturnType<typeof datePickerStyles>;
  years: boolean;
  setYears: (open: boolean) => void;
  yearRange: [number, number];
  labels: Partial<DatePickerLabels>;
  className?: string | undefined;
  classNames?: DateRangePickerClassNames | undefined;
}

function SingleCalendarBody({ state, ...props }: BodyProps & { state: CalendarState }) {
  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar({}, state);
  return (
    <CalendarBody
      {...props}
      state={state}
      calendarProps={calendarProps}
      prevButtonProps={prevButtonProps}
      nextButtonProps={nextButtonProps}
    />
  );
}

function RangeCalendarBody({ state, ...props }: BodyProps & { state: RangeCalendarState }) {
  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps } = useRangeCalendar({}, state, ref);
  return (
    <CalendarBody
      {...props}
      bodyRef={ref}
      state={state}
      calendarProps={calendarProps}
      prevButtonProps={prevButtonProps}
      nextButtonProps={nextButtonProps}
    />
  );
}

function CalendarBody({
  state,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
  styles,
  years,
  setYears,
  yearRange,
  labels,
  className,
  classNames,
  bodyRef,
}: BodyProps & {
  state: CalendarState | RangeCalendarState;
  calendarProps: HTMLAttributes<HTMLElement>;
  prevButtonProps: AriaButtonProps;
  nextButtonProps: AriaButtonProps;
  bodyRef?: Ref<HTMLDivElement>;
}) {
  const confirm = useContext(PickerDialogContext);
  const monthFormatter = useDateFormatter({ month: 'long', year: 'numeric' });
  const monthLabel = monthFormatter.format(state.visibleRange.start.toDate(getLocalTimeZone()));
  const menuRef = useRef<HTMLButtonElement>(null);
  const [focusYears, setFocusYears] = useState(false);
  // Compose shrinks the year list and fades it out (`shrinkVertically` + `fadeOut`); the
  // first of the two transitions to end removes it.
  const yearsPresence = usePresence(years, ['clip-path', 'opacity']);
  const { swipeProps, slideKey, slideDirection } = useMonthSwipe(state);
  const onKeyDownCapture = usePickerKeys(state, {
    onConfirm: confirm?.requestConfirm,
    onMonthMenu: () => menuRef.current?.focus(),
    onYearMenu: () => {
      setFocusYears(true);
      setYears(true);
    },
  });
  return (
    <div
      {...calendarProps}
      ref={bodyRef}
      onKeyDownCapture={onKeyDownCapture}
      className={styles.body({ class: className })}
    >
      <div className={styles.nav()}>
        <TooltipTrigger>
          <Button
            ref={menuRef}
            variant="text"
            className={cn('text-on-surface-variant', classNames?.yearButton)}
            aria-label={`${monthLabel}, ${years ? (labels.showDays ?? 'Switch to selecting a day') : (labels.showYears ?? 'Switch to selecting a year')}`}
            onPress={() => {
              setFocusYears(false);
              setYears(!years);
            }}
          >
            {/* The drop-down arrow trails the label here, which Button's one leading icon can't do. */}
            <span className="inline-flex items-center gap-[8px]">
              <span aria-live="polite">{monthLabel}</span>
              <span
                aria-hidden="true"
                className="inline-flex size-[20px] items-center justify-center"
              >
                <span className={styles.yearButtonIcon()}>
                  <ArrowDropDownIcon />
                </span>
              </span>
            </span>
          </Button>
          <LazyTooltip>{labels.yearsTooltip ?? 'Choose a year (Shift+Y)'}</LazyTooltip>
        </TooltipTrigger>
        {!years && (
          <div className={styles.navButtons()}>
            <ShortcutIconButton
              icon={<ChevronLeftIcon />}
              label={labels.previousMonth ?? 'Previous month'}
              tooltip={labels.previousMonthTooltip ?? 'Previous month (Page Up)'}
              onPress={prevButtonProps.onPress as () => void}
              disabled={prevButtonProps.isDisabled}
            />
            <ShortcutIconButton
              icon={<ChevronRightIcon />}
              label={labels.nextMonth ?? 'Next month'}
              tooltip={labels.nextMonthTooltip ?? 'Next month (Page Down)'}
              onPress={nextButtonProps.onPress as () => void}
              disabled={nextButtonProps.isDisabled}
            />
          </div>
        )}
      </div>
      {!years && (
        <div {...swipeProps} className={styles.swipe()}>
          <div key={slideKey} data-direction={slideDirection} className={styles.slide()}>
            <CalendarGrid state={state} styles={styles} classNames={classNames} />
          </div>
        </div>
      )}
      {/* Closing, the list stays over the grid until it has shrunk and faded away. */}
      {yearsPresence.isPresent && (
        <YearList
          state={state}
          styles={styles}
          yearRange={yearRange}
          className={classNames?.year}
          label={labels.yearList ?? 'Year'}
          autoFocus={focusYears}
          exiting={yearsPresence.isExiting}
          exitProps={yearsPresence.exitProps}
          onPick={() => setYears(false)}
        />
      )}
    </div>
  );
}

/**
 * The range picker's months, one under another in a vertical scroll (M3: "To navigate
 * across months, scroll vertically"), under a single weekday row. Only the months in view
 * (and the focused one) are rendered; the rest are spacers of the same fixed height.
 */
function RangeMonthList({
  state,
  styles,
  className,
  classNames,
}: BodyProps & { state: RangeCalendarState }) {
  const confirm = useContext(PickerDialogContext);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { calendarProps } = useRangeCalendar({}, state, ref);
  const { locale } = useLocale();
  const first = state.visibleRange.start;
  const count = monthsBetween(first, state.visibleRange.end) + 1;
  const focusedIndex = monthsBetween(first, state.focusedDate);
  const [view, setView] = useState(() => ({ top: focusedIndex * MONTH_HEIGHT, height: 0 }));
  const weekdays = useDateFormatter({ weekday: 'narrow' });
  const longWeekdays = useDateFormatter({ weekday: 'long' });
  const subhead = useDateFormatter({ month: 'long', year: 'numeric' });
  const onKeyDownCapture = usePickerKeys(state, {
    onConfirm: confirm?.requestConfirm,
    onMonthMenu: () => undefined,
    onYearMenu: () => undefined,
  });

  // Open on the focused month (the range's start, or today), then follow the scroll.
  const initialTop = useRef(view.top);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = initialTop.current;
    const measure = () => setView({ top: list.scrollTop, height: list.clientHeight });
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(list);
    list.addEventListener('scroll', measure, { passive: true });
    return () => {
      observer?.disconnect();
      list.removeEventListener('scroll', measure);
    };
  }, []);

  const height = view.height || MONTH_HEIGHT;
  let from = Math.max(0, Math.floor(view.top / MONTH_HEIGHT) - 1);
  let to = Math.min(count - 1, Math.floor((view.top + height) / MONTH_HEIGHT) + 1);
  if (state.isFocused) {
    from = Math.min(from, focusedIndex);
    to = Math.max(to, focusedIndex);
  }
  const weekStart = startOfWeek(today(getLocalTimeZone()), locale);

  return (
    <div
      {...mergeProps(calendarProps, { onKeyDownCapture })}
      ref={ref}
      className={styles.body({ class: cn('min-h-0 flex-1', className) })}
    >
      <div aria-hidden="true" className={styles.weekdayRow()}>
        {Array.from({ length: 7 }, (_, index) => {
          const day = weekStart.add({ days: index }).toDate(getLocalTimeZone());
          return (
            <span
              key={index}
              title={longWeekdays.format(day)}
              className={styles.weekdayCell({ class: classNames?.weekday })}
            >
              {weekdays.format(day)}
            </span>
          );
        })}
      </div>
      <div ref={listRef} className={styles.months()}>
        <div style={{ height: from * MONTH_HEIGHT }} />
        {Array.from({ length: to - from + 1 }, (_, i) => {
          const month = first.add({ months: from + i });
          return (
            <div key={month.toString()} className="h-[336px]">
              <div
                aria-hidden="true"
                className={styles.monthSubhead({ class: classNames?.monthSubhead })}
              >
                {subhead.format(month.toDate(getLocalTimeZone()))}
              </div>
              <CalendarGrid state={state} styles={styles} month={month} classNames={classNames} />
            </div>
          );
        })}
        <div style={{ height: (count - 1 - to) * MONTH_HEIGHT }} />
      </div>
    </div>
  );
}

/** A month in the scrolling list: its 48px subhead and six 48px weeks. */
const MONTH_HEIGHT = 336;

function YearList({
  state,
  styles,
  yearRange,
  className,
  label,
  autoFocus,
  exiting,
  exitProps,
  onPick,
}: {
  state: CalendarState | RangeCalendarState;
  styles: ReturnType<typeof datePickerStyles>;
  yearRange: [number, number];
  className: string | undefined;
  label: string;
  autoFocus: boolean;
  /** Closing: drawn over the grid, out of the accessibility tree and taking no presses. */
  exiting: boolean;
  exitProps: { onTransitionEnd: (event: TransitionEvent<HTMLElement>) => void };
  onPick: () => void;
}) {
  const current = today(getLocalTimeZone()).year;
  const focusedYear = state.focusedDate.year;
  const minYear = state.minValue?.year ?? -Infinity;
  const maxYear = state.maxValue?.year ?? Infinity;
  return (
    <div
      {...exitProps}
      role="radiogroup"
      aria-label={label}
      aria-hidden={exiting || undefined}
      inert={exiting || undefined}
      data-exiting={exiting || undefined}
      className={styles.years()}
      ref={(element) => {
        if (exiting) return;
        // Open on the focused year, as Compose scrolls the year list to it.
        const selected = element?.querySelector<HTMLElement>('[aria-checked="true"]');
        selected?.scrollIntoView?.({ block: 'center' });
        if (autoFocus) selected?.focus({ preventScroll: true });
      }}
    >
      {Array.from({ length: yearRange[1] - yearRange[0] + 1 }, (_, i) => yearRange[0] + i).map(
        (year) => (
          <ChoiceButton
            key={year}
            selected={year === focusedYear}
            disabled={year < minYear || year > maxYear}
            data-current={year === current || undefined}
            steps={YEAR_STEPS}
            className={styles.year({ class: className })}
            onPick={() => {
              state.setFocusedDate(state.focusedDate.set({ year }));
              onPick();
            }}
          >
            {year}
          </ChoiceButton>
        ),
      )}
    </div>
  );
}

/** Three years to a row. */
const YEAR_STEPS = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
