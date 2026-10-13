import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (SearchBar.kt: SearchBar, AppBarWithSearch,
 * ExpandedDockedSearchBarWithGap, ExpandedFullScreenSearchBar, SearchBarDefaults.InputField;
 * SearchBar / SearchView tokens).
 *
 * Field: 56px, full corners, `surface-container-high`, 360px wide by default and at most
 * 720px. Input and placeholder `body-large`, `on-surface` / `on-surface-variant`. Icons sit
 * in 48px boxes shifted 4px inwards (leading `on-surface`, trailing `on-surface-variant`);
 * text starts 52px in after a leading icon (16px without one).
 *
 * Docked (with gap): the expanded field sits over the collapsed one, and a dropdown 2px
 * below it (12px corners, `surface-container-high`, at most half the window tall) slides
 * down from half its height on the default spatial spring (fast spatial back) while its
 * content fades in over 100ms after 50ms; a 32% scrim covers the page.
 *
 * Full screen: a `surface-container-high` surface grows from the bar's bounds (28px corners)
 * to the whole window on the slow spatial spring (default spatial back); the field moves to
 * the top, 8px down and full width, and the content starts 72px down.
 *
 * Every class is written out in full so Tailwind can find it.
 */

const contentFade = [
  'opacity-100 starting:opacity-0 data-exiting:opacity-0',
  // Compose: fade in over 100ms after 50ms (standard accelerate), out over 100ms.
  '[transition-delay:0s,50ms] data-exiting:[transition-delay:0s,0s]',
];

/** Variant definitions for {@link SearchBar}; extend them to add variants. */
export const searchBarStyles = tv({
  slots: {
    // The bar's height is set here alone (56px, Compose's); a consumer `h-*` resizes it.
    root: 'flex h-[56px] w-[360px] max-w-[min(720px,100%)] shrink-0',
    // The pill holding the icons and the input fills the bar.
    // Keyboard focus in the input draws Compose's inset focus ring around the pill.
    field:
      'focus-ring-inset flex h-full w-full min-w-0 items-center rounded-corner-full text-on-surface',
    leading:
      'ms-[4px] flex size-[48px] shrink-0 items-center justify-center text-on-surface [&>svg]:size-[24px]',
    trailing:
      'me-[4px] flex size-[48px] shrink-0 items-center justify-center text-on-surface-variant [&>svg]:size-[24px]',
    input: [
      'h-full min-w-0 flex-1 bg-transparent text-body-large text-on-surface caret-primary outline-none',
      'placeholder:text-on-surface-variant',
      '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
    ],
    scrim: [
      'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'starting:opacity-0 data-exiting:opacity-0',
    ],
    // Docked view: the panel sits over the collapsed bar.
    dockedPanel: 'fixed z-(--md-sys-z-sheet) flex flex-col outline-none',
    dropdown: [
      'mt-[2px] max-h-[calc(50dvh-58px)] overflow-y-auto overscroll-contain',
      'rounded-[12px] bg-surface-container-high text-on-surface',
      'translate-y-0 starting:-translate-y-1/2 data-exiting:-translate-y-1/2',
      '[transition-property:translate,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),100ms]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),cubic-bezier(0.3,0,1,1)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),100ms]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),cubic-bezier(0,0,0,1)]',
      ...contentFade,
    ],
    // Full-screen view: the surface grows from the bar's bounds to the window.
    fullScreenPanel: [
      'fixed inset-0 z-(--md-sys-z-sheet) bg-surface-container-high text-on-surface outline-none',
      '[clip-path:inset(0_round_0)]',
      'starting:[clip-path:inset(var(--m3-search-top)_var(--m3-search-right)_var(--m3-search-bottom)_var(--m3-search-left)_round_28px)]',
      'data-exiting:[clip-path:inset(var(--m3-search-top)_var(--m3-search-right)_var(--m3-search-bottom)_var(--m3-search-left)_round_28px)]',
      '[transition-property:clip-path]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-slow-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-slow-easing)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    fullScreenHeader: [
      // Compose's full-screen field is 56px whatever the bar's size.
      'absolute start-0 top-[8px] h-[56px] w-full',
      'starting:start-(--m3-search-start) starting:top-(--m3-search-top) starting:w-(--m3-search-width)',
      'data-exiting:start-(--m3-search-start) data-exiting:top-(--m3-search-top) data-exiting:w-(--m3-search-width)',
      '[transition-property:inset-inline-start,top,width]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-slow-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-slow-easing)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    fullScreenContent: [
      'absolute inset-x-0 top-[72px] bottom-0 overflow-y-auto overscroll-contain',
      '[transition-property:opacity] [transition-duration:100ms]',
      '[transition-timing-function:cubic-bezier(0.3,0,1,1)]',
      'data-exiting:[transition-timing-function:cubic-bezier(0,0,0,1)]',
      ...contentFade,
    ],
  },
  variants: {
    /** Inside a search app bar the bar fills the free space, up to 720px. */
    inAppBar: { true: { root: 'w-full' }, false: {} },
    hasLeading: { true: {}, false: { input: 'ps-[16px]' } },
    hasTrailing: { true: {}, false: { input: 'pe-[16px]' } },
    /** Container colour: the bar's own, or (in a scrolled search app bar) one step higher. */
    tone: {
      default: { field: 'bg-surface-container-high' },
      scrolled: { field: 'bg-surface-container-highest' },
      // The full-screen field is transparent on its surface (Compose's input field colours).
      transparent: { field: 'bg-transparent' },
    },
  },
  defaultVariants: { inAppBar: false, hasLeading: false, hasTrailing: false, tone: 'default' },
});

/** Variant definitions for {@link SearchAppBar}. */
export const searchAppBarStyles = tv({
  slots: {
    root: [
      'flex min-h-[64px] w-full items-center bg-surface text-on-surface',
      'data-scrolled:bg-surface-container',
      '[transition-property:background-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    navigation: 'flex shrink-0 items-center ps-[8px] pe-[4px] text-on-surface',
    // Centres the search bar in the free space, 8px from its neighbours and 4px vertically.
    search: 'flex min-w-0 flex-1 justify-center ps-[8px] pe-[8px] pt-[4px] pb-[4px]',
    actions: 'flex shrink-0 items-center gap-[8px] ps-[4px] pe-[8px] text-on-surface-variant',
  },
  variants: {
    scrolling: {
      true: { root: 'sticky top-(--m3-app-bar-offset) z-(--md-sys-z-sticky)' },
      false: {},
    },
  },
  defaultVariants: { scrolling: false },
});

export type SearchBarStyleProps = VariantProps<typeof searchBarStyles>;
export type SearchAppBarStyleProps = VariantProps<typeof searchAppBarStyles>;
