'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  DismissButton,
  mergeProps,
  useHover,
  useListBox,
  useListBoxSection,
  useOption,
  usePopover,
  type AriaListBoxOptions,
} from 'react-aria';
import {
  Item,
  Section,
  type Key,
  type ListState,
  type Node,
  type OverlayTriggerState,
} from 'react-stately';
import { Overlay } from '../../primitives/Overlay';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { LoadingIndicator } from '../loading-indicator/LoadingIndicator';
import { menuStyles } from '../menu/menu-styles';

/** Props of an option in a `Select` or `Autocomplete`; the React `key` identifies it. */
export interface OptionItemProps {
  /** The label. */
  children: ReactNode;
  /** Plain-text label for typeahead, filtering and the field, when `children` isn't a string. */
  textValue?: string;
  /** Icon (or avatar, flag…) before the label. */
  leadingIcon?: ReactNode;
  /** Second line of text. */
  description?: ReactNode;
  /** Short text at the end, e.g. a dialling code or a count. */
  trailing?: ReactNode;
  'aria-label'?: string;
}

/** A group of options with an optional heading. */
export interface OptionSectionProps {
  /** Heading shown above the options. */
  title?: ReactNode;
  'aria-label'?: string;
  children: ReactElement<OptionItemProps> | ReactElement<OptionItemProps>[];
}

/** An option in a `Select` (a React Stately collection item: identify it with `key`). */
export const SelectItem = Item as unknown as (props: OptionItemProps) => JSX.Element;
/** A group of options in a `Select`, under an optional heading. */
export const SelectSection = Section as unknown as (props: OptionSectionProps) => JSX.Element;
/** An option in an `Autocomplete` (a React Stately collection item: identify it with `key`). */
export const AutocompleteItem = Item as unknown as (props: OptionItemProps) => JSX.Element;
/** A group of options in an `Autocomplete`, under an optional heading. */
export const AutocompleteSection = Section as unknown as (props: OptionSectionProps) => JSX.Element;

export interface OptionListClassNames {
  /** The list's surface. */
  list?: string;
  item?: string;
}

/** Material Symbols `check`, shown on chosen options (as M3 menus show selection). */
const CheckIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" />
  </svg>
);

/**
 * The options of a `Select` or `Autocomplete`, drawn exactly as the library's M3 menu: its
 * surface, 44px items, `tertiary-container` for chosen options with a check, sections with
 * headings and dividers, state layers and the inset focus ring.
 */
export function OptionList<T>({
  listBoxProps,
  state,
  listBoxRef,
  emptyLabel,
  loading = false,
  loadingLabel,
  isBlocked,
  embedded = false,
  classNames,
}: {
  listBoxProps: AriaListBoxOptions<T>;
  state: ListState<T>;
  listBoxRef: RefObject<HTMLUListElement | null>;
  /** Shown when there are no options (e.g. nothing matches the search). */
  emptyLabel: ReactNode;
  loading?: boolean;
  /** The loading indicator's name; needed with `loading`. */
  loadingLabel?: string;
  /** Options that can't be chosen right now (`maxSelections` reached). */
  isBlocked?: ((key: Key) => boolean) | undefined;
  /** Inside a surface of its own (a sheet, or the search list's panel): no menu panel. */
  embedded?: boolean;
  classNames?: OptionListClassNames | undefined;
}) {
  const { listBoxProps: props } = useListBox(listBoxProps, state, listBoxRef);
  const menu = menuStyles({ variant: 'standard', groupPosition: 'only' });
  const nodes = [...state.collection];
  // Options, not sections: a section left with no matches doesn't count.
  const isEmpty = ![...state.collection.getKeys()].some(
    (key) => state.collection.getItem(key)?.type === 'item',
  );
  // As in Menu, an item touching the panel's 16px corner takes 12px (16 − the 4px padding):
  // the first item, unless a heading sits above it, and the last, unless a loading or empty
  // row sits below it.
  const itemKeys = [...state.collection.getKeys()].filter(
    (key) => state.collection.getItem(key)?.type === 'item',
  );
  const first = nodes[0];
  const topKey = first?.type === 'section' && first.rendered ? null : itemKeys[0];
  const bottomKey = loading ? null : itemKeys.at(-1);
  const itemOptions = { state, isBlocked, topKey, bottomKey, classNames };

  return (
    <div
      className={cn(
        !embedded && menu.group(),
        'flex max-h-[inherit] min-h-0 flex-col overflow-hidden',
        classNames?.list,
      )}
    >
      <ul {...props} ref={listBoxRef} className="min-h-0 flex-1 overflow-y-auto outline-none">
        {nodes.map((node, index) =>
          node.type === 'section' ? (
            <OptionSection key={node.key} section={node} divided={index > 0} {...itemOptions} />
          ) : (
            <OptionItem key={node.key} item={node} {...itemOptions} />
          ),
        )}
      </ul>
      {loading && loadingLabel ? (
        <div className="flex min-h-[44px] items-center justify-center">
          <LoadingIndicator aria-label={loadingLabel} className="size-[36px]" />
        </div>
      ) : isEmpty ? (
        <p role="status" className="px-[12px] py-[12px] text-label-large text-on-surface-variant">
          {emptyLabel}
        </p>
      ) : null}
    </div>
  );
}

interface ItemOptions<T> {
  state: ListState<T>;
  isBlocked: ((key: Key) => boolean) | undefined;
  /** The item at the panel's top edge, if any. */
  topKey: Key | null | undefined;
  /** The item at the panel's bottom edge, if any. */
  bottomKey: Key | null | undefined;
  classNames: OptionListClassNames | undefined;
}

function OptionSection<T>({
  section,
  divided,
  ...itemOptions
}: ItemOptions<T> & { section: Node<T>; divided: boolean }) {
  const { state } = itemOptions;
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  });
  const menu = menuStyles({ variant: 'standard' });
  return (
    <li {...itemProps}>
      {divided ? (
        <div role="presentation" className="mx-[8px] my-[4px] h-px bg-outline-variant" />
      ) : null}
      {section.rendered ? (
        <span {...headingProps} className={menu.heading()}>
          {section.rendered}
        </span>
      ) : null}
      <ul {...groupProps}>
        {[...state.collection.getChildren!(section.key)].map((item) => (
          <OptionItem key={item.key} item={item} {...itemOptions} />
        ))}
      </ul>
    </li>
  );
}

function OptionItem<T>({
  item,
  state,
  isBlocked,
  topKey,
  bottomKey,
  classNames,
}: ItemOptions<T> & { item: Node<T> }) {
  const ref = useRef<HTMLLIElement>(null);
  const { optionProps, isSelected, isDisabled, isFocusVisible } = useOption(
    {
      key: item.key,
      // A blocked option is disabled; otherwise the collection's `disabledKeys` decide.
      ...(isBlocked?.(item.key) && { isDisabled: true }),
    },
    state,
    ref,
  );
  const { hoverProps, isHovered } = useHover({ isDisabled });
  const { leadingIcon, description, trailing } = item.props as OptionItemProps;
  const menu = menuStyles({
    variant: 'standard',
    hasDescription: Boolean(description),
    itemTop: item.key === topKey ? 'nested' : 'plain',
    itemBottom: item.key === bottomKey ? 'nested' : 'plain',
  });

  return (
    <li
      {...mergeProps(optionProps, hoverProps)}
      ref={ref}
      className={menu.item({ class: classNames?.item })}
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-hovered={(isHovered && !isDisabled) || undefined}
      data-focus-visible={isFocusVisible || undefined}
    >
      {leadingIcon ? (
        <span aria-hidden="true" className={menu.icon()}>
          {isSelected ? <CheckIcon /> : leadingIcon}
        </span>
      ) : (
        <span aria-hidden="true" className={menu.selectedIcon()}>
          <span className={menu.selectedIconInner()}>
            <span className={menu.icon()}>
              <CheckIcon />
            </span>
          </span>
        </span>
      )}
      <span className={menu.text()}>
        <span className="truncate">{item.rendered}</span>
        {description ? <span className={menu.description()}>{description}</span> : null}
      </span>
      {trailing ? (
        <span aria-hidden="true" className={menu.trailing({ class: 'tabular-nums' })}>
          {trailing}
        </span>
      ) : null}
    </li>
  );
}

/**
 * The list's popover: anchored to the field, at least as wide as it (Compose's
 * `exposedDropdownSize`), above it when there's no room below, with the menu's open and
 * close motion. `isNonModal` keeps an `Autocomplete`'s input usable while it's open.
 */
export function OptionPopover({
  state,
  triggerRef,
  popoverRef,
  isNonModal = false,
  onPressOutside,
  minWidth = 0,
  children,
}: {
  state: OverlayTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  isNonModal?: boolean;
  /** The least width, when the field is narrower (a searchable menu needs room to type). */
  minWidth?: number;
  /** A press outside the menu and the field closes it (modal menus only). */
  onPressOutside?: (() => void) | undefined;
  children: ReactNode;
}) {
  const { isPresent, isExiting, exitProps } = usePresence(state.isOpen);
  if (!isPresent) return null;
  return (
    <Overlay isExiting={isExiting} disableFocusManagement={isNonModal}>
      <PopoverBody
        state={state}
        triggerRef={triggerRef}
        popoverRef={popoverRef}
        isNonModal={isNonModal}
        isExiting={isExiting}
        exitProps={exitProps}
        onPressOutside={onPressOutside}
        minWidth={minWidth}
      >
        {children}
      </PopoverBody>
    </Overlay>
  );
}

function PopoverBody({
  state,
  triggerRef,
  popoverRef,
  isNonModal,
  isExiting,
  exitProps,
  onPressOutside,
  minWidth,
  children,
}: {
  state: OverlayTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  popoverRef: RefObject<HTMLDivElement | null>;
  isNonModal: boolean;
  minWidth: number;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  onPressOutside: (() => void) | undefined;
  children: ReactNode;
}) {
  const { popoverProps, underlayProps, placement } = usePopover(
    { triggerRef, popoverRef, placement: 'bottom start', offset: 4, isNonModal },
    state,
  );
  // As wide as the field (Compose's `exposedDropdownSize`), measured when it opens.
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    setWidth(triggerRef.current?.getBoundingClientRect().width);
  }, [triggerRef]);
  // React Aria makes the page around a modal popover inert, so a press outside lands on
  // `<body>` whatever is under it; its position tells a press on the field from one away.
  // Listened to in the capture phase: the popover stops the press once it has closed.
  useEffect(() => {
    if (isNonModal || !onPressOutside) return;
    const onPointerDown = (event: PointerEvent) => {
      if (popoverRef.current?.contains(event.target as globalThis.Node)) return;
      const field = triggerRef.current?.getBoundingClientRect();
      const onField =
        field !== undefined &&
        event.clientX >= field.left &&
        event.clientX <= field.right &&
        event.clientY >= field.top &&
        event.clientY <= field.bottom;
      if (!onField) onPressOutside();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [isNonModal, onPressOutside, popoverRef, triggerRef]);
  const menu = menuStyles();

  return (
    <>
      {isNonModal ? null : <div {...underlayProps} className="fixed inset-0" />}
      <div
        {...popoverProps}
        ref={popoverRef}
        style={{ ...popoverProps.style, minWidth: Math.max(width ?? 0, minWidth) }}
        className={cn(menu.popover(), 'flex max-w-[min(560px,calc(100vw-32px))] flex-col')}
      >
        {isNonModal ? null : <DismissButton onDismiss={state.close} />}
        <div
          {...exitProps}
          data-exiting={isExiting || undefined}
          data-placement={placement ?? undefined}
          className={cn(menu.motion(), 'flex max-h-[inherit] min-h-0 flex-col')}
        >
          {children}
        </div>
        <DismissButton onDismiss={state.close} />
      </div>
    </>
  );
}
