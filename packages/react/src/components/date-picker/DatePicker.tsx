'use client';

import {
  createCalendar,
  getLocalTimeZone,
  today,
  type CalendarDate,
  type DateValue,
} from '@internationalized/date';
import {
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import {
  useCalendar,
  useDateField,
  useDateFormatter,
  useDateSegment,
  useLocale,
  useRangeCalendar,
  type AriaButtonProps,
} from 'react-aria';
import {
  useCalendarState,
  useDateFieldState,
  useRangeCalendarState,
  type CalendarState,
  type DateFieldState,
  type DateSegment,
  type RangeCalendarState,
} from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { CalendarGrid } from './CalendarGrid';
import { dateFieldStyles, datePickerStyles } from './date-picker-styles';
import {
  ArrowDropDownIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EditIcon,
} from './picker-icons';

/** The picker's labels, for localisation. */
export interface DatePickerStrings {
  /** @default "Select date" (or "Select dates" for a range) */
  title?: string;
  /** Headline when nothing is selected. @default "Selected date" / "Start date – End date" */
  noSelection?: string;
  previousMonth?: string;
  nextMonth?: string;
  /** @default "Switch to selecting a year" */
  showYears?: string;
  /** @default "Switch to selecting a day" */
  showDays?: string;
  /** @default "Switch to text input mode" */
  inputMode?: string;
  /** @default "Switch to calendar input mode" */
  calendarMode?: string;
  /** Label of the input mode's field. @default "Date" */
  dateLabel?: string;
  startDateLabel?: string;
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
  /** First and last selectable years in the year list. @default [1900, 2100] */
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
};

/**
 * M3 date picker (Compose's `DatePicker`): a header with the selected date, a month grid
 * with month navigation and a year list, and a text input mode. Put it in a
 * {@link PickerDialog} for the modal form. Values are `@internationalized/date` dates.
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
 * M3 date range picker (Compose's `DateRangePicker`): select a start and an end date on the
 * month grid, or type them in input mode.
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
          onChange={(date) => date && setValue(date)}
          minValue={props.minValue}
          maxValue={props.maxValue}
        />
      }
    />
  );
}

function RangeDatePicker(props: Inner<DateRangePickerProps>) {
  const { locale } = useLocale();
  const [value, setValue] = useControlledState(
    props.value,
    props.defaultValue ?? null,
    props.onChange as (value: DateRange | null) => void,
  );
  const state = useRangeCalendarState({
    value,
    onChange: (range) => setValue(range as DateRange),
    minValue: props.minValue,
    maxValue: props.maxValue,
    isDateUnavailable: props.isDateUnavailable,
    locale,
    createCalendar,
  });
  const formatter = useDateFormatter({ month: 'short', day: 'numeric' });
  const strings = props.strings ?? {};
  const format = (date: CalendarDate) => formatter.format(date.toDate(getLocalTimeZone()));
  const headline = value
    ? `${format(value.start)} – ${format(value.end)}`
    : (strings.noSelection ?? 'Start date – End date');
  return (
    <PickerFrame
      {...props}
      range
      state={state}
      headline={headline}
      input={
        <div className="flex flex-col gap-[16px]">
          <DateInput
            label={strings.startDateLabel ?? 'Start date'}
            value={value?.start ?? null}
            onChange={(start) =>
              start && setValue({ start, end: value && value.end >= start ? value.end : start })
            }
            minValue={props.minValue}
            maxValue={props.maxValue}
          />
          <DateInput
            label={strings.endDateLabel ?? 'End date'}
            value={value?.end ?? null}
            onChange={(end) =>
              end && setValue({ start: value && value.start <= end ? value.start : end, end })
            }
            minValue={props.minValue}
            maxValue={props.maxValue}
          />
        </div>
      }
    />
  );
}

function PickerFrame({
  range,
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
  state: CalendarState | RangeCalendarState;
  headline: string;
  input: ReactNode;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: unknown;
}) {
  const { data } = splitDataAttributes(rest);
  const [mode, setMode] = useState(defaultMode);
  const [years, setYears] = useState(false);
  const styles = datePickerStyles({ range });
  const title = strings.title ?? (range ? 'Select dates' : 'Select date');
  return (
    <div
      {...data}
      ref={(element) => {
        directionRef(element);
        if (typeof ref === 'function') ref(element);
        else if (ref) ref.current = element;
      }}
      style={style}
      data-years={years || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {showHeader && (
        <div className={styles.header({ class: classNames?.header })}>
          <div className={styles.title()}>{title}</div>
          <div className={styles.headlineRow()}>
            <div aria-live="polite" className={styles.headline()}>
              {headline}
            </div>
            {showModeToggle && (
              <IconButton
                icon={mode === 'calendar' ? <EditIcon /> : <CalendarIcon />}
                aria-label={
                  mode === 'calendar'
                    ? (strings.inputMode ?? 'Switch to text input mode')
                    : (strings.calendarMode ?? 'Switch to calendar input mode')
                }
                onPress={() => setMode(mode === 'calendar' ? 'input' : 'calendar')}
              />
            )}
          </div>
        </div>
      )}
      {mode === 'calendar' ? (
        range ? (
          <RangeCalendarBody
            state={state as RangeCalendarState}
            styles={styles}
            years={years}
            setYears={setYears}
            yearRange={yearRange}
            strings={strings}
            className={classNames?.body}
          />
        ) : (
          <SingleCalendarBody
            state={state as CalendarState}
            styles={styles}
            years={years}
            setYears={setYears}
            yearRange={yearRange}
            strings={strings}
            className={classNames?.body}
          />
        )
      ) : (
        <div className={styles.input({ class: classNames?.body })}>{input}</div>
      )}
    </div>
  );
}

interface BodyProps {
  styles: ReturnType<typeof datePickerStyles>;
  years: boolean;
  setYears: (open: boolean) => void;
  yearRange: [number, number];
  strings: DatePickerStrings;
  className?: string;
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
  const monthFormatter = useDateFormatter({ month: 'long', year: 'numeric' });
  const monthLabel = monthFormatter.format(state.visibleRange.start.toDate(getLocalTimeZone()));
  return (
    <div {...calendarProps} ref={bodyRef} className={styles.body({ class: className })}>
      <div className={styles.nav()}>
        <Button
          variant="text"
          className="text-on-surface-variant"
          aria-label={`${monthLabel}, ${years ? (strings.showDays ?? 'Switch to selecting a day') : (strings.showYears ?? 'Switch to selecting a year')}`}
          onPress={() => setYears(!years)}
          trailingIcon={
            <span className={styles.yearButtonIcon()}>
              <ArrowDropDownIcon />
            </span>
          }
        >
          <span aria-live="polite">{monthLabel}</span>
        </Button>
        {!years && (
          <div className={styles.navButtons()}>
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label={strings.previousMonth ?? 'Previous month'}
              onPress={prevButtonProps.onPress as () => void}
              disabled={prevButtonProps.isDisabled}
            />
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label={strings.nextMonth ?? 'Next month'}
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
          onPick={() => setYears(false)}
        />
      ) : (
        <CalendarGrid state={state} styles={styles} />
      )}
    </div>
  );
}

function YearList({
  state,
  styles,
  yearRange,
  onPick,
}: {
  state: CalendarState | RangeCalendarState;
  styles: ReturnType<typeof datePickerStyles>;
  yearRange: [number, number];
  onPick: () => void;
}) {
  const current = today(getLocalTimeZone()).year;
  const focusedYear = state.focusedDate.year;
  const first = Math.max(yearRange[0], state.minValue?.year ?? yearRange[0]);
  const last = Math.min(yearRange[1], state.maxValue?.year ?? yearRange[1]);
  return (
    <div
      role="radiogroup"
      aria-label="Year"
      className={styles.years()}
      ref={(element) => {
        // Open on the focused year, as Compose scrolls the year list to it.
        element
          ?.querySelector<HTMLElement>('[aria-checked="true"]')
          ?.scrollIntoView?.({ block: 'center' });
      }}
    >
      {Array.from({ length: last - first + 1 }, (_, i) => first + i).map((year) => (
        <YearButton
          key={year}
          year={year}
          selected={year === focusedYear}
          current={year === current}
          styles={styles}
          onPick={() => {
            state.setFocusedDate(state.focusedDate.set({ year }));
            onPick();
          }}
        />
      ))}
    </div>
  );
}

function YearButton({
  year,
  selected,
  current,
  styles,
  onPick,
}: {
  year: number;
  selected: boolean;
  current: boolean;
  styles: ReturnType<typeof datePickerStyles>;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      data-selected={selected || undefined}
      data-current={current || undefined}
      onClick={onPick}
      onKeyDown={(event) => {
        const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.key];
        if (step === undefined) return;
        event.preventDefault();
        const buttons = [...(event.currentTarget.parentElement?.children ?? [])] as HTMLElement[];
        const index = buttons.indexOf(event.currentTarget);
        const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
        const delta = rtl && Math.abs(step) === 1 ? -step : step;
        buttons[Math.min(Math.max(index + delta, 0), buttons.length - 1)]?.focus();
      }}
      className={styles.year()}
    >
      {year}
    </button>
  );
}

/** Compose's date input field, with React Aria's date segments. */
function DateInput({
  label,
  value,
  onChange,
  minValue,
  maxValue,
}: {
  label: string;
  value: CalendarDate | null;
  onChange: (value: CalendarDate | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
}) {
  const { locale } = useLocale();
  const state = useDateFieldState({
    label,
    value,
    onChange: (date) => onChange(date as CalendarDate | null),
    minValue,
    maxValue,
    granularity: 'day',
    locale,
    createCalendar,
  });
  const ref = useRef<HTMLDivElement>(null);
  const { labelProps, fieldProps, errorMessageProps } = useDateField({ label }, state, ref);
  const styles = dateFieldStyles();
  return (
    <div className={styles.root()}>
      <span {...labelProps} className={styles.label()}>
        {label}
      </span>
      <div
        {...fieldProps}
        ref={ref}
        data-invalid={state.isInvalid || undefined}
        className={styles.field()}
      >
        {state.segments.map((segment, index) => (
          <Segment key={index} segment={segment} state={state} styles={styles} />
        ))}
      </div>
      {state.isInvalid && (
        <span {...errorMessageProps} className={styles.error()}>
          {state.displayValidation.validationErrors.join(' ')}
        </span>
      )}
    </div>
  );
}

function Segment({
  segment,
  state,
  styles,
}: {
  segment: DateSegment;
  state: DateFieldState;
  styles: ReturnType<typeof dateFieldStyles>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { segmentProps } = useDateSegment(segment, state, ref);
  return (
    <div
      {...segmentProps}
      ref={ref}
      data-placeholder={segment.isPlaceholder || undefined}
      className={segment.type === 'literal' ? styles.literal() : styles.segment()}
    >
      {segment.text}
    </div>
  );
}
