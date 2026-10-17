import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Badge.kt, BadgeTokens).
 *
 * Small badge: a 6px `error` dot. Large badge: at least 16px (1rem, so it grows with the
 * text), full corners, 4px side padding, `label-small` `on-error`. Counts are capped ("999+"). M3 allows up to four
 * characters, including "+", within "16x34dp": a label of four characters or fewer is never
 * cut ("999+" renders about a pixel wider than 34px), and only longer text stops at 34px and
 * truncates.
 *
 * Placement (BadgedBox): a small badge's start edge sits 6px inside the anchor's end and
 * its top on the anchor's top; a large badge starts 12px inside the end with its bottom
 * 14px below the anchor's top. The badge hangs from a zero-size box in the anchor's grid
 * cell (margin-inline-start: 100% − offset, flex-aligned to its bottom), so nothing is
 * positioned and the badge never changes the anchor's size; it mirrors in RTL.
 *
 * The colours come from the badge's component tokens (`badge-tokens.ts`,
 * `--md-comp-badge-color` and `--md-comp-badge-large-*`); the root carries
 * `data-tokens="md-comp-badge"` and `data-size`, and the classes read one private variable per
 * part. A consumer class (`bg-primary`) still wins.
 *
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Badge}; extend them to add colour styles. */
export const badgeStyles = tv({
  slots: {
    root: [
      'inline-flex shrink-0 items-center justify-center rounded-corner-full',
      'bg-[var(--_md-comp-badge-color)] text-[color:var(--_md-comp-badge-label-text-color)]',
    ],
    // Only text longer than M3's four characters is cut (see `overflow`).
    label: 'min-w-0 truncate',
  },
  variants: {
    size: {
      // Forced colours drop backgrounds: the dot is drawn in `CanvasText`, and the large badge
      // takes an outline round its digits.
      small: {
        root: 'size-[6px] forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none',
      },
      large: {
        root: [
          // In rem, as the label's 16px line height is (1rem): at a larger text size a digit stays
          // a circle and the 34px limit grows with the text (2026-10-17).
          'min-h-[1rem] min-w-[1rem] ps-[4px] pe-[4px] text-label-small whitespace-nowrap',
          'forced-colors:outline forced-colors:outline-1 forced-colors:outline-solid forced-colors:outline-[CanvasText]',
        ],
      },
    },
    /** Text longer than four characters stops at 34px (2.125rem) and truncates. */
    overflow: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [{ size: 'large', overflow: true, class: { root: 'max-w-[2.125rem]' } }],
  defaultVariants: { size: 'small', overflow: false },
});

/** Variant definitions for {@link BadgedBox}. */
export const badgedBoxStyles = tv({
  slots: {
    root: 'inline-grid shrink-0 grid-cols-[100%] grid-rows-[100%] align-middle',
    // A bare SVG anchor gets Compose's default 24px icon size; wrap other sizes.
    anchor: 'col-start-1 row-start-1 flex items-center justify-center [&>svg]:size-[24px]',
    // The zero-size box the badge hangs from; a large badge (its root's `data-size`) hangs
    // further in and lower.
    hang: [
      'col-start-1 row-start-1 flex size-0 items-end self-start justify-self-start',
      'ms-[calc(100%-6px)] mt-[6px]',
      'has-[[data-size=large]]:ms-[calc(100%-12px)] has-[[data-size=large]]:mt-[14px]',
    ],
  },
});

/**
 * The variants of {@link badgeStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type BadgeStyleProps = VariantProps<typeof badgeStyles>;
