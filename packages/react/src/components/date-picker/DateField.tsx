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
import { Tooltip, TooltipTrigger } from '../tooltip/Tooltip';
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
  /** @default "Previous month" */
  previousMonth?: string;
  /** @default "Next month" */
  nextMonth?: string;
  /** @default "Previous month (Page Up)" */
  previousMonthTooltip?: string;
  /** @default "Next month (Page Down)" */
  nextMonthTooltip?: string;
  /** @default "Previous year" */
  previousYear?: string;
  /** @default "Next year" */
  nextYear?: string;
  /** @default "Previous year (Shift+Page Up)" */
  previousYearTooltip?: string;
  /** @default "Next year (Shift+Page Down)" */
  nextYearTooltip?: string;
  /** Added to the month menu button's name. @default "Choose a month" */
  chooseMonth?: string;
  /** Added to the year menu button's name. @default "Choose a year" */
  chooseYear?: string;
  /** @default "Choose a month (Shift+M)" */
  monthMenuTooltip?: string;
  /** @default "Choose a year (Shift+Y)" */
  yearMenuTooltip?: string;
  /** Name of the month list. @default "Month" */
  monthList?: string;
  /** Name of the year list. @default "Year" */
  yearList?: string;
  /** @default "Cancel" */
  cancel?: string;
  /** @default "OK" */
  ok?: string;
}

export interface DateFieldClassNames {
  /** The text field's root; `className` goes here too. */
  root?: string;
  input?: string;
  /** The dropdown calendar's panel. */
  calendar?: string;
}

export interface DateFieldProps {
  /** The field's label, e.g. "Date of birth". */
  label: ReactNode;
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  /** A date was typed and committed, or picked and confirmed; `null` when cleared. */
  onChange?: (value: CalendarDate | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  /** First and last years of the year menu; years outside min / max are disabled. @default [1900, 2100] */
  yearRange?: [number, number];
  /** Whether the dropdown calendar is open (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Helper text below the field. @default the locale's date format, e.g. "MM/DD/YYYY" */
  supportingText?: ReactNode;
  /** Marks the field invalid, with `errorMessage` below it. */
  invalid?: boolean;
  errorMessage?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Form field name; the input submits the typed text. */
  name?: string;
  /** Icon of the button that opens the calendar. */
  calendarIcon?: ReactElement;
  strings?: DateFieldStrings;
  /** The text field's root. */
  ref?: Ref<HTMLDivElement>;
  /** The `<input>`. */
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  style?: CSSProperties;
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
        className={cn(classNames?.root, className)}
        classNames={{ input: classNames?.input }}
        trailingIcon={
          <IconButton
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
          className={classNames?.calendar}
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
              <CalendarGrid state={state} styles={grid} />
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
                className={styles.item()}
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
                className={styles.item()}
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
  onPress,
  children,
}: {
  buttonRef: Ref<HTMLButtonElement>;
  label: string;
  tooltip: string;
  open: boolean;
  disabled: boolean;
  styles: ReturnType<typeof dockedDatePickerStyles>;
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
        disabled={disabled}
        onPress={onPress}
        className={styles.menuButton()}
        trailingIcon={
          <span data-open={open || undefined} className={styles.menuIcon()}>
            <ArrowDropDownIcon />
          </span>
        }
      >
        {children}
      </Button>
      <Tooltip>{tooltip}</Tooltip>
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
