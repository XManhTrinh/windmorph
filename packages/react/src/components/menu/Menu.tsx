'use client';

import {
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
  type ComponentType,
  type CSSProperties,
  type ElementType,
  type FocusEvent,
  type JSX,
  type KeyboardEvent as ReactKeyboardEvent,
  type Key,
  type ReactElement,
  type ReactNode,
  type Ref,
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
  useObjectRef,
  usePopover,
  useSubmenuTrigger,
  type AriaMenuItemProps,
  type AriaMenuOptions,
  type AriaMenuProps,
  type AriaPopoverProps,
  type PopoverAria,
  type Placement,
} from 'react-aria';
import {
  Item,
  Section,
  useMultipleSelectionState,
  useSubmenuTriggerState,
  useTreeState,
  type MultipleSelectionState,
  type Node,
  type Selection,
  type SelectionMode,
  type RootMenuTriggerState,
  type SubmenuTriggerState,
  type TreeState,
} from 'react-stately';
import { useLabels } from '../labels/use-labels';
import { localeWithDirection } from '../../primitives/locale-with-direction';
import { Overlay } from '../../primitives/Overlay';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { usePresence } from '../../primitives/use-presence';
import { densityAttribute, type Density } from '../../tokens/density';
import { toAriaPlacement } from '../../utils/placement';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { cn } from '../../utils/cn';
import { useTypeaheadDelegate } from '../../utils/typeahead';
import { COMPACT_WINDOW, useMediaQuery } from '../date-picker/use-media-query';
import { Divider } from '../divider/Divider';
import { usePreloadBottomSheet } from '../sheet/lazy-bottom-sheet';
import { onDemand, usePreloadOnIntent } from '../../utils/load-on-demand';
import type { MenuPopoverInPlaceProps, MenuSheetProps } from './menu-in-place';
import { useRevealEntering } from './use-reveal-entering';
import { menuOwnWidth, menuStyles, type MenuLayout, type MenuVariant } from './menu-styles';
import { MenuTriggerContext, triggerMenuProps, type MenuTriggerContextValue } from './menu-trigger';

export {
  ContextMenuTrigger,
  MenuTrigger,
  type ContextMenuTriggerProps,
  type MenuTriggerProps,
} from './menu-trigger';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitRootProps, type RootDOMProps } from '../../utils/root-props';

const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

/** Clears the link attributes `useMenuItem` copies from an item's props onto one that isn't a link. */
const NOT_A_LINK = {
  href: undefined,
  target: undefined,
  rel: undefined,
  download: undefined,
  ping: undefined,
  referrerPolicy: undefined,
};

/** The default submenu arrow (Material Symbols `arrow_right`), mirrored in RTL. */
const SubmenuIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" className="rtl:-scale-x-100">
    <path d="M400-280v-400l200 200-200 200Z" />
  </svg>
);

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
  /** Second line of text (supporting text), read as part of the item's name after the label. */
  description?: ReactNode;
  /**
   * A badge before the trailing text or icon (M3 anatomy), such as a `Badge` with a count.
   * It's read after the name, as the item's description.
   */
  badge?: ReactNode;
  /** Keyboard shortcut shown at the end, e.g. "⌘C", read as the item's description. */
  shortcut?: string;
  /** Icon at the end (an item with a submenu shows an arrow by default). */
  trailingIcon?: ReactNode;
  /**
   * Makes the item a link: a real `<a>` with the item's look, role and keys, so the browser's
   * link menu (open in a new tab, copy or save the link) and modified clicks work. A press,
   * Enter or Space follows it, through a `RouterProvider` (such as `NextRouterProvider`) on a
   * plain click, and closes the menu. A disabled item, or one that opens a submenu, isn't a link.
   */
  href?: string;
  /** A link item's target; `_blank` adds `rel="noopener noreferrer"` unless `rel` is given. */
  target?: string;
  /** A link item's `rel`, e.g. `"nofollow"`. */
  rel?: string;
  /** Downloads the link item's file instead of opening it (optionally with a file name). */
  download?: boolean | string;
  /** Accessible name when the label isn't plain text. */
  'aria-label'?: string;
  /** Classes for the item, merged after `classNames.item`; consumer classes win. */
  className?: string;
}

/** An item in a `Menu` (a React Stately collection item: identify it with `key`). */
export const MenuItem = Item as unknown as (props: MenuItemProps) => JSX.Element;

export interface MenuGroupProps {
  /** Group label shown above its items. */
  title?: ReactNode;
  /** Accessible name for the group when it has no `title`. */
  'aria-label'?: string;
  /** `MenuItem`s and `SubmenuTrigger`s. */
  children: ReactElement | ReactElement[];
  /**
   * A group of choices with a selection of its own, beside the menu's other items: its items
   * are radio items (`single`) or checkbox items (`multiple`), whatever the menu's own
   * `selectionMode`, and choosing one never changes another group's. Closing follows the
   * group's mode, as a whole menu's would: a choice closes the menu (Space keeps it open), a
   * toggle keeps it open. `none` makes the group's items plain actions that close the menu,
   * in a selectable menu too.
   * @default the menu's `selectionMode`
   */
  selectionMode?: SelectionMode;
  /** The group's selected keys (controlled), with `selectionMode`; `'all'` is all its items. */
  selectedKeys?: AriaMenuProps<object>['selectedKeys'];
  /** The group's keys selected at first (uncontrolled), with `selectionMode`. */
  defaultSelectedKeys?: AriaMenuProps<object>['defaultSelectedKeys'];
  /** Called with the group's selected keys, its own only, when they change. */
  onSelectionChange?: (keys: Selection) => void;
  /**
   * With `selectionMode`: the group's last selected item can be deselected, leaving none.
   * `false` keeps one of its items selected. @default true
   */
  deselectable?: boolean;
}

/**
 * A group of items (a React Stately collection section): set off by dividers in the
 * `divider` layout, its own surface in the `gap` layout. With `selectionMode`, a group of
 * choices whose selection is its own, beside the menu's plain actions (M3's menus put a
 * selectable group beside actions).
 */
export const MenuGroup = Section as unknown as (props: MenuGroupProps) => JSX.Element;

export interface SubmenuTriggerProps {
  /** The `MenuItem` that opens the submenu, then the submenu's `Menu`. */
  children: [ReactElement<MenuItemProps>, ReactElement<MenuProps>];
  /** How long (ms) the pointer rests on the item before the submenu opens. @default 200 */
  openDelay?: number;
  /** @deprecated Use `openDelay`, its name since 0.2.9; this one goes in a later minor release. */
  delay?: number;
}

/** What a `SubmenuTrigger` adds to its item's collection node. */
interface SubmenuItemProps extends MenuItemProps {
  submenu?: ReactElement<MenuProps>;
  submenuDelay?: number;
  /** See {@link CheckableMenuItemProps}. */
  checkable?: boolean;
}

/**
 * Props of a {@link CheckableMenuItem}, for the library's own menus (not exported from the
 * package): in a selectable menu, `checkable={false}` makes an item a plain action, with the
 * `menuitem` role, no checked state and no check, that closes the menu like any action.
 */
export interface CheckableMenuItemProps extends MenuItemProps {
  /** Whether the item can be checked in a selectable menu. @default true */
  checkable?: boolean;
}

/** A {@link MenuItem} that can opt out of the menu's selection (library-internal). */
export const CheckableMenuItem = Item as unknown as (props: CheckableMenuItemProps) => JSX.Element;

/** Only a menu collection reads a `SubmenuTrigger`; rendered on its own it's nothing. */
function SubmenuTriggerElement(): null {
  return null;
}

/** React Stately builds the item's node from this, with the submenu on its props. */
SubmenuTriggerElement.getCollectionNode = function* getCollectionNode({
  children: [item, submenu],
  openDelay,
  delay,
}: SubmenuTriggerProps) {
  const submenuDelay = openDelay ?? delay;
  // `cloneElement` keeps the item's own `key`.
  yield { element: cloneElement(item, { submenu, submenuDelay } as SubmenuItemProps) };
};

/**
 * Gives a menu item a submenu (M3: "On web, menus can open submenus"). It opens beside the
 * item, without covering it, on hover, press, Enter, Space or the arrow key pointing away
 * from the menu (Left in right-to-left), and closes with the opposite arrow or Escape.
 * While it's open, the item shows its active (pressed) layer, and the menu holding focus
 * takes rounder corners than the other one. Shown in place of its menu instead (the root
 * menu's `submenuPresentation="replace"`, or a bottom sheet), it opens on press, Enter, Space
 * or that arrow, never on hover, below a back button; the back button, Escape and the
 * opposite arrow go back.
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
  /**
   * The menu's surface (the `menu` element): its colour, corners, size and the list that
   * scrolls. In a sheet it spans the sheet, without a surface of its own. With
   * `submenuPresentation="replace"`, the surface that holds the pages, around the lists.
   */
  panel?: string;
  /**
   * The bottom sheet the menu opens in (`presentation="sheet"`, or `"auto"` on compact
   * windows): the sheet's surface, as its `classNames.panel`.
   */
  sheet?: string;
  /** Each group of items (its own surface in the `gap` layout). */
  group?: string;
  /** Each `MenuGroup`'s heading. */
  heading?: string;
  /** Each item. */
  item?: string;
  /** Each item's leading icon, or the icon marking a selected item. */
  icon?: string;
  /** Each item's `description` line. */
  description?: string;
  /** Each item's keyboard `shortcut`. */
  shortcut?: string;
  /** Each item's trailing icon, including a submenu's arrow. */
  trailingIcon?: string;
  /** The dividers between groups in the `divider` layout. */
  divider?: string;
  /** The row above a submenu shown in place of its menu: its back button and its title. */
  header?: string;
  /** The back button in that row, which goes back to the menu that opened the submenu. */
  back?: string;
  /** The submenu's title in that row: the label of the item that opened it. */
  title?: string;
}

export interface MenuProps
  extends
    Omit<
      AriaMenuProps<object>,
      | 'children'
      | 'items'
      | 'onClose'
      | 'autoFocus'
      | 'disallowEmptySelection'
      // The arrow keys always wrap and Escape always closes the menu, as M3's menus do.
      | 'shouldFocusWrap'
      | 'escapeKeyBehavior'
    >,
    Omit<RootDOMProps, keyof AriaMenuProps<object>> {
  /**
   * With `selectionMode`: the last selected item can be deselected, leaving none. `false` keeps
   * at least one item selected. @default true
   */
  deselectable?: boolean;
  /**
   * The keys of items that can't be chosen. They stay focusable, as M3 asks ("Disabled menu
   * items can receive focus but aren't selectable").
   */
  disabledKeys?: AriaMenuProps<object>['disabledKeys'];
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
   * Web density (M3: "On web only … Increasing density decreases the top and bottom
   * padding"): each step down takes 4px off the items' height (44px at 0, 32px at -3) and 2px
   * off the space around dividers. Left out, the menu takes the density of the nearest
   * `ThemeProvider` or `ThemeScope`; a submenu takes its parent menu's. Keep 0 for touch.
   * @default 0
   */
  density?: Density;
  /**
   * Placement relative to the trigger: a side, then optionally the edge to align with
   * (`start` / `end` follow the text direction). A submenu opens beside its item, or in its
   * place (`submenuPresentation`).
   * @default "bottom-start"
   */
  placement?: MenuPlacement;
  /** Gap between the trigger and the menu, in px (a split button's menu sits 4px away). @default 0 */
  offset?: number;
  /**
   * The least space kept between the menu and the window's edges (or the `portalContainer`'s),
   * in px. A split button passes 0, so its menu lines up with the trailing button even at the
   * edge of the screen.
   * @default 12
   */
  containerPadding?: number;
  /**
   * Where the menu opens. `popover`: anchored to its trigger. `sheet`: in a modal bottom
   * sheet. `auto`: a sheet on compact windows (below 600px wide) and a popover on larger
   * ones (M3: "Consider adapting menus into bottom sheets on small screens"). Set it on the
   * root menu.
   * @default "popover"
   */
  presentation?: MenuPresentation;
  /**
   * Where a submenu shows in a popover. `beside`: in a popover of its own next to its item,
   * without covering it (M3: "Submenus should open next to the parent menu item without
   * overlapping it"), for app menus, toolbars and context menus with room. `replace`: in place
   * of the menu, on the same surface, below a back button and its item's label, for a menu
   * confined to a small surface (a video player's settings, a card, a narrow panel). The
   * surface keeps its corner and its side of the trigger, and its height follows each page.
   * `replace` extends M3, which shows submenus beside their item. Set it on the root menu; a
   * bottom sheet always shows submenus in place.
   * @default "beside"
   */
  submenuPresentation?: MenuSubmenuPresentation;
  /**
   * How a submenu shown in place (`submenuPresentation="replace"`, or in a sheet) and the page
   * it leaves change. `fade`: the page going out goes at once and the one coming in fades in.
   * `slide`: M3's forward and backward pattern, the page coming in sliding 30px in from the end
   * edge going forward and from the start edge going back (mirrored in right-to-left) as it
   * fades in. Under reduced motion only the fade stays; `instant` drops both. Set it on the
   * root menu.
   * @default "fade"
   */
  submenuTransition?: MenuSubmenuTransition;
  /**
   * On a submenu's `Menu` (inside a `SubmenuTrigger`): what follows a choice on it, by press or
   * Enter, in a single-select submenu or a single-choice `MenuGroup` of it. `close`: the whole
   * menu closes, as in any single-select menu. `back`: only this submenu closes, so the page
   * that opened it shows again (shown in place) or stays (beside), showing the new choice, with
   * focus on the item that opened it; for a settings page whose choice is all it's for. Space
   * keeps the submenu open either way, a toggle in a multi-select submenu never closes it, and
   * an action (a plain item) still closes the whole menu.
   * @default "close"
   */
  afterSelect?: MenuAfterSelect;
  /**
   * The element the menu's popover opens in, instead of `body`: a video player, so the menu
   * opens over the picture, moves with the player and shows with it in full screen, opened
   * before or after. The menu is placed against its trigger as before, then kept inside the
   * element: `containerPadding` from its edges, flipping, shifting and capping its height (the
   * list scrolls) within it, and placed again when the element resizes. It keeps the theme,
   * `ThemeScope`, density and direction of where it's declared. Give the element
   * `position: relative`, keep the trigger inside it or along its edge, and pass the element
   * from a callback ref kept in state. It must draw its children (not a `<video>`, `<canvas>`
   * or `<img>`). Popovers only: a bottom sheet opens over the window (and inside the element
   * in full screen, as every overlay does). Set it on the root menu.
   */
  portalContainer?: Element | null;
  /**
   * Words the menu shows above a submenu shown in place (in a sheet, or with
   * `submenuPresentation="replace"`). Set them on the root menu. A {@link LabelsProvider} sets
   * them for the whole app.
   */
  labels?: Partial<MenuLabels>;
  /**
   * The icon of the back button above a submenu shown in place of its menu. Set it on the root
   * menu. @default Material Symbols `arrow_back`, mirrored in right-to-left
   */
  backIcon?: ReactElement;
  /**
   * Open and close with no motion (M3: "In dense products, such as on desktop, menus can
   * open instantly to reduce motion"), and change pages shown in place with none. Submenus
   * follow their root menu. Popovers only: a menu
   * shown as a bottom sheet (`presentation="sheet"`, or `auto` on a compact window) keeps the
   * sheet's slide, as M3's and Compose's modal bottom sheets always animate; under reduced
   * motion it fades instead.
   * @default false
   */
  instant?: boolean;
  /**
   * Goes with `style` on the menu's outermost element: the box React Aria places against the
   * trigger, or the bottom sheet's outermost element in a sheet. The surface inside keeps
   * its size and its place against the trigger whatever layout class lands here (the box
   * keeps the menu's own width); style it with `classNames.panel`.
   */
  className?: string;
  /** Classes for each part, by slot. */
  classNames?: MenuClassNames;
  /** Goes on the menu's outermost element, with `className`. */
  style?: CSSProperties;
  /** Ref to the menu's list, the `role="menu"` element, in a popover or a sheet. */
  ref?: Ref<HTMLDivElement>;
}

/** Where a {@link Menu} sits against its trigger: a side, then optionally the edge it aligns with. */
export type MenuPlacement =
  | 'top'
  | 'bottom'
  | 'start'
  | 'end'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'start-top'
  | 'start-bottom'
  | 'end-top'
  | 'end-bottom';

/** Where a {@link Menu} opens. */
export type MenuPresentation = 'popover' | 'sheet' | 'auto';

/** Where a {@link Menu}'s submenus show in a popover: beside their item, or in its place. */
export type MenuSubmenuPresentation = 'beside' | 'replace';

/** How a {@link Menu}'s pages change when its submenus show in place: a fade, or a slide as it fades. */
export type MenuSubmenuTransition = 'fade' | 'slide';

/** What follows a choice on a submenu: the whole menu closes, or only the submenu, going back. */
export type MenuAfterSelect = 'close' | 'back';

/** Words a {@link Menu} shows. */
export interface MenuLabels {
  /**
   * The button above a submenu shown in place (in a sheet, or with
   * `submenuPresentation="replace"`) that goes back to the menu that opened it.
   * @default "Back"
   */
  back: string;
}

export const DEFAULT_LABELS: MenuLabels = { back: 'Back' };

/**
 * M3 Expressive menu: items on one surface with dividers between groups (or on grouped
 * surfaces), standard or vibrant colours, optional single or multiple selection with a
 * selected shape and check, submenus beside their item or in its place, keyboard navigation
 * and typeahead (React Aria `useMenu`). Must be inside a `MenuTrigger` or
 * `ContextMenuTrigger`; it opens anchored to the trigger in a portal (in `body`, or in
 * `portalContainer`) that keeps the surrounding theme and direction.
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
export function Menu({
  presentation = 'popover',
  instant = false,
  submenuPresentation = 'beside',
  submenuTransition = 'fade',
  portalContainer,
  ...props
}: MenuProps) {
  const trigger = useContext(MenuTriggerContext);
  if (!trigger) throw new Error('[@windmorph/react] <Menu> must be used inside <MenuTrigger>.');
  const compact = useMediaQuery(COMPACT_WINDOW);
  const presence = usePresence(trigger.state.isOpen);
  const asSheet = presentation === 'sheet' || (presentation === 'auto' && compact);
  const replace = submenuPresentation === 'replace';
  const contained = portalContainer != null;
  usePreloadBottomSheet(trigger.triggerRef, asSheet);
  // The sheet, pages in place and a `portalContainer` load their code first: usually in the
  // browser's first idle period after mount, or as the pointer moves over the trigger or focus
  // enters it, before the menu opens.
  usePreloadOnIntent(trigger.triggerRef, preloadMenuInPlace, asSheet || replace || contained);
  if (asSheet) {
    return <menuSheet.Component {...props} trigger={trigger} transition={submenuTransition} />;
  }
  // An instant menu leaves at once, without waiting for an exit transition.
  const isPresent = instant ? trigger.state.isOpen : presence.isPresent;
  const isExiting = !instant && presence.isExiting;
  if (!isPresent) return null;
  if (replace || contained) {
    return (
      <menuInPlace.Component
        {...props}
        trigger={trigger}
        instant={instant}
        replace={replace}
        transition={submenuTransition}
        boundary={portalContainer ?? null}
        isExiting={isExiting}
        exitProps={presence.exitProps}
      />
    );
  }
  return (
    <Overlay exiting={isExiting}>
      <MenuPopover
        {...props}
        trigger={trigger}
        instant={instant}
        isExiting={isExiting}
        exitProps={presence.exitProps}
      />
    </Overlay>
  );
}

/*
 * A sheet, submenus in place and a `portalContainer` are loaded the first time a menu needs
 * them (`menu-in-place.tsx`), as the bottom sheet itself is, so a menu whose submenus open beside
 * it, in `body`, doesn't carry their code. Until the module is in, such a menu renders nothing
 * (focus stays on its trigger); once it is, the menu opens in the same pass (`onDemand` never
 * suspends), placed and sized from its first frame.
 */
const menuInPlace = onDemand<MenuPopoverInPlaceProps>(() =>
  import('./menu-in-place').then((module) => module.MenuPopoverInPlace),
);
const menuSheet = onDemand<MenuSheetProps>(() =>
  import('./menu-in-place').then((module) => module.MenuSheet),
);

/** Starts loading the sheet's, the pages' and the container's code, once (library-internal). */
export const preloadMenuInPlace = () => Promise.all([menuInPlace.preload(), menuSheet.preload()]);

/** What the menu in a popover or a sheet takes: the root menu's props that pick neither. */
export type MenuShownProps = Omit<
  MenuProps,
  'presentation' | 'instant' | 'submenuPresentation' | 'submenuTransition' | 'portalContainer'
>;

/** Shared by a menu and its submenus. */
export interface MenuTreeContextValue {
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
  /** Submenus open and close with no motion too, and pages change with none. */
  instant: boolean;
  /**
   * Where a submenu shows in place of the menu that opened it, below a back button, instead of
   * opening beside its item: always in a sheet, and in a popover with
   * `submenuPresentation="replace"` (`container` then holds the pages). `null` beside. It's
   * the page of `menu-in-place.tsx`, loaded with such menus.
   */
  page: ComponentType<SubmenuPageProps> | null;
  labels: MenuLabels;
  /** The root menu's parts, for the row above each page. */
  classNames: MenuClassNames | undefined;
  backIcon: ReactElement | undefined;
  /**
   * Inside a `portalContainer`: React Aria's boundary for the submenus beside the root menu,
   * a stand-in for the container in their containing block, the root popover.
   */
  boundary: Element | null;
}

export const MenuTreeContext = createContext<MenuTreeContextValue | null>(null);

/** The menu element an item is rendered in (a submenu's parent). */
const MenuListContext = createContext<RefObject<HTMLDivElement | null> | null>(null);

/** A submenu's items: what follows a choice on it (`afterSelect`), and how it goes back. */
interface MenuPageContextValue {
  afterSelect: MenuAfterSelect;
  /** Closes only this submenu, then focuses the item that opened it. */
  back: () => void;
}

const MenuPageContext = createContext<MenuPageContextValue | null>(null);

const subscribeToNothing = () => () => {};

/**
 * Keys that move focus in a menu (React Aria's) and whose default the browser would also take:
 * scrolling the nearest element around the menu that scrolls, such as a pane holding its
 * `portalContainer`, which carried the open menu away (2026-11-18). React Aria leaves it.
 */
const FOCUS_MOVING_KEYS = new Set(['Home', 'End', 'PageUp', 'PageDown']);

/** See `MenuPopoverFrame`'s `absolute`. */
const ABSOLUTE = { position: 'absolute' } as const;

/**
 * React Aria resolves `start` / `end` from its locale context, not the DOM `dir`, so an
 * RTL region without an `I18nProvider` would align the menu to the wrong edge. Resolve
 * them to physical sides from the trigger's computed direction instead.
 */
function toPhysicalPlacement(placement: MenuPlacement, direction: string): Placement {
  return toAriaPlacement(placement, direction === 'rtl');
}

/** A placement on `side` of the trigger, keeping its alignment (`bottom left` on `top`: `top left`). */
function onSide(placement: Placement, side: string): Placement {
  const [, align] = placement.split(' ');
  return (align ? `${side} ${align}` : side) as Placement;
}

export type ExitProps = ReturnType<typeof usePresence>['exitProps'];

/** Where a menu's popover sits, beyond `placement`, `offset` and `containerPadding`. */
export interface MenuPopoverPlacing {
  /** Keeps the popover on this side of its trigger, without flipping (pages in place). */
  heldSide?: string | null;
  /** React Aria's boundary, in place of the window (a `portalContainer`'s stand-in). */
  boundaryElement?: Element | null;
  /** `false` for one commit places the popover again (a `portalContainer` resized). */
  shouldUpdatePosition?: boolean;
}

/**
 * Places a menu's popover against its trigger (React Aria `usePopover`), in the trigger's
 * laid-out direction, and gives the menu a locale with that direction (library-internal:
 * shared by the popover below and the one in `menu-in-place.tsx`).
 */
export function useMenuPopover(
  trigger: MenuTriggerContextValue,
  popoverRef: RefObject<HTMLDivElement | null>,
  {
    placement = 'bottom-start',
    offset = 0,
    containerPadding = 12,
  }: Pick<MenuProps, 'placement' | 'offset' | 'containerPadding'>,
  { heldSide, boundaryElement, shouldUpdatePosition }: MenuPopoverPlacing = {},
): PopoverAria & { menuLocale: string } {
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
  const requested = toPhysicalPlacement(placement, direction);
  const popover = usePopover(
    {
      triggerRef: trigger.triggerRef,
      popoverRef,
      placement: heldSide ? onSide(requested, heldSide) : requested,
      shouldFlip: !heldSide,
      offset,
      containerPadding,
      ...(boundaryElement && { boundaryElement }),
      ...(shouldUpdatePosition === false && { shouldUpdatePosition }),
    },
    trigger.state,
  );
  return { ...popover, menuLocale };
}

/** What a menu's tree takes from its popover. */
export type MenuPopoverTree = Omit<
  MenuTreeContextValue,
  'rootState' | 'container' | 'activeLevel' | 'setActiveLevel'
> & {
  /** Where submenus go: by default the popover itself (beside), or the pages' element. */
  container?: HTMLElement | null;
};

/**
 * A menu's popover around its content (library-internal: shared by the popover below and the
 * one in `menu-in-place.tsx`): the underlay, the box React Aria places, the reveal from the
 * anchored edge, the locale and the menu tree. Tab closes the menu.
 */
export function MenuPopoverFrame({
  trigger,
  popoverRef,
  popover: { popoverProps, underlayProps, placement, menuLocale },
  instant,
  isExiting,
  exitProps,
  className,
  style,
  absolute = false,
  tree,
  children,
}: {
  trigger: MenuTriggerContextValue;
  popoverRef: RefObject<HTMLDivElement | null>;
  popover: ReturnType<typeof useMenuPopover>;
  instant: boolean;
  isExiting: boolean;
  exitProps: ExitProps;
  className: string | undefined;
  style: CSSProperties | undefined;
  /**
   * `position: absolute` from the first placement, as React Aria makes it once placed (in a
   * `portalContainer`, so its stand-in boundary and the popover count from the same block).
   */
  absolute?: boolean;
  tree: MenuPopoverTree;
  children: ReactNode;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const setPopover = useCallback(
    (node: HTMLDivElement | null) => {
      popoverRef.current = node;
      setElement(node);
    },
    [popoverRef],
  );
  const [activeLevel, setActiveLevel] = useState(0);
  const revealRef = useRef<HTMLDivElement>(null);
  const entering = useRevealEntering(placement, revealRef);
  const close = trigger.state.close;
  // Tab moves on from an open menu and closes it and its submenus (the APG menu button
  // pattern). React Aria's focus scope moves focus past the trigger, or back to it when
  // nothing follows; without the close, the menu stayed open with focus outside it. That
  // scope handles Tab on the document's capture phase and stops it, so this listens on the
  // window's, which comes first.
  useEffect(() => {
    const view = element?.ownerDocument.defaultView;
    if (!element || !view) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || event.altKey || event.ctrlKey || event.metaKey) return;
      if (element.contains(element.ownerDocument.activeElement)) close();
    };
    view.addEventListener('keydown', onKeyDown, true);
    return () => view.removeEventListener('keydown', onKeyDown, true);
  }, [element, close]);
  const { container = element, ...shared } = tree;
  return (
    <>
      <div {...underlayProps} className="fixed inset-0" />
      <div
        {...popoverProps}
        ref={setPopover}
        // React Aria's placement wins over a consumer style's and, through the attribute
        // (styles/utilities.css), over consumer inset classes.
        style={{ ...style, ...popoverProps.style, ...(absolute && ABSOLUTE) }}
        data-overlay-placement=""
        className={menuStyles().popover({ class: cn(menuOwnWidth, className) })}
      >
        <DismissButton onDismiss={close} />
        <div
          {...exitProps}
          ref={revealRef}
          data-entering={entering || undefined}
          data-exiting={isExiting || undefined}
          data-placement={placement ?? undefined}
          className={menuStyles({ instant }).reveal()}
        >
          <I18nProvider locale={menuLocale}>
            <MenuTreeContext
              value={{
                ...shared,
                rootState: trigger.state,
                container,
                activeLevel,
                setActiveLevel,
              }}
            >
              {children}
            </MenuTreeContext>
          </I18nProvider>
        </div>
        <DismissButton onDismiss={close} />
      </div>
    </>
  );
}

/** A menu's popover in `body`, its submenus beside their items. */
function MenuPopover({
  trigger,
  instant,
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
}: MenuShownProps & {
  trigger: MenuTriggerContextValue;
  instant: boolean;
  isExiting: boolean;
  exitProps: ExitProps;
}) {
  const labels = useLabels('Menu', DEFAULT_LABELS, labelsProp);
  const popoverRef = useRef<HTMLDivElement>(null);
  const popover = useMenuPopover(trigger, popoverRef, { placement, offset, containerPadding });
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
      tree={{
        layout,
        variant,
        density: props.density,
        instant,
        page: null,
        labels,
        classNames: props.classNames,
        backIcon,
        boundary: null,
      }}
    >
      <MenuList
        {...mergeProps(triggerMenuProps(trigger, props), props)}
        layout={layout}
        variant={variant}
        level={0}
        onClose={trigger.state.close}
        autoFocus={trigger.state.focusStrategy ?? 'first'}
      />
    </MenuPopoverFrame>
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

export type MenuListProps = Omit<
  MenuProps,
  'placement' | 'layout' | 'variant' | 'presentation' | 'instant' | 'className' | 'style'
> &
  Pick<AriaMenuOptions<object>, 'onClose' | 'autoFocus' | 'onKeyDown' | 'onKeyUp'> & {
    layout: MenuLayout;
    variant: MenuVariant;
    /** 0 for the root menu, then one more per submenu. */
    level: number;
    listRef?: RefObject<HTMLDivElement | null>;
    /** Shown in place of other pages: the list spans their container, with no surface of its own. */
    embedded?: boolean;
    /** The first page shown in place: its motion as it shows again (`menuStyles().page()`). */
    pageClassName?: string;
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

/** A menu's list, the `role="menu"` element, in any presentation (library-internal). */
export function MenuList({
  deselectable = true,
  variant,
  layout: requestedLayout,
  density,
  level,
  classNames,
  listRef,
  embedded = false,
  pageClassName,
  afterSelect: _afterSelect,
  ref: forwardedRef,
  ...allProps
}: MenuListProps) {
  // The menu list is the menu's root (its `ref` and `id` land there): its DOM attributes too.
  const { root, rest: props } = splitRootProps(allProps);
  // MenuItem / MenuGroup are React Stately Item / Section, so children are a collection.
  assertCollectionChildren(
    props.children,
    'Menu',
    'MenuItem, MenuGroup and SubmenuTrigger elements',
  );
  const tree = useContext(MenuTreeContext);
  // The menu's own keys only: see `withoutGroupKeys`. Read in an event, after the commit.
  const collectionRef = useRef<TreeState<object>['collection'] | null>(null);
  const { onSelectionChange } = props;
  // M3: "Disabled menu items can receive focus but aren't selectable."
  const state = useTreeState({
    ...(props as AriaMenuProps<object>),
    ...(onSelectionChange && {
      onSelectionChange: (keys: Selection) =>
        onSelectionChange(withoutGroupKeys(keys, collectionRef.current)),
    }),
    disallowEmptySelection: !deselectable,
    disabledBehavior: 'selection',
  });
  useLayoutEffect(() => {
    collectionRef.current = state.collection;
  });
  const ownRef = useObjectRef(forwardedRef);
  const ref = listRef ?? ownRef;
  // M3 keyboard table: "Letters — Focus moves to the next menu item starting with letter".
  const keyboardDelegate = useTypeaheadDelegate(state, ref);
  const { menuProps } = useMenu(
    // The arrow keys wrap from the last item to the first and back, as M3's menus and the rest
    // of the library's collections do (APG makes it optional).
    { ...(props as AriaMenuOptions<object>), keyboardDelegate, shouldFocusWrap: true },
    state,
    ref,
  );
  const groups = toGroups([...state.collection]);
  const scrolled = useHasScrolled(ref, requestedLayout === 'gap');
  const layout: MenuLayout = scrolled ? 'divider' : requestedLayout;
  const styles = menuStyles({ variant, layout, embedded });
  // While a submenu is open beside it, the menu holding focus is rounder than the others (M3);
  // in place, only one page shows.
  const submenuOpen = Boolean(tree && !tree.page && tree.rootState.expandedKeysStack.length > 0);
  const shape = !submenuOpen ? undefined : tree?.activeLevel === level ? 'active' : 'inactive';
  const setActive = tree?.setActiveLevel;

  return (
    <div
      {...mergeProps(root, menuProps, {
        // Focus events bubble through portals: count only focus inside this menu's element.
        onFocus: (event: FocusEvent<HTMLDivElement>) => {
          if (event.currentTarget.contains(event.target)) setActive?.(level);
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => {
          if (FOCUS_MOVING_KEYS.has(event.key)) event.preventDefault();
        },
      })}
      ref={ref}
      {...densityAttribute(density)}
      data-tokens={mergeDataTokens('md-comp-menus', root)}
      data-variant={variant}
      data-layout={layout}
      data-shape={shape}
      className={styles.menu({ class: cn(pageClassName, classNames?.panel) })}
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
                  // A menu's divider is a `separator` between its groups (WAI-ARIA menu).
                  <Divider
                    decorative={false}
                    className={styles.divider({ class: classNames?.divider })}
                  />
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
                  headingClassName={groupStyles.heading({ class: classNames?.heading })}
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
  const selectionManager = useGroupSelection(section, state);
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
          selectionManager={selectionManager}
          variant={variant}
          // A heading takes the group's top edge, so the first item doesn't touch it.
          edges={{ ...edges, top: !section.rendered && edges.top }}
          classNames={classNames}
        />
      </div>
    </div>
  );
}

type SelectionManager = TreeState<object>['selectionManager'];

/**
 * The menu's selection without the keys of its groups that set `selectionMode`, whose items
 * have a selection of their own. React Stately spells the menu's `'all'` out over the whole
 * collection as an item is toggled (`getSelectAllKeys`), so a menu selected with `'all'`, or
 * select-all (Ctrl + A), reported every group's keys too as one of its items was unchecked.
 */
function withoutGroupKeys(
  keys: Selection,
  collection: TreeState<object>['collection'] | null,
): Selection {
  if (keys === 'all' || !collection) return keys;
  const owned = new Set<Key>();
  for (const node of collection) {
    if (node.type !== 'section' || (node.props as MenuGroupProps).selectionMode === undefined) {
      continue;
    }
    for (const child of node.childNodes) owned.add(child.key);
  }
  if (![...keys].some((key) => owned.has(key))) return keys;
  return new Set([...keys].filter((key) => !owned.has(key)));
}

/**
 * The keys of a group's items that `'all'` selects: React Stately's `'all'` is every item that
 * isn't disabled.
 */
function groupItemKeys(section: Node<object>, menu: SelectionManager) {
  const keys = new Set<Node<object>['key']>();
  for (const node of section.childNodes) {
    if (node.type === 'item' && !menu.disabledKeys.has(node.key)) keys.add(node.key);
  }
  return keys;
}

/** What a group's items call on its manager (React Aria's `useMenuItem` and `useSelectableItem`). */
const GROUP_MANAGER_METHODS = [
  'isSelected',
  'select',
  'toggleSelection',
  'replaceSelection',
  'extendSelection',
  'canSelectItem',
  'isDisabled',
  'isLink',
  'setFocused',
  'setFocusedKey',
] as const;

/**
 * Development only. A group's manager is built with a class React Stately doesn't export, so a
 * react-stately release that changed it would break a group's choices quietly (a press that
 * selects nothing). Fail with the cause instead.
 */
function assertGroupManager(manager: SelectionManager, groupState: MultipleSelectionState) {
  const missing = GROUP_MANAGER_METHODS.filter((name) => typeof manager[name] !== 'function');
  if (missing.length === 0 && manager.selectionMode === groupState.selectionMode) return;
  throw new Error(
    `[@windmorph/react] MenuGroup: the selection manager built for a group's selection ` +
      (missing.length > 0
        ? `lacks ${missing.join(', ')}`
        : `doesn't read the group's selection state`) +
      `. A group's selection is built on React Stately's own SelectionManager, which this ` +
      `react-stately version has changed; use the react-stately version @windmorph/react ` +
      `depends on.`,
  );
}

/**
 * A group's selection manager when it sets `selectionMode` (`none` included, as React Aria
 * Components' `MenuSection` does: a `none` group's items are plain actions in a selectable
 * menu): the group's own selection (`useMultipleSelectionState`) with the menu's focus. React
 * Stately doesn't export its `SelectionManager` class, so the menu manager's own constructor
 * (its documented `(collection, state)` signature) builds it, from a state whose focus members
 * are the menu's. `null` for a group without `selectionMode`, whose items use the menu's manager.
 */
function useGroupSelection(
  section: Node<object>,
  state: TreeState<object>,
): SelectionManager | null {
  const group = section.props as MenuGroupProps;
  const own = useMultipleSelectionState({
    selectionMode: group.selectionMode ?? 'none',
    disallowEmptySelection: group.deselectable === false,
    ...(group.selectedKeys !== undefined && { selectedKeys: group.selectedKeys }),
    ...(group.defaultSelectedKeys !== undefined && {
      defaultSelectedKeys: group.defaultSelectedKeys,
    }),
    ...(group.onSelectionChange !== undefined && { onSelectionChange: group.onSelectionChange }),
  });
  // Only a group that leaves `selectionMode` out follows the menu's.
  if (group.selectionMode === undefined) return null;
  const menu = state.selectionManager;
  const groupState: MultipleSelectionState = {
    selectionMode: own.selectionMode,
    selectionBehavior: own.selectionBehavior,
    setSelectionBehavior: own.setSelectionBehavior,
    // The manager reads the whole menu's collection, so it would expand `'all'` over every item
    // in the menu (a toggle reported the other groups' keys): the group's `'all'` is its own items.
    selectedKeys: own.selectedKeys === 'all' ? groupItemKeys(section, menu) : own.selectedKeys,
    setSelectedKeys: own.setSelectedKeys,
    disallowEmptySelection: own.disallowEmptySelection,
    // Focus is the menu's: a group changes what's selected, never where focus goes.
    get isFocused() {
      return menu.isFocused;
    },
    setFocused: (focused) => menu.setFocused(focused),
    get focusedKey() {
      return menu.focusedKey;
    },
    get childFocusStrategy() {
      return menu.childFocusStrategy;
    },
    setFocusedKey: (key, strategy) => menu.setFocusedKey(key, strategy),
    disabledKeys: menu.disabledKeys,
    disabledBehavior: menu.disabledBehavior,
  };
  const Manager = menu.constructor as new (
    collection: TreeState<object>['collection'],
    state: MultipleSelectionState,
  ) => SelectionManager;
  const manager = new Manager(state.collection, groupState);
  if (process.env.NODE_ENV !== 'production') assertGroupManager(manager, groupState);
  return manager;
}

/**
 * Items nest their corners inside the container's: an item on an outer edge gets the
 * outer corner less the 4px padding, and every other corner is 4px.
 */
function MenuItems({
  nodes,
  state,
  selectionManager,
  variant,
  edges,
  classNames,
}: {
  nodes: Node<object>[];
  state: TreeState<object>;
  /** A selectable group's own manager; the menu's when left out. */
  selectionManager?: SelectionManager | null;
  variant: MenuVariant;
  edges: Edges;
  classNames?: MenuClassNames;
}) {
  return nodes.map((node, index) => {
    const itemProps: MenuItemViewProps = {
      node,
      state,
      ...(selectionManager && { selectionManager }),
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
  /** Its group's own selection manager, in a selectable `MenuGroup`. */
  selectionManager?: SelectionManager;
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
  // In place, a submenu replaces its menu, so hovering an item doesn't open it (it would change
  // the content under the pointer).
  const { isOpen, onHoverChange, ...triggerProps } = submenuTriggerProps;
  const Page = tree.page;
  // A choice on a submenu that goes back after one (`afterSelect="back"`) closes only it.
  const wentBack = useRef(false);
  const page: MenuPageContextValue = {
    afterSelect: submenu!.props.afterSelect ?? 'close',
    back: () => {
      wentBack.current = true;
      submenuState.close();
    },
  };
  // In place, a submenu hides the item that opened it, so React Aria's focus on the item when
  // the submenu closes (← or Escape) finds it hidden. Once the menu shows again, the item
  // takes focus back from the closed submenu (or the back button), unless every menu closed.
  // After a choice that goes back, the item takes focus too, in place or beside, where focus
  // is still in the submenu as it leaves.
  const wasOpen = useRef(isOpen);
  useLayoutEffect(() => {
    const closed = wasOpen.current && !isOpen;
    wasOpen.current = isOpen;
    const afterChoice = closed && wentBack.current;
    if (closed) wentBack.current = false;
    const item = itemRef.current;
    if (!closed || !(Page || afterChoice) || !tree.rootState.isOpen || !item) return;
    const active = item.ownerDocument.activeElement;
    const left = active == null || active === item.ownerDocument.body;
    if (left || (afterChoice && submenuRef.current?.contains(active))) item.focus();
  });
  return (
    <>
      <MenuItemView
        {...props}
        triggerProps={Page ? triggerProps : { ...triggerProps, onHoverChange }}
        itemRef={itemRef}
        submenuOpen={isOpen}
      />
      <MenuPageContext value={page}>
        {Page ? (
          <Page
            state={submenuState}
            submenuRef={submenuRef}
            menuProps={submenuProps}
            submenu={submenu!}
            title={props.node.rendered}
          />
        ) : (
          <SubmenuPopover
            state={submenuState}
            triggerRef={itemRef}
            submenuRef={submenuRef}
            menuProps={submenuProps}
            popoverProps={popoverProps}
            submenu={submenu!}
          />
        )}
      </MenuPageContext>
    </>
  );
}

/** What a submenu page in place takes (`menu-in-place.tsx`). */
export type SubmenuPageProps = Pick<
  SubmenuPopoverProps,
  'state' | 'submenuRef' | 'menuProps' | 'submenu'
> & {
  /** The label of the item that opened it. */
  title: ReactNode;
};

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
  const presence = usePresence(props.state.isOpen);
  const isPresent = tree.instant ? props.state.isOpen : presence.isPresent;
  const isExiting = !tree.instant && presence.isExiting;
  const { exitProps } = presence;
  if (!isPresent || !tree.container) return null;
  // Inside the root popover: its focus scope and outside-press handling cover the submenu,
  // and the modal root menu doesn't make it inert.
  return (
    <Overlay portalContainer={tree.container} disableFocusManagement exiting={isExiting}>
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
      // Within the root's `portalContainer`, as the root menu is.
      ...(tree.boundary && { boundaryElement: tree.boundary }),
    },
    state,
  );
  const revealRef = useRef<HTMLDivElement>(null);
  const entering = useRevealEntering(placement, revealRef);
  const { className, style, ...own } = submenu.props;
  const styles = menuStyles();
  return (
    // `w-max` (`menuOwnWidth`): positioned inside the narrower root popover, it would otherwise shrink to fit
    // what's left of that popover's width and wrap every label. Like the root menu's, the
    // submenu's `className` and `style` go on this outermost element.
    <div
      {...positionProps}
      ref={popoverRef}
      style={{ ...style, ...positionProps.style, ...(tree.boundary && ABSOLUTE) }}
      data-overlay-placement=""
      className={styles.popover({ class: cn(menuOwnWidth, className) })}
    >
      <div
        {...exitProps}
        ref={revealRef}
        data-entering={entering || undefined}
        data-exiting={isExiting || undefined}
        data-placement={placement ?? undefined}
        className={menuStyles({ instant: tree.instant }).reveal()}
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
  selectionManager = state.selectionManager,
  variant,
  top,
  bottom,
  classNames,
  triggerProps,
  itemRef,
  submenuOpen = false,
}: MenuItemViewProps) {
  const ownRef = useRef<HTMLElement>(null);
  const ref = itemRef ?? ownRef;
  const props = node.props as SubmenuItemProps;
  const isDisabled = state.disabledKeys.has(node.key);
  // A plain action in a selectable menu (`checkable={false}`) is never checked.
  const selectable = selectionManager.selectionMode !== 'none' && props.checkable !== false;
  const plainInSelectable = selectionManager.selectionMode !== 'none' && !selectable;
  const multiple = selectable && selectionManager.selectionMode === 'multiple';
  // On a submenu that goes back after a choice (`afterSelect="back"`), a choice that would close
  // the menu (press or Enter on a single choice) closes only the submenu; an action still
  // closes the whole menu, and Space and toggles close nothing.
  const page = useContext(MenuPageContext);
  const goesBack = page?.afterSelect === 'back' && selectable && !multiple;
  const {
    menuItemProps: ariaItemProps,
    keyboardShortcutProps,
    isSelected,
    isPressed,
  } = useMenuItem(
    {
      ...triggerProps,
      key: node.key,
      'aria-label': props['aria-label'],
      selectionManager,
      // Disabled items stay focusable (the menu's `disabledBehavior`) but do nothing.
      isDisabled,
      isSelected: plainInSelectable ? false : undefined,
      // M3: multi-select menus stay open until they're dismissed, Enter included; a plain
      // action closes the menu, as in any menu.
      closeOnSelect: multiple ? false : plainInSelectable ? true : undefined,
      onClose: goesBack ? page.back : undefined,
    },
    state,
    ref,
  );
  const menuItemProps =
    plainInSelectable && !props.submenu
      ? { ...ariaItemProps, role: 'menuitem', 'aria-checked': undefined }
      : ariaItemProps;
  // A link item is a real `<a>`: `useMenuItem` gives it the link's attributes, routes a plain
  // click and closes the menu. A disabled item, or one that opens a submenu, stays a plain
  // element without them, so it can't be followed.
  const link = props.href != null && !isDisabled && !props.submenu;
  // Widened, so the item's ref (an element of either kind) fits both.
  const Root = (link ? 'a' : 'div') as ElementType;
  const linkAttributes = link
    ? { rel: props.rel ?? (props.target === '_blank' ? 'noopener noreferrer' : undefined) }
    : NOT_A_LINK;
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isPressed, isDisabled, isSelected },
    ref,
  );
  const styles = menuStyles({
    variant,
    itemTop: top,
    itemBottom: bottom,
    hasDescription: Boolean(props.description),
  });
  const selectedIcon = props.selectedIcon ?? (selectable ? <CheckIcon /> : null);
  const trailingIcon = props.trailingIcon ?? (props.submenu ? <SubmenuIcon /> : null);
  const badgeId = useId();
  // Named by its content: the label and supporting text in the order they show, each read
  // once. React Aria names it by the label alone and describes it by the supporting text,
  // which leaves visible text out of its name (WCAG 2.5.3), as List options did. The shortcut
  // and the badge are extra information, not the item's label: they stay its description,
  // hidden from the content so they're read once.
  const describedBy =
    [props.shortcut ? keyboardShortcutProps.id : undefined, props.badge ? badgeId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <Root
      {...mergeProps(menuItemProps, interactionProps)}
      {...linkAttributes}
      {...dataAttributes}
      aria-labelledby={undefined}
      aria-describedby={describedBy}
      data-menu-open={submenuOpen || undefined}
      // Each item resolves the menu's tokens, so its selection picks its colours.
      data-tokens={mergeDataTokens('md-comp-menus', menuItemProps)}
      data-variant={variant}
      data-slot="item"
      ref={ref}
      className={styles.item({ class: cn(classNames?.item, props.className) })}
    >
      {props.leadingIcon && selectedIcon ? (
        <span
          aria-hidden="true"
          data-slot="leading-icon"
          className={styles.icon({ class: classNames?.icon })}
        >
          {isSelected ? selectedIcon : props.leadingIcon}
        </span>
      ) : props.leadingIcon ? (
        <span
          aria-hidden="true"
          data-slot="leading-icon"
          className={styles.icon({ class: classNames?.icon })}
        >
          {props.leadingIcon}
        </span>
      ) : selectedIcon ? (
        // No leading icon: the selected icon expands in when selected (Compose).
        <span aria-hidden="true" className={styles.selectedIcon()}>
          <span className={styles.selectedIconInner()}>
            <span className={styles.icon({ class: classNames?.icon })}>{selectedIcon}</span>
          </span>
        </span>
      ) : null}
      <span className={styles.text()}>
        <span>{node.rendered}</span>
        {props.description && (
          <span className={styles.description({ class: classNames?.description })}>
            {props.description}
          </span>
        )}
      </span>
      {props.badge && (
        <span id={badgeId} aria-hidden="true" className={styles.badge()}>
          {props.badge}
        </span>
      )}
      {props.shortcut && (
        <kbd
          {...keyboardShortcutProps}
          aria-hidden="true"
          className={styles.trailing({ class: cn('font-plain', classNames?.shortcut) })}
        >
          {props.shortcut}
        </kbd>
      )}
      {trailingIcon && (
        <span
          aria-hidden="true"
          data-slot="trailing-icon"
          className={styles.trailing({ class: classNames?.trailingIcon })}
        >
          {trailingIcon}
        </span>
      )}
    </Root>
  );
}

export type { Key as MenuKey };
