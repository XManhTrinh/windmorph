import { tv, type VariantProps } from '../../utils/tv';

/*
 * Bottom sheet values follow Compose Material 3 (ModalBottomSheet.kt, BottomSheet.kt,
 * SheetDefaults.kt, SheetBottomTokens): at most 640px wide and centred, 28px top corners,
 * `surface-container-low`, a 32 × 4px `on-surface-variant` drag handle with 22px above and
 * below it, and a 32% scrim fading on the default effects spring. It shows on the default
 * spatial spring and hides on the fast effects spring, as Compose's `showMotionSpec` /
 * `hideMotionSpec` do.
 *
 * Side sheets aren't in Compose; values follow Material Components Android
 * (`m3_comp_sheet_side_*`): 256px wide; standard `surface` at level 0 with no corners;
 * modal `surface-container-low` at level 1 with 16px corners on its free edge, over a 32%
 * scrim; detached sheets sit 16px from the edges with 16px corners all round. They move on
 * the bottom sheet's springs.
 *
 * The sheets move by `translate` on a library-owned wrapper, never on the consumer's panel
 * (§10). Every class is written out in full so Tailwind can find it.
 */

const scrim = [
  'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
  '[transition-property:opacity]',
  '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
  'starting:opacity-0 data-exiting:opacity-0',
];

/** Shows on the default spatial spring, hides on the fast effects spring. */
const sheetMotion = [
  '[transition-property:translate]',
  '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
  'data-exiting:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
  'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
  'data-dragging:[transition-duration:0s]',
];

/** Variant definitions for {@link BottomSheet}. */
export const bottomSheetStyles = tv({
  slots: {
    scrim,
    // Library-owned wrapper that moves the sheet.
    motion: [
      'fixed inset-x-0 bottom-0 z-(--md-sys-z-sheet) mx-auto flex max-h-dvh w-full max-w-[640px]',
      'translate-y-(--m3-sheet-offset) starting:translate-y-full data-exiting:translate-y-full',
      ...sheetMotion,
    ],
    panel: [
      'flex max-h-dvh w-full flex-col rounded-t-corner-extra-large',
      'bg-surface-container-low text-on-surface outline-none',
    ],
    handle: [
      'flex w-full shrink-0 cursor-grab touch-none justify-center pt-[22px] pb-[22px] outline-none',
      'focus-ring-inset rounded-t-corner-extra-large data-dragging:cursor-grabbing',
    ],
    handleBar: 'h-[4px] w-[32px] rounded-corner-extra-large bg-on-surface-variant',
    content: 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
  },
});

/** Variant definitions for {@link SideSheet}. */
export const sideSheetStyles = tv({
  slots: {
    scrim,
    motion: [
      'fixed inset-y-0 end-0 z-(--md-sys-z-sheet) flex max-w-full',
      'translate-x-0 starting:translate-x-full data-exiting:translate-x-full',
      'rtl:starting:-translate-x-full rtl:data-exiting:-translate-x-full',
      ...sheetMotion,
    ],
    panel: 'flex w-[256px] max-w-full flex-col text-on-surface outline-none',
    header:
      'flex min-h-[72px] shrink-0 items-center gap-[12px] ps-[24px] pe-[12px] pt-[12px] pb-[12px]',
    title: 'min-w-0 flex-1 text-title-large font-brand text-on-surface-variant',
    content: 'min-h-0 flex-1 overflow-y-auto overscroll-contain ps-[24px] pe-[24px]',
    // Standard sheets sit in the layout; their width opens and closes on a grid track.
    standard: [
      'inline-grid h-full shrink-0 grid-cols-[1fr] visible data-closed:invisible data-closed:grid-cols-[0fr]',
      '[transition-property:grid-template-columns,visibility]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),linear]',
    ],
    standardClip: 'flex min-w-0 justify-end overflow-hidden',
  },
  variants: {
    variant: {
      modal: { panel: 'bg-surface-container-low shadow-elevation-1' },
      standard: { panel: 'h-full shrink-0 bg-surface' },
    },
    detached: {
      true: { motion: 'pt-[16px] pb-[16px] pe-[16px]', panel: 'rounded-corner-large' },
      false: {},
    },
  },
  compoundVariants: [
    { variant: 'modal', detached: false, class: { panel: 'rounded-s-corner-large' } },
  ],
  defaultVariants: { variant: 'modal', detached: false },
});

export type SideSheetStyleProps = VariantProps<typeof sideSheetStyles>;
