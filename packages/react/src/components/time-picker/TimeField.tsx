'use client';

import type { Time } from '@internationalized/date';
import {
  useId,
  useRef,
  useState,
  type AriaAttributes,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { useLocale, useObjectRef } from 'react-aria';
import { useOverlayTriggerState } from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { useLabels } from '../labels/use-labels';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import type { Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { onDemand, usePreloadOnIntent } from '../../utils/load-on-demand';
import {
  ariaFlag,
  pickDescriptionAria,
  splitRootProps,
  type WrapperRootDOMProps,
} from '../../utils/root-props';
import { ScheduleIcon } from '../date-picker/picker-icons';
import { COMPACT_WINDOW, useMediaQuery } from '../date-picker/use-media-query';
import type { PickerDialogLabels } from '../date-picker/PickerDialog';
import { IconButton } from '../icon-button/IconButton';
import { TextField, type TextFieldClassNames } from '../text-field/TextField';
import { localeHourCycle } from './hour-cycle';
import { formatTime, parseTimeText } from './time-format';
import type { TimeFieldDialogProps } from './TimeFieldDialog';
import type { TimeFieldListProps } from './TimeFieldList';
import type { TimePickerLabels } from './TimePicker';

/** Words of a {@link TimeField} and its picker, for localisation. */
export interface TimeFieldLabels extends TimePickerLabels, PickerDialogLabels {
  /** The field's placeholder. @default the clock's format, "HH:MM" or "H:MM AM" */
  timeFormatHint: string;
  /** Error when the text isn't a time. @default "Enter a time such as {hint}" */
  invalidTime: string;
  /** Error for a time before `min` or after `max`. @default "Time out of range" */
  timeOutOfRange: string;
  /** The clock icon button. @default "Open time picker" */
  openPicker: string;
  /** The picker's title and name. @default "Select time" */
  title: string;
  /** The picker's dismissing action. @default "Cancel" */
  cancel: string;
  /** The picker's confirming action. @default "OK" */
  ok: string;
}

/** Classes for each part of a {@link TimeField}. */
export interface TimeFieldClassNames extends Omit<
  TextFieldClassNames,
  'leadingIcon' | 'prefix' | 'suffix' | 'counter'
> {
  /** The text field's root; `className` goes here too. */
  root?: string;
  /** The clock icon button. */
  button?: string;
  /** The docked list of times: its surface. */
  list?: string;
  /** Each time of the docked list. */
  option?: string;
  /** The picker dialog's surface. */
  picker?: string;
}

export interface TimeFieldProps extends WrapperRootDOMProps {
  /** The field's label, e.g. "Opens at". */
  label: ReactNode;
  /** The time (controlled); `null` for none. */
  value?: Time | null;
  /** Initial time when uncontrolled. @default null */
  defaultValue?: Time | null;
  /** A time was typed and committed, or picked and confirmed; `null` when cleared. */
  onChange?: (value: Time | null) => void;
  /** Earliest time allowed. */
  min?: Time;
  /** Latest time allowed. */
  max?: Time;
  /** 12- or 24-hour clock, for the field and the picker. Left out, the locale's. @default the locale's */
  hourCycle?: 12 | 24;
  /** The field's style. @default "outlined" */
  variant?: 'outlined' | 'filled';
  /**
   * Where the picker opens. `dialog` is the M3 time picker in a dialog. `docked` is a list of
   * times under the field (every `step` minutes, within `min` and `max`) on windows 600px wide
   * or more, for forms with many times; narrower windows still get the dialog. Not in the M3
   * spec, which has no docked time picker.
   * @default "dialog"
   */
  presentation?: 'dialog' | 'docked';
  /**
   * Minutes between the times a docked list offers, counted from midnight; 5 at least. It
   * only shapes the list: any time can still be typed.
   * @default 30
   */
  step?: number;
  /** Whether the picker is open (controlled). */
  open?: boolean;
  /** Whether the picker starts open when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the picker opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Helper text below the field. */
  supportingText?: ReactNode;
  /** Marks the field invalid, with `errorMessage` below it. */
  invalid?: boolean;
  /** Error text shown below the field while it's invalid, in place of `supportingText`. */
  errorMessage?: ReactNode;
  /** The field must have a time. @default false */
  required?: boolean;
  /** The field and its clock button can't be used. @default false */
  disabled?: boolean;
  /** The time can be read and focused but not changed. @default false */
  readOnly?: boolean;
  /** More description for the `<input>`, after the supporting or error text. */
  'aria-describedby'?: string;
  /** The id of an element with more details about the `<input>`. */
  'aria-details'?: string;
  /** Read as `invalid` when that's left out, for a form library that sets the attribute. */
  'aria-invalid'?: AriaAttributes['aria-invalid'];
  /** Read as `required` when that's left out, for a form library that sets the attribute. */
  'aria-required'?: AriaAttributes['aria-required'];
  /** Read as `readOnly` when that's left out, for a form library that sets the attribute. */
  'aria-readonly'?: AriaAttributes['aria-readonly'];
  /** Form field name; the input submits the time as shown. */
  name?: string;
  /** The `<input>`'s id, for a `<label for>` or an error summary's link. */
  id?: string;
  /** Icon of the button that opens the picker. */
  clockIcon?: ReactElement;
  /**
   * Web density of the field, `0` to `-3`: each step takes 4px off it (56px at 0, 48px at -2).
   * The picker keeps its size. Left out, the field takes the nearest theme's.
   * @default 0
   */
  density?: Density;
  /**
   * Words the field and its picker show and announce, with English defaults.
   * A {@link LabelsProvider} sets them for the whole app.
   */
  labels?: Partial<TimeFieldLabels>;
  /** The text field's root. */
  ref?: Ref<HTMLDivElement>;
  /** The `<input>`. */
  inputRef?: Ref<HTMLInputElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: TimeFieldClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

const pickerDialog = onDemand<TimeFieldDialogProps>(() =>
  import('./TimeFieldDialog').then((module) => module.TimeFieldDialog),
);

const dockedList = onDemand<TimeFieldListProps>(() =>
  import('./TimeFieldList').then((module) => module.TimeFieldList),
);

const DEFAULT_LABELS: Omit<TimeFieldLabels, 'timeFormatHint' | 'invalidTime'> = {
  timeOutOfRange: 'Time out of range',
  openPicker: 'Open time picker',
  title: 'Select time',
  cancel: 'Cancel',
  ok: 'OK',
  close: 'Close',
  save: 'Save',
  hour: 'Hour',
  minute: 'Minute',
  am: 'AM',
  pm: 'PM',
  period: 'AM or PM',
  dial: 'Clock',
  inputMode: 'Toggle input picker',
  dialMode: 'Toggle dial picker',
  dialValue: (value, total, unit) => `${value} ${unit} of ${total}`,
};

/**
 * A time in a form, for pages that hold many of them, such as a weekly schedule. One compact
 * field with no input mask that reads what people type or paste (`9`, `930`, `9:30`, `9h30`,
 * `21:30`, `9pm`) and shows it in the active format once they leave it; a clock button opens
 * the {@link TimePicker} in a dialog, typed first, or with `presentation="docked"` a list of
 * times under the field. The time sibling of `DateField`.
 *
 * @example
 * <TimeField label="Opens at" value={time} onChange={setTime} />
 */
export function TimeField(props: TimeFieldProps) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <TimeFieldInner {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

function TimeFieldInner({
  label,
  value: valueProp,
  defaultValue,
  onChange,
  min,
  max,
  hourCycle: hourCycleProp,
  variant = 'outlined',
  presentation = 'dialog',
  step = 30,
  open,
  defaultOpen,
  onOpenChange,
  supportingText,
  invalid: invalidProp,
  errorMessage,
  required: requiredProp,
  disabled,
  readOnly: readOnlyProp,
  'aria-describedby': describedBy,
  'aria-details': details,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  'aria-readonly': ariaReadonly,
  name,
  id,
  clockIcon,
  density,
  labels: labelsProp,
  ref,
  inputRef,
  className,
  style,
  classNames,
  directionRef,
  ...rest
}: TimeFieldProps & { directionRef: (element: HTMLElement | null) => void }) {
  const { root, rest: aria } = splitRootProps(rest, { wrapper: true });
  const invalid = invalidProp ?? ariaFlag(ariaInvalid);
  const required = requiredProp ?? ariaFlag(ariaRequired);
  const readOnly = readOnlyProp ?? ariaFlag(ariaReadonly);
  const { locale } = useLocale();
  const hourCycle = hourCycleProp ?? localeHourCycle(locale);
  const words = useLabels(['TimePicker', 'PickerDialog', 'TimeField'], DEFAULT_LABELS, labelsProp);
  const hint = words.timeFormatHint ?? (hourCycle === 24 ? 'HH:MM' : 'H:MM AM');
  const labels: TimeFieldLabels = {
    ...words,
    timeFormatHint: hint,
    invalidTime: words.invalidTime ?? `Enter a time such as ${hint}`,
  };

  const [value, setValue] = useControlledState(valueProp, defaultValue ?? null, onChange);
  const show = (time: Time | null) => (time ? formatTime(time, locale, hourCycle) : '');
  const [text, setText] = useState(() => show(value));
  const [error, setError] = useState<string | null>(null);
  // A new value or clock from outside replaces what is typed.
  const key = `${value?.toString() ?? ''}|${hourCycle}|${locale}`;
  const [shown, setShown] = useState(key);
  if (key !== shown) {
    setShown(key);
    setText(show(value));
    setError(null);
  }

  const overlay = useOverlayTriggerState({
    ...(open !== undefined && { isOpen: open }),
    ...(defaultOpen !== undefined && { defaultOpen }),
    ...(onOpenChange && { onOpenChange }),
  });
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const domInputRef = useObjectRef(inputRef);
  // A docked list needs room under the field; a compact window gets the dialog, full screen.
  const compact = useMediaQuery(COMPACT_WINDOW);
  const docked = presentation === 'docked' && !compact;
  const listId = useId();
  usePreloadOnIntent(fieldRef, docked ? dockedList.preload : pickerDialog.preload, true);
  const [opened, setOpened] = useState(overlay.isOpen);
  if (overlay.isOpen && !opened) setOpened(true);

  const outOfRange = (time: Time) =>
    (min !== undefined && time.compare(min) < 0) || (max !== undefined && time.compare(max) > 0);

  const accept = (time: Time) => {
    if (outOfRange(time)) {
      setText(show(time));
      setError(labels.timeOutOfRange);
      return;
    }
    setError(null);
    setText(show(time));
    if (time.toString() !== value?.toString()) setValue(time);
  };

  const commit = () => {
    if (text.trim() === '') {
      setError(null);
      if (value) setValue(null);
      return;
    }
    // Unchanged text needs no reading: it is already this value's format.
    if (value && text === show(value)) {
      setError(null);
      return;
    }
    const time = parseTimeText(text, locale);
    if (!time) {
      setError(labels.invalidTime);
      return;
    }
    accept(time);
  };

  const {
    root: rootClassName,
    button,
    picker,
    list,
    option,
    ...fieldClassNames
  } = classNames ?? {};
  return (
    <>
      <TextField
        {...root}
        {...pickDescriptionAria(aria)}
        {...(describedBy !== undefined && { 'aria-describedby': describedBy })}
        {...(details !== undefined && { 'aria-details': details })}
        {...(id !== undefined && { id })}
        ref={(element: HTMLDivElement | null) => {
          fieldRef.current = element;
          directionRef(element);
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        style={style}
        inputRef={domInputRef}
        variant={variant}
        {...(density !== undefined && { density })}
        label={label}
        value={text}
        onChange={(next: string) => {
          setText(next);
          if (error) setError(null);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') {
            event.continuePropagation();
            return;
          }
          commit();
        }}
        placeholder={hint}
        supportingText={supportingText}
        invalid={invalid || error !== null}
        errorMessage={error ?? errorMessage}
        // A 24-hour time needs only digits and a separator; "pm" needs letters.
        inputMode={hourCycle === 24 ? 'decimal' : 'text'}
        autoComplete="off"
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        name={name}
        className={cn('w-[9.25rem] max-w-full', rootClassName, className)}
        classNames={fieldClassNames}
        trailingIcon={
          <IconButton
            variant="standard"
            icon={clockIcon ?? <ScheduleIcon />}
            aria-label={labels.openPicker}
            aria-haspopup={docked ? 'listbox' : 'dialog'}
            aria-expanded={overlay.isOpen}
            {...(docked && overlay.isOpen && { 'aria-controls': listId })}
            disabled={disabled || readOnly}
            className={button}
            onPress={(event) => {
              // Focus returns to where it was when the picker opened: the text box, except
              // after a touch, where focusing it would raise the on-screen keyboard.
              if (event.pointerType !== 'touch') {
                domInputRef.current?.focus({ preventScroll: true });
              }
              overlay.open();
            }}
          />
        }
      />
      {!opened ? null : docked ? (
        <dockedList.Component
          state={overlay}
          triggerRef={fieldRef}
          id={listId}
          value={value}
          onCommit={accept}
          min={min}
          max={max}
          step={step}
          hourCycle={hourCycle}
          label={labels.title}
          density={density}
          classNames={{ list, option }}
        />
      ) : (
        <pickerDialog.Component
          open={overlay.isOpen}
          onOpenChange={overlay.setOpen}
          value={value}
          onCommit={accept}
          hourCycle={hourCycle}
          labels={labels}
          className={picker}
        />
      )}
    </>
  );
}
