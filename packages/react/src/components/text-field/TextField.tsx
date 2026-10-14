'use client';

import {
  useId,
  useLayoutEffect,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useFocusRing,
  useHover,
  useObjectRef,
  useTextField,
  type AriaTextFieldOptions,
  type AriaTextFieldProps,
} from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import {
  CharacterCounter,
  ErrorText,
  FieldErrorIcon,
  FieldLabel,
  SupportingText,
} from '../../primitives/Field';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { textFieldStyles, type TextFieldVariant } from './text-field-styles';

export interface TextFieldClassNames {
  /** The root element, merged with `className`. */
  root?: string;
  /** The filled or outlined container around the label, input and icons. */
  container?: string;
  /** The floating label. */
  label?: string;
  /** The `<input>` or `<textarea>`. */
  input?: string;
  /** The leading icon's 48px box. */
  leadingIcon?: string;
  /** The trailing icon's 48px box. */
  trailingIcon?: string;
  /** The prefix text before the input. */
  prefix?: string;
  /** The suffix text after the input. */
  suffix?: string;
  /** The helper text below the field. */
  supportingText?: string;
  /** The error message below the field. */
  errorText?: string;
  /** The character counter below the field. */
  counter?: string;
  /** The built-in error icon. */
  errorIcon?: string;
}

/** Words the text field announces; override them for other languages. */
export interface TextFieldLabels {
  /** The error icon's name (M3: "Error"). @default "Error" */
  error: string;
  /**
   * What screen readers hear for the character counter (M3 calls it the "character count").
   * @default (count, max) => `Character count: ${count} of ${max}`
   */
  characterCount: (count: number, max: number) => string;
}

const DEFAULT_LABELS: TextFieldLabels = {
  error: 'Error',
  characterCount: (count, max) => `Character count: ${count} of ${max}`,
};

type FieldState = 'disabled' | 'error-focus' | 'error-hover' | 'error' | 'focus' | 'hover' | 'rest';

/** Props React Aria names with an `is` prefix; we use the HTML-style names instead. */
type RenamedAriaProps =
  | 'isDisabled'
  | 'isReadOnly'
  | 'isRequired'
  | 'isInvalid'
  | 'label'
  | 'description'
  | 'inputElementType'
  | 'value'
  | 'defaultValue'
  | 'onChange';

interface TextFieldOwnProps extends Omit<AriaTextFieldProps<HTMLInputElement>, RenamedAriaProps> {
  /** The container style: a filled surface or an outline. @default "filled" */
  variant?: TextFieldVariant;
  /** The text, when controlled. */
  value?: string;
  /** The initial text, when uncontrolled. @default "" */
  defaultValue?: string;
  /** Called with the new text on every change. */
  onChange?: (value: string) => void;
  /**
   * Helper text below the field. Replaced visually by the error message when invalid, and
   * shown in the error colour while the field is invalid.
   */
  supportingText?: ReactNode;
  /**
   * Shows the supporting text only while the field has focus (M3 allows it "persistently
   * visible or visible only on focus"). Its space is kept, and screen readers always get it.
   * @default false
   */
  supportingTextOnFocus?: boolean;
  /** Marks the field invalid (in addition to `validate` and native constraints). */
  invalid?: boolean;
  /** A value is required: adds the `*` to the label and native `required` validation. */
  required?: boolean;
  /** Disables the field: it can't be focused or edited. @default false */
  disabled?: boolean;
  /**
   * The value can be read and copied but not changed. M3 styles it as a regular field and
   * asks for it to be "clearly labeled as read-only", e.g. in the supporting text. The root
   * gets `data-readonly`.
   * @default false
   */
  readOnly?: boolean;
  /** Decorative icon at the start, in a 48px box. */
  leadingIcon?: ReactNode;
  /**
   * Icon or icon button at the end (e.g. clear, visibility toggle), in a 48px box. It takes
   * the place of the error icon.
   */
  trailingIcon?: ReactNode;
  /**
   * The icon shown at the end while the field is invalid and has no `trailingIcon` (M3
   * strongly recommends one). Defaults to Material Symbols `error`, named by `labels.error`;
   * `false` turns it off.
   * @default the Material Symbols `error` icon
   */
  errorIcon?: ReactNode | false;
  /** Text before the input, e.g. "$". Shown once the label floats. */
  prefix?: ReactNode;
  /**
   * What screen readers hear for the prefix, e.g. "US dollars" for "$". The prefix is in the
   * input's description either way; without this, its visible text is read.
   */
  prefixLabel?: string;
  /** Text after the input, e.g. "kg". Shown once the label floats. */
  suffix?: ReactNode;
  /** What screen readers hear for the suffix, e.g. "kilograms" for "kg". */
  suffixLabel?: string;
  /**
   * Renders a `<textarea>`. By default it's an M3 text area: a fixed height of `rows` lines
   * that scrolls vertically, which M3 recommends over growing fields on the web.
   * @default false
   */
  multiline?: boolean;
  /**
   * With `multiline`: grow with the content from `rows` up to `maxRows` (M3's multi-line
   * field) instead of keeping a fixed height.
   * @default false
   */
  autoGrow?: boolean;
  /** Visible lines of a multiline field. @default 4, or 1 with `autoGrow` */
  rows?: number;
  /** With `autoGrow`: lines after which the field scrolls instead of growing. */
  maxRows?: number;
  /** Shows `count/maxLength` below the field. Defaults to `true` when `maxLength` is set. */
  showCharacterCount?: boolean;
  /** Words the field announces, for other languages. */
  labels?: Partial<TextFieldLabels>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Classes for each part, by slot. */
  classNames?: TextFieldClassNames;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** The root element. Use `inputRef` for the input itself. */
  ref?: Ref<HTMLDivElement>;
  /** The `<input>` (or `<textarea>` when multiline), e.g. for form libraries. */
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

/** A visible label, or an accessible name for fields without one. */
type TextFieldLabel =
  | {
      /** The visible label, which floats above the input once it has focus or a value. */
      label: ReactNode;
    }
  | {
      label?: undefined;
      /** Accessible name when there's no visible label. */
      'aria-label': string;
    }
  | {
      label?: undefined;
      /** The id of the element that names the field, when there's no visible label. */
      'aria-labelledby': string;
    };

export type TextFieldProps = TextFieldOwnProps & TextFieldLabel;

const INTERACTIVE = 'input, textarea, button, a, [role="button"]';

/**
 * M3 text field: filled or outlined, with a floating label, leading / trailing icons,
 * prefix and suffix, supporting text, error message and icon, character counter, and a
 * multiline form (a fixed-height text area, or a growing field with `autoGrow`). Built on React Aria `useTextField`, so labelling,
 * descriptions, `validate` and native constraints work as in React Aria.
 *
 * `className` and `style` go on the root; `inputRef` reaches the input.
 *
 * @example
 * <TextField label="Email" type="email" required supportingText="We never share it." />
 * <TextField variant="outlined" label="Price" prefix="$" inputMode="decimal" />
 */
export function TextField(props: TextFieldProps) {
  const {
    variant = 'filled',
    label,
    value: valueProp,
    defaultValue,
    onChange,
    supportingText,
    supportingTextOnFocus = false,
    errorMessage,
    invalid,
    required,
    disabled = false,
    readOnly,
    leadingIcon,
    trailingIcon,
    errorIcon,
    prefix,
    prefixLabel,
    suffix,
    suffixLabel,
    multiline = false,
    autoGrow = false,
    rows = autoGrow ? 1 : 4,
    maxRows,
    showCharacterCount,
    labels: labelsProp,
    className,
    classNames,
    style,
    ref,
    inputRef,
    ...otherProps
  } = props;

  // `data-*` attributes describe the component, so they go on the root with `className`;
  // everything else (ARIA, input attributes, events) goes to the input via React Aria.
  const { data: rootData, rest: ariaProps } = splitDataAttributes(otherProps);
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const prefixId = useId();
  const suffixId = useId();
  const counterId = useId();

  const [value, setValue] = useControlledState(valueProp, defaultValue ?? '', onChange);
  const domInputRef = useObjectRef(inputRef as Ref<HTMLInputElement>);
  const {
    labelProps,
    inputProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  } = useTextField(
    {
      ...ariaProps,
      label,
      description: supportingText,
      errorMessage,
      value,
      onChange: setValue,
      isInvalid: invalid,
      isRequired: required,
      isDisabled: disabled,
      isReadOnly: readOnly,
      inputElementType: multiline ? 'textarea' : 'input',
    } as AriaTextFieldOptions<'input' | 'textarea'>,
    domInputRef,
  );
  const { focusProps, isFocused } = useFocusRing({ isTextInput: true });
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  const growing = multiline && autoGrow;
  // Grow a multiline field with its content, up to maxRows.
  useLayoutEffect(() => {
    const element = domInputRef.current as HTMLTextAreaElement | null;
    if (!growing || !element) return;
    element.style.height = 'auto';
    const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight) || 24;
    const max = maxRows ? lineHeight * maxRows : Number.POSITIVE_INFINITY;
    element.style.height = `${Math.min(element.scrollHeight, max)}px`;
    element.style.overflowY = element.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, growing, maxRows, domInputRef]);

  const hasLabel = label !== undefined && label !== null;
  const floated = hasLabel && (isFocused || value.length > 0);
  const state: FieldState = disabled
    ? 'disabled'
    : isInvalid
      ? isFocused
        ? 'error-focus'
        : isHovered
          ? 'error-hover'
          : 'error'
      : isFocused
        ? 'focus'
        : isHovered
          ? 'hover'
          : 'rest';

  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors, validationDetails })
      : (errorMessage ?? validationErrors.join(' '));
  const showError = isInvalid && Boolean(resolvedError);
  const maxLength = ariaProps.maxLength;
  const showCounter = maxLength !== undefined && showCharacterCount !== false;
  const showErrorIcon = isInvalid && !trailingIcon && errorIcon !== false;

  const styles = textFieldStyles({
    variant,
    hasLabel,
    hasLeadingIcon: Boolean(leadingIcon),
    hasTrailingIcon: Boolean(trailingIcon) || showErrorIcon,
    multiline,
    fixedHeight: multiline && !autoGrow,
    supportingTextOnFocus,
  });
  // The affixes and the counter join React Aria's description (supporting text, then error).
  const describedBy =
    [
      prefix ? prefixId : null,
      suffix ? suffixId : null,
      inputProps['aria-describedby'],
      showCounter ? counterId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  // Pressing the container (not an icon button) focuses the input, like Compose.
  const focusInput = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest(INTERACTIVE) || disabled) return;
    event.preventDefault();
    domInputRef.current?.focus();
  };

  // Part of the accessible name, as M3 asks ("The accessibility label must include the
  // asterisk"); the copy in the outline's notch is hidden with the fieldset.
  const requiredMark = required ? ' *' : null;
  const Input = multiline ? 'textarea' : 'input';

  return (
    <div
      {...rootData}
      ref={ref}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
      data-tokens="md-comp-text-field"
      data-variant={variant}
      data-field-state={state}
      data-focused={isFocused || undefined}
      data-hovered={(isHovered && !disabled) || undefined}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      data-floated={floated || undefined}
    >
      <div
        {...hoverProps}
        onPointerDown={focusInput}
        data-slot="container"
        className={styles.container({ class: classNames?.container })}
      >
        {variant === 'outlined' && (
          <fieldset aria-hidden="true" data-slot="outline" className={styles.outline()}>
            {hasLabel && (
              <legend className={styles.notch()}>
                <span className={styles.notchClip()}>
                  <span className={styles.notchText()}>
                    {label}
                    {requiredMark}
                  </span>
                </span>
              </legend>
            )}
          </fieldset>
        )}
        {leadingIcon && (
          <span
            aria-hidden="true"
            data-slot="leading-icon"
            className={styles.icon({ class: cn(styles.leadingIcon(), classNames?.leadingIcon) })}
          >
            {leadingIcon}
          </span>
        )}
        <div className={styles.field()}>
          {prefix && (
            <span
              id={prefixId}
              className={styles.affix({ class: cn(styles.prefix(), classNames?.prefix) })}
            >
              <Affix text={prefix} label={prefixLabel} />
            </span>
          )}
          <Input
            {...(mergeProps(inputProps, focusProps) as object)}
            aria-describedby={describedBy}
            ref={domInputRef as Ref<never>}
            data-slot="input"
            rows={multiline ? rows : undefined}
            className={styles.input({ class: classNames?.input })}
          />
          {suffix && (
            <span
              id={suffixId}
              className={styles.affix({ class: cn(styles.suffix(), classNames?.suffix) })}
            >
              <Affix text={suffix} label={suffixLabel} />
            </span>
          )}
        </div>
        {trailingIcon ? (
          <span
            data-slot="trailing-icon"
            className={styles.icon({
              class: cn(styles.trailingIcon(), classNames?.trailingIcon),
            })}
          >
            {trailingIcon}
          </span>
        ) : showErrorIcon ? (
          <span className={styles.icon({ class: styles.trailingIcon() })}>
            <FieldErrorIcon
              label={labels.error}
              icon={errorIcon}
              className={styles.errorIcon({ class: classNames?.errorIcon })}
            />
          </span>
        ) : null}
        {hasLabel && (
          <FieldLabel
            {...labelProps}
            data-slot="label"
            className={styles.label({ class: classNames?.label })}
          >
            {label}
            {requiredMark}
          </FieldLabel>
        )}
        <span aria-hidden="true" data-slot="active-indicator" className={styles.indicator()} />
      </div>
      {(supportingText || showError || showCounter) && (
        <div className={styles.supporting()}>
          {supportingText && (
            <SupportingText
              {...descriptionProps}
              data-slot="supporting-text"
              className={cn(
                styles.supportingText({
                  class: cn(styles.supportingTextColor(), classNames?.supportingText),
                }),
                showError && 'sr-only',
              )}
            >
              {supportingText}
            </SupportingText>
          )}
          {showError && (
            <ErrorText
              {...errorMessageProps}
              className={styles.supportingText({
                supportingTextOnFocus: false,
                class: classNames?.errorText,
              })}
            >
              {resolvedError}
            </ErrorText>
          )}
          {showCounter && (
            <CharacterCounter
              id={counterId}
              count={value.length}
              max={maxLength}
              label={labels.characterCount(value.length, maxLength)}
              className={styles.counter({ class: classNames?.counter })}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** An affix's visible text, read as its `label` when there is one. */
function Affix({ text, label }: { text: ReactNode; label: string | undefined }) {
  if (label === undefined) return text;
  return (
    <>
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{label}</span>
    </>
  );
}
