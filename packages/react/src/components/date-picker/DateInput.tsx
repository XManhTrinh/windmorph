'use client';

import { toCalendarDate, type CalendarDate, type DateValue } from '@internationalized/date';
import { useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import { useLocale } from 'react-aria';
import { TextField, type TextFieldClassNames } from '../text-field/TextField';
import { dateFormat, parseDate } from './date-format';

/** Words of a typed date field, for localisation. */
export interface DateInputStrings {
  /**
   * The format hint shown below the field and as its placeholder.
   * @default the locale's format, such as "MM/DD/YYYY" in en-US
   */
  dateFormatHint?: string;
  /** Error when the text isn't a date. @default "Enter a date as {hint}" */
  invalidDate?: string;
  /** Error for a date before `minValue` or after `maxValue`. @default "Date out of range" */
  dateOutOfRange?: string;
  /** Error for a date `isDateUnavailable` turns away. @default "Date not available" */
  dateUnavailable?: string;
}

export interface DateInputProps {
  label: ReactNode;
  value: CalendarDate | null;
  /** A date was typed and committed (Enter or leaving the field); `null` when cleared. */
  onCommit: (value: CalendarDate | null) => void;
  /** Enter was pressed and the text is a valid date (or empty). */
  onEnter?: (value: CalendarDate | null) => void;
  minValue?: DateValue | undefined;
  maxValue?: DateValue | undefined;
  isDateUnavailable?: ((date: DateValue) => boolean) | undefined;
  strings?: DateInputStrings | undefined;
  /** Replaces the format hint below the field. */
  supportingText?: ReactNode;
  trailingIcon?: ReactNode;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  name?: string | undefined;
  autoFocus?: boolean | undefined;
  invalid?: boolean | undefined;
  errorMessage?: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** `data-*` attributes for the root. */
  data?: Record<string, unknown> | undefined;
  classNames?: TextFieldClassNames | undefined;
  ref?: Ref<HTMLDivElement> | undefined;
  inputRef?: Ref<HTMLInputElement> | undefined;
}

/**
 * A typed date, as the M3 date input asks: an outlined text field with no input mask that
 * reads dashes, spaces, slashes or dots between the parts and an optional leading zero,
 * reformats on Enter or blur, shows the locale's format below as its helper text, and
 * says in the supporting text why a date can't be used.
 */
export function DateInput({
  label,
  value,
  onCommit,
  onEnter,
  minValue,
  maxValue,
  isDateUnavailable,
  strings = {},
  supportingText,
  trailingIcon,
  required,
  disabled,
  readOnly,
  name,
  autoFocus,
  invalid,
  errorMessage,
  className,
  style,
  data,
  classNames,
  ref,
  inputRef,
}: DateInputProps) {
  const { locale } = useLocale();
  const format = dateFormat(locale);
  const hint = strings.dateFormatHint ?? format.hint;
  const show = (date: CalendarDate | null) => (date ? format.format(date) : '');
  const [text, setText] = useState(() => show(value));
  const [error, setError] = useState<string | null>(null);
  // A new value from outside (the calendar, a reset) replaces what is typed.
  const [shown, setShown] = useState(value?.toString());
  if (value?.toString() !== shown) {
    setShown(value?.toString());
    setText(show(value));
    setError(null);
  }

  const problem = (date: CalendarDate) => {
    const min = minValue && toCalendarDate(minValue);
    const max = maxValue && toCalendarDate(maxValue);
    if ((min && date.compare(min) < 0) || (max && date.compare(max) > 0)) {
      return strings.dateOutOfRange ?? 'Date out of range';
    }
    if (isDateUnavailable?.(date)) return strings.dateUnavailable ?? 'Date not available';
    return null;
  };

  /** Reads the text; returns the date (or `null` when empty), or `undefined` when unusable. */
  const commit = (): CalendarDate | null | undefined => {
    if (text.trim() === '') {
      setError(null);
      if (value) onCommit(null);
      return null;
    }
    const date = parseDate(text, format.order);
    if (!date) {
      setError(strings.invalidDate ?? `Enter a date as ${hint}`);
      return undefined;
    }
    const reason = problem(date);
    if (reason) {
      setError(reason);
      return undefined;
    }
    setError(null);
    setText(format.format(date));
    if (date.toString() !== value?.toString()) onCommit(date);
    return date;
  };

  return (
    <TextField
      {...data}
      ref={ref}
      style={style}
      inputRef={inputRef as Ref<HTMLInputElement | HTMLTextAreaElement>}
      variant="outlined"
      label={label}
      value={text}
      onChange={(next) => {
        setText(next);
        if (error) setError(null);
      }}
      onBlur={() => commit()}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') {
          event.continuePropagation();
          return;
        }
        const date = commit();
        if (date !== undefined) onEnter?.(date);
      }}
      placeholder={hint}
      supportingText={supportingText ?? hint}
      invalid={invalid || error !== null}
      errorMessage={error ?? errorMessage}
      inputMode="decimal"
      autoComplete="off"
      autoFocus={autoFocus}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      name={name}
      trailingIcon={trailingIcon}
      className={className}
      classNames={classNames}
    />
  );
}
