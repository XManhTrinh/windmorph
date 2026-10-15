import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 chips spec (m3.material.io, Specs and Accessibility tabs), with
 * Compose Material 3's chip token files for what the spec leaves out (2026-10-13):
 *
 * - At least 32px tall (a minimum, so a chip grows around text at a large browser font
 *   size, as Compose's `defaultMinSize` does; `h-fit` keeps a stretching parent from making
 *   it taller; 2026-10-13), 8px corners for every chip, `label-large`, 18px icons, 24px avatars with
 *   12px corners, a 1px `outline-variant` border when flat (`outline` with the strong
 *   outline). Elevated chips are `surface-container-low` at level 1 (hover 2, dragged 4).
 * - Padding: 16px at an edge without an icon, 8px beside an icon (4px beside an avatar),
 *   and 8px between elements. Input chips without a leading element keep Compose's 12px.
 *   Padding counts from the container's edge, as Compose's border overlays the content:
 *   a flat chip's 1px border is taken out of its edge padding (`--m3-chip-border`).
 * - Elevation never shows a press: hover raises a chip (elevated 1 → 2, a flat selected
 *   filter chip 0 → 1) only while it isn't pressed, keyboard-focused or dragged.
 * - A keyboard-focused flat chip's border is `on-surface` (assist, suggestion) or
 *   `on-surface-variant` (unselected filter and input chips).
 * - Leading icons are `primary`; a selected filter chip's is `on-secondary-container`, a
 *   selected input chip's `primary`, an unselected input chip's `on-surface-variant`.
 * - The remove button has a 48px target, and a chip with one is at least 88px wide.
 * - Web density (`--md-sys-density`): each step takes 4px off the minimum height, 32 → 28 →
 *   24px, and -3 stays at 24px (Material Components Web's chip density: 32px, 24px at its
 *   densest, -2). `--m3-chip-height` holds it; the avatar and the remove button's state layer
 *   are at most the height inside the border (24px, 22px in a flat 24px chip), so they never
 *   make a dense chip taller. The 48px touch target stays (M3: "a minimum 48dp target size,
 *   regardless of placement or density"), extending beyond the chip.
 * - Disabled: content `on-surface` 38%, borders `on-surface` 12%, containers `on-surface`
 *   12% at level 0.
 *
 * The resting corners, label and leading-icon colours, flat borders, elevated containers and
 * the flat selected containers and labels come from the component tokens (`chip-tokens.ts`,
 * `--md-comp-<kind>-chip-*`). Each kind is its own M3 token set, so each kind's classes read
 * its own private variables. A consumer class (`bg-tertiary`, `rounded-corner-medium`)
 * still wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Transitions: padding on fast spatial, colours and elevation on fast effects. */
const motion = [
  '[--m3-transition-property:padding-inline-start,background-color,color,box-shadow,border-color]',
  '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
  '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
  '[--m3-transition-delay:0s,0s,0s,0s,0s]',
];

/** A container of buttons shows the state layer of whichever one is interacted with. */
const containerStates = [
  'min-w-[88px] cursor-default',
  'has-data-hovered:[--m3-state-opacity:var(--md-sys-state-hover-state-layer-opacity)]',
  'has-data-focus-visible:[--m3-state-opacity:var(--md-sys-state-focus-state-layer-opacity)]',
  'has-data-pressed:[--m3-state-opacity:var(--md-sys-state-pressed-state-layer-opacity)]',
];

/** Variant definitions for the chips; extend them to add variants. */
export const chipStyles = tv({
  slots: {
    root: [
      'group/chip inline-flex h-fit min-h-[var(--m3-chip-height)] max-w-full shrink-0 cursor-pointer items-center align-middle',
      '[--m3-chip-height:max(24px,calc(32px+var(--md-sys-density,0)*4px))]',
      // An avatar's or the remove button's size: 24px, or the height inside a dense chip's border.
      '[--m3-chip-slot:min(24px,calc(var(--m3-chip-height)-2*var(--m3-chip-border)))]',
      'font-plain text-label-large whitespace-nowrap select-none',
      'state-layer focus-ring',
      ...motion,
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
    ],
    // Library-owned inner wrapper: holds the touch target.
    content: 'relative inline-flex min-w-0 items-center',
    // Icons: disabled beats their own colours through the named group's specificity.
    leading:
      'inline-flex shrink-0 items-center justify-center [&>svg]:size-[18px] group-data-disabled/chip:text-on-surface/38',
    label: 'min-w-0 truncate',
    trailing:
      'inline-flex size-[18px] shrink-0 items-center justify-center [&>svg]:size-full group-data-disabled/chip:text-on-surface/38',
    // Filter chips: the built-in check grows in when selected.
    check: [
      'grid grid-cols-[0fr] opacity-0 in-data-selected:grid-cols-[1fr] in-data-selected:opacity-100',
      '[transition-property:grid-template-columns,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    checkInner: 'flex min-w-0 overflow-hidden',
    checkIcon: 'inline-flex size-[18px] shrink-0 me-[8px] [&>svg]:size-full',
    avatar:
      'size-[var(--m3-chip-slot)] shrink-0 overflow-hidden rounded-corner-medium [&>img]:size-full [&>img]:object-cover group-data-disabled/chip:opacity-38',
    // The remove button: an 18px icon in a 24px round state layer (less in a dense flat chip),
    // with a 48px target. Its margins put the icon 8px from the label and from the chip's end.
    remove: [
      'relative ms-[calc(8px-(var(--m3-chip-slot)-18px)/2)] -me-[calc((var(--m3-chip-slot)-18px)/2)] inline-flex size-[var(--m3-chip-slot)] shrink-0 cursor-pointer items-center justify-center rounded-full',
      'state-layer [&>svg]:size-[18px]',
      'data-disabled:cursor-default',
    ],
    // A two-part chip's main part (its action, selection or label) fills the chip.
    primary:
      'inline-flex min-w-0 flex-1 cursor-pointer items-center self-stretch rounded-[inherit] focus-ring data-disabled:cursor-default',
  },
  variants: {
    kind: {
      assist: {
        root: [
          'rounded-[var(--_md-comp-assist-chip-container-shape)]',
          'text-[color:var(--_md-comp-assist-chip-label-text-color)]',
        ],
        leading: 'text-[color:var(--_md-comp-assist-chip-with-icon-icon-color)]',
      },
      suggestion: {
        root: [
          'rounded-[var(--_md-comp-suggestion-chip-container-shape)]',
          'text-[color:var(--_md-comp-suggestion-chip-label-text-color)]',
        ],
        leading:
          'text-[color:var(--_md-comp-suggestion-chip-with-leading-icon-leading-icon-color)]',
      },
      filter: {
        root: [
          'rounded-[var(--_md-comp-filter-chip-container-shape)]',
          'text-[color:var(--_md-comp-filter-chip-unselected-label-text-color)]',
          'data-selected:text-[color:var(--_md-comp-filter-chip-selected-label-text-color)]',
          'data-selected:data-disabled:bg-on-surface/12 data-selected:data-disabled:text-on-surface/38',
        ],
        leading: [
          'text-[color:var(--_md-comp-filter-chip-with-leading-icon-unselected-leading-icon-color)]',
          'group-data-selected/chip:text-on-secondary-container',
          'group-data-disabled/chip:group-data-selected/chip:text-on-surface/38',
        ],
      },
      input: {
        root: [
          'cursor-default rounded-[var(--_md-comp-input-chip-container-shape)]',
          'text-[color:var(--_md-comp-input-chip-unselected-label-text-color)]',
          'data-selected:bg-[var(--_md-comp-input-chip-selected-container-color)]',
          'data-selected:text-[color:var(--_md-comp-input-chip-selected-label-text-color)]',
          'data-selected:data-disabled:bg-on-surface/12 data-selected:data-disabled:text-on-surface/38',
        ],
        leading:
          'group-data-selected/chip:text-primary group-data-disabled/chip:group-data-selected/chip:text-on-surface/38',
      },
    },
    /**
     * How the chip is built: one element (`none`); a container of two buttons, its main
     * part and the remove button (`two`); or a remove-only input chip, whose one focus stop
     * is the remove button, so its focus ring circles the whole chip (`removeOnly`).
     */
    split: {
      none: {},
      two: { root: containerStates, remove: 'focus-ring' },
      removeOnly: {
        root: [
          ...containerStates,
          'has-data-focus-visible:[outline:var(--md-sys-focus-indicator-thickness)_solid_var(--md-sys-color-secondary)]',
          'has-data-focus-visible:[outline-offset:var(--md-sys-focus-indicator-offset)]',
        ],
        remove: 'outline-none',
        primary: 'cursor-default',
      },
    },
    elevated: {
      true: {
        root: [
          '[--m3-chip-border:0px] shadow-elevation-1',
          'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-2',
          'data-dragged:shadow-elevation-4 data-disabled:bg-on-surface/12 data-disabled:shadow-elevation-0',
        ],
      },
      false: {
        root: '[--m3-chip-border:1px] border border-solid bg-transparent data-dragged:shadow-elevation-4 data-disabled:border-on-surface/12',
      },
    },
    /** `strong` draws the border in `outline` for 3:1 contrast (M3's accessibility guidance). */
    outline: {
      standard: {},
      strong: {},
    },
    leading: { none: {}, icon: {}, avatar: {} },
    trailing: { true: {}, false: {} },
  },
  compoundVariants: [
    // The flat border and the elevated container: each kind's own tokens.
    {
      kind: 'assist',
      elevated: false,
      outline: 'standard',
      class: { root: 'border-[color:var(--_md-comp-assist-chip-flat-outline-color)]' },
    },
    {
      kind: 'suggestion',
      elevated: false,
      outline: 'standard',
      class: { root: 'border-[color:var(--_md-comp-suggestion-chip-flat-outline-color)]' },
    },
    {
      kind: 'filter',
      elevated: false,
      outline: 'standard',
      class: { root: 'border-[color:var(--_md-comp-filter-chip-flat-unselected-outline-color)]' },
    },
    {
      kind: 'input',
      elevated: false,
      outline: 'standard',
      class: { root: 'border-[color:var(--_md-comp-input-chip-unselected-outline-color)]' },
    },
    { elevated: false, outline: 'strong', class: { root: 'border-outline' } },
    {
      kind: 'assist',
      elevated: true,
      class: { root: 'bg-[var(--_md-comp-assist-chip-elevated-container-color)]' },
    },
    {
      kind: 'suggestion',
      elevated: true,
      class: { root: 'bg-[var(--_md-comp-suggestion-chip-elevated-container-color)]' },
    },
    // Selected filter and input chips drop their border (Compose: 0dp, transparent).
    {
      kind: ['filter', 'input'],
      elevated: false,
      class: { root: 'data-selected:border-transparent' },
    },
    {
      kind: 'filter',
      elevated: false,
      class: {
        root: 'data-selected:bg-[var(--_md-comp-filter-chip-flat-selected-container-color)]',
      },
    },
    {
      kind: 'filter',
      elevated: true,
      class: {
        root: [
          'bg-[var(--_md-comp-filter-chip-elevated-unselected-container-color)]',
          'data-selected:bg-secondary-container',
        ],
      },
    },
    // A flat selected filter chip rises to level 1 on hover only (focus and press stay at 0).
    {
      kind: 'filter',
      elevated: false,
      class: {
        root: 'data-selected:data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
      },
    },
    // A keyboard-focused flat chip's border darkens (Compose's Flat*FocusOutlineColor).
    {
      kind: ['assist', 'suggestion'],
      elevated: false,
      class: { root: 'data-focus-visible:border-on-surface' },
    },
    {
      kind: ['filter', 'input'],
      split: 'none',
      elevated: false,
      class: { root: 'data-focus-visible:not-data-selected:border-on-surface-variant' },
    },
    {
      kind: ['filter', 'input'],
      split: ['two', 'removeOnly'],
      elevated: false,
      class: { root: 'has-data-focus-visible:not-data-selected:border-on-surface-variant' },
    },

    // One-part chips: 16px at an edge without an icon, 8px beside one, 8px between, each
    // edge padding less the flat chip's border.
    // A filter chip without a leading icon grows a check when selected (8 · check · 8).
    {
      kind: ['assist', 'suggestion', 'filter'],
      split: 'none',
      leading: 'none',
      class: { root: 'ps-[calc(16px-var(--m3-chip-border))]' },
    },
    {
      kind: 'filter',
      split: 'none',
      leading: 'none',
      class: { root: 'data-selected:ps-[calc(8px-var(--m3-chip-border))]' },
    },
    {
      kind: ['assist', 'suggestion', 'filter'],
      split: 'none',
      leading: 'icon',
      class: { root: 'ps-[calc(8px-var(--m3-chip-border))]' },
    },
    {
      kind: ['assist', 'suggestion', 'filter'],
      split: 'none',
      trailing: false,
      class: { root: 'pe-[calc(16px-var(--m3-chip-border))]' },
    },
    {
      kind: ['assist', 'suggestion', 'filter'],
      split: 'none',
      trailing: true,
      class: { root: 'pe-[calc(8px-var(--m3-chip-border))]' },
    },
    { kind: ['assist', 'suggestion', 'filter'], leading: 'icon', class: { leading: 'me-[8px]' } },
    { kind: ['assist', 'suggestion', 'filter'], trailing: true, class: { trailing: 'ms-[8px]' } },
    // A filter chip with a remove button: its toggle holds the start padding.
    {
      kind: 'filter',
      split: 'two',
      leading: 'none',
      class: {
        primary:
          'ps-[calc(16px-var(--m3-chip-border))] data-selected:ps-[calc(8px-var(--m3-chip-border))]',
        root: 'pe-[calc(8px-var(--m3-chip-border))]',
      },
    },
    {
      kind: 'filter',
      split: 'two',
      leading: 'icon',
      class: {
        primary: 'ps-[calc(8px-var(--m3-chip-border))]',
        root: 'pe-[calc(8px-var(--m3-chip-border))]',
      },
    },

    // Input: 12px without a leading element, 8px beside an icon, 4px beside an avatar;
    // 8px between elements and at the end beside the remove button, 12px without one.
    { kind: 'input', leading: 'none', class: { primary: 'ps-[calc(12px-var(--m3-chip-border))]' } },
    {
      kind: 'input',
      leading: 'icon',
      class: { primary: 'ps-[calc(8px-var(--m3-chip-border))]', leading: 'me-[8px]' },
    },
    {
      kind: 'input',
      leading: 'avatar',
      class: { primary: 'ps-[calc(4px-var(--m3-chip-border))]', leading: 'me-[8px]' },
    },
    { kind: 'input', trailing: false, class: { primary: 'pe-[calc(12px-var(--m3-chip-border))]' } },
    { kind: 'input', trailing: true, class: { root: 'pe-[calc(8px-var(--m3-chip-border))]' } },
  ],
  defaultVariants: {
    kind: 'assist',
    split: 'none',
    elevated: false,
    outline: 'standard',
    leading: 'none',
    trailing: false,
  },
});

/**
 * Variant definitions for {@link ChipSet}. Chips are 8px apart (M3: "Keep an 8dp minimum
 * space between chips"). With web density, rows come 2px further apart per step, half of what
 * each chip loses (8 → 10 → 12px; 12px at -3, where chips stay 24px), so a chip's 48px touch
 * target never reaches the chips in the rows above and below.
 */
export const chipSetStyles = tv({
  slots: {
    root: 'flex max-w-full gap-x-[8px] gap-y-[calc(8px-max(-4px,var(--md-sys-density,0)*2px))]',
  },
  variants: {
    layout: {
      // Rows wrap, 8px apart.
      wrap: { root: 'flex-wrap' },
      // One row that scrolls sideways. The padding keeps the chips' 48px targets and focus
      // rings inside the scroll area (more above and below as density makes chips shorter).
      scroll: {
        root: 'flex-nowrap overflow-x-auto overscroll-x-contain ps-[4px] pe-[4px] pt-[calc(8px-max(-4px,var(--md-sys-density,0)*2px))] pb-[calc(8px-max(-4px,var(--md-sys-density,0)*2px))] [scrollbar-width:none]',
      },
    },
  },
  defaultVariants: { layout: 'wrap' },
});

export type ChipStyleProps = VariantProps<typeof chipStyles>;
export type ChipOutline = NonNullable<ChipStyleProps['outline']>;
export type ChipSetLayout = NonNullable<VariantProps<typeof chipSetStyles>['layout']>;
