'use client';

/**
 * What a menu loads only when it needs it (`Menu` loads this module on demand): its bottom
 * sheet, submenus shown in place of their menu (`submenuPresentation="replace"`, and the
 * sheet's), and a popover opened inside an element (`portalContainer`). A menu whose submenus
 * open beside it, in `body`, never loads it.
 */
import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import { mergeProps, useButton } from 'react-aria';
import { DRAWS_NO_CHILDREN, Overlay } from '../../primitives/Overlay';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { cn } from '../../utils/cn';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { useLabels } from '../labels/use-labels';
import { LazyBottomSheet } from '../sheet/lazy-bottom-sheet';
import { BackIcon } from '../sheet/sheet-icons';
import {
  closeOnLoadError,
  DEFAULT_LABELS,
  MenuList,
  MenuPopoverFrame,
  MenuTreeContext,
  useMenuPopover,
  type ExitProps,
  type MenuShownProps,
  type MenuSubmenuTransition,
  type SubmenuPageProps,
} from './Menu';
import { menuPageStyles } from './menu-page-styles';
import { menuStyles, type MenuVariant } from './menu-styles';
import { triggerMenuProps, type MenuTriggerContextValue } from './menu-trigger';
import { useBoundaryForSubmenus, useBoundaryInContainer } from './use-boundary-in-container';
import { usePageHeight } from './use-page-height';

/**
 * `value` while the menu is open, and the last value it had open while the menu leaves. Closing
 * the whole menu from a page (an action, a choice, a press outside) clears every open submenu at
 * once, while the menu plays its exit: the page and its focused item left the document then, so
 * focus fell to `<body>` until the menu's own exit ended, and the first page showed again, at its
 * own height, as it faded (2026-11-19). What was showing stays instead, so focus goes back to
 * the trigger from the page as the menu leaves.
 */
function useHeldWhileLeaving<T>(value: T, open: boolean): T {
  const [held, setHeld] = useState(value);
  if (open && held !== value) setHeld(value);
  return open ? value : held;
}

/**
 * Which way the last page change went, for the page coming in (`data-page-direction`):
 * `undefined` until the first change, so the first page never moves in as the menu opens.
 * Derived as the level changes, in the same render, so the page and the direction it reads
 * arrive together.
 */
function usePageDirection(level: number): 'forward' | 'back' | undefined {
  const [last, setLast] = useState<{ level: number; direction?: 'forward' | 'back' }>({ level });
  if (last.level === level) return last.direction;
  const direction = level > last.level ? 'forward' : 'back';
  setLast({ level, direction });
  return direction;
}

/** Props of {@link MenuSheet}. */
export type MenuSheetProps = MenuShownProps & {
  trigger: MenuTriggerContextValue;
  transition: MenuSubmenuTransition;
};

/**
 * The menu in a modal bottom sheet (M3: menus can adapt into bottom sheets on small
 * screens). The sheet is a dialog named like the menu; the menu inside keeps its role,
 * keyboard, typeahead and initial focus, and spans the sheet without a surface of its own.
 * Its submenus show in place of the menu. The sheet's own code loads on first open (or when
 * the trigger is hovered or focused), after this module.
 */
export function MenuSheet({
  trigger,
  layout: _layout,
  placement: _placement,
  offset: _offset,
  variant = 'standard',
  labels: labelsProp,
  backIcon,
  transition,
  className,
  style,
  ...props
}: MenuSheetProps) {
  const labels = useLabels('Menu', DEFAULT_LABELS, labelsProp);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [activeLevel, setActiveLevel] = useState(0);
  const level = useHeldWhileLeaving(trigger.state.expandedKeysStack.length, trigger.state.isOpen);
  const pageDirection = usePageDirection(level);
  const menuProps = mergeProps(triggerMenuProps(trigger, props), props);
  // The sheet takes the menu's name: its `aria-labelledby` when it has one, which names the
  // menu over an `aria-label` (its own, or the trigger's), else its `aria-label`.
  const labelledBy = menuProps['aria-labelledby'];
  const naming = labelledBy
    ? { 'aria-labelledby': labelledBy }
    : { 'aria-label': menuProps['aria-label'] ?? '' };
  return (
    <LazyBottomSheet
      {...naming}
      onLoadError={closeOnLoadError(trigger)}
      // A menu sheet opens at its own height (up to the window, the list scrolling inside):
      // at half the window, a short phone left its last items off-screen, where the arrow
      // keys could still move focus.
      skipPartiallyExpanded
      open={trigger.state.isOpen}
      onOpenChange={(open) => (open ? trigger.state.open() : trigger.state.close())}
      className={className}
      style={style}
      classNames={props.classNames?.sheet ? { panel: props.classNames.sheet } : undefined}
    >
      <div
        ref={setContainer}
        data-level={level}
        data-page-direction={pageDirection}
        data-page-transition={transition}
        className={cn(menuStyles().sheetContent(), menuPageStyles().sheetPages())}
      >
        <MenuTreeContext
          value={{
            rootState: trigger.state,
            container,
            activeLevel,
            setActiveLevel,
            layout: 'divider',
            variant,
            density: props.density,
            instant: false,
            page: SubmenuPage,
            labels,
            classNames: props.classNames,
            backIcon,
            boundary: null,
          }}
        >
          <MenuList
            {...menuProps}
            layout="divider"
            variant={variant}
            level={0}
            embedded
            pageClassName={menuPageStyles().page()}
            onClose={trigger.state.close}
            autoFocus={trigger.state.focusStrategy ?? 'first'}
          />
        </MenuTreeContext>
      </div>
    </LazyBottomSheet>
  );
}

/** Props of {@link MenuPopoverInPlace}. */
export type MenuPopoverInPlaceProps = MenuShownProps & {
  trigger: MenuTriggerContextValue;
  instant: boolean;
  /** Submenus show in place, on one surface (`submenuPresentation="replace"`). */
  replace: boolean;
  transition: MenuSubmenuTransition;
  /** The `portalContainer`: React Aria keeps the menu within it, as it keeps it in the window. */
  boundary: Element | null;
  isExiting: boolean;
  exitProps: ExitProps;
};

/**
 * A menu's popover whose submenus show in place (`submenuPresentation="replace"`), or which
 * opens inside an element (`portalContainer`), or both: the popover in its `Overlay`, in the
 * element when there is one.
 */
export function MenuPopoverInPlace(props: MenuPopoverInPlaceProps) {
  const { boundary } = props;
  // Development only, once per container: it must draw children of ours, as the element in full
  // screen must (`Overlay`).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !boundary) return;
    const html = boundary.namespaceURI === 'http://www.w3.org/1999/xhtml';
    if (html && !DRAWS_NO_CHILDREN.has(boundary.localName)) return;
    console.warn(
      `[@windmorph/react] A Menu's portalContainer must draw its children: a <${boundary.localName}> never shows a menu put inside it. Pass an element around it, such as the player that holds a video.`,
    );
  }, [boundary]);
  return (
    <Overlay exiting={props.isExiting} portalContainer={boundary ?? undefined}>
      <PopoverInPlace {...props} />
    </Overlay>
  );
}

/**
 * Places a menu again when its `portalContainer` resizes without the window. React Aria places
 * a popover again on a window resize and on its own or its trigger's, but not when a container
 * resizes and moves the trigger without resizing it, and `usePopover` doesn't return
 * `updatePosition`. So as the container resizes, its `shouldUpdatePosition` turns off and on
 * again, each committed at once, before the paint: the change re-runs its positioning effect.
 */
function usePlaceAgainOnResize(boundary: Element | null) {
  const [placing, setPlacing] = useState(true);
  useEffect(() => {
    if (!boundary || typeof ResizeObserver === 'undefined') return;
    let observed = false;
    const observer = new ResizeObserver(() => {
      // The first call reports the size the container has as it's observed.
      if (!observed) {
        observed = true;
        return;
      }
      flushSync(() => setPlacing(false));
      flushSync(() => setPlacing(true));
    });
    observer.observe(boundary);
    return () => observer.disconnect();
  }, [boundary]);
  return placing;
}

function PopoverInPlace({
  trigger,
  instant,
  replace,
  transition,
  boundary,
  isExiting,
  exitProps,
  placement,
  offset,
  containerPadding,
  layout = 'divider',
  variant = 'standard',
  labels: labelsProp,
  backIcon,
  className,
  style,
  ...props
}: MenuPopoverInPlaceProps) {
  const labels = useLabels('Menu', DEFAULT_LABELS, labelsProp);
  const popoverRef = useRef<HTMLDivElement>(null);
  // In place, the pages' element holds the submenus' pages.
  const [pages, setPages] = useState<HTMLDivElement | null>(null);
  const level = useHeldWhileLeaving(trigger.state.expandedKeysStack.length, trigger.state.isOpen);
  // While a page other than the first shows in place, the popover keeps the side of the
  // trigger it opened on: a taller page grows away from the trigger (and its list scrolls if it
  // runs out of room) instead of jumping across it mid-change.
  const [heldSide, setHeldSide] = useState<string | null>(null);
  const placing = usePlaceAgainOnResize(boundary);
  // Placed before React Aria places the popover (declared before `useMenuPopover`).
  const boundaryElement = useBoundaryInContainer(boundary, popoverRef, placing);
  const submenuBoundary = useBoundaryForSubmenus(replace ? null : boundary, popoverRef);
  const popover = useMenuPopover(
    trigger,
    popoverRef,
    { placement, offset, containerPadding },
    { heldSide, boundaryElement, shouldUpdatePosition: placing },
  );
  const side = replace && level > 0 ? (heldSide ?? popover.placement) : null;
  if (side !== heldSide) setHeldSide(side);
  const list = (
    <MenuList
      {...mergeProps(triggerMenuProps(trigger, props), props)}
      // In place, `panel` is the surface around the pages.
      classNames={replace ? { ...props.classNames, panel: undefined } : props.classNames}
      // In place, as in a sheet, `gap` gives way to dividers.
      layout={replace ? 'divider' : layout}
      variant={variant}
      level={0}
      embedded={replace}
      {...(replace && { pageClassName: menuPageStyles({ instant }).page() })}
      onClose={trigger.state.close}
      autoFocus={trigger.state.focusStrategy ?? 'first'}
    />
  );
  return (
    <MenuPopoverFrame
      trigger={trigger}
      popoverRef={popoverRef}
      popover={popover}
      instant={instant}
      isExiting={isExiting}
      exitProps={exitProps}
      className={className}
      style={style}
      absolute={boundary !== null}
      tree={{
        ...(replace && { container: pages }),
        layout: replace ? 'divider' : layout,
        variant,
        density: props.density,
        instant,
        page: replace ? SubmenuPage : null,
        labels,
        classNames: props.classNames,
        backIcon,
        boundary: submenuBoundary,
      }}
    >
      {replace ? (
        <MenuPageSurface
          level={level}
          variant={variant}
          instant={instant}
          transition={transition}
          className={props.classNames?.panel}
          dataTokens={mergeDataTokens('md-comp-menus', props)}
          setPages={setPages}
        >
          {list}
        </MenuPageSurface>
      ) : (
        list
      )}
    </MenuPopoverFrame>
  );
}

/**
 * The one surface a popover's pages share when its submenus show in place: it holds the
 * visible page's height (`usePageHeight`), springing to it with each page and following any
 * other change at once, while the pages inside keep their own height and width.
 */
function MenuPageSurface({
  level,
  variant,
  instant,
  transition,
  className,
  dataTokens,
  setPages,
  children,
}: {
  level: number;
  variant: MenuVariant;
  instant: boolean;
  transition: MenuSubmenuTransition;
  className: string | undefined;
  dataTokens: string;
  setPages: (element: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  const [pagesRef, { height, paging, shrinking }] = usePageHeight<HTMLDivElement>(level);
  const direction = usePageDirection(level);
  const attachPages = useCallback(
    (element: HTMLDivElement | null) => {
      pagesRef.current = element;
      setPages(element);
    },
    [pagesRef, setPages],
  );
  const styles = menuPageStyles();
  return (
    <div
      data-tokens={dataTokens}
      data-variant={variant}
      data-level={level}
      data-paging={(!instant && paging) || undefined}
      data-shrinking={(!instant && shrinking) || undefined}
      style={height === undefined ? undefined : { height }}
      className={styles.surface({ class: className })}
    >
      <div
        ref={attachPages}
        data-page-direction={direction}
        data-page-transition={transition}
        className={styles.pages()}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A submenu shown in place of the menu that opened it, in a sheet (M3 adapts menus into
 * bottom sheets on small screens, where there's no room beside an item) or in a popover with
 * `submenuPresentation="replace"`: the container hides that menu while it's open, and the
 * page shows a back button and its item's label above the submenu's list. ← (→ in
 * right-to-left), Escape and the back button go back. It's portalled into the container after
 * its menu, so the sheet's or the popover's focus scope covers it.
 */
function SubmenuPage({ state, submenuRef, menuProps, submenu, title }: SubmenuPageProps) {
  const tree = useContext(MenuTreeContext)!;
  const shown = useHeldWhileLeaving(state.isOpen, tree.rootState.isOpen);
  if (!shown || !tree.container) return null;
  const { submenuLevel, ...ariaMenuProps } = menuProps;
  const own = submenu.props;
  const variant = own.variant ?? tree.variant;
  const styles = menuStyles({ variant });
  const page = menuPageStyles({ instant: tree.instant });
  const part = (name: 'header' | 'back' | 'title') =>
    cn(tree.classNames?.[name], own.classNames?.[name]);
  return (
    <Overlay portalContainer={tree.container} disableFocusManagement>
      <div
        data-submenu-panel=""
        // The header reads the menu's tokens, as the items do.
        data-tokens="md-comp-menus"
        data-variant={variant}
        className={page.panel()}
      >
        <div className={styles.sheetHeader({ class: part('header') })}>
          <MenuBackButton
            label={tree.labels.back}
            icon={tree.backIcon}
            onPress={() => state.close()}
            className={styles.sheetBack({ class: cn(page.back(), part('back')) })}
          />
          <span className={styles.sheetTitle({ class: cn(page.title(), part('title')) })}>
            {title}
          </span>
        </div>
        <MenuList
          {...mergeProps(ariaMenuProps, own)}
          listRef={submenuRef}
          layout="divider"
          variant={variant}
          density={own.density ?? tree.density}
          level={submenuLevel + 1}
          embedded
          // However it opened (a touch leaves focus on the item, now hidden), focus moves in.
          autoFocus={state.focusStrategy ?? 'first'}
        />
      </div>
    </Overlay>
  );
}

/** The back button above a submenu shown in place: 48px, with an outline focus ring. */
function MenuBackButton({
  label,
  icon,
  onPress,
  className,
}: {
  label: string;
  icon: ReactElement | undefined;
  onPress: () => void;
  className: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps, isPressed } = useButton({ onPress, 'aria-label': label }, ref);
  const { interactionProps, dataAttributes } = useM3Interaction({ isPressed }, ref);
  return (
    <button
      {...mergeProps(buttonProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      className={className}
    >
      {icon ?? <BackIcon />}
    </button>
  );
}
