'use client';

import {
  useId,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {
  HiddenSelect,
  mergeProps,
  useButton,
  useFocusRing,
  useHover,
  useObjectRef,
  useSelect,
  type AriaSelectOptions,
} from 'react-aria';
import {
  useSelectState,
  type SelectionMode,
  type SelectProps as StatelySelectProps,
} from 'react-stately/useSelectState';
import { useControlledState } from 'react-stately/useControlledState';
import type { Key } from 'react-stately';
import { matchesSearch } from '../../utils/search';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { useTypeaheadDelegate } from '../../utils/typeahead';
import { usePreloadLoadingIndicator } from '../loading-indicator/lazy-loading-indicator';
import { LazyBottomSheet, usePreloadBottomSheet } from '../sheet/lazy-bottom-sheet';
import type { TextFieldVariant } from '../text-field/text-field-styles';
import { DropdownArrow, FieldShell, fieldState, type FieldShellClassNames } from './field-shell';
import {
  FOCUSABLE_DISABLED_OPTIONS,
  OptionList,
  OptionPopover,
  type OptionListClassNames,
} from './option-list';
import { SearchList } from './search-list';
import { useSelectionCap } from './selection-cap';

/** How the options open: a menu under the field (M3), a bottom sheet, or a sheet on phones. */
export type SelectPresentation = 'menu' | 'sheet' | 'auto';

/** Words the Select shows or announces; override them for other languages. */
export interface SelectLabels {
  /** Shown in an empty list. @default "No options" */
  empty: string;
  /** The loading indicator's name. @default "Loading options" */
  loading: string;
  /** For more chosen options than fit: `+{count}`. @default (count) => `+${count}` */
  more: (count: number) => string;
  /** With `searchable`: the search field's placeholder and name. @default "Search" */
  search: string;
  /** With `searchable`: shown when no option matches the search. @default "No results" */
  noResults: string;
  /** The error icon's name (M3: "Error"). @default "Error" */
  error: string;
}

const DEFAULT_LABELS: SelectLabels = {
  empty: 'No options',
  loading: 'Loading options',
  more: (count) => `+${count}`,
  search: 'Search',
  noResults: 'No results',
  error: 'Error',
};

/** A chosen option, as `renderValue` receives it. */
export interface SelectedOption<T> {
  key: Key;
  /** Its plain text (`textValue`, or the item's text). */
  textValue: string;
  /** Its object from `items`, if the options come from `items`. */
  value: T | null;
}

export interface SelectClassNames extends FieldShellClassNames, OptionListClassNames {
  /** The text showing the chosen option(s) or the placeholder. */
  value?: string;
  /** With `searchable`: the search field. */
  search?: string;
}

/** React Aria props this API names the library's way (`disabled`, `open`…), or leaves out. */
type RenamedProps =
  | 'isDisabled'
  | 'isRequired'
  | 'isInvalid'
  | 'isOpen'
  | 'label'
  | 'description'
  | 'validationState';

export type SelectProps<T extends object, M extends SelectionMode = 'single'> = Omit<
  StatelySelectProps<T, M>,
  RenamedProps
> &
  Pick<AriaSelectOptions<T, M>, 'name' | 'autoComplete' | 'form'> & {
    /** The container style, as `TextField`'s: a filled surface or an outline. @default "filled" */
    variant?: TextFieldVariant;
    /** The field's label. Give `aria-label` instead when there's no visible label. */
    label?: ReactNode;
    /** Accessible name when there's no visible label. */
    'aria-label'?: string;
    /**
     * Shown in the field when nothing is chosen. With a `label`, it appears once the label
     * floats (on focus), as in `TextField`.
     */
    placeholder?: string;
    /**
     * Helper text below the field. Replaced visually by the error when invalid, and shown in
     * the error colour while the field is invalid.
     */
    supportingText?: ReactNode;
    /** Marks the field invalid (in addition to `validate` and `required`). */
    invalid?: boolean;
    /** A choice is required: adds the `*` to the label and validates on submit. */
    required?: boolean;
    /** Disables the field: it can't be focused or opened. @default false */
    disabled?: boolean;
    /**
     * The choice can be seen but not changed: the menu doesn't open and the keyboard doesn't
     * change it. The root gets `data-readonly`; say so in the supporting text (M3).
     * @default false
     */
    readOnly?: boolean;
    /** Decorative icon at the start, in a 48px box. */
    leadingIcon?: ReactNode;
    /**
     * The icon shown before the arrow while the field is invalid (M3 strongly recommends one).
     * Defaults to Material Symbols `error`, named by `labels.error`; `false` turns it off.
     * @default the Material Symbols `error` icon
     */
    errorIcon?: ReactNode | false;
    /** Whether the menu is open (controlled); with `defaultOpen` and `onOpenChange`. */
    open?: boolean;
    /**
     * With `selectionMode="multiple"`, the most options that can be chosen; the rest show as
     * disabled until one is removed.
     */
    maxSelections?: number;
    /**
     * `menu` (default) opens an M3 menu under the field on every window, as Compose's exposed
     * dropdown menu does; `sheet` always opens a bottom sheet; `auto` opens a sheet on
     * compact windows and a menu on larger ones, for long lists.
     * @default "menu"
     */
    presentation?: SelectPresentation;
    /**
     * A search field at the top of the menu or sheet that filters the options as you type,
     * for long lists (pair it with `presentation="auto"`). The search takes focus in the menu;
     * a sheet shows the list first, so the keyboard doesn't cover it.
     * @default false
     */
    searchable?: boolean;
    /**
     * With `searchable`: whether an option matches the search. Defaults to a match anywhere in
     * its text, ignoring case and accents ("thai" finds "Thailand"). The option's `key` lets
     * it match on more than its text, e.g. a country's ISO code.
     */
    filter?: (textValue: string, search: string, key: Key) => boolean;
    /** With `searchable`: the typed text (controlled); cleared when the list closes. */
    searchValue?: string;
    /** With `searchable`: the initial typed text, when uncontrolled. @default "" */
    defaultSearchValue?: string;
    /**
     * With `searchable`: called as the search changes. Given it, the app filters `items` itself
     * (e.g. on a server, with `loading` meanwhile) and the built-in filter is off.
     */
    onSearchChange?: (search: string) => void;
    /**
     * What the field shows for the chosen option(s), e.g. a dialling code or a flag, instead of
     * their text. Screen readers still hear the options' text.
     */
    renderValue?: (selected: SelectedOption<T>[]) => ReactNode;
    /**
     * Shows a loading indicator in the list, e.g. while options are fetched.
     * The indicator's code loads when it first shows, and ahead of that when the field is
     * hovered or focused while this prop is set at all, so pass `loading={false}` (rather than
     * leaving it out) on a field that loads options.
     */
    loading?: boolean;
    /** Words the Select shows or announces, for other languages. */
    labels?: Partial<SelectLabels>;
    /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
    className?: string;
    /** Classes for each part, by slot. */
    classNames?: SelectClassNames;
    /** Inline styles for the root element. */
    style?: CSSProperties;
    /** Ref to the root `<div>` element. Use `triggerRef` for the field's button. */
    ref?: Ref<HTMLDivElement>;
    /** Ref to the field's button. */
    triggerRef?: Ref<HTMLButtonElement>;
  };

const COMPACT_WINDOW = '(max-width: 599.98px)';

/** A read-only Select's keyboard finds no option, so arrows and typeahead change nothing. */
const READ_ONLY_DELEGATE: NonNullable<AriaSelectOptions<object>['keyboardDelegate']> = {
  getFirstKey: () => null,
  getLastKey: () => null,
  getKeyBelow: () => null,
  getKeyAbove: () => null,
  getKeyForSearch: () => null,
};

function subscribeToWindow(onChange: () => void) {
  const query = window.matchMedia(COMPACT_WINDOW);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * M3 exposed dropdown menu, read-only (Compose's `ExposedDropdownMenuBox` with a
 * `PrimaryNotEditable` anchor): a text-field-styled button that opens a menu of options.
 * Single or multiple selection, sections, descriptions and icons, typeahead, a hidden
 * native `<select>` for forms, and validation as in `TextField` (React Aria `useSelect`).
 *
 * @example
 * <Select label="Sort by" defaultValue="newest">
 *   <SelectItem key="newest">Newest first</SelectItem>
 *   <SelectItem key="price">Price, low to high</SelectItem>
 * </Select>
 */
export function Select<T extends object, M extends SelectionMode = 'single'>(
  props: SelectProps<T, M>,
) {
  const {
    variant = 'filled',
    label,
    placeholder,
    supportingText,
    invalid,
    required,
    disabled = false,
    readOnly = false,
    leadingIcon,
    errorIcon,
    open,
    maxSelections,
    presentation = 'menu',
    searchable = false,
    filter = matchesSearch,
    searchValue,
    defaultSearchValue,
    onSearchChange,
    renderValue,
    loading,
    labels: labelsProp,
    className,
    classNames,
    style,
    ref,
    triggerRef: triggerRefProp,
    name,
    autoComplete,
    form,
    errorMessage,
    ...otherProps
  } = props;
  // Items given as elements (not `items` with a render function) must come from a client.
  if (typeof props.children !== 'function') {
    assertCollectionChildren(props.children, 'Select', 'SelectItem and SelectSection elements');
  }
  const { data: rootData, rest } = splitDataAttributes(otherProps);
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const stately = rest as Omit<StatelySelectProps<T, M>, RenamedProps>;
  const cap = useSelectionCap({
    multiple: stately.selectionMode === 'multiple',
    maxSelections,
    value: stately.value,
    defaultValue: stately.defaultValue,
    onChange: stately.onChange,
  });
  const [search, setSearch] = useControlledState(
    searchValue,
    defaultSearchValue ?? '',
    onSearchChange,
  );
  const ariaProps = {
    ...stately,
    ...cap.valueProps,
    // The search starts afresh each time the list opens.
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen && search !== '') setSearch('');
      stately.onOpenChange?.(isOpen);
    },
    label,
    description: supportingText,
    errorMessage,
    isInvalid: invalid,
    isRequired: required,
    isDisabled: disabled,
    ...FOCUSABLE_DISABLED_OPTIONS,
    ...(readOnly
      ? { isOpen: false, keyboardDelegate: READ_ONLY_DELEGATE }
      : open !== undefined && { isOpen: open }),
    placeholder,
    name,
    autoComplete,
    form,
  } as AriaSelectOptions<T, M>;

  const state = useSelectState<T, M>(ariaProps);
  const triggerRef = useObjectRef(triggerRefProp);
  // Typeahead on the closed field moves to the next option starting with the letter (M3),
  // and still skips disabled options.
  const typeaheadDelegate = useTypeaheadDelegate(state, triggerRef, {
    disabledBehavior: 'all',
    currentKey: state.selectionManager.selectionMode === 'single' ? state.selectedKey : null,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  // Set by a press outside the menu and the field: the focus the menu hands back to the
  // field on closing (WAI-ARIA, right after Escape or a choice) is let go, so one press
  // outside leaves the field, as it does any other field.
  const releaseFocusRef = useRef(false);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const {
    labelProps,
    triggerProps,
    valueProps,
    menuProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  } = useSelect<T, M>(
    readOnly ? ariaProps : { ...ariaProps, keyboardDelegate: typeaheadDelegate },
    state,
    triggerRef,
  );
  const isCompact = useSyncExternalStore(
    subscribeToWindow,
    () => window.matchMedia(COMPACT_WINDOW).matches,
    () => false,
  );
  const asSheet = presentation === 'sheet' || (presentation === 'auto' && isCompact);
  // The sheet's code loads on first open, or ahead of it when the field is hovered or focused.
  usePreloadBottomSheet(containerRef, asSheet);
  // A field that takes `loading` (it loads options) preloads the indicator on hover or focus.
  usePreloadLoadingIndicator(containerRef, loading !== undefined);
  // `useSelect`'s trigger props are React Aria button props; `useButton` makes them DOM props.
  const { buttonProps } = useButton(
    // A searchable field opens a dialog holding the search and the list (as PhoneField's).
    searchable
      ? {
          ...triggerProps,
          'aria-haspopup': 'dialog',
          'aria-controls': state.isOpen && !asSheet ? dialogId : undefined,
        }
      : triggerProps,
    triggerRef,
  );
  const { focusProps, isFocusVisible, isFocused } = useFocusRing();
  const fieldButtonProps = mergeProps(buttonProps, focusProps);
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  // In the list's order, not the order they were picked, so the field reads like the list.
  const chosenOptions: SelectedOption<T>[] = [...state.collection.getKeys()]
    .filter((key) => state.selectionManager.isSelected(key))
    .map((key) => {
      const item = state.collection.getItem(key);
      return { key, textValue: item?.textValue ?? '', value: item?.value ?? null };
    });
  const chosen = chosenOptions.map((option) => option.textValue);
  const valueText =
    chosen.length > 2
      ? `${chosen.slice(0, 2).join(', ')} ${labels.more(chosen.length - 2)}`
      : chosen.join(', ');
  const hasValue = chosen.length > 0;
  const hasLabel = label !== undefined && label !== null;
  const focused = isFocused || state.isOpen;
  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors, validationDetails })
      : (errorMessage ?? validationErrors.join(' '));

  const searchLabelling = hasLabel
    ? { 'aria-labelledby': labelProps.id }
    : { 'aria-label': (rest as { 'aria-label'?: string })['aria-label'] };
  const list = searchable ? (
    <SearchList
      listProps={{
        ...(stately.items !== undefined && { items: stately.items }),
        children: stately.children,
        ...(stately.disabledKeys !== undefined && { disabledKeys: stately.disabledKeys }),
        selectionMode: stately.selectionMode ?? 'single',
        // A single choice stays chosen when pressed again, as in a non-searchable Select.
        disallowEmptySelection: stately.selectionMode !== 'multiple',
        selectedKeys: state.selectionManager.selectedKeys,
        onSelectionChange: (keys) => {
          state.selectionManager.setSelectedKeys(keys === 'all' ? [] : keys);
          if (stately.selectionMode !== 'multiple') state.close();
        },
      }}
      search={search}
      onSearchChange={setSearch}
      filter={onSearchChange ? null : filter}
      autoFocusSearch={!asSheet}
      labelling={searchLabelling}
      dialogProps={asSheet ? undefined : { id: dialogId, role: 'dialog', ...searchLabelling }}
      labels={{ search: labels.search, noResults: labels.noResults, loading: labels.loading }}
      loading={loading ?? false}
      isBlocked={cap.isBlocked}
      embedded={asSheet}
      classNames={classNames}
    />
  ) : (
    <OptionList
      embedded={asSheet}
      listBoxProps={menuProps}
      state={state}
      listBoxRef={listBoxRef}
      emptyLabel={labels.empty}
      loading={loading}
      loadingLabel={labels.loading}
      isBlocked={cap.isBlocked}
      classNames={classNames}
    />
  );

  return (
    <>
      <FieldShell
        variant={variant}
        label={label}
        labelProps={labelProps}
        required={required}
        state={fieldState({ disabled, invalid: isInvalid, focused, hovered: isHovered })}
        floated={hasValue || focused}
        open={state.isOpen}
        leadingIcon={leadingIcon}
        trailing={<DropdownArrow open={state.isOpen} />}
        errorIcon={errorIcon}
        errorIconLabel={labels.error}
        readOnly={readOnly}
        supportingText={supportingText}
        descriptionProps={descriptionProps}
        errorText={resolvedError}
        errorMessageProps={errorMessageProps}
        showError={isInvalid && Boolean(resolvedError)}
        containerRef={containerRef}
        containerProps={hoverProps}
        onContainerPointerDown={(event) => {
          // A press anywhere on the field (not only its text) opens it, like Compose.
          if (disabled || triggerRef.current?.contains(event.target as Node)) return;
          event.preventDefault();
          releaseFocusRef.current = false;
          triggerRef.current?.focus();
          if (!readOnly) state.toggle();
        }}
        rootProps={{ ...rootData, 'data-focus-visible': isFocusVisible || undefined }}
        rootRef={ref}
        className={className}
        classNames={classNames}
        style={style}
      >
        {/* The native select is for forms: submitting under `name`, autofill and native
            validation. Without them it's left out, so a long list's text (e.g. country names
            from Intl, which can differ between server and browser) isn't rendered twice. */}
        {name || autoComplete || form || stately.validationBehavior === 'native' ? (
          <HiddenSelect
            state={state}
            triggerRef={triggerRef}
            label={label}
            name={name}
            isDisabled={disabled}
            {...(autoComplete && { autoComplete })}
            {...(form && { form })}
          />
        ) : null}
        <button
          {...fieldButtonProps}
          onFocus={(event) => {
            fieldButtonProps.onFocus?.(event);
            if (!releaseFocusRef.current) return;
            releaseFocusRef.current = false;
            triggerRef.current?.blur();
          }}
          // Using the field again means it's wanted, whatever came before.
          onPointerDown={(event) => {
            releaseFocusRef.current = false;
            fieldButtonProps.onPointerDown?.(event);
          }}
          onKeyDown={(event) => {
            releaseFocusRef.current = false;
            fieldButtonProps.onKeyDown?.(event);
          }}
          ref={triggerRef}
          type="button"
          className={cn(
            'flex min-w-0 flex-1 cursor-pointer items-center self-stretch bg-transparent p-0 text-start outline-none',
            'disabled:cursor-default',
          )}
        >
          <span
            {...valueProps}
            className={cn(
              'min-w-0 flex-1 truncate text-body-large',
              hasValue
                ? 'text-[color:var(--_md-comp-text-field-input-text-color)]'
                : 'text-on-surface-variant',
              // With a label, the placeholder shows once the label floats (as TextField).
              !hasValue && hasLabel && 'opacity-0 group-data-floated/field:opacity-100',
              'group-data-[field-state=disabled]/field:text-on-surface/38',
              classNames?.value,
            )}
          >
            {hasValue && renderValue ? (
              <>
                <span aria-hidden="true">{renderValue(chosenOptions)}</span>
                <span className="sr-only">{valueText}</span>
              </>
            ) : hasValue ? (
              valueText
            ) : (
              (placeholder ?? ' ')
            )}
          </span>
        </button>
      </FieldShell>
      {asSheet ? (
        <LazyBottomSheet
          open={state.isOpen}
          onOpenChange={(open) => (open ? state.open() : state.close())}
          {...(typeof label === 'string'
            ? { 'aria-label': label }
            : { 'aria-label': (rest as { 'aria-label'?: string })['aria-label'] ?? '' })}
        >
          <div className="flex min-h-0 flex-1 flex-col px-[8px] pb-[16px]">{list}</div>
        </LazyBottomSheet>
      ) : (
        <OptionPopover
          state={state}
          triggerRef={containerRef}
          popoverRef={popoverRef}
          onPressOutside={() => {
            releaseFocusRef.current = true;
          }}
          // Room to type in a searchable menu, however narrow the field.
          minWidth={searchable ? 280 : 0}
        >
          {list}
        </OptionPopover>
      )}
    </>
  );
}

export type { Key as SelectKey } from 'react-stately';
