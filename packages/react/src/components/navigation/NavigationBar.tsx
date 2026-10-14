'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { useObjectRef } from 'react-aria';
import { cn } from '../../utils/cn';
import { NavItem, type NavItemProps } from './NavItem';
import { navigationBarStyles, type NavigationBarArrangement } from './navigation-styles';
import { useHideOnScroll } from './use-hide-on-scroll';
import { onItemArrowKeys } from './use-item-arrow-keys';

interface BarContextValue {
  iconPosition: 'top' | 'start';
  itemClassName: string;
}

const BarContext = createContext<BarContextValue | null>(null);

type Naming =
  | {
      /** Accessible name for the navigation bar. Required unless `aria-labelledby` is set. */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the navigation bar. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

export interface NavigationBarClassNames {
  /** The `<nav>` container, merged with `className`. */
  root?: string;
  /** Every item in the bar, merged with each item's own classes. */
  item?: string;
}

interface NavigationBarOwnProps {
  /**
   * Icons above labels (compact windows) or beside them (the flexible bar in medium
   * windows). @default "top"
   */
  iconPosition?: 'top' | 'start';
  /**
   * Share the width equally, or centre the items. Stacked items centre within side
   * padding; items beside their icons keep their own width, with the extra space at the
   * ends. @default "equal" for `iconPosition="top"`, "centered" for `"start"`
   */
  arrangement?: NavigationBarArrangement;
  /**
   * `hide-on-scroll` slides the bar off the bottom while the page scrolls down and back
   * on any scroll up. The bar becomes `sticky` at the bottom, so put it last in a
   * scrolling layout and don't add positioning classes. It stays put under reduced
   * motion. M3: don't hide the bar on scroll when a screen reader is active, so leave
   * this off where assistive tech is in use. @default "pinned"
   */
  scrollBehavior?: 'pinned' | 'hide-on-scroll';
  /** With `hide-on-scroll`, the element that scrolls instead of the page. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** `NavigationBarItem` elements (3–5 in M3). */
  children: ReactNode;
  /** Classes for each part, by slot. */
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
 * it beside the label in a 40px pill. Labels wrap rather than truncate, and the bar grows
 * to fit them. Tab or the arrow keys move between items.
 *
 * @example
 * <NavigationBar aria-label="Main" className="fixed inset-x-0 bottom-0">
 *   <NavigationBarItem href="/" icon={<HomeIcon />} selected>Home</NavigationBarItem>
 * </NavigationBar>
 */
export function NavigationBar({
  iconPosition = 'top',
  arrangement = iconPosition === 'start' ? 'centered' : 'equal',
  scrollBehavior = 'pinned',
  scrollRef,
  children,
  classNames,
  className,
  style,
  ref,
  onKeyDown,
  ...rest
}: NavigationBarProps) {
  const navRef = useObjectRef(ref);
  const hideOnScroll = scrollBehavior === 'hide-on-scroll';
  useHideOnScroll(hideOnScroll, navRef, scrollRef);
  const styles = navigationBarStyles({ arrangement, iconPosition, hideOnScroll });
  const count = Children.toArray(children).filter(isValidElement).length;
  // Compose: centred stacked items sit within (100% − 10% × (n + 3)) / 2 each side, up to 6.
  const padding =
    arrangement === 'centered' && iconPosition === 'top' && count <= 6
      ? `${(100 - 10 * (count + 3)) / 2}%`
      : undefined;
  const arrowKeys = onItemArrowKeys('horizontal');
  return (
    <nav
      {...rest}
      ref={navRef}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        arrowKeys(event);
      }}
      style={{ paddingInline: padding, ...style } as CSSProperties}
      data-tokens="md-comp-nav-bar"
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
