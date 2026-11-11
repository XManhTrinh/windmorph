'use client';

import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { mergeProps, useObjectRef, useSearchField } from 'react-aria';
import { useControlledState } from 'react-stately/useControlledState';
import { useLabels } from '../labels/use-labels';
import { densityAttribute, type Density } from '../../tokens/density';
import { cn } from '../../utils/cn';
import { pickWidgetAria, splitRootProps, type WrapperRootDOMProps } from '../../utils/root-props';
import { ButtonContext, standardIconButtons } from '../button/ButtonContext';
import { IconButton } from '../icon-button/IconButton';
import type { SearchBarInputProps } from './SearchBar';
import { SearchFieldFrame } from './search-field-frame';
import { searchBarStyles, searchFieldStyles } from './search-styles';

/** Material Symbols `close`. */
const ClearIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

export interface SearchFieldClassNames {
  /** The outer container, merged with `className`. */
  root?: string;
  /** The pill around the icons and the input. */
  field?: string;
  /** The text input. */
  input?: string;
  /** The leading icon slot. */
  leading?: string;
  /** The trailing slot, holding the clear button and `trailingIcon`. */
  trailing?: string;
  /** The clear button. */
  clear?: string;
}

export interface SearchFieldLabels {
  /** The clear button's name, also its tooltip. @default "Clear search" */
  clear: string;
}

const DEFAULT_LABELS: SearchFieldLabels = { clear: 'Clear search' };

/**
 * Attributes for the input, e.g. `aria-keyshortcuts`, `enterKeyHint`, `autoComplete`,
 * `spellCheck`, `inputMode` or event handlers: those of {@link SearchBarInputProps}, less
 * `disabled` and `autoFocus`, which are the field's own props.
 */
export type SearchFieldInputProps = Omit<SearchBarInputProps, 'disabled' | 'autoFocus'>;

type Naming =
  | {
      /** The search box's accessible name. Required unless `aria-labelledby` is set. */
      'aria-label': string;
    }
  | {
      /** The id of the element that names the search box. Required unless `aria-label` is set. */
      'aria-labelledby': string;
    };

interface SearchFieldOwnProps extends WrapperRootDOMProps {
  /** The input's id. */
  id?: string;
  /** The ids of elements that describe the search, before any `inputProps['aria-describedby']`. */
  'aria-describedby'?: string;
  /** The id of an element with more details about the search. */
  'aria-details'?: string;
  /** The id of what the search filters, e.g. a list of results. */
  'aria-controls'?: string;
  /** Controlled query. */
  value?: string;
  /** Initial query when uncontrolled. @default "" */
  defaultValue?: string;
  /** Called with the query as it changes, by typing, Escape or the clear button. */
  onChange?: (value: string) => void;
  /** Called with the query when the user presses Enter (the keyboard's search action). */
  onSubmit?: (value: string) => void;
  /** Hint text shown in the empty input, e.g. "Search settings". */
  placeholder?: string;
  /** Leading icon, usually a search icon, or a back button. */
  leadingIcon?: ReactNode;
  /**
   * Trailing content after the clear button: an icon button (e.g. voice search), or an avatar
   * (an `img`, drawn at 30px), as in the search bar.
   */
  trailingIcon?: ReactNode;
  /** Replaces the clear button's icon (Material Symbols `close`). */
  clearIcon?: ReactElement;
  /**
   * Web density, `0` to `-3`: each step takes 4px off the pill (56px at 0, 44px at -3), as on the
   * other fields; icon buttons in it keep their 48px touch targets. Left out, the field takes the
   * density of the nearest `ThemeProvider` or `ThemeScope`. M3 asks for density to be the
   * reader's choice rather than a default, so prefer setting it there, from a setting.
   * @default 0
   */
  density?: Density;
  /** Whether the field is disabled: it takes no input and shows no clear button. */
  disabled?: boolean;
  /** Focus the input when the field mounts. */
  autoFocus?: boolean;
  /** The input element. */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Attributes for the input. They replace the field's defaults (`enterKeyHint="search"`,
   * `autoComplete="off"`, `spellCheck={false}`); event handlers run before the field's own, and
   * its role, name, value and type always win.
   */
  inputProps?: SearchFieldInputProps;
  /**
   * Words the field shows or announces, in place of the English defaults. A {@link LabelsProvider}
   * sets them for the whole app.
   */
  labels?: Partial<SearchFieldLabels>;
  /** Ref to the root `<div>` element. */
  ref?: Ref<HTMLDivElement>;
  /** Classes for the root element, merged with `classNames.root`; consumer classes win. */
  className?: string;
  /** Inline styles for the root element. */
  style?: CSSProperties;
  /** Classes for each part, by slot. */
  classNames?: SearchFieldClassNames;
  /** `data-*` attributes, like the other DOM attributes, go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type SearchFieldProps = SearchFieldOwnProps & Naming;

/** Presses on these keep their own behaviour; a press anywhere else on the pill focuses the input. */
const INTERACTIVE = 'input, button, a, [role="button"]';

/**
 * A search box that filters content in place (a settings page, a table, a list pane), drawn as
 * the M3 search bar's 56px pill and filling its container. It never opens a search view: use
 * `SearchBar` for suggestions or results. Escape clears the query, Enter calls `onSubmit`, and a
 * clear button shows while there is text.
 *
 * @example
 * <SearchField aria-label="Search settings" placeholder="Search settings"
 *   leadingIcon={<SearchIcon />} value={query} onChange={setQuery} />
 */
export function SearchField(props: SearchFieldProps) {
  const {
    value,
    defaultValue,
    onChange,
    onSubmit,
    placeholder,
    leadingIcon,
    trailingIcon,
    clearIcon,
    density,
    disabled = false,
    autoFocus,
    inputRef,
    inputProps: consumerInputProps,
    labels: labelsProp,
    ref,
    className,
    style,
    classNames,
    ...rest
  } = props;
  const labels = useLabels('SearchField', DEFAULT_LABELS, labelsProp);
  const [query, setQuery] = useControlledState(value, defaultValue ?? '', onChange);
  const objectInputRef = useObjectRef(inputRef);
  const { root: data, rest: own } = splitRootProps(rest, { wrapper: true });
  const {
    id,
    'aria-label': label,
    'aria-labelledby': labelledBy,
    'aria-describedby': describedBy,
    'aria-details': details,
  } = own as {
    id?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-details'?: string;
  };
  const describedByInput =
    [describedBy, consumerInputProps?.['aria-describedby']].filter(Boolean).join(' ') || undefined;

  const { inputProps } = useSearchField(
    {
      id,
      'aria-label': label,
      'aria-labelledby': label == null ? labelledBy : undefined,
      'aria-describedby': describedByInput,
      'aria-details': details,
      placeholder,
      isDisabled: disabled,
      autoFocus,
    },
    { value: query, setValue: setQuery },
    objectInputRef,
  );

  // Enter submits, but not while an input method is composing (it confirms the composition).
  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!onSubmit || event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    onSubmit(query);
  };

  const clear = () => {
    setQuery('');
    // The button goes with the text, so focus stays in the input.
    objectInputRef.current?.focus({ preventScroll: true });
  };

  // A press on the pill around the input (its padding, a decorative icon) puts the caret in it.
  const focusInput = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled || event.button !== 0) return;
    if ((event.target as Element).closest(INTERACTIVE)) return;
    event.preventDefault();
    objectInputRef.current?.focus();
  };

  const showClear = query !== '' && !disabled;
  const hasTrailing = showClear || trailingIcon != null;
  const styles = searchBarStyles({
    hasLeading: leadingIcon != null,
    hasTrailing,
    disabled,
  });
  const rootStyles = searchFieldStyles();

  return (
    <div
      {...data}
      ref={ref}
      style={style}
      {...densityAttribute(density)}
      data-disabled={disabled || undefined}
      className={rootStyles.root({ class: cn(classNames?.root, className) })}
    >
      {/* Icon buttons in a search bar are standard (M3), not the filled default. */}
      <ButtonContext value={standardIconButtons}>
        <SearchFieldFrame
          disabled={disabled}
          onPointerDown={focusInput}
          className={classNames?.field}
          leading={
            leadingIcon != null && (
              <span
                data-slot="leading"
                className={styles.leading({ class: cn(rootStyles.slot(), classNames?.leading) })}
              >
                {leadingIcon}
              </span>
            )
          }
          trailing={
            hasTrailing && (
              <span
                data-slot="trailing"
                className={styles.trailing({ class: cn(rootStyles.slot(), classNames?.trailing) })}
              >
                {showClear && (
                  <IconButton
                    aria-label={labels.clear}
                    icon={clearIcon ?? <ClearIcon />}
                    data-slot="clear"
                    // A pointer press keeps focus (and a phone's keyboard) in the input.
                    preventFocusOnPress
                    onPress={clear}
                    className={classNames?.clear}
                  />
                )}
                {trailingIcon}
              </span>
            )
          }
        >
          <input
            {...mergeProps(
              { enterKeyHint: 'search', autoComplete: 'off', spellCheck: false },
              consumerInputProps,
              inputProps,
              pickWidgetAria(own),
              { onKeyDown: submitOnEnter },
            )}
            ref={objectInputRef}
            data-slot="input"
            className={styles.input({ class: classNames?.input })}
          />
        </SearchFieldFrame>
      </ButtonContext>
    </div>
  );
}
