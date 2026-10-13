'use client';

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import {
  mergeProps,
  useButton,
  useComboBox,
  useFocusRing,
  useHover,
  useObjectRef,
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
import { InputChip } from '../chip/Chip';
import {
  DropdownArrow,
  FieldShell,
  fieldState,
  type FieldShellClassNames,
} from '../select/field-shell';
import { OptionList, OptionPopover, type OptionListClassNames } from '../select/option-list';
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
}

const DEFAULT_LABELS: AutocompleteLabels = {
  noResults: 'No results',
  loading: 'Loading options',
  showOptions: 'Show options',
  remove: 'Remove',
};

export interface AutocompleteClassNames extends FieldShellClassNames, OptionListClassNames {
  input?: string;
  chip?: string;
}

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
    placeholder?: string;
    /** Helper text below the field. Replaced visually by the error when invalid. */
    supportingText?: ReactNode;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    leadingIcon?: ReactNode;
    /**
     * With `selectionMode="multiple"`, the most options that can be chosen; the rest show as
     * disabled until one is removed.
     */
    maxSelections?: number;
    /** Shows a loading indicator in the list, e.g. while options load for what was typed. */
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
    maxSelections,
    loading = false,
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
    defaultFilter: filter ?? matchesSearch,
    allowsEmptyCollection: true,
  });
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
  } = useComboBox<T, M>(ariaProps, state);
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

  const focused = isFocused || state.isOpen;
  const floated = focused || state.inputValue !== '' || chips.length > 0 || Boolean(placeholder);
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
          // A press on the field's empty space puts the caret in the input.
          if (event.target === event.currentTarget && !disabled) {
            event.preventDefault();
            inputRef.current?.focus();
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
            ref={inputRef}
            className={cn(
              'min-w-[48px] flex-1 bg-transparent p-0 text-body-large text-on-surface caret-primary outline-none',
              'placeholder:text-on-surface-variant placeholder:opacity-100',
              label ? 'placeholder:opacity-0 group-data-floated/field:placeholder:opacity-100' : '',
              'group-data-invalid/field:caret-error group-data-[field-state=disabled]/field:text-on-surface/38',
              classNames?.input,
            )}
          />
        </div>
      </FieldShell>
      <OptionPopover state={state} triggerRef={containerRef} popoverRef={popoverRef} isNonModal>
        <OptionList
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
