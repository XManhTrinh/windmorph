import { tv } from '../../utils/tv';
import { menuPageStack } from './menu-styles';

/*
 * Submenus shown in place of the menu that opened them (a bottom sheet, or a popover with
 * `submenuPresentation="replace"`): the classes only those menus use, loaded with them
 * (`menu-in-place.tsx`), so a menu whose submenus open beside it doesn't carry them. Their row
 * and the sheet's content take `menuStyles`' `sheetHeader`, `sheetBack`, `sheetTitle` and
 * `sheetContent` too, with these on top.
 *
 * A page coming in (`submenuTransition`) fades in on the fast effects spring, and with `slide`
 * also moves in 30px from the end edge going forward and from the start edge going back (M3's
 * forward and backward pattern), on the default spatial spring. The pages read the direction
 * from their container's `data-page-direction`, which is set from the first page change on, so
 * the first page never moves as the menu opens: the reveal does that. The page going out is
 * hidden at once. The container sets the slide's offset for the direction (left and right swap
 * in right to left), only with `slide`.
 */
const pageEnter = [
  'opacity-100 [[data-page-direction]_&]:starting:opacity-0',
  '[[data-page-direction]_&]:starting:[translate:calc(var(--m3-menu-page-x,0px)*var(--m3-menu-page-sign,1))_0]',
  '[transition-property:opacity,translate]',
  '[transition-duration:var(--md-sys-motion-spring-effects-fast-duration),var(--md-sys-motion-spring-spatial-default-duration)]',
  '[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-spatial-default-easing)]',
];

const pageDirection = [
  '[--m3-menu-page-sign:1] rtl:[--m3-menu-page-sign:-1]',
  'data-[page-transition=slide]:data-[page-direction=forward]:[--m3-menu-page-x:30px]',
  'data-[page-transition=slide]:data-[page-direction=back]:[--m3-menu-page-x:-30px]',
];

/** The parts of submenus shown in place (library-internal). */
export const menuPageStyles = tv({
  slots: {
    // A popover whose submenus show in place: one surface that persists from page to page, the
    // `divider` layout's (its colour, corners, elevation and forced-colours edge). It holds the
    // visible page's height (set inline), which grows on the default spatial spring and
    // shrinks over the same duration on the default effects spring's easing
    // (`data-shrinking`), so a shorter page is never cut and the surface never bounces open
    // again; any other change of size follows at once. It clips the page coming in.
    surface: [
      'flex max-h-[inherit] min-h-0 flex-col overflow-clip',
      'bg-[var(--_md-comp-menus-container-color)] shadow-[shadow:var(--_md-comp-menus-container-elevation)]',
      'rounded-[var(--_md-comp-menus-container-shape)]',
      'forced-colors:outline-solid forced-colors:outline-1 forced-colors:outline-[CanvasText]',
      '[transition-property:none] data-paging:[transition-property:height]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-default-duration)]',
      '[transition-timing-function:var(--md-sys-motion-spring-spatial-default-easing)]',
      'data-shrinking:[transition-timing-function:var(--md-sys-motion-spring-effects-default-easing)]',
    ],
    // The pages on that surface, at their own height (up to the popover's maximum, the list
    // scrolling inside) and width: the surface's 4px padding, and the menu's 112–280px width,
    // which follows each page at once.
    pages: [
      'flex max-h-[inherit] min-w-[112px] max-w-[280px] shrink-0 flex-col p-[4px]',
      ...menuPageStack,
      ...pageDirection,
    ],
    // What a sheet's content (`menuStyles().sheetContent()`) adds: the direction, and a clip
    // for the page sliding in.
    sheetPages: ['overflow-x-clip', ...pageDirection],
    // The first page (the menu itself) as it shows again: only its motion.
    page: pageEnter,
    // A submenu's page: a back button and its item's label above its list, coming in.
    panel: ['flex min-h-0 flex-1 flex-col', ...pageEnter],
    // The row's title and back icon take the items' label and leading-icon colours, so
    // `vibrant` and the menu's tokens reach them.
    back: 'text-[color:var(--_md-comp-menus-menu-item-leading-icon-color)]',
    title: 'text-[color:var(--_md-comp-menus-menu-item-label-text-color)]',
  },
  variants: {
    /** Pages change with no motion (`instant`). */
    instant: {
      true: { page: '[transition-property:none]', panel: '[transition-property:none]' },
      false: {},
    },
  },
  defaultVariants: { instant: false },
});
