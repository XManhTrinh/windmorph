import { tv, type VariantProps } from '../../utils/tv';
import { buttonVariantClasses } from '../button/button-styles';

/*
 * Values follow the M3 Expressive split button specs and Compose's
 * SplitButton{XSmall…XLarge}Tokens (2026-10-13):
 *
 * - Two buttons 2px apart, each at least 48px wide, with full outer corners. Inner corners
 *   are 4 / 4 / 4 / 8 / 12px (XS–XL) and change to 8 / 12 / 12 / 20 / 20px when hovered,
 *   keyboard-focused or pressed ("The inner corners change shape for hovered, focused, and
 *   pressed states"). Corners move on the fast spatial spring (`container-motion`).
 * - XS and S halves are shorter than 48px, so each gets a 48px touch target.
 * - Leading padding 12/10, 16/12, 24, 48, 64px; trailing 13, 13, 15, 29, 43px with a 22 /
 *   22 / 26 / 38 / 50px icon. Padding counts from the container's edge: an outlined half
 *   takes its outline (`--m3-button-border`, as on Button) out of it.
 * - While its menu is open the trailing button is a circle with a persistent 10% layer
 *   of its content colour (Compose draws the outline at the pressed state-layer alpha).
 * - The trailing icon is optically centred, −1 / −1 / −2 / −3 / −6px from the centre at
 *   rest (the spec's "Menu icon offset when unselected"), −1 / −1 / −2 / −3 / −5px pressed
 *   (Compose) and centred when open.
 * - The icon turns over inwards (towards the leading button, so the other way in RTL) on
 *   the standard scheme's fast spatial spring whatever the active scheme ("The split
 *   button uses the standard motion scheme … when rotating the menu button"): the icon
 *   carries `data-motion="standard"`.
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
    // Library-owned inner wrappers: they hold the touch targets, never consumer layout.
    content: 'relative inline-flex min-w-0 items-center justify-center',
    trailingContent: 'relative inline-flex items-center justify-center',
    label: 'min-w-0',
    icon: 'inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
    // The checked layer is the state layer's menu-open layer (`MenuTrigger` sets
    // `data-menu-open`), which adds to the hover and focus layers.
    trailing: half,
    // Optically centred: offset by --m3-optical (logical, so it mirrors in RTL).
    menuIcon: [
      'relative start-(--m3-optical) inline-flex shrink-0 items-center justify-center [&>svg]:size-full',
      '[transition-property:inset-inline-start,rotate]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
      'in-data-open:ltr:rotate-180 in-data-open:rtl:-rotate-180',
    ],
  },
  variants: {
    variant,
    size: {
      xs: {
        leading: [
          'h-[32px] ps-[calc(12px-var(--m3-button-border,0px))] pe-[calc(10px-var(--m3-button-border,0px))] text-label-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),16px)] rounded-e-corner-extra-small',
          'data-hovered:rounded-e-corner-small data-focus-visible:rounded-e-corner-small data-pressed:rounded-e-corner-small',
        ],
        content: 'gap-[8px]',
        icon: 'size-[20px]',
        trailing: [
          'h-[32px] ps-[calc(13px-var(--m3-button-border,0px))] pe-[calc(13px-var(--m3-button-border,0px))]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),16px)] rounded-s-corner-extra-small',
          'not-data-open:data-hovered:rounded-s-corner-small not-data-open:data-focus-visible:rounded-s-corner-small data-pressed:rounded-s-corner-small',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),16px)]',
          '[--m3-optical:-1px] data-pressed:[--m3-optical:-1px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[22px]',
      },
      sm: {
        leading: [
          'h-[40px] ps-[calc(16px-var(--m3-button-border,0px))] pe-[calc(12px-var(--m3-button-border,0px))] text-label-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),20px)] rounded-e-corner-extra-small',
          'data-hovered:rounded-e-corner-medium data-focus-visible:rounded-e-corner-medium data-pressed:rounded-e-corner-medium',
        ],
        content: 'gap-[8px]',
        icon: 'size-[20px]',
        trailing: [
          'h-[40px] ps-[calc(13px-var(--m3-button-border,0px))] pe-[calc(13px-var(--m3-button-border,0px))]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),20px)] rounded-s-corner-extra-small',
          'not-data-open:data-hovered:rounded-s-corner-medium not-data-open:data-focus-visible:rounded-s-corner-medium data-pressed:rounded-s-corner-medium',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
          '[--m3-optical:-1px] data-pressed:[--m3-optical:-1px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[22px]',
      },
      md: {
        leading: [
          'h-[56px] ps-[calc(24px-var(--m3-button-border,0px))] pe-[calc(24px-var(--m3-button-border,0px))] text-title-medium',
          'rounded-s-[min(var(--md-sys-shape-corner-full),28px)] rounded-e-corner-extra-small',
          'data-hovered:rounded-e-corner-medium data-focus-visible:rounded-e-corner-medium data-pressed:rounded-e-corner-medium',
        ],
        content: 'gap-[8px]',
        icon: 'size-[24px]',
        trailing: [
          'h-[56px] ps-[calc(15px-var(--m3-button-border,0px))] pe-[calc(15px-var(--m3-button-border,0px))]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),28px)] rounded-s-corner-extra-small',
          'not-data-open:data-hovered:rounded-s-corner-medium not-data-open:data-focus-visible:rounded-s-corner-medium data-pressed:rounded-s-corner-medium',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),28px)]',
          '[--m3-optical:-2px] data-pressed:[--m3-optical:-2px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[26px]',
      },
      lg: {
        leading: [
          'h-[96px] ps-[calc(48px-var(--m3-button-border,0px))] pe-[calc(48px-var(--m3-button-border,0px))] font-brand text-headline-small',
          'rounded-s-[min(var(--md-sys-shape-corner-full),48px)] rounded-e-corner-small',
          'data-hovered:rounded-e-corner-large-increased data-focus-visible:rounded-e-corner-large-increased data-pressed:rounded-e-corner-large-increased',
        ],
        content: 'gap-[12px]',
        icon: 'size-[32px]',
        trailing: [
          'h-[96px] ps-[calc(29px-var(--m3-button-border,0px))] pe-[calc(29px-var(--m3-button-border,0px))]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),48px)] rounded-s-corner-small',
          'not-data-open:data-hovered:rounded-s-corner-large-increased not-data-open:data-focus-visible:rounded-s-corner-large-increased data-pressed:rounded-s-corner-large-increased',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),48px)]',
          '[--m3-optical:-3px] data-pressed:[--m3-optical:-3px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[38px]',
      },
      xl: {
        leading: [
          'h-[136px] ps-[calc(64px-var(--m3-button-border,0px))] pe-[calc(64px-var(--m3-button-border,0px))] font-brand text-headline-large',
          'rounded-s-[min(var(--md-sys-shape-corner-full),68px)] rounded-e-corner-medium',
          'data-hovered:rounded-e-corner-large-increased data-focus-visible:rounded-e-corner-large-increased data-pressed:rounded-e-corner-large-increased',
        ],
        content: 'gap-[16px]',
        icon: 'size-[40px]',
        trailing: [
          'h-[136px] ps-[calc(43px-var(--m3-button-border,0px))] pe-[calc(43px-var(--m3-button-border,0px))]',
          'rounded-e-[min(var(--md-sys-shape-corner-full),68px)] rounded-s-corner-medium',
          'not-data-open:data-hovered:rounded-s-corner-large-increased not-data-open:data-focus-visible:rounded-s-corner-large-increased data-pressed:rounded-s-corner-large-increased',
          'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),68px)]',
          '[--m3-optical:-6px] data-pressed:[--m3-optical:-5px] data-open:not-data-pressed:[--m3-optical:0px]',
        ],
        menuIcon: 'size-[50px]',
      },
    },
  },
  compoundVariants: [
    // Outline width grows with size, as on Button.
    {
      variant: 'outlined',
      size: 'lg',
      class: { leading: '[--m3-button-border:2px]', trailing: '[--m3-button-border:2px]' },
    },
    {
      variant: 'outlined',
      size: 'xl',
      class: { leading: '[--m3-button-border:3px]', trailing: '[--m3-button-border:3px]' },
    },
  ],
  defaultVariants: { variant: 'filled', size: 'sm' },
});

export type SplitButtonStyleProps = VariantProps<typeof splitButtonStyles>;
export type SplitButtonVariant = NonNullable<SplitButtonStyleProps['variant']>;
export type SplitButtonSize = NonNullable<SplitButtonStyleProps['size']>;
