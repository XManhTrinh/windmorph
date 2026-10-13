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
 * Labels don't truncate (M3: "Don't truncate or display an ellipsis in place of label
 * text"): they wrap between words, and the item grows taller, so the full label stays
 * visible under large text sizes. They never break inside a word ("Searc/h"); a single word
 * too long for the item ends with an ellipsis on its line instead (2026-10-13).
 *
 * Badges overlap the icon's top end (BadgedBox), except in the expanded rail, where M3 puts
 * them next to the label, 4px after it.
 *
 * The pill, its state layer and its content share one grid cell, so nothing is positioned.
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
      'col-start-1 row-start-1 rounded-full bg-secondary-container opacity-0',
      'group-data-current/nav:opacity-100 group-data-current/nav:[clip-path:inset(0_0_round_9999px)]',
      '[transition-property:clip-path,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
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
      'group-data-current/nav:text-on-secondary-container group-data-disabled/nav:text-on-surface-variant/38',
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
    label: [
      'min-w-0 overflow-hidden text-ellipsis text-balance group-data-disabled/nav:text-on-surface-variant/38',
      '[transition-property:color,opacity] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing)',
    ],
  },
  variants: {
    layout: {
      'rail-top': {
        // The 56px pill centres in the collapsed width; labels may use all of it (Compose).
        root: 'min-h-[64px] w-(--m3-rail-collapsed-width) content-start',
        pill: 'h-[32px] w-[56px]',
        indicator: '[clip-path:inset(0_50%_round_9999px)]',
        label: [
          'mt-[4px] max-w-full text-center text-label-medium',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-secondary',
        ],
      },
      'rail-start': {
        root: 'w-full justify-items-start px-(--m3-rail-item-inset)',
        pill: 'min-h-[56px] max-w-full',
        // The icon's centre: 16px padding + half the 24px icon from the start edge.
        indicator:
          '[clip-path:inset(0_calc(100%_-_28px)_0_28px_round_9999px)] rtl:[clip-path:inset(0_28px_0_calc(100%_-_28px)_round_9999px)]',
        content: 'justify-start gap-[8px] ps-[16px] pe-[16px] py-[8px]',
        label: [
          'text-label-large',
          'group-data-current/nav:text-label-large-emphasized group-data-current/nav:text-on-secondary-container',
        ],
      },
      // Bar items stretch to the bar's height (64px, or taller when a label wraps), so the
      // whole height is the touch target. Stacked items keep their icons on one line at the
      // top; inline items centre their pill.
      'bar-top': {
        root: 'self-stretch content-start py-[6px]',
        pill: 'h-[32px] w-[56px]',
        indicator: '[clip-path:inset(0_50%_round_9999px)]',
        label: [
          'mt-[4px] max-w-full px-[4px] text-center text-label-medium',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-secondary',
        ],
      },
      'bar-start': {
        // Content-sized; 4px each side keeps neighbouring pills 8px apart.
        root: 'self-stretch content-center px-[4px]',
        pill: 'min-h-[40px] max-w-full',
        indicator:
          '[clip-path:inset(0_calc(100%_-_28px)_0_28px_round_9999px)] rtl:[clip-path:inset(0_28px_0_calc(100%_-_28px)_round_9999px)]',
        content: 'gap-[4px] ps-[16px] pe-[16px] py-[4px]',
        label: [
          'text-label-medium',
          'group-data-current/nav:text-label-medium-emphasized group-data-current/nav:text-on-secondary-container',
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
  defaultVariants: { layout: 'bar-top', enterLabel: false, slide: false },
});

export type NavItemLayout = NonNullable<VariantProps<typeof navItemStyles>['layout']>;
