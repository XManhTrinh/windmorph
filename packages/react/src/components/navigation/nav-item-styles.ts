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
 * - bar-start: 40px pill holding icon · 4px · `label-medium`, 16px inside.
 *
 * Colours: icons `on-surface-variant`, selected `on-secondary-container` on a
 * `secondary-container` pill; labels `on-surface-variant`, selected `secondary` below the
 * icon or `on-secondary-container` beside it; disabled 38%. The state layer is
 * `on-secondary-container` on the pill. The current item's pill grows from its centre on the
 * default spatial spring (Compose animates its width) and colours change on default
 * effects. In the expanded rail (`slide`) the pill instead slides from the previous current
 * item on the fast spatial spring, as in M3's expanded rail: the old pill goes at once, and
 * the content sits above every pill so a moving one never covers another item's label. With
 * a `selectedIcon`, the two icons cross-fade on default effects.
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
      '[clip-path:inset(0_50%_round_9999px)]',
      'group-data-current/nav:opacity-100 group-data-current/nav:[clip-path:inset(0_0_round_9999px)]',
      '[transition-property:clip-path,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    stateLayer: [
      'col-start-1 row-start-1 rounded-full bg-on-secondary-container opacity-0',
      'group-data-hovered/nav:opacity-(--md-sys-state-hover-state-layer-opacity)',
      'group-data-focus-visible/nav:opacity-(--md-sys-state-focus-state-layer-opacity)',
      'group-data-pressed/nav:opacity-(--md-sys-state-pressed-state-layer-opacity)',
      'group-data-disabled/nav:opacity-0',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
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
    label: [
      'min-w-0 truncate group-data-disabled/nav:text-on-surface-variant/38',
      '[transition-property:color,opacity] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing)',
    ],
  },
  variants: {
    layout: {
      'rail-top': {
        // The 56px pill centres in the collapsed width; labels may use all of it (Compose).
        root: 'min-h-[64px] w-(--m3-rail-collapsed-width) content-start',
        pill: 'h-[32px] w-[56px]',
        label:
          'mt-[4px] max-w-full text-center text-label-medium group-data-current/nav:text-secondary',
      },
      'rail-start': {
        root: 'w-full justify-items-start px-(--m3-rail-item-inset)',
        pill: 'h-[56px] max-w-full',
        content: 'justify-start gap-[8px] ps-[16px] pe-[16px]',
        label: 'text-label-large group-data-current/nav:text-on-secondary-container',
      },
      'bar-top': {
        root: 'h-full content-center py-[6px]',
        pill: 'h-[32px] w-[56px]',
        label:
          'mt-[4px] max-w-full px-[4px] text-center text-label-medium group-data-current/nav:text-secondary',
      },
      'bar-start': {
        root: 'h-full content-center',
        pill: 'h-[40px]',
        content: 'gap-[4px] ps-[16px] pe-[16px]',
        label: 'text-label-medium group-data-current/nav:text-on-secondary-container',
      },
    },
    /** Labels that move when the rail changes width fade in at their new place. */
    enterLabel: { true: { label: 'starting:opacity-0' }, false: {} },
    /** The pill slides between items (Motion moves it) instead of growing in place. */
    slide: {
      true: { indicator: '[transition-property:none]', content: 'z-[1]' },
      false: {},
    },
  },
  defaultVariants: { layout: 'bar-top', enterLabel: false, slide: false },
});

export type NavItemLayout = NonNullable<VariantProps<typeof navItemStyles>['layout']>;
