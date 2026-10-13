import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (TextField.kt, OutlinedTextField.kt,
 * internal/TextFieldImpl.kt and the Filled/OutlinedTextFieldTokens files):
 * 56px minimum height, 16px horizontal padding (4px next to a 48px icon box), 8px
 * vertical padding with a label, 4px above supporting text, 2px around prefix/suffix,
 * a 4px gap around the outlined label notch, label float on the fast spatial spring.
 *
 * Colours depend on one mutually exclusive `data-field-state` on the root
 * (disabled > error-focus > error-hover > error > focus > hover > rest), so part styles
 * never compete. Every class is written out in full so Tailwind can find it.
 */

const geometryTransition =
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]';

const effectsTransition =
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]';

/** Variant definitions for {@link TextField}. */
export const textFieldStyles = tv({
  slots: {
    root: 'group/field inline-flex w-[280px] max-w-full flex-col align-top text-start',
    // Library-owned inner wrapper: positions the label, outline and indicator.
    container: 'relative flex min-h-[56px] cursor-text items-stretch',
    outline: [
      'pointer-events-none absolute inset-x-0 bottom-0 m-0 min-w-0 px-[12px]',
      'rounded-corner-extra-small border border-solid border-outline',
      'transition-[border-color,border-width]',
      effectsTransition,
      'group-data-[field-state=hover]/field:border-on-surface',
      'group-data-[field-state=focus]/field:border-2 group-data-[field-state=focus]/field:border-primary',
      'group-data-[field-state=error]/field:border-error',
      'group-data-[field-state=error-hover]/field:border-on-error-container',
      'group-data-[field-state=error-focus]/field:border-2 group-data-[field-state=error-focus]/field:border-error',
      'group-data-[field-state=disabled]/field:border-on-surface/12',
    ],
    // Hidden text the width of the floated label: cuts the notch in the outline.
    notch: [
      'invisible block h-[16px] max-w-[0.01px] overflow-hidden p-0 text-body-small whitespace-nowrap',
      'transition-[max-width]',
      effectsTransition,
      'group-data-floated/field:max-w-full group-has-[:autofill]/field:max-w-full',
    ],
    notchText: 'inline-block px-[4px]',
    indicator: [
      'pointer-events-none absolute inset-x-0 bottom-0 h-px bg-on-surface-variant',
      'transition-[height,background-color]',
      effectsTransition,
      'group-data-[field-state=hover]/field:bg-on-surface',
      'group-data-[field-state=focus]/field:h-[2px] group-data-[field-state=focus]/field:bg-primary',
      'group-data-[field-state=error]/field:bg-error',
      'group-data-[field-state=error-hover]/field:bg-on-error-container',
      'group-data-[field-state=error-focus]/field:h-[2px] group-data-[field-state=error-focus]/field:bg-error',
      'group-data-[field-state=disabled]/field:bg-on-surface/38',
    ],
    label: [
      'pointer-events-none absolute top-[16px] max-w-[calc(100%-32px)] truncate',
      'text-body-large text-on-surface-variant',
      '[transition-property:top,inset-inline-start,font-size,line-height,letter-spacing,color]',
      geometryTransition,
      'group-data-[field-state=focus]/field:text-primary',
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-on-error-container',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    icon: [
      'flex size-[48px] shrink-0 items-center justify-center self-center text-on-surface-variant',
      '[&>svg]:size-[24px]',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    trailingIcon: [
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-on-error-container',
    ],
    field: 'flex min-w-0 flex-1 items-center',
    input: [
      'min-w-0 flex-1 bg-transparent p-0 text-body-large text-on-surface caret-primary outline-none',
      'placeholder:text-on-surface-variant placeholder:opacity-100',
      'disabled:cursor-default group-data-[field-state=disabled]/field:text-on-surface/38',
      'group-data-invalid/field:caret-error',
      'resize-none',
    ],
    affix: [
      'text-body-large text-on-surface-variant whitespace-nowrap',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    prefix: 'pe-[2px]',
    suffix: 'ps-[2px]',
    supporting: 'flex gap-[16px] px-[16px] pt-[4px]',
    supportingText: [
      'min-w-0 flex-1',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    counter: 'ms-auto group-data-[field-state=disabled]/field:text-on-surface/38',
    required: 'text-inherit',
  },
  variants: {
    variant: {
      filled: {
        container:
          'rounded-t-corner-extra-small bg-surface-container-highest group-data-[field-state=disabled]/field:bg-on-surface/4',
        outline: 'hidden',
      },
      outlined: {
        container: 'rounded-corner-extra-small',
        indicator: 'hidden',
      },
    },
    // With a label the outline starts 8px higher, so its border runs through the middle of
    // the 16px notch legend and lands on the container's top edge.
    hasLabel: { true: { outline: '-top-[8px]' }, false: { outline: 'top-0' } },
    hasLeadingIcon: {
      true: { field: 'ps-[4px]', label: 'start-[52px]' },
      false: { field: 'ps-[16px]', label: 'start-[16px]' },
    },
    hasTrailingIcon: {
      true: { field: 'pe-[4px]' },
      false: { field: 'pe-[16px]' },
    },
    multiline: {
      true: { field: 'items-start', input: 'block' },
      false: {},
    },
  },
  compoundVariants: [
    // Input padding: filled fields with a label leave room above for the floated label.
    {
      variant: 'filled',
      hasLabel: true,
      class: { field: 'pt-[24px] pb-[8px]' },
    },
    { variant: 'filled', hasLabel: false, class: { field: 'py-[16px]' } },
    { variant: 'outlined', class: { field: 'py-[16px]' } },
    // Floated label: filled → 8px from the top; outlined → centred on the border, at 16px.
    {
      variant: 'filled',
      hasLabel: true,
      class: {
        label: [
          'group-data-floated/field:top-[8px] group-data-floated/field:text-body-small',
          'group-has-[:autofill]/field:top-[8px] group-has-[:autofill]/field:text-body-small',
        ],
      },
    },
    {
      variant: 'outlined',
      hasLabel: true,
      class: {
        label: [
          'group-data-floated/field:top-[-8px] group-data-floated/field:start-[16px] group-data-floated/field:text-body-small',
          'group-has-[:autofill]/field:top-[-8px] group-has-[:autofill]/field:start-[16px] group-has-[:autofill]/field:text-body-small',
        ],
      },
    },
    // With a label, the placeholder and prefix/suffix only show once the label floats.
    {
      hasLabel: true,
      class: {
        input: 'placeholder:opacity-0 group-data-floated/field:placeholder:opacity-100',
        affix:
          'opacity-0 transition-opacity group-data-floated/field:opacity-100 group-has-[:autofill]/field:opacity-100',
      },
    },
  ],
  defaultVariants: {
    variant: 'filled',
    hasLabel: true,
    hasLeadingIcon: false,
    hasTrailingIcon: false,
    multiline: false,
  },
});

export type TextFieldStyleProps = VariantProps<typeof textFieldStyles>;
export type TextFieldVariant = NonNullable<TextFieldStyleProps['variant']>;
