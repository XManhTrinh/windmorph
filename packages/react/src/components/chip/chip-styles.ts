import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Chip.kt and the AssistChip / SuggestionChip /
 * FilterChip / InputChip / Chips token files):
 *
 * - 32px tall, `label-large`, 18px icons, 24px round avatars, a 1px `outline-variant` border
 *   when flat. Elevated chips are `surface-container-low` at level 1 (hover 2, dragged 4).
 * - Assist and suggestion chips keep 8px corners. Filter and input chips use Compose's
 *   Expressive `shapes` overload: 12px, 8px while pressed and full when selected, morphing
 *   on the fast spatial spring, with its tonal colours (unselected leading icons
 *   `on-surface-variant`).
 * - Padding and gaps are what Compose's `ChipArrangement` produces for each icon
 *   combination (e.g. a filter chip is 16px each side without icons, 8 · icon · 4 · label ·
 *   16px with a leading icon).
 * - Disabled: content `on-surface` 38%, borders `on-surface` 12%, containers `on-surface`
 *   12% at level 0.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Transitions: shape and padding on fast spatial, colours and elevation on fast effects. */
const motion = [
  '[--m3-transition-property:border-radius,padding-inline-start,background-color,color,box-shadow,border-color]',
  '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
  '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
  '[--m3-transition-delay:0s,0s,0s,0s,0s,0s]',
];

/** Variant definitions for the chips; extend them to add variants. */
export const chipStyles = tv({
  slots: {
    root: [
      'group/chip inline-flex h-[32px] max-w-full shrink-0 cursor-pointer items-center align-middle',
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
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    checkInner: 'flex min-w-0 overflow-hidden',
    checkIcon: 'inline-flex size-[18px] shrink-0 me-[4px] [&>svg]:size-full',
    avatar:
      'size-[24px] shrink-0 overflow-hidden rounded-full [&>img]:size-full [&>img]:object-cover group-data-disabled/chip:opacity-38',
    // Input chips: the remove button, with its own round state layer and focus ring.
    remove: [
      'inline-flex size-[24px] shrink-0 -mx-[3px] cursor-pointer items-center justify-center rounded-full',
      'state-layer focus-ring [&>svg]:size-[18px]',
      'data-disabled:cursor-default',
    ],
    // Input chips: the primary action fills the chip.
    primary:
      'inline-flex min-w-0 flex-1 cursor-pointer items-center self-stretch rounded-[inherit] focus-ring data-disabled:cursor-default',
  },
  variants: {
    kind: {
      assist: {
        root: 'rounded-corner-small text-on-surface',
        leading: 'text-primary',
        trailing: 'text-primary',
      },
      suggestion: {
        root: 'rounded-corner-small text-on-surface-variant',
        leading: 'text-primary',
      },
      filter: {
        root: [
          'rounded-corner-medium data-pressed:rounded-corner-small text-on-surface-variant',
          'data-selected:not-data-pressed:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
          'data-selected:bg-secondary-container data-selected:text-on-secondary-container data-selected:data-hovered:shadow-elevation-1',
          'data-selected:data-disabled:bg-on-surface/12 data-selected:data-disabled:text-on-surface/38',
        ],
      },
      input: {
        root: [
          'cursor-default rounded-corner-medium has-data-pressed:rounded-corner-small text-on-surface-variant',
          // The chip shows the state layer of whichever of its buttons is interacted with.
          'has-data-hovered:[--m3-state-opacity:var(--md-sys-state-hover-state-layer-opacity)]',
          'has-data-focus-visible:[--m3-state-opacity:var(--md-sys-state-focus-state-layer-opacity)]',
          'has-data-pressed:[--m3-state-opacity:var(--md-sys-state-pressed-state-layer-opacity)]',
          'data-selected:not-has-data-pressed:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
          'data-selected:bg-secondary-container data-selected:text-on-secondary-container',
          'data-selected:data-disabled:bg-on-surface/12 data-selected:data-disabled:text-on-surface/38',
        ],
        leading:
          'group-data-selected/chip:text-primary group-data-disabled/chip:group-data-selected/chip:text-on-surface/38',
      },
    },
    elevated: {
      true: {
        root: 'bg-surface-container-low shadow-elevation-1 data-hovered:shadow-elevation-2 data-dragged:shadow-elevation-4 data-disabled:bg-on-surface/12 data-disabled:shadow-elevation-0',
      },
      false: {
        root: 'border border-solid border-outline-variant bg-transparent data-dragged:shadow-elevation-4 data-disabled:border-on-surface/12',
      },
    },
    leading: { none: {}, icon: {}, avatar: {} },
    trailing: { true: {}, false: {} },
  },
  compoundVariants: [
    // Selected filter and input chips drop their border (Compose: 0dp, transparent).
    {
      kind: ['filter', 'input'],
      elevated: false,
      class: { root: 'data-selected:border-transparent' },
    },
    {
      kind: 'filter',
      elevated: true,
      class: { root: 'data-selected:bg-secondary-container' },
    },

    // Assist and suggestion: arrangement 8px; padding 16px, or 8px beside an icon.
    {
      kind: ['assist', 'suggestion'],
      leading: 'none',
      class: { root: 'ps-[16px]' },
    },
    {
      kind: ['assist', 'suggestion'],
      leading: ['icon', 'avatar'],
      class: { root: 'ps-[8px]', leading: 'me-[8px]' },
    },
    { kind: ['assist', 'suggestion'], trailing: false, class: { root: 'pe-[16px]' } },
    {
      kind: ['assist', 'suggestion'],
      trailing: true,
      class: { root: 'pe-[8px]', trailing: 'ms-[8px]' },
    },

    // Filter: none 16 | 16; leading 8 · 4 | 16; trailing 12 | 8 · 8; both 8 · 4 | 4 · 8.
    // A filter chip without a leading icon shows a check when selected (8 · check · 4).
    {
      kind: 'filter',
      leading: 'none',
      trailing: false,
      class: { root: 'ps-[16px] data-selected:ps-[8px] pe-[16px]' },
    },
    {
      kind: 'filter',
      leading: 'icon',
      trailing: false,
      class: { root: 'ps-[8px] pe-[16px]', leading: 'me-[4px]' },
    },
    {
      kind: 'filter',
      leading: 'none',
      trailing: true,
      class: { root: 'ps-[12px] data-selected:ps-[8px] pe-[8px]', trailing: 'ms-[8px]' },
    },
    {
      kind: 'filter',
      leading: 'icon',
      trailing: true,
      class: { root: 'ps-[8px] pe-[8px]', leading: 'me-[4px]', trailing: 'ms-[4px]' },
    },

    // Input: none 12 | 12; icon 8 · 4 | 12; avatar 4 · 4 | 12; trailing 8 | 8 · 8;
    // with both, the trailing gap is 4px.
    { kind: 'input', leading: 'none', trailing: false, class: { primary: 'ps-[12px] pe-[12px]' } },
    {
      kind: 'input',
      leading: 'icon',
      trailing: false,
      class: { primary: 'ps-[8px] pe-[12px]', leading: 'me-[4px]' },
    },
    {
      kind: 'input',
      leading: 'avatar',
      trailing: false,
      class: { primary: 'ps-[4px] pe-[12px]', leading: 'me-[4px]' },
    },
    {
      kind: 'input',
      leading: 'none',
      trailing: true,
      class: { primary: 'ps-[8px] pe-[8px]', root: 'pe-[8px]' },
    },
    {
      kind: 'input',
      leading: 'icon',
      trailing: true,
      class: { primary: 'ps-[8px] pe-[4px]', leading: 'me-[4px]', root: 'pe-[8px]' },
    },
    {
      kind: 'input',
      leading: 'avatar',
      trailing: true,
      class: { primary: 'ps-[4px] pe-[4px]', leading: 'me-[4px]', root: 'pe-[8px]' },
    },
  ],
  defaultVariants: { kind: 'assist', elevated: false, leading: 'none', trailing: false },
});

export type ChipStyleProps = VariantProps<typeof chipStyles>;
