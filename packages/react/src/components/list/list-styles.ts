import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3's Expressive list items (ListItem.kt's interactive
 * overloads, SegmentedListItem, ListItemDefaults, ListTokens).
 *
 * Item: 16px start / end and 10px top / bottom padding, 12px between leading content, the
 * text and trailing content. At least 56px tall with one line, 72px with two (overline or
 * supporting text) and 88px with three (both), where content aligns to the top. Headline
 * `body-large` `on-surface`; supporting text `body-medium`, overline `label-small`, leading
 * and trailing content `on-surface-variant` (trailing text `label-small`). Selected items
 * are `secondary-container` with `on-secondary-container` content; disabled content is
 * `on-surface` 38%.
 *
 * Shape (interactive items): 4px at rest, 12px hovered, 16px focused, selected or pressed,
 * morphing on the fast spatial spring; colours change on the default effects spring.
 * Segmented lists put 2px between items and round the outer corners of the first and last
 * items to 16px at rest. Static items in a standard list have no corners.
 *
 * Leading images are 56dp squares and video thumbnails 100 × 56 or 69dp, square-cornered
 * (`ListMedia.tsx`); the item grows to fit them. Dividers (standard lists) are 1px of
 * `outline-variant` on the item's bottom edge, full width or 16dp in from each side, drawn
 * by its `::after` (the state layer uses its background), never under the last item.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link List}; extend them to add variants. */
export const listStyles = tv({
  slots: {
    root: 'm-0 flex list-none flex-col p-0 outline-none',
    item: [
      'group/list-item flex ps-[16px] pe-[16px] pt-[10px] pb-[10px] text-start outline-none',
      'data-selected:bg-secondary-container',
      '[--m3-transition-property:border-radius,background-color,color]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-default-easing),var(--md-sys-motion-spring-effects-default-easing)]',
      '[--m3-transition-delay:0s,0s,0s]',
    ],
    // The item's content grid (the grid cell of an interactive item).
    cell: 'grid w-full grid-cols-[auto_minmax(0,1fr)_auto] gap-x-[12px]',
    leading: [
      'col-start-1 flex items-center gap-x-[12px] text-title-medium text-on-surface-variant [&>svg]:size-[24px]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    text: 'col-start-2 flex min-w-0 flex-col',
    overline: [
      'text-label-small text-on-surface-variant',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    headline: [
      'text-body-large text-on-surface',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    supporting: [
      'text-body-medium text-on-surface-variant',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    trailing: [
      'col-start-3 flex items-center gap-x-[12px] text-label-small text-on-surface-variant [&>svg]:size-[24px]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    // The drawn checkbox, radio button or switch of an item that is one. Decorative: the
    // item is the control, so the drawing only follows its state attributes.
    control: 'group/control inline-flex shrink-0 items-center justify-center',
    // A link item's leading and trailing content: above the link's overlay, but only its
    // controls take the pointer, so a press anywhere else reaches the link.
    raised:
      'pointer-events-none relative z-1 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_select]:pointer-events-auto [&_textarea]:pointer-events-auto',
    // A link item's anchor: its overlay covers the item, so the whole item is the link.
    link: "outline-none after:absolute after:inset-0 after:content-['']",
  },
  variants: {
    variant: {
      // Standard items take their container's colour (a sheet, a card); see the doc note.
      standard: { item: 'bg-transparent' },
      segmented: { root: 'gap-[2px]', item: 'bg-surface' },
    },
    interactive: {
      true: {
        item: [
          'cursor-pointer state-layer focus-ring-inset select-none',
          'data-disabled:cursor-default',
          // One shape state at a time (see `data-shape`), so no two rules compete.
          'data-[shape=rest]:rounded-corner-extra-small',
          'data-[shape=hovered]:rounded-corner-medium',
          'data-[shape=active]:rounded-corner-large',
        ],
      },
      false: {},
    },
    lines: {
      1: { item: 'min-h-[56px] items-center', cell: 'items-center' },
      2: { item: 'min-h-[72px] items-center', cell: 'items-center' },
      3: { item: 'min-h-[88px] items-start', cell: 'items-start' },
    },
    dividers: {
      none: {},
      full: {
        item: [
          "relative after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-outline-variant after:content-['']",
          'data-[position=last]:after:hidden data-[position=only]:after:hidden',
          'forced-colors:after:bg-[GrayText] forced-colors:after:forced-color-adjust-none',
        ],
      },
      inset: {
        item: [
          "relative after:pointer-events-none after:absolute after:inset-x-[16px] after:bottom-0 after:h-px after:bg-outline-variant after:content-['']",
          'data-[position=last]:after:hidden data-[position=only]:after:hidden',
          'forced-colors:after:bg-[GrayText] forced-colors:after:forced-color-adjust-none',
        ],
      },
    },
    // How many lines a headline or supporting text shows (the `text` slot's children).
    headlineLines: {
      1: { headline: 'line-clamp-1' },
      2: { headline: 'line-clamp-2' },
      3: { headline: 'line-clamp-3' },
    },
    supportingTextLines: {
      1: { supporting: 'line-clamp-1' },
      2: { supporting: 'line-clamp-2' },
      3: { supporting: 'line-clamp-3' },
    },
    // Overrides the alignment that follows from the line count.
    align: {
      center: { item: 'items-center', cell: 'items-center' },
      top: { item: 'items-start', cell: 'items-start' },
    },
  },
  compoundVariants: [
    // Segmented lists round the outer corners of the group at rest (static items too).
    {
      variant: 'segmented',
      class: {
        item: [
          'data-[shape=rest]:rounded-corner-extra-small',
          'data-[shape=rest]:data-[position=first]:rounded-t-corner-large',
          'data-[shape=rest]:data-[position=last]:rounded-b-corner-large',
          'data-[shape=rest]:data-[position=only]:rounded-corner-large',
        ],
      },
    },
  ],
  defaultVariants: { variant: 'standard', interactive: false, lines: 1, dividers: 'none' },
});

export type ListStyleProps = VariantProps<typeof listStyles>;
export type ListVariant = NonNullable<ListStyleProps['variant']>;
export type ListDividers = Exclude<NonNullable<ListStyleProps['dividers']>, 'none'>;

/** Variant definitions for `ListItemImage` and `ListItemVideo` (M3's leading media). */
export const listMediaStyles = tv({
  slots: {
    // Square by default (M3's `corner-none`), the image cropped to fill, faded with a disabled
    // item. The tonal fill shows behind a fallback icon.
    frame: [
      'relative flex shrink-0 items-center justify-center overflow-hidden rounded-none',
      'bg-secondary-container text-on-secondary-container [&>svg]:size-[24px] [&>svg]:fill-current',
      '[&>img]:size-full [&>img]:object-cover',
      'group-data-disabled/list-item:opacity-38',
    ],
    badge: [
      'absolute flex size-[24px] items-center justify-center rounded-full',
      'bg-inverse-surface/70 text-inverse-on-surface [&>svg]:size-[16px] [&>svg]:fill-current',
      'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
    ],
    duration:
      'absolute end-[4px] bottom-[4px] rounded-corner-extra-small bg-inverse-surface/80 px-[4px] text-label-small text-inverse-on-surface',
  },
  variants: {
    kind: {
      image: { frame: 'size-[56px]' },
      video: { frame: 'w-[100px]' },
    },
    size: {
      small: {},
      large: {},
    },
  },
  compoundVariants: [
    { kind: 'video', size: 'small', class: { frame: 'h-[56px]' } },
    { kind: 'video', size: 'large', class: { frame: 'h-[69px]' } },
  ],
  defaultVariants: { kind: 'image', size: 'small' },
});
