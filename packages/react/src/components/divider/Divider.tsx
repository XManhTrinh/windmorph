import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import {
  dividerStyles,
  labeledDividerStyles,
  type DividerInset,
  type DividerOrientation,
} from './divider-styles';
import { mergeDataTokens } from '../../utils/merge-data-tokens';

export interface DividerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * A full-width horizontal line, or a vertical line the full height of a flex row.
   * @default "horizontal"
   */
  orientation?: DividerOrientation;
  /** Leave 16px at the start, or at both ends. @default "none" */
  inset?: DividerInset;
  /**
   * M3 dividers are decorative, so by default the line is hidden from assistive tech
   * (`role="none"`). Set `decorative={false}` where the line marks a real break between
   * groups of content, to expose it as a `separator`. @default true
   */
  decorative?: boolean;
}

/**
 * M3 divider: a 1px `outline-variant` line, horizontal (full width) or vertical (full
 * height of a flex row), optionally inset. It's decorative (M3: "Dividers are decorative
 * elements") unless `decorative={false}` makes it a `separator`.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" inset="middle" />
 */
export function Divider({
  orientation = 'horizontal',
  inset,
  decorative = true,
  className,
  ...rest
}: DividerProps) {
  return (
    <div
      {...rest}
      // The component token's hook (divider-tokens.ts).
      data-tokens={mergeDataTokens('md-comp-divider', rest)}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative || orientation === 'horizontal' ? undefined : 'vertical'}
      className={dividerStyles({ orientation, inset, class: className })}
    />
  );
}

export interface LabeledDividerClassNames {
  /** The wrapper around the line and the text. */
  root?: string;
  /** The line. */
  divider?: string;
  /** The supporting text. */
  label?: string;
}

export interface LabeledDividerProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The supporting text below the line, e.g. a section's name. */
  children: ReactNode;
  /** Leave 16px at the start, or at both ends, of the line and the text. @default "none" */
  inset?: DividerInset;
  /**
   * The line is hidden from assistive tech, not the text; `decorative={false}` exposes it
   * as a `separator`. @default true
   */
  decorative?: boolean;
  /** Classes for each part, by slot. `classNames.root` is merged with `className`. */
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
  decorative = true,
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
