'use client';

import {
  createCalendar,
  getLocalTimeZone,
  toCalendarDate,
  type CalendarDate,
  type DateValue,
} from '@internationalized/date';
import {
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useCalendar, useDateFormatter, useDialog, useLocale } from 'react-aria';
import { useCalendarState, useOverlayTriggerState } from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { OptionPopover } from '../select/option-list';
import type { TextFieldClassNames } from '../text-field/TextField';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import { TooltipTrigger } from '../tooltip/tooltip-trigger';
import { CalendarGrid } from './CalendarGrid';
import { ChoiceButton, ShortcutIconButton, useMonthSwipe, usePickerKeys } from './calendar-parts';
import { DateInput, type DateInputStrings } from './DateInput';
import { datePickerStyles, dockedDatePickerStyles } from './date-picker-styles';
import {
  ArrowDropDownIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from './picker-icons';

/** Words of a {@link DateField}, for localisation. */
export interface DateFieldStrings extends DateInputStrings {
  /** The calendar icon button. @default "Open calendar" */
  openCalendar?: string;
  /** Name of the dropdown calendar. @default "Choose a date" */
  calendar?: string;
  /** The previous month button. @default "Previous month" */
  previousMonth?: string;
  /** The next month button. @default "Next month" */
  nextMonth?: string;
  /** Tooltip of the previous month button. @default "Previous month (Page Up)" */
  previousMonthTooltip?: string;
  /** Tooltip of the next month button. @default "Next month (Page Down)" */
  nextMonthTooltip?: string;
  /** The previous year button. @default "Previous year" */
  previousYear?: string;
  /** The next year button. @default "Next year" */
  nextYear?: string;
  /** Tooltip of the previous year button. @default "Previous year (Shift+Page Up)" */
  previousYearTooltip?: string;
  /** Tooltip of the next year button. @default "Next year (Shift+Page Down)" */
  nextYearTooltip?: string;
  /** Added to the month menu button's name. @default "Choose a month" */
  chooseMonth?: string;
  /** Added to the year menu button's name. @default "Choose a year" */
  chooseYear?: string;
  /** Tooltip of the month menu button. @default "Choose a month (Shift+M)" */
  monthMenuTooltip?: string;
  /** Tooltip of the year menu button. @default "Choose a year (Shift+Y)" */
  yearMenuTooltip?: string;
  /** Name of the month list. @default "Month" */
  monthList?: string;
  /** Name of the year list. @default "Year" */
  yearList?: string;
  /** The calendar's dismissing action. @default "Cancel" */
  cancel?: string;
  /** The calendar's confirming action. @default "OK" */
  ok?: string;
}

export interface DateFieldClassNames extends Omit<
  TextFieldClassNames,
  'leadingIcon' | 'prefix' | 'suffix' | 'counter'
> {
  /** The text field's root; `className` goes here too. */
  root?: string;
  /** The `<input>`. */
  input?: string;
  /** The dropdown calendar's panel. */
  calendar?: string;
  /** The calendar's month and year menu buttons. */
  menuButton?: string;
  /** The calendar's weekday names. */
  weekday?: string;
  /** Each day of the calendar. */
  day?: string;
  /** Each month or year in the calendar's month and year lists. */
  item?: string;
}

export interface DateFieldProps {
  /** The field's label, e.g. "Date of birth". */
  label: ReactNode;
  /** The date (controlled); `null` for none. */
  value?: CalendarDate | null;
  /** Initial date when uncontrolled. @default null */
  defaultValue?: CalendarDate | null;
  /** A date was typed and committed, or picked and confirmed; `null` when cleared. */
  onChange?: (value: CalendarDate | null) => void;
  /** Earliest date allowed; earlier days are disabled. */
  minValue?: DateValue;
  /** Latest date allowed; later days are disabled. */
  maxValue?: DateValue;
  /** Returns `true` for a day that can't be picked (it shows disabled). */
  isDateUnavailable?: (date: DateValue) => boolean;
  /** First and last years of the year menu; years outside min / max are disabled. @default [1900, 2100] */
  yearRange?: [number, number];
  /** Whether the dropdown calendar is open (controlled). */
  open?: boolean;
  /** Whether the dropdown calendar starts open when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the dropdown calendar opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Helper text below the field. @default the locale's format, such as "MM/DD/YYYY" in en-US */
  supportingText?: ReactNode;
  /** Marks the field invalid, with `errorMessage` below it. */
  invalid?: boolean;
  /** Error text shown below the field while it's invalid, in place of `supportingText`. */
  errorMessage?: ReactNode;
  /** The field must have a date. @default false */
  required?: boolean;
  /** The field and its calendar button can't be used. @default false */
  disabled?: boolean;
  /** The date can be read and focused but not changed. @default false */
  readOnly?: boolean;
  /** Form field name; the input submits the typed text. */
  name?: string;
  /** Icon of the button that opens the calendar. */
  calendarIcon?: ReactElement;
  /** Words the field and its calendar show and announce, with English defaults. */
  strings?: DateFieldStrings;
  /** The text field's root. */
  ref?: Ref<HTMLDivElement>;
  /** The `<input>`. */
  inputRef?: Ref<HTMLInputElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: DateFieldClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

/**
 * M3 docked date picker: an outlined date field you can type in (no input mask; the
 * locale's format as helper text), whose calendar button opens a calendar just below it
 * with month and year menus, previous / next month and year buttons, the days of the
 * months around the shown one, and Cancel / OK. Best on medium and larger windows; on
 * compact ones the modal {@link DatePicker} in a full-screen {@link PickerDialog} is
 * recommended.
 *
 * @example
 * <DateField label="Date" value={date} onChange={setDate} />
 */
export function DateField(props: DateFieldProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <DateFieldInner {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function DateFieldInner({
  label,
  value: valueProp,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isDateUnavailable,
  yearRange = [1900, 2100],
  open,
  defaultOpen,
  onOpenChange,
  supportingText,
  invalid,
  errorMessage,
  required,
  disabled,
  readOnly,
  name,
  calendarIcon,
  strings = {},
  ref,
  inputRef,
  className,
  style,
  classNames,
  directionRef,
  ...rest
}: DateFieldProps & { directionRef: (element: HTMLElement | null) => void }) {
  const { data } = splitDataAttributes(rest);
  const [value, setValue] = useControlledState(valueProp, defaultValue ?? null, onChange);
  const overlay = useOverlayTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { root, calendar, menuButton, weekday, day, item, ...fieldClassNames } = classNames ?? {};
  return (
    <>
      <DateInput
        ref={(element) => {
          fieldRef.current = element;
          directionRef(element);
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        inputRef={inputRef}
        label={label}
        value={value}
        onCommit={setValue}
        minValue={minValue}
        maxValue={maxValue}
        isDateUnavailable={isDateUnavailable}
        strings={strings}
        supportingText={supportingText}
        invalid={invalid}
        errorMessage={errorMessage}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        style={style}
        data={data}
        className={cn(root, className)}
        classNames={fieldClassNames}
        trailingIcon={
          <IconButton
            variant="standard"
            icon={calendarIcon ?? <CalendarIcon />}
            aria-label={strings.openCalendar ?? 'Open calendar'}
            aria-haspopup="dialog"
            aria-expanded={overlay.isOpen}
            disabled={disabled || readOnly}
            onPress={overlay.open}
          />
        }
      />
      <OptionPopover state={overlay} triggerRef={fieldRef} popoverRef={popoverRef}>
        <DockedCalendar
          value={value}
          onCommit={(date) => {
            setValue(date);
            overlay.close();
          }}
          onCancel={overlay.close}
          minValue={minValue}
          maxValue={maxValue}
          isDateUnavailable={isDateUnavailable}
          yearRange={yearRange}
          strings={strings}
          className={calendar}
          classNames={{ menuButton, weekday, day, item }}
        />
      </OptionPopover>
    </>
  );
}

type View = 'days' | 'months' | 'years';

/** The dropdown calendar of a {@link DateField}. */
function DockedCalendar({
  value,
  onCommit,
  onCancel,
  minValue,
  maxValue,
  isDateUnavailable,
  yearRange,
  strings,
  className,
  classNames,
}: {
  value: CalendarDate | null;
  onCommit: (date: CalendarDate | null) => void;
  onCancel: () => void;
  minValue: DateValue | undefined;
  maxValue: DateValue | undefined;
  isDateUnavailable: ((date: DateValue) => boolean) | undefined;
  yearRange: [number, number];
  strings: DateFieldStrings;
  className: string | undefined;
  classNames: Pick<DateFieldClassNames, 'menuButton' | 'weekday' | 'day' | 'item'>;
}) {
  const { locale } = useLocale();
  const [draft, setDraft] = useState(value);
  const state = useCalendarState({
    value: draft,
    onChange: (date) => setDraft(date as CalendarDate),
    minValue,
    maxValue,
    isDateUnavailable,
    autoFocus: true,
    locale,
    createCalendar,
  });
  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar({}, state);
  const panelRef = useRef<HTMLDivElement>(null);
  const { dialogProps } = useDialog(
    { 'aria-label': strings.calendar ?? 'Choose a date' },
    panelRef,
  );
  const [view, setView] = useState<View>('days');
  const [focusList, setFocusList] = useState(false);
  const monthRef = useRef<HTMLButtonElement>(null);
  const yearRef = useRef<HTMLButtonElement>(null);
  const styles = dockedDatePickerStyles();
  const grid = datePickerStyles({ docked: true });
  const { swipeProps, slideKey, slideDirection } = useMonthSwipe(state);
  const shortMonth = useDateFormatter({ month: 'short' });
  const longMonth = useDateFormatter({ month: 'long' });
  const yearFormat = useDateFormatter({ year: 'numeric' });
  const shown = state.focusedDate;
  const at = (date: CalendarDate) => date.toDate(getLocalTimeZone());
  const min = minValue ? toCalendarDate(minValue) : undefined;
  const max = maxValue ? toCalendarDate(maxValue) : undefined;
  const firstYear = Math.max(yearRange[0], min?.year ?? -Infinity);
  const lastYear = Math.min(yearRange[1], max?.year ?? Infinity);

  const openList = (next: View, byKeyboard: boolean) => {
    setFocusList(byKeyboard);
    setView(view === next ? 'days' : next);
  };
  const pick = (date: CalendarDate, menu: View) => {
    state.setFocusedDate(date);
    setView('days');
    (menu === 'months' ? monthRef : yearRef).current?.focus();
  };
  const onKeyDownCapture = usePickerKeys(state, {
    onConfirm: () => onCommit(state.focusedDate),
    onMonthMenu: () => openList('months', true),
    onYearMenu: () => openList('years', true),
  });
  const monthOutside = (month: number) => {
    const date = shown.set({ month, day: 1 });
    const last = date.add({ months: 1 }).subtract({ days: 1 });
    return (
      (max !== undefined && date.compare(max) > 0) || (min !== undefined && last.compare(min) < 0)
    );
  };

  return (
    <div
      {...dialogProps}
      ref={panelRef}
      onKeyDownCapture={onKeyDownCapture}
      data-view={view}
      className={styles.panel({ class: className })}
    >
      <div {...calendarProps} className={styles.calendar()}>
        <div className={styles.header()}>
          <div className={styles.group()}>
            <ShortcutIconButton
              icon={<ChevronLeftIcon />}
              label={strings.previousMonth ?? 'Previous month'}
              tooltip={strings.previousMonthTooltip ?? 'Previous month (Page Up)'}
              onPress={prevButtonProps.onPress as () => void}
              disabled={view !== 'days' || prevButtonProps.isDisabled}
            />
            <MenuButton
              buttonRef={monthRef}
              label={`${longMonth.format(at(shown))}, ${strings.chooseMonth ?? 'Choose a month'}`}
              tooltip={strings.monthMenuTooltip ?? 'Choose a month (Shift+M)'}
              open={view === 'months'}
              disabled={view === 'years'}
              styles={styles}
              className={classNames.menuButton}
              onPress={() => openList('months', false)}
            >
              {shortMonth.format(at(shown))}
            </MenuButton>
            <ShortcutIconButton
              icon={<ChevronRightIcon />}
              label={strings.nextMonth ?? 'Next month'}
              tooltip={strings.nextMonthTooltip ?? 'Next month (Page Down)'}
              onPress={nextButtonProps.onPress as () => void}
              disabled={view !== 'days' || nextButtonProps.isDisabled}
            />
          </div>
          <div className={styles.group()}>
            <ShortcutIconButton
              icon={<ChevronLeftIcon />}
              label={strings.previousYear ?? 'Previous year'}
              tooltip={strings.previousYearTooltip ?? 'Previous year (Shift+Page Up)'}
              onPress={() => state.setFocusedDate(shown.subtract({ years: 1 }))}
              disabled={view !== 'days' || shown.year <= firstYear}
            />
            <MenuButton
              buttonRef={yearRef}
              label={`${yearFormat.format(at(shown))}, ${strings.chooseYear ?? 'Choose a year'}`}
              tooltip={strings.yearMenuTooltip ?? 'Choose a year (Shift+Y)'}
              open={view === 'years'}
              disabled={view === 'months'}
              styles={styles}
              className={classNames.menuButton}
              onPress={() => openList('years', false)}
            >
              {yearFormat.format(at(shown))}
            </MenuButton>
            <ShortcutIconButton
              icon={<ChevronRightIcon />}
              label={strings.nextYear ?? 'Next year'}
              tooltip={strings.nextYearTooltip ?? 'Next year (Shift+Page Down)'}
              onPress={() => state.setFocusedDate(shown.add({ years: 1 }))}
              disabled={view !== 'days' || shown.year >= lastYear}
            />
          </div>
        </div>
        {view === 'days' && (
          <div {...swipeProps} className={grid.swipe({ class: styles.view() })}>
            <div key={slideKey} data-direction={slideDirection} className={grid.slide()}>
              <CalendarGrid state={state} styles={grid} classNames={classNames} />
            </div>
          </div>
        )}
        {view === 'months' && (
          <ChoiceList label={strings.monthList ?? 'Month'} autoFocus={focusList} styles={styles}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <ChoiceButton
                key={month}
                selected={month === shown.month}
                disabled={monthOutside(month)}
                steps={LIST_STEPS}
                className={styles.item({ class: classNames.item })}
                onPick={() => pick(shown.set({ month }), 'months')}
              >
                <Check selected={month === shown.month} styles={styles} />
                {longMonth.format(at(shown.set({ month, day: 1 })))}
              </ChoiceButton>
            ))}
          </ChoiceList>
        )}
        {view === 'years' && (
          <ChoiceList label={strings.yearList ?? 'Year'} autoFocus={focusList} styles={styles}>
            {Array.from(
              { length: yearRange[1] - yearRange[0] + 1 },
              (_, i) => yearRange[0] + i,
            ).map((year) => (
              <ChoiceButton
                key={year}
                selected={year === shown.year}
                disabled={year < firstYear || year > lastYear}
                steps={LIST_STEPS}
                className={styles.item({ class: classNames.item })}
                onPick={() => pick(shown.set({ year }), 'years')}
              >
                <Check selected={year === shown.year} styles={styles} />
                {year}
              </ChoiceButton>
            ))}
          </ChoiceList>
        )}
      </div>
      <div className={styles.actions()}>
        <Button variant="text" onPress={onCancel}>
          {strings.cancel ?? 'Cancel'}
        </Button>
        <Button variant="text" onPress={() => onCommit(draft)}>
          {strings.ok ?? 'OK'}
        </Button>
      </div>
    </div>
  );
}

/** One option per row. */
const LIST_STEPS = { ArrowUp: -1, ArrowDown: 1 };

function MenuButton({
  buttonRef,
  label,
  tooltip,
  open,
  disabled,
  styles,
  className,
  onPress,
  children,
}: {
  buttonRef: Ref<HTMLButtonElement>;
  label: string;
  tooltip: string;
  open: boolean;
  disabled: boolean;
  styles: ReturnType<typeof dockedDatePickerStyles>;
  className: string | undefined;
  onPress: () => void;
  children: string;
}) {
  return (
    <TooltipTrigger>
      <Button
        ref={buttonRef}
        variant="text"
        aria-label={label}
        aria-expanded={open}
        // M3 menus: while its list is open the button looks the same, plus a pressed state.
        data-menu-open={open || undefined}
        disabled={disabled}
        onPress={onPress}
        className={styles.menuButton({ class: className })}
      >
        {/* The drop-down arrow trails the label here, which Button's one leading icon can't do. */}
        <span className="inline-flex items-center gap-[8px]">
          {children}
          <span aria-hidden="true" className="inline-flex size-[20px] items-center justify-center">
            <span data-open={open || undefined} className={styles.menuIcon()}>
              <ArrowDropDownIcon />
            </span>
          </span>
        </span>
      </Button>
      <LazyTooltip>{tooltip}</LazyTooltip>
    </TooltipTrigger>
  );
}

function ChoiceList({
  label,
  autoFocus,
  styles,
  children,
}: {
  label: string;
  autoFocus: boolean;
  styles: ReturnType<typeof dockedDatePickerStyles>;
  children: ReactNode;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={styles.list()}
      ref={(element) => {
        const selected = element?.querySelector<HTMLElement>('[aria-checked="true"]');
        selected?.scrollIntoView?.({ block: 'center' });
        if (autoFocus) selected?.focus({ preventScroll: true });
      }}
    >
      {children}
    </div>
  );
}

function Check({
  selected,
  styles,
}: {
  selected: boolean;
  styles: ReturnType<typeof dockedDatePickerStyles>;
}) {
  return <span className={styles.check()}>{selected && <CheckIcon />}</span>;
}
