'use client';

import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type InputHTMLAttributes,
  type JSX,
  type KeyboardEvent,
  type LabelHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import {
  mergeProps,
  mergeRefs,
  useButton,
  useCheckbox,
  useFocusRing,
  useGridList,
  useGridListItem,
  useGridListSection,
  useHover,
  useLink,
  useListBox,
  useListBoxSection,
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
import { preventHiddenInputScroll } from '../../primitives/hidden-input-focus';
import { TouchTarget } from '../../primitives/TouchTarget';
import { useM3Interaction } from '../../primitives/use-m3-interaction';
import { CheckboxBox } from '../checkbox/checkbox-box';
import { RadioRing } from '../radio/radio-ring';
import { CheckIcon, CloseIcon, SwitchThumb, thumbGeometry } from '../switch/switch-thumb';
import { switchStyles } from '../switch/switch-styles';
import { FOCUSABLE_DISABLED_OPTIONS } from '../../utils/focusable-disabled';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { useKeepPressedInPlace } from '../../utils/keep-pressed-in-place';
import { useNearestReveal } from '../../utils/nearest-reveal';
import { cn } from '../../utils/cn';
import { densityAttribute, type Density } from '../../tokens/density';
import { mergeDataTokens } from '../../utils/merge-data-tokens';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { warnOnce } from '../../utils/warn-once';
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
  /** A link item's `rel`, e.g. `"nofollow"`. */
  rel?: string;
  /** Downloads the link item's file instead of opening it (optionally with a file name). */
  download?: boolean | string;
  /** Plain-text version of the headline, for type-ahead and announcements. */
  textValue?: string;
  /** Accessible name when the headline isn't plain text. */
  'aria-label'?: string;
  /** Classes for the item, merged after `classNames.item`; consumer classes win. */
  className?: string;
  /**
   * Makes the whole item a switch or a checkbox (Compose's toggleable `ListItem`): pressing
   * anywhere on it toggles it, and it is one control for assistive tech. Not in lists with
   * `onAction`, links or `selectionMode`. Left out, the item is a plain row.
   */
  control?: 'switch' | 'checkbox';
  /** Whether a switch or checkbox item is on (controlled). */
  checked?: boolean;
  /** Whether a switch or checkbox item starts on (uncontrolled). */
  defaultChecked?: boolean;
  /** Called when a switch or checkbox item is toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Where the switch, checkbox or radio button sits, at the start or end of the row. @default "start", or "end" for a switch */
  controlPlacement?: ControlPlacement;
  /** A radio list item's value, or the value a switch or checkbox item posts with its form. */
  value?: string;
  /** The form field name of a switch or checkbox item. */
  name?: string;
  /** Disables the item. @default false */
  disabled?: boolean;
  /**
   * Aligns the content; by default it is centred, and top-aligned in three-line items.
   * @default "center", or "top" in three-line items
   */
  verticalAlignment?: 'center' | 'top';
  /** Shows ✓ and ✕ in a switch item's thumb. @default false */
  switchIcons?: boolean;
  /** The most lines the headline shows, then "…". Left out, the list's `headlineLines` applies. */
  headlineLines?: LineLimit;
  /**
   * The most lines the supporting text shows, then "…". Left out, the list's
   * `supportingTextLines` applies.
   */
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

type ControlPlacement = 'start' | 'end';

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

/**
 * A `ListItem` renders itself only in a plain or radio list, which hand it its place through
 * context. Interactive lists read its props through `getCollectionNode` and never render it.
 */
function ListItemElement(props: ListItemProps): ReactNode {
  const entry = useContext(ListEntryContext);
  const radio = useContext(RadioListContext);
  const plain = useContext(StaticListContext);
  if (!entry) return null;
  if (radio) return <RadioListItem item={props} radio={radio} position={entry.position} />;
  if (plain) return <StaticListItem item={props} list={plain} entry={entry} />;
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
  // Once per page: the collection is rebuilt on every render of the list.
  if (!textValue) {
    warnOnce(
      'list-item-text-value',
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

/** Props of a {@link ListSection}: a subheader, or a name when it shows none. */
export type ListSectionProps = {
  /** `ListItem` elements, each with its own `key`. */
  children: ReactElement<ListItemProps> | ReactElement<ListItemProps>[];
  /** Classes for the section, merged after `classNames.section`; consumer classes win. */
  className?: string;
} & (
  | {
      /** The subheader shown above the section's items, which names the group. */
      title: ReactNode;
      /** Accessible name for the group, instead of the subheader's text. */
      'aria-label'?: string;
    }
  | {
      title?: undefined;
      /** Accessible name for the group when it shows no subheader. */
      'aria-label': string;
    }
);

/** A collection node for a section, as React Stately's `Section` describes it. */
interface ListSectionNode {
  type: 'section';
  props: ListSectionProps;
  rendered: ReactNode;
  'aria-label'?: string | undefined;
  hasChildNodes: true;
  childNodes: () => Iterable<ListItemNode>;
}

/**
 * A `ListSection` renders itself only in a plain list: its subheader, and its items, each
 * told through context that it sits in this section and where. Interactive lists read it
 * through `getCollectionNode`. It never needs its type compared, so a section created in a
 * Server Component (whose type reaches the client as a lazy client reference) renders the
 * same as one created in the browser.
 */
function ListSectionElement(props: ListSectionProps): ReactNode {
  const entry = useContext(ListEntryContext);
  const plain = useContext(StaticListContext);
  if (useContext(RadioListContext)) {
    throw new Error(
      "[@windmorph/react] List: a radio list can't hold ListSections. Use one radio list " +
        'per group, or a list with selectionMode="single".',
    );
  }
  const register = plain?.registerSection;
  const index = entry?.index;
  // Tells the list this entry is a section, so the loose items around it form their own
  // groups. A layout effect, so the corrected corners are drawn before the first paint.
  useLayoutEffect(() => {
    if (register == null || index == null || entry?.inSection) return undefined;
    return register(index);
  }, [register, index, entry?.inSection]);
  if (!plain || !entry) return null;
  const items = listItems(props.children);
  return (
    <StaticSection section={props} variant={plain.variant} classNames={plain.classNames}>
      {items.map((item, itemIndex) => (
        <ListEntryContext
          key={item.key ?? itemIndex}
          value={{
            index: itemIndex,
            position: position(itemIndex, items.length),
            inSection: true,
            disabled: plain.isKeyDisabled(item.key),
          }}
        >
          {item}
        </ListEntryContext>
      ))}
    </StaticSection>
  );
}

/** Describes the section to React Stately's collection builder, as its `Section` does. */
ListSectionElement.getCollectionNode = function* getCollectionNode(
  props: ListSectionProps,
): Generator<ListSectionNode> {
  const children = listItems(props.children);
  yield {
    type: 'section',
    props,
    rendered: props.title,
    'aria-label': props['aria-label'],
    hasChildNodes: true,
    *childNodes() {
      for (const element of children) yield { type: 'item', element };
    },
  };
};

/**
 * A labelled group of items in a {@link List}, under a subheader (`title`). Identify it with
 * a React `key`, like its items. Arrow keys move across sections as through one list.
 * Sections go in static, action (grid) and selection (list box) lists, not in radio lists
 * or lists with `childItems`.
 *
 * @example
 * <List aria-label="Settings" onAction={open}>
 *   <ListSection key="network" title="Network">
 *     <ListItem key="wifi">Wi‑Fi</ListItem>
 *   </ListSection>
 * </List>
 */
export const ListSection = ListSectionElement as unknown as (
  props: ListSectionProps,
) => JSX.Element;

export interface ListClassNames {
  /** The root list element, merged with `className`. */
  root?: string;
  /** Each `ListSection`'s wrapper (its subheader and items). */
  section?: string;
  /** Each `ListSection`'s subheader. */
  subheader?: string;
  /** Each item. */
  item?: string;
  /** Each item's leading content (icon, avatar, media or control). */
  leading?: string;
  /** Each item's text column (overline, headline and supporting text). */
  text?: string;
  /** Each item's overline. */
  overline?: string;
  /** Each item's headline. */
  headline?: string;
  /** Each item's supporting text. */
  supporting?: string;
  /** Each item's trailing content. */
  trailing?: string;
  /** The drawn switch, checkbox or radio button of an item that is one. */
  control?: string;
  /** The check that marks a selected item in a list with `selectionMode`. */
  selectionIndicator?: string;
  /** The chevron button that expands an item with nested items. */
  expandButton?: string;
  /** Every `ListItemImage` and `ListItemVideo` in the list (to round them, say). */
  media?: string;
}

type Naming =
  | {
      /** Accessible name for the list (a list has no visible label of its own). */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the list, such as a heading above it. */
      'aria-labelledby': string;
    };

type ListChild = ReactElement<ListItemProps> | ReactElement<ListSectionProps>;

interface ListOwnProps {
  /** Flush items, or separate items 2px apart with rounded group corners. @default "standard" */
  variant?: ListVariant;
  /** `ListItem` elements, or `ListSection`s of them. */
  children: ListChild | ListChild[];
  /** Called when an item is pressed or Enter is pressed on it. Makes the list interactive. */
  onAction?: (key: Key) => void;
  /** Whether items can be selected: none, one or several. @default "none" */
  selectionMode?: 'none' | 'single' | 'multiple';
  /** The keys of the selected items (controlled). */
  selectedKeys?: 'all' | Iterable<Key>;
  /** The keys of the items selected at first (uncontrolled). */
  defaultSelectedKeys?: 'all' | Iterable<Key>;
  /** Called with the selected keys when the selection changes. */
  onSelectionChange?: (keys: Set<Key> | 'all') => void;
  /**
   * The last selected item can be deselected, leaving none. `false` keeps at least one item
   * selected. @default true
   */
  deselectable?: boolean;
  /** The keys of items that can't be pressed or selected. */
  disabledKeys?: Iterable<Key>;
  /**
   * The selected item of a radio list (Compose's single-selection `ListItem`): with `value`,
   * `defaultValue` or `onValueChange`, the list is a radio group whose items are radio
   * buttons, each with a `value`.
   */
  value?: string | null;
  /** The radio list's initially selected item value (uncontrolled). */
  defaultValue?: string;
  /** Called with the chosen item's value when a radio list's selection changes. */
  onValueChange?: (value: string) => void;
  /** The form field name of a radio list. */
  name?: string;
  /** A radio list needs a choice before its form submits. @default false */
  required?: boolean;
  /** Disables every item. @default false */
  disabled?: boolean;
  /** Where a radio list's radio buttons sit, at the start or end of each row. @default "start" */
  controlPlacement?: ControlPlacement;
  /**
   * M3's dividers between items: `full` width, or `inset` 16dp from each side. Standard
   * lists only (segmented items are already apart). Left out, there are no dividers.
   */
  dividers?: ListDividers;
  /**
   * Selected items show a check at their end besides their colour, so selection never
   * relies on colour alone (M3 lists accessibility). @default true
   */
  selectionIndicator?: boolean;
  /**
   * Web density, `0` to `-3` (M3: a list "can adjust margins, spacing, or density"): each step
   * takes 4px off every item (one line 56px at 0, 44px at -3; two lines 72 → 60px; three
   * lines 88 → 76px; items grown by an image or avatar too) and off section subheaders, and
   * the controls inside items follow. Left out, the list takes the density of the nearest
   * `ThemeProvider` or `ThemeScope`. Prefer setting it there, from a setting, since M3 makes
   * density the reader's choice.
   * @default 0
   */
  density?: Density;
  /** The expanded items of a list with `childItems` (controlled). */
  expandedKeys?: Iterable<Key>;
  /** The items expanded at first (uncontrolled). */
  defaultExpandedKeys?: Iterable<Key>;
  /** Called with the expanded keys when an item expands or collapses. */
  onExpandedChange?: (keys: Set<Key>) => void;
  /** The most lines each item's headline shows, then "…". M3: one or two. Left out, no limit. */
  headlineLines?: LineLimit;
  /**
   * The most lines each item's supporting text shows, then "…". M3: one in a two-line item,
   * two in a three-line item. Left out, no limit.
   */
  supportingTextLines?: LineLimit;
  /** Ref to the root element: a `<ul>`, or a `<div>` grid or listbox when interactive. */
  ref?: Ref<HTMLElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
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
export function List({ density, ...props }: ListProps) {
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
        <ListBody {...props} {...densityAttribute(density)} />
      </ListMediaContext>
    </ListOptionsContext>
  );
}

const RADIO_ITEM_ERROR =
  '[@windmorph/react] List: every item of a radio list (one with value, defaultValue or ' +
  'onValueChange) needs a value, and none can have a control or an href.';

const CONTROL_ERROR =
  "[@windmorph/react] List: switch and checkbox items (control) can't be in a list with " +
  'onAction, links, selectionMode or childItems. Put them in their own list, or put a ' +
  "Switch in an item's trailing content.";

const EXPANDABLE_SECTIONS_ERROR =
  "[@windmorph/react] List: a list with childItems can't hold ListSections; nest the " +
  'groups as expandable items instead.';

/**
 * Picks the list's kind from its own props and its top-level entries' props; it never looks
 * at an entry's element type. A plain or radio list renders its entries, which place
 * themselves through context (`ListEntryContext`); an interactive list hands them to React
 * Stately's collection builder, which reads each through its `getCollectionNode`.
 */
function ListBody(props: ListProps) {
  const entries = listItems(props.children);
  if (
    props.value !== undefined ||
    props.defaultValue !== undefined ||
    props.onValueChange !== undefined
  ) {
    return <RadioList {...props} entries={entries} />;
  }
  const selectable = props.selectionMode != null && props.selectionMode !== 'none';
  // A section has no `childItems`, so only a top-level item can make the list expandable;
  // an item inside a section that has them refuses to render (EXPANDABLE_SECTIONS_ERROR).
  const expandable = entries.some((entry) => listItems(entry.props.childItems).length > 0);
  // Links alone don't make a grid list: they render as real anchors in a plain list.
  const interactive = props.onAction != null || selectable || expandable;
  if (!interactive) return <StaticList {...props} entries={entries} />;
  return <InteractiveList {...props} expandable={expandable} />;
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

/**
 * The component tokens' hooks (`list-tokens.ts`), on a list's root and on each item, so an
 * item's own state (`data-selected`) picks its colours. On the root, any set the app passed
 * (`props`) follows the list's own.
 */
function tokenAttributes(variant: ListVariant | undefined, props?: object) {
  return {
    'data-tokens': mergeDataTokens('md-comp-list', props),
    'data-variant': variant ?? 'standard',
  } as const;
}

/** An item's token hooks and its `data-slot`. */
function itemAttributes(variant: ListVariant | undefined) {
  return { ...tokenAttributes(variant), 'data-slot': 'item' } as const;
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
  textHidden,
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
  /**
   * Hides the text from assistive tech: a control item's input is already named and
   * described by it, so it would be read twice.
   */
  textHidden?: boolean;
}) {
  const leading = controlPlacement === 'start' ? control : null;
  const trailing = controlPlacement === 'end' ? control : end;
  return (
    <>
      {(item.leading != null || leading != null) && (
        <span
          ref={(cell) => hideDecorativeIcons(cell)}
          data-slot="leading"
          className={styles.leading({ class: cn(sideClassName, classNames?.leading) })}
        >
          {leading}
          {item.leading}
        </span>
      )}
      <span
        aria-hidden={textHidden || undefined}
        className={styles.text({ class: classNames?.text })}
      >
        {item.overline != null && (
          <span
            id={ids?.overline}
            data-slot="overline"
            className={styles.overline({ class: classNames?.overline })}
          >
            {item.overline}
          </span>
        )}
        <span
          id={ids?.headline}
          data-slot="headline"
          className={styles.headline({ class: classNames?.headline })}
        >
          {headline ? headline(item.children) : item.children}
        </span>
        {item.supportingText != null && (
          <span
            id={ids?.supporting}
            data-slot="supporting"
            className={styles.supporting({ class: classNames?.supporting })}
          >
            {item.supportingText}
          </span>
        )}
      </span>
      {(item.trailing != null || trailing != null) && (
        <span
          ref={(cell) => hideDecorativeIcons(cell)}
          data-slot="trailing"
          className={styles.trailing({ class: cn(sideClassName, classNames?.trailing) })}
        >
          {item.trailing}
          {trailing}
        </span>
      )}
    </>
  );
}

/**
 * Hides the bare icons of an item's leading or trailing content from assistive tech: an
 * `<svg>` child with no name of its own (`aria-label`, `aria-labelledby`, `role`, `<title>`)
 * is decorative, since the item's text names the item, and would otherwise be listed as an
 * unnamed image. A ref callback, so it also reaches icons that components render; it runs
 * on every render (no layout reads), so a replaced icon is hidden too.
 */
function hideDecorativeIcons(cell: HTMLElement | null) {
  if (!cell) return;
  for (const svg of cell.querySelectorAll(':scope > svg')) {
    if (
      svg.hasAttribute('aria-label') ||
      svg.hasAttribute('aria-labelledby') ||
      svg.hasAttribute('role') ||
      svg.querySelector(':scope > title')
    ) {
      continue;
    }
    svg.setAttribute('aria-hidden', 'true');
  }
}

/** What a plain list hands its items and sections. */
interface StaticListValue {
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  /** Whether the item with this key is disabled by the list (`disabled`, `disabledKeys`). */
  isKeyDisabled: (key: Key | null) => boolean;
  /** Marks the top-level entry at `index` as a section; returns its cleanup. */
  registerSection: (index: number) => () => void;
}

const StaticListContext = createContext<StaticListValue | null>(null);

/** Where an entry of a plain or radio list sits, from the list or section that renders it. */
interface ListEntry {
  index: number;
  /** Its position in its group (segmented corners, dividers). */
  position: string;
  /** Whether a `ListSection` holds it. */
  inSection: boolean;
  /** Whether the list disables it by its key. */
  disabled: boolean;
}

const ListEntryContext = createContext<ListEntry | null>(null);

/**
 * The positions of a plain list's top-level entries: each run of items between sections is
 * its own group. Sections are known once they've told the list (`registerSection`); before
 * that (the server render and the first client render) every entry counts as an item.
 */
function entryPositions(count: number, sections: ReadonlySet<number>): string[] {
  const positions: string[] = [];
  let start = 0;
  for (let index = 0; index <= count; index += 1) {
    if (index < count && !sections.has(index)) continue;
    for (let item = start; item < index; item += 1) {
      positions[item] = position(item - start, index - start);
    }
    if (index < count) positions[index] = 'only';
    start = index + 1;
  }
  return positions;
}

function StaticList({
  variant,
  disabled,
  classNames,
  className,
  style,
  ref,
  entries,
  ...rest
}: ListProps & { entries: ReactElement[] }) {
  const { data } = splitDataAttributes(rest);
  const rootTokens = tokenAttributes(variant, data);
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = rest as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const root = listStyles({ variant }).root({ class: cn(classNames?.root, className) });
  const [sections, setSections] = useState<ReadonlySet<number>>(() => new Set());
  const registerSection = useCallback((index: number) => {
    setSections((current) => (current.has(index) ? current : new Set(current).add(index)));
    return () =>
      setSections((current) => {
        const next = new Set(current);
        next.delete(index);
        return next;
      });
  }, []);
  const disabledKeys = rest.disabledKeys;
  const list = useMemo<StaticListValue>(() => {
    const keys = new Set<Key>(disabledKeys ?? []);
    return {
      variant,
      classNames,
      isKeyDisabled: (key) => Boolean(disabled) || (key != null && keys.has(key)),
      registerSection,
    };
  }, [variant, classNames, disabled, disabledKeys, registerSection]);
  const positions = entryPositions(entries.length, sections);
  return (
    <ul
      {...data}
      {...rootTokens}
      ref={ref as Ref<HTMLUListElement>}
      style={style}
      aria-label={label}
      aria-labelledby={labelledBy}
      onKeyDown={onLinkArrowKeys}
      className={root}
    >
      <StaticListContext value={list}>
        {entries.map((entry, index) => (
          <ListEntryContext
            key={entry.key ?? index}
            value={{
              index,
              position: positions[index]!,
              inSection: false,
              disabled: list.isKeyDisabled(entry.key),
            }}
          >
            {entry}
          </ListEntryContext>
        ))}
      </StaticListContext>
    </ul>
  );
}

/** An item of a plain list: a link, a switch or checkbox, or a plain row. */
function StaticListItem({
  item,
  list,
  entry,
}: {
  item: ListItemProps;
  list: StaticListValue;
  entry: ListEntry;
}) {
  const options = useContext(ListOptionsContext);
  if (entry.inSection && listItems(item.childItems).length > 0) {
    throw new Error(EXPANDABLE_SECTIONS_ERROR);
  }
  const { variant, classNames } = list;
  const isDisabled = Boolean(entry.disabled || item.disabled);
  if (item.href != null) {
    return (
      <LinkItem
        item={item}
        variant={variant}
        classNames={classNames}
        position={entry.position}
        isDisabled={isDisabled}
      />
    );
  }
  if (item.control != null) {
    return (
      <li data-list-entry="">
        <ToggleItem
          item={item}
          control={item.control}
          variant={variant}
          classNames={classNames}
          position={entry.position}
          listDisabled={isDisabled}
        />
      </li>
    );
  }
  const styles = itemStyles(item, variant, false, options);
  return (
    <li
      data-list-entry=""
      data-shape="rest"
      data-position={entry.position}
      {...itemAttributes(variant)}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <span className={styles.cell()}>
        <ItemContent item={item} styles={styles} classNames={classNames} />
      </span>
    </li>
  );
}

/**
 * Arrow keys between a list's links (M3: "navigate within the list using arrow keys"):
 * ↑ / ↓ move focus to the previous or next link, wrapping at the ends, and Home / End to
 * the first and last. Each link stays a real anchor and a Tab stop; disabled items have no
 * link and are skipped.
 */
function onLinkArrowKeys(event: KeyboardEvent<HTMLUListElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
  const links = [
    ...event.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href][data-list-link]'),
  ];
  const index = links.indexOf(event.target as HTMLAnchorElement);
  if (index === -1) return;
  const last = links.length - 1;
  const target =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? last
        : event.key === 'ArrowDown'
          ? index === last
            ? 0
            : index + 1
          : index === 0
            ? last
            : index - 1;
  event.preventDefault();
  links[target]!.focus();
}

/** The collection's top-level nodes as groups: each section, and each run of items. */
function groupNodes(collection: ListState<object>['collection']) {
  const groups: { section: Node<object> | null; items: Node<object>[] }[] = [];
  for (const node of collection) {
    if (node.type === 'section') {
      const items = [...collection.getChildren!(node.key)].filter((child) => child.type === 'item');
      groups.push({ section: node, items });
      continue;
    }
    const last = groups.at(-1);
    if (last?.section === null) last.items.push(node);
    else groups.push({ section: null, items: [node] });
  }
  return groups;
}

/** The name of a section's group: its `aria-label`, else its subheader. */
function sectionNaming(section: { title?: ReactNode; 'aria-label'?: string }, headingId: string) {
  return section['aria-label'] != null
    ? { 'aria-label': section['aria-label'] }
    : { 'aria-labelledby': headingId };
}

/** A section of a plain list: a subheader and a nested list named by it. */
function StaticSection({
  section,
  variant,
  classNames,
  children,
}: {
  section: ListSectionProps;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  children: ReactNode;
}) {
  const headingId = useId();
  const styles = listStyles({ variant, titled: section.title != null });
  return (
    <li
      data-slot="section"
      className={styles.section({ class: cn(classNames?.section, section.className) })}
    >
      {section.title != null && (
        <div id={headingId} className={styles.subheader({ class: classNames?.subheader })}>
          {section.title}
        </div>
      )}
      <ul {...sectionNaming(section, headingId)} className={styles.group()}>
        {children}
      </ul>
    </li>
  );
}

type InteractiveKind = 'grid' | 'listbox' | 'tree';

function InteractiveList(props: ListProps & { expandable: boolean }) {
  return (
    <DomDirectionLocale>
      {(directionRef) => <CollectionList {...props} directionRef={directionRef} />}
    </DomDirectionLocale>
  );
}

/** Material Symbols "check" and "expand_more" (Apache-2.0). */
function CheckIcon20() {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
    </svg>
  );
}

function ExpandMoreIcon() {
  return (
    <svg viewBox="0 -960 960 960" aria-hidden="true" focusable="false">
      <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z" />
    </svg>
  );
}

/**
 * A grid list (`onAction`, links), a list box (selection) or a tree grid (`childItems`),
 * from React Aria's collection hooks. Arrow keys wrap at the ends, as M3 asks.
 */
function CollectionList({
  expandable,
  variant,
  disabled,
  deselectable = true,
  classNames,
  className,
  style,
  ref,
  directionRef,
  ...rest
}: ListProps & { expandable: boolean; directionRef: (element: HTMLElement | null) => void }) {
  const { data, rest: ariaProps } = splitDataAttributes(rest);
  assertCollectionChildren(rest.children, 'List', 'ListItem elements');
  const scan = useCollectionScan(rest.children);
  if (scan.items.some((item) => item.control != null)) throw new Error(CONTROL_ERROR);
  if (expandable && scan.sectioned) throw new Error(EXPANDABLE_SECTIONS_ERROR);
  const selectable = rest.selectionMode != null && rest.selectionMode !== 'none';
  // A selection list is a list box (M3: "Container: List box · List item: Option"); a list
  // whose items also act or link keeps the grid list's separate actions.
  const kind: InteractiveKind = expandable
    ? 'tree'
    : selectable && rest.onAction == null && !scan.items.some((item) => item.href != null)
      ? 'listbox'
      : 'grid';
  const disabledKeys = new Set<Key>(rest.disabledKeys ?? []);
  for (const [key, item] of scan.entries) {
    if (disabled || item.disabled) disabledKeys.add(key);
  }
  const options = {
    ...(ariaProps as unknown as AriaGridListProps<object>),
    disabledKeys: disabledKeys.size > 0 ? disabledKeys : rest.disabledKeys,
    disallowEmptySelection: !deselectable,
    // Disabled items stay focusable (WAI-ARIA APG, "Focusability of disabled controls"); each row
    // keeps only its focus handlers, so it can't be pressed, chosen, expanded or followed.
    ...FOCUSABLE_DISABLED_OPTIONS,
    shouldFocusWrap: true,
  };
  const root: CollectionRootProps = {
    options,
    listRef: ref,
    directionRef,
    data: { ...data, ...tokenAttributes(variant, data) },
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
  // Arrow keys reveal a row at the nearest position, never centring the page on the list.
  useNearestReveal(rootRef);
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
      {groupNodes(state.collection).map((group) => {
        const rows = group.items.map((node, index) => (
          <GridListRow
            key={node.key}
            node={node}
            state={state}
            variant={variant}
            classNames={classNames}
            position={position(index, group.items.length)}
          />
        ));
        return group.section ? (
          <GridListSection
            key={group.section.key}
            node={group.section}
            state={state}
            variant={variant}
            classNames={classNames}
          >
            {rows}
          </GridListSection>
        ) : (
          rows
        );
      })}
    </div>
  );
}

/**
 * A section of a grid list: a row group named by its subheader, a header row holding a row
 * header (React Aria's `GridListSection` structure), then the items' rows.
 */
function GridListSection({
  node,
  state,
  variant,
  classNames,
  children,
}: {
  node: Node<object>;
  state: ListState<object>;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const section = node.props as ListSectionProps;
  const { rowProps, rowHeaderProps, rowGroupProps } = useGridListSection(
    { 'aria-label': section['aria-label'] },
    state,
    ref,
  );
  const styles = listStyles({ variant, titled: section.title != null });
  return (
    <div
      {...rowGroupProps}
      {...(section['aria-label'] != null && { 'aria-labelledby': undefined })}
      ref={ref}
      className={styles.section({ class: cn(classNames?.section, section.className) })}
    >
      {section.title != null && (
        <div {...rowProps}>
          <div {...rowHeaderProps} className={styles.subheader({ class: classNames?.subheader })}>
            {section.title}
          </div>
        </div>
      )}
      <div role="presentation" className={styles.group()}>
        {children}
      </div>
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
function useSelectionCheck(
  styles: ReturnType<typeof listStyles>,
  selectable: boolean,
  className: string | undefined,
): ReactNode {
  const { selectionIndicator = true } = useContext(ListOptionsContext);
  if (!selectable || !selectionIndicator) return null;
  return (
    <span
      aria-hidden="true"
      data-selection-indicator=""
      className={styles.selectionIndicator({ class: className })}
    >
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
  const {
    rowProps: ownRowProps,
    gridCellProps,
    descriptionProps,
    isPressed,
    isSelected,
  } = useGridListItem({ node }, state, ref);
  const isDisabled = state.disabledKeys.has(node.key);
  const rowProps = isDisabled ? focusOnly(ownRowProps) : ownRowProps;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const check = useSelectionCheck(
    styles,
    state.selectionManager.selectionMode !== 'none',
    classNames?.selectionIndicator,
  );
  return (
    <div
      {...mergeProps(rowProps, hoverProps, interactionProps)}
      {...dataAttributes}
      aria-disabled={isDisabled || undefined}
      ref={ref}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      {...itemAttributes(variant)}
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

/**
 * A disabled item's props: its role, ARIA, id, tab index and focus handlers, but no press, key
 * or pointer handlers, so it takes focus (APG) and does nothing else.
 */
function focusOnly<T extends object>(props: T): T {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([name]) => !/^on[A-Z]/.test(name) || name === 'onFocus' || name === 'onBlur',
    ),
  ) as T;
}

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
  useNearestReveal(rootRef);
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
      {groupNodes(state.collection).map((group) => {
        const rows = group.items.map((node, index) => (
          <OptionRow
            key={node.key}
            node={node}
            state={state}
            variant={variant}
            classNames={classNames}
            position={position(index, group.items.length)}
          />
        ));
        return group.section ? (
          <ListBoxSection
            key={group.section.key}
            node={group.section}
            variant={variant}
            classNames={classNames}
          >
            {rows}
          </ListBoxSection>
        ) : (
          rows
        );
      })}
    </div>
  );
}

/** A section of a list box: a subheader and a group of options named by it. */
function ListBoxSection({
  node,
  variant,
  classNames,
  children,
}: {
  node: Node<object>;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  children: ReactNode;
}) {
  const section = node.props as ListSectionProps;
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.title,
    'aria-label': section['aria-label'],
  });
  const styles = listStyles({ variant, titled: section.title != null });
  return (
    <div
      {...itemProps}
      className={styles.section({ class: cn(classNames?.section, section.className) })}
    >
      {section.title != null && (
        <div {...headingProps} className={styles.subheader({ class: classNames?.subheader })}>
          {section.title}
        </div>
      )}
      <div
        {...groupProps}
        {...(section['aria-label'] != null && { 'aria-labelledby': undefined })}
        className={styles.group()}
      >
        {children}
      </div>
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
  const {
    optionProps: ownOptionProps,
    isPressed,
    isSelected,
  } = useOption({ key: node.key }, state, ref);
  const isDisabled = state.disabledKeys.has(node.key);
  const optionProps = isDisabled
    ? { ...focusOnly(ownOptionProps), 'aria-disabled': true }
    : ownOptionProps;
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = itemStyles(item, variant, true, options);
  const check = useSelectionCheck(styles, true, classNames?.selectionIndicator);
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
      // Named by its content: the overline, headline, supporting and trailing text in the
      // order they show, each read once. Naming it by the headline alone (React Aria's
      // default) leaves visible text out of its name (WCAG 2.5.3), and describing it by the
      // supporting text as well would read that twice. Select's options are named the same way.
      aria-labelledby={undefined}
      aria-describedby={undefined}
      ref={ref}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      {...itemAttributes(variant)}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <span className={styles.cell()}>
        <ItemContent item={item} styles={styles} classNames={classNames} end={check} />
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
  const { shown, onExited, version } = useRowPresence(rows);
  // A press that opens an item while an open item above it folds keeps the pressed row
  // where it was: the page scrolls by the folded height as the rows close.
  const { capture, release } = useKeepPressedInPlace(
    '[role=row]',
    version,
    shown.some((row) => row.exiting),
  );
  const reveal = listStyles({ variant });
  return (
    <div
      {...mergeProps(data, gridProps, {
        onPointerDownCapture: capture,
        onKeyDownCapture: capture,
        onPointerUpCapture: release,
        onKeyUpCapture: release,
        onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
          // A virtual click (assistive tech) presses with no pointer down before it.
          if (event.detail === 0) capture(event);
          release();
        },
      })}
      ref={(element) => {
        rootRef.current = element;
        directionRef(element);
      }}
      style={style}
      className={className}
    >
      {shown.map((row) => (
        <TreeRowReveal
          key={row.node.key}
          row={row}
          onExited={onExited}
          className={reveal.reveal()}
          clipClassName={reveal.revealClip()}
        >
          {row.exiting ? (
            <TreeRowGhost
              node={row.node}
              selectable={state.selectionManager.selectionMode !== 'none'}
              variant={variant}
              classNames={classNames}
              position={row.position}
            />
          ) : (
            <TreeRow
              node={row.node}
              state={state}
              variant={variant}
              classNames={classNames}
              position={row.position}
            />
          )}
        </TreeRowReveal>
      ))}
    </div>
  );
}

/** Whether the reader asks for reduced motion (read on a change, never on the server). */
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

/** A tree row as shown: live, opening in, or gone from the tree and closing. */
interface ShownRow {
  node: Node<object>;
  position: string;
  /** Added after the tree first rendered (an item was expanded), so it opens in. */
  appear: boolean;
  /** No longer in the tree (its parent collapsed); shown until it has closed. */
  exiting: boolean;
}

/**
 * The rows to render: the tree's visible rows, plus rows that just left it (a collapsed
 * item's nested rows) in their old place until their closing transition ends. Rows added
 * after the first render are marked to open in.
 */
function useRowPresence(rows: Node<object>[]) {
  const live = (node: Node<object>, index: number, appear: boolean): ShownRow => ({
    node,
    position: position(index, rows.length),
    appear,
    exiting: false,
  });
  const keys = rows.map((node) => node.key);
  const [presence, setPresence] = useState(() => ({
    keys,
    shown: rows.map((node, index) => live(node, index, false)),
  }));
  let { shown } = presence;
  // Follow the tree while rendering (no effect, no extra paint) whenever its rows change.
  // A collection can be rebuilt with the same rows, so they're compared by key.
  if (keys.length !== presence.keys.length || keys.some((key, i) => key !== presence.keys[i])) {
    const indexOf = new Map(rows.map((node, index) => [node.key, index]));
    const before = new Map(shown.map((row) => [row.node.key, row]));
    const next: ShownRow[] = [];
    let cursor = 0;
    const takeUpTo = (end: number) => {
      for (; cursor <= end; cursor += 1) {
        const node = rows[cursor]!;
        const previous = before.get(node.key);
        next.push(live(node, cursor, previous ? previous.appear : true));
      }
    };
    for (const row of shown) {
      const index = indexOf.get(row.node.key);
      if (index === undefined) next.push({ ...row, exiting: true });
      else if (index >= cursor) takeUpTo(index);
    }
    takeUpTo(rows.length - 1);
    // A switch under reduced motion (2026-10-17): when rows open while others leave, the
    // leaving ones go at once instead of holding their height while they fade, and the
    // opening ones appear at full height and fade in, so the rows below shift once, never
    // twice. A lone fold still fades where it is.
    const opening = next.some((row) => !row.exiting && !before.has(row.node.key));
    shown =
      opening && next.some((row) => row.exiting) && prefersReducedMotion()
        ? next.filter((row) => !row.exiting)
        : next;
    setPresence({ keys, shown });
  }
  const onExited = useCallback(
    (key: Key) =>
      setPresence((current) => ({
        ...current,
        shown: current.shown.filter((row) => !(row.exiting && row.node.key === key)),
      })),
    [],
  );
  // Live rows render the tree's current nodes; leaving rows keep their last ones.
  const current = new Map(rows.map((node) => [node.key, node]));
  return {
    shown: shown.map((row) => (row.exiting ? row : { ...row, node: current.get(row.node.key)! })),
    onExited,
    /** Changes whenever the rows shown change. */
    version: presence,
  };
}

/**
 * A tree row's wrapper, which opens its height and fades it in when the row appears, and
 * closes it when the row leaves, then lets it go. Nothing in a leaving row can be focused
 * or read.
 */
function TreeRowReveal({
  row,
  onExited,
  className,
  clipClassName,
  children,
}: {
  row: ShownRow;
  onExited: (key: Key) => void;
  className: string;
  clipClassName: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { exiting, node } = row;
  useEffect(() => {
    if (!exiting) return;
    // Wait for the closing transitions, if any run (none without CSS or with no motion).
    const transitions = ref.current?.getAnimations?.() ?? [];
    if (transitions.length === 0) {
      onExited(node.key);
      return;
    }
    let current = true;
    void Promise.allSettled(transitions.map((transition) => transition.finished)).then(() => {
      if (current) onExited(node.key);
    });
    return () => {
      current = false;
    };
  }, [exiting, node.key, onExited]);
  return (
    <div
      ref={ref}
      data-appear={row.appear || undefined}
      data-exiting={exiting || undefined}
      inert={exiting || undefined}
      className={className}
    >
      <div className={clipClassName}>{children}</div>
    </div>
  );
}

/** A leaving row's picture while it closes: the row at rest, hidden from assistive tech. */
function TreeRowGhost({
  node,
  selectable,
  variant,
  classNames,
  position: itemPosition,
}: {
  node: Node<object>;
  selectable: boolean;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  position: string;
}) {
  const item = node.props as ListItemProps;
  const options = useContext(ListOptionsContext);
  const styles = listStyles({
    ...itemStylesOptions(item, variant, true, options),
    nested: node.level > 0,
  });
  const check = useSelectionCheck(styles, selectable, classNames?.selectionIndicator);
  const chevron = node.hasChildNodes && (
    <span className={styles.expand({ class: classNames?.expandButton })}>
      <ExpandMoreIcon />
    </span>
  );
  return (
    <div
      aria-hidden="true"
      style={{ '--m3-list-level': node.level } as CSSProperties}
      data-shape="rest"
      data-position={itemPosition}
      {...itemAttributes(variant)}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <div className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          end={
            check || chevron ? (
              <>
                {check}
                {chevron}
              </>
            ) : null
          }
        />
      </div>
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
      {/* 48px, but never taller than a one-line item (44px at density -3), so it stays in its row. */}
      <TouchTarget className="h-[min(48px,calc(56px+var(--md-sys-density,0)*4px))]" />
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
  const { rowProps, gridCellProps, descriptionProps, expandButtonProps, isPressed, isSelected } =
    useTreeItem({ node: siblingOrder.node, hasChildItems: node.hasChildNodes }, state, ref);
  siblingOrder.restore();
  const isDisabled = state.disabledKeys.has(node.key);
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { interactionProps, dataAttributes } = useM3Interaction({ isDisabled, isPressed }, ref);
  const isFocusVisible = dataAttributes['data-focus-visible'] != null;
  const shape = shapeOf({ isPressed, isSelected, isFocusVisible, isHovered, isDisabled });
  const options = useContext(ListOptionsContext);
  const styles = listStyles({
    ...itemStylesOptions(item, variant, true, options),
    nested: node.level > 0,
  });
  const check = useSelectionCheck(
    styles,
    state.selectionManager.selectionMode !== 'none',
    classNames?.selectionIndicator,
  );
  // Only a check or a chevron makes a trailing cell (and its 12px gap).
  const end =
    check != null || node.hasChildNodes ? (
      <>
        {check}
        {node.hasChildNodes && (
          <ExpandButton
            props={{ ...expandButtonProps, isDisabled }}
            className={styles.expand({ class: classNames?.expandButton })}
          />
        )}
      </>
    ) : null;
  return (
    <div
      {...mergeProps(isDisabled ? focusOnly(rowProps) : rowProps, hoverProps, interactionProps)}
      {...dataAttributes}
      aria-disabled={isDisabled || undefined}
      ref={ref}
      style={{ '--m3-list-level': node.level } as CSSProperties}
      data-selected={isSelected || undefined}
      data-shape={shape}
      data-position={itemPosition}
      {...itemAttributes(variant)}
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

/**
 * The items of an interactive list's collection, as React Stately's collection builder reads
 * them (each entry describes itself through `getCollectionNode`), top-level and in sections,
 * and whether it has sections. The list picks its kind and its disabled keys from these.
 */
function useCollectionScan(children: ReactNode) {
  const { collection } = useListState<object>({
    children: children as AriaGridListProps<object>['children'],
  });
  return useMemo(() => {
    const entries: [Key, ListItemProps][] = [];
    let sectioned = false;
    for (const node of collection) {
      if (node.type === 'section') {
        sectioned = true;
        for (const child of collection.getChildren!(node.key)) {
          if (child.type === 'item') entries.push([child.key, child.props as ListItemProps]);
        }
      } else if (node.type === 'item') {
        entries.push([node.key, node.props as ListItemProps]);
      }
    }
    return { entries, items: entries.map(([, item]) => item), sectioned };
  }, [collection]);
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
      placement={item.controlPlacement ?? (control === 'switch' ? 'end' : 'start')}
    />
  );
}

function RadioList({
  variant,
  classNames,
  className,
  style,
  ref,
  value,
  defaultValue,
  onValueChange,
  name,
  required,
  disabled,
  controlPlacement = 'start',
  entries,
  ...rest
}: ListProps & { entries: ReactElement[] }) {
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
      {...tokenAttributes(variant, data)}
      ref={ref as Ref<HTMLDivElement>}
      style={style}
      className={listStyles({ variant }).root({ class: cn(classNames?.root, className) })}
    >
      <RadioListContext value={{ state, variant, classNames, controlPlacement }}>
        {entries.map((entry, index) => (
          <ListEntryContext
            key={entry.key ?? index}
            value={{
              index,
              position: position(index, entries.length),
              inSection: false,
              disabled: false,
            }}
          >
            {entry}
          </ListEntryContext>
        ))}
      </RadioListContext>
    </div>
  );
}

/** What a radio list hands its items. */
interface RadioListValue {
  state: RadioGroupState;
  variant?: ListVariant | undefined;
  classNames?: ListClassNames | undefined;
  controlPlacement: ControlPlacement;
}

const RadioListContext = createContext<RadioListValue | null>(null);

/** An item of a radio list: a radio button with the item's `value`. */
function RadioListItem({
  item,
  radio,
  position: itemPosition,
}: {
  item: ListItemProps;
  radio: RadioListValue;
  position: string;
}) {
  if (item.value == null || item.control != null || item.href != null) {
    throw new Error(RADIO_ITEM_ERROR);
  }
  return (
    <RadioItem
      item={item}
      state={radio.state}
      variant={radio.variant}
      classNames={radio.classNames}
      position={itemPosition}
      placement={item.controlPlacement ?? radio.controlPlacement}
    />
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
  const hiddenInputRef = useMemo(() => mergeRefs(inputRef, preventHiddenInputScroll), [inputRef]);
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
    'data-checked': isSelected || undefined,
    'data-disabled': isDisabled || undefined,
  };
  return (
    <label
      {...mergeProps(labelProps, interactionProps)}
      {...dataAttributes}
      ref={ref}
      data-shape={shape}
      data-position={itemPosition}
      {...itemAttributes(variant)}
      className={styles.item({ class: cn(classNames?.item, item.className) })}
    >
      <VisuallyHidden elementType="span">
        <input {...inputProps} ref={hiddenInputRef} />
      </VisuallyHidden>
      <span className={styles.cell()}>
        <ItemContent
          item={item}
          styles={styles}
          classNames={classNames}
          ids={ids}
          controlPlacement={placement}
          textHidden
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
      // The switch's component tokens, resolved on its track as on a Switch.
      data-tokens="md-comp-switch"
      data-slot="track"
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
      data-list-entry=""
      data-shape={shape}
      data-position={itemPosition}
      {...itemAttributes(variant)}
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
              data-list-link=""
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
