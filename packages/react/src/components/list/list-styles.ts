import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive list spec (m3.material.io) with Compose Material 3's
 * Expressive list tokens (ListItem.kt's interactive overloads, SegmentedListItem,
 * ListItemDefaults, ListTokens' `*Expressive*` values; 2026-10-13).
 *
 * Item: 16px start / end and 10px top / bottom padding, 12px between leading content, the
 * text and trailing content. The 12px belongs to the leading and trailing cells (rendered
 * only when present), so a text-only item's text spans 16px to 16px. At least 56px tall with one line, 72px with two (overline or
 * supporting text) and 88px with three (both), where content aligns to the top. Headline
 * `body-large` `on-surface`; supporting text `body-medium`, overline `label-small`, leading
 * and trailing content `on-surface-variant` (trailing text `label-small`, 20px icons). Selected
 * items show a trailing check as a second cue besides colour. Selected items
 * are `secondary-container` with `on-secondary-container` content; disabled content is
 * `on-surface` 38%.
 *
 * Shape (interactive items): 4px at rest, 12px hovered, 16px focused, selected or pressed,
 * morphing on the fast spatial spring; colours change on the default effects spring.
 * Segmented lists put 2px between items and round the outer corners of the first and last
 * items to 16px at rest. Static items in a standard list have no corners.
 *
 * Leading images are 56dp squares and video thumbnails 100 × 56dp (small) or 114 × 64dp
 * (large), all with 8dp corners; avatars are 40dp circles in `primary-container`
 * (`ListMedia.tsx`). The item grows to fit them. Expandable items indent their nested items
 * 16dp per level and end with a chevron that turns over on the fast spatial spring; their
 * nested items open and close their height on the default spatial spring while fading on
 * the default effects spring (only the fade under reduced motion). Dividers (standard lists) are 1px of
 * `outline-variant` on the item's bottom edge, full width or 16dp in from each side, drawn
 * by its `::after` (the state layer uses its background), never under the last item.
 *
 * Web density (`--md-sys-density`, 0 to -3; M3: a list "can adjust margins, spacing, or
 * density"): each step takes 2px off the padding above and below an item (10 → 4px) and 4px off
 * its minimum height (56 → 44px, 72 → 60px, 88 → 76px), so items that media make taller lose
 * 4px a step too, as in Material Components Web's list density (every item height 4px a step).
 * Section subheaders lose 4px a step (48 → 36px). Items are stacked rows, so dense ones keep
 * non-overlapping full-row targets above WCAG 2.5.8's 24px, and the expand chevron's target is
 * at most a one-line item's height.
 *
 * Sections (`ListSection`) put a subheader above their items: 48dp tall, `title-small`
 * `on-surface-variant`, 16dp from each side. The M3 spec defines no list subheader, so this
 * follows the deprecated navigation drawer's section headline. Items take their position
 * (segmented corners, dividers) within their section.
 *
 * Item colours come from the list's component tokens (`list-tokens.ts`,
 * `--md-comp-list-list-item-*`): the root and each item carry `data-tokens="md-comp-list"`
 * and `data-variant`. A consumer class still wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link List}; extend them to add variants. */
export const listStyles = tv({
  slots: {
    root: 'm-0 flex list-none flex-col p-0 outline-none',
    // A `ListSection`: its subheader, then its items' group.
    section: 'flex flex-col',
    // The M3 spec has no list subheader; this follows the deprecated navigation drawer's
    // section headline (`title-small`, `on-surface-variant`), on a 48dp row with the items'
    // 16dp side padding, so its text lines up with the headlines below it.
    subheader:
      'flex min-h-[calc(48px+var(--md-sys-density,0)*4px)] items-center ps-[16px] pe-[16px] text-title-small text-on-surface-variant',
    group: 'm-0 flex list-none flex-col p-0',
    item: [
      'group/list-item flex ps-[16px] pe-[16px] pt-[calc(10px+var(--md-sys-density,0)*2px)] pb-[calc(10px+var(--md-sys-density,0)*2px)] text-start outline-none',
      'bg-[var(--_md-comp-list-container-color)] data-selected:bg-[var(--_md-comp-list-list-item-selected-container-color)]',
      '[--m3-transition-property:border-radius,background-color,color]',
      '[--m3-transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-default-easing),var(--md-sys-motion-spring-effects-default-easing)]',
      '[--m3-transition-delay:0s,0s,0s]',
    ],
    // The item's content grid (the grid cell of an interactive item).
    cell: 'grid w-full grid-cols-[auto_minmax(0,1fr)_auto]',
    leading: [
      'col-start-1 me-[12px] flex items-center gap-x-[12px] text-title-medium text-[color:var(--_md-comp-list-list-item-leading-icon-color)] [&>svg]:size-[20px]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    text: 'col-start-2 flex min-w-0 flex-col',
    overline: [
      'text-label-small text-[color:var(--_md-comp-list-list-item-overline-color)]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    headline: [
      'text-body-large text-[color:var(--_md-comp-list-list-item-label-text-color)]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    supporting: [
      'text-body-medium text-[color:var(--_md-comp-list-list-item-supporting-text-color)]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    trailing: [
      'col-start-3 ms-[12px] flex items-center gap-x-[12px] text-label-small text-[color:var(--_md-comp-list-list-item-trailing-icon-color)] [&>svg]:size-[20px]',
      'group-data-selected/list-item:text-on-secondary-container',
      'group-data-disabled/list-item:text-on-surface/38',
    ],
    // The check a selected item shows besides its colour (M3: two cues for selection).
    selectionIndicator: [
      'inline-flex size-[20px] shrink-0 items-center justify-center opacity-0 [&>svg]:size-full',
      'group-data-selected/list-item:opacity-100 group-data-selected/list-item:text-on-secondary-container',
      'transition-opacity duration-(--md-sys-motion-spring-effects-fast-duration) ease-(--md-sys-motion-spring-effects-fast-easing)',
    ],
    // An expandable item's chevron: a button (out of the Tab order) with a 48px target.
    expand: [
      'relative inline-flex size-[24px] shrink-0 cursor-pointer items-center justify-center rounded-full',
      'state-layer [&>svg]:size-[20px] [&>svg]:fill-current',
      '[&>svg]:transition-transform [&>svg]:duration-(--md-sys-motion-spring-spatial-fast-duration) [&>svg]:ease-(--md-sys-motion-spring-spatial-fast-easing)',
      'group-aria-expanded/list-item:[&>svg]:rotate-180 motion-reduce:[&>svg]:transition-none',
      'data-disabled:cursor-default',
    ],
    // A tree row's wrapper: nested rows open and close their height (grid rows 0fr ↔ 1fr)
    // on the default spatial spring and fade on the default effects spring; under reduced
    // motion they only fade.
    reveal: [
      'grid grid-rows-[1fr] opacity-100',
      '[transition-property:grid-template-rows,opacity] motion-reduce:[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),var(--md-sys-motion-spring-effects-default-easing)]',
      // Reduced motion: the fade alone, still on the default effects spring.
      'motion-reduce:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      'motion-reduce:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      // The height opens and closes only with motion: under reduced motion a leaving row
      // stays open and fades where it is (with no height transition, a closed height would
      // apply in the first frame and hide the fade).
      'motion-safe:data-appear:starting:grid-rows-[0fr] data-appear:starting:opacity-0',
      'motion-safe:data-exiting:grid-rows-[0fr] data-exiting:opacity-0',
      // A closing row is never the scroll anchor: the browser would pick it (its top stays
      // put) and let a row pressed below it slide up by its height. The pressed row is held
      // in place by the tree itself when the anchor is above it (2026-10-17).
      'data-exiting:[overflow-anchor:none]',
    ],
    // Lets the row's height close to nothing inside the reveal.
    revealClip: 'flex min-h-0 flex-col overflow-hidden',
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
      // Item colours are tokens: a standard item is see-through, so it takes its
      // container's colour (a sheet, a card); a segmented item is `surface`.
      standard: {},
      segmented: {
        // A tree's 2px gaps are inside each row's reveal (above every row but the first), so
        // a closing row takes its gap with it: a gap left between rows of no height would
        // shift what follows by 2px per row as the ghosts are removed, and the browser's
        // scroll anchoring then scrolled the page by as much (2026-10-17).
        root: 'gap-[2px] [&[role=treegrid]]:gap-0',
        group: 'gap-[2px]',
        reveal: 'not-first:[&>*>*]:mt-[2px]',
      },
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
      1: {
        item: 'min-h-[calc(56px+var(--md-sys-density,0)*4px)] items-center',
        cell: 'items-center',
      },
      2: {
        item: 'min-h-[calc(72px+var(--md-sys-density,0)*4px)] items-center',
        cell: 'items-center',
      },
      3: {
        item: 'min-h-[calc(88px+var(--md-sys-density,0)*4px)] items-start',
        cell: 'items-start',
      },
    },
    dividers: {
      none: {},
      full: {
        item: [
          "relative after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-outline-variant after:content-['']",
          'data-[position=last]:after:hidden data-[position=only]:after:hidden',
          // A plain list's item is last in its group by structure too, so the server's HTML
          // is right before the list learns where its sections are (see \`segmented\`).
          '[&[data-list-entry]:where(:last-child,:has(+[data-slot=section]))]:after:hidden',
          '[[data-list-entry]:where(:last-child,:has(+[data-slot=section]))>&]:after:hidden',
          'forced-colors:after:bg-[GrayText] forced-colors:after:forced-color-adjust-none',
        ],
      },
      inset: {
        item: [
          "relative after:pointer-events-none after:absolute after:inset-x-[16px] after:bottom-0 after:h-px after:bg-outline-variant after:content-['']",
          'data-[position=last]:after:hidden data-[position=only]:after:hidden',
          // A plain list's item is last in its group by structure too, so the server's HTML
          // is right before the list learns where its sections are (see \`segmented\`).
          '[&[data-list-entry]:where(:last-child,:has(+[data-slot=section]))]:after:hidden',
          '[[data-list-entry]:where(:last-child,:has(+[data-slot=section]))>&]:after:hidden',
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
    // Nested items of an expandable list, indented 16dp per level (`--m3-list-level`).
    nested: {
      true: { item: 'ps-[calc(16px+var(--m3-list-level,0)*16px)]' },
      false: {},
    },
    // Whether a section shows a subheader.
    titled: { true: {}, false: {} },
    // Overrides the alignment that follows from the line count.
    align: {
      center: { item: 'items-center', cell: 'items-center' },
      top: { item: 'items-start', cell: 'items-start' },
    },
  },
  compoundVariants: [
    // Segmented sections without a subheader stand 16dp apart, so each reads as its own group.
    { variant: 'segmented', titled: false, class: { section: 'not-first:pt-[16px]' } },
    // Segmented lists round the outer corners of the group at rest (static items too).
    // A plain list's items (\`data-list-entry\`, the item or the \`li\` holding it) also take
    // them from their place among their siblings: a group starts at the first child or after
    // a section and ends at the last child or before one. The list learns which entries are
    // sections only once it renders on the client, so without these the server's HTML would
    // show loose items next to a section with square corners until hydration.
    {
      variant: 'segmented',
      class: {
        item: [
          'data-[shape=rest]:rounded-corner-extra-small',
          'data-[shape=rest]:data-[position=first]:rounded-t-corner-large',
          'data-[shape=rest]:data-[position=last]:rounded-b-corner-large',
          'data-[shape=rest]:data-[position=only]:rounded-corner-large',
          'data-[shape=rest]:[&[data-list-entry]:where(:first-child,[data-slot=section]+*)]:rounded-t-corner-large',
          'data-[shape=rest]:[[data-list-entry]:where(:first-child,[data-slot=section]+*)>&]:rounded-t-corner-large',
          'data-[shape=rest]:[&[data-list-entry]:where(:last-child,:has(+[data-slot=section]))]:rounded-b-corner-large',
          'data-[shape=rest]:[[data-list-entry]:where(:last-child,:has(+[data-slot=section]))>&]:rounded-b-corner-large',
        ],
      },
    },
  ],
  defaultVariants: { variant: 'standard', interactive: false, lines: 1, dividers: 'none' },
});

export type ListStyleProps = VariantProps<typeof listStyles>;
export type ListVariant = NonNullable<ListStyleProps['variant']>;
export type ListDividers = Exclude<NonNullable<ListStyleProps['dividers']>, 'none'>;

/** Variant definitions for `ListItemImage`, `ListItemVideo` and `ListItemAvatar` (M3's leading media). */
export const listMediaStyles = tv({
  slots: {
    // 8dp corners (M3 Expressive's `corner-small`), the image cropped to fill, faded with a
    // disabled item. The tonal fill shows behind a fallback icon.
    frame: [
      'relative flex shrink-0 items-center justify-center overflow-hidden',
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
      image: { frame: 'size-[56px] rounded-corner-small' },
      video: { frame: 'rounded-corner-small' },
      // A 40dp circle in `primary-container`, its initials `title-medium`.
      avatar: {
        frame:
          'size-[40px] rounded-full bg-primary-container text-title-medium text-on-primary-container',
      },
    },
    size: {
      small: {},
      large: {},
    },
  },
  compoundVariants: [
    { kind: 'video', size: 'small', class: { frame: 'h-[56px] w-[100px]' } },
    { kind: 'video', size: 'large', class: { frame: 'h-[64px] w-[114px]' } },
  ],
  defaultVariants: { kind: 'image', size: 'small' },
});
