import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  dividerStyles,
  labeledDividerStyles,
  type DividerInset,
  type DividerOrientation,
} from './divider-styles';

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
      // The component token's hook (divider-tokens.ts).
      data-tokens="md-comp-divider"
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative || orientation === 'horizontal' ? undefined : 'vertical'}
      className={dividerStyles({ orientation, inset, class: className })}
    />
  );
}

export interface LabeledDividerClassNames {
  root?: string;
  divider?: string;
  label?: string;
}

export interface LabeledDividerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The supporting text below the line, e.g. a section's name. */
  children: ReactNode;
  /** Leave 16px at the start, or at both ends, of the line and the text. @default "none" */
  inset?: DividerInset;
  /** Hides the line, not the text, from assistive tech. @default false */
  decorative?: boolean;
  classNames?: LabeledDividerClassNames;
}

/**
 * M3 divider with supporting text: a horizontal divider with a short text 4px below it,
 * 8px clear at the end and below, such as the name of the section that follows.
 *
 * @example
 * <LabeledDivider inset="start">Earlier this week</LabeledDivider>
 */
export function LabeledDivider({
  children,
  inset,
  decorative,
  classNames,
  className,
  ...rest
}: LabeledDividerProps) {
  const styles = labeledDividerStyles({ inset });
  return (
    <div {...rest} className={styles.root({ class: cn(classNames?.root, className) })}>
      <Divider inset={inset} decorative={decorative} className={classNames?.divider} />
      <div className={styles.label({ class: classNames?.label })}>{children}</div>
    </div>
  );
}
