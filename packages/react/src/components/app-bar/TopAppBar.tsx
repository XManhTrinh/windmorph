'use client';

import { useRef, type ComponentPropsWithRef, type ReactNode, type RefObject } from 'react';
import { useObjectRef } from 'react-aria';
import { cn } from '../../utils/cn';
import { topAppBarStyles, type TopAppBarTitleAlign, type TopAppBarVariant } from './app-bar-styles';
import { useAppBarScroll, type TopAppBarScrollBehavior } from './use-app-bar-scroll';

export interface TopAppBarClassNames {
  root?: string;
  /** The 64px top row. */
  row?: string;
  navigation?: string;
  /** The top row's title block. */
  title?: string;
  actions?: string;
  /** The expanded title row of medium and large bars. */
  expandedRow?: string;
}

interface TopAppBarOwnProps {
  /**
   * `small` is a 64px single row; `medium` and `large` are Compose's flexible two-row bars
   * (112 / 120px, 136 / 152px with a subtitle) that collapse to 64px. @default "small"
   */
  variant?: TopAppBarVariant;
  /** The title, e.g. the screen's name. Wrap it in a heading element if it names the page. */
  title: ReactNode;
  subtitle?: ReactNode;
  /** @default "start" */
  titleAlign?: TopAppBarTitleAlign;
  /** A leading control, usually a back or menu `IconButton`. */
  navigationIcon?: ReactNode;
  /** Trailing controls, usually `IconButton`s. */
  actions?: ReactNode;
  /**
   * Respond to content scrolling under the bar: it sticks to the top, turns
   * `surface-container`, and (for `enter-always` / `exit-until-collapsed`) collapses.
   * Leave it out for a static bar positioned by the consumer.
   */
  scrollBehavior?: TopAppBarScrollBehavior;
  /** The scroll container the bar responds to. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  classNames?: TopAppBarClassNames;
}

export type TopAppBarProps = TopAppBarOwnProps &
  Omit<ComponentPropsWithRef<'header'>, keyof TopAppBarOwnProps | 'children'>;

/**
 * M3 Expressive top app bar: a small 64px bar, or the medium and large flexible bars whose
 * large title collapses into the top row as the page scrolls. Titles can be centred and
 * have a subtitle.
 *
 * @example
 * <TopAppBar title={<h1>Inbox</h1>} subtitle="3 unread" variant="medium"
 *   scrollBehavior="exit-until-collapsed"
 *   navigationIcon={<IconButton icon={<MenuIcon />} aria-label="Menu" />}
 *   actions={<IconButton icon={<SearchIcon />} aria-label="Search" />} />
 */
export function TopAppBar({
  variant = 'small',
  title,
  subtitle,
  titleAlign = 'start',
  navigationIcon,
  actions,
  scrollBehavior,
  scrollRef,
  classNames,
  className,
  ref,
  ...rest
}: TopAppBarProps) {
  const rootRef = useObjectRef(ref);
  const expandedRowRef = useRef<HTMLDivElement>(null);
  const twoRows = variant !== 'small';
  const scroll = useAppBarScroll({
    behavior: scrollBehavior,
    rootRef,
    collapsibleRef: twoRows ? expandedRowRef : rootRef,
    scrollRef,
    twoRows,
  });
  const styles = topAppBarStyles({
    variant,
    titleAlign,
    hasNavigation: navigationIcon != null,
    hasSubtitle: subtitle != null,
    scrolling: scrollBehavior != null,
    twoRows,
  });
  // Only one of a two-row bar's titles is announced: the expanded one until it is half collapsed.
  const hideTopTitle = twoRows && !scroll.collapsed;

  return (
    <header
      {...rest}
      ref={rootRef}
      data-scrolled={scroll.scrolled || undefined}
      data-collapsed={scroll.collapsed || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <div className={styles.row({ class: classNames?.row })}>
        {navigationIcon != null && (
          <div className={styles.navigation({ class: classNames?.navigation })}>
            {navigationIcon}
          </div>
        )}
        <div
          aria-hidden={hideTopTitle || undefined}
          className={styles.title({ class: classNames?.title })}
        >
          <div className={styles.titleText()}>{title}</div>
          {subtitle != null && <div className={styles.subtitleText()}>{subtitle}</div>}
        </div>
        {actions != null && (
          <div className={styles.actions({ class: classNames?.actions })}>{actions}</div>
        )}
      </div>
      {twoRows && (
        <div
          ref={expandedRowRef}
          aria-hidden={!hideTopTitle || undefined}
          className={styles.expandedRow({ class: classNames?.expandedRow })}
        >
          <div className={styles.expandedTitle()}>{title}</div>
          {subtitle != null && <div className={styles.expandedSubtitle()}>{subtitle}</div>}
        </div>
      )}
    </header>
  );
}
