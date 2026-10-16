'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useLayoutEffect,
  useState,
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
import { mergeDataTokens } from '../../utils/split-data-attributes';

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
   * windows). Items beside their icons stack, sharing the width equally, whenever their
   * labels don't fit on one line side by side (a narrow bar or large text), so no label is
   * cut off; the bar then carries `data-stacked`. @default "top"
   */
  iconPosition?: 'top' | 'start';
  /**
   * Share the width equally, or centre the items. Stacked items centre within side
   * padding; items beside their icons keep their own width, with the extra space at the
   * ends. @default "equal", or "centered" when iconPosition is "start"
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
  const stacked = useStackWhenCrowded(navRef, iconPosition === 'start');
  // Inline items that don't fit on one line become stacked items sharing the width equally.
  const layout = stacked ? 'top' : iconPosition;
  const styles = navigationBarStyles({
    arrangement: stacked ? 'equal' : arrangement,
    iconPosition: layout,
    hideOnScroll,
  });
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
      data-tokens={mergeDataTokens('md-comp-nav-bar', rest)}
      data-stacked={stacked || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <BarContext
        value={{ iconPosition: layout, itemClassName: styles.item({ class: classNames?.item }) }}
      >
        {children}
      </BarContext>
    </nav>
  );
}

/**
 * An inline item's width besides its label: 4px outside the pill on each side, 16px inside
 * it, a 24px icon and the 4px gap before the label (`nav-item-styles.ts`, `bar-start`).
 */
const INLINE_ITEM_CHROME = 4 + 16 + 24 + 4 + 16 + 4;

/**
 * Whether inline items must stack because their labels don't fit on one line side by side,
 * as at large text sizes (M3: "Ensure the full label is always visible on-screen at up to 2x
 * text sizing"; 2026-10-15). Each label is measured on one line (the same type role in both
 * layouts, so the answer doesn't change with the layout it picks), again whenever the bar
 * or a label resizes (a narrower window, a larger root text size, a web font loading).
 */
function useStackWhenCrowded(navRef: RefObject<HTMLElement | null>, inline: boolean) {
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!inline || !nav) {
      setStacked(false);
      return;
    }
    const labels = () => [...nav.querySelectorAll<HTMLElement>('[data-nav-label]')];
    const measure = () => {
      // Not laid out (hidden, or no layout engine): keep the layout asked for.
      if (nav.clientWidth === 0) return setStacked(false);
      let needed = 0;
      for (const label of labels()) {
        const wrap = label.style.whiteSpace;
        label.style.whiteSpace = 'nowrap';
        // A large badge on the icon takes room past the icon's end edge (12px inside it).
        const badge = label
          .closest('[data-nav-item]')
          ?.querySelector<HTMLElement>('[data-size="large"]');
        const overhang = badge ? Math.max(0, badge.offsetWidth - 12) : 0;
        needed += label.scrollWidth + INLINE_ITEM_CHROME + overhang;
        label.style.whiteSpace = wrap;
      }
      const style = getComputedStyle(nav);
      const available =
        nav.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      setStacked(needed > available + 0.5);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    labels().forEach((label) => observer.observe(label));
    return () => observer.disconnect();
  }, [navRef, inline]);
  return inline && stacked;
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
