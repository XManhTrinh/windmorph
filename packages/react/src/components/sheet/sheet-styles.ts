import { reducedMotionFade } from '../../motion/reduced-motion';
import { tv, type VariantProps } from '../../utils/tv';

/*
 * Bottom sheet values follow m3.material.io and Compose Material 3 (ModalBottomSheet.kt,
 * BottomSheetScaffold.kt, SheetDefaults.kt, SheetBottomTokens): at most 640px wide and
 * centred, with a 72px top margin (56px, and 56px side margins, above 640px), 28px top
 * corners, `surface-container-low` at level 1, a 32 × 4px `on-surface-variant` drag handle
 * with 22px above and below it, and (modal) a 32% scrim fading on the default effects
 * spring. It shows on the default spatial spring and hides on the fast spatial spring: the
 * exit moves the sheet, and position moves on spatial springs (2026-10-13). The exit
 * travels 112% of the sheet's size, so the spring's overshoot (under 10.5% of the
 * distance) settles out of view and the sheet never springs back into the window.
 *
 * Side sheets aren't in Compose; values follow m3.material.io and Material Components
 * Android (`m3_comp_sheet_side_*`): 256px wide, at most 400px; standard `surface` at level 0 with no
 * corners and an `outline-variant` divider on its content edge; modal
 * `surface-container-low` at level 1 with 16px corners on its free edge, over a 32% scrim;
 * detached sheets sit 16px from the edges with 16px corners all round. The header has 24px
 * start padding (16px with a back button) and 12px between its parts; the bottom action
 * row is at least 72px, 16px above and 24px below, start-aligned. They move on the bottom
 * sheet's springs.
 *
 * The sheets move by `translate` on a library-owned wrapper, never on the consumer's panel
 * (§10).
 *
 * The containers' colours, corners and shadows and the drag handle's colour come from the
 * sheets' component tokens (`sheet-tokens.ts`, `--md-comp-sheet-bottom-docked-*` and
 * `--md-comp-sheet-side-*`); each sheet's root carries its set's `data-tokens` and
 * `data-variant` (a detached side sheet also `data-detached`), and the parts read one private
 * variable each. A consumer class (`bg-surface-container`) still wins. Every class is written
 * out in full so Tailwind can find it.
 */

const scrim = [
  'fixed inset-0 z-(--md-sys-z-scrim) bg-scrim/32 opacity-100',
  '[transition-property:opacity]',
  '[transition-duration:var(--md-sys-motion-spring-effects-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
  'starting:opacity-0 data-exiting:opacity-0',
];

/**
 * Shows on the default spatial spring, hides on the fast spatial spring. Exits translate
 * 112% of the sheet's size, so the spring's overshoot stays off-screen. Under reduced motion
 * the sheet fades in and out where it rests, and settling on a detent is instant; a drag
 * still follows the pointer.
 */
const sheetMotion = [
  '[transition-property:translate]',
  '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
  'data-exiting:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
  'data-exiting:[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
  'data-dragging:[transition-duration:0s]',
  ...reducedMotionFade,
];

/**
 * The transitions that end a sheet's exit (`usePresence`): the slide, or the fade under
 * reduced motion.
 */
export const SHEET_EXIT_PROPERTIES = ['translate', 'opacity'] as const;

/** Variant definitions for {@link BottomSheet}. */
export const bottomSheetStyles = tv({
  slots: {
    scrim,
    // The outermost element, which places the sheet and takes the consumer's `className` and
    // `style`. The sheet sits at its bottom (`items-end`), so a consumer inset that stretches
    // it (`top-24` with the library's `bottom-0`) never stretches the sheet.
    container: [
      'fixed inset-x-0 bottom-0 z-(--md-sys-z-sheet) mx-auto flex w-full max-w-[640px] items-end',
      'max-h-[calc(100dvh-72px)] min-[641px]:max-h-[calc(100dvh-56px)]',
      'min-[641px]:max-w-[min(640px,calc(100%-112px))]',
    ],
    // Library-owned layer that moves the sheet, inside the container, so the motion never
    // animates the outermost element's `translate` (architecture §10 rule 4).
    motion: [
      'flex w-full',
      'translate-y-(--m3-sheet-offset) motion-safe:starting:translate-y-full motion-safe:data-exiting:translate-y-[112%]',
      ...sheetMotion,
    ],
    panel: [
      'flex max-h-[calc(100dvh-72px)] w-full flex-col',
      'rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
      'min-[641px]:max-h-[calc(100dvh-56px)]',
      'bg-[var(--_md-comp-sheet-bottom-docked-container-color)] text-on-surface outline-none',
      'shadow-[shadow:var(--_md-comp-sheet-bottom-docked-container-elevation)]',
      // Forced colours drop the container and the shadow: a border on the free edges.
      'forced-colors:border-x forced-colors:border-t forced-colors:border-solid forced-colors:border-[CanvasText]',
    ],
    handle: [
      'flex w-full shrink-0 cursor-grab touch-none justify-center pt-[22px] pb-[22px] outline-none',
      'focus-ring-inset rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
      'data-dragging:cursor-grabbing',
    ],
    handleBar: [
      'h-[4px] w-[32px] rounded-corner-extra-large',
      'bg-[var(--_md-comp-sheet-bottom-docked-drag-handle-color)]',
      'forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none',
    ],
    closeRow: 'flex shrink-0 justify-end ps-[4px] pe-[4px]',
    // At its top, the content leaves downward touch moves to the sheet's drag (BottomSheet).
    content:
      'min-h-0 flex-1 overflow-y-auto overscroll-contain data-at-top:[touch-action:pan-x_pan-down_pinch-zoom]',
  },
  variants: {
    variant: {
      modal: {},
      // Over the page without a scrim, below every overlay; the page stays usable around it.
      standard: { container: 'z-(--md-sys-z-sticky)' },
    },
  },
  defaultVariants: { variant: 'modal' },
});

export type BottomSheetStyleProps = VariantProps<typeof bottomSheetStyles>;

/** Variant definitions for {@link SideSheet}. */
export const sideSheetStyles = tv({
  slots: {
    scrim,
    // A modal sheet's outermost element, which places it and takes the consumer's
    // `className` and `style`.
    container: 'fixed inset-y-0 end-0 z-(--md-sys-z-sheet) flex max-w-full',
    // Library-owned layer that moves a modal sheet, inside the container (architecture §10
    // rule 4); it holds a detached sheet's 16px margins, so the exit clears them.
    motion: [
      'flex min-w-0',
      'translate-x-0 motion-safe:starting:translate-x-full motion-safe:data-exiting:translate-x-[112%]',
      'motion-safe:rtl:starting:-translate-x-full motion-safe:rtl:data-exiting:-translate-x-[112%]',
      ...sheetMotion,
    ],
    // 256px by default; a consumer width can't pass the spec's 400px maximum. A fixed
    // maximum (not a percentage) also caps the wrapper's shrink-to-fit width, and `min-w-0`
    // lets the panel shrink with the wrapper in a narrow window.
    panel: [
      'flex w-[256px] max-w-[400px] min-w-0 flex-col text-on-surface outline-none',
      'bg-[var(--_md-comp-sheet-side-container-color)]',
      'shadow-[shadow:var(--_md-comp-sheet-side-container-elevation)]',
    ],
    header:
      'flex min-h-[72px] shrink-0 items-center gap-[12px] ps-[24px] pe-[12px] pt-[12px] pb-[12px]',
    title: 'min-w-0 flex-1 text-title-large font-brand text-on-surface-variant',
    headerActions: 'ms-auto flex shrink-0 items-center gap-[12px]',
    // m3.material.io: "Side sheets cannot scroll horizontally."
    content:
      'min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain ps-[24px] pe-[24px]',
    footer: [
      'flex min-h-[72px] shrink-0 flex-wrap items-center justify-start gap-[8px]',
      'ps-[24px] pe-[24px] pt-[16px] pb-[24px]',
    ],
    // Standard sheets sit in the layout; their width opens and closes (a measured length, so
    // the panel stays on its edge), on the default spatial spring.
    standard: [
      'flex h-full w-[var(--m3-side-sheet-width,auto)] shrink-0 visible data-closed:invisible data-closed:w-0',
      '[transition-property:width,visibility]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),linear]',
    ],
    standardClip: 'flex w-full min-w-0 justify-end overflow-hidden',
    standardFrame: 'flex h-full shrink-0',
  },
  variants: {
    variant: {
      modal: {},
      standard: { panel: 'h-full shrink-0' },
    },
    detached: {
      true: {
        motion: 'pt-[16px] pb-[16px] pe-[16px]',
        standardFrame: 'pt-[16px] pb-[16px] ps-[16px] pe-[16px]',
        panel: 'rounded-[var(--_md-comp-sheet-side-container-shape)]',
      },
      false: {},
    },
    /** A back button leads the header. */
    hasBack: { true: { header: 'ps-[16px]' }, false: {} },
    /** A divider separates the standard sheet from the content beside it. */
    divider: { true: {}, false: {} },
    /** A divider separates the bottom actions from the content. */
    footerDivider: { true: { footer: 'border-t border-outline-variant' }, false: {} },
  },
  compoundVariants: [
    {
      variant: 'modal',
      detached: false,
      class: {
        panel: [
          'rounded-s-[var(--_md-comp-sheet-side-container-shape)]',
          // Forced colours drop the container and the shadow: a border on the free edge.
          'forced-colors:border-s forced-colors:border-solid forced-colors:border-[CanvasText]',
        ],
      },
    },
    {
      detached: true,
      class: {
        panel: 'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
      },
    },
    {
      variant: 'standard',
      detached: false,
      divider: true,
      class: { panel: 'border-s border-outline-variant' },
    },
  ],
  defaultVariants: {
    variant: 'modal',
    detached: false,
    hasBack: false,
    divider: true,
    footerDivider: false,
  },
});

export type SideSheetStyleProps = VariantProps<typeof sideSheetStyles>;
