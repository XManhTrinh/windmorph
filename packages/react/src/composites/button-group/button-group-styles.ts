import { tv } from '../../utils/tv';

/**
 * Variant definitions for `ButtonGroup`, from the M3 Expressive button group specs
 * (2026-10-13). Standard groups space their buttons 18 / 12 / 8 / 8 / 8px apart (XS–XL), so
 * the XS and S buttons' 48px targets don't overlap. Connected groups are 2px apart at every
 * size, and span their container with the buttons sharing the extra width ("The connected
 * button group should span the width of the page or surface it's placed on"); a consumer
 * `w-fit` (or a `max-w-*`) narrows it.
 */
export const buttonGroupStyles = tv({
  base: 'items-center',
  variants: {
    variant: {
      standard: 'inline-flex',
      connected: 'flex w-full gap-[2px] *:grow',
    },
    size: { xs: '', sm: '', md: '', lg: '', xl: '' },
  },
  compoundVariants: [
    { variant: 'standard', size: 'xs', class: 'gap-[18px]' },
    { variant: 'standard', size: 'sm', class: 'gap-[12px]' },
    { variant: 'standard', size: ['md', 'lg', 'xl'], class: 'gap-[8px]' },
  ],
  defaultVariants: { variant: 'standard', size: 'sm' },
});
