'use client';

import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type JSX,
  type Key,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  DismissButton,
  I18nProvider,
  mergeProps,
  useLocale,
  useMenu,
  useMenuItem,
  useMenuSection,
  useMenuTrigger,
  usePopover,
  useSubmenuTrigger,
  type AriaMenuItemProps,
  type AriaMenuOptions,
  type AriaMenuProps,
  type AriaPopoverProps,
  type Placement,
} from 'react-aria';
import {
  Item,
  Section,
  useMenuTriggerState,
  useSubmenuTriggerState,
  useTreeState,
  type Node,
  type RootMenuTriggerState,
  type SubmenuTriggerState,
  type TreeState,
} from 'react-stately';
import { localeWithDirection } from '../../primitives/DomDirectionLocale';
import { Overlay } from '../../primitives/Overlay';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { usePresence } from '../../primitives/use-presence';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { cn } from '../../utils/cn';
import { Divider } from '../divider/Divider';
import { menuStyles, type MenuLayout, type MenuVariant } from './menu-styles';

const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

/** The default submenu arrow (Material Symbols `arrow_right`), mirrored in RTL. */
const SubmenuIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" className="rtl:-scale-x-100">
    <path d="M400-280v-400l200 200-200 200Z" />
  </svg>
);

interface MenuTriggerContextValue {
  state: RootMenuTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  menuProps: AriaMenuOptions<unknown>;
}

const omitLabelledBy = ({ 'aria-labelledby': _, ...props }: AriaMenuOptions<unknown>) => props;

const MenuTriggerContext = createContext<MenuTriggerContextValue | null>(null);

export interface MenuTriggerProps {
  /** The trigger (a Button, IconButton, …) followed by the `Menu`. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A menu opens on pointer down and takes focus, and React Aria then hides the rest of
 * the page, trigger included, from assistive tech. The browser's follow-up `mousedown` on
 * the trigger would try to focus it there and drop focus on `<body>`, out of the menu.
 * React Aria has already focused the trigger on pointer down, so the default is not needed.
 */
const keepMenuFocus = (event: MouseEvent) => event.preventDefault();

/**
 * Opens a `Menu` from a button: on press, or with Enter, Space and the arrow keys.
 * The first child is the trigger (any button-like component); the rest is the menu.
 * While the menu is open the trigger keeps a pressed state layer (`data-menu-open`), as
 * M3 asks, however the menu was opened.
 */
export function MenuTrigger({ children, open, defaultOpen, onOpenChange }: MenuTriggerProps) {
  const state = useMenuTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, triggerRef);
  // Merged into an enclosing trigger's props, so a TooltipTrigger around it still works.
  const triggerValue = useTriggerProps({
    ...(menuTriggerProps as TriggerContextValue),
    'data-menu-open': state.isOpen || undefined,
    onMouseDown: keepMenuFocus,
    ref: triggerRef,
  });
  const [trigger, ...menu] = Children.toArray(children);
  return (
    <MenuTriggerContext value={{ state, triggerRef, menuProps }}>
      <TriggerContext value={triggerValue}>{trigger}</TriggerContext>
      {menu}
    </MenuTriggerContext>
  );
}

export interface ContextMenuTriggerProps {
  /** The content the menu belongs to, followed by the `Menu`. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ignore secondary clicks and long presses. */
  disabled?: boolean;
}

/**
 * Opens a `Menu` as a context menu (M3: "A secondary click, like a right-click on a mouse
 * or a two-finger tap on a trackpad, opens a context menu"): a secondary click, Shift +
 * F10 or a long press on a touch screen opens it at the pointer (React Aria
 * `useMenuTrigger` with `trigger: 'contextMenu'`). The first child is the content the menu
 * belongs to, wrapped in a `display: contents` element so its layout doesn't change; the
 * rest is the menu.
 *
 * @example
 * <ContextMenuTrigger>
 *   <Card>…</Card>
 *   <Menu onAction={(key) => run(key)}>…</Menu>
 * </ContextMenuTrigger>
 */
export function ContextMenuTrigger({
  children,
  open,
  defaultOpen,
  onOpenChange,
  disabled,
}: ContextMenuTriggerProps) {
  const state = useMenuTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLDivElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger(
    { trigger: 'contextMenu', isDisabled: disabled },
    state,
    triggerRef,
  );
  const [target, ...menu] = Children.toArray(children);
  // React Aria names the menu after its trigger, here the whole content: name it with the
  // `Menu`'s own `aria-label` instead.
  return (
    <MenuTriggerContext value={{ state, triggerRef, menuProps: omitLabelledBy(menuProps) }}>
      <div
        {...(menuTriggerProps as TriggerContextValue)}
        ref={triggerRef}
        data-context-menu-trigger=""
        className="contents"
      >
        {target}
      </div>
      {menu}
    </MenuTriggerContext>
  );
}

/** Props of a {@link MenuItem}; the React `key` identifies it for `onAction` and selection. */
export interface MenuItemProps {
  /** The label. */
  children: ReactNode;
  /** Plain-text label for typeahead when `children` is not a string. */
  textValue?: string;
  /** Icon before the label. */
  leadingIcon?: ReactNode;
  /** Icon shown while selected (defaults to a check in selectable menus). */
  selectedIcon?: ReactNode;
  /** Second line of text. */
  description?: ReactNode;
  /**
   * A badge before the trailing text or icon (M3 anatomy), such as a `Badge` with a count.
   * It's read after the label, as part of the item's description.
   */
  badge?: ReactNode;
  /** Keyboard shortcut shown at the end, e.g. "⌘C". */
  shortcut?: string;
  /** Icon at the end (an item with a submenu shows an arrow by default). */
  trailingIcon?: ReactNode;
  'aria-label'?: string;
  className?: string;
}

/** An item in a `Menu` (a React Stately collection item: identify it with `key`). */
export const MenuItem = Item as unknown as (props: MenuItemProps) => JSX.Element;

export interface MenuGroupProps {
  /** Group label shown above its items. */
  title?: ReactNode;
  'aria-label'?: string;
  /** `MenuItem`s and `SubmenuTrigger`s. */
  children: ReactElement | ReactElement[];
}

/**
 * A group of items (a React Stately collection section): set off by dividers in the
 * `divider` layout, its own surface in the `gap` layout.
 */
export const MenuGroup = Section as unknown as (props: MenuGroupProps) => JSX.Element;

export interface SubmenuTriggerProps {
  /** The `MenuItem` that opens the submenu, then the submenu's `Menu`. */
  children: [ReactElement<MenuItemProps>, ReactElement<MenuProps>];
  /** How long (ms) the pointer rests on the item before the submenu opens. @default 200 */
  delay?: number;
}

/** What a `SubmenuTrigger` adds to its item's collection node. */
interface SubmenuItemProps extends MenuItemProps {
  submenu?: ReactElement<MenuProps>;
  submenuDelay?: number;
}

/** Only a menu collection reads a `SubmenuTrigger`; rendered on its own it's nothing. */
function SubmenuTriggerElement(): null {
  return null;
}

/** React Stately builds the item's node from this, with the submenu on its props. */
SubmenuTriggerElement.getCollectionNode = function* getCollectionNode({
  children: [item, submenu],
  delay,
}: SubmenuTriggerProps) {
  // `cloneElement` keeps the item's own `key`.
  yield { element: cloneElement(item, { submenu, submenuDelay: delay } as SubmenuItemProps) };
};

/**
 * Gives a menu item a submenu (M3: "On web, menus can open submenus"). It opens beside the
 * item, without covering it, on hover, press, Enter, Space or the arrow key pointing away
 * from the menu (Left in right-to-left), and closes with the opposite arrow or Escape.
 * While it's open, the item shows its active (pressed) layer, and the menu holding focus
 * takes rounder corners than the other one.
 *
 * @example
 * <SubmenuTrigger>
 *   <MenuItem key="share">Share</MenuItem>
 *   <Menu onAction={(key) => share(key)}>
 *     <MenuItem key="email">Email</MenuItem>
 *     <MenuItem key="link">Copy link</MenuItem>
 *   </Menu>
 * </SubmenuTrigger>
 */
export const SubmenuTrigger = SubmenuTriggerElement as unknown as (
  props: SubmenuTriggerProps,
) => JSX.Element;

export interface MenuClassNames {
  group?: string;
  item?: string;
  divider?: string;
}

export interface MenuProps extends Omit<
  AriaMenuProps<object>,
  'children' | 'items' | 'onClose' | 'autoFocus'
> {
  /** `MenuItem`s, `MenuGroup`s and `SubmenuTrigger`s. */
  children: ReactNode;
  /** `standard` (surface colours) or `vibrant` (tertiary container). @default "standard" */
  variant?: MenuVariant;
  /**
   * How groups are set apart. `divider`: one surface with dividers between groups, which M3
   * recommends on the web and for menus that scroll. `gap`: each group is its own surface,
   * 2px apart; a `gap` menu that has to scroll switches to dividers, since M3 doesn't use
   * gaps in scrolling menus. A submenu takes its parent's layout and variant unless it
   * sets its own.
   * @default "divider"
   */
  layout?: MenuLayout;
  /**
   * Web density (M3): each step down takes 4px off the items' height (44px at 0). Keep 0
   * for touch.
   * @default 0
   */
  density?: 0 | -1 | -2 | -3;
  /** Placement relative to the trigger (a submenu always opens beside its item). @default "bottom start" */
  placement?: Placement;
  /** Gap between the trigger and the menu, in px (a split button's menu sits 4px away). @default 0 */
  offset?: number;
  className?: string;
  classNames?: MenuClassNames;
  style?: CSSProperties;
}

/**
 * M3 Expressive menu: items on one surface with dividers between groups (or on grouped
 * surfaces), standard or vibrant colours, optional single or multiple selection with a
 * selected shape and check, submenus, keyboard navigation and typeahead (React Aria
 * `useMenu`). Must be inside a `MenuTrigger` or `ContextMenuTrigger`; it opens anchored to
 * the trigger in a portal that keeps the surrounding theme and direction.
 *
 * @example
 * <MenuTrigger>
 *   <IconButton icon={<MoreIcon />} aria-label="More" />
 *   <Menu onAction={(key) => run(key)}>
 *     <MenuGroup>
 *       <MenuItem key="copy" shortcut="⌘C">Copy</MenuItem>
 *       <MenuItem key="paste" shortcut="⌘V">Paste</MenuItem>
 *     </MenuGroup>
 *     <MenuGroup>
 *       <MenuItem key="delete">Delete</MenuItem>
 *     </MenuGroup>
 *   </Menu>
 * </MenuTrigger>
 */
export function Menu(props: MenuProps) {
  const trigger = useContext(MenuTriggerContext);
  if (!trigger) throw new Error('[@windmorph/react] <Menu> must be used inside <MenuTrigger>.');
  const { isPresent, isExiting, exitProps } = usePresence(trigger.state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting}>
      <MenuPopover {...props} trigger={trigger} isExiting={isExiting} exitProps={exitProps} />
    </Overlay>
  );
}

/** Shared by a menu and its submenus. */
interface MenuTreeContextValue {
  rootState: RootMenuTriggerState;
  /** The root popover, which submenus portal into (inside its focus scope, never inert). */
  container: HTMLElement | null;
  /** The level of the menu holding focus (0 is the root menu). */
  activeLevel: number;
  setActiveLevel: (level: number) => void;
  /** What submenus inherit. */
  layout: MenuLayout;
  variant: MenuVariant;
  density: MenuProps['density'];
}

const MenuTreeContext = createContext<MenuTreeContextValue | null>(null);

/** The menu element an item is rendered in (a submenu's parent). */
const MenuListContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

const subscribeToNothing = () => () => {};

/**
 * React Aria resolves `start` / `end` from its locale context, not the DOM `dir`, so an
 * RTL region without an `I18nProvider` would align the menu to the wrong edge. Resolve
 * them to physical sides from the trigger's computed direction instead.
 */
function toPhysicalPlacement(placement: Placement, direction: string): Placement {
  const rtl = direction === 'rtl';
  return placement
    .replace('start', rtl ? 'right' : 'left')
    .replace('end', rtl ? 'left' : 'right') as Placement;
}

type ExitProps = ReturnType<typeof usePresence>['exitProps'];

function MenuPopover({
  trigger,
  isExiting,
  exitProps,
  placement = 'bottom start',
  offset = 0,
  layout = 'divider',
  variant = 'standard',
  ...props
}: MenuProps & { trigger: MenuTriggerContextValue; isExiting: boolean; exitProps: ExitProps }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const setPopover = useCallback((element: HTMLDivElement | null) => {
    popoverRef.current = element;
    setContainer(element);
  }, []);
  const [activeLevel, setActiveLevel] = useState(0);
  // The DOM is the source of truth for direction; read it like an external store.
  const direction = useSyncExternalStore(
    subscribeToNothing,
    () =>
      trigger.triggerRef.current ? getComputedStyle(trigger.triggerRef.current).direction : 'ltr',
    () => 'ltr',
  );
  // Submenus' arrow keys and placement follow the locale's direction: give it the DOM's.
  const { locale, direction: localeDirection } = useLocale();
  const menuLocale =
    direction === localeDirection
      ? locale
      : localeWithDirection(locale, direction === 'rtl' ? 'rtl' : 'ltr');
  const {
    popoverProps,
    underlayProps,
    placement: actualPlacement,
  } = usePopover(
    {
      triggerRef: trigger.triggerRef,
      popoverRef,
      placement: toPhysicalPlacement(placement, direction),
      offset,
    },
    trigger.state,
  );
  const close = trigger.state.close;
  // Tab moves on from an open menu and closes it and its submenus (the APG menu button
  // pattern). React Aria's focus scope moves focus past the trigger, or back to it when
  // nothing follows; without the close, the menu stayed open with focus outside it. That
  // scope handles Tab on the document's capture phase and stops it, so this listens on the
  // window's, which comes first.
  useEffect(() => {
    const view = container?.ownerDocument.defaultView;
    if (!container || !view) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
      if (container.contains(container.ownerDocument.activeElement)) close();
    };
    view.addEventListener('keydown', onKeyDown, true);
    return () => view.removeEventListener('keydown', onKeyDown, true);
  }, [container, close]);
  const styles = menuStyles();
  return (
    <>
      <div {...underlayProps} className="fixed inset-0" />
      <div {...popoverProps} ref={setPopover} className={styles.popover()}>
        <DismissButton onDismiss={trigger.state.close} />
        <div
          {...exitProps}
          data-exiting={isExiting || undefined}
          data-placement={actualPlacement ?? undefined}
          className={styles.reveal()}
        >
          <TriggerContext value={null}>
            <I18nProvider locale={menuLocale}>
              <MenuTreeContext
                value={{
                  rootState: trigger.state,
                  container,
                  activeLevel,
                  setActiveLevel,
                  layout,
                  variant,
                  density: props.density,
                }}
              >
                <MenuList
                  {...mergeProps(trigger.menuProps, props)}
                  layout={layout}
                  variant={variant}
                  level={0}
                  onClose={trigger.state.close}
                  autoFocus={trigger.state.focusStrategy || true}
                />
              </MenuTreeContext>
            </I18nProvider>
          </TriggerContext>
        </div>
        <DismissButton onDismiss={trigger.state.close} />
      </div>
    </>
  );
}

type Position = 'only' | 'first' | 'middle' | 'last';
type Edges = { top: boolean; bottom: boolean };

const positionOf = (index: number, count: number): Position =>
  count === 1 ? 'only' : index === 0 ? 'first' : index === count - 1 ? 'last' : 'middle';

/** Which of a group's edges have the outer corners (the others have 8px). */
const roundEdges = (position: Position): Edges => ({
  top: position === 'only' || position === 'first',
  bottom: position === 'only' || position === 'last',
});

/** Sections become groups; runs of loose items between them form implicit groups. */
function toGroups(nodes: Node<object>[]): (Node<object> | Node<object>[])[] {
  const groups: (Node<object> | Node<object>[])[] = [];
  let run: Node<object>[] = [];
  for (const node of nodes) {
    if (node.type === 'section') {
      if (run.length) groups.push(run);
      run = [];
      groups.push(node);
    } else {
      run.push(node);
    }
  }
  if (run.length) groups.push(run);
  return groups;
}

type MenuListProps = Omit<MenuProps, 'placement' | 'layout' | 'variant'> &
  Pick<AriaMenuOptions<object>, 'onClose' | 'autoFocus' | 'onKeyDown' | 'onKeyUp'> & {
    layout: MenuLayout;
    variant: MenuVariant;
    /** 0 for the root menu, then one more per submenu. */
    level: number;
    listRef?: RefObject<HTMLDivElement | null>;
  };

/**
 * Whether the list has had to scroll, from a `ResizeObserver` (so it's measured only when
 * its size changes). Once true it stays true while the menu is open, so a `gap` menu that
 * switches to dividers can't flip back and forth.
 */
function useHasScrolled(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [scrolls, setScrolls] = useState(false);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!enabled || scrolls || !element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (element.scrollHeight > element.clientHeight + 1) setScrolls(true);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, enabled, scrolls]);
  return scrolls;
}

function MenuList({
  variant,
  layout: requestedLayout,
  density = 0,
  level,
  className,
  classNames,
  style,
  listRef,
  ...props
}: MenuListProps) {
  // MenuItem / MenuGroup are React Stately Item / Section, so children are a collection.
  assertCollectionChildren(
    props.children,
    'Menu',
    'MenuItem, MenuGroup and SubmenuTrigger elements',
  );
  const tree = useContext(MenuTreeContext);
  // M3: "Disabled menu items can receive focus but aren't selectable."
  const state = useTreeState({
    ...(props as AriaMenuProps<object>),
    disabledBehavior: 'selection',
  });
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = listRef ?? ownRef;
  const { menuProps } = useMenu(props as AriaMenuOptions<object>, state, ref);
  const groups = toGroups([...state.collection]);
  const scrolled = useHasScrolled(ref, requestedLayout === 'gap');
  const layout: MenuLayout = scrolled ? 'divider' : requestedLayout;
  const styles = menuStyles({ variant, layout });
  // While a submenu is open, the menu holding focus is rounder than the others (M3).
  const submenuOpen = Boolean(tree && tree.rootState.expandedKeysStack.length > 0);
  const shape = !submenuOpen ? undefined : tree?.activeLevel === level ? 'active' : 'inactive';
  const setActive = tree?.setActiveLevel;

  return (
    <div
      {...mergeProps(menuProps, {
        // Focus events bubble through portals: count only focus inside this menu's element.
        onFocus: (event: FocusEvent<HTMLDivElement>) => {
          if (event.currentTarget.contains(event.target)) setActive?.(level);
        },
      })}
      ref={ref}
      style={{ ...style, ...(density ? { '--m3-menu-density': density } : null) }}
      data-variant={variant}
      data-layout={layout}
      data-shape={shape}
      className={styles.menu({ class: className })}
    >
      <MenuListContext value={ref}>
        {groups.map((group, index) => {
          const position = positionOf(index, groups.length);
          // In the divider layout the menu is the surface: its first and last items nest in
          // its corners, and dividers go between groups.
          const edges: Edges =
            layout === 'divider'
              ? { top: index === 0, bottom: index === groups.length - 1 }
              : roundEdges(position);
          const groupStyles = menuStyles({ variant, layout, groupPosition: position, morph: true });
          return (
            <GroupWithDivider
              key={Array.isArray(group) ? group[0]!.key : group.key}
              divider={
                layout === 'divider' && index > 0 ? (
                  <Divider className={styles.divider({ class: classNames?.divider })} />
                ) : null
              }
            >
              {Array.isArray(group) ? (
                <div
                  role="presentation"
                  className={groupStyles.group({ class: classNames?.group })}
                >
                  <MenuItems
                    nodes={group}
                    state={state}
                    variant={variant}
                    edges={edges}
                    classNames={classNames}
                  />
                </div>
              ) : (
                <MenuSection
                  section={group}
                  state={state}
                  variant={variant}
                  className={groupStyles.group({ class: classNames?.group })}
                  headingClassName={groupStyles.heading()}
                  edges={edges}
                  classNames={classNames}
                />
              )}
            </GroupWithDivider>
          );
        })}
      </MenuListContext>
    </div>
  );
}

function GroupWithDivider({ divider, children }: { divider: ReactNode; children: ReactNode }) {
  return (
    <>
      {divider}
      {children}
    </>
  );
}

function MenuSection({
  section,
  state,
  variant,
  className,
  headingClassName,
  edges,
  classNames,
}: {
  section: Node<object>;
  state: TreeState<object>;
  variant: MenuVariant;
  className: string;
  headingClassName: string;
  edges: Edges;
  classNames?: MenuClassNames;
}) {
  const { itemProps, headingProps, groupProps } = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  });
  return (
    <div {...itemProps} className={className}>
      {section.rendered && (
        <span {...headingProps} className={headingClassName}>
          {section.rendered}
        </span>
      )}
      <div {...groupProps} className="flex flex-col">
        <MenuItems
          nodes={[...section.childNodes]}
          state={state}
          variant={variant}
          // A heading takes the group's top edge, so the first item doesn't touch it.
          edges={{ ...edges, top: !section.rendered && edges.top }}
          classNames={classNames}
        />
      </div>
    </div>
  );
}

/**
 * Items nest their corners inside the container's: an item on an outer edge gets the
 * outer corner less the 4px padding, and every other corner is 4px.
 */
function MenuItems({
  nodes,
  state,
  variant,
  edges,
  classNames,
}: {
  nodes: Node<object>[];
  state: TreeState<object>;
  variant: MenuVariant;
  edges: Edges;
  classNames?: MenuClassNames;
}) {
  return nodes.map((node, index) => {
    const itemProps: MenuItemViewProps = {
      node,
      state,
      variant,
      top: index === 0 && edges.top ? 'outer' : 'plain',
      bottom: index === nodes.length - 1 && edges.bottom ? 'outer' : 'plain',
      classNames,
    };
    return (node.props as SubmenuItemProps).submenu ? (
      <SubmenuItemView key={node.key} {...itemProps} />
    ) : (
      <MenuItemView key={node.key} {...itemProps} />
    );
  });
}

interface MenuItemViewProps {
  node: Node<object>;
  state: TreeState<object>;
  variant: MenuVariant;
  top: 'outer' | 'plain';
  bottom: 'outer' | 'plain';
  classNames?: MenuClassNames;
  /** A submenu trigger's props (from `useSubmenuTrigger`) and ref. */
  triggerProps?: Partial<AriaMenuItemProps>;
  itemRef?: RefObject<HTMLDivElement | null>;
  /** Whether the item's submenu is open (its active state). */
  submenuOpen?: boolean;
}

/** An item that opens a submenu, and the submenu's popover. */
function SubmenuItemView(props: MenuItemViewProps) {
  const tree = useContext(MenuTreeContext)!;
  const parentMenuRef = useContext(MenuListContext)!;
  const { submenu, submenuDelay } = props.node.props as SubmenuItemProps;
  const submenuState = useSubmenuTriggerState({ triggerKey: props.node.key }, tree.rootState);
  const itemRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const { submenuTriggerProps, submenuProps, popoverProps } = useSubmenuTrigger(
    {
      parentMenuRef,
      submenuRef,
      delay: submenuDelay,
      isDisabled: props.state.disabledKeys.has(props.node.key),
    },
    submenuState,
    itemRef,
  );
  const { isOpen, ...triggerProps } = submenuTriggerProps;
  return (
    <>
      <MenuItemView {...props} triggerProps={triggerProps} itemRef={itemRef} submenuOpen={isOpen} />
      <SubmenuPopover
        state={submenuState}
        triggerRef={itemRef}
        submenuRef={submenuRef}
        menuProps={submenuProps}
        popoverProps={popoverProps}
        submenu={submenu!}
      />
    </>
  );
}

interface SubmenuPopoverProps {
  state: SubmenuTriggerState;
  triggerRef: RefObject<HTMLDivElement | null>;
  submenuRef: RefObject<HTMLDivElement | null>;
  menuProps: ReturnType<typeof useSubmenuTrigger>['submenuProps'];
  popoverProps: ReturnType<typeof useSubmenuTrigger>['popoverProps'];
  submenu: ReactElement<MenuProps>;
}

function SubmenuPopover(props: SubmenuPopoverProps) {
  const tree = useContext(MenuTreeContext)!;
  const { isPresent, isExiting, exitProps } = usePresence(props.state.isOpen);
  if (!isPresent || !tree.container) return null;
  // Inside the root popover: its focus scope and outside-press handling cover the submenu,
  // and the modal root menu doesn't make it inert.
  return (
    <Overlay portalContainer={tree.container} disableFocusManagement isExiting={isExiting}>
      <SubmenuPopoverContent {...props} isExiting={isExiting} exitProps={exitProps} />
    </Overlay>
  );
}

function SubmenuPopoverContent({
  state,
  triggerRef,
  submenuRef,
  menuProps,
  popoverProps,
  submenu,
  isExiting,
  exitProps,
}: SubmenuPopoverProps & { isExiting: boolean; exitProps: ExitProps }) {
  const tree = useContext(MenuTreeContext)!;
  const popoverRef = useRef<HTMLDivElement>(null);
  const { submenuLevel, ...ariaMenuProps } = menuProps;
  const { popoverProps: positionProps, placement } = usePopover(
    {
      ...popoverProps,
      // React Aria handles this as a submenu's popover (dismissable, non-modal).
      ...({ trigger: 'SubmenuTrigger' } as Partial<AriaPopoverProps>),
      triggerRef,
      popoverRef,
      placement: 'end top',
      // Beside the parent menu (the 4px padding around the item and a 2px gap), with its
      // first item level with the item that opened it.
      offset: 6,
      crossOffset: -4,
    },
    state,
  );
  const own = submenu.props;
  const styles = menuStyles();
  return (
    // `w-max`: positioned inside the narrower root popover, it would otherwise shrink to fit
    // what's left of that popover's width and wrap every label.
    <div {...positionProps} ref={popoverRef} className={cn(styles.popover(), 'w-max')}>
      <div
        {...exitProps}
        data-exiting={isExiting || undefined}
        data-placement={placement ?? undefined}
        className={styles.reveal()}
      >
        <MenuList
          {...mergeProps(ariaMenuProps, own)}
          listRef={submenuRef}
          layout={own.layout ?? tree.layout}
          variant={own.variant ?? tree.variant}
          density={own.density ?? tree.density}
          level={submenuLevel + 1}
        />
      </div>
    </div>
  );
}

function MenuItemView({
  node,
  state,
  variant,
  top,
  bottom,
  classNames,
  triggerProps,
  itemRef,
  submenuOpen = false,
}: MenuItemViewProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const ref = itemRef ?? ownRef;
  const props = node.props as SubmenuItemProps;
  const isDisabled = state.disabledKeys.has(node.key);
  const multiple = state.selectionManager.selectionMode === 'multiple';
  const {
    menuItemProps,
    labelProps,
    descriptionProps,
    keyboardShortcutProps,
    isSelected,
    isPressed,
  } = useMenuItem(
    {
      ...triggerProps,
      key: node.key,
      'aria-label': props['aria-label'],
      // Disabled items stay focusable (the menu's `disabledBehavior`) but do nothing.
      isDisabled,
      // M3: multi-select menus stay open until they're dismissed, Enter included.
      closeOnSelect: multiple ? false : undefined,
    },
    state,
    ref,
  );
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isPressed, isDisabled, isSelected },
    ref,
  );
  const selectable = state.selectionManager.selectionMode !== 'none';
  const styles = menuStyles({
    variant,
    itemTop: top,
    itemBottom: bottom,
    hasDescription: Boolean(props.description),
  });
  const selectedIcon = props.selectedIcon ?? (selectable ? <CheckIcon /> : null);
  const trailingIcon = props.trailingIcon ?? (props.submenu ? <SubmenuIcon /> : null);
  const badgeId = useId();
  const describedBy =
    [menuItemProps['aria-describedby'], props.badge ? badgeId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      {...mergeProps(menuItemProps, interactionProps)}
      {...dataAttributes}
      aria-describedby={describedBy}
      data-menu-open={submenuOpen || undefined}
      ref={ref}
      className={styles.item({ class: cn(classNames?.item, props.className) })}
    >
      {props.leadingIcon && selectedIcon ? (
        <span aria-hidden="true" className={styles.icon()}>
          {isSelected ? selectedIcon : props.leadingIcon}
        </span>
      ) : props.leadingIcon ? (
        <span aria-hidden="true" className={styles.icon()}>
          {props.leadingIcon}
        </span>
      ) : selectedIcon ? (
        // No leading icon: the selected icon expands in when selected (Compose).
        <span aria-hidden="true" className={styles.selectedIcon()}>
          <span className={styles.selectedIconInner()}>
            <span className={styles.icon()}>{selectedIcon}</span>
          </span>
        </span>
      ) : null}
      <span className={styles.text()}>
        <span {...labelProps}>{node.rendered}</span>
        {props.description && (
          <span {...descriptionProps} className={styles.description()}>
            {props.description}
          </span>
        )}
      </span>
      {props.badge && (
        <span id={badgeId} className={styles.badge()}>
          {props.badge}
        </span>
      )}
      {props.shortcut && (
        <kbd {...keyboardShortcutProps} className={cn(styles.trailing(), 'font-plain')}>
          {props.shortcut}
        </kbd>
      )}
      {trailingIcon && (
        <span aria-hidden="true" className={styles.trailing()}>
          {trailingIcon}
        </span>
      )}
    </div>
  );
}

export type { Key as MenuKey };
