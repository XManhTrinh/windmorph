import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Snackbar.kt with its styling fix, SnackbarHost.kt,
 * SnackbarTokens): `inverse-surface` at level 3 with 4px corners, up to 600px wide and at
 * least 48px tall, `body-medium` `inverse-on-surface` text with 16px before it and 14px
 * above and below, an `inverse-primary` text-button action and an `inverse-on-surface`
 * dismiss icon button; 8px after the action when there is no dismiss button. On a new
 * line, the actions sit at the end, 4px from the bottom. The host pads each snackbar by
 * 12px and fades it on fast effects while scaling it from 80% on fast spatial.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Snackbar}; extend them to add variants. */
export const snackbarStyles = tv({
  slots: {
    root: [
      'flex w-full max-w-[600px] min-h-[48px] ps-[16px]',
      'rounded-corner-extra-small bg-inverse-surface text-body-medium text-inverse-on-surface shadow-elevation-3',
    ],
    message: 'min-w-0',
    actions: 'flex shrink-0 items-center',
    action: 'text-inverse-primary',
    dismiss: 'text-inverse-on-surface',
  },
  variants: {
    newLine: {
      false: { root: 'items-center', message: 'flex-1 py-[14px]' },
      true: {
        root: 'flex-col',
        message: 'py-[14px] pe-[16px]',
        actions: 'self-end pb-[4px]',
      },
    },
    dismissible: { true: {}, false: {} },
  },
  compoundVariants: [
    { newLine: false, dismissible: false, class: { root: 'pe-[8px]', message: 'pe-[8px]' } },
    { newLine: true, dismissible: false, class: { actions: 'pe-[8px]' } },
  ],
  defaultVariants: { newLine: false, dismissible: false },
});

/** Variant definitions for {@link SnackbarHost}. */
export const snackbarHostStyles = tv({
  slots: {
    root: 'grid justify-items-center',
    item: [
      'col-start-1 row-start-1 flex w-full justify-center p-[12px] opacity-100 scale-none',
      '[transition-property:opacity,scale]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      'starting:scale-80 starting:opacity-0 data-exiting:scale-80 data-exiting:opacity-0',
    ],
  },
});

export type SnackbarStyleProps = VariantProps<typeof snackbarStyles>;
