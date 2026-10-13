import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (FloatingToolbar.kt, AppBar.kt's FlexibleBottomAppBar
 * and the FloatingToolbar / DockedToolbar token files).
 *
 * Docked: 64px, `surface-container`, square corners, no elevation, 16px at each end; items
 * spread out (space-between) or sit 32px apart in the centre.
 *
 * Floating: at least 64px across, full corners, 8px padding, `surface-container` (standard)
 * or `primary-container` (vibrant). Compose's icon buttons take up 48px of layout while
 * ours take 40px (the 48px touch target is overlaid), so every content group adds 4px at
 * its ends and 8px between items, which reproduces Compose's spacing for icon buttons.
 * Leading / trailing content collapses on the fast spatial spring (grid 0fr ↔ 1fr), so the
 * root's size follows it without transforms.
 *
 * With a FAB: the toolbar is level 1 expanded and level 0 collapsed, 8px from the FAB.
 * Collapsing shrinks the toolbar's width to 0 towards the FAB while the FAB grows from 56px
 * to 80px; the component keeps its expanded size, as Compose's layout does.
 *
 * Every class is written out in full so Tailwind can find it.
 */

const spatialFast = [
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
];

/** Variant definitions for {@link DockedToolbar}; extend them to add variants. */
export const dockedToolbarStyles = tv({
  slots: {
    root: 'flex h-[64px] w-full items-center bg-surface-container ps-[16px] pe-[16px] text-on-surface',
  },
  variants: {
    arrangement: {
      'space-between': { root: 'justify-between' },
      centered: { root: 'justify-center gap-[32px]' },
    },
  },
  defaultVariants: { arrangement: 'space-between' },
});

/** Variant definitions for {@link FloatingToolbar}; extend them to add colour styles. */
export const floatingToolbarStyles = tv({
  slots: {
    root: 'inline-flex shrink-0 items-center justify-center',
    // A group of items (main, leading or trailing content).
    items: 'flex shrink-0 items-center',
    // Collapsible leading / trailing content: a grid track that animates 0fr ↔ 1fr.
    // Collapsed content turns invisible once the track has closed (visibility switches at
    // the end of its linear transition), so no sliver stays visible. Expanding uses the
    // spatial spring; collapsing uses the effects spring, which doesn't overshoot, because
    // a size can't overshoot below 0 and would bounce back open by a pixel or two.
    collapse: [
      'grid visible data-collapsed:invisible',
      '[transition-property:grid-template-columns,grid-template-rows,visibility]',
      // Visible at once when expanding (so keyboard focus can reach the content in the
      // first frame); invisible only after the track has closed.
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),0s]',
      'data-collapsed:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),linear]',
      'data-collapsed:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),linear]',
    ],
    // Clips the content horizontally (or vertically) while it collapses, leaving room for
    // focus rings and touch targets on the other axis.
    clip: 'flex min-h-0 min-w-0',
    // FAB layout: the toolbar's slot keeps the expanded width while the surface shrinks,
    // collapsing on the effects spring for the same reason as `collapse`.
    toolbarSlot: 'flex shrink-0',
    surface: [
      'visible overflow-hidden rounded-corner-full opacity-100 shadow-elevation-1',
      'data-collapsed:invisible data-collapsed:opacity-0 data-collapsed:shadow-elevation-0',
      // Width, height and shadow move on the spatial spring; the surface also fades (on the
      // default effects spring while collapsing), so the last pixels of a collapse never show
      // as a thin line.
      '[transition-property:width,height,box-shadow,visibility,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),0s,var(--md-sys-motion-spring-effects-fast-duration)]',
      'data-collapsed:[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),linear,var(--md-sys-motion-spring-effects-fast-easing)]',
      'data-collapsed:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),linear,var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    content: 'flex items-center',
    fabSlot: 'flex shrink-0 items-center',
    fabBox: [
      'flex size-[56px] shrink-0 data-collapsed:size-[80px]',
      '[transition-property:width,height]',
      ...spatialFast,
    ],
  },
  variants: {
    orientation: {
      horizontal: {
        root: 'min-h-[64px] flex-row',
        items: 'flex-row gap-[8px] ps-[4px] pe-[4px]',
        collapse: 'grid-cols-[1fr] data-collapsed:grid-cols-[0fr]',
        clip: 'flex-row [clip-path:inset(-12px_-2px)]',
        toolbarSlot: 'h-[64px] w-(--m3-toolbar-size) flex-row',
        surface: 'h-[64px] w-(--m3-toolbar-size) data-collapsed:w-0',
        content: 'h-full w-max flex-row gap-[8px] ps-[12px] pe-[12px]',
        fabSlot: 'w-[56px] flex-row',
      },
      vertical: {
        root: 'min-w-[64px] flex-col',
        items: 'flex-col gap-[8px] pt-[4px] pb-[4px]',
        collapse: 'grid-rows-[1fr] data-collapsed:grid-rows-[0fr]',
        clip: 'flex-col [clip-path:inset(-2px_-12px)]',
        toolbarSlot: 'h-(--m3-toolbar-size) w-[64px] flex-col',
        surface: 'h-(--m3-toolbar-size) w-[64px] data-collapsed:h-0',
        content: 'h-max w-full flex-col gap-[8px] pt-[12px] pb-[12px]',
        fabSlot: 'h-[56px] flex-col',
      },
    },
    color: {
      standard: { root: 'text-on-surface' },
      vibrant: { root: 'text-on-primary-container' },
    },
    /** Paints the container on the root (no FAB) or on the toolbar surface (with a FAB). */
    hasFab: {
      false: { root: 'rounded-corner-full p-[8px]' },
      true: { root: 'gap-[8px]' },
    },
    /** The side of the toolbar the FAB sits on (logical: start / top or end / bottom). */
    fabAt: {
      start: { toolbarSlot: 'justify-start', fabSlot: 'justify-start' },
      end: { toolbarSlot: 'justify-end', fabSlot: 'justify-end' },
    },
  },
  compoundVariants: [
    { hasFab: false, color: 'standard', class: { root: 'bg-surface-container' } },
    { hasFab: false, color: 'vibrant', class: { root: 'bg-primary-container' } },
    { hasFab: true, color: 'standard', class: { surface: 'bg-surface-container' } },
    { hasFab: true, color: 'vibrant', class: { surface: 'bg-primary-container' } },
    { hasFab: true, orientation: 'horizontal', class: { root: 'min-h-[80px]' } },
    { hasFab: true, orientation: 'vertical', class: { root: 'min-w-[80px]' } },
    // The FAB comes first visually but after the toolbar in reading order, as in Compose.
    {
      hasFab: true,
      fabAt: 'start',
      orientation: 'horizontal',
      class: { root: 'flex-row-reverse' },
    },
    { hasFab: true, fabAt: 'start', orientation: 'vertical', class: { root: 'flex-col-reverse' } },
  ],
  defaultVariants: { orientation: 'horizontal', color: 'standard', hasFab: false, fabAt: 'end' },
});

/**
 * Collapsing content is anchored like Compose's AnimatedVisibility: horizontally, leading
 * content expands from the start and shrinks towards the end (trailing: the reverse);
 * vertically, leading content stays at the bottom and trailing content at the top.
 */
export const toolbarCollapseAnchor = tv({
  base: '',
  variants: {
    slot: { leading: '', trailing: '' },
    orientation: { horizontal: '', vertical: '' },
  },
  compoundVariants: [
    {
      slot: 'leading',
      orientation: 'horizontal',
      class: 'justify-start data-collapsed:justify-end',
    },
    {
      slot: 'trailing',
      orientation: 'horizontal',
      class: 'justify-end data-collapsed:justify-start',
    },
    { slot: 'leading', orientation: 'vertical', class: 'justify-end' },
    { slot: 'trailing', orientation: 'vertical', class: 'justify-start' },
  ],
});

/** Variant definitions for {@link ToolbarFab}. */
export const toolbarFabStyles = tv({
  slots: {
    root: [
      'inline-flex size-full cursor-pointer items-center justify-center select-none',
      'rounded-corner-large shadow-elevation-2 data-hovered:shadow-elevation-3',
      'state-layer focus-ring container-motion',
    ],
    icon: 'inline-flex size-[24px] shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    color: {
      standard: { root: 'bg-primary-container text-on-primary-container' },
      vibrant: { root: 'bg-tertiary-container text-on-tertiary-container' },
    },
  },
  defaultVariants: { color: 'standard' },
});

export type DockedToolbarStyleProps = VariantProps<typeof dockedToolbarStyles>;
export type DockedToolbarArrangement = NonNullable<DockedToolbarStyleProps['arrangement']>;
export type FloatingToolbarStyleProps = VariantProps<typeof floatingToolbarStyles>;
export type FloatingToolbarColor = NonNullable<FloatingToolbarStyleProps['color']>;
export type ToolbarOrientation = NonNullable<FloatingToolbarStyleProps['orientation']>;
