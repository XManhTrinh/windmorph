import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (AppBar.kt: TopAppBar, MediumFlexibleTopAppBar,
 * LargeFlexibleTopAppBar, TopAppBarLayout; AppBar / AppBarSmall / AppBarMediumFlexible /
 * AppBarLargeFlexible tokens).
 *
 * Container `surface`, turning `surface-container` when content scrolls under it (a single
 * row, or a pinned two-row bar: animated on the default effects spring) or as a two-row bar
 * collapses (blended in Oklab with fast-out-linear-in, as Compose's lerp), or turning
 * see-through with `scrolledColor="transparent"`. No elevation.
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
 * Colours come from the app bar's component tokens (`app-bar-tokens.ts`,
 * `--md-comp-app-bar-*`): the root carries `data-tokens="md-comp-app-bar"`, and the
 * container reads the blend of the resting and on-scroll colours. A consumer class still
 * wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link TopAppBar}; extend them to add variants. */
export const topAppBarStyles = tv({
  slots: {
    root: [
      'flex w-full flex-col text-on-surface',
      'bg-[var(--_md-comp-app-bar-container-color-blend)]',
    ],
    // The top row: navigation icon, title and actions.
    row: [
      'grid min-h-[64px] shrink-0 items-center',
      'bg-[var(--_md-comp-app-bar-container-color-blend)]',
    ],
    // Icon buttons take each slot's content colour.
    navigation:
      'col-start-1 flex items-center ps-[8px] pe-[4px] text-[color:var(--_md-comp-app-bar-leading-icon-color)] [--md-comp-icon-button-icon-color:currentColor]',
    title: 'col-start-2 flex min-w-0 flex-col ps-[4px] pe-[4px]',
    titleText: 'truncate text-[color:var(--_md-comp-app-bar-title-color)]',
    subtitleText: 'truncate text-[color:var(--_md-comp-app-bar-subtitle-color)]',
    actions:
      'col-start-3 flex items-center justify-end gap-[8px] ps-[4px] pe-[8px] text-[color:var(--_md-comp-app-bar-trailing-icon-color)] [--md-comp-icon-button-icon-color:currentColor]',
    // Two-row bars: the expanded title row.
    expandedRow: 'flex flex-col ps-[16px] pe-[16px]',
    // M3: a long headline wraps to two lines at most.
    expandedTitle: 'line-clamp-2 text-[color:var(--_md-comp-app-bar-title-color)]',
    expandedSubtitle: 'text-[color:var(--_md-comp-app-bar-subtitle-color)]',
    // The accessory row (`bottom`): on the bar's colour, laid out by its content.
    bottom: 'flex min-w-0 shrink-0 flex-col',
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
    /**
     * Set for `scrollBehavior="pinned"`: a two-row bar never collapses, so it changes colour
     * as a whole once content scrolls under it, like a single row.
     */
    pinned: { true: {}, false: {} },
    /**
     * The colour content scrolls under: `surface-container`, or `transparent` (the bar fades
     * from `surface` to see-through).
     */
    scrolledColor: {
      container: {},
      transparent: { root: '[--m3-app-bar-scrolled-color:transparent]' },
    },
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
        // Clipped to the part not yet under the top row (`--m3-app-bar-collapse`, from the
        // scroll), so it doesn't show through a see-through top row.
        expandedRow:
          'opacity-[var(--m3-app-bar-bottom-alpha,1)] [clip-path:inset(var(--m3-app-bar-collapse,0px)_0_0_0)]',
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
    {
      twoRows: true,
      pinned: true,
      class: {
        root: [
          '[transition-property:background-color]',
          '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
        ],
        row: 'bg-transparent',
      },
    },
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
    pinned: false,
    twoRows: false,
    scrolledColor: 'container',
  },
});

/**
 * The variants of {@link topAppBarStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type TopAppBarStyleProps = VariantProps<typeof topAppBarStyles>;
export type TopAppBarVariant = NonNullable<TopAppBarStyleProps['variant']>;
export type TopAppBarTitleAlign = NonNullable<TopAppBarStyleProps['titleAlign']>;
