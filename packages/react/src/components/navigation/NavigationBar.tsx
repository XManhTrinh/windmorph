'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cn } from '../../utils/cn';
import { NavItem, type NavItemProps } from './NavItem';
import { navigationBarStyles, type NavigationBarArrangement } from './navigation-styles';

interface BarContextValue {
  iconPosition: 'top' | 'start';
  itemClassName: string;
}

const BarContext = createContext<BarContextValue | null>(null);

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

export interface NavigationBarClassNames {
  root?: string;
  item?: string;
}

interface NavigationBarOwnProps {
  /**
   * Icons above labels (compact windows) or beside them (the flexible bar in medium
   * windows). @default "top"
   */
  iconPosition?: 'top' | 'start';
  /** Share the width equally, or centre the items within side padding. @default "equal" */
  arrangement?: NavigationBarArrangement;
  /** `NavigationBarItem` elements (3–5 in M3). */
  children: ReactNode;
  classNames?: NavigationBarClassNames;
}

export type NavigationBarProps = NavigationBarOwnProps &
  Naming &
  Omit<
    ComponentPropsWithRef<'nav'>,
    keyof NavigationBarOwnProps | 'aria-label' | 'aria-labelledby'
  >;

/**
 * M3 Expressive flexible navigation bar: 3–5 destinations along the bottom of compact and
 * medium windows. Items stack the icon above the label, or (`iconPosition="start"`) place
 * it beside the label in a 40px pill.
 *
 * @example
 * <NavigationBar aria-label="Main" className="fixed inset-x-0 bottom-0">
 *   <NavigationBarItem href="/" icon={<HomeIcon />} selected>Home</NavigationBarItem>
 * </NavigationBar>
 */
export function NavigationBar({
  iconPosition = 'top',
  arrangement,
  children,
  classNames,
  className,
  style,
  ...rest
}: NavigationBarProps) {
  const styles = navigationBarStyles({ arrangement });
  const count = Children.toArray(children).filter(isValidElement).length;
  // Compose: centred items sit within (100% − 10% × (n + 3)) / 2 each side, up to 6 items.
  const padding =
    arrangement === 'centered' && count <= 6 ? `${(100 - 10 * (count + 3)) / 2}%` : undefined;
  return (
    <nav
      {...rest}
      style={{ paddingInline: padding, ...style } as CSSProperties}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <BarContext value={{ iconPosition, itemClassName: styles.item({ class: classNames?.item }) }}>
        {children}
      </BarContext>
    </nav>
  );
}

export type NavigationBarItemProps = NavItemProps;

/** A destination in a {@link NavigationBar}: a link (`href`) or a button. */
export function NavigationBarItem({ className, ...props }: NavigationBarItemProps) {
  const bar = useContext(BarContext);
  if (!bar) throw new Error('NavigationBarItem must be rendered inside a NavigationBar');
  return (
    <NavItem
      {...(props as NavItemProps)}
      className={cn(bar.itemClassName, className)}
      layout={bar.iconPosition === 'start' ? 'bar-start' : 'bar-top'}
    />
  );
}
