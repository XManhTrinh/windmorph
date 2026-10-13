'use client';

import type { ComponentPropsWithRef, ReactNode, RefObject } from 'react';
import { useObjectRef } from 'react-aria';
import { cn } from '../../utils/cn';
import { useAppBarScroll } from '../app-bar/use-app-bar-scroll';
import { SearchAppBarContext } from './SearchBar';
import { searchAppBarStyles } from './search-styles';

export interface SearchAppBarClassNames {
  root?: string;
  navigation?: string;
  /** The area holding the search bar. */
  search?: string;
  actions?: string;
}

interface SearchAppBarOwnProps {
  /** The `SearchBar`. It fills the free space, up to 720px, centred. */
  children: ReactNode;
  /** A leading control, e.g. a menu `IconButton`. */
  navigationIcon?: ReactNode;
  /** Trailing controls, e.g. an avatar or `IconButton`s. */
  actions?: ReactNode;
  /**
   * Respond to content scrolling under the bar: it sticks to the top and turns
   * `surface-container` (its search bar `surface-container-highest`); `enter-always` also
   * hides it on scroll down and brings it back on any scroll up.
   */
  scrollBehavior?: 'pinned' | 'enter-always';
  /** The scroll container the bar responds to. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  classNames?: SearchAppBarClassNames;
}

export type SearchAppBarProps = SearchAppBarOwnProps &
  Omit<ComponentPropsWithRef<'header'>, keyof SearchAppBarOwnProps>;

/**
 * M3 Expressive app bar with search (Compose's `AppBarWithSearch`): a top bar whose middle
 * is a search bar, with an optional navigation icon and actions.
 *
 * @example
 * <SearchAppBar navigationIcon={<IconButton icon={<MenuIcon />} aria-label="Menu" />}
 *   actions={<Avatar />} scrollBehavior="enter-always">
 *   <SearchBar aria-label="Search" placeholder="Search" leadingIcon={<SearchIcon />} />
 * </SearchAppBar>
 */
export function SearchAppBar({
  children,
  navigationIcon,
  actions,
  scrollBehavior,
  scrollRef,
  classNames,
  className,
  ref,
  ...rest
}: SearchAppBarProps) {
  const rootRef = useObjectRef(ref);
  const scroll = useAppBarScroll({
    behavior: scrollBehavior,
    rootRef,
    collapsibleRef: rootRef,
    scrollRef,
    twoRows: false,
  });
  const styles = searchAppBarStyles({ scrolling: scrollBehavior != null });
  return (
    <header
      {...rest}
      ref={rootRef}
      data-scrolled={scroll.scrolled || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {navigationIcon != null && (
        <div className={styles.navigation({ class: classNames?.navigation })}>{navigationIcon}</div>
      )}
      <div className={styles.search({ class: classNames?.search })}>
        <SearchAppBarContext value={{ scrolled: scroll.scrolled }}>{children}</SearchAppBarContext>
      </div>
      {actions != null && (
        <div className={styles.actions({ class: classNames?.actions })}>{actions}</div>
      )}
    </header>
  );
}
