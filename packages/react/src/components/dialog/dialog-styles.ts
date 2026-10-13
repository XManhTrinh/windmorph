import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (AlertDialog.kt and DialogTokens): 280–560px wide (the
 * minimum capped by the window's 24px margins), 24px padding, 28px corners,
 * surface-container-high at elevation 3, a 24px secondary icon and the title 16px apart, the
 * title centred when there is an icon, 24px below the supporting text, 8px between actions,
 * and stacked actions with the confirming action on top. Optional dividers above and below
 * the content are 1px `outline-variant`. The scrim is `scrim` at 32% (M3). Compose has no
 * dialog motion of its own (the platform animates windows); the spec avoids scale and z-axis
 * motion, so here the scrim fades and the panel fades while it expands away from the window
 * edge it sits against (a clip-path reveal resting 32px outside the panel, so the shadow
 * shows; `--m3-dialog-collapsed` is the collapsed clip) on the default springs entering and
 * the fast springs leaving, on a library-owned wrapper. Reduced motion keeps only the fades.
 * The positioner keeps 24px from the window's edges on compact windows and the spec's 56px
 * on wider ones, and `placement` aligns the dialog in it.
 *
 * Full-screen dialogs follow the M3 dialog spec's full-screen type: the panel fills the
 * window on `surface-container-high` with no corners, elevation or padding; a 56px header
 * holds the `on-surface` close icon button, the `title-large` headline and the confirming
 * text button (with an optional `outline-variant` divider), and the content is padded 24px
 * at the top and sides. With a header action `DialogActions` are hidden; without one they
 * form a 56px bottom action bar. The panel slides up 48px and fades in on the slow springs
 * (the spec's speed for full-screen animations), or, with an `origin`, grows out of it (a
 * container transform). `fullScreen: 'compact'` applies all of this only below 600px (the M3
 * compact window class) and is a basic dialog otherwise. Every class is written out in full.
 */

/** Variant definitions for {@link Dialog} and its parts. */
export const dialogStyles = tv({
  slots: {
    scrim: [
      'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
      'starting:opacity-0',
      'data-exiting:opacity-0',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    positioner: 'fixed inset-0 z-(--md-sys-z-dialog) flex p-[24px] medium:p-[56px]',
    motion: [
      'flex max-h-full max-w-full opacity-100 [clip-path:inset(-32px)]',
      '[--m3-dialog-collapsed:inset(-32px_-32px_100%_-32px)]',
      '[transition-property:opacity,clip-path] motion-reduce:[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing),var(--md-sys-motion-spring-spatial-default-easing)]',
      'starting:opacity-0 starting:[clip-path:var(--m3-dialog-collapsed)]',
      'data-exiting:opacity-0 data-exiting:[clip-path:var(--m3-dialog-collapsed)]',
      'motion-reduce:starting:[clip-path:inset(-32px)] motion-reduce:data-exiting:[clip-path:inset(-32px)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
    ],
    panel: [
      'flex max-h-full min-w-[min(280px,calc(100vw-48px))] max-w-[560px] flex-col p-[24px]',
      'rounded-corner-extra-large bg-surface-container-high text-on-surface shadow-elevation-3',
      'outline-none',
    ],
    icon: 'mx-auto inline-flex pb-[16px] text-secondary [&>svg]:size-[24px]',
    title: 'pb-[16px] text-headline-small font-brand text-on-surface',
    header: '',
    headerButton: '',
    close: '[--md-comp-icon-button-icon-color:var(--md-sys-color-on-surface)]',
    content: [
      'min-h-0 flex-1 overflow-y-auto pb-[24px] text-body-medium text-on-surface-variant',
      'focus-ring',
    ],
    actions: 'flex flex-wrap-reverse items-center justify-end gap-[8px]',
  },
  variants: {
    hasIcon: {
      true: { title: 'text-center' },
      false: { title: 'text-start' },
    },
    /*
     * The panel expands away from the window edge it sits against (the spec's enter and
     * exit pattern): downward when centred or at the top, upward at the bottom, and along
     * the x axis from the start or end edge. Reduced motion keeps the clip open.
     */
    placement: {
      center: { positioner: 'items-center justify-center' },
      top: { positioner: 'items-start justify-center' },
      bottom: {
        positioner: 'items-end justify-center',
        motion: '[--m3-dialog-collapsed:inset(100%_-32px_-32px_-32px)]',
      },
      start: {
        positioner: 'items-center justify-start',
        motion: [
          '[--m3-dialog-collapsed:inset(-32px_100%_-32px_-32px)]',
          'rtl:[--m3-dialog-collapsed:inset(-32px_-32px_-32px_100%)]',
        ],
      },
      end: {
        positioner: 'items-center justify-end',
        motion: [
          '[--m3-dialog-collapsed:inset(-32px_-32px_-32px_100%)]',
          'rtl:[--m3-dialog-collapsed:inset(-32px_100%_-32px_-32px)]',
        ],
      },
    },
    fullScreen: {
      never: { headerButton: 'hidden' },
      always: {
        positioner: 'p-0 medium:p-0',
        motion: [
          'size-full translate-none [clip-path:none] [transition-property:opacity,translate]',
          'starting:translate-y-[48px] starting:[clip-path:none]',
          'data-exiting:translate-y-[48px] data-exiting:[clip-path:none]',
          'motion-reduce:data-exiting:translate-none',
          '[transition-duration:var(--md-sys-motion-spring-effects-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
        ],
        panel: 'size-full max-h-none max-w-none rounded-none p-0 shadow-none',
        header: 'flex h-[56px] shrink-0 items-center gap-[4px] ps-[4px] pe-[12px]',
        title: 'min-w-0 flex-1 truncate ps-[4px] pb-0 text-start text-title-large',
        content: 'px-[24px] pt-[24px]',
        actions: 'hidden',
      },
      compact: {
        positioner: 'max-medium:p-0',
        motion: [
          'max-medium:size-full max-medium:translate-none max-medium:[clip-path:none]',
          'max-medium:[transition-property:opacity,translate]',
          'max-medium:motion-reduce:[transition-property:opacity]',
          'max-medium:[transition-duration:var(--md-sys-motion-spring-effects-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          'max-medium:[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
          'max-medium:starting:translate-y-[48px] max-medium:starting:[clip-path:none]',
          'max-medium:data-exiting:translate-y-[48px] max-medium:data-exiting:[clip-path:none]',
          'max-medium:motion-reduce:data-exiting:translate-none',
        ],
        panel: [
          'max-medium:size-full max-medium:max-h-none max-medium:max-w-none',
          'max-medium:rounded-none max-medium:p-0 max-medium:shadow-none',
        ],
        header: [
          'max-medium:flex max-medium:h-[56px] max-medium:shrink-0 max-medium:items-center',
          'max-medium:gap-[4px] max-medium:ps-[4px] max-medium:pe-[12px]',
        ],
        headerButton: 'medium:hidden',
        title: [
          'max-medium:min-w-0 max-medium:flex-1 max-medium:truncate max-medium:ps-[4px]',
          'max-medium:pb-0 max-medium:text-start max-medium:text-title-large',
        ],
        content: 'max-medium:px-[24px] max-medium:pt-[24px]',
        actions: 'max-medium:hidden',
      },
    },
    /** Full screen without a header action: the actions form a 56px bottom bar. */
    bottomBar: { true: {}, false: {} },
    /** A divider under the full-screen header. */
    divider: { true: {}, false: {} },
  },
  compoundVariants: [
    {
      fullScreen: 'always',
      bottomBar: true,
      class: { actions: 'flex h-[56px] shrink-0 flex-nowrap px-[24px]' },
    },
    {
      fullScreen: 'compact',
      bottomBar: true,
      class: {
        actions:
          'max-medium:flex max-medium:h-[56px] max-medium:shrink-0 max-medium:flex-nowrap max-medium:px-[24px]',
      },
    },
    {
      fullScreen: 'always',
      divider: true,
      class: { header: 'border-b border-outline-variant' },
    },
    {
      fullScreen: 'compact',
      divider: true,
      class: { header: 'max-medium:border-b max-medium:border-outline-variant' },
    },
  ],
  defaultVariants: {
    hasIcon: false,
    fullScreen: 'never',
    placement: 'center',
    bottomBar: false,
    divider: false,
  },
});

export type DialogStyleProps = VariantProps<typeof dialogStyles>;
