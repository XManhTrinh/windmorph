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
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';
import { CalendarGrid } from './CalendarGrid';
import { ChoiceButton, ShortcutIconButton, useMonthSwipe, usePickerKeys } from './calendar-parts';
import { DateInput, type DateInputStrings } from './DateInput';
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
export interface DatePickerStrings extends DateInputStrings {
  /** @default "Select date" (or "Select dates" for a range) */
  title?: string;
  /**
   * The title in text input mode (the M3 modal date input's "Enter date").
   * @default "Enter date" (or "Enter dates" for a range)
   */
  inputTitle?: string;
  /** Headline when nothing is selected. @default "Selected date" / "Start date – End date" */
  noSelection?: string;
  /** @default "Previous month" */
  previousMonth?: string;
  /** @default "Next month" */
  nextMonth?: string;
  /** Tooltip of the previous-month button, naming its shortcut. @default "Previous month (Page Up)" */
  previousMonthTooltip?: string;
  /** Tooltip of the next-month button, naming its shortcut. @default "Next month (Page Down)" */
  nextMonthTooltip?: string;
  /** @default "Switch to selecting a year" */
  showYears?: string;
  /** @default "Switch to selecting a day" */
  showDays?: string;
  /** Tooltip of the month and year button, naming its shortcut. @default "Choose a year (Shift+Y)" */
  yearsTooltip?: string;
  /** Name of the year list. @default "Year" */
  yearList?: string;
  /** @default "Switch to text input mode" */
  inputMode?: string;
  /** @default "Switch to calendar input mode" */
  calendarMode?: string;
  /** Label of the input mode's field. @default "Date" */
  dateLabel?: string;
  /** @default "Start date" */
  startDateLabel?: string;
  /** @default "End date" */
  endDateLabel?: string;
}

export interface DatePickerClassNames {
  root?: string;
  header?: string;
  body?: string;
}

interface DatePickerCommonProps {
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  /** Show the header (title, headline and mode toggle). @default true */
  showHeader?: boolean;
  /** Show the calendar ↔ text input toggle. @default true */
  showModeToggle?: boolean;
  /** Start in calendar or text input mode. @default "calendar" */
  defaultMode?: 'calendar' | 'input';
  /**
   * First and last years of the year list (and of a range's month list). Years outside
   * `minValue` / `maxValue` are shown disabled. @default [1900, 2100]
   */
  yearRange?: [number, number];
  strings?: DatePickerStrings;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: DatePickerClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type DatePickerProps = DatePickerCommonProps & {
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate) => void;
};

export interface DateRange {
  start: CalendarDate;
  end: CalendarDate;
}

export type DateRangePickerProps = DatePickerCommonProps & {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
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
    minValue: props.minValue,
    maxValue: props.maxValue,
    isDateUnavailable: props.isDateUnavailable,
    locale,
    createCalendar,
  });
  const formatter = useDateFormatter({ dateStyle: 'medium' });
  const strings = props.strings ?? {};
  const headline = value
    ? formatter.format(value.toDate(getLocalTimeZone()))
    : (strings.noSelection ?? 'Selected date');
  return (
    <PickerFrame
      {...props}
      range={false}
      state={state}
      headline={headline}
      input={
        <DateInput
          label={strings.dateLabel ?? 'Date'}
          value={value}
          onCommit={(date) => date && setValue(date)}
          onEnter={(date) => date && confirm?.requestConfirm()}
          minValue={props.minValue}
          maxValue={props.maxValue}
          isDateUnavailable={props.isDateUnavailable}
          strings={strings}
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
    props.minValue ? toCalendarDate(props.minValue) : null,
  )!;
  const listEnd = minDate(
    new CalendarDate(lastYear, 12, 31),
    props.maxValue ? toCalendarDate(props.maxValue) : null,
  )!;
  const state = useRangeCalendarState({
    value,
    onChange: (range) => setValue(range as DateRange),
    minValue: scroll ? listStart : props.minValue,
    maxValue: scroll ? listEnd : props.maxValue,
    isDateUnavailable: props.isDateUnavailable,
    visibleDuration: scroll ? { months: monthsBetween(listStart, listEnd) + 1 } : undefined,
    locale,
    createCalendar,
  });
  const formatter = useDateFormatter({ month: 'short', day: 'numeric' });
  const strings = props.strings ?? {};
  const format = (date: CalendarDate) => formatter.format(date.toDate(getLocalTimeZone()));
  const headline = value
    ? `${format(value.start)} – ${format(value.end)}`
    : (strings.noSelection ?? 'Start date – End date');
  const common = {
    minValue: props.minValue,
    maxValue: props.maxValue,
    isDateUnavailable: props.isDateUnavailable,
    strings,
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
            label={strings.startDateLabel ?? 'Start date'}
            value={value?.start ?? null}
            onCommit={(start) =>
              start && setValue({ start, end: value && value.end >= start ? value.end : start })
            }
          />
          <DateInput
            {...common}
            label={strings.endDateLabel ?? 'End date'}
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
  strings = {},
  ref,
  className,
  style,
  classNames,
  directionRef,
  ...rest
}: Inner<DatePickerCommonProps> & {
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
  const styles = datePickerStyles({ range });
  const title =
    mode === 'input'
      ? (strings.inputTitle ?? (range ? 'Enter dates' : 'Enter date'))
      : (strings.title ?? (range ? 'Select dates' : 'Select date'));
  const bodyProps = {
    styles,
    years,
    setYears,
    yearRange,
    strings,
    className: classNames?.body,
  };
  return (
    <div
      {...data}
      ref={(element) => {
        directionRef(element);
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      style={style}
      // The modal date picker's component tokens (date-picker-tokens.ts).
      data-tokens="md-comp-date-picker-modal"
      data-years={years || undefined}
      data-mode={mode}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {showHeader && (
        <div className={styles.header({ class: classNames?.header })}>
          <div className={styles.title()}>{title}</div>
          <div className={styles.headlineRow()}>
            <div aria-live="polite" data-slot="headline" className={styles.headline()}>
              {headline}
            </div>
            {showModeToggle && (
              <IconButton
                variant="standard"
                icon={mode === 'calendar' ? <EditIcon /> : <CalendarIcon />}
                aria-label={
                  mode === 'calendar'
                    ? (strings.inputMode ?? 'Switch to text input mode')
                    : (strings.calendarMode ?? 'Switch to calendar input mode')
                }
                onPress={() => {
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
  strings: DatePickerStrings;
  className?: string | undefined;
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
  strings,
  className,
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
            className="text-on-surface-variant"
            aria-label={`${monthLabel}, ${years ? (strings.showDays ?? 'Switch to selecting a day') : (strings.showYears ?? 'Switch to selecting a year')}`}
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
          <LazyTooltip>{strings.yearsTooltip ?? 'Choose a year (Shift+Y)'}</LazyTooltip>
        </TooltipTrigger>
        {!years && (
          <div className={styles.navButtons()}>
            <ShortcutIconButton
              icon={<ChevronLeftIcon />}
              label={strings.previousMonth ?? 'Previous month'}
              tooltip={strings.previousMonthTooltip ?? 'Previous month (Page Up)'}
              onPress={prevButtonProps.onPress as () => void}
              disabled={prevButtonProps.isDisabled}
            />
            <ShortcutIconButton
              icon={<ChevronRightIcon />}
              label={strings.nextMonth ?? 'Next month'}
              tooltip={strings.nextMonthTooltip ?? 'Next month (Page Down)'}
              onPress={nextButtonProps.onPress as () => void}
              disabled={nextButtonProps.isDisabled}
            />
          </div>
        )}
      </div>
      {years ? (
        <YearList
          state={state}
          styles={styles}
          yearRange={yearRange}
          label={strings.yearList ?? 'Year'}
          autoFocus={focusYears}
          onPick={() => setYears(false)}
        />
      ) : (
        <div {...swipeProps} className={styles.swipe()}>
          <div key={slideKey} data-direction={slideDirection} className={styles.slide()}>
            <CalendarGrid state={state} styles={styles} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The range picker's months, one under another in a vertical scroll (M3: "To navigate
 * across months, scroll vertically"), under a single weekday row. Only the months in view
 * (and the focused one) are rendered; the rest are spacers of the same fixed height.
 */
function RangeMonthList({ state, styles, className }: BodyProps & { state: RangeCalendarState }) {
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
            <span key={index} title={longWeekdays.format(day)} className={styles.weekdayCell()}>
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
              <div aria-hidden="true" className={styles.monthSubhead()}>
                {subhead.format(month.toDate(getLocalTimeZone()))}
              </div>
              <CalendarGrid state={state} styles={styles} month={month} />
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
  label,
  autoFocus,
  onPick,
}: {
  state: CalendarState | RangeCalendarState;
  styles: ReturnType<typeof datePickerStyles>;
  yearRange: [number, number];
  label: string;
  autoFocus: boolean;
  onPick: () => void;
}) {
  const current = today(getLocalTimeZone()).year;
  const focusedYear = state.focusedDate.year;
  const minYear = state.minValue?.year ?? -Infinity;
  const maxYear = state.maxValue?.year ?? Infinity;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={styles.years()}
      ref={(element) => {
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
            className={styles.year()}
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
