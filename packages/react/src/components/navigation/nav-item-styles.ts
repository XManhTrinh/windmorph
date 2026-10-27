import { tv, type VariantProps } from '../../utils/tv';

/*
 * Navigation items shared by the navigation rail and the flexible navigation bar. Values
 * follow Compose Material 3 (NavigationItem.kt, WideNavigationRail.kt, ShortNavigationBar.kt
 * and the NavigationRail* / NavigationBar* token files):
 *
 * - rail-top (collapsed rail): 56×32 pill around a 24px icon, `label-medium` 4px below,
 *   centred in the 96px collapsed width (labels may use all of it), at least 64px tall.
 *   The item is that wide even while the rail's width animates, so its icon never moves.
 * - rail-start (expanded rail): 56px pill holding icon · 8px · `label-large`, 16px inside,
 *   20px item inset, which puts the icon on the same line as when collapsed. The pill hugs
 *   its icon and label, as in M3 Expressive (the full-width pill was the navigation
 *   drawer's), while the whole row stays the link or button: a larger target than Compose's
 *   pill-only one, with the state layer and focus ring still on the pill.
 * - bar-top: 6px · 56×32 pill · 4px · `label-medium` · 6px (64px).
 * - bar-start: 40px pill holding icon · 4px · `label-medium`, 16px inside, centred in an
 *   item as tall as the bar (64px), which is the touch target.
 *
 * Colours: icons `on-surface-variant`, selected `on-secondary-container` on a
 * `secondary-container` pill; labels `on-surface-variant`, selected `secondary` below the
 * icon or `on-secondary-container` beside it; disabled 38%. The state layer is
 * `on-secondary-container` on the pill, and a press ripples through it from the press point
 * (M3: "a ripple passes through the indicator"), as on every other M3 control. In every layout the current item's pill expands from
 * the centre of its icon and fades in on the default spatial spring (M3: "the active
 * indicator expands from the center of the icon"), and colours change on default effects.
 * The current label is bold (the emphasized label role). With a `selectedIcon`, the two
 * icons cross-fade on default effects.
 *
 * `slide` (the expanded rail's `indicatorMotion="slide"`, an extension beyond the spec that
 * matches Google's Expressive showcase): the pill is whole while current and Motion moves it
 * from the previous current item on the fast spatial spring; the old pill goes at once, and
 * the content sits above every pill so a moving one never covers another item's label.
 * Under reduced motion it fades in place instead.
 *
 * Under reduced motion every pill fades in whole on the default effects spring, without
 * expanding (architecture §6).
 *
 * Labels don't truncate (M3: "Don't truncate or display an ellipsis in place of label
 * text"): they wrap between words, and the item grows taller, so the full label stays
 * visible under large text sizes. A word wider than the item may break where the browser
 * hyphenates it for the document's `lang` (`hyphens: auto`), but never bare ("Searc/h"):
 * `overflow-wrap: normal` keeps it whole, and a line it still overflows ends with an
 * ellipsis (`overflow: hidden` with `text-overflow: ellipsis`, applied per line), while the
 * other words keep wrapping. The text stays whole in the DOM, so the accessible name is the
 * full label (2026-10-16, refining 2026-10-13 and 2026-10-15).
 *
 * Badges overlap the icon's top end (BadgedBox), except in the expanded rail, where M3 puts
 * them next to the label, 4px after it.
 *
 * Forced colours (2026-10-15): the current pill keeps a `Highlight` fill
 * (`forced-color-adjust: none`), with its icon, and a label inside it, in `HighlightText`;
 * otherwise the pill became Canvas and only the bold label marked the current item. The
 * icon and a label inside the pill opt out of forced colours too (2026-10-17): with
 * `forced-color-adjust: auto` the browser paints a `Canvas` backplate behind text, so a
 * `HighlightText` label read white on white.
 *
 * The pill, its state layer and its content share one grid cell, so nothing is positioned.
 *
 * The pill, icon and label colours come from the bar's or rail's component tokens
 * (`navigation-tokens.ts`, `--md-comp-nav-{bar,rail}-item-*`): each item carries
 * `data-tokens` and `data-layout`, so the bar's layouts read the bar's item parts and the
 * rail's layouts the rail's. Disabled colours stay classes.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for navigation items; extend them to add variants. */
export const navItemStyles = tv({
  slots: {
    root: [
      'group/nav grid min-w-0 cursor-pointer justify-items-center outline-none select-none',
      'font-plain text-on-surface-variant',
      'data-disabled:cursor-default',
    ],
    // The pill area: indicator, state layer and content overlap here; it carries the focus ring.
    pill: [
      'grid rounded-full outline-offset-(--md-sys-focus-indicator-offset) outline-secondary',
      'group-data-focus-visible/nav:outline-(length:--md-sys-focus-indicator-thickness) group-data-focus-visible/nav:outline-solid',
    ],
    indicator: [
      'col-start-1 row-start-1 rounded-full opacity-0',
      'group-data-current/nav:opacity-100 group-data-current/nav:[clip-path:inset(0_0_round_9999px)]',
      // Forced colours would paint the pill as Canvas: it keeps a Highlight fill instead.
      'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
      '[transition-property:clip-path,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      // Reduced motion: the pill fades in whole on the default effects spring.
      'motion-reduce:[transition-property:opacity]',
      'motion-reduce:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      'motion-reduce:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    // The shared state layer and ripple, on the pill: the item's hover and focus show
    // through it, and a press ripples from the press point (NavItem sets the origin).
    stateLayer: [
      'col-start-1 row-start-1 rounded-full state-layer',
      '[--m3-state-layer-color:var(--md-sys-color-on-secondary-container)]',
      'group-data-hovered/nav:[--m3-state-opacity:var(--md-sys-state-hover-state-layer-opacity)]',
      'group-data-focus-visible/nav:[--m3-state-opacity:var(--md-sys-state-focus-state-layer-opacity)]',
    ],
    // `relative` keeps the content above the indicator and state layer: elements with
    // opacity or clip-path paint in the positioned layer, above plain in-flow content.
    content: 'relative col-start-1 row-start-1 flex min-w-0 items-center justify-center',
    icon: [
      'inline-grid size-[24px] shrink-0 place-items-center [&>svg]:size-full',
      'group-data-disabled/nav:text-on-surface-variant/38',
      // HighlightText on the Highlight pill, kept as painted (no Canvas backplate).
      'forced-colors:group-data-current/nav:text-[HighlightText] forced-colors:group-data-current/nav:forced-color-adjust-none',
      'transition-colors duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing)',
    ],
    // An icon and its selected variant share one cell and cross-fade.
    iconFace: [
      'col-start-1 row-start-1 size-full opacity-0 data-shown:opacity-100 [&>svg]:size-full',
      '[transition-property:opacity] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing)',
    ],
    // Holds the icon (or both faces) inside a badge's anchor.
    iconStack: 'inline-grid size-[24px] place-items-center [&>svg]:size-full',
    // The expanded rail's badge, 4px after the label (the content gap is 8px).
    badge: 'inline-flex shrink-0 -ms-[4px]',
    // The `BadgedBox` around a badged icon (its root; `classNames.badge` merges in). The
    // badge takes forced colours back, which the current icon opts out of.
    badgedBox: 'forced-colors:[&>span:last-child]:forced-color-adjust-auto',
    label: [
      'min-w-0 overflow-hidden text-ellipsis text-balance hyphens-auto wrap-normal group-data-disabled/nav:text-on-surface-variant/38',
      '[transition-property:color,opacity] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing)',
    ],
  },
  variants: {
    layout: {
      'rail-top': {
        // The 56px pill centres in the collapsed width; labels may use all of it (Compose).
        // The minimum height springs 64 ↔ 48px with the rail's width (`railMorph`).
        root: 'min-h-[64px] w-(--m3-rail-collapsed-width) content-start',
        pill: 'h-[32px] w-[56px]',
        indicator:
          '[clip-path:inset(0_50%_round_9999px)] bg-[var(--_md-comp-nav-rail-item-active-indicator-color)]',
        icon: 'text-[color:var(--_md-comp-nav-rail-item-inactive-icon-color)] group-data-current/nav:text-[color:var(--_md-comp-nav-rail-item-active-icon-color)]',
        label: [
          'mt-[4px] max-w-full text-center text-label-medium',
          'text-[color:var(--_md-comp-nav-rail-item-inactive-label-text-color)]',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-[color:var(--_md-comp-nav-rail-item-active-label-text-color)]',
        ],
      },
      'rail-start': {
        root: 'min-h-[48px] w-full justify-items-start px-(--m3-rail-item-inset)',
        pill: 'min-h-[56px] max-w-full',
        // The icon's centre: 16px padding + half the 24px icon from the start edge.
        indicator: [
          '[clip-path:inset(0_calc(100%_-_28px)_0_28px_round_9999px)] rtl:[clip-path:inset(0_28px_0_calc(100%_-_28px)_round_9999px)]',
          'bg-[var(--_md-comp-nav-rail-item-active-indicator-color)]',
        ],
        content: 'justify-start gap-[8px] ps-[16px] pe-[16px] py-[8px]',
        icon: 'text-[color:var(--_md-comp-nav-rail-item-inactive-icon-color)] group-data-current/nav:text-[color:var(--_md-comp-nav-rail-item-active-icon-color)]',
        label: [
          // Inside the Highlight pill: HighlightText, without the Canvas backplate forced
          // colours paint behind text (white on white otherwise).
          'forced-colors:group-data-current/nav:text-[HighlightText] forced-colors:group-data-current/nav:forced-color-adjust-none',
          'text-label-large text-[color:var(--_md-comp-nav-rail-item-inactive-label-text-color)]',
          'group-data-current/nav:text-label-large-emphasized group-data-current/nav:text-[color:var(--_md-comp-nav-rail-item-active-label-text-color)]',
        ],
      },
      // Bar items stretch to the bar's height (64px, or taller when a label wraps), so the
      // whole height is the touch target. Stacked items keep their icons on one line at the
      // top; inline items centre their pill.
      'bar-top': {
        root: 'self-stretch content-start py-[6px]',
        pill: 'h-[32px] w-[56px]',
        indicator:
          '[clip-path:inset(0_50%_round_9999px)] bg-[var(--_md-comp-nav-bar-item-active-indicator-color)]',
        icon: 'text-[color:var(--_md-comp-nav-bar-item-inactive-icon-color)] group-data-current/nav:text-[color:var(--_md-comp-nav-bar-item-active-icon-color)]',
        label: [
          'mt-[4px] max-w-full px-[4px] text-center text-label-medium',
          'text-[color:var(--_md-comp-nav-bar-item-inactive-label-text-color)]',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-[color:var(--_md-comp-nav-bar-item-active-label-text-color)]',
        ],
      },
      'bar-start': {
        // Content-sized; 4px each side keeps neighbouring pills 8px apart.
        root: 'self-stretch content-center px-[4px]',
        pill: 'min-h-[40px] max-w-full',
        indicator: [
          '[clip-path:inset(0_calc(100%_-_28px)_0_28px_round_9999px)] rtl:[clip-path:inset(0_28px_0_calc(100%_-_28px)_round_9999px)]',
          'bg-[var(--_md-comp-nav-bar-item-active-indicator-color)]',
        ],
        content: 'gap-[4px] ps-[16px] pe-[16px] py-[4px]',
        // A large badge reaches past the icon's end edge into the label's place (M3: badges
        // overlap the icon). Its overhang takes room in the row so the label starts 4px after
        // the badge (2026-10-15): the icon box grows to the badge, which hangs from a box as
        // wide as itself, 12px inside the 24px icon, as `BadgedBox` places it.
        icon: [
          'text-[color:var(--_md-comp-nav-bar-item-inactive-icon-color)] group-data-current/nav:text-[color:var(--_md-comp-nav-bar-item-active-icon-color)]',
          'has-[[data-size=large]]:w-auto has-[[data-size=large]]:min-w-[24px] has-[[data-size=large]]:justify-items-start',
        ],
        badgedBox: [
          'has-[[data-size=large]]:grid-cols-[auto]',
          '[&:has([data-size=large])>span:first-child]:w-[24px] [&:has([data-size=large])>span:first-child]:justify-self-start',
          '[&>span:last-child:has([data-size=large])]:w-max [&>span:last-child:has([data-size=large])]:ms-[12px]',
        ],
        label: [
          // Inside the Highlight pill: HighlightText, without the Canvas backplate forced
          // colours paint behind text (white on white otherwise).
          'forced-colors:group-data-current/nav:text-[HighlightText] forced-colors:group-data-current/nav:forced-color-adjust-none',
          'text-label-medium text-[color:var(--_md-comp-nav-bar-item-inactive-label-text-color)]',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-[color:var(--_md-comp-nav-bar-item-active-label-text-color)]',
        ],
      },
    },
    /** Labels that move when the rail changes width fade in at their new place. */
    enterLabel: { true: { label: 'starting:opacity-0' }, false: {} },
    /** The pill slides between items (Motion moves it) instead of expanding in place. */
    slide: {
      true: {
        indicator: '[transition-property:none] motion-reduce:[transition-property:opacity]',
        content: 'z-[1]',
      },
      false: {},
    },
  },
  compoundVariants: [
    // As the rail expands or collapses, an item's minimum height springs between 64px and
    // 48px on the default spatial spring, as Compose's itemMinHeight (WideNavigationRail.kt;
    // 2026-10-17: it swapped in one frame, so the icons jumped). Instant under reduced motion.
    {
      layout: ['rail-top', 'rail-start'],
      class: {
        root: '[transition-property:min-height] [transition-duration:var(--md-sys-motion-spring-spatial-default-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      },
    },
  ],
  defaultVariants: { layout: 'bar-top', enterLabel: false, slide: false },
});

export type NavItemLayout = NonNullable<VariantProps<typeof navItemStyles>['layout']>;
