import { tv } from '../utils/tv';

/*
 * Two icons sharing one grid cell, one of them shown: a FAB menu's add / close icons, or a
 * toolbar FAB's collapsed / expanded icons. The shown face has `data-active`.
 *
 * - `swap` (the M3 spec and Compose): the faces hand over halfway through the button's fast
 *   spatial morph (Compose swaps at progress 0.5), through a `visibility` switch delayed by
 *   half that spring; reduced motion swaps at once.
 * - `rotate` (an extension beyond the M3 spec, matching Google's Expressive showcase
 *   motion): the outgoing face turns 90° in the direction of the change and fades out while
 *   the incoming one turns in from the other side and fades in, counter-clockwise when
 *   opening in LTR. Rotation is on the fast spatial spring, opacity on the fast effects
 *   spring. It uses the CSS `rotate` property on the faces (never the component's root),
 *   so Tailwind transforms still compose; the turn mirrors in RTL, and reduced motion keeps only the crossfade (`motion-safe:`).
 *
 * The cell itself is the component's icon slot; add `cell` to make it a grid. Every class
 * is written out in full so Tailwind can find it.
 */
export const iconFacesStyles = tv({
  slots: {
    cell: 'inline-grid place-items-center',
    face: 'col-start-1 row-start-1 inline-flex size-full items-center justify-center [&>svg]:size-full',
  },
  variants: {
    transition: {
      swap: {
        face: [
          'invisible data-active:visible',
          '[transition-property:visibility] [transition-duration:0s]',
          '[transition-delay:calc(var(--md-sys-motion-spring-spatial-fast-duration)/2)] motion-reduce:[transition-delay:0s]',
        ],
      },
      rotate: {
        face: [
          'opacity-0 data-active:opacity-100',
          '[transition-property:rotate,opacity]',
          '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
          '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
        ],
      },
    },
    /** `primary`: the resting icon; `alternate`: the open (or expanded) icon. */
    face: { primary: {}, alternate: {} },
  },
  compoundVariants: [
    // Leaving, the resting icon turns onwards (counter-clockwise in LTR, as the showcase
    // does); the alternate icon waits a quarter turn behind, so both turn the same way on
    // the way in and back on the way out.
    // The shown face has no rotation at all, so reduced motion leaves nothing to animate.
    {
      transition: 'rotate',
      face: 'primary',
      class: {
        face: 'motion-safe:not-data-active:ltr:-rotate-90 motion-safe:not-data-active:rtl:rotate-90',
      },
    },
    {
      transition: 'rotate',
      face: 'alternate',
      class: {
        face: 'motion-safe:not-data-active:ltr:rotate-90 motion-safe:not-data-active:rtl:-rotate-90',
      },
    },
  ],
  defaultVariants: { transition: 'swap', face: 'primary' },
});

/**
 * How a two-icon button hands over between its icons: `swap` at the midpoint of the morph
 * (the M3 spec), or `rotate`, a rotating crossfade (beyond the M3 spec; Google's Expressive
 * showcase motion).
 */
export type IconTransition = 'swap' | 'rotate';
