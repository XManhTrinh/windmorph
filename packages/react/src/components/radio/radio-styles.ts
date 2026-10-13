import { selectionControlStyles } from '../../primitives/selection-control-styles';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (RadioButton.kt and RadioButtonTokens): a 20px ring
 * with a 2px stroke and a 10px dot that grows on the fast spatial spring; colours change
 * on the default effects spring. Unselected rings are on-surface-variant and darken to
 * on-surface on hover, focus and press; selected rings are primary; disabled are
 * on-surface at 38%. M3 radio buttons have no error colour. The control and state layer
 * come from `selectionControlStyles`. Every class is written out in full.
 */

/** Variant definitions for {@link Radio}. */
export const radioStyles = tv({
  extend: selectionControlStyles,
  slots: {
    ring: [
      'relative inline-flex size-[20px] items-center justify-center rounded-full',
      'border-2 border-solid border-on-surface-variant text-primary',
      '[transition-property:border-color,color]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'group-data-hovered/control:border-on-surface',
      'group-data-focus-visible/control:border-on-surface',
      'group-data-pressed/control:border-on-surface',
      'group-data-selected/control:border-primary',
      'group-data-disabled/control:border-on-surface/38 group-data-disabled/control:text-on-surface/38',
      // Stacked so disabled also wins over the selected colour (equal specificity otherwise).
      'group-data-disabled/control:group-data-selected/control:border-on-surface/38',
      'group-data-disabled/control:[transition-duration:0s]',
    ],
    dot: [
      'size-[10px] scale-0 rounded-full bg-current',
      '[transition-property:scale]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
      'group-data-selected/control:scale-100',
    ],
  },
});

/** Variant definitions for {@link RadioGroup}. */
export const radioGroupStyles = tv({
  slots: {
    root: 'flex flex-col gap-[4px]',
    label: 'text-title-small text-on-surface',
    options: 'flex',
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

export type RadioStyleProps = VariantProps<typeof radioStyles>;
export type RadioGroupStyleProps = VariantProps<typeof radioGroupStyles>;
