import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../utils/cn';

/**
 * Field parts shared by text fields, selects and other form controls. They take
 * the prop objects returned by React Aria field hooks (`labelProps`,
 * `descriptionProps`, `errorMessageProps`) by spreading them.
 */

export type FieldLabelProps = ComponentPropsWithRef<'label'>;

/** Field label. Inherits its colour so the field can tint it per state. */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <label {...props} className={cn('text-body-large font-plain', className)} />;
}

export type SupportingTextProps = ComponentPropsWithRef<'div'>;

/** Helper text below a field. */
export function SupportingText({ className, ...props }: SupportingTextProps) {
  return (
    <div
      {...props}
      className={cn('text-body-small font-plain text-on-surface-variant', className)}
    />
  );
}

export type ErrorTextProps = ComponentPropsWithRef<'div'>;

/**
 * Validation message below a field, shown in place of the supporting text. It has the
 * `alert` role (M3 text field accessibility), so screen readers announce it as it appears;
 * pass another `role` to change that.
 */
export function ErrorText({ className, ...props }: ErrorTextProps) {
  return (
    <div
      role="alert"
      {...props}
      className={cn('text-body-small font-plain text-error', className)}
    />
  );
}

export interface CharacterCounterProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Current number of characters. */
  count: number;
  /** Maximum number of characters. */
  max: number;
  /**
   * What assistive tech reads for the counter, e.g. "Character count: 12 of 80" (M3 calls it
   * the "character count"). Give the counter an `id` and add it to the input's
   * `aria-describedby`. Without it the counter is hidden from assistive tech.
   */
  label?: string | undefined;
}

/**
 * `count/max` character counter. With a `label`, screen readers read the label instead of
 * the digits; without one, the counter is hidden from them.
 */
export function CharacterCounter({
  count,
  max,
  label,
  className,
  ...props
}: CharacterCounterProps) {
  return (
    <div
      aria-hidden={label === undefined ? true : undefined}
      {...props}
      data-over-limit={count > max ? true : undefined}
      className={cn(
        'text-body-small font-plain text-on-surface-variant tabular-nums data-over-limit:text-error',
        className,
      )}
    >
      {label === undefined ? (
        `${count}/${max}`
      ) : (
        <>
          <span aria-hidden="true">
            {count}/{max}
          </span>
          <span className="sr-only">{label}</span>
        </>
      )}
    </div>
  );
}

export interface FieldErrorIconProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The icon's accessible name. M3: "Error". */
  label: string;
  /** Replaces the default Material Symbols `error` icon. */
  icon?: ReactNode;
}

/**
 * The icon a field shows in its error state (M3 strongly recommends one, as a cue that
 * doesn't rely on colour). It has the `img` role and an accessible name, "Error" in M3.
 */
export function FieldErrorIcon({ label, icon, className, ...props }: FieldErrorIconProps) {
  return (
    <span {...props} role="img" aria-label={label} className={cn('inline-flex', className)}>
      {icon ?? (
        <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
          <path d="M480-280q17 0 28.5-11.5T520-320q0-17-11.5-28.5T480-360q-17 0-28.5 11.5T440-320q0 17 11.5 28.5T480-280Zm-40-160h80v-240h-80v240Zm40 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
        </svg>
      )}
    </span>
  );
}
