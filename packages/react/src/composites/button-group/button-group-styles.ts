import { tv } from '../../utils/tv';

/**
 * Variant definitions for `ButtonGroup`, from the M3 Expressive button group specs
 * (2026-10-13). Standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart (XS–XL), so
 * the XS and S buttons' 48px targets don't overlap. Connected groups are 2px apart at every
 * size, and span their container with the buttons sharing the extra width ("The connected
 * button group should span the width of the page or surface it's placed on"); a consumer
 * `w-fit` (or a `max-w-*`) narrows it. Connected buttons share the width equally (2026-10-13,
 * as Compose's connected sample gives each `weight(1f)`); `*:basis-auto` on the group sizes
 * them by their content instead.
 *
 * With `overflow`, a standard group fills its container's width too, so it can measure the
 * room it has; its buttons stay at the start. Buttons folded into the overflow menu carry
 * `data-overflow-hidden`; while measuring, the group takes its content's width and no
 * button grows.
 */
export const buttonGroupStyles = tv({
  base: 'items-center',
  variants: {
    variant: {
      standard: 'inline-flex',
      connected: 'flex w-full gap-[2px] *:grow *:basis-0',
    },
    size: { xs: '', sm: '', md: '', lg: '', xl: '' },
    overflow: {
      true: 'flex w-full min-w-0 *:data-overflow-hidden:hidden data-measuring:w-max data-measuring:*:grow-0',
      false: '',
    },
  },
  compoundVariants: [
    { variant: 'standard', size: 'xs', class: 'gap-[18px]' },
    { variant: 'standard', size: 'sm', class: 'gap-[12px]' },
    { variant: 'standard', size: ['md', 'lg', 'xl'], class: 'gap-[8px]' },
  ],
  defaultVariants: { variant: 'standard', size: 'sm', overflow: false },
});
