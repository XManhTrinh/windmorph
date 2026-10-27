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
  // A move down to a lower detent that isn't a drag's settle (BottomSheet's state): the fast
  // effects spring, no overshoot. Under reduced motion detent changes stay instant.
  'motion-safe:data-lowering:not-data-exiting:not-data-dragging:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)]',
  'motion-safe:data-lowering:not-data-exiting:not-data-dragging:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]',
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
      // Clips below its bottom edge only, where the panel's bleed hangs (see `panel`).
      '[clip-path:inset(-100vh_-100vw_0_-100vw)]',
    ],
    // Library-owned layer that moves the sheet, inside the container, so the motion never
    // animates the outermost element's `translate` (architecture §10 rule 4).
    motion: [
      'flex w-full',
      'translate-y-(--m3-sheet-offset) motion-safe:starting:translate-y-full motion-safe:data-exiting:translate-y-[112%]',
      ...sheetMotion,
    ],
    panel: [
      'relative flex max-h-[calc(100dvh-72px)] w-full flex-col',
      // A bleed in the panel's colour below its bottom edge: when the spring overshoots, the
      // sheet lifts a few pixels off the window's edge and this fills the gap (Compose scales
      // the sheet up for the same reason). The container clips it at rest.
      "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[32px] after:[background-color:inherit] after:content-['']",
      'rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
      'min-[641px]:max-h-[calc(100dvh-56px)]',
      'bg-[var(--_md-comp-sheet-bottom-docked-container-color)] text-on-surface outline-none',
      'shadow-[shadow:var(--_md-comp-sheet-bottom-docked-container-elevation)]',
      // Forced colours drop the container and the shadow: a border on the free edges.
      'forced-colors:border-x forced-colors:border-t forced-colors:border-solid forced-colors:border-[CanvasText]',
    ],
    handle: [
      'flex w-full shrink-0 justify-center pt-[22px] pb-[22px] outline-none',
      'focus-ring-inset rounded-t-[var(--_md-comp-sheet-bottom-docked-container-shape)]',
    ],
    handleBar: [
      'h-[4px] w-[32px] rounded-corner-extra-large',
      'bg-[var(--_md-comp-sheet-bottom-docked-drag-handle-color)]',
      'forced-colors:bg-[CanvasText] forced-colors:forced-color-adjust-none',
    ],
    closeRow: 'flex shrink-0 justify-end ps-[4px] pe-[4px]',
    content: 'min-h-0 flex-1 overflow-y-auto overscroll-contain',
  },
  variants: {
    variant: {
      modal: {},
      // Over the page without a scrim, below every overlay; the page stays usable around it.
      standard: { container: 'z-(--md-sys-z-sticky)' },
    },
    /** Dragging moves the sheet (`swipeable`); without it the handle is only a button. */
    swipeable: {
      true: {
        handle: 'cursor-grab touch-none data-dragging:cursor-grabbing',
        // At its top, the content leaves downward touch moves to the sheet's drag
        // (BottomSheet), and upward ones too while the sheet rests below its top detent
        // (`data-can-rise`), so an upward swipe raises the sheet before the content scrolls.
        content: [
          'data-at-top:[touch-action:pan-x_pan-down_pinch-zoom]',
          'data-at-top:data-can-rise:[touch-action:pan-x_pinch-zoom]',
        ],
      },
      false: { handle: 'cursor-pointer' },
    },
  },
  defaultVariants: { variant: 'modal', swipeable: true },
});

/**
 * The variants of {@link bottomSheetStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type BottomSheetStyleProps = VariantProps<typeof bottomSheetStyles>;

/** Variant definitions for {@link SideSheet}. */
export const sideSheetStyles = tv({
  slots: {
    scrim,
    // A modal sheet's outermost element, which places it on its `edge` and takes the
    // consumer's `className` and `style`. It clips past that edge only, where a docked
    // panel's bleed hangs (see `compoundVariants`).
    container: 'fixed inset-y-0 z-(--md-sys-z-sheet) flex max-w-full',
    // Library-owned layer that moves a modal sheet, inside the container (architecture §10
    // rule 4); it holds a detached sheet's 16px margins, so the exit clears them. A swipe
    // moves it by `--m3-side-sheet-offset` (physical px, set by SideSheet while dragging and
    // settling); it enters from and leaves past the sheet's edge (`edge`).
    motion: ['flex min-w-0', 'translate-x-(--m3-side-sheet-offset)', ...sheetMotion],
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
    // the panel stays on its edge), on the default spatial spring. The measured width is also
    // the maximum, so the spring's overshoot never opens a strip beside the panel.
    standard: [
      'flex h-full w-[var(--m3-side-sheet-width,auto)] shrink-0 visible data-closed:invisible data-closed:w-0',
      'max-w-[var(--m3-side-sheet-width,none)]',
      '[transition-property:width,visibility]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing),linear]',
    ],
    // The panel rides the root's inner edge (the content's side, `edge`), so as the width
    // moves the sheet slides in and out with its edge leading, as M3's reference moves it
    // (2026-10-24); pinned to the window's side, its far side was wiped into view first.
    standardClip: 'flex w-full min-w-0 overflow-hidden',
    standardFrame: 'flex h-full shrink-0',
  },
  variants: {
    variant: {
      modal: {},
      standard: { panel: 'h-full shrink-0' },
    },
    /** The window edge the sheet sits on; `end` is the right in LTR and the left in RTL. */
    edge: {
      end: {
        container: [
          'end-0',
          '[clip-path:inset(-100vh_0_-100vh_-100vw)] rtl:[clip-path:inset(-100vh_-100vw_-100vh_0)]',
        ],
        motion: [
          'motion-safe:starting:translate-x-full motion-safe:data-exiting:translate-x-[112%]',
          'motion-safe:rtl:starting:-translate-x-full motion-safe:rtl:data-exiting:-translate-x-[112%]',
        ],
        standardClip: 'justify-start',
      },
      start: {
        container: [
          'start-0',
          '[clip-path:inset(-100vh_-100vw_-100vh_0)] rtl:[clip-path:inset(-100vh_0_-100vh_-100vw)]',
        ],
        motion: [
          'motion-safe:starting:-translate-x-full motion-safe:data-exiting:-translate-x-[112%]',
          'motion-safe:rtl:starting:translate-x-full motion-safe:rtl:data-exiting:translate-x-[112%]',
        ],
        standardClip: 'justify-end',
      },
    },
    /**
     * A touch or pen swipe can close the modal sheet: the browser keeps vertical scrolling
     * and pinch zoom but never takes a horizontal pan from it (the content too, a scroller,
     * which would give its descendants panning back).
     */
    swipeable: {
      true: {
        panel: '[touch-action:pan-y_pinch-zoom]',
        content: '[touch-action:pan-y_pinch-zoom]',
      },
      false: {},
    },
    detached: {
      true: {
        motion: 'pt-[16px] pb-[16px]',
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
    { detached: true, edge: 'end', class: { motion: 'pe-[16px]' } },
    { detached: true, edge: 'start', class: { motion: 'ps-[16px]' } },
    {
      variant: 'modal',
      detached: false,
      class: {
        panel: [
          // A bleed past the anchored edge fills the gap when the spring overshoots (see the
          // bottom sheet's panel).
          "relative after:pointer-events-none after:absolute after:inset-y-0 after:w-[32px] after:[background-color:inherit] after:content-['']",
          // Forced colours drop the container and the shadow: a border on the free edge.
          'forced-colors:border-solid forced-colors:border-[CanvasText]',
        ],
      },
    },
    // The corners and the forced-colours border are on the free edge, the bleed on the other.
    {
      variant: 'modal',
      detached: false,
      edge: 'end',
      class: {
        panel: [
          'rounded-s-[var(--_md-comp-sheet-side-container-shape)] after:start-full',
          'forced-colors:border-s',
        ],
      },
    },
    {
      variant: 'modal',
      detached: false,
      edge: 'start',
      class: {
        panel: [
          'rounded-e-[var(--_md-comp-sheet-side-container-shape)] after:end-full',
          'forced-colors:border-e',
        ],
      },
    },
    {
      detached: true,
      class: {
        panel: 'forced-colors:border forced-colors:border-solid forced-colors:border-[CanvasText]',
      },
    },
    // The divider is on the content edge, the side away from the window's.
    {
      variant: 'standard',
      detached: false,
      divider: true,
      edge: 'end',
      class: { panel: 'border-s border-outline-variant' },
    },
    {
      variant: 'standard',
      detached: false,
      divider: true,
      edge: 'start',
      class: { panel: 'border-e border-outline-variant' },
    },
  ],
  defaultVariants: {
    variant: 'modal',
    edge: 'end',
    swipeable: false,
    detached: false,
    hasBack: false,
    divider: true,
    footerDivider: false,
  },
});

/**
 * The variants of {@link sideSheetStyles}, for building on its styles. They are the recipe's keys, not
 * component props: their names (`hasIcon`, `isOpen`…) follow the classes and may change.
 */
export type SideSheetStyleProps = VariantProps<typeof sideSheetStyles>;
