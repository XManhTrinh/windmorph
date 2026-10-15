import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (AlertDialog.kt and DialogTokens): 280–560px wide (the
 * minimum capped by the window's 24px margins), 24px padding, 28px corners,
 * surface-container-high at elevation 3, a 24px secondary icon and the title 16px apart, the
 * title centred when there is an icon, 24px below the supporting text, 8px between actions,
 * and stacked actions with the confirming action on top. Optional dividers above and below
 * the content are 1px `outline-variant`. The scrim is `scrim` at 32% (M3).
 *
 * Motion (2026-10-14): Compose has no dialog motion of its own (the platform animates
 * windows), so the basic dialog follows the M3 dialog enter and exit as Material Web encodes
 * it, mapped onto the M3 Expressive springs (spatial for movement and size, effects for
 * opacity). Entering, the dialog slides 50px away from the window edge it sits against
 * (downward when centred), its container grows from that edge from 0 to its full size (a
 * clip on a library-owned wrapper, so text is never shown outside the container and the
 * spec's 0 start is kept), and it fades in on the fast effects spring while the scrim fades
 * in on the slow one; the headline, icon and supporting text fade in after 50ms and the
 * actions after 150ms. Leaving follows the reference's close timing exactly, on M3's
 * emphasized-accelerate easing and duration tokens: the parts fade out over 100ms, the
 * dialog slides back 50px and its container shrinks to 35% over 150ms (slow at first, so
 * it is still moving and shrinking until it is gone), the container fades out from 100ms to
 * 150ms, and the scrim fades out over 150ms. Reduced motion keeps only the
 * fades of the dialog and the scrim; `quick` turns all of it off.
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
 * compact window class) and is a basic dialog otherwise.
 *
 * The basic dialog's container colour, corners and shadow, and the icon, title and supporting
 * text colours, come from the dialog's component tokens (`dialog-tokens.ts`,
 * `--md-comp-dialog-*`); the panel carries `data-tokens="md-comp-dialog"`, and the parts read
 * one private variable each. A full-screen panel keeps its own `surface-container-high`. A
 * consumer class (`bg-surface-container`) still wins. Every class is written out in full.
 */

/** The dialog root's placement, inline so it wins over consumer layout classes. */
export const DIALOG_ROOT_STYLE = { position: 'fixed', inset: 0 } as const;

/** Variant definitions for {@link Dialog} and its parts. */
export const dialogStyles = tv({
  slots: {
    scrim: [
      'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
      '[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-slow-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing)]',
      'starting:opacity-0',
      'data-exiting:opacity-0',
      'data-exiting:[transition-duration:var(--md-sys-motion-duration-short-3)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-easing-linear)]',
    ],
    // The dialog's outermost element, which takes the consumer's `className` and `style`. It
    // covers the window through an inline `position: fixed; inset: 0` (`DIALOG_ROOT_STYLE`),
    // which a consumer class can't move: a layout class such as `static` or `absolute top-24`
    // never puts the dialog in the page's flow or out of the window.
    root: 'z-(--md-sys-z-dialog)',
    positioner: 'fixed inset-0 z-(--md-sys-z-dialog) flex p-[24px] medium:p-[56px]',
    /*
     * The library-owned wrapper that moves: it slides 50px (`--m3-dialog-slide`), its clip
     * grows the container (`--m3-dialog-enter-clip` → `--m3-dialog-open-clip`, which rests
     * 32px outside the panel so the shadow shows, its corners concentric with the panel's
     * `--m3-dialog-corner`) and it fades. Leaving, the clip shrinks to 35%
     * (`--m3-dialog-exit-clip`) and the fade waits 100ms for the parts to fade first. The
     * exit uses the reference's curves rather than springs (2026-10-14): the slide and shrink
     * run 150ms on emphasized-accelerate, which never overshoots and keeps moving until the
     * fade (50ms, linear, after 100ms) has ended. A spring front-loads the motion: the
     * expressive spatial one overshot past 50px and below 35%, and the critically damped
     * effects one finished shrinking before the fade, leaving a still 35% box fading. The
     * clip's sides open from the panel's edges to the shadow's 32px together with its corner
     * radius, so the growing edge keeps the panel's corners on every frame.
     */
    motion: [
      'flex max-h-full max-w-full',
      '[--m3-dialog-corner:var(--md-comp-dialog-container-shape,var(--md-sys-shape-corner-extra-large))]',
      '[--m3-dialog-open-clip:inset(-32px_round_calc(var(--m3-dialog-corner)_+_32px))]',
      '[--m3-dialog-enter-clip:inset(0_0_100%_round_var(--m3-dialog-corner))]',
      '[--m3-dialog-exit-clip:inset(0_0_65%_round_var(--m3-dialog-corner))]',
      '[--m3-dialog-slide:0_-50px] [--m3-dialog-scale-origin:center]',
      'translate-none opacity-100 [clip-path:var(--m3-dialog-open-clip)]',
      'starting:[translate:var(--m3-dialog-slide)] starting:opacity-0',
      'starting:[clip-path:var(--m3-dialog-enter-clip)]',
      'data-exiting:[translate:var(--m3-dialog-slide)] data-exiting:opacity-0',
      'data-exiting:[clip-path:var(--m3-dialog-exit-clip)]',
      'motion-reduce:data-exiting:translate-none',
      'motion-reduce:data-exiting:[clip-path:var(--m3-dialog-open-clip)]',
      '[transition-property:opacity,translate,clip-path] motion-reduce:[transition-property:opacity]',
      '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-default-easing),var(--md-sys-motion-spring-spatial-default-easing)]',
      'data-exiting:[transition-duration:var(--md-sys-motion-duration-short-1),var(--md-sys-motion-duration-short-3),var(--md-sys-motion-duration-short-3)]',
      'data-exiting:[transition-timing-function:var(--md-sys-motion-easing-linear),var(--md-sys-motion-easing-emphasized-accelerate),var(--md-sys-motion-easing-emphasized-accelerate)]',
      'data-exiting:[transition-delay:var(--md-sys-motion-duration-short-2),0s,0s]',
      'motion-reduce:data-exiting:[transition-delay:0s]',
      'motion-reduce:data-exiting:[transition-duration:var(--md-sys-motion-duration-short-3)]',
    ],
    /*
     * Classes for the panel that stagger its parts (its children): every part fades in after
     * 50ms on the default effects spring (the headline, icon and supporting text, and any
     * custom child), and the actions (`data-slot="actions"`) after 150ms on the fast one.
     * Leaving, they all fade out at once on the fast spring. Basic dialogs only (see the
     * `fullScreen` variants); reduced motion leaves the parts to the wrapper's fade.
     */
    parts: '',
    panel: [
      'flex max-h-full min-w-[min(280px,calc(100vw-48px))] max-w-[560px] flex-col p-[24px]',
      'rounded-[var(--_md-comp-dialog-container-shape)] bg-[var(--_md-comp-dialog-container-color)]',
      'text-on-surface shadow-[shadow:var(--_md-comp-dialog-container-elevation)]',
      'outline-none',
    ],
    icon: [
      'mx-auto inline-flex pb-[16px] [&>svg]:size-[24px]',
      'text-[color:var(--_md-comp-dialog-with-icon-icon-color)]',
    ],
    title: [
      'pb-[16px] text-headline-small font-brand',
      'text-[color:var(--_md-comp-dialog-headline-color)]',
    ],
    header: '',
    headerButton: '',
    close: '[--md-comp-icon-button-icon-color:var(--md-sys-color-on-surface)]',
    content: [
      'min-h-0 flex-1 overflow-y-auto pb-[24px] text-body-medium',
      'text-[color:var(--_md-comp-dialog-supporting-text-color)]',
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
     * The dialog enters from the window edge it sits against (the spec's enter and exit
     * pattern): it slides 50px away from that edge while its container grows away from it,
     * and leaves the same way back. Centred or at the top it slides down and grows downward
     * (the reference motion), at the bottom it slides up and grows upward, and at the start
     * or end it moves and grows along the x axis, mirrored in right-to-left layouts.
     */
    placement: {
      center: { positioner: 'items-center justify-center' },
      top: {
        positioner: 'items-start justify-center',
        motion: '[--m3-dialog-scale-origin:top]',
      },
      bottom: {
        positioner: 'items-end justify-center',
        motion: [
          '[--m3-dialog-enter-clip:inset(100%_0_0_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-exit-clip:inset(65%_0_0_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-slide:0_50px] [--m3-dialog-scale-origin:bottom]',
        ],
      },
      start: {
        positioner: 'items-center justify-start',
        motion: [
          '[--m3-dialog-enter-clip:inset(0_100%_0_0_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-exit-clip:inset(0_65%_0_0_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-slide:-50px_0] [--m3-dialog-scale-origin:left]',
          'rtl:[--m3-dialog-enter-clip:inset(0_0_0_100%_round_var(--m3-dialog-corner))]',
          'rtl:[--m3-dialog-exit-clip:inset(0_0_0_65%_round_var(--m3-dialog-corner))]',
          'rtl:[--m3-dialog-slide:50px_0] rtl:[--m3-dialog-scale-origin:right]',
        ],
      },
      end: {
        positioner: 'items-center justify-end',
        motion: [
          '[--m3-dialog-enter-clip:inset(0_0_0_100%_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-exit-clip:inset(0_0_0_65%_round_var(--m3-dialog-corner))]',
          '[--m3-dialog-slide:50px_0] [--m3-dialog-scale-origin:right]',
          'rtl:[--m3-dialog-enter-clip:inset(0_100%_0_0_round_var(--m3-dialog-corner))]',
          'rtl:[--m3-dialog-exit-clip:inset(0_65%_0_0_round_var(--m3-dialog-corner))]',
          'rtl:[--m3-dialog-slide:-50px_0] rtl:[--m3-dialog-scale-origin:left]',
        ],
      },
    },
    fullScreen: {
      never: {
        headerButton: 'hidden',
        parts: [
          'motion-safe:*:starting:opacity-0 motion-safe:data-exiting:*:opacity-0',
          '*:[transition-property:opacity]',
          '*:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          '*:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
          '*:[transition-delay:var(--md-sys-motion-duration-short-1)]',
          '*:data-[slot=actions]:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          '*:data-[slot=actions]:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
          '*:data-[slot=actions]:[transition-delay:var(--md-sys-motion-duration-short-3)]',
          'data-exiting:*:[transition-duration:var(--md-sys-motion-duration-short-2)]',
          'data-exiting:*:[transition-timing-function:var(--md-sys-motion-easing-linear)]',
          'data-exiting:*:[transition-delay:0s] data-exiting:*:data-[slot=actions]:[transition-delay:0s]',
          'data-exiting:*:data-[slot=actions]:[transition-duration:var(--md-sys-motion-duration-short-2)]',
          'data-exiting:*:data-[slot=actions]:[transition-timing-function:var(--md-sys-motion-easing-linear)]',
        ],
      },
      /*
       * Full screen keeps its own motion: the dialog slides up 48px as it fades in on the slow
       * springs (the spec's speed for full-screen motion) with no clip, and slides back down
       * as it fades out on the fast ones, its parts fading with it.
       */
      always: {
        positioner: 'p-0 medium:p-0',
        motion: [
          'size-full [--m3-dialog-slide:0_48px]',
          '[--m3-dialog-open-clip:none] [--m3-dialog-enter-clip:none] [--m3-dialog-exit-clip:none]',
          '[transition-duration:var(--md-sys-motion-spring-effects-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
          'data-exiting:[transition-delay:0s]',
          'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
        panel: [
          'size-full max-h-none max-w-none rounded-none p-0 shadow-none',
          'bg-surface-container-high',
        ],
        header: 'flex h-[56px] shrink-0 items-center gap-[4px] ps-[4px] pe-[12px]',
        title: 'min-w-0 flex-1 truncate ps-[4px] pb-0 text-start text-title-large',
        content: 'px-[24px] pt-[24px]',
        actions: 'hidden',
      },
      compact: {
        positioner: 'max-medium:p-0',
        motion: [
          'max-medium:size-full max-medium:[--m3-dialog-slide:0_48px]',
          'max-medium:[--m3-dialog-open-clip:none] max-medium:[--m3-dialog-enter-clip:none]',
          'max-medium:[--m3-dialog-exit-clip:none]',
          'max-medium:[transition-duration:var(--md-sys-motion-spring-effects-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          'max-medium:[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
          'max-medium:data-exiting:[transition-delay:0s]',
          'max-medium:data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'max-medium:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
        parts: [
          'medium:motion-safe:*:starting:opacity-0 medium:motion-safe:data-exiting:*:opacity-0',
          'medium:*:[transition-property:opacity]',
          'medium:*:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          'medium:*:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
          'medium:*:[transition-delay:var(--md-sys-motion-duration-short-1)]',
          'medium:*:data-[slot=actions]:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'medium:*:data-[slot=actions]:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
          'medium:*:data-[slot=actions]:[transition-delay:var(--md-sys-motion-duration-short-3)]',
          'medium:data-exiting:*:[transition-duration:var(--md-sys-motion-duration-short-2)]',
          'medium:data-exiting:*:[transition-timing-function:var(--md-sys-motion-easing-linear)]',
          'medium:data-exiting:*:[transition-delay:0s]',
          'medium:data-exiting:*:data-[slot=actions]:[transition-delay:0s]',
          'medium:data-exiting:*:data-[slot=actions]:[transition-duration:var(--md-sys-motion-duration-short-2)]',
          'medium:data-exiting:*:data-[slot=actions]:[transition-timing-function:var(--md-sys-motion-easing-linear)]',
        ],
        panel: [
          'max-medium:size-full max-medium:max-h-none max-medium:max-w-none',
          'max-medium:rounded-none max-medium:p-0 max-medium:shadow-none',
          'max-medium:bg-surface-container-high',
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
    /** The basic dialog's optional dividers above and below `DialogContent`. */
    dividers: { true: {}, false: {} },
    /** A container transform from a trigger (`origin`) into the full-screen dialog. */
    origin: { true: {}, false: {} },
    /**
     * The basic dialog's enter and exit: `reveal`, the M3 dialog motion above, or `scale`,
     * the original pop (see the compound variants). Full-screen dialogs ignore it.
     */
    transition: { reveal: {}, scale: {} },
    /** No enter or exit motion: the dialog, its parts and the scrim appear and go at once. */
    quick: {
      true: {
        scrim: '[transition-property:none]!',
        motion: '[transition-property:none]!',
        panel: '[transition-property:none]!',
        parts: '*:[transition-property:none]!',
      },
      false: {},
    },
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
    /*
     * Dividers run the panel's full width, 1px `outline-variant`, with 8px between them and
     * the content; the body keeps 24px to the actions below the bottom one.
     */
    {
      fullScreen: 'never',
      dividers: true,
      class: {
        content: '-mx-[24px] mb-[24px] border-y border-outline-variant px-[24px] py-[8px]',
      },
    },
    {
      fullScreen: 'compact',
      dividers: true,
      class: {
        content: [
          'medium:-mx-[24px] medium:mb-[24px] medium:border-y medium:border-outline-variant',
          'medium:px-[24px] medium:py-[8px]',
        ],
      },
    },
    /*
     * `transition="scale"`, the library's original pop (an extension beyond the M3 dialog
     * motion): the scrim fades on the default effects spring, and the dialog fades in while it
     * scales up from 90% on the default springs, then fades out while it scales to 95% on the
     * fast ones. No clip, no slide, no staggered parts. It scales from the edge it sits
     * against (`--m3-dialog-scale-origin`: the centre for `center`, the top, bottom, start or
     * end edge otherwise). Reduced motion keeps only the fades. Basic dialogs only (from 600px
     * for `compact`).
     */
    {
      fullScreen: 'never',
      transition: 'scale',
      class: {
        scrim: [
          '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
          'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
        motion: [
          '[--m3-dialog-slide:0_0] [--m3-dialog-open-clip:none]',
          '[--m3-dialog-enter-clip:none] [--m3-dialog-exit-clip:none]',
          'origin-(--m3-dialog-scale-origin) scale-none starting:scale-90 data-exiting:scale-95',
          'motion-reduce:data-exiting:scale-none',
          '[transition-property:opacity,scale] motion-reduce:[transition-property:opacity]',
          '[transition-duration:var(--md-sys-motion-spring-effects-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing),var(--md-sys-motion-spring-spatial-default-easing)]',
          'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
          'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
          'data-exiting:[transition-delay:0s]',
        ],
      },
    },
    {
      fullScreen: 'compact',
      transition: 'scale',
      class: {
        scrim: [
          'medium:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
          'medium:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
          'medium:data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'medium:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
        motion: [
          'medium:[--m3-dialog-slide:0_0] medium:[--m3-dialog-open-clip:none]',
          'medium:[--m3-dialog-enter-clip:none] medium:[--m3-dialog-exit-clip:none]',
          'medium:origin-(--m3-dialog-scale-origin) medium:scale-none',
          'medium:starting:scale-90 medium:data-exiting:scale-95',
          'medium:motion-reduce:data-exiting:scale-none',
          'medium:[transition-property:opacity,scale]',
          'medium:motion-reduce:[transition-property:opacity]',
          'medium:[transition-duration:var(--md-sys-motion-spring-effects-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
          'medium:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing),var(--md-sys-motion-spring-spatial-default-easing)]',
          'medium:data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
          'medium:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
          'medium:data-exiting:[transition-delay:0s]',
        ],
      },
    },
    /*
     * Container transform (the spec: "Use a container transform pattern to transition a FAB
     * into a full-screen dialog"): the clip starts on the origin's box and corners
     * (`--m3-dialog-origin`, measured by the dialog) and opens to the window on the slow
     * spatial spring, while the container colour moves from the origin's
     * (`--m3-dialog-origin-color`) and the content fades in. Leaving collapses back into the
     * origin on the fast springs. Reduced motion keeps only the fades (the dialog's and its
     * content's).
     */
    {
      fullScreen: 'always',
      origin: true,
      class: {
        motion: [
          '[--m3-dialog-slide:0_0] [--m3-dialog-open-clip:inset(0_round_0)]',
          '[--m3-dialog-enter-clip:var(--m3-dialog-origin)] [--m3-dialog-exit-clip:var(--m3-dialog-origin)]',
          '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
          'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
          'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
        ],
        panel: [
          '[transition-property:background-color] motion-reduce:[transition-property:none]',
          '[transition-duration:var(--md-sys-motion-spring-effects-slow-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing)]',
          'starting:bg-(--m3-dialog-origin-color) motion-safe:data-exiting:bg-(--m3-dialog-origin-color)',
          'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          '*:[transition-property:opacity] *:starting:opacity-0 data-exiting:*:opacity-0',
          '*:[transition-duration:var(--md-sys-motion-spring-effects-slow-duration)]',
          '*:[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing)]',
        ],
      },
    },
    {
      fullScreen: 'compact',
      origin: true,
      class: {
        motion: [
          'max-medium:[--m3-dialog-slide:0_0] max-medium:[--m3-dialog-open-clip:inset(0_round_0)]',
          'max-medium:[--m3-dialog-enter-clip:var(--m3-dialog-origin)]',
          'max-medium:[--m3-dialog-exit-clip:var(--m3-dialog-origin)]',
          'max-medium:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-slow-duration),var(--md-sys-motion-spring-spatial-slow-duration)]',
          'max-medium:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-slow-easing),var(--md-sys-motion-spring-spatial-slow-easing)]',
          'max-medium:data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
          'max-medium:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
        ],
        panel: [
          'max-medium:[transition-property:background-color]',
          'max-medium:motion-reduce:[transition-property:none]',
          'max-medium:[transition-duration:var(--md-sys-motion-spring-effects-slow-duration)]',
          'max-medium:[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing)]',
          'max-medium:starting:bg-(--m3-dialog-origin-color)',
          'max-medium:motion-safe:data-exiting:bg-(--m3-dialog-origin-color)',
          'max-medium:data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
          'max-medium:*:[transition-property:opacity] max-medium:*:starting:opacity-0',
          'max-medium:data-exiting:*:opacity-0',
          'max-medium:*:[transition-duration:var(--md-sys-motion-spring-effects-slow-duration)]',
          'max-medium:*:[transition-timing-function:var(--md-sys-motion-spring-effects-slow-easing)]',
        ],
      },
    },
  ],
  defaultVariants: {
    dividers: false,
    origin: false,
    quick: false,
    transition: 'reveal',
    hasIcon: false,
    fullScreen: 'never',
    placement: 'center',
    bottomBar: false,
    divider: false,
  },
});

export type DialogStyleProps = VariantProps<typeof dialogStyles>;
