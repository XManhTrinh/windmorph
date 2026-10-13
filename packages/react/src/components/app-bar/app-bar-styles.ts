import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (AppBar.kt: TopAppBar, MediumFlexibleTopAppBar,
 * LargeFlexibleTopAppBar, TopAppBarLayout; AppBar / AppBarSmall / AppBarMediumFlexible /
 * AppBarLargeFlexible tokens).
 *
 * Container `surface`, turning `surface-container` when content scrolls under it (single
 * row: animated on the default effects spring) or as a two-row bar collapses (blended in
 * Oklab with fast-out-linear-in, as Compose's lerp). No elevation.
 *
 * Rows: the top row is 64px. Navigation icon `on-surface`, title `on-surface`, subtitle and
 * actions `on-surface-variant`. Compose's icon buttons take 48px of layout and ours 40px,
 * so the slots add Compose's 4px of slack: the navigation icon sits 8px from the start, the
 * title 56px after it (16px with no icon), and the actions 8px apart and 8px from the end.
 *
 * Two-row bars add a bottom row of expanded height − 64px: medium 48px (72px with a
 * subtitle), large 56px (88px). Compose places the title 24px / 28px above the row's
 * bottom by its baseline, but with the M3 type scale that padding is always clamped, which
 * puts the title at the top of the row, and the row grows to fit a wrapped title. That is
 * reproduced exactly by top-aligning it in a min-height row.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link TopAppBar}; extend them to add variants. */
export const topAppBarStyles = tv({
  slots: {
    root: [
      'flex w-full flex-col text-on-surface',
      'bg-[color:color-mix(in_oklab,var(--color-surface-container)_var(--m3-app-bar-scrolled,0%),var(--color-surface))]',
    ],
    // The top row: navigation icon, title and actions.
    row: [
      'grid h-[64px] shrink-0 items-center',
      'bg-[color:color-mix(in_oklab,var(--color-surface-container)_var(--m3-app-bar-scrolled,0%),var(--color-surface))]',
    ],
    navigation: 'col-start-1 flex items-center ps-[8px] pe-[4px] text-on-surface',
    title: 'col-start-2 flex min-w-0 flex-col ps-[4px] pe-[4px]',
    titleText: 'truncate text-on-surface',
    subtitleText: 'truncate text-on-surface-variant',
    actions:
      'col-start-3 flex items-center justify-end gap-[8px] ps-[4px] pe-[8px] text-on-surface-variant',
    // Two-row bars: the expanded title row.
    expandedRow: 'flex flex-col ps-[16px] pe-[16px]',
    expandedTitle: 'text-on-surface',
    expandedSubtitle: 'text-on-surface-variant',
  },
  variants: {
    variant: {
      small: {
        titleText: 'text-title-large',
        subtitleText: 'text-label-medium',
      },
      medium: {
        titleText: 'text-title-large',
        subtitleText: 'text-label-medium',
        expandedTitle: 'text-headline-medium',
        expandedSubtitle: 'text-label-large',
      },
      large: {
        titleText: 'text-title-large',
        subtitleText: 'text-label-medium',
        expandedTitle: 'text-display-small',
        expandedSubtitle: 'text-title-medium',
      },
    },
    titleAlign: {
      // The title column takes the free space after the navigation icon.
      start: { row: 'grid-cols-[auto_minmax(0,1fr)_auto]', title: 'items-start' },
      // Equal side columns centre the title in the whole bar until a side needs more room.
      center: {
        row: 'grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)]',
        title: 'items-center text-center',
        expandedRow: 'items-center text-center',
      },
    },
    hasNavigation: {
      true: {},
      false: { title: 'ps-[16px]' },
    },
    hasSubtitle: { true: {}, false: {} },
    /** Set when the bar responds to scrolling: it sticks, and its offset follows the scroll. */
    scrolling: {
      true: { root: 'sticky top-(--m3-app-bar-offset) z-(--md-sys-z-sticky)' },
      false: {},
    },
    twoRows: {
      true: {
        // The top row stays put while the expanded row scrolls up beneath it.
        row: 'sticky top-0',
        titleText: 'opacity-[var(--m3-app-bar-top-alpha,0)]',
        subtitleText: 'opacity-[var(--m3-app-bar-top-alpha,0)]',
        expandedRow: 'opacity-[var(--m3-app-bar-bottom-alpha,1)]',
      },
      // A single row changes colour as a whole once content scrolls under it.
      false: {
        root: [
          '[transition-property:background-color]',
          '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
        ],
        row: 'bg-transparent',
      },
    },
  },
  compoundVariants: [
    { variant: 'medium', hasSubtitle: false, class: { expandedRow: 'min-h-[48px]' } },
    { variant: 'medium', hasSubtitle: true, class: { expandedRow: 'min-h-[72px]' } },
    { variant: 'large', hasSubtitle: false, class: { expandedRow: 'min-h-[56px]' } },
    { variant: 'large', hasSubtitle: true, class: { expandedRow: 'min-h-[88px]' } },
  ],
  defaultVariants: {
    variant: 'small',
    titleAlign: 'start',
    hasNavigation: false,
    hasSubtitle: false,
    scrolling: false,
    twoRows: false,
  },
});

export type TopAppBarStyleProps = VariantProps<typeof topAppBarStyles>;
export type TopAppBarVariant = NonNullable<TopAppBarStyleProps['variant']>;
export type TopAppBarTitleAlign = NonNullable<TopAppBarStyleProps['titleAlign']>;
