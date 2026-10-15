import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive menu spec and Compose Material 3's Expressive menu
 * (Menu.kt, MenuDefaults.kt and the Menu / StandardMenu / VibrantMenu / SegmentedMenu
 * token files):
 * - two layouts (M3 "Vertical menu with gap" / "with divider"). `gap`: groups are separate
 *   surfaces 2px apart at elevation 2, with 4px padding (the SegmentedMenu `GroupPadding`
 *   token); corners: only 16px; first 16px top / 8px bottom; middle 8px; last 8px top /
 *   16px bottom. `divider`: one surface with 4px padding and 16px corners, groups split by
 *   a 1px `outline-variant` divider with 8px above and below (the baseline menu's divider
 *   padding). M3 recommends dividers on the web and in scrolling menus;
 * - the outer corners read `--m3-menu-corner`, so they morph while a submenu is open: the
 *   menu holding focus takes 24px (SegmentedMenu `ActiveContainerShape`), the others 8px
 *   (`InactiveContainerShape`), on the fast spatial spring;
 * - items are 44px minimum (4px less per web density step, `--md-sys-density`: 44 → 40 → 36 →
 *   32px; dividers' 8px margins lose 2px per step), 112–280px wide, 16px padding at
 *   the start and end, body-large labels, 20px icons with a 12px gap and label-small trailing
 *   text (the shortcut); 12px corners when selected (morph on the fast spatial spring). The
 *   padding, gap and type follow the Menu token files (2026-10-14); Compose's code uses 12px,
 *   an 8px gap and label-large on touch;
 * - item corners nest inside the container's: an edge item takes the outer corner minus
 *   the 4px padding (16px → 12px, 8px → 4px), other corners are 4px. Compose picks item
 *   shapes per group alone, so a last item could be rounder than its group's 8px corner;
 * - group labels start 12px from the group's edge and end 4px from it (Compose);
 * - standard: surface-container-low, on-surface text, on-surface-variant icons, selected
 *   tertiary-container; vibrant: tertiary-container, on-tertiary-container content
 *   (icons turn tertiary on hover, focus and press), selected tertiary;
 * - the menu is revealed from its anchored edge (a clip) as it fades in, on the fast springs
 *   (M3 motion: components enter along the x or y axis; scale is avoided), as do the
 *   exposed dropdown menus (Select, Autocomplete) and the docked date picker;
 * - the scrolling list keeps 8px of room around the groups so their shadows aren't clipped,
 *   and shows a persistent scrollbar (M3).
 *
 * The container's colour, shadow and resting corners and the items' resting and selected
 * colours come from the menu's component tokens (`menu-tokens.ts`, `--md-comp-menus-*`):
 * the menu, each item and the option lists that share these styles carry
 * `data-tokens="md-comp-menus"` and `data-variant`. `--m3-menu-corner` takes the shape
 * token, so the submenu morph still animates from it. A consumer class still wins in `cn()`.
 * Every class is written out in full so Tailwind can find it.
 */

/**
 * M3: a menu that scrolls "show[s] a persistent scrollbar". Overlay scrollbars hide at rest,
 * so a styled WebKit scrollbar is always drawn (a 4px `outline` thumb in a 12px track);
 * elsewhere, a thin one. Shared by the menu and the exposed dropdown menus' option list.
 */
export const persistentScrollbar = [
  '[&::-webkit-scrollbar]:w-[12px] [&::-webkit-scrollbar-track]:bg-transparent',
  '[&::-webkit-scrollbar-thumb]:rounded-corner-full [&::-webkit-scrollbar-thumb]:border-[4px] [&::-webkit-scrollbar-thumb]:border-solid [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-outline [&::-webkit-scrollbar-thumb]:bg-clip-padding',
  'supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin] supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--md-sys-color-outline)_transparent]',
];

/** Variant definitions for {@link Menu} and its parts. */
export const menuStyles = tv({
  slots: {
    // The outermost element, which React Aria places (inline `position` and insets) and which
    // takes the consumer's `className` and `style`.
    popover: 'z-(--md-sys-z-menu)',
    // The menu's enter and exit: revealed from its anchored edge with a clip (24px of room
    // for the shadows) as it fades in. M3 motion avoids scale, and a clip leaves the items'
    // layout untouched, so a submenu opened mid-animation is placed against its item's final
    // position. It also passes the popover's maximum height down, so a long list scrolls.
    // `w-max` keeps the menu's own width whatever width a consumer class gives the popover
    // (whose insets only React Aria sets: `data-overlay-placement`, styles/utilities.css).
    reveal: [
      'flex max-h-[inherit] w-max flex-col opacity-100 [clip-path:inset(-24px)]',
      '[transition-property:opacity,clip-path]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      // Closed until React Aria has placed it (`data-entering`, `useRevealEntering`), with no
      // transition, then it opens from there: a `@starting-style` was resolved before the
      // placement was known, so every menu opened from its top edge.
      'data-entering:opacity-0 data-entering:[transition-property:none] data-exiting:opacity-0',
      // Below the anchor it opens downwards, above it upwards, beside it sideways. Under
      // reduced motion it only fades: the clip stays open.
      'motion-safe:data-entering:[clip-path:inset(-24px_-24px_100%_-24px)] motion-safe:data-exiting:[clip-path:inset(-24px_-24px_100%_-24px)]',
      'motion-safe:data-[placement=top]:data-entering:[clip-path:inset(100%_-24px_-24px_-24px)] motion-safe:data-[placement=top]:data-exiting:[clip-path:inset(100%_-24px_-24px_-24px)]',
      'motion-safe:data-[placement=right]:data-entering:[clip-path:inset(-24px_100%_-24px_-24px)] motion-safe:data-[placement=right]:data-exiting:[clip-path:inset(-24px_100%_-24px_-24px)]',
      'motion-safe:data-[placement=left]:data-entering:[clip-path:inset(-24px_-24px_-24px_100%)] motion-safe:data-[placement=left]:data-exiting:[clip-path:inset(-24px_-24px_-24px_100%)]',
    ],
    // The list scrolls when tall, and a scroll container clips its children's shadows to
    // its box. 8px of padding (cancelled by a negative margin, so nothing moves) leaves room
    // for the groups' elevation-2 shadows; that ring lets clicks through, so a press just
    // outside the menu still dismisses it. Widths include the padding: 112–280px groups.
    menu: [
      'flex max-h-[inherit] flex-col overflow-y-auto bg-[var(--_md-comp-menus-container-color)] outline-none',
      ...persistentScrollbar,
      '[--m3-menu-corner:var(--_md-comp-menus-container-shape)]',
      'data-[shape=active]:[--m3-menu-corner:24px]',
      'data-[shape=inactive]:[--m3-menu-corner:var(--md-sys-shape-corner-small)]',
    ],
    group: [
      'pointer-events-auto flex flex-col bg-[var(--_md-comp-menus-container-color)] p-[4px] shadow-[shadow:var(--_md-comp-menus-container-elevation)]',
      // Forced colours drop the surface colour and the shadow: a system-colour outline keeps
      // the edge (an outline, so nothing moves).
      'forced-colors:outline-solid forced-colors:outline-1 forced-colors:outline-[CanvasText]',
      '[transition-property:border-radius]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
    ],
    // 8px above and below at density 0, 2px less per step (M3: density takes spacing off).
    divider: 'my-[calc(8px+var(--md-sys-density,0)*2px)] -mx-[4px] w-auto',
    heading: 'flex min-h-[32px] items-center ps-[8px] text-label-large',
    item: [
      'group/item flex min-h-[calc(44px+var(--md-sys-density,0)*4px)] w-full cursor-pointer items-center px-[16px] text-start',
      'text-body-large text-[color:var(--_md-comp-menus-menu-item-label-text-color)] outline-none select-none',
      'data-selected:bg-[var(--_md-comp-menus-menu-item-selected-container-color)] data-selected:text-[color:var(--_md-comp-menus-menu-item-selected-label-text-color)]',
      'state-layer focus-ring-inset container-motion',
      'data-selected:rounded-corner-medium',
      'data-disabled:cursor-default',
    ],
    selectedIcon: [
      'grid grid-cols-[0fr] opacity-0',
      '[transition-property:grid-template-columns,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      'group-data-selected/item:grid-cols-[1fr] group-data-selected/item:opacity-100',
    ],
    selectedIconInner: 'overflow-hidden',
    icon: 'me-[12px] inline-flex size-[20px] shrink-0 items-center justify-center text-[color:var(--_md-comp-menus-menu-item-leading-icon-color)] [&>svg]:size-full',
    text: 'flex min-w-0 flex-1 flex-col',
    description: 'text-body-medium',
    trailing:
      'ms-auto inline-flex shrink-0 items-center ps-[12px] text-label-small text-[color:var(--_md-comp-menus-menu-item-trailing-icon-color)] [&>svg]:size-[20px]',
    badge: 'inline-flex shrink-0 items-center ps-[12px]',
    // A menu's place in a bottom sheet. An open submenu's panel follows the menu that opened
    // it (portalled in after it) and hides it, and any panel before it, while it's open.
    sheetContent: [
      'flex min-h-0 flex-1 flex-col px-[8px] pb-[16px]',
      '[&>:not([data-overlay-scope]):has(~[data-overlay-scope])]:hidden',
      '[&>[data-overlay-scope]:has(~[data-overlay-scope])>*]:hidden',
    ],
    // A submenu in a sheet: a back button and its item's label above its list, fading in.
    sheetPanel: [
      'flex min-h-0 flex-1 flex-col opacity-100 starting:opacity-0',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    sheetHeader: 'flex min-h-[48px] shrink-0 items-center gap-[4px] pe-[12px]',
    sheetBack: [
      'inline-flex size-[48px] shrink-0 cursor-pointer items-center justify-center rounded-corner-full',
      'state-layer focus-ring text-on-surface-variant [&>svg]:size-[24px]',
    ],
    sheetTitle: 'min-w-0 flex-1 truncate text-title-medium text-on-surface',
  },
  variants: {
    variant: {
      standard: {
        heading: 'text-on-surface-variant',
        item: [
          'data-disabled:text-on-surface/38',
          'data-disabled:data-selected:bg-tertiary-container/38 data-disabled:data-selected:text-on-tertiary-container/38',
        ],
        icon: 'group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
        description:
          'text-on-surface-variant group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
        trailing:
          'group-data-selected/item:text-on-tertiary-container group-data-disabled/item:text-on-surface/38',
      },
      vibrant: {
        heading: 'text-on-tertiary-container',
        item: [
          'data-disabled:text-on-tertiary-container/38',
          'data-disabled:data-selected:bg-tertiary/38 data-disabled:data-selected:text-on-tertiary/38',
        ],
        icon: [
          'group-data-hovered/item:text-tertiary group-data-focus-visible/item:text-tertiary group-data-pressed/item:text-tertiary',
          'group-data-selected/item:text-on-tertiary',
          'group-data-selected/item:group-data-hovered/item:text-on-tertiary',
          'group-data-selected/item:group-data-focus-visible/item:text-on-tertiary',
          'group-data-selected/item:group-data-pressed/item:text-on-tertiary',
          'group-data-disabled/item:text-on-tertiary-container/38',
        ],
        description:
          'text-on-tertiary-container group-data-selected/item:text-on-tertiary group-data-disabled/item:text-on-tertiary-container/38',
        trailing: [
          'group-data-hovered/item:text-tertiary group-data-focus-visible/item:text-tertiary group-data-pressed/item:text-tertiary',
          'group-data-selected/item:text-on-tertiary',
          'group-data-selected/item:group-data-hovered/item:text-on-tertiary',
          'group-data-selected/item:group-data-focus-visible/item:text-on-tertiary',
          'group-data-selected/item:group-data-pressed/item:text-on-tertiary',
          'group-data-disabled/item:text-on-tertiary-container/38',
        ],
      },
    },
    groupPosition: {
      only: { group: 'rounded-[var(--_md-comp-menus-container-shape)]' },
      first: { group: 'rounded-t-[var(--_md-comp-menus-container-shape)] rounded-b-corner-small' },
      middle: { group: 'rounded-corner-small' },
      last: { group: 'rounded-t-corner-small rounded-b-[var(--_md-comp-menus-container-shape)]' },
    },
    /**
     * The item's top corners: `nested` inside a 16px corner (12px), `outer` inside the
     * menu's morphing outer corner (`--m3-menu-corner` less the 4px padding), else 4px.
     */
    itemTop: {
      nested: { item: 'rounded-t-corner-medium' },
      outer: {
        item: 'rounded-t-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
      },
      plain: { item: 'rounded-t-corner-extra-small' },
    },
    /** The item's bottom corners, as `itemTop`. */
    itemBottom: {
      nested: { item: 'rounded-b-corner-medium' },
      outer: {
        item: 'rounded-b-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
      },
      plain: { item: 'rounded-b-corner-extra-small' },
    },
    /** Groups' outer corners follow `--m3-menu-corner` (the submenu morph). */
    morph: {
      true: {},
      false: {},
    },
    hasDescription: {
      true: { item: 'py-[calc(8px+var(--md-sys-density,0)*2px)]' },
      false: {},
    },
    /** Open and close with no motion (`instant`). */
    instant: {
      true: { reveal: '[transition-property:none]' },
      false: {},
    },
    /** In a bottom sheet: the list spans it, on the sheet's own surface. */
    embedded: {
      true: {},
      false: {},
    },
    /**
     * `gap`: every group is its own surface, and the list only scrolls (its 8px ring keeps
     * the groups' shadows); `divider`: the list is the one surface.
     */
    layout: {
      gap: {
        menu: [
          '-m-[8px] p-[8px] pointer-events-none gap-[2px] bg-transparent',
          'min-w-[128px] max-w-[296px]',
        ],
      },
      divider: {
        menu: [
          'pointer-events-auto min-w-[112px] max-w-[280px] p-[4px] shadow-[shadow:var(--_md-comp-menus-container-elevation)]',
          'forced-colors:outline-solid forced-colors:outline-1 forced-colors:outline-[CanvasText]',
          'rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
          '[transition-property:border-radius]',
          '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
        ],
        group: 'bg-transparent p-0 shadow-none forced-colors:outline-none',
      },
    },
  },
  compoundVariants: [
    {
      morph: true,
      groupPosition: 'only',
      class: { group: 'rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]' },
    },
    {
      morph: true,
      groupPosition: 'first',
      class: {
        group:
          'rounded-t-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))] rounded-b-corner-small',
      },
    },
    {
      morph: true,
      groupPosition: 'last',
      class: {
        group:
          'rounded-t-corner-small rounded-b-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
      },
    },
    // A divider layout's groups are plain sections of the one surface.
    { layout: 'divider', class: { group: 'rounded-none' } },
    // In a sheet the list has no surface, shadow or width limits of its own.
    {
      embedded: true,
      class: {
        menu: 'w-full max-w-none min-w-0 rounded-none bg-transparent p-0 shadow-none forced-colors:outline-none',
      },
    },
  ],
  defaultVariants: {
    variant: 'standard',
    layout: 'gap',
    morph: false,
    groupPosition: 'only',
    itemTop: 'plain',
    itemBottom: 'plain',
    hasDescription: false,
    instant: false,
    embedded: false,
  },
});

export type MenuStyleProps = VariantProps<typeof menuStyles>;
export type MenuVariant = NonNullable<MenuStyleProps['variant']>;
export type MenuLayout = NonNullable<MenuStyleProps['layout']>;
