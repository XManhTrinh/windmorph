'use client';

import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  type CSSProperties,
  type InputHTMLAttributes,
  type JSX,
  type LabelHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  mergeProps,
  useButton,
  useCheckbox,
  useFocusRing,
  useGridList,
  useGridListItem,
  useHover,
  useLink,
  useListBox,
  useObjectRef,
  useOption,
  useRadio,
  useRadioGroup,
  useTree,
  useTreeItem,
  VisuallyHidden,
  type AriaButtonProps,
  type AriaCheckboxProps,
  type AriaGridListProps,
  type AriaListBoxOptions,
  type AriaRadioGroupProps,
  type AriaTreeOptions,
  type Key,
} from 'react-aria';
import {
  useListState,
  useRadioGroupState,
  useToggleState,
  useTreeState,
  type ListState,
  type Node,
  type RadioGroupState,
  type TreeState,
} from 'react-stately';
import { DomDirectionLocale } from '../../primitives/DomDirectionLocale';
import { TouchTarget } from '../../primitives/TouchTarget';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { CheckboxBox } from '../checkbox/Checkbox';
import { RadioRing } from '../radio/RadioGroup';
import { CheckIcon, CloseIcon, SwitchThumb, thumbGeometry } from '../switch/Switch';
import { switchStyles } from '../switch/switch-styles';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { listStyles, type ListDividers, type ListVariant } from './list-styles';
import { ListMediaContext } from './ListMedia';

/** Props of a {@link ListItem}; the React `key` identifies it for `onAction` and selection. */
export interface ListItemProps {
  /** The headline. */
  children: ReactNode;
  /** A short line above the headline. */
  overline?: ReactNode;
  /** One or two lines below the headline. */
  supportingText?: ReactNode;
  /** Leading content: an icon, an avatar, a `ListItemImage` or `ListItemVideo`, or a control. */
  leading?: ReactNode;
  /** Trailing content: an icon, short text or a control (in an interactive list it gets focus with ← / →). */
  trailing?: ReactNode;
  /**
   * Makes the item a link. In a list without `onAction` or `selectionMode` the item is a
   * real `<a>`: its own Tab stop, with the browser's link menu and modified clicks, routed
   * through a `RouterProvider` (such as `NextRouterProvider`) on a plain click.
   */
  href?: string;
  /** Marks the link item for the page being shown: `aria-current="page"` and the selected colours. */
  current?: boolean;
  /** A link item's target; `_blank` adds `rel="noopener noreferrer"` unless `rel` is given. */
  target?: string;
  rel?: string;
  /** Downloads the link item's file instead of opening it (optionally with a file name). */
  download?: boolean | string;
  /** Plain-text version of the headline, for type-ahead and announcements. */
  textValue?: string;
  'aria-label'?: string;
  className?: string;
  /**
   * Makes the whole item a switch or a checkbox (Compose's toggleable `ListItem`): pressing
   * anywhere on it toggles it, and it is one control for assistive tech. Not in lists with
   * `onAction`, links or `selectionMode`.
   */
  control?: 'switch' | 'checkbox';
  /** Whether a switch or checkbox item is on (controlled). */
  checked?: boolean;
  /** Whether a switch or checkbox item starts on (uncontrolled). */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Where the switch, checkbox or radio button sits. @default checkbox and radio "leading", switch "trailing" */
  controlPlacement?: ControlPlacement;
  /** A radio list item's value, or the value a switch or checkbox item posts with its form. */
  value?: string;
  /** The form field name of a switch or checkbox item. */
  name?: string;
  /** Disables the item. */
  disabled?: boolean;
  /** Aligns the content; by default it is centred, and top-aligned in three-line items. */
  verticalAlignment?: 'center' | 'top';
  /** Shows ✓ and ✕ in a switch item's thumb. */
  switchIcons?: boolean;
  /** The most lines the headline shows, then "…" (overrides the list's). */
  headlineLines?: LineLimit;
  /** The most lines the supporting text shows, then "…" (overrides the list's). */
  supportingTextLines?: LineLimit;
  /**
   * Nested `ListItem`s (each with its own `key`): the item expands and collapses to show
   * them, in a folder-like way (M3's expand interaction). It ends with a chevron, and → / ←
   * expand and collapse it.
   */
  childItems?: ReactElement<ListItemProps> | ReactElement<ListItemProps>[];
}

/** How many lines a text shows before it ends with "…"; the full text stays in the DOM. */
export type LineLimit = 1 | 2 | 3;

type ControlPlacement = 'leading' | 'trailing';

/** A collection node as React Stately's collection builder reads it. */
interface ListItemNode {
  type: 'item';
  props?: ListItemProps;
  rendered?: ReactNode;
  textValue?: string;
  'aria-label'?: string | undefined;
  hasChildNodes?: boolean;
  element?: ReactElement;
  childNodes?: () => Iterable<ListItemNode>;
}

function ListItemElement(_props: ListItemProps): null {
  return null;
}

/**
 * Describes the item to React Stately's collection builder, as its `Item` does: the
 * headline is the item's content, and `childItems` are its nested items.
 */
ListItemElement.getCollectionNode = function* getCollectionNode(
  props: ListItemProps,
): Generator<ListItemNode> {
  const rendered = props.children;
  const textValue =
    props.textValue || (typeof rendered === 'string' ? rendered : '') || props['aria-label'] || '';
  if (!textValue && process.env.NODE_ENV !== 'production') {
    console.warn(
      '[@windmorph/react] A ListItem whose headline is not plain text needs a textValue for type-ahead.',
    );
  }
  const children = listItems(props.childItems);
  yield {
    type: 'item',
    props,
    rendered,
    textValue,
    'aria-label': props['aria-label'],
    hasChildNodes: children.length > 0,
    *childNodes() {
      for (const element of children) yield { type: 'item', element };
    },
  };
};

/**
 * An item of a {@link List}. Like React Stately's collection `Item`, the list reads its
 * props; identify it with a React `key`.
 */
export const ListItem = ListItemElement as unknown as (props: ListItemProps) => JSX.Element;

export interface ListClassNames {
  root?: string;
  item?: string;
  leading?: string;
  text?: string;
  overline?: string;
  headline?: string;
  supporting?: string;
  trailing?: string;
  /** The drawn switch, checkbox or radio button of an item that is one. */
  control?: string;
  /** Every `ListItemImage` and `ListItemVideo` in the list (to round them, say). */
  media?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

interface ListOwnProps {
  /** Flush items, or separate items 2px apart with rounded group corners. @default "standard" */
  variant?: ListVariant;
  /** `ListItem` elements. */
  children: ReactElement<ListItemProps> | ReactElement<ListItemProps>[];
  /** Called when an item is pressed or Enter is pressed on it. Makes the list interactive. */
  onAction?: (key: Key) => void;
  /** @default "none" */
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: 'all' | Iterable<Key>;
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  onSelectionChange?: (keys: Set<Key> | 'all') => void;
  disallowEmptySelection?: boolean;
  disabledKeys?: Iterable<Key>;
  /**
   * The selected item of a radio list (Compose's single-selection `ListItem`): with `value`,
   * `defaultValue` or `onValueChange`, the list is a radio group whose items are radio
   * buttons, each with a `value`.
   */
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** The form field name of a radio list. */
  name?: string;
  /** A radio list needs a choice before its form submits. */
  required?: boolean;
  /** Disables every item. */
  disabled?: boolean;
  /** Where a radio list's radio buttons sit. @default "leading" */
  controlPlacement?: ControlPlacement;
  /**
   * M3's dividers between items: `full` width, or `inset` 16dp from each side. Standard
   * lists only (segmented items are already apart).
   */
  dividers?: ListDividers;
  /**
   * Selected items show a check at their end besides their colour, so selection never
   * relies on colour alone (M3 lists accessibility). @default true
   */
  selectionIndicator?: boolean;
  /** The expanded items of a list with `childItems` (controlled). */
  expandedKeys?: Iterable<Key>;
  /** The items expanded at first (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  onExpandedChange?: (keys: Set<Key>) => void;
  /** The most lines each item's headline shows, then "…". M3: one or two. */
  headlineLines?: LineLimit;
  /**
   * The most lines each item's supporting text shows, then "…". M3: one in a two-line item,
   * two in a three-line item.
   */
  supportingTextLines?: LineLimit;
  ref?: Ref<HTMLElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: ListClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type ListProps = ListOwnProps & Naming;

/** What every item of a list reads from it. */
interface ListOptions {
  headlineLines?: LineLimit | undefined;
  supportingTextLines?: LineLimit | undefined;
  dividers?: ListDividers | undefined;
  selectionIndicator?: boolean | undefined;
}

const ListOptionsContext = createContext<ListOptions>({});

/**
 * M3 Expressive list: items with a headline, optional overline and supporting text, and
 * leading and trailing content, flush (standard) or segmented into rounded groups.
 *
 * With `selectionMode` it is a list box of options (`listbox` / `option`), and selected items
 * show a check. With `onAction` or links it is an interactive grid list, where ← / → reach
 * trailing controls. Items with `childItems` expand and collapse (a tree grid). Interactive
 * items get state layers and morph their corners on hover, focus, press and selection, and
 * ↑ / ↓ move between them, wrapping at the ends. Otherwise it is a plain `ul`.
 *
 * Items can lead with M3's image or video thumbnail (`ListItemImage`, `ListItemVideo`),
 * limit their lines (`headlineLines`, `supportingTextLines`), and standard lists can draw
 * `dividers`.
 *
 * @example
 * <List variant="segmented" aria-label="Settings" onAction={open}>
 *   <ListItem key="wifi" leading={<WifiIcon />} supportingText="Connected">Wi‑Fi</ListItem>
 *   <ListItem key="bluetooth" leading={<BluetoothIcon />}>Bluetooth</ListItem>
 * </List>
 */
export function List(props: ListProps) {
  const { headlineLines, supportingTextLines, dividers, selectionIndicator, classNames } = props;
  if (dividers != null && props.variant === 'segmented') {
    throw new Error(
      '[@windmorph/react] List: dividers are for standard lists; segmented items are already apart.',
    );
  }
  return (
    <ListOptionsContext
      value={{ headlineLines, supportingTextLines, dividers, selectionIndicator }}
    >
      <ListMediaContext value={classNames?.media}>
        <ListBody {...props} />
      </ListMediaContext>
    </ListOptionsContext>
  );
}

function ListBody(props: ListProps) {
  const items = listItems(props.children);
  if (
    props.value !== undefined ||
    props.defaultValue !== undefined ||
    props.onValueChange !== undefined
  ) {
    const invalid = items.find(
      (item) => item.props.value == null || item.props.control != null || item.props.href != null,
    );
    if (invalid) {
      throw new Error(
        '[@windmorph/react] List: every item of a radio list (one with value, defaultValue or ' +
          'onValueChange) needs a value, and none can have a control or an href.',
      );
    }
    return <RadioList {...props} items={items} />;
  }
  const selectable = props.selectionMode != null && props.selectionMode !== 'none';
  const expandable = items.some((item) => listItems(item.props.childItems).length > 0);
  // Links alone don't make a grid list: they render as real anchors in a plain list.
  const interactive = props.onAction != null || selectable || expandable;
  if (!interactive) return <StaticList {...props} items={items} />;
  if (items.some((item) => item.props.control != null)) {
    throw new Error(
      "[@windmorph/react] List: switch and checkbox items (control) can't be in a list with " +
        'onAction, links, selectionMode or childItems. Put them in their own list, or put a ' +
        "Switch in an item's trailing content.",
    );
  }
  if (expandable) return <InteractiveList {...props} kind="tree" />;
  // A selection list is a list box (M3: "Container: List box · List item: Option"); a list
  // whose items also act or link keeps the grid list's separate actions.
  if (selectable && props.onAction == null && !items.some((item) => item.props.href != null)) {
    return <InteractiveList {...props} kind="listbox" />;
  }
  return <InteractiveList {...props} kind="grid" />;
}

function itemLines(item: ListItemProps): 1 | 2 | 3 {
  const extra = Number(item.overline != null) + Number(item.supportingText != null);
  return extra === 2 ? 3 : extra === 1 ? 2 : 1;
}

function itemStylesOptions(
  item: ListItemProps,
  variant: ListVariant | undefined,
  interactive: boolean,
  options: ListOptions,
) {
  const headlineLines = item.headlineLines ?? options.headlineLines;
  const supportingTextLines = item.supportingTextLines ?? options.supportingTextLines;
  return {
    variant,
    interactive,
    lines: itemLines(item),
    ...(item.verticalAlignment && { align: item.verticalAlignment }),
    ...(options.dividers && { dividers: options.dividers }),
    ...(headlineLines && { headlineLines }),
    ...(supportingTextLines && { supportingTextLines }),
  };
}

function itemStyles(
  item: ListItemProps,
  variant: ListVariant | undefined,
  interactive: boolean,
  options: ListOptions,
) {
  return listStyles(itemStylesOptions(item, variant, interactive, options));
}

function position(index: number, count: number) {
  if (count === 1) return 'only';
  if (index === 0) return 'first';
  return index === count - 1 ? 'last' : 'middle';
}

interface ItemIds {
  headline?: string;
  overline?: string;
  supporting?: string;
}

function ItemContent({
  item,
  styles,
  classNames,
  ids,
  control,
  controlPlacement,
  headline,
  sideClassName,
  end,
}: {
  item: ListItemProps;
  styles: ReturnType<typeof listStyles>;
  classNames?: ListClassNames;
  ids?: ItemIds;
  control?: ReactNode;
  controlPlacement?: ControlPlacement;
  /** What the list adds after the trailing content: the selection check, the chevron. */
  end?: ReactNode;
  /** Wraps the headline (a link item's anchor). */
  headline?: (children: ReactNode) => ReactNode;
  /** Classes for the leading and trailing content (a link item raises its controls). */
  sideClassName?: string;
}) {
  const leading = controlPlacement === 'leading' ? control : null;
  const trailing = controlPlacement === 'trailing' ? control : end;
  return (
    <>
      {(item.leading != null || leading != null) && (
        <span className={styles.leading({ class: cn(sideClassName, classNames?.leading) })}>
          {leading}
          {item.leading}
        </span>
      )}
      <span className={styles.text({ class: classNames?.text })}>
        {item.overline != null && (
          <span id={ids?.overline} className={styles.overline({ class: classNames?.overline })}>
            {item.overline}
          </span>
        )}
        <span id={ids?.headline} className={styles.headline({ class: classNames?.headline })}>
          {headline ? headline(item.children) : item.children}
        </span>
        {item.supportingText != null && (
          <span
            id={ids?.supporting}
            className={styles.supporting({ class: classNames?.supporting })}
          >
            {item.supportingText}
          </span>
        )}
      </span>
      {(item.trailing != null || trailing != null) && (
        <span className={styles.trailing({ class: cn(sideClassName, classNames?.trailing) })}>
          {item.trailing}
          {trailing}
        </span>
      )}
    </>
  );
}

function StaticList({
  variant,
  disabled,
  classNames,
  className,
  style,
  ref,
  items,
  ...rest
}: ListProps & { items: ReactElement<ListItemProps>[] }) {
  const { data } = splitDataAttributes(rest);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = rest as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const root = listStyles({ variant }).root({ class: cn(classNames?.root, className) });
  const options = useContext(ListOptionsContext);
  const disabledKeySet = new Set<Key>(rest.disabledKeys ?? []);
  return (
    <ul
      {...data}
      ref={ref as Ref<HTMLUListElement>}
      style={style}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={root}
    >
      {items.map((item, index) => {
        const isDisabled = Boolean(
          disabled || item.props.disabled || (item.key != null && disabledKeySet.has(item.key)),
        );
        if (item.props.href != null) {
          return (
            <LinkItem
              key={item.key ?? index}
              item={item.props}
              variant={variant}
              classNames={classNames}
              position={position(index, items.length)}
              isDisabled={isDisabled}
            />
          );
        }
        if (item.props.control != null) {
          return (
            <li key={item.key ?? index}>
              <ToggleItem
                item={item.props}
                control={item.props.control}
                variant={variant}
                classNames={classNames}
                position={position(index, items.length)}
                listDisabled={isDisabled}
              />
            </li>
          );
        }
        const styles = itemStyles(item.props, variant, false, options);
        return (
          <li
            key={item.key ?? index}
            data-shape="rest"
            data-position={position(index, items.length)}
            className={styles.item({ class: cn(classNames?.item, item.props.className) })}
          >
            <span className={styles.cell()}>
              <ItemContent item={item.props} styles={styles} classNames={classNames} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

type InteractiveKind = 'grid' | 'listbox' | 'tree';

function InteractiveList(props: ListProps & { kind: InteractiveKind }) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <CollectionList {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

/** Material Symbols "check" and "expand_more" (Apache-2.0). */
function CheckIcon20() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
}

function ExpandMoreIcon() {
  return (
    <svg viewBox="0 -960 960 960">
      <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
  );
}

/**
 * A grid list (`onAction`, links), a list box (selection) or a tree grid (`childItems`),
 * from React Aria's collection hooks. Arrow keys wrap at the ends, as M3 asks.
 */
function CollectionList({
  kind,
  variant,
  disabled,
  classNames,
  className,
  style,
  ref,
  directionRef,
  ...rest
}: ListProps & { kind: InteractiveKind; directionRef: (element: HTMLElement | null) => void }) {
  const { data, rest: ariaProps } = splitDataAttributes(rest);
  assertCollectionChildren(rest.children, 'List', 'ListItem elements');
  const options = {
    ...(ariaProps as unknown as AriaGridListProps<object>),
    disabledKeys: disabledItemKeys(rest.children, rest.disabledKeys, disabled),
    shouldFocusWrap: true,
  };
  const root: CollectionRootProps = {
    options,
    listRef: ref,
    directionRef,
    data,
    style,
    className: listStyles({ variant }).root({ class: cn(classNames?.root, className) }),
    variant,
    classNames,
  };
  if (kind === 'tree') return <TreeList {...root} />;
  if (kind === 'listbox') return <ListBoxList {...root} />;
  return <GridList {...root} />;
}

interface CollectionRootProps {
  options: AriaGridListProps<object> & { shouldFocusWrap: boolean };
  listRef: Ref<HTMLElement> | undefined;
  directionRef: (element: HTMLElement | null) => void;
  data: Record<string, unknown>;
  style?: CSSProperties | undefined;
  className: string;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
}

function GridList({
  options,
  listRef,
  directionRef,
  data,
  style,
  className,
  variant,
  classNames,
}: CollectionRootProps) {
  const rootRef = useObjectRef(listRef as Ref<HTMLDivElement>);
  const state = useListState(options);
  const { gridProps } = useGridList(options, state, rootRef);
  const nodes = [...state.collection];
  return (
    <div
      {...mergeProps(data, gridProps)}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      className={className}
    >
      {nodes.map((node, index) => (
        <GridListRow
          key={node.key}
          node={node}
          state={state}
          variant={variant}
          classNames={classNames}
          position={position(index, nodes.length)}
        />
      ))}
    </div>
  );
}

/** Compose's shape precedence: pressed, then selected or focused (16px), then hovered (12px). */
function shapeOf(state: {
  isPressed: boolean;
  isSelected: boolean;
  isFocusVisible: boolean;
  isHovered: boolean;
  isDisabled: boolean;
}) {
  if ((state.isPressed && !state.isDisabled) || state.isSelected || state.isFocusVisible) {
    return 'active';
  }
  return state.isHovered && !state.isDisabled ? 'hovered' : 'rest';
}

/** The check a selected item shows at its end, when the list selects and shows it. */
function useSelectionCheck(styles: ReturnType<typeof listStyles>, selectable: boolean): ReactNode {
  const { selectionIndicator = true } = useContext(ListOptionsContext);
  if (!selectable || !selectionIndicator) return null;
  return (
    <span aria-hidden="true" data-selection-indicator="" className={styles.selectionIndicator()}>
      <CheckIcon20 />
    </span>
  );
}

function GridListRow({
  node,
  state,
  variant,
  classNames,
  position: itemPosition,
}: {
  node: Node<object>;
  state: ListState<object>;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  position: string;
}) {
  const item = node.props as ListItemProps;
  const ref = useRef<HTMLDivElement>(null);
  const { rowProps, gridCellProps, descriptionProps, isPressed, isSelected, isDisabled } =
    useGridListItem({ node }, state, ref);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const check = useSelectionCheck(styles, state.selectionManager.selectionMode !== 'none');
  return (
    <div
      {...mergeProps(rowProps, hoverProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <div {...gridCellProps} className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={{ supporting: descriptionProps.id }}
          end={check}
        />
      </div>
    </div>
  );
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** A list box of options: M3's single- and multi-select lists on the web. */
function ListBoxList({
  options,
  listRef,
  directionRef,
  data,
  style,
  className,
  variant,
  classNames,
}: CollectionRootProps) {
  const rootRef = useObjectRef(listRef as Ref<HTMLDivElement>);
  const listBoxOptions = options as unknown as AriaListBoxOptions<object>;
  const state = useListState(listBoxOptions);
  const { listBoxProps } = useListBox(listBoxOptions, state, rootRef);
  const nodes = [...state.collection];
  return (
    <div
      {...mergeProps(data, listBoxProps)}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      className={className}
    >
      {nodes.map((node, index) => (
        <OptionRow
          key={node.key}
          node={node}
          state={state}
          variant={variant}
          classNames={classNames}
          position={position(index, nodes.length)}
        />
      ))}
    </div>
  );
}

function OptionRow({
  node,
  state,
  variant,
  classNames,
  position: itemPosition,
}: {
  node: Node<object>;
  state: ListState<object>;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  position: string;
}) {
  const item = node.props as ListItemProps;
  const ref = useRef<HTMLDivElement>(null);
  const { optionProps, labelProps, descriptionProps, isPressed, isSelected, isDisabled } =
    useOption({ key: node.key }, state, ref);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const check = useSelectionCheck(styles, true);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const nested = ref.current?.querySelector(FOCUSABLE);
    if (nested) {
      console.warn(
        '[@windmorph/react] List: an item of a selection list is one option and must not hold ' +
          'buttons, links or fields. Give the list onAction to keep separate trailing actions.',
        nested,
      );
    }
  });
  return (
    <div
      {...mergeProps(optionProps, hoverProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <span className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={{ headline: labelProps.id, supporting: descriptionProps.id }}
          end={check}
        />
      </span>
    </div>
  );
}

/** A tree grid: items with `childItems` expand and collapse to show their nested items. */
function TreeList({
  options,
  listRef,
  directionRef,
  data,
  style,
  className,
  variant,
  classNames,
}: CollectionRootProps) {
  const rootRef = useObjectRef(listRef as Ref<HTMLDivElement>);
  // `options` carries the list's `expandedKeys`, `defaultExpandedKeys` and `onExpandedChange`.
  const treeOptions = options as unknown as AriaTreeOptions<object> &
    Pick<ListProps, 'expandedKeys' | 'defaultExpandedKeys' | 'onExpandedChange'>;
  const state = useTreeState(treeOptions);
  const { gridProps } = useTree(treeOptions, state, rootRef);
  const rows = [...state.collection.getKeys()]
    .map((key) => state.collection.getItem(key))
    .filter((node): node is Node<object> => node?.type === 'item');
  return (
    <div
      {...mergeProps(data, gridProps)}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      className={className}
    >
      {rows.map((node, index) => (
        <TreeRow
          key={node.key}
          node={node}
          state={state}
          variant={variant}
          classNames={classNames}
          position={position(index, rows.length)}
        />
      ))}
    </div>
  );
}

type TreeCollection = TreeState<object>['collection'] & {
  getChildren?: (key: Key) => Iterable<Node<object>>;
};

/**
 * React Aria's tree item reads a row's siblings (for `aria-posinset` and `aria-setsize`)
 * through `collection.getChildren` and each sibling's `nextKey`, which React Stately's
 * `TreeCollection` doesn't provide: its `nextKey` and `index` follow the visible rows, as
 * keyboard navigation needs. While the row's hook runs, this gives the collection the
 * nested items' own order, and the returned function restores it. React Aria keys its
 * per-list data by the state object, so the state itself has to be the one patched.
 */
function withSiblingOrder(state: TreeState<object>, node: Node<object>) {
  const collection = state.collection as TreeCollection;
  const visibleItem = collection.getItem.bind(collection);
  const siblingsOf = (parentKey: Key | null | undefined) =>
    (parentKey == null ? [...collection] : [...(visibleItem(parentKey)?.childNodes ?? [])]).filter(
      (sibling) => sibling.type === 'item',
    );
  const inSiblingOrder = (item: Node<object>): Node<object> => {
    const siblings = siblingsOf(item.parentKey);
    const index = siblings.findIndex((sibling) => sibling.key === item.key);
    return { ...item, index, nextKey: siblings[index + 1]?.key ?? null };
  };
  collection.getItem = (key: Key) => {
    const item = visibleItem(key);
    return item ? inSiblingOrder(item) : null;
  };
  collection.getChildren = (key: Key) => siblingsOf(key).map(inSiblingOrder);
  return {
    node: inSiblingOrder(node),
    restore: () => {
      delete (collection as Partial<TreeCollection>).getItem;
      delete collection.getChildren;
    },
  };
}

function ExpandButton({ props, className }: { props: AriaButtonProps; className: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const { buttonProps, isPressed } = useButton(props, ref);
  const { interactionProps, dataAttributes } = useM3Interaction(
    { isDisabled: props.isDisabled, isPressed },
    ref,
  );
  return (
    <button
      {...mergeProps(buttonProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      className={className}
    >
      <TouchTarget />
      <ExpandMoreIcon />
    </button>
  );
}

function TreeRow({
  node,
  state,
  variant,
  classNames,
  position: itemPosition,
}: {
  node: Node<object>;
  state: TreeState<object>;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  position: string;
}) {
  const item = node.props as ListItemProps;
  const ref = useRef<HTMLDivElement>(null);
  const siblingOrder = withSiblingOrder(state, node);
  const {
    rowProps,
    gridCellProps,
    descriptionProps,
    expandButtonProps,
    isPressed,
    isSelected,
    isDisabled,
  } = useTreeItem({ node: siblingOrder.node, hasChildItems: node.hasChildNodes }, state, ref);
  siblingOrder.restore();
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = listStyles({
    ...itemStylesOptions(item, variant, true, options),
    nested: node.level > 0,
  });
  const check = useSelectionCheck(styles, state.selectionManager.selectionMode !== 'none');
  const end = (
    <>
      {check}
      {node.hasChildNodes && (
        <ExpandButton props={{ ...expandButtonProps, isDisabled }} className={styles.expand()} />
      )}
    </>
  );
  return (
    <div
      {...mergeProps(rowProps, hoverProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      style={{ '--m3-list-level': node.level } as CSSProperties}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <div {...gridCellProps} className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={{ supporting: descriptionProps.id }}
          end={end}
        />
      </div>
    </div>
  );
}

/** The keys of disabled items: `disabledKeys`, items with `disabled`, or every item. */
function disabledItemKeys(
  children: ReactNode,
  disabledKeys: Iterable<Key> | undefined,
  all: boolean | undefined,
): Iterable<Key> | undefined {
  const keys = new Set<Key>(disabledKeys ?? []);
  const visit = (node: ReactNode) => {
    if (Array.isArray(node)) node.forEach(visit);
    else if (isValidElement<ListItemProps>(node) && node.key != null) {
      if (all || node.props.disabled) keys.add(node.key);
    }
  };
  visit(children);
  return keys.size > 0 ? keys : disabledKeys;
}

/** Ids that name an item that is a control (its headline) and describe it (the rest). */
function useItemIds(item: ListItemProps) {
  const id = useId();
  const ids: ItemIds = {
    headline: `${id}-headline`,
    ...(item.overline != null && { overline: `${id}-overline` }),
    ...(item.supportingText != null && { supporting: `${id}-supporting` }),
  };
  const described = [ids.overline, ids.supporting].filter(Boolean).join(' ');
  const naming =
    item['aria-label'] != null
      ? { 'aria-label': item['aria-label'] }
      : { 'aria-labelledby': ids.headline };
  return { ids, naming: { ...naming, ...(described && { 'aria-describedby': described }) } };
}

interface ToggleItemProps {
  item: ListItemProps;
  control: 'switch' | 'checkbox';
  variant?: ListVariant;
  classNames?: ListClassNames;
  position: string;
  listDisabled?: boolean;
}

/** A switch or checkbox item: a visually hidden native input, the item as its label. */
function ToggleItem({ item, control, listDisabled, ...view }: ToggleItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ids, naming } = useItemIds(item);
  const isDisabled = Boolean(listDisabled || item.disabled);
  const options: AriaCheckboxProps = {
    ...naming,
    children: item.children,
    isSelected: item.checked,
    defaultSelected: item.defaultChecked,
    onChange: item.onCheckedChange,
    isDisabled,
    name: item.name,
    value: item.value,
  };
  const state = useToggleState(options);
  const { inputProps, labelProps, isSelected, isPressed } = useCheckbox(options, state, inputRef);
  return (
    <ControlItem
      {...view}
      item={item}
      ids={ids}
      kind={control}
      // A native checkbox with the switch role, as React Aria's `useSwitch` renders it.
      inputProps={control === 'switch' ? { ...inputProps, role: 'switch' } : inputProps}
      inputRef={inputRef}
      labelProps={labelProps}
      isSelected={isSelected}
      isDisabled={isDisabled}
      isPressed={isPressed}
      placement={item.controlPlacement ?? (control === 'switch' ? 'trailing' : 'leading')}
    />
  );
}

function RadioList({
  variant,
  classNames,
  className,
  style,
  ref,
  items,
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  controlPlacement = 'leading',
  ...rest
}: ListProps & { items: ReactElement<ListItemProps>[] }) {
  const { data } = splitDataAttributes(rest);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = rest as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const options: AriaRadioGroupProps = {
    'aria-label': label,
    'aria-labelledby': labelledBy,
    value,
    defaultValue,
    onChange: onValueChange,
    name,
    isRequired: required,
    isDisabled: disabled,
  };
  const state = useRadioGroupState(options);
  const { radioGroupProps } = useRadioGroup(options, state);
  return (
    <div
      {...mergeProps(data, radioGroupProps)}
      ref={ref as Ref<HTMLDivElement>}
      style={style}
      className={listStyles({ variant }).root({ class: cn(classNames?.root, className) })}
    >
      {items.map((item, index) => (
        <RadioItem
          key={item.key ?? index}
          item={item.props}
          state={state}
          variant={variant}
          classNames={classNames}
          position={position(index, items.length)}
          placement={item.props.controlPlacement ?? controlPlacement}
        />
      ))}
    </div>
  );
}

function RadioItem({
  item,
  state,
  placement,
  ...view
}: {
  item: ListItemProps;
  state: RadioGroupState;
  variant?: ListVariant;
  classNames?: ListClassNames;
  position: string;
  placement: ControlPlacement;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ids, naming } = useItemIds(item);
  const { inputProps, labelProps, isSelected, isDisabled, isPressed } = useRadio(
    { ...naming, children: item.children, value: item.value ?? '', isDisabled: item.disabled },
    state,
    inputRef,
  );
  return (
    <ControlItem
      {...view}
      item={item}
      ids={ids}
      kind="radio"
      inputProps={inputProps}
      inputRef={inputRef}
      labelProps={labelProps}
      isSelected={isSelected}
      isDisabled={isDisabled}
      isPressed={isPressed}
      placement={placement}
    />
  );
}

/**
 * An item that is a switch, checkbox or radio button (Compose's toggleable and selectable
 * `ListItem`s): the item is the input's `<label>`, so pressing anywhere on it changes it,
 * with the list item's state layer, shapes and selected colours. The drawn control only
 * shows the state.
 */
function ControlItem({
  item,
  ids,
  kind,
  inputProps,
  inputRef,
  labelProps,
  isSelected,
  isDisabled,
  isPressed,
  placement,
  variant,
  classNames,
  position: itemPosition,
}: {
  item: ListItemProps;
  ids: ItemIds;
  kind: 'switch' | 'checkbox' | 'radio';
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  inputRef: RefObject<HTMLInputElement | null>;
  labelProps: LabelHTMLAttributes<HTMLLabelElement>;
  isSelected: boolean;
  isDisabled: boolean;
  isPressed: boolean;
  placement: ControlPlacement;
  variant?: ListVariant;
  classNames?: ListClassNames;
  position: string;
}) {
  const ref = useRef<HTMLLabelElement>(null);
  const { interactionProps, dataAttributes, state } = useM3Interaction(
    { isDisabled, isPressed, isSelected, within: true },
    ref,
  );
  // Compose's shape precedence: pressed, then selected or focused (16px), then hovered (12px).
  const shape =
    (isPressed && !isDisabled) || isSelected || state.isFocusVisible
      ? 'active'
      : state.isHovered && !isDisabled
        ? 'hovered'
        : 'rest';
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const controlState = {
    'data-selected': isSelected || undefined,
    'data-checked': (kind === 'checkbox' && isSelected) || undefined,
    'data-disabled': isDisabled || undefined,
  };
  return (
    <label
      {...mergeProps(labelProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      data-shape={shape}
      data-position={itemPosition}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <VisuallyHidden elementType="span">
        <input {...inputProps} ref={inputRef} />
      </VisuallyHidden>
      <span className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={ids}
          controlPlacement={placement}
          control={
            <span
              {...controlState}
              aria-hidden="true"
              className={styles.control({ class: classNames?.control })}
            >
              {kind === 'radio' && <RadioRing />}
              {kind === 'checkbox' && <CheckboxBox />}
              {kind === 'switch' && <SwitchTrack selected={isSelected} icons={item.switchIcons} />}
            </span>
          }
        />
      </span>
    </label>
  );
}

/** A switch's track and thumb, at rest (the item, not the switch, takes the interaction). */
function SwitchTrack({ selected, icons }: { selected: boolean; icons?: boolean }) {
  const styles = switchStyles();
  const icon = icons ? selected ? <CheckIcon /> : <CloseIcon /> : null;
  const { size, center } = thumbGeometry(selected, false, Boolean(icon));
  return (
    <span
      className={styles.control()}
      style={
        { '--m3-thumb-size': `${size}px`, '--m3-thumb-center': `${center}px` } as CSSProperties
      }
    >
      <SwitchThumb styles={styles} icon={icon} />
    </span>
  );
}

/**
 * The `ListItem` elements, flattened from arrays, with the keys they were given. `Children`
 * also unwraps lazy elements, which a server component's items can arrive as (Next's dev
 * server sends some that way), so they're never dropped from the server render.
 */
function listItems(children: ReactNode): ReactElement<ListItemProps>[] {
  const items: ReactElement<ListItemProps>[] = [];
  Children.forEach(children, (node) => {
    if (isValidElement<ListItemProps>(node)) items.push(node);
  });
  return items;
}

/**
 * A link item: the item holds a real `<a>` on its headline, whose overlay covers the whole
 * item, so the item is the link (the browser's link menu and modified clicks included)
 * while buttons in its leading or trailing content stay separate controls, never nested in
 * the link. The link is named by the headline and described by the overline and supporting
 * text. React Aria's `useLink` routes a plain click through the `RouterProvider`; a disabled
 * item has no `href`.
 */
function LinkItem({
  item,
  variant,
  classNames,
  position: itemPosition,
  isDisabled,
}: {
  item: ListItemProps;
  variant?: ListVariant;
  classNames?: ListClassNames;
  position: string;
  isDisabled: boolean;
}) {
  const itemRef = useRef<HTMLLIElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const { ids, naming } = useItemIds(item);
  const href = isDisabled ? undefined : item.href;
  const { linkProps, isPressed } = useLink(
    { href, target: item.target, isDisabled, elementType: 'a' },
    linkRef,
  );
  const { focusProps, isFocusVisible } = useFocusRing();
  const current = Boolean(item.current);
  const { interactionProps, dataAttributes, state } = useM3Interaction(
    { isDisabled, isPressed, isSelected: current },
    itemRef,
  );
  // Compose's shape precedence: pressed, then selected or focused (16px), then hovered (12px).
  const shape =
    (isPressed && !isDisabled) || current || isFocusVisible
      ? 'active'
      : state.isHovered && !isDisabled
        ? 'hovered'
        : 'rest';
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const rel = item.rel ?? (item.target === '_blank' ? 'noopener noreferrer' : undefined);
  return (
    <li
      {...interactionProps}
      {...dataAttributes}
      // The link's focus, not a control's in the trailing content, focuses the item.
      data-focused={isFocusVisible || undefined}
      data-focus-visible={isFocusVisible || undefined}
      ref={itemRef}
      data-shape={shape}
      data-position={itemPosition}
      className={styles.item({ class: cn('relative', classNames?.item, item.className) })}
    >
      <span className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={ids}
          sideClassName={styles.raised()}
          headline={(children) => (
            <a
              {...mergeProps(linkProps, focusProps)}
              {...naming}
              ref={linkRef}
              href={href}
              target={item.target}
              rel={rel}
              download={item.download}
              aria-current={current ? 'page' : undefined}
              className={styles.link()}
            >
              {children}
            </a>
          )}
        />
      </span>
    </li>
  );
}
