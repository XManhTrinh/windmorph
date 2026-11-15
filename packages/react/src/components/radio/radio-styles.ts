import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (RadioButton.kt and RadioButtonTokens): a 20px ring
 * with a 2px stroke and a 10px dot that grows on the fast spatial spring; colours change
 * on the default effects spring. Unselected rings are on-surface-variant and darken to
 * on-surface on hover, focus and press; selected rings are primary; disabled are
 * on-surface at 38%. M3 radio buttons have no error colour. The control and state layer
 * come from `selectionControlStyles`. The selected and unselected colours come from the radio
 * button's component tokens (`radio-tokens.ts`, `--md-comp-radio-button-*`), resolved on the
 * ring; a consumer class (`classNames.ring`) still wins in `cn()`. Every class is written
 * out in full.
 */

/** Variant definitions for {@link Radio}. */
export const radioStyles = tv({
  extend: selectionControlStyles,
  slots: {
    ring: [
      'relative inline-flex size-[20px] items-center justify-center rounded-full',
      'border-2 border-solid border-[color:var(--_md-comp-radio-button-unselected-icon-color)]',
      // The dot is `bg-current`.
      'text-[color:var(--_md-comp-radio-button-selected-icon-color)]',
      '[transition-property:border-color,color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'group-data-hovered/control:border-on-surface',
      'group-data-focus-visible/control:border-on-surface',
      'group-data-pressed/control:border-on-surface',
      'control-checked:border-[color:var(--_md-comp-radio-button-selected-icon-color)]',
      'group-data-disabled/control:border-on-surface/38 group-data-disabled/control:text-on-surface/38',
      // Stacked so disabled also wins over the selected colour (equal specificity otherwise).
      'group-data-disabled/control:control-checked:border-on-surface/38',
      'group-data-disabled/control:[transition-duration:0s]',
      // Forced colours: the ring and its dot (`bg-current`, a background forced colours would
      // drop) in system colours, `GrayText` when disabled.
      'forced-colors:forced-color-adjust-none forced-colors:border-[CanvasText]! forced-colors:text-[CanvasText]!',
      'forced-colors:group-data-disabled/control:border-[GrayText]! forced-colors:group-data-disabled/control:text-[GrayText]!',
    ],
    dot: [
      'size-[10px] scale-0 rounded-full bg-current',
      '[transition-property:scale]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
      'control-checked:scale-100',
    ],
  },
});

/** Variant definitions for {@link RadioGroup}. */
export const radioGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-[4px]',
    label: 'text-title-small text-on-surface',
    // Rows are 48px apart, top to top, at every density (8px between 40px controls, 20px
    // between 28px ones), so the 48px touch targets of two rows never overlap, as in a
    // wrapping `ChipSet` and as Compose's 48dp minimum interactive size spaces radio buttons
    // (2026-11-15: rows touched, and a press on the bottom of one option's control chose the
    // next one).
    options: 'flex gap-y-[calc(8px-var(--md-sys-density,0)*4px)]',
    supporting: 'px-[4px]',
  },
  variants: {
    orientation: {
      vertical: { options: 'flex-col' },
      horizontal: { options: 'flex-row flex-wrap gap-x-[16px]' },
    },
    disabled: {
      true: { label: 'text-on-surface/38' },
      false: {},
    },
  },
  defaultVariants: { orientation: 'vertical', disabled: false },
});

/**
 * The variants of {@link radioStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type RadioStyleProps = VariantProps<typeof radioStyles>;
/**
 * The variants of {@link radioGroupStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type RadioGroupStyleProps = VariantProps<typeof radioGroupStyles>;
