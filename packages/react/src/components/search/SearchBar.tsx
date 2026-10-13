'use client';

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { mergeProps, useDialog, useFocusRing, useModalOverlay, useObjectRef } from 'react-aria';
import { useOverlayTriggerState, type OverlayTriggerState } from 'react-stately';
import { useControlledState } from 'react-stately/useControlledState';
import { Overlay } from '../../primitives/Overlay';
import { usePresence } from '../../primitives/use-presence';
import { cn } from '../../utils/cn';
import { splitDataAttributes } from '../../utils/split-data-attributes';
import { ButtonContext, standardIconButtons } from '../button/ButtonContext';
import { searchBarStyles } from './search-styles';

/** Set by `SearchAppBar` for the search bar inside it. */
export const SearchAppBarContext = createContext<{ scrolled: boolean } | null>(null);

/** What a search bar's icons can depend on. */
export interface SearchBarIconState {
  expanded: boolean;
  /** Collapses the search view, e.g. from a back button. */
  collapse: () => void;
}

type SearchBarIcon = ReactNode | ((state: SearchBarIconState) => ReactNode);

export interface SearchBarClassNames {
  root?: string;
  /** The pill around the icons and the input (collapsed and expanded). */
  field?: string;
  input?: string;
  leading?: string;
  trailing?: string;
  scrim?: string;
  /** The expanded view: the docked panel or the full-screen surface. */
  view?: string;
  /** The expanded content: the docked dropdown or the full-screen content area. */
  content?: string;
}

type Naming = { 'aria-label': string } | { 'aria-labelledby': string };

/**
 * Attributes for the search inputs, e.g. `aria-keyshortcuts`, `aria-describedby`,
 * `enterKeyHint`, `autoComplete`, `spellCheck`, `inputMode` or event handlers. The bar owns
 * its value, name, role and popup state, so those keys are left out; an `id` or `name`
 * would be duplicated, since the bar renders a second input while expanded.
 */
export type SearchBarInputProps = Omit<
  ComponentProps<'input'>,
  | 'ref'
  | 'id'
  | 'name'
  | 'type'
  | 'role'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'placeholder'
  | 'className'
  | 'children'
  | 'dangerouslySetInnerHTML'
  | 'inert'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-hidden'
> & {
  [data: `data-${string}`]: string | number | boolean | undefined;
};

interface SearchBarOwnProps {
  /** Controlled query. */
  value?: string;
  /** Initial query when uncontrolled. @default "" */
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called with the query when the user presses Enter (the keyboard's search action). */
  onSubmit?: (value: string) => void;
  /** Controlled expansion of the search view. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * How the bar expands: a dropdown below it over a scrim, or a full-screen view (compact
   * windows). @default "docked"
   */
  view?: 'docked' | 'full-screen';
  placeholder?: string;
  /** Leading icon, e.g. a search icon, or a back button while expanded. */
  leadingIcon?: SearchBarIcon;
  /**
   * Trailing content: one or two icon buttons (e.g. voice search and a clear button), or an
   * avatar (an `img`, drawn at 30px) with up to one icon button (M3).
   */
  trailingIcon?: SearchBarIcon;
  /**
   * Centre the placeholder and the query while the bar is collapsed (M3's search app bar
   * supports centred text). @default "start"
   */
  textAlign?: 'start' | 'center';
  /**
   * What screen readers hear when the suggestions or results change while the view is open
   * (M3: "the screen reader must announce the change"), e.g. "5 results". Announced
   * politely whenever it changes.
   */
  resultsAnnouncement?: string;
  /**
   * The expanded content: suggestions or results, usually a list. ↓ from the input moves
   * focus into it.
   */
  children?: ReactNode;
  /** The input element (collapsed, or expanded while the view is open). */
  inputRef?: Ref<HTMLInputElement>;
  /**
   * Attributes for both inputs, the collapsed one and the expanded view's. They replace the
   * bar's defaults (`enterKeyHint="search"`, `autoComplete="off"`, `spellCheck={false}`);
   * event handlers run before the bar's own, and the bar's role, name, value and popup state
   * always win.
   */
  inputProps?: SearchBarInputProps;
  ref?: Ref<HTMLDivElement>;
  className?: string;
  style?: CSSProperties;
  classNames?: SearchBarClassNames;
  /** `data-*` attributes go to the root. */
  [data: `data-${string}`]: string | number | boolean | undefined;
}

export type SearchBarProps = SearchBarOwnProps & Naming;

interface BarRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  rtl: boolean;
}

/** How far the docked field widens on each side when focused (24dp → 12dp margins). */
const FOCUSED_GROWTH = 12;
/** The search bar's maximum width (M3). */
const MAX_WIDTH = 720;
/** The focused search bar's height (M3: "Search bar container Height 56dp"). */
const FIELD_HEIGHT = 56;

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * M3 Expressive search bar: a 56px pill that expands into a search view, either a dropdown
 * below the bar (docked) or a full-screen view, holding suggestions or results. Pressing
 * the bar, typing into it or ↓ expands it; Escape, a press outside or `collapse()` closes it.
 *
 * @example
 * <SearchBar aria-label="Search mail" placeholder="Search mail" leadingIcon={<SearchIcon />}
 *   value={query} onChange={setQuery} onSubmit={search}>
 *   <SuggestionList … />
 * </SearchBar>
 */
export function SearchBar(props: SearchBarProps) {
  const {
    value,
    defaultValue,
    onChange,
    onSubmit,
    expanded,
    defaultExpanded,
    onExpandedChange,
    view = 'docked',
    placeholder,
    leadingIcon,
    trailingIcon,
    textAlign = 'start',
    resultsAnnouncement,
    children,
    inputRef,
    inputProps: consumerInputProps,
    ref,
    className,
    style,
    classNames,
    ...rest
  } = props;
  const { 'aria-label': label, 'aria-labelledby': labelledBy } = props as {
    'aria-label'?: string;
    'aria-labelledby'?: string;
  };
  const [query, setQuery] = useControlledState(value, defaultValue ?? '', onChange);
  const state = useOverlayTriggerState({
    isOpen: expanded,
    defaultOpen: defaultExpanded,
    onOpenChange: onExpandedChange,
  });
  const appBar = useContext(SearchAppBarContext);
  const rootRef = useObjectRef(ref);
  const [rect, setRect] = useState<BarRect | null>(null);
  const { isPresent, isExiting, exitProps } = usePresence(
    state.isOpen,
    view === 'full-screen' ? 'clip-path' : 'opacity',
  );

  // The expanded view starts from the bar's bounds; measure them when it opens.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!state.isOpen || !root) return;
    const box = root.getBoundingClientRect();
    setRect({
      top: box.top,
      left: box.left,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
      rtl: getComputedStyle(root).direction === 'rtl',
    });
  }, [state.isOpen, rootRef]);

  const iconState: SearchBarIconState = { expanded: state.isOpen, collapse: state.close };
  const leading = typeof leadingIcon === 'function' ? leadingIcon(iconState) : leadingIcon;
  const trailing = typeof trailingIcon === 'function' ? trailingIcon(iconState) : trailingIcon;
  const styles = searchBarStyles({
    inAppBar: appBar != null,
    hasLeading: leading != null,
    hasTrailing: trailing != null,
  });
  const { data } = splitDataAttributes(rest);
  // In an app bar the collapsed field is `surface-container`; the expanded view's field
  // keeps the search view's own `surface-container-high`.
  const collapsedTone = appBar ? (appBar.scrolled ? 'scrolled' : 'appBar') : 'default';

  const field = (input: ReactNode, tone: 'default' | 'appBar' | 'scrolled') => (
    <SearchField
      className={searchBarStyles({ tone }).field({ class: classNames?.field })}
      leading={
        leading != null && (
          <span className={styles.leading({ class: classNames?.leading })}>{leading}</span>
        )
      }
      trailing={
        trailing != null && (
          <span className={styles.trailing({ class: classNames?.trailing })}>{trailing}</span>
        )
      }
    >
      {input}
    </SearchField>
  );

  // The consumer's attributes replace the defaults; the bar's own keys always win, and
  // `mergeProps` chains event handlers (the consumer's first).
  const sharedInputProps = (handlers: ComponentProps<'input'>): ComponentProps<'input'> => ({
    ...mergeProps(
      { enterKeyHint: 'search', autoComplete: 'off', spellCheck: false },
      consumerInputProps,
      handlers,
    ),
    id: undefined,
    name: undefined,
    role: undefined,
    type: 'search',
    value: query,
    placeholder,
    'aria-label': label,
    'aria-labelledby': label == null ? labelledBy : undefined,
  });
  const inputClass = (align: 'start' | 'center') =>
    searchBarStyles({
      hasLeading: leading != null,
      hasTrailing: trailing != null,
      textAlign: align,
    }).input({ class: classNames?.input });

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit?.(query);
      return true;
    }
    return false;
  };

  return (
    <div
      {...data}
      ref={rootRef}
      style={style}
      data-expanded={state.isOpen || undefined}
      className={styles.root({ class: cn(classNames?.root, className) })}
    >
      {field(
        <input
          {...sharedInputProps({
            onChange: (event: ChangeEvent<HTMLInputElement>) => {
              const next = event.target.value;
              // Compose expands the bar as the user types into it.
              if (next.length > query.length) state.open();
              setQuery(next);
            },
            onClick: state.open,
            onKeyDown: (event) => {
              submitOnEnter(event);
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                state.open();
              }
            },
          })}
          className={inputClass(textAlign)}
          // The consumer's `inputRef` follows whichever input is live.
          ref={isPresent ? undefined : inputRef}
          inert={isPresent}
          aria-hidden={isPresent || undefined}
          // A combobox whose popup is the search view's dialog (ARIA 1.2).
          role="combobox"
          aria-expanded={state.isOpen}
          aria-haspopup="dialog"
        />,
        collapsedTone,
      )}
      {isPresent && rect && (
        <Overlay isExiting={isExiting}>
          <SearchView
            view={view}
            state={state}
            rect={rect}
            isExiting={isExiting}
            exitProps={exitProps}
            label={label}
            labelledBy={labelledBy}
            classNames={classNames}
            styles={styles}
            resultsAnnouncement={resultsAnnouncement}
            field={(contentRef) =>
              field(
                <ExpandedInput
                  {...sharedInputProps({
                    onChange: (event) => setQuery(event.target.value),
                    onKeyDown: (event) => {
                      // M3: once results are queried, the query stays visible but not
                      // focused; focus moves to the results.
                      if (submitOnEnter(event)) {
                        contentRef.current?.focus();
                        return;
                      }
                      if (event.key === 'ArrowDown') {
                        const first = contentRef.current?.querySelector<HTMLElement>(FOCUSABLE);
                        if (first) {
                          event.preventDefault();
                          first.focus();
                        }
                      }
                    },
                  })}
                  className={inputClass('start')}
                  inputRef={inputRef}
                />,
                'default',
              )
            }
          >
            {children}
          </SearchView>
        </Overlay>
      )}
    </div>
  );
}

function SearchField({
  className,
  leading,
  trailing,
  children,
}: {
  className: string;
  leading: ReactNode;
  trailing: ReactNode;
  children: ReactNode;
}) {
  // The pill shows the inset focus ring while its input has keyboard focus.
  const { isFocusVisible, focusProps } = useFocusRing({ within: true, isTextInput: true });
  return (
    <div {...focusProps} data-focus-visible={isFocusVisible || undefined} className={className}>
      {/* Icon buttons in a search bar are standard (M3), not the filled default. */}
      <ButtonContext value={standardIconButtons}>
        {leading}
        {children}
        {trailing}
      </ButtonContext>
    </div>
  );
}

function ExpandedInput({
  inputRef,
  ...props
}: Omit<ComponentProps<'input'>, 'ref'> & { inputRef?: Ref<HTMLInputElement> }) {
  const ref = useObjectRef(inputRef);
  // Take focus when the view opens, with the caret after the query.
  useEffect(() => {
    const input = ref.current;
    if (!input) return;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, [ref]);
  return <input {...props} ref={ref} />;
}

function SearchView({
  view,
  state,
  rect,
  isExiting,
  exitProps,
  label,
  labelledBy,
  classNames,
  styles,
  field,
  resultsAnnouncement,
  children,
}: {
  view: 'docked' | 'full-screen';
  state: OverlayTriggerState;
  rect: BarRect;
  isExiting: boolean;
  exitProps: ReturnType<typeof usePresence>['exitProps'];
  label?: string;
  labelledBy?: string;
  classNames?: SearchBarClassNames;
  styles: ReturnType<typeof searchBarStyles>;
  field: (contentRef: RefObject<HTMLDivElement | null>) => ReactNode;
  resultsAnnouncement?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { modalProps, underlayProps } = useModalOverlay(
    { isDismissable: !isExiting },
    state,
    panelRef,
  );
  const { dialogProps } = useDialog(
    { 'aria-label': label, 'aria-labelledby': label == null ? labelledBy : undefined },
    panelRef,
  );
  const exiting = isExiting || undefined;
  const panelProps = mergeProps(modalProps, dialogProps, { tabIndex: -1 });

  if (view === 'full-screen') {
    const vars = {
      '--m3-search-top': `${rect.top}px`,
      '--m3-search-left': `${rect.left}px`,
      '--m3-search-right': `${window.innerWidth - rect.right}px`,
      '--m3-search-bottom': `${window.innerHeight - rect.bottom}px`,
      '--m3-search-start': `${rect.rtl ? window.innerWidth - rect.right : rect.left}px`,
      '--m3-search-width': `${rect.width}px`,
    } as CSSProperties;
    return (
      <div
        {...panelProps}
        {...exitProps}
        ref={panelRef}
        style={vars}
        data-exiting={exiting}
        className={styles.fullScreenPanel({ class: classNames?.view })}
      >
        <div data-exiting={exiting} className={styles.fullScreenHeader()}>
          {field(contentRef)}
        </div>
        <div
          ref={contentRef}
          tabIndex={-1}
          data-exiting={exiting}
          className={styles.fullScreenContent({ class: classNames?.content })}
        >
          {children}
        </div>
        <LiveStatus message={resultsAnnouncement} />
      </div>
    );
  }
  // The docked field widens by 12px on each side (M3 Expressive: margins 24dp → 12dp),
  // staying within the window and, unless the bar is wider already, 720px.
  const width = Math.min(rect.width + 2 * FOCUSED_GROWTH, Math.max(rect.width, MAX_WIDTH));
  const grow = (width - rect.width) / 2;
  const left = Math.max(0, Math.min(rect.left - grow, window.innerWidth - width));
  // The focused field is 56px whatever the collapsed bar's height (a consumer `h-*`),
  // centred on the bar and kept within the window.
  const top = Math.max(0, rect.top + (rect.height - FIELD_HEIGHT) / 2);
  const dockedVars = {
    '--m3-search-top': `${top}px`,
    '--m3-search-left': `${rect.left}px`,
    '--m3-search-width': `${rect.width}px`,
    '--m3-search-focused-left': `${left}px`,
    '--m3-search-focused-width': `${Math.min(width, window.innerWidth)}px`,
  } as CSSProperties;

  return (
    <>
      <div
        {...exitProps}
        aria-hidden="true"
        data-exiting={exiting}
        className={styles.scrim({ class: classNames?.scrim })}
      />
      <div {...underlayProps} className="fixed inset-0 z-(--md-sys-z-sheet)">
        <div
          {...panelProps}
          ref={panelRef}
          style={dockedVars}
          data-exiting={exiting}
          className={styles.dockedPanel({ class: classNames?.view })}
        >
          <div className={styles.dockedHeader()}>{field(contentRef)}</div>
          {children != null && (
            <div
              ref={contentRef}
              tabIndex={-1}
              data-exiting={exiting}
              className={styles.dropdown({ class: classNames?.content })}
            >
              {children}
            </div>
          )}
          <LiveStatus message={resultsAnnouncement} />
        </div>
      </div>
    </>
  );
}

/**
 * A polite live region inside the search view. It starts empty and takes the message a
 * moment later, so the first one is announced too, and again whenever it changes.
 */
function LiveStatus({ message }: { message?: string }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setText(message ?? ''), 150);
    return () => clearTimeout(timer);
  }, [message]);
  return (
    <div role="status" className="sr-only">
      {text}
    </div>
  );
}
