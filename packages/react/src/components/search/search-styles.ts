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
 * each side (M3 Expressive: the margins change from 24dp to 12dp when focused). It morphs from
 * the bar's bounds (position and size) on the default spatial spring and back on the same
 * spring floored at the bar, so it lands on the bar exactly; a dropdown 2px below it (12px corners,
 * `surface-container-high`; with the bar, at least 240px and at most 2/3 of the window
 * tall, per the M3 spec) slides down from half its height on the default spatial spring
 * (fast spatial back) while its content fades in over 100ms after 50ms, and its height follows
 * the results on the default spatial spring; a 32% scrim covers the page.
 *
 * Full screen, in M3 Expressive's contained style: a `surface-container-low` surface grows
 * from the bar's bounds (28px corners) to the whole window on the slow spatial spring
 * (default spatial back), clamped so nothing overshoots; the field keeps its
 * `surface-container-high` pill and moves and grows from the bar to the top, 8px down and
 * 16px from each side, and the content starts 72px down.
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
    // Forced colours drop the pill's colour: a system-colour border keeps its edge.
    field: [
      'focus-ring-inset flex h-full w-full min-w-0 items-center rounded-[var(--_md-comp-search-bar-container-shape)] text-on-surface',
      'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
    ],
    // Icon buttons in the slots take the slot's colour (and so its icon colour token), as
    // in the app bar's slots: Compose colours the search bar's and view's leading icon
    // `on-surface` and trailing icons `on-surface-variant`, buttons included.
    leading:
      'ms-[4px] flex size-[48px] shrink-0 items-center justify-center text-[color:var(--_md-comp-search-bar-leading-icon-color)] [--md-comp-icon-button-icon-color:currentColor] [&>svg]:size-[24px]',
    // One or two trailing icon buttons, or an avatar (30px) and an icon button (M3). Two
    // 40px buttons sit 8px apart inside 4px of padding, so their 48px targets meet edge to
    // edge within the slot (a single one is centred in 48px, as before).
    trailing: [
      'me-[4px] flex h-[48px] min-w-[48px] shrink-0 items-center justify-center gap-[8px] px-[4px] text-[color:var(--_md-comp-search-bar-trailing-icon-color)] [--md-comp-icon-button-icon-color:currentColor]',
      '[&>svg]:size-[24px] [&>img]:size-[30px] [&>img]:rounded-full',
    ],
    input: [
      'h-full min-w-0 flex-1 bg-transparent text-body-large text-[color:var(--_md-comp-search-bar-input-text-color)] caret-primary outline-none',
      'placeholder:text-on-surface-variant',
      '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
    ],
    scrim: [
      'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100 data-exiting:pointer-events-none',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'starting:opacity-0 data-exiting:opacity-0',
    ],
    /*
     * Docked view: the panel sits over the collapsed bar and morphs from the bar's bounds
     * (`--m3-search-left/top/width/height`) to the focused field's (the `-dx/-dy/-dw/-dh`
     * deltas) as `--m3-search-progress` runs 0 → 1, as Compose lerps the layout with its
     * search bar state's progress. `--m3-search-p` is that progress floored at 0 (Compose's
     * `coerceAtLeast(0f)`): the spring may overshoot past the focused bounds on the way in,
     * but never past the bar's on the way back, so the field lands on the bar exactly.
     * Reduced motion: the progress stays at 1, so the field is at its focused size at once.
     */
    dockedPanel: [
      // Leaving, the view takes no presses: the spring's tail runs on after the field has
      // landed on the bar, and a press there ran a suggestion of the invisible dropdown.
      'fixed z-(--md-sys-z-sheet) flex flex-col outline-none data-exiting:pointer-events-none',
      '[--m3-search-progress:1] [--m3-search-p:max(0,var(--m3-search-progress))]',
      'motion-safe:starting:[--m3-search-progress:0] motion-safe:data-exiting:[--m3-search-progress:0]',
      'top-[calc(var(--m3-search-top)_+_var(--m3-search-p)_*_var(--m3-search-dy))]',
      'left-[calc(var(--m3-search-left)_+_var(--m3-search-p)_*_var(--m3-search-dx))]',
      'w-[calc(var(--m3-search-width)_+_var(--m3-search-p)_*_var(--m3-search-dw))]',
      // Both ways on the default spatial spring (Compose's collapse spec).
      '[transition-property:--m3-search-progress]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    // The focused field is 56px (M3), even when the collapsed bar is resized; it grows from
    // the bar's height with the panel.
    // The full-window layer the docked view sits in (React Aria's underlay).
    underlay: 'fixed inset-0 z-(--md-sys-z-sheet) data-exiting:pointer-events-none',
    dockedHeader:
      'flex h-[calc(var(--m3-search-height)_+_var(--m3-search-p)_*_var(--m3-search-dh))] shrink-0',
    dropdown: [
      'mt-[2px] overflow-y-auto overscroll-contain data-resizing:overflow-y-hidden data-exiting:pointer-events-none',
      // 58px is the field and the gap above the dropdown.
      'min-h-[min(182px,calc(66.67dvh-58px))] max-h-[calc(66.67dvh-58px)]',
      // The height follows the content (`--m3-search-content-height`, measured) within those
      // bounds, so it animates as the results change. Without the measurement (before
      // hydration, or under reduced motion) it's `auto`.
      'h-[clamp(min(182px,calc(66.67dvh_-_58px)),var(--m3-search-content-height),calc(66.67dvh_-_58px))]',
      'rounded-[var(--_md-comp-search-view-docked-container-shape)] bg-[var(--_md-comp-search-view-container-color)] text-on-surface',
      'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
      // Reduced motion: it only fades.
      'translate-y-0 motion-safe:starting:-translate-y-1/2 motion-safe:data-exiting:-translate-y-1/2',
      // The delays below cycle, so the height (third) starts at once like the slide.
      '[transition-property:translate,opacity,height]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),100ms,var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),cubic-bezier(0.3,0,1,1),var(--md-sys-motion-spring-spatial-default-easing)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),100ms,var(--md-sys-motion-spring-spatial-fast-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),cubic-bezier(0,0,0,1),var(--md-sys-motion-spring-spatial-fast-easing)]',
      ...contentFade,
    ],
    /*
     * Full-screen view: the surface grows from the bar's bounds to the window as
     * `--m3-search-progress` runs 0 → 1, through a clip (nothing is transformed). Compose
     * clamps the full-screen progress to 0..1 (`coerceIn`), so `--m3-search-p` is clamped too:
     * the clip and the field never overshoot the window's or the bar's bounds.
     */
    fullScreenPanel: [
      'fixed inset-0 z-(--md-sys-z-sheet) bg-[var(--_md-comp-search-view-container-color)] text-on-surface outline-none data-exiting:pointer-events-none',
      '[--m3-search-progress:1] [--m3-search-p:clamp(0,var(--m3-search-progress),1)]',
      'motion-safe:starting:[--m3-search-progress:0] motion-safe:data-exiting:[--m3-search-progress:0]',
      '[clip-path:inset(calc((1_-_var(--m3-search-p))_*_var(--m3-search-top))_calc((1_-_var(--m3-search-p))_*_var(--m3-search-right))_calc((1_-_var(--m3-search-p))_*_var(--m3-search-bottom))_calc((1_-_var(--m3-search-p))_*_var(--m3-search-left))_round_calc((1_-_var(--m3-search-p))_*_28px))]',
      'motion-safe:[transition-property:--m3-search-progress]',
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
    // Compose's full-screen field is 56px whatever the bar's size, 8px down and 16px from each
    // side; it moves and grows there from the bar's bounds with the surface.
    fullScreenHeader: [
      'absolute',
      'start-[calc(var(--m3-search-start)_+_var(--m3-search-p)_*_(16px_-_var(--m3-search-start)))]',
      'top-[calc(var(--m3-search-top)_+_var(--m3-search-p)_*_(8px_-_var(--m3-search-top)))]',
      'w-[calc(var(--m3-search-width)_+_var(--m3-search-p)_*_(100%_-_32px_-_var(--m3-search-width)))]',
      'h-[calc(var(--m3-search-height)_+_var(--m3-search-p)_*_(56px_-_var(--m3-search-height)))]',
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

/**
 * The variants of {@link searchBarStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type SearchBarStyleProps = VariantProps<typeof searchBarStyles>;
/**
 * The variants of {@link searchAppBarStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type SearchAppBarStyleProps = VariantProps<typeof searchAppBarStyles>;
