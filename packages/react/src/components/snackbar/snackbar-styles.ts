import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (Snackbar.kt with its styling fix, SnackbarHost.kt,
 * SnackbarTokens): `inverse-surface` at level 3 with 4px corners, up to 600px wide and at
 * least 48px tall, `body-medium` `inverse-on-surface` text with 16px before it and 14px
 * above and below, an `inverse-primary` text-button action and an `inverse-on-surface`
 * dismiss icon button; 8px after the action when there is no dismiss button. On a new
 * line, the actions sit at the end, 4px from the bottom. The host pads each snackbar by
 * 12px and fades it on fast effects while it expands upward from the bottom edge on fast
 * spatial (a clip-path reveal: the spec avoids scale and z-axis motion, and "a snackbar at
 * the bottom of the screen expands upwards"). The clip rests 32px outside the box so the
 * shadow shows; reduced motion keeps only the fade.
 *
 * The colours, corners and shadow come from the snackbar's component tokens
 * (`snackbar-tokens.ts`, `--md-comp-snackbar-*`); the root carries
 * `data-tokens="md-comp-snackbar"`, and the parts read one private variable each. A consumer
 * class (`bg-surface-container`) still wins.
 * Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link Snackbar}; extend them to add variants. */
export const snackbarStyles = tv({
  slots: {
    root: [
      'flex w-full max-w-[600px] min-h-[48px] ps-[16px]',
      'rounded-[var(--_md-comp-snackbar-container-shape)] bg-[var(--_md-comp-snackbar-container-color)]',
      'text-body-medium text-[color:var(--_md-comp-snackbar-supporting-text-color)]',
      'shadow-[shadow:var(--_md-comp-snackbar-container-elevation)]',
    ],
    message: 'min-w-0',
    actions: 'flex shrink-0 items-center',
    action: 'text-[color:var(--_md-comp-snackbar-action-label-text-color)]',
    dismiss: 'text-[color:var(--_md-comp-snackbar-icon-color)]',
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
      'col-start-1 row-start-1 flex w-full justify-center p-[12px] opacity-100',
      '[clip-path:inset(-32px)] starting:[clip-path:inset(100%_-32px_-32px_-32px)] data-exiting:[clip-path:inset(100%_-32px_-32px_-32px)]',
      '[transition-property:opacity,clip-path] motion-reduce:[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      'starting:opacity-0 data-exiting:opacity-0',
    ],
  },
});

export type SnackbarStyleProps = VariantProps<typeof snackbarStyles>;
