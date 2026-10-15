import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Tab.kt, TabRow.kt, Primary / SecondaryNavigationTab
 * tokens):
 *
 * - `surface` row with a 1px `outline-variant` divider; tabs are 48px, `title-small`, 16px
 *   side padding, 24px icons.
 * - With an icon above the label a tab is 64px: the M3 token
 *   (`IconAndLabelTextContainerHeight`), which Material Web uses with the icon, a 2px gap
 *   and the label centred. Compose's `Tab.kt` (and MDC's `TabLayout`) still hard-code
 *   72dp, the Material Design 1 value, so here the token wins.
 * - Labels are `on-surface-variant` (`on-surface` on hover / focus / press) and the
 *   selected label is `primary` (primary tabs) or `on-surface` (secondary). Compose's `Tab`
 *   defaults the unselected colour to the selected one; the token colours are used.
 * - Selection recolours on the default effects spring, deselection on fast effects; the
 *   state layer is the selected colour.
 * - Indicator (m3.material.io specs, 2026-10-13): `primary`, 3px high on primary tabs with
 *   only its top corners rounded (3, 3, 0, 0), as wide as the content (min 24px); 2px high
 *   on secondary tabs, the whole tab wide. It slides on the default spatial spring, and
 *   follows the selected tab's content when that resizes on its own (a web font loading).
 * - Only a selection change animates: the row's `data-animate` turns on the indicator's
 *   slide, and `data-recolour` (set in the render that changes the selection, 2026-10-15)
 *   the tabs' colour fades. The first placement, the default selection and resizes appear in
 *   place, so nothing slides or fades in on mount.
 * - Forced colours (2026-10-15): the indicator keeps its fill as `Highlight`
 *   (`forced-color-adjust: none`), the divider becomes a 1px `CanvasText` border (an inset
 *   shadow is dropped there), and the selected label is `Highlight`.
 * - Scrollable rows: tabs at least 90px wide, 52px start inset.
 * - Fixed rows aligned `start` or `center` are only as wide as their tabs, each as wide as
 *   the widest (a `max-content` grid of `1fr` columns), with the row's divider kept full
 *   width on the scroller.
 * - Badges: 4px after an inline label; on a stacked icon through `BadgedBox`.
 * - Web density (`--md-sys-density`, 0 to -3): each step takes 4px off a tab, 48 → 36px and
 *   64 → 52px with the icon above, as Material Components Web's tab bar density did (48px,
 *   4px a step; stacked 72px). The tabs sit side by side in one row, so a 48px target would
 *   reach outside the row: like dense menu items, they keep full-height, non-overlapping
 *   targets above WCAG 2.5.8's 24px, and density stays the reader's choice.
 *
 * The indicator shares the tab row's first grid cell (no positioning) and is moved with
 * `translate`.
 *
 * The row, divider, indicator and resting label and icon colours come from the tabs'
 * component tokens (`tabs-tokens.ts`, `--md-comp-{primary,secondary}-navigation-tab-*`); the
 * root and each tab carry `data-tokens="md-comp-tabs"` and `data-variant`. An icon takes its
 * tab's colour through `--m3-tab-icon-color`: the icon token at rest and when selected, the
 * label's colour while hovered, focused, pressed or disabled. A consumer class still wins in
 * `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Tabs}; extend them to add variants. */
export const tabsStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    scroller: '',
    list: [
      'group/tabs grid grid-rows-[auto] bg-[var(--_md-comp-tabs-container-color)]',
      'shadow-[inset_0_-1px_0_var(--_md-comp-tabs-divider-color)]',
      'forced-colors:border-b forced-colors:border-[CanvasText]',
    ],
    tab: [
      'row-start-1 flex min-w-0 cursor-pointer items-center justify-center px-[16px] select-none',
      'font-plain text-title-small',
      'state-layer focus-ring-inset',
      'not-data-selected:data-hovered:text-on-surface not-data-selected:data-focus-visible:text-on-surface not-data-selected:data-pressed:text-on-surface',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
      'forced-colors:data-selected:text-[Highlight]',
      // The icon's colour: its token at rest and selected, else the label's.
      '[--m3-tab-icon-color:var(--_md-comp-tabs-with-icon-inactive-icon-color)] data-selected:[--m3-tab-icon-color:var(--_md-comp-tabs-with-icon-active-icon-color)]',
      'not-data-selected:data-hovered:[--m3-tab-icon-color:currentColor] not-data-selected:data-focus-visible:[--m3-tab-icon-color:currentColor] not-data-selected:data-pressed:[--m3-tab-icon-color:currentColor]',
      'data-disabled:[--m3-tab-icon-color:currentColor]',
      // Colour: in on default effects, out on fast effects, when the selection changes.
      'group-data-recolour/tabs:[--m3-transition-property:color] [--m3-transition-delay:0s]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] [--m3-transition-easing:var(--md-sys-motion-spring-effects-fast-easing)]',
      'data-selected:[--m3-transition-duration:var(--md-sys-motion-spring-effects-default-duration)] data-selected:[--m3-transition-easing:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    icon: [
      'inline-flex size-[24px] shrink-0 items-center justify-center text-[color:var(--m3-tab-icon-color)] [&>svg]:size-full',
      // Recolours with its tab's label.
      '[transition-property:var(--m3-transition-property,none)] [transition-duration:var(--m3-transition-duration,0s)] [transition-timing-function:var(--m3-transition-easing,linear)]',
    ],
    label: 'line-clamp-2 text-center',
    // The label and an inline badge, 4px apart.
    text: 'inline-flex min-w-0 items-center gap-[4px]',
    indicator: [
      'pointer-events-none row-start-1 self-end [justify-self:left] bg-[var(--_md-comp-tabs-active-indicator-color)] opacity-0 data-ready:opacity-100',
      'forced-colors:bg-[Highlight] forced-colors:forced-color-adjust-none',
      '[transition-property:none] group-data-animate/tabs:[transition-property:translate,width]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    panel: 'focus-ring-inset',
  },
  variants: {
    variant: {
      primary: {
        tab: [
          'text-[color:var(--_md-comp-tabs-with-label-text-inactive-label-text-color)]',
          'data-selected:text-[color:var(--_md-comp-tabs-with-label-text-active-label-text-color)]',
          '[--m3-state-layer-color:var(--md-sys-color-primary)]',
        ],
        indicator: 'h-[3px] rounded-t-[3px]',
      },
      secondary: {
        tab: [
          'text-[color:var(--_md-comp-tabs-inactive-label-text-color)]',
          'data-selected:text-[color:var(--_md-comp-tabs-active-label-text-color)]',
          '[--m3-state-layer-color:var(--md-sys-color-on-surface)]',
        ],
        indicator: 'h-[2px]',
      },
    },
    scrollable: {
      true: {
        scroller: 'overflow-x-auto overscroll-x-contain [scrollbar-width:none]',
        list: 'w-max min-w-full auto-cols-max ps-[52px]',
        tab: 'min-w-[90px]',
      },
      false: { list: 'auto-cols-fr' },
    },
    // A swipeable panel takes horizontal gestures and leaves vertical ones to scrolling.
    swipeable: { true: { panel: 'touch-pan-y' }, false: {} },
    align: {
      stretch: {},
      start: {
        scroller: [
          'bg-[var(--_md-comp-tabs-container-color)] shadow-[inset_0_-1px_0_var(--_md-comp-tabs-divider-color)]',
          'forced-colors:border-b forced-colors:border-[CanvasText]',
        ],
        list: 'w-max max-w-full forced-colors:border-b-0',
      },
      center: {
        scroller: [
          'bg-[var(--_md-comp-tabs-container-color)] shadow-[inset_0_-1px_0_var(--_md-comp-tabs-divider-color)]',
          'forced-colors:border-b forced-colors:border-[CanvasText]',
        ],
        list: 'mx-auto w-max max-w-full forced-colors:border-b-0',
      },
    },
    // 48px tabs (64px with the icon above), 4px less per density step.
    layout: {
      text: { tab: 'min-h-[calc(48px+var(--md-sys-density,0)*4px)]' },
      'icon-top': {
        tab: 'min-h-[calc(64px+var(--md-sys-density,0)*4px)] flex-col justify-center gap-[2px]',
      },
      'icon-start': { tab: 'min-h-[calc(48px+var(--md-sys-density,0)*4px)] flex-row gap-[8px]' },
      'icon-only': { tab: 'min-h-[calc(48px+var(--md-sys-density,0)*4px)]' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    scrollable: false,
    layout: 'text',
    align: 'stretch',
    swipeable: false,
  },
});

export type TabsStyleProps = VariantProps<typeof tabsStyles>;
export type TabsVariant = NonNullable<TabsStyleProps['variant']>;
