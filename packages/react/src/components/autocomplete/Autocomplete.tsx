'use client';

import {
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {
  mergeProps,
  useButton,
  useComboBox,
  useFocusRing,
  useHover,
  useObjectRef,
  ListKeyboardDelegate,
  type AriaComboBoxOptions,
} from 'react-aria';
import {
  useComboBoxState,
  type ComboBoxProps,
  type ComboBoxStateOptions,
  type SelectionMode,
} from 'react-stately/useComboBoxState';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import { cn } from '../../utils/cn';
import { matchesSearch } from '../../utils/search';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { usePreloadLoadingIndicator } from '../loading-indicator/lazy-loading-indicator';
import { InputChip } from '../chip/Chip';
import {
  DropdownArrow,
  FieldShell,
  fieldState,
  type FieldShellClassNames,
} from '../select/field-shell';
import {
  FOCUSABLE_DISABLED_OPTIONS,
  OptionList,
  OptionPopover,
  type OptionListClassNames,
} from '../select/option-list';
import { useSelectionCap } from '../select/selection-cap';
import type { TextFieldVariant } from '../text-field/text-field-styles';

/** Words the Autocomplete shows or announces; override them for other languages. */
export interface AutocompleteLabels {
  /** Shown when no option matches what was typed. */
  noResults: string;
  /** The loading indicator's name. */
  loading: string;
  /** The arrow button's name. */
  showOptions: string;
  /** A chip's remove button; the chip's text follows it ("Remove London"). */
  remove: string;
  /** With `clearable`: the clear button's name. */
  clear: string;
  /** The error icon's name (M3: "Error"). */
  error: string;
}

const DEFAULT_LABELS: AutocompleteLabels = {
  noResults: 'No results',
  loading: 'Loading options',
  showOptions: 'Show options',
  remove: 'Remove',
  clear: 'Clear',
  error: 'Error',
};

export interface AutocompleteClassNames extends FieldShellClassNames, OptionListClassNames {
  input?: string;
  chip?: string;
  /** With `clearable`: the clear button. */
  clear?: string;
}

/** Material Symbols `close`. */
const ClearIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

/** React Aria props this API names the library's way (`disabled`, `readOnly`…), or leaves out. */
type RenamedProps =
  | 'isDisabled'
  | 'isRequired'
  | 'isInvalid'
  | 'isReadOnly'
  | 'label'
  | 'description'
  | 'validationState';

export type AutocompleteProps<T extends object, M extends SelectionMode = 'single'> = Omit<
  ComboBoxProps<T, M>,
  RenamedProps
> &
  Pick<AriaComboBoxOptions<T, M>, 'name' | 'form'> & {
    /** @default "filled" (as TextField) */
    variant?: TextFieldVariant;
    /** The field's label. Give `aria-label` instead when there's no visible label. */
    label?: ReactNode;
    'aria-label'?: string;
    /** Shown in the empty input. With a `label`, it appears once the label floats (on focus). */
    placeholder?: string;
    /**
     * Helper text below the field. Replaced visually by the error when invalid, and shown in
     * the error colour while the field is invalid.
     */
    supportingText?: ReactNode;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    leadingIcon?: ReactNode;
    /**
     * The icon shown before the arrow while the field is invalid (M3 strongly recommends one).
     * Defaults to Material Symbols `error`, named by `labels.error`; `false` turns it off.
     */
    errorIcon?: ReactNode | false;
    /**
     * A clear button (M3's clear icon) that appears while there's typed text and empties it,
     * and a single choice with it. It's skipped by Tab: Escape clears from the keyboard.
     */
    clearable?: boolean;
    /**
     * With `selectionMode="multiple"`, the most options that can be chosen; the rest show as
     * disabled until one is removed.
     */
    maxSelections?: number;
    /**
     * Shows a loading indicator in the list, e.g. while options load for what was typed.
     * The indicator's code loads when it first shows, and ahead of that when the field is
     * hovered or focused while this prop is set at all, so pass `loading={false}` (rather than
     * leaving it out) on a field that loads options.
     */
    loading?: boolean;
    /**
     * Whether an option matches what was typed. Defaults to a match anywhere in its text,
     * ignoring case and accents ("zurich" finds "Zürich"). Not used with controlled `items`.
     */
    filter?: (textValue: string, inputValue: string) => boolean;
    labels?: Partial<AutocompleteLabels>;
    className?: string;
    classNames?: AutocompleteClassNames;
    style?: CSSProperties;
    ref?: Ref<HTMLDivElement>;
    inputRef?: Ref<HTMLInputElement>;
  };

/**
 * M3 exposed dropdown menu, editable (Compose's `ExposedDropdownMenuBox` with a
 * `PrimaryEditable` anchor): type in the field and the menu below shows the matching
 * options. Single or multiple selection (chosen options as M3 input chips in the field),
 * accent-insensitive filtering by default, options loaded from a server through `items`,
 * `onInputChange` and `loading`, and free text with `allowsCustomValue` (React Aria
 * `useComboBox`).
 *
 * @example
 * <Autocomplete label="City" defaultItems={cities}>
 *   {(city) => <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>}
 * </Autocomplete>
 */
export function Autocomplete<T extends object, M extends SelectionMode = 'single'>(
  props: AutocompleteProps<T, M>,
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
    clearable = false,
    maxSelections,
    loading,
    labels: labelsProp,
    className,
    classNames,
    style,
    ref,
    inputRef: inputRefProp,
    errorMessage,
    filter,
    ...otherProps
  } = props;
  // Items given as elements (not `items` with a render function) must come from a client.
  if (typeof props.children !== 'function') {
    assertCollectionChildren(
      props.children,
      'Autocomplete',
      'AutocompleteItem and AutocompleteSection elements',
    );
  }
  const { data: rootData, rest } = splitDataAttributes(otherProps);
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const stately = rest as Omit<ComboBoxProps<T, M>, RenamedProps>;
  const multiple = stately.selectionMode === 'multiple';
  const cap = useSelectionCap({
    multiple,
    maxSelections,
    value: stately.value,
    defaultValue: stately.defaultValue,
    onChange: stately.onChange,
  });

  const inputRef = useObjectRef(inputRefProp);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listBoxRef = useRef<HTMLUListElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // A field that takes `loading` (it loads options) preloads the indicator on hover or focus.
  usePreloadLoadingIndicator(containerRef, loading !== undefined);

  const ariaProps = {
    ...stately,
    ...cap.valueProps,
    label,
    description: supportingText,
    errorMessage,
    isInvalid: invalid,
    isRequired: required,
    isDisabled: disabled,
    isReadOnly: readOnly,
    placeholder,
    inputRef,
    buttonRef,
    listBoxRef,
    popoverRef,
  } as AriaComboBoxOptions<T, M>;

  const state = useComboBoxState<T, M>({
    ...(ariaProps as unknown as ComboBoxStateOptions<T, M>),
    ...FOCUSABLE_DISABLED_OPTIONS,
    defaultFilter: filter ?? matchesSearch,
    allowsEmptyCollection: true,
  });
  const { collection } = state;
  const { disabledKeys } = state.selectionManager;
  const keyboardDelegate = useMemo(
    () =>
      new ListKeyboardDelegate({
        collection,
        disabledKeys,
        disabledBehavior: 'selection',
        ref: listBoxRef,
      }),
    [collection, disabledKeys],
  );
  const {
    buttonProps,
    inputProps,
    listBoxProps,
    labelProps,
    descriptionProps,
    errorMessageProps,
    isInvalid,
    validationErrors,
    validationDetails,
  } = useComboBox<T, M>(
    {
      ...ariaProps,
      // The input's arrow keys reach disabled options too (M3: they "can receive focus").
      keyboardDelegate,
    },
    state,
  );
  const { buttonProps: arrowProps } = useButton(buttonProps, buttonRef);
  const { focusProps, isFocused } = useFocusRing({ within: true, isTextInput: true });
  const { hoverProps, isHovered } = useHover({ isDisabled: disabled });

  const chips = multiple ? state.selectedItems : [];
  const removeChip = (key: string | number) => state.selectionManager.toggleSelection(key);
  // Backspace in an empty input removes the last chip, as in other chip inputs.
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const last = chips.at(-1);
    if (event.key === 'Backspace' && state.inputValue === '' && last && !readOnly) {
      event.preventDefault();
      removeChip(last.key);
    }
  };

  // M3: "A menu should open when a person … Selects an element, such as … a text field", as
  // Compose's editable anchor opens on press. A press on the input or the field opens the
  // whole list, as the arrow does; keyboard focus alone doesn't (unless `menuTrigger="focus"`),
  // and `menuTrigger="manual"` leaves opening to the arrow and the arrow keys.
  const openOnPress = () => {
    if (!state.isOpen && !disabled && !readOnly && ariaProps.menuTrigger !== 'manual') {
      state.open(null, 'manual');
    }
  };

  const focused = isFocused || state.isOpen;
  const floated = focused || state.inputValue !== '' || chips.length > 0;
  const showClear = clearable && state.inputValue !== '' && !disabled && !readOnly;
  const clear = () => {
    if (!multiple) state.setValue(null);
    state.setInputValue('');
    inputRef.current?.focus();
  };
  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors, validationDetails })
      : (errorMessage ?? validationErrors.join(' '));

  return (
    <>
      <FieldShell
        variant={variant}
        label={label}
        labelProps={labelProps}
        required={required}
        state={fieldState({ disabled, invalid: isInvalid, focused, hovered: isHovered })}
        floated={floated}
        open={state.isOpen}
        leadingIcon={leadingIcon}
        errorIcon={errorIcon}
        errorIconLabel={labels.error}
        readOnly={readOnly}
        trailing={
          <button
            {...arrowProps}
            ref={buttonRef}
            aria-label={labels.showOptions}
            className="flex size-[40px] items-center justify-center rounded-corner-full outline-none state-layer focus-ring [&>svg]:size-[24px]"
          >
            <DropdownArrow open={state.isOpen} />
          </button>
        }
        supportingText={supportingText}
        descriptionProps={descriptionProps}
        errorText={resolvedError}
        errorMessageProps={errorMessageProps}
        showError={isInvalid && Boolean(resolvedError)}
        containerRef={containerRef}
        containerProps={mergeProps(hoverProps, focusProps)}
        onContainerPointerDown={(event) => {
          // A press on the field's empty space puts the caret in the input and opens the menu.
          if (event.target === event.currentTarget && !disabled) {
            event.preventDefault();
            inputRef.current?.focus();
            openOnPress();
          }
        }}
        rootProps={rootData}
        rootRef={ref}
        className={className}
        classNames={classNames}
        style={style}
        multiline={multiple}
      >
        <div
          className={cn(
            'flex min-w-0 flex-1 flex-wrap items-center gap-[8px]',
            multiple && chips.length > 0 && 'py-[4px]',
          )}
        >
          {chips.map((item) => (
            <InputChip
              key={item.key}
              onRemove={() => removeChip(item.key)}
              removeLabel={labels.remove}
              disabled={disabled || readOnly}
              className={classNames?.chip}
            >
              {item.textValue}
            </InputChip>
          ))}
          <input
            {...inputProps}
            onKeyDown={(event) => {
              onKeyDown(event);
              inputProps.onKeyDown?.(event);
            }}
            onClick={(event) => {
              inputProps.onClick?.(event);
              openOnPress();
            }}
            ref={inputRef}
            className={cn(
              'min-w-[48px] flex-1 bg-transparent p-0 text-body-large outline-none',
              'text-[color:var(--_md-comp-text-field-input-text-color)]',
              'caret-[color:var(--_md-comp-text-field-caret-color)]',
              'placeholder:text-on-surface-variant placeholder:opacity-100',
              label
                ? 'placeholder:opacity-0 placeholder:transition-opacity group-data-floated/field:placeholder:opacity-100 placeholder:[transition-duration:var(--md-sys-motion-spring-effects-fast-duration)] placeholder:[transition-timing-function:var(--md-sys-motion-spring-effects-fast-easing)]'
                : '',
              'group-data-invalid/field:caret-error group-data-[field-state=disabled]/field:text-on-surface/38',
              classNames?.input,
            )}
          />
          {showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={labels.clear}
              // Keeps focus (and the open menu) in the input.
              onPointerDown={(event) => event.preventDefault()}
              onClick={clear}
              className={cn(
                '-me-[4px] flex size-[40px] shrink-0 items-center justify-center rounded-corner-full text-on-surface-variant outline-none state-layer [&>svg]:size-[24px]',
                classNames?.clear,
              )}
            >
              <ClearIcon />
            </button>
          ) : null}
        </div>
      </FieldShell>
      <OptionPopover state={state} triggerRef={containerRef} popoverRef={popoverRef} isNonModal>
        <OptionList
          animateFiltering
          listBoxProps={listBoxProps}
          state={state}
          listBoxRef={listBoxRef}
          emptyLabel={labels.noResults}
          loading={loading}
          loadingLabel={labels.loading}
          isBlocked={cap.isBlocked}
          classNames={classNames}
        />
      </OptionPopover>
    </>
  );
}

export type { Key as AutocompleteKey } from 'react-stately';
