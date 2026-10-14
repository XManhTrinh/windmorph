import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (SearchBar.kt: SearchBar, AppBarWithSearch,
 * ExpandedDockedSearchBarWithGap, ExpandedFullScreenSearchBar, SearchBarDefaults.InputField;
 * SearchBar / SearchView tokens).
 *
 * Field: 56px, full corners, `surface-container-high`, 360px wide by default and at most
 * 720px. Input and placeholder `body-large`, `on-surface` / `on-surface-variant`. Icons sit
 * in 48px boxes shifted 4px inwards (leading `on-surface`, trailing `on-surface-variant`);
 * the text keeps 4px from the leading and trailing tap targets (the spec's "Leading icon and
 * label padding (from tap target): 4dp" and "Label and trailing icon padding"; Compose's
 * code leaves none), so it starts 56px in after a leading icon, 16px without one.
 *
 * Docked (with gap): the expanded field, 56px tall whatever the collapsed bar's height
 * (M3's focused search bar container), sits centred over the collapsed one and widens by 12px on
 * each side (M3 Expressive: the margins change from 24dp to 12dp when focused) on the
 * default spatial spring, and a dropdown 2px below it (12px corners,
 * `surface-container-high`; with the bar, at least 240px and at most 2/3 of the window
 * tall, per the M3 spec) slides down from half its height on the default spatial spring
 * (fast spatial back) while its content fades in over 100ms after 50ms; a 32% scrim covers
 * the page.
 *
 * Full screen, in M3 Expressive's contained style: a `surface-container-low` surface grows
 * from the bar's bounds (28px corners) to the whole window on the slow spatial spring
 * (default spatial back); the field keeps its `surface-container-high` pill and moves to the
 * top, 8px down and 16px from each side, and the content starts 72px down.
 *
 * In a search app bar the field is `surface-container` (`surface-container-highest` once
 * content scrolls under the bar) and fills the free space up to 312px, then half of it,
 * at most 720px (M3 app bar guidelines).
 *
 * The field's colours and corners come from the search bar's component tokens and the
 * views' from the search view's (`search-tokens.ts`, `--md-comp-search-bar-*` and
 * `--md-comp-search-view-*`); the pill, the dropdown and the full-screen view carry
 * `data-tokens`. The search app bar reads the app bar's tokens (`app-bar-tokens.ts`). A
 * consumer class still wins in `cn()`.
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
      'focus-ring-inset flex h-full w-full min-w-0 items-center rounded-[var(--_md-comp-search-bar-container-shape)] text-on-surface',
    leading:
      'ms-[4px] flex size-[48px] shrink-0 items-center justify-center text-[color:var(--_md-comp-search-bar-leading-icon-color)] [&>svg]:size-[24px]',
    // One or two trailing icon buttons, or an avatar (30px) and an icon button (M3).
    trailing: [
      'me-[4px] flex h-[48px] min-w-[48px] shrink-0 items-center justify-center text-[color:var(--_md-comp-search-bar-trailing-icon-color)]',
      '[&>svg]:size-[24px] [&>img]:size-[30px] [&>img]:rounded-full',
    ],
    input: [
      'h-full min-w-0 flex-1 bg-transparent text-body-large text-[color:var(--_md-comp-search-bar-input-text-color)] caret-primary outline-none',
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
    // It widens from the bar's bounds (`--m3-search-*`) to the focused ones.
    dockedPanel: [
      'fixed top-(--m3-search-top) left-(--m3-search-focused-left) z-(--md-sys-z-sheet)',
      'flex w-(--m3-search-focused-width) flex-col outline-none',
      // Reduced motion: the field is at its focused width at once.
      'motion-safe:starting:left-(--m3-search-left) motion-safe:starting:w-(--m3-search-width)',
      'motion-safe:data-exiting:left-(--m3-search-left) motion-safe:data-exiting:w-(--m3-search-width)',
      '[transition-property:left,width]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
    ],
    // The focused field is 56px (M3), even when the collapsed bar is resized.
    dockedHeader: 'flex h-[56px] shrink-0',
    dropdown: [
      'mt-[2px] overflow-y-auto overscroll-contain',
      // 58px is the field and the gap above the dropdown.
      'min-h-[min(182px,calc(66.67dvh-58px))] max-h-[calc(66.67dvh-58px)]',
      'rounded-[var(--_md-comp-search-view-docked-container-shape)] bg-[var(--_md-comp-search-view-container-color)] text-on-surface',
      // Reduced motion: it only fades.
      'translate-y-0 motion-safe:starting:-translate-y-1/2 motion-safe:data-exiting:-translate-y-1/2',
      '[transition-property:translate,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),100ms]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),cubic-bezier(0.3,0,1,1)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),100ms]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),cubic-bezier(0,0,0,1)]',
      ...contentFade,
    ],
    // Full-screen view: the surface grows from the bar's bounds to the window.
    fullScreenPanel: [
      'fixed inset-0 z-(--md-sys-z-sheet) bg-[var(--_md-comp-search-view-container-color)] text-on-surface outline-none',
      '[clip-path:inset(0_round_0)]',
      'motion-safe:starting:[clip-path:inset(var(--m3-search-top)_var(--m3-search-right)_var(--m3-search-bottom)_var(--m3-search-left)_round_28px)]',
      'motion-safe:data-exiting:[clip-path:inset(var(--m3-search-top)_var(--m3-search-right)_var(--m3-search-bottom)_var(--m3-search-left)_round_28px)]',
      'motion-safe:[transition-property:clip-path]',
      'motion-safe:[transition-duration:var(--md-sys-motion-spring-spatial-slow-duration)]',
      'motion-safe:[transition-timing-function:var(--md-sys-motion-spring-spatial-slow-easing)]',
      'motion-safe:data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      'motion-safe:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      // Reduced motion: the view fades in and out over the window instead of growing.
      'motion-reduce:starting:opacity-0 motion-reduce:data-exiting:opacity-0',
      'motion-reduce:[transition-property:opacity]',
      'motion-reduce:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      'motion-reduce:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    fullScreenHeader: [
      // Compose's full-screen field is 56px whatever the bar's size; 16px from each side.
      'absolute start-[16px] top-[8px] h-[56px] w-[calc(100%-32px)]',
      'motion-safe:starting:start-(--m3-search-start) motion-safe:starting:top-(--m3-search-top) motion-safe:starting:w-(--m3-search-width)',
      'motion-safe:data-exiting:start-(--m3-search-start) motion-safe:data-exiting:top-(--m3-search-top) motion-safe:data-exiting:w-(--m3-search-width)',
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
    /**
     * Inside a search app bar the bar fills the free space up to 312px, then grows to half
     * of it (M3), up to 720px.
     */
    inAppBar: { true: { root: 'w-[max(min(100%,312px),50%)]' }, false: {} },
    // 4px from a tap target (M3), else 16px from the pill's edge.
    hasLeading: { true: { input: 'ps-[4px]' }, false: { input: 'ps-[16px]' } },
    hasTrailing: { true: { input: 'pe-[4px]' }, false: { input: 'pe-[16px]' } },
    /**
     * Container colour: the bar's own; in a search app bar `surface-container`, and one
     * step higher than the bar once content scrolls under it.
     */
    tone: {
      default: { field: 'bg-[var(--_md-comp-search-bar-container-color)]' },
      appBar: { field: 'bg-surface-container' },
      scrolled: { field: 'bg-surface-container-highest' },
    },
    /** Centre the placeholder and the query while the bar is collapsed. */
    textAlign: { start: {}, center: { input: 'text-center' } },
  },
  defaultVariants: {
    inAppBar: false,
    hasLeading: false,
    hasTrailing: false,
    tone: 'default',
    textAlign: 'start',
  },
});

/** Variant definitions for {@link SearchAppBar}. */
export const searchAppBarStyles = tv({
  slots: {
    root: [
      'flex min-h-[64px] w-full items-center text-on-surface',
      'bg-[var(--_md-comp-app-bar-container-color)] data-scrolled:bg-[var(--_md-comp-app-bar-on-scroll-container-color)]',
      '[transition-property:background-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    // Icon buttons take each slot's content colour.
    navigation:
      'flex shrink-0 items-center ps-[8px] pe-[4px] text-[color:var(--_md-comp-app-bar-leading-icon-color)] [--md-comp-icon-button-icon-color:currentColor]',
    // Centres the search bar in the free space, 8px from its neighbours and 4px vertically.
    search: 'flex min-w-0 flex-1 justify-center ps-[8px] pe-[8px] pt-[4px] pb-[4px]',
    actions:
      'flex shrink-0 items-center gap-[8px] ps-[4px] pe-[8px] text-[color:var(--_md-comp-app-bar-trailing-icon-color)] [--md-comp-icon-button-icon-color:currentColor]',
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
