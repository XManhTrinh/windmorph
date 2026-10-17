import { reducedMotionFade } from '../../motion/reduced-motion';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (WideNavigationRail.kt, ShortNavigationBar.kt and the
 * NavigationRail* / NavigationBar* token files).
 *
 * Rail: `surface`, 96px collapsed; expanded it is as wide as its widest item plus the 20px
 * insets, 220–360px, and the width springs on the default spatial spring. Content starts
 * 44px down; a header sits 40px above the items, which are 4px apart collapsed and flush
 * expanded. The modal expanded rail is `surface-container` at level 2 with 16px end
 * corners over a 32% scrim; it grows from the collapsed width on the fast spatial spring, or
 * slides in on the default one when the collapsed rail is hidden. It stays mounted until its
 * own width or slide (or, under reduced motion, its fade) has ended.
 *
 * Icons stay on one line in both states, through the middle of the collapsed rail, as in
 * M3's rail motion: only the labels and the rail's edge move. While the width springs open
 * (and while the modal sheet shrinks away) labels stay on one line, clipped by the rail, so
 * none wraps letter by letter in a rail that is still narrow and no item grows taller. So nothing is centred in
 * the animated width. The collapsed width is `--m3-rail-collapsed-width` (96px), and the
 * item inset `--m3-rail-item-inset` is half of what's left beside a 56px pill (20px). The
 * header is a 56px column at that inset: anything up to 56px (the menu button, a FAB) is
 * centred on the icon line, and anything wider (an extended FAB) keeps its width and starts
 * at the column's edge.
 *
 * Items align as a group to the top (default) or, with `itemAlignment="center"`, to the
 * middle of the space below the header (M3: centre alignment on tablets); the header stays
 * at the top. An optional divider (`outline-variant`) marks the edge next to the content.
 *
 * Bar: `surface-container`, at least 64px (it grows when labels wrap), no elevation.
 * Stacked items share the width equally, or, when centred, sit within side padding of
 * (100% − 10% × (items + 3)) / 2 (up to 6 items). Items beside their icons
 * (`iconPosition="start"`) are centred by default and sized to their content, so the extra
 * space goes to the bar's ends (M3: "Horizontal navigation items have a fixed width").
 * With `scrollBehavior="hide-on-scroll"` the bar is sticky at the bottom and its offset
 * (`--m3-nav-bar-offset`, 0 down to minus its height) follows the page scroll.
 *
 * The rail's width is the `--m3-rail-width` variable, so a consumer `w-*` class still wins;
 * a narrower or wider collapsed rail sets `--m3-rail-collapsed-width` instead.
 *
 * Container colours and the modal rail's corners come from the component tokens
 * (`navigation-tokens.ts`, `--md-comp-nav-bar-*` and `--md-comp-nav-rail-*`): the bar, the
 * rail and the modal rail's sheet (`data-modal`) carry `data-tokens`. A consumer class still
 * wins in `cn()`.
 * Every class is written out in full so Tailwind can find it.
 */

/** Half of what's left beside a 56px pill in the collapsed rail. */
const itemInset = '[--m3-rail-item-inset:calc((var(--m3-rail-collapsed-width)_-_56px)/2)]';

/**
 * While the expanded rail is still widening (`data-widening`), labels stay on one line and
 * the rail clips them, so the items keep their height and the icons their places.
 */
const oneLineWhileResizing = '[&[data-widening]_[data-nav-label]]:text-nowrap';

const widthMotion = [
  '[transition-property:width]',
  '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
];

/** Variant definitions for {@link NavigationRail}; extend them to add variants. */
export const navigationRailStyles = tv({
  slots: {
    root: [
      'flex w-(--m3-rail-width) shrink-0 flex-col text-on-surface',
      'bg-[var(--_md-comp-nav-rail-collapsed-container-color)] data-expanded:bg-[var(--_md-comp-nav-rail-expanded-container-color)]',
      itemInset,
      oneLineWhileResizing,
      ...widthMotion,
    ],
    // Library-owned wrapper: clips labels while the width animates.
    body: 'flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-auto pt-[44px]',
    // Children keep their own width (a centred grid item would shrink to the 56px column).
    header:
      'grid grid-cols-[56px] justify-items-center-safe ps-(--m3-rail-item-inset) pb-[40px] [&>*]:min-w-max',
    // The gap between items springs 4 → 0px as the rail expands (default spatial, as
    // Compose's itemVerticalSpacedBy; 2026-10-17), instant under reduced motion.
    items: [
      'flex flex-col',
      '[transition-property:gap] [transition-duration:var(--md-sys-motion-spring-spatial-default-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    scrim: [
      'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      // In and out on the default effects spring, as Compose's modal rail scrim (2026-10-15).
      'starting:opacity-0 data-exiting:opacity-0',
    ],
    sheet: [
      'fixed inset-y-0 start-0 z-(--md-sys-z-sheet) flex w-(--m3-rail-width) flex-col overflow-x-clip overflow-y-auto pt-[44px]',
      'rounded-e-[var(--_md-comp-nav-rail-expanded-modal-container-shape)] bg-[var(--_md-comp-nav-rail-expanded-modal-container-color)]',
      'text-on-surface shadow-elevation-2 outline-none',
      itemInset,
      oneLineWhileResizing,
      '[&[data-exiting]_[data-nav-label]]:text-nowrap',
      '[transition-property:width,translate]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
      // Under reduced motion it fades in and out at its full width.
      ...reducedMotionFade,
    ],
  },
  variants: {
    expanded: {
      true: { items: 'gap-0' },
      false: { items: 'gap-[4px]' },
    },
    /** Auto margins centre the items without hiding any when the rail overflows. */
    itemAlignment: {
      top: {},
      center: { items: 'my-auto' },
    },
    /** A divider on the edge next to the content. */
    divider: {
      true: { root: 'border-e border-outline-variant' },
      false: {},
    },
    /**
     * `indicatorMotion="slide"` in the expanded rail: the list is isolated, so the items'
     * raised content stays above a sliding pill and no higher.
     */
    slidingIndicator: {
      true: { items: 'isolate' },
      false: {},
    },
    /**
     * Modal sheet entry: from the collapsed width, or sliding in from the start edge. Under
     * reduced motion it fades instead.
     */
    sheetEntry: {
      grow: {
        sheet:
          'motion-safe:starting:w-(--m3-rail-collapsed-width) motion-safe:data-exiting:w-(--m3-rail-collapsed-width)',
      },
      // Sliding in, the sheet takes the default spatial spring, as Compose's modal rail
      // (`WideNavigationRail.kt`): the fast one overshot 21px off the window edge (2026-10-15).
      slide: {
        sheet: [
          'motion-safe:starting:-translate-x-full motion-safe:data-exiting:-translate-x-full motion-safe:rtl:starting:translate-x-full motion-safe:rtl:data-exiting:translate-x-full',
          '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
        ],
      },
    },
  },
  defaultVariants: {
    expanded: false,
    sheetEntry: 'grow',
    itemAlignment: 'top',
    divider: false,
    slidingIndicator: false,
  },
});

/** Variant definitions for {@link NavigationBar}; extend them to add variants. */
export const navigationBarStyles = tv({
  slots: {
    root: 'flex min-h-[64px] w-full bg-[var(--_md-comp-nav-bar-container-color)] text-on-surface',
    item: 'min-w-0',
  },
  variants: {
    arrangement: {
      equal: { item: 'flex-1 basis-0' },
      centered: { root: 'justify-center', item: 'flex-1 basis-0' },
    },
    iconPosition: { top: {}, start: {} },
    hideOnScroll: {
      // Settling after a scroll ends (`data-settling`), the offset eases to shown or hidden on
      // the default effects spring; while scrolling it follows the scroll directly.
      true: {
        root: [
          'sticky bottom-(--m3-nav-bar-offset) z-(--md-sys-z-sticky)',
          'data-settling:[transition-property:bottom]',
          'data-settling:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          'data-settling:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    // Items beside their icons keep their own width; the extra space goes to the ends.
    { arrangement: 'centered', iconPosition: 'start', class: { item: 'flex-initial basis-auto' } },
  ],
  defaultVariants: { arrangement: 'equal', iconPosition: 'top', hideOnScroll: false },
});

export type NavigationBarStyleProps = VariantProps<typeof navigationBarStyles>;
export type NavigationBarArrangement = NonNullable<NavigationBarStyleProps['arrangement']>;
