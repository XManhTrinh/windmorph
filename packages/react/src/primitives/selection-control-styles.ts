import { tv } from '../utils/tv';

/**
 * Shared anatomy of checkboxes, radio buttons and switches: a root `<label>`, the
 * control (focus ring, touch target; for `kind: 'circle'` also the 40px round state
 * layer) and the label text. State layers
 * follow the M3 spec: on-surface when unselected, primary when selected, inverted while
 * pressed, error when invalid. Recipes `extend` this and style their own indicator with
 * `group-data-*\/control:` variants. Every class is written out in full.
 */
export const selectionControlStyles = tv({
  slots: {
    root: [
      'group/control inline-flex cursor-pointer items-center align-middle select-none',
      'text-body-large text-on-surface',
      'data-disabled:cursor-default data-disabled:text-on-surface/38',
    ],
    // Library-owned inner wrapper holding the indicator, focus ring and touch target.
    control: 'relative inline-flex shrink-0 items-center justify-center focus-ring',
    label: 'min-w-0 pe-[8px]',
  },
  variants: {
    kind: {
      // Checkboxes and radio buttons: the control is the 40px state-layer circle.
      circle: {
        control: [
          'size-[40px] rounded-full state-layer [--m3-ripple-size:20px] [--m3-ripple-start:12px]',
          '[--m3-state-layer-color:var(--md-sys-color-on-surface)]',
          'data-selected:[--m3-state-layer-color:var(--md-sys-color-primary)]',
          'data-pressed:[--m3-state-layer-color:var(--md-sys-color-primary)]',
          'data-selected:data-pressed:[--m3-state-layer-color:var(--md-sys-color-on-surface)]',
          'data-invalid:[--m3-state-layer-color:var(--md-sys-color-error)]',
        ],
      },
      // Switches: the control is the track; the recipe adds a state layer that follows the thumb.
      track: { control: 'rounded-full', label: 'ps-[12px]' },
    },
  },
  defaultVariants: { kind: 'circle' },
});
