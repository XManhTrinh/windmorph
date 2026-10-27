'use client';

import {
  cn,
  IconButton,
  List,
  ListItem,
  ListSection,
  SearchBar,
  type SearchBarClassNames,
  type SearchBarIconState,
} from '@windmorph/react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  AccessibilityIcon,
  ArrowBackIcon,
  CloseIcon,
  CodeIcon,
  HistoryIcon,
  MenuBookIcon,
  SearchIcon,
  SearchOffIcon,
  WidgetsIcon,
} from '../../components/icons';
import { GROUP_ICONS } from '../../components/nav/group-icons';
import { addRecentSearch, removeRecentSearch, useRecentSearches } from '../../lib/recent-searches';
import { DOCS_SECTIONS } from './sections';
import {
  createSearchIndex,
  groupResults,
  highlightParts,
  resultTypeLabel,
  searchPages,
  suggestedResults,
  type SearchEntry,
  type SearchGroup,
  type SearchResult,
} from './search-index';

/** The index's URL: a static file built by `app/search-index.json/route.ts`. */
const INDEX_URL = '/search-index.json';

let indexRequest: Promise<SearchEntry[]> | null = null;

/** Fetches the search index once per session; a failed request is retried on the next call. */
function loadIndex(): Promise<SearchEntry[]> {
  indexRequest ??= fetch(INDEX_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`${INDEX_URL} answered ${response.status}`);
      return response.json() as Promise<SearchEntry[]>;
    })
    .catch((error: unknown) => {
      indexRequest = null;
      throw error;
    });
  return indexRequest;
}

type IndexState = { status: 'loading' | 'error' } | { status: 'ready'; entries: SearchEntry[] };

const NO_ENTRIES: SearchEntry[] = [];

/** Runs `callback` once the browser is idle (or after a second where it can't say). */
function whenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(callback, 1000);
  return () => window.clearTimeout(id);
}

/**
 * The search's pages: `given` when passed, otherwise the static index (about 8 KB gzipped),
 * fetched once the page is idle, or at once when the search opens first, so no page carries
 * it in its HTML and it's there before anyone types. A failed request is retried when the
 * search opens again.
 */
function useSearchEntries(given: SearchEntry[] | undefined, wanted: boolean): IndexState {
  const [state, setState] = useState<IndexState>({ status: 'loading' });
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (given) return;
    return whenIdle(() => setIdle(true));
  }, [given]);
  const needed = !given && (wanted || idle) && state.status !== 'ready';
  useEffect(() => {
    if (!needed) return;
    let current = true;
    loadIndex().then(
      (entries) => {
        if (current) setState({ status: 'ready', entries });
      },
      () => {
        if (current) setState({ status: 'error' });
      },
    );
    return () => {
      current = false;
    };
  }, [needed, wanted]);
  return given ? { status: 'ready', entries: given } : state;
}

/** The search's name, which is also its hinted text (M3: the hint labels the bar). */
const LABEL = 'Search documentation';
/** The placeholder on a phone's narrower bar; the field's name stays {@link LABEL}. */
const SHORT_LABEL = 'Search docs';

/** The keys that open the search, as `aria-keyshortcuts` names them. */
const KEY_SHORTCUTS = 'Meta+K Control+K /';

/** Medium windows and wider dock the search; compact ones open it full screen. */
const MEDIUM_QUERY = '(min-width: 600px)';

const TAB_ICONS: Record<NonNullable<SearchResult['tab']>, ReactElement> = {
  api: <CodeIcon />,
  accessibility: <AccessibilityIcon />,
  guidelines: <MenuBookIcon />,
};

/** The icon a result leads with: its tab's, its component group's, or its guide's. */
function resultIcon(result: SearchResult): ReactElement {
  if (result.tab) return TAB_ICONS[result.tab];
  if (result.entry.group) return GROUP_ICONS[result.entry.group];
  if (result.entry.kind === 'gallery') return <WidgetsIcon />;
  return DOCS_SECTIONS.find((section) => section.href === result.href)?.icon ?? <MenuBookIcon />;
}

/** Whether keys typed here belong to a field (so `/` types a slash there). */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

const noSubscription = () => () => {};

/** Apple keyboards show ⌘ for the shortcut; the server and others show Ctrl. */
function useAppleKeyboard(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

/** Whether the page has hydrated: false on the server and in the static HTML. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/** Text with the parts matching the query emphasised. */
function Highlight({ text, terms }: { text: string; terms: readonly string[] }) {
  return highlightParts(text, terms).map((part, index) =>
    part.match ? (
      <mark
        key={index}
        className="rounded-corner-extra-small bg-secondary-container text-on-secondary-container"
      >
        {part.text}
      </mark>
    ) : (
      part.text
    ),
  );
}

/** How many results, as the view's live region announces them. */
function countLabel(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * Searches the documentation: a library `SearchBar` whose view lists the matching guides,
 * components and component tabs, grouped by category, with the matched text emphasised.
 * Before anything is typed it shows recent searches and suggested pages. ⌘K / Ctrl+K, and
 * `/` outside a field, open it from anywhere while this bar is the one on screen.
 */
export function DocsSearch({
  entries,
  view,
  className,
  classNames,
}: {
  /** The pages to search; by default the static index, fetched after the page loads. */
  entries?: SearchEntry[];
  /** Docked under the bar (medium windows and wider) or full screen (compact ones). */
  view: 'docked' | 'full-screen';
  className?: string;
  /** Forwarded to the `SearchBar` slots — e.g. `field` to condense the pill height. */
  classNames?: SearchBarClassNames;
}) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const apple = useAppleKeyboard();
  const hydrated = useHydrated();
  const recents = useRecentSearches();
  const loaded = useSearchEntries(entries, expanded);
  const ready = loaded.status === 'ready' ? loaded.entries : NO_ENTRIES;
  const index = useMemo(() => createSearchIndex(ready), [ready]);
  const results = useMemo(() => searchPages(index, query), [index, query]);
  const suggestions = useMemo(() => suggestedResults(index), [index]);
  const searching = query.trim() !== '';

  const focusInput = () => inputRef.current?.focus();

  const open = (result: SearchResult) => {
    if (searching) addRecentSearch(query);
    setExpanded(false);
    setQuery('');
    router.push(result.href);
  };

  // ⌘K / Ctrl+K, or `/` outside a field, opens the search on screen. (The shell renders a
  // docked and a full-screen bar; only one is visible at a time.)
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing || event.altKey || event.shiftKey) return;
      const command = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
      const slash =
        event.key === '/' && !event.metaKey && !event.ctrlKey && !isEditable(event.target);
      if (!command && !slash) return;
      const root = rootRef.current;
      if (!root || (typeof root.checkVisibility === 'function' && !root.checkVisibility())) {
        return;
      }
      const target = event.target instanceof Element ? event.target : null;
      const inOtherDialog = target?.closest('[role="dialog"],[role="alertdialog"]') && !expanded;
      // Another dialog (the display settings) keeps the keys to itself.
      if (inOtherDialog) return;
      event.preventDefault();
      if (expanded) {
        inputRef.current?.focus();
        inputRef.current?.select();
      } else {
        setExpanded(true);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [expanded]);

  // Crossing the compact / medium boundary swaps which bar is on screen; close this one.
  useEffect(() => {
    const media = window.matchMedia(MEDIUM_QUERY);
    const close = () => setExpanded(false);
    media.addEventListener('change', close);
    return () => media.removeEventListener('change', close);
  }, []);

  const groups: SearchGroup[] = searching
    ? groupResults(results)
    : [{ category: 'Suggestions', results: suggestions }];

  const announcement = searching
    ? results.length === 0
      ? `No results for ${query.trim()}`
      : countLabel(results.length, 'result', 'results')
    : [
        recents.length > 0 && countLabel(recents.length, 'recent search', 'recent searches'),
        countLabel(suggestions.length, 'suggestion', 'suggestions'),
      ]
        .filter(Boolean)
        .join(', ');

  const leadingIcon =
    view === 'full-screen' ? (
      ({ expanded: isOpen, collapse }: SearchBarIconState) =>
        isOpen ? (
          <IconButton
            // The back arrow points to the start edge, so it flips in right-to-left.
            icon={<ArrowBackIcon className="rtl:-scale-x-100" />}
            aria-label="Close search"
            onPress={collapse}
          />
        ) : (
          <SearchIcon />
        )
    ) : (
      <SearchIcon />
    );

  const trailingIcon = ({ expanded: isOpen }: SearchBarIconState): ReactNode => {
    if (isOpen) {
      return query !== '' ? (
        <IconButton
          icon={<CloseIcon />}
          aria-label="Clear search"
          onPress={() => {
            setQuery('');
            focusInput();
          }}
        />
      ) : null;
    }
    // The hint is for keyboards: the docked bar only, and not on touch screens.
    return view === 'docked' ? (
      <kbd
        aria-hidden="true"
        className="me-3 rounded-corner-small border border-outline-variant px-1.5 py-0.5 font-plain text-label-medium text-on-surface-variant pointer-coarse:hidden"
      >
        {apple ? '⌘K' : 'Ctrl K'}
      </kbd>
    ) : null;
  };

  return (
    <SearchBar
      ref={rootRef}
      // Marks the bar as answering its shortcuts, which it only does once hydrated.
      data-ready={hydrated || undefined}
      // The library hands the ref to whichever input is live (collapsed or expanded), and
      // gives both the input props, so both advertise the shortcuts.
      inputRef={inputRef}
      inputProps={{ 'aria-keyshortcuts': KEY_SHORTCUTS }}
      aria-label={LABEL}
      // A phone's bar (the full-screen view) is too narrow for the whole label to show.
      placeholder={view === 'full-screen' ? SHORT_LABEL : LABEL}
      leadingIcon={leadingIcon}
      trailingIcon={trailingIcon}
      view={view}
      value={query}
      onChange={setQuery}
      expanded={expanded}
      onExpandedChange={setExpanded}
      onSubmit={() => {
        if (loaded.status === 'ready') {
          if (results[0]) open(results[0]);
          return;
        }
        // Enter before the index has arrived: open the query's first result once it has.
        const submitted = query;
        void loadIndex().then(
          (all) => {
            const first = searchPages(createSearchIndex(all), submitted)[0];
            if (first) open(first);
          },
          () => undefined,
        );
      }}
      resultsAnnouncement={announcement}
      className={className}
      classNames={{
        ...classNames,
        // The hint is narrower than an icon button; the slot fits it.
        trailing: cn(view === 'docked' && !expanded && 'min-w-0', classNames?.trailing),
      }}
    >
      {loaded.status !== 'ready' ? (
        <p role="status" className="px-4 py-6 text-center text-body-medium text-on-surface-variant">
          {loaded.status === 'error'
            ? 'The search could not load. Close it and try again.'
            : 'Loading pages…'}
        </p>
      ) : (
        <SearchResults
          groups={groups}
          query={query}
          searching={searching}
          recents={searching ? [] : recents}
          suggestions={suggestions}
          onOpen={open}
          onRecent={(recent) => {
            setQuery(recent);
            focusInput();
          }}
          onRemoveRecent={(recent) => {
            removeRecentSearch(recent);
            focusInput();
          }}
          onLeaveTop={focusInput}
        />
      )}
    </SearchBar>
  );
}

/** A recent search's key in the results list, apart from the results' (their paths). */
const RECENT_KEY = 'recent:';

/**
 * ↑ on the list's first result moves back to the search field. The list moves between its
 * sections itself.
 */
function leaveAtTop(event: ReactKeyboardEvent<HTMLDivElement>, onLeaveTop: () => void): void {
  if (event.key !== 'ArrowUp') return;
  const row = (event.target as HTMLElement).closest<HTMLElement>('[role="row"]');
  const first = event.currentTarget.querySelector<HTMLElement>('[role="row"][data-key]');
  if (!row || row !== first) return;
  event.preventDefault();
  event.stopPropagation();
  onLeaveTop();
}

/**
 * The view's content: recent searches and suggestions, the grouped results, or "no results".
 * One list, a section per group under its subheader, so ↑ and ↓ move through every group.
 */
function SearchResults({
  groups,
  query,
  searching,
  recents,
  suggestions,
  onOpen,
  onRecent,
  onRemoveRecent,
  onLeaveTop,
}: {
  groups: SearchGroup[];
  query: string;
  searching: boolean;
  recents: readonly string[];
  suggestions: SearchResult[];
  onOpen: (result: SearchResult) => void;
  onRecent: (query: string) => void;
  onRemoveRecent: (query: string) => void;
  onLeaveTop: () => void;
}) {
  const noResults = searching && groups.length === 0;
  const shown = noResults ? [{ category: 'Suggestions', results: suggestions }] : groups;
  const sections = [
    ...(recents.length > 0
      ? [
          <ListSection key="recent" title="Recent searches">
            {recents.map((recent) => (
              <ListItem
                key={`${RECENT_KEY}${recent}`}
                textValue={recent}
                leading={<HistoryIcon />}
                trailing={
                  <IconButton
                    icon={<CloseIcon />}
                    aria-label={`Remove ${recent} from recent searches`}
                    onPress={() => onRemoveRecent(recent)}
                  />
                }
              >
                {recent}
              </ListItem>
            ))}
          </ListSection>,
        ]
      : []),
    ...shown.map((group) => (
      <ListSection key={group.category} title={group.category}>
        {group.results.map((result) => (
          <ListItem
            key={result.href}
            // The row's name: the title, then what it opens ("Slider, Accessibility").
            textValue={`${result.entry.title}, ${resultTypeLabel(result)}`}
            leading={resultIcon(result)}
            trailing={resultTypeLabel(result)}
            supportingText={
              result.matched ? (
                <>
                  <Highlight text={result.matched} terms={result.terms} />
                  {' · '}
                  {result.entry.summary}
                </>
              ) : (
                <Highlight text={result.entry.summary} terms={result.terms} />
              )
            }
          >
            <Highlight text={result.entry.title} terms={result.terms} />
          </ListItem>
        ))}
      </ListSection>
    )),
  ];

  return (
    <div
      className="flex flex-col gap-2 p-2 pb-4"
      onKeyDownCapture={(event) => leaveAtTop(event, onLeaveTop)}
    >
      {noResults && (
        <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-2 text-center">
          <SearchOffIcon className="size-10 text-on-surface-variant" />
          <p className="text-title-medium text-on-surface">
            No results for “<span className="break-all">{query.trim()}</span>”
          </p>
          <p className="max-w-[40ch] text-body-medium text-on-surface-variant">
            Try a component name, a code name such as IconButton, or one of these pages.
          </p>
        </div>
      )}
      <List
        variant="segmented"
        aria-label={searching && !noResults ? 'Search results' : 'Search suggestions'}
        headlineLines={1}
        supportingTextLines={1}
        onAction={(key) => {
          const value = String(key);
          if (value.startsWith(RECENT_KEY)) {
            onRecent(value.slice(RECENT_KEY.length));
            return;
          }
          const result = shown
            .flatMap((group) => group.results)
            .find((candidate) => candidate.href === value);
          if (result) onOpen(result);
        }}
      >
        {sections}
      </List>
    </div>
  );
}
