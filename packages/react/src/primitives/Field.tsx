import type { ComponentPropsWithRef } from 'react';
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

/** Validation message below a field, shown in place of the supporting text. */
export function ErrorText({ className, ...props }: ErrorTextProps) {
  return <div {...props} className={cn('text-body-small font-plain text-error', className)} />;
}

export interface CharacterCounterProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Current number of characters. */
  count: number;
  /** Maximum number of characters. */
  max: number;
}

/**
 * `count/max` character counter. Hidden from screen readers: the field exposes
 * its limit through `maxLength` and its own description instead.
 */
export function CharacterCounter({ count, max, className, ...props }: CharacterCounterProps) {
  return (
    <div
      aria-hidden="true"
      {...props}
      data-over-limit={count > max ? true : undefined}
      className={cn(
        'text-body-small font-plain text-on-surface-variant tabular-nums data-over-limit:text-error',
        className,
      )}
    >
      {count}/{max}
    </div>
  );
}
