'use client';

import { useRef, type ComponentPropsWithRef, type ReactNode, type RefObject } from 'react';
import { useObjectRef } from 'react-aria';
import { cn } from '../../utils/cn';
import { AppBarItems } from './AppBarItems';
import { topAppBarStyles, type TopAppBarTitleAlign, type TopAppBarVariant } from './app-bar-styles';
import { useAppBarScroll, type TopAppBarScrollBehavior } from './use-app-bar-scroll';

export interface TopAppBarClassNames {
  /** The `<header>` container, merged with `className`. */
  root?: string;
  /** The 64px top row. */
  row?: string;
  /** The leading slot holding `navigationIcon`. */
  navigation?: string;
  /** The top row's title block. */
  title?: string;
  /** The top row's title text. */
  titleText?: string;
  /** The top row's subtitle text. */
  subtitleText?: string;
  /** The trailing slot holding `actions`. */
  actions?: string;
  /** The expanded title row of medium and large bars. */
  expandedRow?: string;
  /** The expanded row's title text. */
  expandedTitle?: string;
  /** The expanded row's subtitle text. */
  expandedSubtitle?: string;
  /** The accessory row below the title rows (`bottom`). */
  bottom?: string;
}

interface TopAppBarOwnProps {
  /**
   * `small` is a 64px single row; `medium` and `large` are Compose's flexible two-row bars
   * (112 / 120px, 136 / 152px with a subtitle) that collapse to 64px. @default "small"
   */
  variant?: TopAppBarVariant;
  /** The title, e.g. the screen's name. Wrap it in a heading element if it names the page. */
  title: ReactNode;
  /** A second line under the title, e.g. the current section. */
  subtitle?: ReactNode;
  /** Align the title (and subtitle) to the start, or centre it. @default "start" */
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
  /**
   * An accessory row below the title rows, such as a row of filter chips or tabs (M3: app
   * bars "can animate on and off screen with another bar of controls, like a row of chips").
   * It's part of the bar: it takes the bar's colour, stays below the collapsed top row of
   * a medium or large bar, and hides and comes back with the bar under `enter-always` and
   * a small bar's `exit-until-collapsed`. Give it its own padding.
   */
  bottom?: ReactNode;
  /**
   * The container's colour once content scrolls under the bar. `container` fills it with
   * `surface-container` (M3's default); `transparent` lets the content show through (M3:
   * "consider setting the app bar container to be transparent on scroll"); give the icon
   * buttons a container fill then (e.g. `variant="tonal"`), so they stay legible over the
   * content.
   * @default "container"
   */
  scrolledColor?: TopAppBarScrolledColor;
  /** Classes for each part, by slot. */
  classNames?: TopAppBarClassNames;
}

/** The colour a {@link TopAppBar} takes when content scrolls under it. */
export type TopAppBarScrolledColor = 'container' | 'transparent';

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
  bottom,
  scrolledColor = 'container',
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
    pinned: scrollBehavior === 'pinned',
    twoRows,
    scrolledColor,
  });
  // Only one of a two-row bar's titles is announced: the expanded one until it is half collapsed.
  const hideTopTitle = twoRows && !scroll.collapsed;

  return (
    <header
      {...rest}
      ref={rootRef}
      data-tokens="md-comp-app-bar"
      data-variant={variant}
      data-scrolled={scroll.scrolled || undefined}
      data-collapsed={scroll.collapsed || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      <AppBarItems>
        <div className={styles.row({ class: classNames?.row })}>
          {navigationIcon != null && (
            <div
              data-slot="navigation"
              className={styles.navigation({ class: classNames?.navigation })}
            >
              {navigationIcon}
            </div>
          )}
          <div
            aria-hidden={hideTopTitle || undefined}
            className={styles.title({ class: classNames?.title })}
          >
            <div data-slot="title" className={styles.titleText({ class: classNames?.titleText })}>
              {title}
            </div>
            {subtitle != null && (
              <div
                data-slot="subtitle"
                className={styles.subtitleText({ class: classNames?.subtitleText })}
              >
                {subtitle}
              </div>
            )}
          </div>
          {actions != null && (
            <div data-slot="actions" className={styles.actions({ class: classNames?.actions })}>
              {actions}
            </div>
          )}
        </div>
        {twoRows && (
          <div
            ref={expandedRowRef}
            aria-hidden={!hideTopTitle || undefined}
            className={styles.expandedRow({ class: classNames?.expandedRow })}
          >
            <div className={styles.expandedTitle({ class: classNames?.expandedTitle })}>
              {title}
            </div>
            {subtitle != null && (
              <div className={styles.expandedSubtitle({ class: classNames?.expandedSubtitle })}>
                {subtitle}
              </div>
            )}
          </div>
        )}
        {bottom != null && (
          <div className={styles.bottom({ class: classNames?.bottom })}>{bottom}</div>
        )}
      </AppBarItems>
    </header>
  );
}
