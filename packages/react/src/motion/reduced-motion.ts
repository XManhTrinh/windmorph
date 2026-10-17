/*
 * Reduced motion (architecture §6). Under `prefers-reduced-motion: reduce` the spatial spring
 * tokens last 0ms, so whatever moves, sizes, reshapes or turns on them changes at once, while
 * colour and opacity keep their effects springs. A surface that slides or grows in and out
 * would then pop; these classes make it fade instead.
 */

/**
 * Classes for a surface that enters and leaves with `@starting-style` and `data-exiting`:
 * under reduced motion it only fades, in on the default effects spring and out on the fast
 * one. Its own entry and exit geometry must be `motion-safe:` so it stays where it rests.
 * Every class is written out in full so Tailwind can find it.
 */
export const reducedMotionFade = [
  'motion-reduce:starting:opacity-0 motion-reduce:data-exiting:opacity-0',
  'motion-reduce:[transition-property:opacity]',
  'motion-reduce:[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
  'motion-reduce:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
  'motion-reduce:data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
  'motion-reduce:data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
];
