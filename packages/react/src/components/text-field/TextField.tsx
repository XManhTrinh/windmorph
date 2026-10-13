'use client';

import {
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
import { CharacterCounter, ErrorText, FieldLabel, SupportingText } from '../../primitives/Field';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { textFieldStyles, type TextFieldVariant } from './text-field-styles';

export interface TextFieldClassNames {
  root?: string;
  container?: string;
  label?: string;
  input?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  prefix?: string;
  suffix?: string;
  supportingText?: string;
  errorText?: string;
  counter?: string;
}

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
  /** @default "filled" */
  variant?: TextFieldVariant;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Helper text below the field. Replaced visually by the error message when invalid. */
  supportingText?: ReactNode;
  /** Marks the field invalid (in addition to `validate` and native constraints). */
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Decorative icon at the start, in a 48px box. */
  leadingIcon?: ReactNode;
  /** Icon or icon button at the end (e.g. clear, visibility toggle), in a 48px box. */
  trailingIcon?: ReactNode;
  /** Text before the input, e.g. "$". Shown once the label floats. */
  prefix?: ReactNode;
  /** Text after the input, e.g. "kg". Shown once the label floats. */
  suffix?: ReactNode;
  /** Renders a `<textarea>` that grows with its content. */
  multiline?: boolean;
  /** Minimum visible lines for a multiline field. @default 1 */
  rows?: number;
  /** Lines after which a multiline field scrolls instead of growing. */
  maxRows?: number;
  /** Shows `count/maxLength` below the field. Defaults to `true` when `maxLength` is set. */
  showCharacterCount?: boolean;
  /** Classes for the root element; consumer classes always win. */
  className?: string;
  classNames?: TextFieldClassNames;
  style?: CSSProperties;
  /** The root element. Use `inputRef` for the input itself. */
  ref?: Ref<HTMLDivElement>;
  /** The `<input>` (or `<textarea>` when multiline), e.g. for form libraries. */
  inputRef?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

/** A visible label, or an accessible name for fields without one. */
type TextFieldLabel =
  | { label: ReactNode }
  | { label?: undefined; 'aria-label': string }
  | { label?: undefined; 'aria-labelledby': string };

export type TextFieldProps = TextFieldOwnProps & TextFieldLabel;

const INTERACTIVE = 'input, textarea, button, a, [role="button"]';

/**
 * M3 text field: filled or outlined, with a floating label, leading / trailing icons,
 * prefix and suffix, supporting text, error message, character counter and an
 * auto-growing multiline form. Built on React Aria `useTextField`, so labelling,
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
    errorMessage,
    invalid,
    required,
    disabled = false,
    readOnly,
    leadingIcon,
    trailingIcon,
    prefix,
    suffix,
    multiline = false,
    rows = 1,
    maxRows,
    showCharacterCount,
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

  // Grow a multiline field with its content, up to maxRows.
  useLayoutEffect(() => {
    const element = domInputRef.current as HTMLTextAreaElement | null;
    if (!multiline || !element) return;
    element.style.height = 'auto';
    const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight) || 24;
    const max = maxRows ? lineHeight * maxRows : Number.POSITIVE_INFINITY;
    element.style.height = `${Math.min(element.scrollHeight, max)}px`;
    element.style.overflowY = element.scrollHeight > max ? 'auto' : 'hidden';
  }, [value, multiline, maxRows, domInputRef]);

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

  const styles = textFieldStyles({
    variant,
    hasLabel,
    hasLeadingIcon: Boolean(leadingIcon),
    hasTrailingIcon: Boolean(trailingIcon),
    multiline,
  });

  // Pressing the container (not an icon button) focuses the input, like Compose.
  const focusInput = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest(INTERACTIVE) || disabled) return;
    event.preventDefault();
    domInputRef.current?.focus();
  };

  const requiredMark = required ? <span aria-hidden="true"> *</span> : null;
  const Input = multiline ? 'textarea' : 'input';

  return (
    <div
      {...rootData}
      ref={ref}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
      data-variant={variant}
      data-field-state={state}
      data-focused={isFocused || undefined}
      data-hovered={(isHovered && !disabled) || undefined}
      data-invalid={isInvalid || undefined}
      data-disabled={disabled || undefined}
      data-floated={floated || undefined}
    >
      <div
        {...hoverProps}
        onPointerDown={focusInput}
        className={styles.container({ class: classNames?.container })}
      >
        {variant === 'outlined' && (
          <fieldset aria-hidden="true" className={styles.outline()}>
            {hasLabel && (
              <legend className={styles.notch()}>
                <span className={styles.notchText()}>
                  {label}
                  {requiredMark}
                </span>
              </legend>
            )}
          </fieldset>
        )}
        {leadingIcon && (
          <span aria-hidden="true" className={styles.icon({ class: classNames?.leadingIcon })}>
            {leadingIcon}
          </span>
        )}
        <div className={styles.field()}>
          {prefix && (
            <span className={styles.affix({ class: cn(styles.prefix(), classNames?.prefix) })}>
              {prefix}
            </span>
          )}
          <Input
            {...(mergeProps(inputProps, focusProps) as object)}
            ref={domInputRef as Ref<never>}
            rows={multiline ? rows : undefined}
            className={styles.input({ class: classNames?.input })}
          />
          {suffix && (
            <span className={styles.affix({ class: cn(styles.suffix(), classNames?.suffix) })}>
              {suffix}
            </span>
          )}
        </div>
        {trailingIcon && (
          <span
            className={styles.icon({
              class: cn(styles.trailingIcon(), classNames?.trailingIcon),
            })}
          >
            {trailingIcon}
          </span>
        )}
        {hasLabel && (
          <FieldLabel {...labelProps} className={styles.label({ class: classNames?.label })}>
            {label}
            {requiredMark}
          </FieldLabel>
        )}
        <span aria-hidden="true" className={styles.indicator()} />
      </div>
      {(supportingText || showError || showCounter) && (
        <div className={styles.supporting()}>
          {supportingText && (
            <SupportingText
              {...descriptionProps}
              className={cn(
                styles.supportingText({ class: classNames?.supportingText }),
                showError && 'sr-only',
              )}
            >
              {supportingText}
            </SupportingText>
          )}
          {showError && (
            <ErrorText
              {...errorMessageProps}
              className={styles.supportingText({ class: classNames?.errorText })}
            >
              {resolvedError}
            </ErrorText>
          )}
          {showCounter && (
            <CharacterCounter
              count={value.length}
              max={maxLength}
              className={styles.counter({ class: classNames?.counter })}
            />
          )}
        </div>
      )}
    </div>
  );
}
