import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Checkbox.kt with M3 styling, i.e.
 * ComposeMaterial3Flags.isCheckboxStylingFixEnabled, and CheckboxTokens): an 18px box
 * with 2px corners and a 2px outline, a 2px square-capped check, a 40px round state
 * layer and a 48px touch target. The box fills on the default effects spring and
 * empties on the fast one; the check draws on the default spatial spring and snaps
 * away 100ms after unchecking. State layers follow the M3 spec: on-surface when
 * unselected, primary when selected, inverted while pressed, error when invalid
 * (shared with radio buttons and switches in `selectionControlStyles`).
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Checkbox}. */
export const checkboxStyles = tv({
  extend: selectionControlStyles,
  slots: {
    box: [
      'relative inline-flex size-[18px] items-center justify-center rounded-[2px]',
      'border-2 border-solid border-on-surface-variant bg-transparent text-on-primary',
      '[transition-property:background-color,border-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
      'group-data-selected/control:border-primary group-data-selected/control:bg-primary',
      'group-data-selected/control:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      'group-data-selected/control:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'group-data-invalid/control:border-error group-data-invalid/control:text-on-error',
      'group-data-invalid/control:group-data-selected/control:bg-error',
      'group-data-disabled/control:border-on-surface/38 group-data-disabled/control:text-surface',
      'group-data-disabled/control:group-data-selected/control:border-transparent',
      'group-data-disabled/control:group-data-selected/control:bg-on-surface/38',
      'group-data-disabled/control:[transition-duration:0s]',
    ],
    // The box sits inside its 2px border, so the 18px drawing area is offset by it.
    icon: 'pointer-events-none absolute -inset-[2px] size-[18px] overflow-visible',
    mark: [
      'fill-none stroke-current stroke-2 [stroke-linecap:square] [stroke-dasharray:1] [stroke-dashoffset:1]',
      '[transition-property:stroke-dashoffset] [transition-duration:0s] [transition-delay:100ms]',
    ],
    check: [
      'group-data-checked/control:[stroke-dashoffset:0]',
      'group-data-checked/control:[transition-delay:0s]',
      'group-data-checked/control:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      'group-data-checked/control:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
    dash: [
      'group-data-indeterminate/control:[stroke-dashoffset:0]',
      'group-data-indeterminate/control:[transition-delay:0s]',
      'group-data-indeterminate/control:[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      'group-data-indeterminate/control:[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
    ],
  },
});

export type CheckboxStyleProps = VariantProps<typeof checkboxStyles>;
