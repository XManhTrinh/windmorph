import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Badge.kt, BadgeTokens).
 *
 * Small badge: a 6px `error` dot. Large badge: at least 16px, full corners, 4px side
 * padding, `label-small` `on-error`.
 *
 * Placement (BadgedBox): a small badge's start edge sits 6px inside the anchor's end and
 * its top on the anchor's top; a large badge starts 12px inside the end with its bottom
 * 14px below the anchor's top. The badge hangs from a zero-size box in the anchor's grid
 * cell (margin-inline-start: 100% − offset, flex-aligned to its bottom), so nothing is
 * positioned and the badge never changes the anchor's size; it mirrors in RTL.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Badge}; extend them to add colour styles. */
export const badgeStyles = tv({
  base: 'inline-flex shrink-0 items-center justify-center rounded-corner-full bg-error text-on-error',
  variants: {
    size: {
      small: 'size-[6px]',
      large: 'h-[16px] min-w-[16px] ps-[4px] pe-[4px] text-label-small whitespace-nowrap',
    },
  },
  defaultVariants: { size: 'small' },
});

/** Variant definitions for {@link BadgedBox}. */
export const badgedBoxStyles = tv({
  slots: {
    root: 'inline-grid shrink-0 grid-cols-[100%] grid-rows-[100%] align-middle',
    // A bare SVG anchor gets Compose's default 24px icon size; wrap other sizes.
    anchor: 'col-start-1 row-start-1 flex items-center justify-center [&>svg]:size-[24px]',
    // The zero-size box the badge hangs from.
    hang: 'col-start-1 row-start-1 flex size-0 items-end self-start justify-self-start',
  },
  variants: {
    size: {
      small: { hang: 'ms-[calc(100%-6px)] mt-[6px]' },
      large: { hang: 'ms-[calc(100%-12px)] mt-[14px]' },
    },
  },
  defaultVariants: { size: 'small' },
});

export type BadgeStyleProps = VariantProps<typeof badgeStyles>;
