'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type TransitionEvent,
} from 'react';
import { useInteractOutside, useObjectRef } from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import {
  ButtonBase,
  type ButtonBaseActionProps,
  type ButtonBaseLinkProps,
} from '../../primitives/ButtonBase';
import { TriggerContext } from '../../primitives/TriggerContext';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { Menu, MenuItem, MenuTrigger, type MenuItemProps } from '../menu/Menu';
import { staggerSteps } from './fab-menu-stagger';
import { fabMenuStyles, type FabMenuColor, type FabMenuSize } from './fab-menu-styles';

type Styles = ReturnType<typeof fabMenuStyles>;

interface FabMenuContextValue {
  styles: Styles;
  /** Items at or below this index (counted from the top) are shown. */
  firstVisible: number;
  count: number;
  close: () => void;
  onLastExit: (event: TransitionEvent<HTMLElement>) => void;
}

const FabMenuContext = createContext<FabMenuContextValue | null>(null);
const ItemIndexContext = createContext(0);

type AccessibleName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export interface FabMenuClassNames {
  root?: string;
  /** The box that keeps the FAB's size while the button shrinks inside it. */
  anchor?: string;
  button?: string;
  icon?: string;
  /** The list of items (`presentation="list"`). */
  list?: string;
  /** The menu (`presentation="menu"`). */
  menu?: string;
}

/**
 * `list`: the expressive stack of pills that opens upwards from the button, for compact
 * and medium windows. `menu`: the FAB opens a standard {@link Menu} 4px above it, as M3
 * asks for on the web and in large windows.
 */
export type FabMenuPresentation = 'list' | 'menu';

interface FabMenuOwnProps {
  /** Whether the menu is open (controlled). */
  open?: boolean;
  /** @default false */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The button's icon while closed, usually "add". Hidden from assistive tech. */
  icon: ReactElement;
  /** The button's icon while open, usually "close". Defaults to `icon`. */
  openIcon?: ReactElement;
  /** The FAB size the button starts at; open, it is always the 56px close button. @default "default" */
  size?: FabMenuSize;
  /** @default "primary" */
  color?: FabMenuColor;
  /** @default "list" */
  presentation?: FabMenuPresentation;
  /**
   * Shows the button. Hiding it closes the menu, shrinks the button towards its centre and
   * fades it out; showing it expands it back (the FAB's appear / disappear motion). A
   * hidden menu is `inert`. @default true
   */
  visible?: boolean;
  /**
   * Plays the appearing animation when the menu mounts. Change its `key` on a page or tab
   * change to replay it. @default false
   */
  appear?: boolean;
  /** Two to six `FabMenuItem` elements, top to bottom. */
  children: ReactNode;
  classNames?: FabMenuClassNames;
}

export type FabMenuProps = FabMenuOwnProps &
  AccessibleName &
  Omit<
    ComponentPropsWithRef<'div'>,
    keyof FabMenuOwnProps | 'aria-label' | 'aria-labelledby' | 'color'
  >;

const ITEM_SELECTOR = '[data-fab-menu-item]:not([inert])';

/**
 * M3 Expressive FAB menu: a FAB that opens two to six related actions above it. The button
 * shrinks into a 56px close button while the items (`FabMenuItem`) appear one after
 * another from the button upwards, each springing out to its full width; on short windows
 * they scroll behind the close button. Position the menu on the window's trailing edge
 * with `className` (`fixed end-4 bottom-4`, and `end-6 bottom-6` in large windows).
 *
 * The button is named by `aria-label` and reports `aria-expanded`. Tab or ↓ moves from the
 * button to the top item; ↑ / ↓ move between items and back to the button. Escape, an
 * outside press or choosing an item closes the menu. With `presentation="menu"` the
 * button opens a standard `Menu` instead, with menu semantics and keyboard support.
 *
 * @example
 * <FabMenu icon={<AddIcon />} openIcon={<CloseIcon />} aria-label="Create" className="fixed end-4 bottom-4">
 *   <FabMenuItem icon={<ReplyIcon />} onPress={reply}>Reply</FabMenuItem>
 *   <FabMenuItem icon={<ArchiveIcon />} onPress={archive}>Archive</FabMenuItem>
 * </FabMenu>
 */
export function FabMenu({
  open,
  defaultOpen = false,
  onOpenChange,
  icon,
  openIcon,
  size,
  color,
  presentation = 'list',
  visible = true,
  appear = false,
  children,
  classNames,
  className,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: FabMenuProps) {
  const [isOpenState, setOpen] = useControlledState(open, defaultOpen, onOpenChange);
  const isOpen = isOpenState && visible;
  const items = Children.toArray(children).filter(isValidElement<FabMenuItemProps>);
  const total = items.length;
  if (process.env.NODE_ENV !== 'production' && (total < 2 || total > 6)) {
    console.warn(
      `[@windmorph/react] A FabMenu holds 2 to 6 items (M3); this one has ${total}. Use a FAB for a single action.`,
    );
  }
  const isMenu = presentation === 'menu';
  const styles = fabMenuStyles({ size, color });
  const listId = useId();
  const rootRef = useObjectRef(ref);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Hiding the button closes the menu.
  useEffect(() => {
    if (!visible && isOpenState) setOpen(false);
  }, [visible, isOpenState, setOpen]);

  // The visible item count steps through Compose's stagger spring (fab-menu-stagger.ts).
  const [count, setCount] = useState(isOpen ? total : 0);
  const countRef = useRef(count);
  useEffect(() => {
    const steps = staggerSteps(countRef.current, isOpen ? total : 0);
    const timers = steps.map(({ at, count: next }) =>
      setTimeout(() => {
        countRef.current = next;
        setCount(next);
      }, at),
    );
    return () => timers.forEach(clearTimeout);
  }, [isOpen, total]);

  // The list stays laid out until the last item has faded.
  const { isPresent, exitProps } = usePresence(isOpen || count > 0);

  const close = () => {
    if (listRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    setOpen(false);
  };

  useInteractOutside({ ref: rootRef, onInteractOutside: close, isDisabled: !isOpen || isMenu });

  // A list taller than the window scrolls; it opens showing the items nearest the button.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (isOpen && list) list.scrollTop = list.scrollHeight;
  }, [isOpen]);

  const focusItem = (from: Element, step: 1 | -1) => {
    const all = [...(listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const index = all.indexOf(from as HTMLElement);
    const next = index === -1 ? all[0] : all[index + step];
    (next ?? buttonRef.current)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen || isMenu) return;
    const onButton = event.target === buttonRef.current;
    if (event.key === 'Escape') {
      event.preventDefault();
      buttonRef.current?.focus();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusItem(event.target as Element, 1);
    } else if (event.key === 'ArrowUp' && !onButton) {
      event.preventDefault();
      focusItem(event.target as Element, -1);
    }
  };

  const context: FabMenuContextValue = {
    styles,
    firstVisible: total - count,
    count: total,
    close,
    onLastExit: exitProps.onTransitionEnd,
  };

  const button = (
    <span
      data-hidden={visible ? undefined : true}
      data-appear={appear || undefined}
      className={styles.anchor({ class: classNames?.anchor })}
    >
      <ButtonBase
        ref={buttonRef}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        {...(isMenu
          ? {}
          : {
              'aria-expanded': isOpen,
              'aria-controls': isPresent ? listId : undefined,
              onPress: () => setOpen(!isOpen),
            })}
        data-open={(isOpen && !isMenu) || undefined}
        className={styles.button({ class: classNames?.button })}
      >
        <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
          {isOpen && openIcon ? openIcon : icon}
        </span>
      </ButtonBase>
    </span>
  );

  return (
    <div
      {...rest}
      ref={rootRef}
      inert={!visible || undefined}
      data-open={isOpen || undefined}
      data-presentation={presentation}
      className={styles.root({ class: cn(classNames?.root, className) })}
      onKeyDown={onKeyDown}
    >
      {isMenu ? (
        <MenuTrigger open={isOpen} onOpenChange={setOpen}>
          {button}
          <Menu
            placement="top end"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            className={styles.menu({ class: classNames?.menu })}
          >
            {items.map((item) => (
              <MenuItem
                key={item.key ?? undefined}
                leadingIcon={item.props.icon}
                {...menuItemAction(item.props)}
                className={item.props.className}
              >
                {item.props.children}
              </MenuItem>
            ))}
          </Menu>
        </MenuTrigger>
      ) : (
        <>
          {button}
          <div
            ref={listRef}
            id={listId}
            hidden={!isPresent}
            className={styles.list({ class: classNames?.list })}
          >
            {/* An enclosing trigger (e.g. a TooltipTrigger) is for the button, not the items. */}
            <TriggerContext value={null}>
              <FabMenuContext value={context}>
                {items.map((item, index) => (
                  <ItemIndexContext key={item.key} value={index}>
                    {item}
                  </ItemIndexContext>
                ))}
              </FabMenuContext>
            </TriggerContext>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * A `FabMenuItem`'s action for a `MenuItem`. Menu items are React Stately collection items,
 * which keep any prop; React Aria's `useMenuItem` runs an item's `onAction` and opens its
 * `href` through the router.
 */
function menuItemAction({ onAction, href }: FabMenuItemProps): Partial<MenuItemProps> {
  return { onAction, href } as Partial<MenuItemProps>;
}

export interface FabMenuItemClassNames {
  root?: string;
  content?: string;
  icon?: string;
}

interface FabMenuItemOwnProps {
  /**
   * The item's icon. Hidden from assistive tech; the label names the item. M3 asks for an
   * icon on every item, since it tells the items apart; leave it out only if necessary.
   */
  icon?: ReactElement;
  /** The label, which M3 always requires. */
  children: ReactNode;
  /**
   * Runs when the item is chosen, in either presentation. (`onPress` works only in the
   * list, since a menu item has no press event.)
   */
  onAction?: () => void;
  classNames?: FabMenuItemClassNames;
}

type OmitItem<T> = Omit<T, keyof FabMenuItemOwnProps | 'disabled' | 'toggle'>;

export type FabMenuItemProps = FabMenuItemOwnProps &
  (OmitItem<ButtonBaseActionProps> | OmitItem<ButtonBaseLinkProps>);

/**
 * An action in a {@link FabMenu}: a 56px pill with an icon and a label (or, with
 * `presentation="menu"`, a menu item). Choosing it calls `onAction` (and, in the list,
 * `onPress`), or follows `href`, and closes the menu.
 */
export function FabMenuItem({
  icon,
  children,
  classNames,
  className,
  style,
  onPress,
  onAction,
  ...rest
}: FabMenuItemProps) {
  const menu = useContext(FabMenuContext);
  if (!menu) throw new Error('FabMenuItem must be rendered inside a FabMenu');
  const index = useContext(ItemIndexContext);
  const visible = index >= menu.firstVisible;
  const isLast = index === menu.count - 1;
  const { styles } = menu;

  // The item's width springs between 0 and its content's natural width.
  const contentRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    const measure = () => setWidth(content.offsetWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const props = {
    ...rest,
    inert: !visible,
    'data-visible': visible || undefined,
    'data-fab-menu-item': '',
    style: { ...style, width: visible ? width : 0 },
    className: styles.item({ class: cn(classNames?.root, className) }),
    onPress: (event: Parameters<NonNullable<ButtonBaseActionProps['onPress']>>[0]) => {
      onPress?.(event);
      onAction?.();
      menu.close();
    },
    onTransitionEnd: isLast ? menu.onLastExit : undefined,
  };

  return (
    <ButtonBase {...(props as ButtonBaseActionProps)}>
      <span ref={contentRef} className={styles.itemContent({ class: classNames?.content })}>
        {icon && (
          <span aria-hidden="true" className={styles.itemIcon({ class: classNames?.icon })}>
            {icon}
          </span>
        )}
        {children}
      </span>
    </ButtonBase>
  );
}
