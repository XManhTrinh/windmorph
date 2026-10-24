'use client';

import {
  useMemo,
  useRef,
  type AriaAttributes,
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
import { TouchTarget } from '../../primitives/TouchTarget';
import { assertCollectionChildren } from '../../utils/assert-collection-children';
import type { Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { matchesSearch } from '../../utils/search';
import {
  ariaFlag,
  pickDescriptionAria,
  splitRootProps,
  type WrapperRootDOMProps,
} from '../../utils/root-props';
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
  /** Shown when no option matches what was typed. @default "No results" */
  noResults: string;
  /** The loading indicator's name. @default "Loading options" */
  loading: string;
  /** The arrow button's name. @default "Show options" */
  showOptions: string;
  /** A chip's remove button; the chip's text follows it ("Remove London"). @default "Remove" */
  remove: string;
  /** With `clearable`: the clear button's name. @default "Clear" */
  clear: string;
  /** The error icon's name (M3: "Error"). @default "Error" */
  error: string;
}

/** Elements that keep their own presses; a press anywhere else on the field opens it. */
const INTERACTIVE = 'input, textarea, button, a, [role="button"]';

const DEFAULT_LABELS: AutocompleteLabels = {
  noResults: 'No results',
  loading: 'Loading options',
  showOptions: 'Show options',
  remove: 'Remove',
  clear: 'Clear',
  error: 'Error',
};

export interface AutocompleteClassNames extends FieldShellClassNames, OptionListClassNames {
  /** The text `<input>`. */
  input?: string;
  /** With `selectionMode="multiple"`: each chosen option's input chip. */
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
  | 'validationState'
  | 'allowsCustomValue'
  // React Stately's deprecated single-selection API; `value` / `defaultValue` / `onChange` replace it.
  | 'selectedKey'
  | 'defaultSelectedKey'
  | 'onSelectionChange';

export type AutocompleteProps<T extends object, M extends SelectionMode = 'single'> = Omit<
  ComboBoxProps<T, M>,
  RenamedProps
> &
  Pick<AriaComboBoxOptions<T, M>, 'id' | 'name' | 'form'> &
  Omit<WrapperRootDOMProps, keyof ComboBoxProps<T, M>> & {
    /** The container style, as `TextField`'s: a filled surface or an outline. @default "filled" */
    variant?: TextFieldVariant;
    /**
     * Free text: whatever is typed stays as the field's text when no option matches, instead
     * of returning to the chosen option's. @default false
     */
    allowCustomValue?: boolean;
    /**
     * Web density, `0` to `-3`: each step takes 4px off the field (56px at 0, 44px at -3) and
     * off its menu's options (44px at 0, 32px at -3). Left out, it takes the density of the
     * nearest `ThemeProvider` or `ThemeScope`. M3 asks for density to be the reader's choice
     * rather than a default, so prefer setting it there, from a setting.
     * @default 0
     */
    density?: Density;
    /** The field's label. Give `aria-label` instead when there's no visible label. */
    label?: ReactNode;
    /** Accessible name when there's no visible label. */
    'aria-label'?: string;
    /** Shown in the empty input. With a `label`, it appears once the label floats (on focus). */
    placeholder?: string;
    /**
     * Helper text below the field. Replaced visually by the error when invalid, and shown in
     * the error colour while the field is invalid.
     */
    supportingText?: ReactNode;
    /** Marks the field invalid (in addition to `validate` and `required`). */
    invalid?: boolean;
    /** A value is required: adds the `*` to the label and validates on submit. */
    required?: boolean;
    /** Disables the field: it can't be focused or edited. @default false */
    disabled?: boolean;
    /** The value can be read and copied but not changed; the menu doesn't open. @default false */
    readOnly?: boolean;
    /**
     * Read as `invalid` when that's left out, for a form library that sets the attribute, so
     * the field shows its error state as well as announcing it.
     */
    'aria-invalid'?: AriaAttributes['aria-invalid'];
    /** Read as `required` when that's left out, for a form library that sets the attribute. */
    'aria-required'?: AriaAttributes['aria-required'];
    /** Read as `readOnly` when that's left out, for a form library that sets the attribute. */
    'aria-readonly'?: AriaAttributes['aria-readonly'];
    /** Decorative icon at the start, in a 48px box. */
    leadingIcon?: ReactNode;
    /**
     * The icon shown before the arrow while the field is invalid (M3 strongly recommends one).
     * Defaults to Material Symbols `error`, named by `labels.error`; `false` turns it off.
     */
    errorIcon?: ReactNode | false;
    /**
     * A clear button (M3's clear icon) that appears while there's typed text and empties it,
     * and a single choice with it. It's skipped by Tab, since the text can be deleted from
     * the keyboard.
     * @default false
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
    /** Words the Autocomplete shows or announces, for other languages. */
    labels?: Partial<AutocompleteLabels>;
    /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
    className?: string;
    /** Classes for each part, by slot. */
    classNames?: AutocompleteClassNames;
    /** Inline styles for the root element. */
    style?: CSSProperties;
    /** Ref to the root `<div>` element. Use `inputRef` for the input itself. */
    ref?: Ref<HTMLDivElement>;
    /** Ref to the text `<input>`, e.g. for form libraries. */
    inputRef?: Ref<HTMLInputElement>;
  };

/**
 * The arrow's press moves focus to the input (React Aria does it on a touch press) without
 * scrolling the page: a press on a field partly off-screen scrolled it into view
 * (2026-10-15). The input's `focus` asks for `preventScroll` only while the press runs.
 */
function withFocusInPlace(input: HTMLInputElement | null, run: () => void) {
  if (!input) return run();
  input.focus = (options) =>
    HTMLElement.prototype.focus.call(input, { ...options, preventScroll: true });
  try {
    run();
  } finally {
    Reflect.deleteProperty(input, 'focus');
  }
}

/**
 * M3 exposed dropdown menu, editable (Compose's `ExposedDropdownMenuBox` with a
 * `PrimaryEditable` anchor): type in the field and the menu below shows the matching
 * options. Single or multiple selection (chosen options as M3 input chips in the field),
 * accent-insensitive filtering by default, options loaded from a server through `items`,
 * `onInputChange` and `loading`, and free text with `allowCustomValue` (React Aria
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
    density,
    label,
    placeholder,
    supportingText,
    invalid: invalidProp,
    required: requiredProp,
    disabled = false,
    readOnly: readOnlyProp,
    'aria-invalid': ariaInvalid,
    'aria-required': ariaRequired,
    'aria-readonly': ariaReadonly,
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
    allowCustomValue,
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
  const { root: rootData, rest } = splitRootProps(otherProps, { wrapper: true });
  const invalid = invalidProp ?? ariaFlag(ariaInvalid);
  const required = requiredProp ?? ariaFlag(ariaRequired);
  const readOnly = readOnlyProp ?? ariaFlag(ariaReadonly) ?? false;
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
    allowsCustomValue: allowCustomValue,
    // The arrow keys wrap at the ends of the list, as in menus and lists.
    shouldFocusWrap: true,
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
  const arrowPress = buttonProps.onPress;
  const { buttonProps: arrowProps } = useButton(
    {
      ...buttonProps,
      onPress:
        arrowPress && ((event) => withFocusInPlace(inputRef.current, () => arrowPress(event))),
    },
    buttonRef,
  );
  // A touch on the arrow, opening the list on its click (see the arrow's handlers).
  const fingerOnArrowRef = useRef(false);
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
    // Back to the input in the same field, without scrolling the page (2026-10-15).
    inputRef.current?.focus({ preventScroll: true });
  };
  const resolvedError =
    typeof errorMessage === 'function'
      ? errorMessage({ isInvalid, validationErrors, validationDetails })
      : (errorMessage ?? validationErrors.join(' '));

  return (
    <>
      <FieldShell
        variant={variant}
        density={density}
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
            // A finger opens the list on the click, with focus in the input. React Aria's
            // touch press never ended here in Chrome (the list stayed closed), and the mouse
            // events a tap emulates focused the arrow, out of the Tab order (2026-10-17). So a
            // touch keeps both away from the arrow; the mouse and the keyboard keep React
            // Aria's press, which opens on the press start.
            onPointerDown={(event) => {
              fingerOnArrowRef.current = event.pointerType !== 'mouse';
              if (!fingerOnArrowRef.current) return arrowProps.onPointerDown?.(event);
              event.preventDefault();
            }}
            onPointerCancel={() => {
              fingerOnArrowRef.current = false;
            }}
            onClick={(event) => {
              if (!fingerOnArrowRef.current) return arrowProps.onClick?.(event);
              fingerOnArrowRef.current = false;
              inputRef.current?.focus({ preventScroll: true });
              if (!disabled && !readOnly) state.toggle(null, 'manual');
            }}
            ref={buttonRef}
            aria-label={labels.showOptions}
            className="relative flex size-[40px] items-center justify-center rounded-corner-full outline-none state-layer focus-ring [&>svg]:size-[24px]"
          >
            <TouchTarget />
            <DropdownArrow open={state.isOpen} />
          </button>
        }
        trailingAction={
          showClear ? (
            <button
              type="button"
              tabIndex={-1}
              aria-label={labels.clear}
              // Keeps focus (and the open menu) in the input.
              onPointerDown={(event) => event.preventDefault()}
              onClick={clear}
              className={cn(
                'relative flex size-[40px] items-center justify-center rounded-corner-full text-on-surface-variant outline-none state-layer [&>svg]:size-[24px]',
                classNames?.clear,
              )}
            >
              <TouchTarget />
              <ClearIcon />
            </button>
          ) : null
        }
        supportingText={supportingText}
        descriptionProps={descriptionProps}
        errorText={resolvedError}
        errorMessageProps={errorMessageProps}
        showError={isInvalid && Boolean(resolvedError)}
        containerRef={containerRef}
        containerProps={mergeProps(hoverProps, focusProps)}
        onContainerPointerDown={(event) => {
          // A press anywhere on the field (its padding, a chip's label, the space between
          // chips) puts the caret in the input and opens the menu, as TextField and Select
          // react to the whole field. The input opens on its own click, and the buttons (the
          // arrow, clear, a chip's remove) keep their own presses. Presses in the menu reach
          // here through React's tree from its portal, and are left alone.
          const target = event.target as Element;
          if (event.currentTarget.contains(target) && !target.closest(INTERACTIVE) && !disabled) {
            event.preventDefault();
            // The field is where the press landed: the page never scrolls to it (2026-10-15).
            inputRef.current?.focus({ preventScroll: true });
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
            // A row of 32px input chips fits the 56px container (12px above and below), so a
            // first chip doesn't make the field taller and each further row adds 40px. A filled
            // field's floated label takes the top 24px, so there the row stays below it.
            multiple &&
              chips.length > 0 &&
              !(variant === 'filled' && label !== undefined && label !== null) &&
              '-my-[4px]',
          )}
        >
          {chips.map((item) => (
            <InputChip
              key={item.key}
              // The field's own density sets its padding around one 32px row of chips, so the
              // chips keep their size (the field's height is what density changes here).
              density={0}
              onRemove={() => removeChip(item.key)}
              labels={{ remove: labels.remove }}
              disabled={disabled || readOnly}
              className={classNames?.chip}
            >
              {item.textValue}
            </InputChip>
          ))}
          <input
            {...pickDescriptionAria(rest)}
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
              // A zero flex basis with a 48px minimum: the input shares the chips' last row
              // while 48px are left there, and wraps to a row of its own only below that.
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
        </div>
      </FieldShell>
      <OptionPopover
        state={state}
        triggerRef={containerRef}
        popoverRef={popoverRef}
        nonModal
        density={density}
      >
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
