import type { CSSProperties, HTMLAttributes, PointerEvent, ReactNode, Ref } from 'react';
import { ErrorText, FieldErrorIcon, FieldLabel, SupportingText } from '../../primitives/Field';
import { cn } from '../../utils/cn';
import { textFieldStyles, type TextFieldVariant } from '../text-field/text-field-styles';

/** The text field's one state at a time, in priority order (see text-field-styles). */
export type FieldState =
  'disabled' | 'error-focus' | 'error-hover' | 'error' | 'focus' | 'hover' | 'rest';

export function fieldState({
  disabled,
  invalid,
  focused,
  hovered,
}: {
  disabled: boolean;
  invalid: boolean;
  focused: boolean;
  hovered: boolean;
}): FieldState {
  if (disabled) return 'disabled';
  if (invalid) return focused ? 'error-focus' : hovered ? 'error-hover' : 'error';
  return focused ? 'focus' : hovered ? 'hover' : 'rest';
}

/** Material Symbols `arrow_drop_down`; it turns over while the menu is open (Compose). */
export function DropdownArrow({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
      data-open={open || undefined}
      className="transition-transform [transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)] data-open:rotate-180 motion-reduce:transition-none"
    >
      <path d="M480-360 280-560h400L480-360Z" />
    </svg>
  );
}

export interface FieldShellClassNames {
  root?: string;
  container?: string;
  label?: string;
  field?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  supportingText?: string;
  errorText?: string;
  /** The built-in error icon. */
  errorIcon?: string;
}

export interface FieldShellProps {
  variant: TextFieldVariant;
  label: ReactNode;
  labelProps: HTMLAttributes<HTMLElement>;
  required?: boolean | undefined;
  state: FieldState;
  /** The label sits above the content (a value, a placeholder, focus or an open menu). */
  floated: boolean;
  open: boolean;
  leadingIcon?: ReactNode;
  /** The arrow, or a button holding it. */
  trailing: ReactNode;
  /**
   * The icon shown before `trailing` while the field is invalid (M3 strongly recommends one);
   * `undefined` for the default `error` icon, `false` for none.
   */
  errorIcon?: ReactNode | false;
  /** The error icon's accessible name (M3: "Error"). */
  errorIconLabel: string;
  readOnly?: boolean | undefined;
  /** What the field holds: the Select's button or the Autocomplete's chips and input. */
  children: ReactNode;
  supportingText?: ReactNode;
  descriptionProps: HTMLAttributes<HTMLElement>;
  errorText?: ReactNode;
  errorMessageProps: HTMLAttributes<HTMLElement>;
  showError: boolean;
  containerRef?: Ref<HTMLDivElement>;
  containerProps?: HTMLAttributes<HTMLDivElement>;
  onContainerPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
  rootProps?: Record<string, unknown>;
  rootRef?: Ref<HTMLDivElement>;
  className?: string | undefined;
  classNames?: FieldShellClassNames | undefined;
  style?: CSSProperties | undefined;
  /** Grows with the content (input chips), instead of the field's fixed 56px row. */
  multiline?: boolean;
}

/**
 * The M3 text field's look for fields that aren't a plain input: the filled or outlined
 * container, floating label, outline notch, active indicator, supporting text and error,
 * with the same tokens and `data-field-state` machine as `TextField`.
 */
export function FieldShell({
  variant,
  label,
  labelProps,
  required,
  state,
  floated,
  open,
  leadingIcon,
  trailing,
  errorIcon,
  errorIconLabel,
  readOnly = false,
  children,
  supportingText,
  descriptionProps,
  errorText,
  errorMessageProps,
  showError,
  containerRef,
  containerProps,
  onContainerPointerDown,
  rootProps,
  rootRef,
  className,
  classNames,
  style,
  multiline = false,
}: FieldShellProps) {
  const hasLabel = label !== undefined && label !== null;
  const styles = textFieldStyles({
    variant,
    hasLabel,
    hasLeadingIcon: Boolean(leadingIcon),
    hasTrailingIcon: true,
    multiline,
  });
  // Part of the accessible name (M3); the notch's copy is hidden with the fieldset.
  const requiredMark = required ? ' *' : null;
  const showErrorIcon = state.startsWith('error') && errorIcon !== false;

  return (
    <div
      {...rootProps}
      ref={rootRef}
      style={style}
      className={styles.root({ class: cn(classNames?.root, className) })}
      data-tokens="md-comp-text-field"
      data-variant={variant}
      data-field-state={state}
      data-focused={state === 'focus' || state === 'error-focus' || undefined}
      data-invalid={state.startsWith('error') || undefined}
      data-disabled={state === 'disabled' || undefined}
      data-readonly={readOnly || undefined}
      data-floated={floated || undefined}
      data-open={open || undefined}
    >
      <div
        {...containerProps}
        ref={containerRef}
        onPointerDown={onContainerPointerDown}
        data-slot="container"
        className={styles.container({ class: cn('cursor-pointer', classNames?.container) })}
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
        <div className={styles.field({ class: classNames?.field })}>{children}</div>
        {showErrorIcon ? (
          <span className={styles.icon({ class: styles.trailingIcon() })}>
            <FieldErrorIcon
              label={errorIconLabel}
              icon={errorIcon}
              className={styles.errorIcon({ class: classNames?.errorIcon })}
            />
          </span>
        ) : null}
        <span
          data-slot="trailing-icon"
          className={styles.icon({ class: cn(styles.trailingIcon(), classNames?.trailingIcon) })}
        >
          {trailing}
        </span>
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
      {(supportingText || showError) && (
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
              className={styles.supportingText({ class: classNames?.errorText })}
            >
              {errorText}
            </ErrorText>
          )}
        </div>
      )}
    </div>
  );
}
