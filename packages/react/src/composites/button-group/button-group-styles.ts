import { tv } from '../../utils/tv';

/**
 * Variant definitions for `ButtonGroup`, from the M3 Expressive button group specs
 * (2026-10-13). Standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart (XS–XL), so
 * the XS and S buttons' 48px targets don't overlap. Connected groups are 2px apart at every
 * size, and span their container with the buttons sharing the extra width ("The connected
 * button group should span the width of the page or surface it's placed on"); a consumer
 * `w-fit` (or a `max-w-*`) narrows it. Connected buttons are equally wide (2026-10-13, as
 * Compose's connected sample gives each `weight(1f)`): the group is a grid of `1fr` columns
 * (2026-10-15), so a definite width is shared equally, and a group sized by its content gives
 * every button the widest one's natural width, never squeezing a longer label into its
 * padding. The columns are `minmax(auto, 1fr)`, so with too little room a button shrinks no
 * further than its own minimum width, as in a flex row. `auto-cols-auto` on the group sizes
 * them by their content instead. While the press
 * bump pins the buttons' widths (`data-pinned`), the group lays them out as a flex row of the
 * same widths, so the bump can animate their `flex-basis`.
 *
 * With `overflow`, a standard group fills its container's width too, so it can measure the
 * room it has; its buttons stay at the start. Buttons folded into the overflow menu carry
 * `data-overflow-hidden`; while measuring, the group is a flex row of its content's width
 * and no button grows.
 */
export const buttonGroupStyles = tv({
  base: 'items-center',
  variants: {
    variant: {
      standard: 'inline-flex',
      connected: 'grid w-full grid-flow-col auto-cols-[1fr] gap-[2px] data-pinned:flex',
    },
    size: { xs: '', sm: '', md: '', lg: '', xl: '' },
    overflow: {
      true: 'w-full min-w-0 *:data-overflow-hidden:hidden data-measuring:flex data-measuring:w-max data-measuring:*:grow-0',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'standard', overflow: true, class: 'flex' },
    { variant: 'standard', size: 'xs', class: 'gap-[18px]' },
    { variant: 'standard', size: 'sm', class: 'gap-[12px]' },
    { variant: 'standard', size: ['md', 'lg', 'xl'], class: 'gap-[8px]' },
  ],
  defaultVariants: { variant: 'standard', size: 'sm', overflow: false },
});
