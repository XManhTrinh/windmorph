'use client';

/**
 * The menu triggers, apart from the `Menu` itself, so a component can render a trigger and
 * load its menu only when needed (`ButtonGroup`'s overflow menu) without carrying the
 * menu's code up front.
 */
import {
  Children,
  createContext,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useMenuTrigger, type AriaMenuOptions } from 'react-aria';
import { useMenuTriggerState, type RootMenuTriggerState } from 'react-stately';
import {
  TriggerContext,
  useTriggerProps,
  type TriggerContextValue,
} from '../../primitives/TriggerContext';

/** What a trigger shares with its `Menu`. */
export interface MenuTriggerContextValue {
  state: RootMenuTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  menuProps: AriaMenuOptions<unknown>;
}

const omitLabelledBy = ({ 'aria-labelledby': _, ...props }: AriaMenuOptions<unknown>) => props;

export const MenuTriggerContext = createContext<MenuTriggerContextValue | null>(null);

export interface MenuTriggerProps {
  /** The trigger (a Button, IconButton, …) followed by the `Menu`. */
  children: ReactNode;
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Whether the menu starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
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
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** Whether the menu starts open, when uncontrolled. @default false */
  defaultOpen?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Ignore secondary clicks and long presses. @default false */
  disabled?: boolean;
}

/**
 * Opens a `Menu` as a context menu (M3: "A secondary click, like a right-click on a mouse
 * or a two-finger tap on a trackpad, opens a context menu"): a secondary click, Shift +
 * F10 or a long press on a touch screen opens it at the pointer (React Aria
 * `useMenuTrigger` with `trigger: 'contextMenu'`). The first child is the content the menu
 * belongs to, wrapped in a `display: contents` element so its layout doesn't change; the
 * rest is the menu. Make that content focusable (a link, a button or `tabIndex={0}`), so
 * the keyboard can open the menu and Escape can return focus to it.
 *
 * @example
 * <ContextMenuTrigger>
 *   <Card tabIndex={0}>…</Card>
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
