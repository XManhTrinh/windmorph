import { tv, type VariantProps } from '../../utils/tv';
import { buttonVariantClasses } from '../button/button-styles';

/*
 * Values follow Compose Material 3 (SplitButton.kt, SplitButton{XSmall…XLarge}Tokens):
 *
 * - Two buttons 2px apart, each at least 48px wide, with full outer corners. Inner corners
 *   are 4 / 4 / 4 / 8 / 12px (XS–XL) and press to 8 / 12 / 12 / 20 / 20px; the code uses
 *   the pressed corners only (the hovered tokens are unused). Corners animate on the
 *   effects default spring.
 * - Leading padding 12/10, 16/12, 24, 48, 64px; trailing 13, 13, 15, 29, 43px with a 22 /
 *   22 / 26 / 38 / 50px icon.
 * - While its menu is open the trailing button is a circle with a persistent 10% layer
 *   of its content colour (Compose draws the outline at the pressed state-layer alpha).
 * - The trailing icon is optically centred: Compose shifts it by 0.11 × (start − end
 *   corner) of the current shape, rounded: −1 / −2 / −3 / −4 / −6px at rest, −1 / −1 /
 *   −2 / −3 / −5px pressed and 0 when round.
 *
 * Label type and icon sizes follow the Button scale per size; Compose's split button
 * provides `label-large` and leaves larger text to the caller. Every class is written out
 * in full so Tailwind can find it.
 */

const half = [
  'inline-flex shrink-0 cursor-pointer items-center justify-center align-middle min-w-[48px]',
  'font-plain whitespace-nowrap select-none',
  'state-layer focus-ring container-motion',
  'data-disabled:cursor-default data-disabled:text-on-surface-variant/38 data-disabled:shadow-elevation-0',
];

const variant = {
  filled: { leading: buttonVariantClasses.filled, trailing: buttonVariantClasses.filled },
  elevated: { leading: buttonVariantClasses.elevated, trailing: buttonVariantClasses.elevated },
  tonal: { leading: buttonVariantClasses.tonal, trailing: buttonVariantClasses.tonal },
  outlined: { leading: buttonVariantClasses.outlined, trailing: buttonVariantClasses.outlined },
} as const;

/** Variant definitions for {@link SplitButton}; extend them to add variants. */
export const splitButtonStyles = tv({
  slots: {
    root: 'inline-flex items-center gap-[2px]',
    leading: half,
    // Library-owned inner wrapper of the leading button.
    content: 'inline-flex min-w-0 items-center justify-center',
    label: 'min-w-0',
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
    trailing: [
      ...half,
      // The checked layer: a full-cover inset shadow, so it composes with elevation.
      'data-open:not-data-disabled:inset-shadow-[0_0_0_999px_color-mix(in_srgb,currentColor_10%,transparent)]',
    ],
    // Optically centred: offset by --m3-optical (logical, so it mirrors in RTL).
    menuIcon: [
      'relative start-(--m3-optical) inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
      '[transition-property:inset-inline-start,rotate]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'in-data-open:rotate-180',
    ],
  },
  variants: {
    variant,
    size: {
      xs: {
        leading: [
          'h-[32px] ps-[12px] pe-[10px] text-label-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),16px)] rounded-e-corner-extra-small data-pressed:rounded-e-corner-small',
        ],
        content: 'gap-[4px]',
        icon: 'size-[20px]',
        trailing: [
          'h-[32px] ps-[13px] pe-[13px]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),16px)] rounded-s-corner-extra-small data-pressed:rounded-s-corner-small',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),16px)]',
          '[--m3-optical:-1px] data-pressed:[--m3-optical:-1px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[22px]',
      },
      sm: {
        leading: [
          'h-[40px] ps-[16px] pe-[12px] text-label-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),20px)] rounded-e-corner-extra-small data-pressed:rounded-e-corner-medium',
        ],
        content: 'gap-[8px]',
        icon: 'size-[20px]',
        trailing: [
          'h-[40px] ps-[13px] pe-[13px]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),20px)] rounded-s-corner-extra-small data-pressed:rounded-s-corner-medium',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
          '[--m3-optical:-2px] data-pressed:[--m3-optical:-1px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[22px]',
      },
      md: {
        leading: [
          'h-[56px] ps-[24px] pe-[24px] text-title-medium',
          'rounded-s-[min(var(--md-sys-shape-corner-full),28px)] rounded-e-corner-extra-small data-pressed:rounded-e-corner-medium',
        ],
        content: 'gap-[8px]',
        icon: 'size-[24px]',
        trailing: [
          'h-[56px] ps-[15px] pe-[15px]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),28px)] rounded-s-corner-extra-small data-pressed:rounded-s-corner-medium',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),28px)]',
          '[--m3-optical:-3px] data-pressed:[--m3-optical:-2px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[26px]',
      },
      lg: {
        leading: [
          'h-[96px] ps-[48px] pe-[48px] font-brand text-headline-small',
          'rounded-s-[min(var(--md-sys-shape-corner-full),48px)] rounded-e-corner-small data-pressed:rounded-e-corner-large-increased',
        ],
        content: 'gap-[12px]',
        icon: 'size-[32px]',
        trailing: [
          'h-[96px] ps-[29px] pe-[29px]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),48px)] rounded-s-corner-small data-pressed:rounded-s-corner-large-increased',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),48px)]',
          '[--m3-optical:-4px] data-pressed:[--m3-optical:-3px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[38px]',
      },
      xl: {
        leading: [
          'h-[136px] ps-[64px] pe-[64px] font-brand text-headline-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),68px)] rounded-e-corner-medium data-pressed:rounded-e-corner-large-increased',
        ],
        content: 'gap-[16px]',
        icon: 'size-[40px]',
        trailing: [
          'h-[136px] ps-[43px] pe-[43px]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),68px)] rounded-s-corner-medium data-pressed:rounded-s-corner-large-increased',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),68px)]',
          '[--m3-optical:-6px] data-pressed:[--m3-optical:-5px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[50px]',
      },
    },
  },
  compoundVariants: [
    // Outline width grows with size, as on Button.
    { variant: 'outlined', size: 'lg', class: { leading: 'border-2', trailing: 'border-2' } },
    { variant: 'outlined', size: 'xl', class: { leading: 'border-3', trailing: 'border-3' } },
  ],
  defaultVariants: { variant: 'filled', size: 'sm' },
});

export type SplitButtonStyleProps = VariantProps<typeof splitButtonStyles>;
export type SplitButtonVariant = NonNullable<SplitButtonStyleProps['variant']>;
export type SplitButtonSize = NonNullable<SplitButtonStyleProps['size']>;
