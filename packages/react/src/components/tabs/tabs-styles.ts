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
 * - Indicator: 3px `primary`. Primary tabs: as wide as the content (min 24px), 3px corners.
 *   Secondary: the whole tab. It slides on the default spatial spring.
 * - Scrollable rows: tabs at least 90px wide, 52px start inset.
 *
 * The indicator shares the tab row's first grid cell (no positioning) and is moved with
 * `translate`. Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Tabs}; extend them to add variants. */
export const tabsStyles = tv({
  slots: {
    root: 'flex min-w-0 flex-col',
    scroller: '',
    list: [
      'grid grid-rows-[auto] bg-surface',
      'shadow-[inset_0_-1px_0_var(--md-sys-color-outline-variant)]',
    ],
    tab: [
      'row-start-1 flex min-w-0 cursor-pointer items-center justify-center px-[16px] select-none',
      'font-plain text-title-small text-on-surface-variant',
      'state-layer focus-ring-inset',
      'not-data-selected:data-hovered:text-on-surface not-data-selected:data-focus-visible:text-on-surface not-data-selected:data-pressed:text-on-surface',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
      // Colour: in on default effects, out on fast effects.
      '[--m3-transition-property:color] [--m3-transition-delay:0s]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] [--m3-transition-easing:var(--md-sys-motion-spring-effects-fast-easing)]',
      'data-selected:[--m3-transition-duration:var(--md-sys-motion-spring-effects-default-duration)] data-selected:[--m3-transition-easing:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    icon: 'inline-flex size-[24px] shrink-0 items-center justify-center [&>svg]:size-full',
    label: 'line-clamp-2 text-center',
    indicator: [
      'pointer-events-none row-start-1 h-[3px] self-end [justify-self:left] bg-primary opacity-0 data-ready:opacity-100',
      '[transition-property:translate,width]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    panel: 'focus-ring-inset',
  },
  variants: {
    variant: {
      primary: {
        tab: 'data-selected:text-primary [--m3-state-layer-color:var(--md-sys-color-primary)]',
        indicator: 'rounded-[3px]',
      },
      secondary: {
        tab: 'data-selected:text-on-surface [--m3-state-layer-color:var(--md-sys-color-on-surface)]',
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
    layout: {
      text: { tab: 'h-[48px]' },
      'icon-top': { tab: 'h-[64px] flex-col justify-center gap-[2px]' },
      'icon-start': { tab: 'h-[48px] flex-row gap-[8px]' },
      'icon-only': { tab: 'h-[48px]' },
    },
  },
  defaultVariants: { variant: 'primary', scrollable: false, layout: 'text' },
});

export type TabsStyleProps = VariantProps<typeof tabsStyles>;
export type TabsVariant = NonNullable<TabsStyleProps['variant']>;
