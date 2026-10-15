import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (TextField.kt, OutlinedTextField.kt,
 * internal/TextFieldImpl.kt and the Filled/OutlinedTextFieldTokens files):
 * 56px minimum height, 16px horizontal padding (4px next to a 48px icon box), 8px
 * vertical padding with a label, 4px above supporting text, 2px around prefix/suffix,
 * a 4px gap around the outlined label notch, label float on the fast spatial spring.
 *
 * Web density (`--md-sys-density`, 0 to -3; M3: "decreases the top and bottom padding"): each
 * step takes 4px off the container (56 → 52 → 48 → 44px), 2px from the padding above and below
 * the value, and moves the resting and the filled field's floated label up 2px, so they stay
 * centred and clear of the value. The icon boxes are at most as tall as the container (the
 * 48px touch targets of icon buttons in them extend past it), and at -3 the container's
 * `::before` / `::after` add 2px of hit area above and below, so pressing within 48px of its
 * centre still focuses the field.
 *
 * Colours depend on one mutually exclusive `data-field-state` on the root
 * (disabled > error-focus > error-hover > error > focus > hover > rest), so part styles
 * never compete.
 *
 * The resting container colour and shape, outline and indicator colours, the focused and
 * hovered outline, the focused indicator and label, and the label, input, caret, supporting
 * text and icon colours come from the text field's component tokens (`text-field-tokens.ts`,
 * `--md-comp-<variant>-text-field-*`); the root carries `data-tokens="md-comp-text-field"`
 * and `data-variant`. A consumer class (`classNames.label`, …) still wins in `cn()`. Every
 * class is written out in full so Tailwind can find it.
 */

// The label's top, start, font size, line height and letter spacing on the fast spatial
// spring; its colour and opacity on the fast effects spring.
const geometryTransition =
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]';

/*
 * Colour on the fast effects spring, size on the fast spatial spring (Compose animates the
 * indicator thickness on FastSpatial and its colour on FastEffects).
 */
const colourAndSizeTransition =
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]';

const spatialTransition =
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]';

const effectsTransition =
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] [transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]';

/** Variant definitions for {@link TextField}. */
export const textFieldStyles = tv({
  slots: {
    root: 'group/field inline-flex w-[280px] max-w-full flex-col align-top text-start',
    // Library-owned inner wrapper: positions the label, outline and indicator.
    container: [
      'relative flex min-h-[calc(56px+var(--md-sys-density,0)*4px)] cursor-text items-stretch',
      // Dense fields keep a 48px hit area: at -3 (44px) 2px more above and below.
      "before:absolute before:inset-x-0 before:bottom-full before:h-[max(0px,calc(-4px-var(--md-sys-density,0)*2px))] before:content-['']",
      "after:absolute after:inset-x-0 after:top-full after:h-[max(0px,calc(-4px-var(--md-sys-density,0)*2px))] after:content-['']",
      'bg-[var(--_md-comp-text-field-container-color)]',
    ],
    outline: [
      'pointer-events-none absolute inset-x-0 bottom-0 m-0 min-w-0 px-[12px]',
      'rounded-[var(--_md-comp-text-field-container-shape)] border border-solid',
      'border-[color:var(--_md-comp-text-field-outline-color)]',
      // Colour and width both on the fast effects spring. Compose animates the width on
      // FastSpatial, but a browser draws a border in whole device pixels, so a width that
      // overshoots 2px and settles back draws 2 → 1 → 2px. The effects spring never
      // overshoots, so the width only grows (and never dips below 1px on the way back).
      // The filled indicator keeps the spatial spring: its `height` draws fractions.
      '[transition-property:border-color,border-width]',
      effectsTransition,
      'group-data-[field-state=hover]/field:border-[color:var(--_md-comp-text-field-hover-outline-color)]',
      'group-data-[field-state=focus]/field:border-2',
      'group-data-[field-state=focus]/field:border-[color:var(--_md-comp-text-field-focus-outline-color)]',
      'group-data-[field-state=error]/field:border-error',
      'group-data-[field-state=error-hover]/field:border-on-error-container',
      'group-data-[field-state=error-focus]/field:border-2 group-data-[field-state=error-focus]/field:border-error',
      'group-data-[field-state=disabled]/field:border-on-surface/12',
    ],
    // Hidden text the width of the floated label: cuts the notch in the outline. It opens
    // from 0fr to 1fr of the label's own width on the label's spring, so the gap keeps pace
    // with the label as it moves up.
    notch: [
      'invisible grid h-[16px] grid-cols-[0fr] p-0 text-body-small whitespace-nowrap',
      'transition-[grid-template-columns]',
      spatialTransition,
      'group-data-floated/field:grid-cols-[1fr] group-has-[:autofill]/field:grid-cols-[1fr]',
    ],
    notchClip: 'min-w-0 overflow-hidden',
    notchText: 'inline-block px-[4px]',
    indicator: [
      'pointer-events-none absolute inset-x-0 bottom-0 h-px',
      'bg-[var(--_md-comp-text-field-active-indicator-color)]',
      '[transition-property:background-color,height]',
      colourAndSizeTransition,
      'group-data-[field-state=hover]/field:bg-on-surface',
      'group-data-[field-state=focus]/field:h-[2px]',
      'group-data-[field-state=focus]/field:bg-[var(--_md-comp-text-field-focus-active-indicator-color)]',
      'group-data-[field-state=error]/field:bg-error',
      'group-data-[field-state=error-hover]/field:bg-on-error-container',
      'group-data-[field-state=error-focus]/field:h-[2px] group-data-[field-state=error-focus]/field:bg-error',
      'group-data-[field-state=disabled]/field:bg-on-surface/38',
    ],
    label: [
      'pointer-events-none absolute top-[calc(16px+var(--md-sys-density,0)*2px)] max-w-[calc(100%-32px)] truncate',
      'text-body-large text-[color:var(--_md-comp-text-field-label-text-color)]',
      '[transition-property:top,inset-inline-start,font-size,line-height,letter-spacing,color,opacity]',
      geometryTransition,
      'group-data-[field-state=focus]/field:text-[color:var(--_md-comp-text-field-focus-label-text-color)]',
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-on-error-container',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    icon: [
      'flex h-[min(48px,calc(56px+var(--md-sys-density,0)*4px))] w-[48px] shrink-0 items-center justify-center self-center',
      // Icon buttons here keep their size at every density: the box is a fixed 48px column
      // that density only shortens. One with its own `density` still follows it.
      '[&_:not([data-density])]:[--md-sys-density:0]',
      '[&>svg]:size-[24px]',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    leadingIcon: 'text-[color:var(--_md-comp-text-field-leading-icon-color)]',
    trailingIcon: [
      'text-[color:var(--_md-comp-text-field-trailing-icon-color)]',
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-on-error-container',
    ],
    field: 'flex min-w-0 flex-1 items-center',
    input: [
      'min-w-0 flex-1 bg-transparent p-0 text-body-large outline-none',
      'text-[color:var(--_md-comp-text-field-input-text-color)] caret-[color:var(--_md-comp-text-field-caret-color)]',
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
    // The supporting text's resting colour; the error message keeps its own.
    supportingTextColor: 'text-[color:var(--_md-comp-text-field-supporting-text-color)]',
    // Error colour whenever the field is invalid, with or without a message (Compose's
    // `ErrorSupportingColor`), so the supporting text reads as the error's explanation.
    supportingText: [
      'min-w-0 flex-1',
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-error',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    counter: [
      'ms-auto',
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-hover]/field:text-error',
      'group-data-[field-state=error-focus]/field:text-error',
      'group-data-[field-state=disabled]/field:text-on-surface/38',
    ],
    // The built-in error icon's own box; the trailing slot colours it.
    errorIcon: '[&>svg]:size-[24px]',
    required: 'text-inherit',
  },
  variants: {
    variant: {
      filled: {
        container: [
          'rounded-t-[var(--_md-comp-text-field-container-shape)]',
          'group-data-[field-state=disabled]/field:bg-on-surface/4',
        ],
        outline: 'hidden',
      },
      outlined: {
        container: 'rounded-[var(--_md-comp-text-field-container-shape)]',
        indicator: 'hidden',
        // OutlinedTextFieldTokens.HoverLabelColor (filled keeps on-surface-variant).
        label: 'group-data-[field-state=hover]/field:text-on-surface',
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
    // A text area keeps its height and scrolls (M3: "a fixed height and scroll vertically").
    fixedHeight: {
      true: { input: 'overflow-y-auto' },
      false: {},
    },
    // M3: supporting text can be "visible only on focus". It keeps its space, so nothing
    // jumps, and stays in the accessible description.
    supportingTextOnFocus: {
      true: {
        supportingText: [
          'opacity-0 transition-opacity group-data-focused/field:opacity-100',
          effectsTransition,
        ],
      },
      false: {},
    },
  },
  compoundVariants: [
    /*
     * Input padding: filled fields with a label leave room above for the floated label.
     * Below 52px (density -2 and -3) there is no room for it: as MDC's text field
     * (`$minimum-height-for-filled-label: 52px`), the floated label is hidden and the value
     * is centred like a field without a label. The resting label still shows in the empty
     * field, and still names the input. `--m3-field-label-room` is 1 down to density -1
     * and 0 from -2 (a clamped step of the density, so CSS alone switches the layout).
     */
    {
      variant: 'filled',
      hasLabel: true,
      class: {
        container: '[--m3-field-label-room:clamp(0,calc((var(--md-sys-density,0)+1.5)*100),1)]',
        field: [
          'pt-[calc(16px+var(--md-sys-density,0)*2px+8px*var(--m3-field-label-room))]',
          'pb-[calc(16px+var(--md-sys-density,0)*2px-8px*var(--m3-field-label-room))]',
        ],
      },
    },
    {
      variant: 'filled',
      hasLabel: false,
      class: { field: 'py-[calc(16px+var(--md-sys-density,0)*2px)]' },
    },
    { variant: 'outlined', class: { field: 'py-[calc(16px+var(--md-sys-density,0)*2px)]' } },
    // Floated label: filled → 8px from the top (less 2px per density step); outlined → centred on the border, at 16px.
    {
      variant: 'filled',
      hasLabel: true,
      class: {
        label: [
          'group-data-floated/field:top-[calc(8px+var(--md-sys-density,0)*2px)] group-data-floated/field:text-body-small',
          'group-has-[:autofill]/field:top-[calc(8px+var(--md-sys-density,0)*2px)] group-has-[:autofill]/field:text-body-small',
          // Hidden once floated below 52px (see the padding above).
          'group-data-floated/field:opacity-[var(--m3-field-label-room)] group-has-[:autofill]/field:opacity-[var(--m3-field-label-room)]',
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
        // The placeholder fades in as the label floats (Compose fades it on FastEffects).
        input: [
          'placeholder:opacity-0 group-data-floated/field:placeholder:opacity-100',
          'placeholder:transition-opacity placeholder:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] placeholder:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
        affix: [
          'opacity-0 transition-opacity group-data-floated/field:opacity-100 group-has-[:autofill]/field:opacity-100',
          effectsTransition,
        ],
      },
    },
  ],
  defaultVariants: {
    variant: 'filled',
    hasLabel: true,
    hasLeadingIcon: false,
    hasTrailingIcon: false,
    multiline: false,
    fixedHeight: false,
    supportingTextOnFocus: false,
  },
});

export type TextFieldStyleProps = VariantProps<typeof textFieldStyles>;
export type TextFieldVariant = NonNullable<TextFieldStyleProps['variant']>;
