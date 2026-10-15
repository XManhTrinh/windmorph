import { tv, type VariantProps } from '../../utils/tv';

/*
 * Values follow the M3 Expressive spec and its tokens (the FloatingToolbar / DockedToolbar
 * token files), with Compose Material 3's FloatingToolbar.kt and AppBar.kt's
 * FlexibleBottomAppBar as the recipe.
 *
 * Docked: 64px, `surface-container`, square corners, no elevation, 16px at each end; items
 * sit 32px apart in the centre (the default) or spread out (space-between, for compact
 * windows).
 *
 * Floating: at least 64px across, full corners, 8px padding, `surface-container` (standard)
 * or `primary-container` (vibrant), level 1 by default (M3: floating toolbars have
 * elevation by default). Content is `on-surface-variant` (standard, the icon-button role)
 * or `on-primary-container` (vibrant). Compose's icon buttons take up 48px of layout while
 * ours take 40px (the 48px touch target is overlaid), so every content group adds 4px at
 * its ends and 8px between items, which reproduces Compose's spacing for icon buttons.
 * Leading / trailing content collapses on the fast spatial spring (grid 0fr ↔ 1fr), so the
 * root's size follows it without transforms. Collapsed content stays in the tab order and
 * the accessibility tree, clipped to nothing, and focusing it expands the toolbar.
 *
 * Exiting on scroll (`visible={false}`): the toolbar slides off its edge on the fast
 * spatial spring (a `transform` set only while hidden, so it composes with Tailwind's
 * `translate-*` utilities); reduced motion fades it instead.
 *
 * With a FAB: the toolbar is level 1 expanded and level 0 collapsed, 8px from the FAB.
 * Collapsing shrinks the toolbar's width to 0 towards the FAB while the FAB grows from 56px
 * to 80px; the component keeps its expanded size, as Compose's layout does.
 *
 * Container colours and the floating toolbar's corners come from the component tokens
 * (`toolbar-tokens.ts`, `--md-comp-toolbar-docked-*` and `--md-comp-toolbar-floating-*`):
 * the roots carry `data-tokens`, the floating one also `data-color`. A consumer class still
 * wins in `cn()`.
 *
 * Every class is written out in full so Tailwind can find it.
 */

const spatialFast = [
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing)]',
];

/** The root's exit-on-scroll motion; each edge variant sets the hidden transform. */
const exitMotion = [
  'data-hidden:invisible motion-reduce:data-hidden:opacity-0 motion-reduce:data-hidden:[transform:none]',
  '[transition-property:transform,opacity,visibility]',
  '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration),max(var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration))]',
  '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),linear]',
];

/** Where a hidden toolbar goes: past its edge plus the 24px margin of a vertical toolbar. */
const exitEdges = {
  bottom: { root: 'data-hidden:[transform:translateY(calc(100%+24px))]' },
  top: { root: 'data-hidden:[transform:translateY(calc(-100%-24px))]' },
  start: {
    root: 'data-hidden:[transform:translateX(calc(-100%-24px))] rtl:data-hidden:[transform:translateX(calc(100%+24px))]',
  },
  end: {
    root: 'data-hidden:[transform:translateX(calc(100%+24px))] rtl:data-hidden:[transform:translateX(calc(-100%-24px))]',
  },
} as const;

/** Variant definitions for {@link DockedToolbar}; extend them to add variants. */
export const dockedToolbarStyles = tv({
  slots: {
    root: [
      'flex h-[64px] w-full items-center bg-[var(--_md-comp-toolbar-docked-container-color)] ps-[16px] pe-[16px] text-on-surface-variant',
      ...exitMotion,
      'data-hidden:[transform:translateY(100%)]',
    ],
  },
  variants: {
    arrangement: {
      'space-between': { root: 'justify-between' },
      centered: { root: 'justify-center gap-[32px]' },
    },
  },
  defaultVariants: { arrangement: 'centered' },
});

/** Variant definitions for {@link FloatingToolbar}; extend them to add colour styles. */
export const floatingToolbarStyles = tv({
  slots: {
    // Collapsing and expanding resize it in place, so it is never the browser's scroll
    // anchor (which would scroll the page to follow it).
    root: [
      'inline-flex shrink-0 items-center justify-center [overflow-anchor:none]',
      ...exitMotion,
    ],
    // A group of items (main, leading or trailing content).
    items: 'flex shrink-0 items-center',
    // Collapsible leading / trailing content: a grid track that animates 0fr ↔ 1fr.
    // Expanding uses the spatial spring; collapsing uses the effects spring, which doesn't
    // overshoot, because a size can't overshoot below 0 and would bounce back open by a
    // pixel or two. Collapsed content stays focusable and in the accessibility tree.
    collapse: [
      'grid',
      '[transition-property:grid-template-columns,grid-template-rows]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing)]',
      'data-collapsed:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
    ],
    // Clips the content horizontally (or vertically) while it collapses, leaving room for
    // focus rings and touch targets on the other axis. Once the track has closed (a delay
    // as long as the collapse) it clips everything, so no sliver stays visible.
    clip: [
      'flex min-h-0 min-w-0 data-collapsed:[clip-path:inset(50%)]',
      '[transition-property:clip-path] [transition-duration:0s]',
      'data-collapsed:[transition-delay:var(--md-sys-motion-spring-effects-fast-duration)]',
      // Under reduced motion the track closes at once, and so does the clip.
      'motion-reduce:data-collapsed:[transition-delay:0s]',
    ],
    // FAB layout: the toolbar's slot keeps the expanded width while the surface shrinks,
    // collapsing on the effects spring for the same reason as `collapse`.
    toolbarSlot: 'flex shrink-0',
    surface: [
      'overflow-hidden rounded-[var(--_md-comp-toolbar-floating-container-shape)] opacity-100',
      'data-collapsed:opacity-0 data-collapsed:shadow-elevation-0',
      // Width, height and shadow move on the spatial spring; the surface also fades on the
      // fast effects spring, so the last pixels of a collapse never show as a thin line.
      // Collapsed, it stays focusable and in the accessibility tree, clipped to nothing.
      '[transition-property:width,height,box-shadow,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
      'data-collapsed:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
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
      standard: { root: 'text-on-surface-variant' },
      // Standard and outlined icon buttons take the vibrant content colour.
      vibrant: {
        root: 'text-on-primary-container [--md-comp-icon-button-icon-color:currentColor]',
      },
    },
    /** Level 1 by default; turn it off over visually distinct content. */
    elevated: { true: {}, false: {} },
    exitEdge: exitEdges,
    /** Paints the container on the root (no FAB) or on the toolbar surface (with a FAB). */
    hasFab: {
      false: {
        root: 'rounded-[var(--_md-comp-toolbar-floating-container-shape)] bg-[var(--_md-comp-toolbar-floating-container-color)] p-[8px]',
      },
      true: {
        root: 'gap-[8px]',
        surface: 'bg-[var(--_md-comp-toolbar-floating-container-color)]',
      },
    },
    /** The side of the toolbar the FAB sits on (logical: start / top or end / bottom). */
    fabAt: {
      start: { toolbarSlot: 'justify-start', fabSlot: 'justify-start' },
      end: { toolbarSlot: 'justify-end', fabSlot: 'justify-end' },
    },
  },
  compoundVariants: [
    { hasFab: false, elevated: true, class: { root: 'shadow-elevation-1' } },
    // With a FAB, the toolbar's own surface is level 1 expanded and level 0 collapsed.
    { hasFab: true, elevated: true, class: { surface: 'shadow-elevation-1' } },
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
  defaultVariants: {
    orientation: 'horizontal',
    color: 'standard',
    elevated: true,
    exitEdge: 'bottom',
    hasFab: false,
    fabAt: 'end',
  },
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
      'rounded-corner-large',
      'state-layer focus-ring container-motion',
    ],
    icon: 'inline-flex size-[24px] shrink-0 items-center justify-center [&>svg]:size-full',
  },
  variants: {
    color: {
      standard: { root: 'bg-primary-container text-on-primary-container' },
      vibrant: { root: 'bg-tertiary-container text-on-tertiary-container' },
    },
    /**
     * Like `Fab`: level 2 (Compose's toolbar FAB: hover 3, pressed 2), level 1 (hover 2,
     * pressed 1), or level 0 for a flat FAB. The hover level never applies while pressed.
     */
    elevation: {
      default: { root: 'shadow-elevation-2 data-hovered:not-data-pressed:shadow-elevation-3' },
      lowered: { root: 'shadow-elevation-1 data-hovered:not-data-pressed:shadow-elevation-2' },
      flat: { root: 'shadow-elevation-0' },
    },
  },
  defaultVariants: { color: 'standard', elevation: 'default' },
});

export type DockedToolbarStyleProps = VariantProps<typeof dockedToolbarStyles>;
export type DockedToolbarArrangement = NonNullable<DockedToolbarStyleProps['arrangement']>;
export type FloatingToolbarStyleProps = VariantProps<typeof floatingToolbarStyles>;
export type FloatingToolbarColor = NonNullable<FloatingToolbarStyleProps['color']>;
export type ToolbarOrientation = NonNullable<FloatingToolbarStyleProps['orientation']>;
export type ToolbarExitEdge = NonNullable<FloatingToolbarStyleProps['exitEdge']>;
