'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type RefObject,
} from 'react';
import { useAutocomplete, useFocusRing, useSearchField } from 'react-aria';
import { useListState, type Node } from 'react-stately';
import type { ListProps } from 'react-stately/useListState';
import { cn } from '../../utils/cn';
import { menuStyles } from '../menu/menu-styles';
import { searchBarStyles } from '../search/search-styles';
import { OptionList, type OptionListClassNames } from './option-list';

/** Material Symbols `search`. */
const SearchIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
  </svg>
);

/**
 * Keeps the items that match, and the sections that still hold one (as React Stately's
 * combobox filters), so a section with no matches disappears with its heading.
 */
function filterNodes<T>(nodes: Iterable<Node<T>>, matches: (node: Node<T>) => boolean): Node<T>[] {
  const kept: Node<T>[] = [];
  for (const node of nodes) {
    if (node.type === 'section') {
      const children = filterNodes(node.childNodes, matches);
      if (children.some((child) => child.type === 'item')) {
        kept.push({ ...node, childNodes: children });
      }
    } else if (node.type !== 'item' || matches(node)) {
      kept.push(node);
    }
  }
  return kept;
}

export interface SearchListProps<T> {
  /** The options, their selection and disabled keys, as for `useListState`. */
  listProps: ListProps<T>;
  /** The typed text. */
  search: string;
  onSearchChange: (search: string) => void;
  /** Whether an option matches the search; `null` when the app filters the options itself. */
  filter: ((textValue: string, search: string, key: Node<T>['key']) => boolean) | null;
  /** Focus the search when the list opens (in a menu; a sheet shows the list first). */
  autoFocusSearch: boolean;
  /** Names the list (the field's label): `aria-labelledby`, or `aria-label` without one. */
  labelling: { 'aria-label'?: string | undefined; 'aria-labelledby'?: string | undefined };
  /** In a menu, the panel is the dialog the field opens (`role`, `id`, its name). */
  dialogProps?: HTMLAttributes<HTMLDivElement> | undefined;
  labels: { search: string; noResults: string; loading: string };
  loading: boolean;
  isBlocked: ((key: Node<T>['key']) => boolean) | undefined;
  /** In a sheet: no menu panel of its own. */
  embedded: boolean;
  classNames?: (OptionListClassNames & { search?: string }) | undefined;
}

/**
 * A search field over an option list, wired as one editable combobox with list autocomplete
 * (React Aria `useAutocomplete`): typing filters the options, the arrow keys move through
 * them while focus stays in the search (`aria-activedescendant`), Enter chooses, and Escape
 * clears the search, then reaches the menu or sheet to close it. The search is the M3 search
 * bar's field at 48px, M3's minimum touch target, so it doesn't dominate the 44px rows.
 * Used by `Select`'s `searchable` and `PhoneField`'s country field.
 */
export function SearchList<T>({
  listProps,
  search,
  onSearchChange,
  filter,
  autoFocusSearch,
  labelling,
  dialogProps,
  labels,
  loading,
  isBlocked,
  embedded,
  classNames,
}: SearchListProps<T>) {
  const matches = useCallback(
    (nodes: Iterable<Node<T>>) =>
      filter ? filterNodes(nodes, (node) => filter(node.textValue, search, node.key)) : [...nodes],
    [filter, search],
  );
  const state = useListState<T>({ ...listProps, filter: matches });

  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const {
    inputProps: autocompleteInputProps,
    collectionProps,
    collectionRef,
  } = useAutocomplete(
    { inputRef, collectionRef: listBoxRef },
    { inputValue: search, setInputValue: onSearchChange, focusedNodeId, setFocusedNodeId },
  );
  const { inputProps } = useSearchField(
    { ...autocompleteInputProps, 'aria-label': labels.search, placeholder: labels.search },
    { value: search, setValue: onSearchChange },
    inputRef,
  );
  const { focusProps, isFocusVisible } = useFocusRing({ within: true, isTextInput: true });

  useEffect(() => {
    if (autoFocusSearch) inputRef.current?.focus();
  }, [autoFocusSearch]);

  const field = searchBarStyles({ hasLeading: true });
  const menu = menuStyles({ variant: 'standard', groupPosition: 'only' });

  return (
    <div
      {...dialogProps}
      className={cn(
        'flex min-h-0 flex-col',
        embedded ? 'flex-1' : [menu.group(), 'max-h-[inherit] overflow-hidden'],
      )}
    >
      {/* 48px, 4px above the list, like the panel's 4px padding around it. */}
      <div className="flex h-[52px] shrink-0 pb-[4px]">
        <div
          {...focusProps}
          data-focus-visible={isFocusVisible || undefined}
          className={field.field({ class: classNames?.search })}
        >
          <span className={field.leading()}>
            <SearchIcon />
          </span>
          <input {...inputProps} ref={inputRef} className={field.input()} />
        </div>
      </div>
      <OptionList
        embedded
        listBoxProps={{
          ...collectionProps,
          ...labelling,
          // Escape belongs to the search and then the menu; the list must not take it to
          // clear the selection (which also kept a chosen option's menu from closing).
          escapeKeyBehavior: 'none',
        }}
        state={state}
        listBoxRef={collectionRef as RefObject<HTMLUListElement | null>}
        emptyLabel={labels.noResults}
        loading={loading}
        loadingLabel={labels.loading}
        isBlocked={isBlocked}
        classNames={classNames}
      />
    </div>
  );
}
