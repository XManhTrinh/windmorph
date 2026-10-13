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
import { staggerSteps } from './fab-menu-stagger';
import {
  fabMenuStyles,
  type FabMenuAlign,
  type FabMenuColor,
  type FabMenuSize,
} from './fab-menu-styles';

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
  list?: string;
}

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
  /** Side the items and button line up on; logical, so it mirrors in RTL. @default "end" */
  align?: FabMenuAlign;
  /** `FabMenuItem` elements, top to bottom. */
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
 * M3 Expressive FAB menu: a FAB that opens a stack of related actions above it. The button
 * shrinks into a 56px close button while the items (`FabMenuItem`) appear one after
 * another from the button upwards, each springing out to its full width. Position the menu
 * with `className` (e.g. `fixed end-4 bottom-4`); the items open upwards.
 *
 * The button is named by `aria-label` and reports `aria-expanded`. Tab or ↓ moves from the
 * button to the top item; ↑ / ↓ move between items and back to the button. Escape, an
 * outside press or choosing an item closes the menu.
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
  align,
  children,
  classNames,
  className,
  ref,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: FabMenuProps) {
  const [isOpen, setOpen] = useControlledState(open, defaultOpen, onOpenChange);
  const items = Children.toArray(children).filter(isValidElement);
  const total = items.length;
  const styles = fabMenuStyles({ size, color, align });
  const listId = useId();
  const rootRef = useObjectRef(ref);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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

  useInteractOutside({ ref: rootRef, onInteractOutside: close, isDisabled: !isOpen });

  const focusItem = (from: Element, step: 1 | -1) => {
    const all = [...(listRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? [])];
    const index = all.indexOf(from as HTMLElement);
    const next = index === -1 ? all[0] : all[index + step];
    (next ?? buttonRef.current)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) return;
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

  return (
    <div
      {...rest}
      ref={rootRef}
      data-open={isOpen || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
      onKeyDown={onKeyDown}
    >
      <span className={styles.anchor({ class: classNames?.anchor })}>
        <ButtonBase
          ref={buttonRef}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-expanded={isOpen}
          aria-controls={isPresent ? listId : undefined}
          data-open={isOpen || undefined}
          onPress={() => setOpen(!isOpen)}
          className={styles.button({ class: classNames?.button })}
        >
          <span aria-hidden="true" className={styles.icon({ class: classNames?.icon })}>
            {isOpen && openIcon ? openIcon : icon}
          </span>
        </ButtonBase>
      </span>
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
    </div>
  );
}

export interface FabMenuItemClassNames {
  root?: string;
  content?: string;
  icon?: string;
}

interface FabMenuItemOwnProps {
  /** The item's icon. Hidden from assistive tech; the label names the item. */
  icon: ReactElement;
  /** The label. */
  children: ReactNode;
  classNames?: FabMenuItemClassNames;
}

type OmitItem<T> = Omit<T, keyof FabMenuItemOwnProps | 'disabled' | 'toggle'>;

export type FabMenuItemProps = FabMenuItemOwnProps &
  (OmitItem<ButtonBaseActionProps> | OmitItem<ButtonBaseLinkProps>);

/**
 * An action in a {@link FabMenu}: a 56px pill with an icon and a label. Choosing it calls
 * `onPress` (or follows `href`) and closes the menu.
 */
export function FabMenuItem({
  icon,
  children,
  classNames,
  className,
  style,
  onPress,
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
      menu.close();
    },
    onTransitionEnd: isLast ? menu.onLastExit : undefined,
  };

  return (
    <ButtonBase {...(props as ButtonBaseActionProps)}>
      <span ref={contentRef} className={styles.itemContent({ class: classNames?.content })}>
        <span aria-hidden="true" className={styles.itemIcon({ class: classNames?.icon })}>
          {icon}
        </span>
        {children}
      </span>
    </ButtonBase>
  );
}
