'use client';

import {
  Children,
  createContext,
  useContext,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type JSX,
  type Key,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  DismissButton,
  mergeProps,
  useMenu,
  useMenuItem,
  useMenuSection,
  useMenuTrigger,
  usePopover,
  type AriaMenuOptions,
  type AriaMenuProps,
  type Placement,
} from 'react-aria';
import {
  Item,
  Section,
  useMenuTriggerState,
  useTreeState,
  type MenuTriggerState,
  type Node,
  type TreeState,
} from 'react-stately';
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
import { menuStyles, type MenuVariant } from './menu-styles';

const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

interface MenuTriggerContextValue {
  state: MenuTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  menuProps: AriaMenuOptions<unknown>;
}

const MenuTriggerContext = createContext<MenuTriggerContextValue | null>(null);

export interface MenuTriggerProps {
  /** The trigger (a Button, IconButton, …) followed by the `Menu`. */
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Opens a `Menu` from a button: on press, or with Enter, Space and the arrow keys.
 * The first child is the trigger (any button-like component); the rest is the menu.
 */
/**
 * A menu opens on pointer down and takes focus, and React Aria then hides the rest of
 * the page, trigger included, from assistive tech. The browser's follow-up `mousedown` on
 * the trigger would try to focus it there and drop focus on `<body>`, out of the menu.
 * React Aria has already focused the trigger on pointer down, so the default is not needed.
 */
const keepMenuFocus = (event: MouseEvent) => event.preventDefault();

export function MenuTrigger({ children, open, defaultOpen, onOpenChange }: MenuTriggerProps) {
  const state = useMenuTriggerState({ isOpen: open, defaultOpen, onOpenChange });
  const triggerRef = useRef<HTMLElement>(null);
  const { menuTriggerProps, menuProps } = useMenuTrigger({}, state, triggerRef);
  // Merged into an enclosing trigger's props, so a TooltipTrigger around it still works.
  const triggerValue = useTriggerProps({
    ...(menuTriggerProps as TriggerContextValue),
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
  /** Keyboard shortcut shown at the end, e.g. "⌘C". */
  shortcut?: string;
  /** Icon at the end. */
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
  children: ReactElement<MenuItemProps> | ReactElement<MenuItemProps>[];
}

/** A group of items, drawn as its own surface (a React Stately collection section). */
export const MenuGroup = Section as unknown as (props: MenuGroupProps) => JSX.Element;

export interface MenuClassNames {
  group?: string;
  item?: string;
}

export interface MenuProps extends Omit<
  AriaMenuProps<object>,
  'children' | 'items' | 'onClose' | 'autoFocus'
> {
  /** `MenuItem`s and `MenuGroup`s. */
  children: ReactNode;
  /** `standard` (surface colours) or `vibrant` (tertiary container). @default "standard" */
  variant?: MenuVariant;
  /** Placement relative to the trigger. @default "bottom start" */
  placement?: Placement;
  /** Gap between the trigger and the menu, in px (a split button's menu sits 4px away). @default 0 */
  offset?: number;
  className?: string;
  classNames?: MenuClassNames;
  style?: CSSProperties;
}

/**
 * M3 Expressive menu: items in grouped surfaces, standard or vibrant colours, optional
 * single or multiple selection with a selected shape and check, keyboard navigation and
 * typeahead (React Aria `useMenu`). Must be inside a `MenuTrigger`; it opens anchored
 * to the trigger in a portal that keeps the surrounding theme and direction.
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

function MenuPopover({
  trigger,
  isExiting,
  exitProps,
  placement = 'bottom start',
  offset = 0,
  ...props
}: MenuProps & {
  trigger: MenuTriggerContextValue;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  // The DOM is the source of truth for direction; read it like an external store.
  const direction = useSyncExternalStore(
    subscribeToNothing,
    () =>
      trigger.triggerRef.current ? getComputedStyle(trigger.triggerRef.current).direction : 'ltr',
    () => 'ltr',
  );
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
  const styles = menuStyles();
  return (
    <>
      <div {...underlayProps} className="fixed inset-0" />
      <div {...popoverProps} ref={popoverRef} className={styles.popover()}>
        <DismissButton onDismiss={trigger.state.close} />
        <div
          {...exitProps}
          data-exiting={isExiting || undefined}
          data-placement={actualPlacement ?? undefined}
          className={styles.motion()}
        >
          <TriggerContext value={null}>
            <MenuList
              {...mergeProps(trigger.menuProps, props)}
              onClose={trigger.state.close}
              autoFocus={trigger.state.focusStrategy || true}
            />
          </TriggerContext>
        </div>
        <DismissButton onDismiss={trigger.state.close} />
      </div>
    </>
  );
}

type Position = 'only' | 'first' | 'middle' | 'last';

const positionOf = (index: number, count: number): Position =>
  count === 1 ? 'only' : index === 0 ? 'first' : index === count - 1 ? 'last' : 'middle';

/** Which of a group's edges have its 16px corners (the others have 8px). */
const roundEdges = (position: Position) => ({
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

type MenuListProps = Omit<MenuProps, 'placement'> &
  Pick<AriaMenuOptions<object>, 'onClose' | 'autoFocus'>;

function MenuList({ variant = 'standard', className, classNames, style, ...props }: MenuListProps) {
  // MenuItem / MenuGroup are React Stately Item / Section, so children are a collection.
  assertCollectionChildren(props.children, 'Menu', 'MenuItem and MenuGroup elements');
  const state = useTreeState(props as AriaMenuProps<object>);
  const ref = useRef<HTMLDivElement>(null);
  const { menuProps } = useMenu(props as AriaMenuOptions<object>, state, ref);
  const groups = toGroups([...state.collection]);
  const styles = menuStyles({ variant });

  return (
    <div
      {...menuProps}
      ref={ref}
      style={style}
      data-variant={variant}
      className={styles.menu({ class: className })}
    >
      {groups.map((group, index) => {
        const position = positionOf(index, groups.length);
        return Array.isArray(group) ? (
          <div
            key={group[0]!.key}
            role="presentation"
            className={menuStyles({ variant, groupPosition: position }).group({
              class: classNames?.group,
            })}
          >
            <MenuItems
              nodes={group}
              state={state}
              variant={variant}
              edges={roundEdges(position)}
              classNames={classNames}
            />
          </div>
        ) : (
          <MenuSection
            key={group.key}
            section={group}
            state={state}
            variant={variant}
            position={position}
            classNames={classNames}
          />
        );
      })}
    </div>
  );
}

function MenuSection({
  section,
  state,
  variant,
  position,
  classNames,
}: {
  section: Node<object>;
  state: TreeState<object>;
  variant: MenuVariant;
  position: Position;
  classNames?: MenuClassNames;
}) {
  const { itemProps, headingProps, groupProps } = useMenuSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  });
  const styles = menuStyles({ variant, groupPosition: position });
  return (
    <div {...itemProps} className={styles.group({ class: classNames?.group })}>
      {section.rendered && (
        <span {...headingProps} className={styles.heading()}>
          {section.rendered}
        </span>
      )}
      <div {...groupProps} className="flex flex-col">
        <MenuItems
          nodes={[...section.childNodes]}
          state={state}
          variant={variant}
          // A heading takes the group's top edge, so the first item doesn't touch it.
          edges={{ ...roundEdges(position), top: !section.rendered && roundEdges(position).top }}
          classNames={classNames}
        />
      </div>
    </div>
  );
}

/**
 * Items nest their corners inside the group's: an item on a 16px group edge gets 12px
 * corners there (16px minus the 4px padding), and every other corner is 4px.
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
  edges: { top: boolean; bottom: boolean };
  classNames?: MenuClassNames;
}) {
  return nodes.map((node, index) => (
    <MenuItemView
      key={node.key}
      node={node}
      state={state}
      variant={variant}
      top={index === 0 && edges.top ? 'nested' : 'plain'}
      bottom={index === nodes.length - 1 && edges.bottom ? 'nested' : 'plain'}
      classNames={classNames}
    />
  ));
}

function MenuItemView({
  node,
  state,
  variant,
  top,
  bottom,
  classNames,
}: {
  node: Node<object>;
  state: TreeState<object>;
  variant: MenuVariant;
  top: 'nested' | 'plain';
  bottom: 'nested' | 'plain';
  classNames?: MenuClassNames;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const props = node.props as MenuItemProps;
  const {
    menuItemProps,
    labelProps,
    descriptionProps,
    keyboardShortcutProps,
    isSelected,
    isDisabled,
    isPressed,
  } = useMenuItem({ key: node.key, 'aria-label': props['aria-label'] }, state, ref);
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

  return (
    <div
      {...mergeProps(menuItemProps, interactionProps)}
      {...dataAttributes}
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
      {props.shortcut && (
        <kbd {...keyboardShortcutProps} className={cn(styles.trailing(), 'font-plain')}>
          {props.shortcut}
        </kbd>
      )}
      {props.trailingIcon && (
        <span aria-hidden="true" className={styles.trailing()}>
          {props.trailingIcon}
        </span>
      )}
    </div>
  );
}

export type { Key as MenuKey };
