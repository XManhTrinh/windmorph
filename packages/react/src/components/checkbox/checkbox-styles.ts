import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Checkbox.kt with M3 styling, i.e.
 * ComposeMaterial3Flags.isCheckboxStylingFixEnabled, and CheckboxTokens): an 18px box
 * with 2px corners and a 2px outline, a 2px square-capped check, a 40px round state
 * layer and a 48px touch target. The unselected outline is on-surface-variant and
 * darkens to on-surface on hover, focus and press; a selected box has no outline. The
 * box fills on the default effects spring and empties on the fast one; the check draws
 * on the default spatial spring and snaps away 100ms after unchecking. State layers
 * follow the M3 spec: on-surface when unselected, primary when selected, inverted while
 * pressed, error when invalid (shared with radio buttons and switches in
 * `selectionControlStyles`).
 * The selected container and icon colours and the unselected outline colour come from the
 * checkbox's component tokens (`checkbox-tokens.ts`, `--md-comp-checkbox-*`), resolved on
 * the box. A consumer class (`classNames.box`) still wins in `cn()`.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Checkbox}. */
export const checkboxStyles = tv({
  extend: selectionControlStyles,
  slots: {
    box: [
      'relative inline-flex size-[18px] items-center justify-center rounded-[2px]',
      'border-2 border-solid border-[color:var(--_md-comp-checkbox-unselected-outline-color)] bg-transparent',
      'text-[color:var(--_md-comp-checkbox-selected-icon-color)]',
      '[transition-property:background-color,border-color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
      // The unselected outline darkens on hover, focus and press (CheckboxTokens
      // Unselected{Hover,Focus,Pressed}OutlineColor = on-surface).
      'group-data-hovered/control:border-on-surface',
      'group-data-focus-visible/control:border-on-surface',
      'group-data-pressed/control:border-on-surface',
      // Checked and indeterminate boxes have no outline (Selected*OutlineWidth = 0): the border turns
      // transparent and the fill shows through it, in every state, invalid included.
      'control-checked:border-transparent',
      'control-checked:bg-[var(--_md-comp-checkbox-selected-container-color)]',
      'control-checked:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      'control-checked:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'group-data-invalid/control:border-error group-data-invalid/control:text-on-error',
      'group-data-invalid/control:control-checked:bg-error',
      // Stacked so the error outline also wins over the pressed colour (equal specificity
      // otherwise), and a pressed selected box still has no outline.
      'group-data-invalid/control:group-data-pressed/control:border-error',
      'group-data-invalid/control:group-data-pressed/control:control-checked:border-transparent',
      'group-data-disabled/control:border-on-surface/38 group-data-disabled/control:text-surface',
      'group-data-disabled/control:control-checked:border-transparent',
      'group-data-disabled/control:control-checked:bg-on-surface/38',
      'group-data-disabled/control:[transition-duration:0s]',
      // Forced colours: the box in system colours, `GrayText` when disabled, so a disabled
      // box doesn't look like an enabled one (a selected box is filled, its mark `Canvas`).
      'forced-colors:forced-color-adjust-none forced-colors:border-[CanvasText]! forced-colors:text-[Canvas]!',
      'forced-colors:control-checked:border-transparent! forced-colors:control-checked:bg-[CanvasText]!',
      'forced-colors:group-data-disabled/control:border-[GrayText]!',
      'forced-colors:group-data-disabled/control:control-checked:border-transparent! forced-colors:group-data-disabled/control:control-checked:bg-[GrayText]!',
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

/**
 * The variants of {@link checkboxStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type CheckboxStyleProps = VariantProps<typeof checkboxStyles>;
