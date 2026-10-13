import type { ComponentPropsWithRef } from 'react';
import { dividerStyles, type DividerInset, type DividerOrientation } from './divider-styles';

export interface DividerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** @default "horizontal" */
  orientation?: DividerOrientation;
  /** Leave 16px at the start, or at both ends. @default "none" */
  inset?: DividerInset;
  /**
   * Purely visual dividers (e.g. between list items that already read as separate) can
   * be hidden from assistive tech. @default false
   */
  decorative?: boolean;
}

/**
 * M3 divider: a 1px `outline-variant` line, horizontal (full width) or vertical (full
 * height of a flex row), optionally inset.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" inset="middle" />
 */
export function Divider({
  orientation = 'horizontal',
  inset,
  decorative = false,
  className,
  ...rest
}: DividerProps) {
  return (
    <div
      {...rest}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative || orientation === 'horizontal' ? undefined : 'vertical'}
      className={dividerStyles({ orientation, inset, class: className })}
    />
  );
}
