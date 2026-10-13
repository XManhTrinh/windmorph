/*
 * Corners of a button or icon button in a connected button group, by size and position
 * (set per child by `ButtonGroup`). From the M3 Expressive button group specs
 * (2026-10-13):
 *
 * - Round groups: the outer corners are full, and the inner corners stay square-ish at
 *   4 / 8 / 8 / 16 / 20px (XS–XL).
 * - Square groups: every corner takes that size, the outer ones too.
 * - Pressed, an inner corner tightens to 4px (Compose's `PressedInnerCornerCornerSize`;
 *   the spec gives no value). Selected, the whole button becomes fully round.
 *
 * Corners are logical (`s` / `e`), so they mirror in RTL. Every class is written out in
 * full: Tailwind finds classes by scanning for literal strings.
 */
export const connectedShapeVariants = [
  {
    size: 'xs',
    connected: 'leading',
    shape: 'round',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),16px)] rounded-e-corner-extra-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'leading',
    shape: 'square',
    class: {
      root: 'rounded-corner-extra-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'middle',
    class: {
      root: 'rounded-corner-extra-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'trailing',
    shape: 'round',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),16px)] rounded-s-corner-extra-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'xs',
    connected: 'trailing',
    shape: 'square',
    class: {
      root: 'rounded-corner-extra-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
    },
  },
  {
    size: 'sm',
    connected: 'leading',
    shape: 'round',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),20px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'leading',
    shape: 'square',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'trailing',
    shape: 'round',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),20px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'sm',
    connected: 'trailing',
    shape: 'square',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),20px)]',
    },
  },
  {
    size: 'md',
    connected: 'leading',
    shape: 'round',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),28px)] rounded-e-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'leading',
    shape: 'square',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'middle',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'trailing',
    shape: 'round',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),28px)] rounded-s-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'md',
    connected: 'trailing',
    shape: 'square',
    class: {
      root: 'rounded-corner-small data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    },
  },
  {
    size: 'lg',
    connected: 'leading',
    shape: 'round',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),48px)] rounded-e-corner-large data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'leading',
    shape: 'square',
    class: {
      root: 'rounded-corner-large data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'middle',
    class: {
      root: 'rounded-corner-large data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'trailing',
    shape: 'round',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),48px)] rounded-s-corner-large data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'lg',
    connected: 'trailing',
    shape: 'square',
    class: {
      root: 'rounded-corner-large data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),48px)]',
    },
  },
  {
    size: 'xl',
    connected: 'leading',
    shape: 'round',
    class: {
      root: 'rounded-s-[min(var(--md-sys-shape-corner-full),68px)] rounded-e-corner-large-increased data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-e-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'leading',
    shape: 'square',
    class: {
      root: 'rounded-corner-large-increased data-pressed:rounded-e-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'middle',
    class: {
      root: 'rounded-corner-large-increased data-pressed:rounded-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'trailing',
    shape: 'round',
    class: {
      root: 'rounded-e-[min(var(--md-sys-shape-corner-full),68px)] rounded-s-corner-large-increased data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-s-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
  {
    size: 'xl',
    connected: 'trailing',
    shape: 'square',
    class: {
      root: 'rounded-corner-large-increased data-pressed:rounded-s-corner-extra-small data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),68px)]',
    },
  },
] as const;
