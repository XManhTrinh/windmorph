'use client';

import { Button, IconButton, TextField } from '@windmorph/react';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { matchesPropFilter, matchOffsets, propCount } from '../lib/prop-list-model';
import { CloseIcon, ExpandMoreIcon, LinkIcon, SearchIcon } from './icons';
import { useCopy } from './site-snackbar';

/**
 * Unfolding content fades and settles in on the default effects spring; under reduced
 * motion it simply appears.
 */
const REVEAL =
  'transition-[opacity,translate] duration-(--md-sys-motion-spring-effects-default-duration) ease-(--md-sys-motion-spring-effects-default-easing) motion-safe:starting:-translate-y-1 motion-safe:starting:opacity-0';

/** The chevron turns over while its disclosure is open. */
const CHEVRON =
  '[&_svg]:transition-transform [&_svg]:duration-(--md-sys-motion-spring-spatial-fast-duration) [&_svg]:ease-(--md-sys-motion-spring-spatial-fast-easing) aria-expanded:[&_svg]:rotate-180';

/** Marks what the props filter hides; `globals.css` takes it out of the page. */
const FILTERED_OUT = 'data-filtered-out';

/** The folds (by their `data-fold` id) the props filter opens because they hold a match. */
const FilterContext = createContext<ReadonlySet<string>>(new Set());

/** The element the URL's fragment names, if any. */
function hashTarget(): HTMLElement | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

/**
 * A disclosure's state: closed until pressed, opened by a URL fragment naming something
 * inside it (on load and on every fragment change, scrolling it into view once it shows),
 * and opened by the props filter when it holds a match.
 */
function useFold() {
  const [open, setOpen] = useState(false);
  const foldId = useId();
  const content = useRef<HTMLDivElement>(null);
  const reveal = useRef<HTMLElement | null>(null);
  const filterOpens = useContext(FilterContext).has(foldId);
  const [filterOpened, setFilterOpened] = useState(filterOpens);
  // A match opens the fold; it then stays open, and closes like any other, from its button.
  if (filterOpens !== filterOpened) {
    setFilterOpened(filterOpens);
    if (filterOpens) setOpen(true);
  }

  useEffect(() => {
    const openForHash = () => {
      const target = hashTarget();
      if (!target || !content.current?.contains(target)) return;
      reveal.current = target;
      setOpen(true);
    };
    openForHash();
    window.addEventListener('hashchange', openForHash);
    return () => window.removeEventListener('hashchange', openForHash);
  }, []);

  useEffect(() => {
    // The browser couldn't scroll to it while it was hidden, so this does once it shows.
    if (!open || !reveal.current) return;
    reveal.current.scrollIntoView({ block: 'start' });
    reveal.current = null;
  }, [open]);

  return { open, toggle: () => setOpen((value) => !value), foldId, content };
}

/**
 * An object prop's keys behind a disclosure: a text button showing how many there are, which
 * expands the nested list below it. The list is in the page from the start (hidden while
 * folded), so its anchors exist.
 */
export function PropKeys({ count, children }: { count: number; children: ReactNode }) {
  const { open, toggle, foldId, content } = useFold();
  const listId = useId();
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="text"
        size="sm"
        leadingIcon={<ExpandMoreIcon />}
        aria-expanded={open}
        aria-controls={listId}
        onPress={toggle}
        className={`-ms-3 ${CHEVRON}`}
      >
        {`${count} ${count === 1 ? 'key' : 'keys'}`}
      </Button>
      <div
        id={listId}
        ref={content}
        data-fold={foldId}
        hidden={!open}
        className={`self-stretch ${REVEAL}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A group of props that starts folded (Styling): its subhead holds the disclosure button,
 * with the group's name and how many props it has.
 */
export function PropGroupFold({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: ReactNode;
}) {
  const { open, toggle, foldId, content } = useFold();
  const listId = useId();
  return (
    <>
      <h4>
        <Button
          variant="text"
          size="sm"
          leadingIcon={<ExpandMoreIcon />}
          aria-expanded={open}
          aria-controls={listId}
          onPress={toggle}
          className={`-ms-3 ${CHEVRON}`}
        >
          {`${label} (${count})`}
        </Button>
      </h4>
      <div id={listId} ref={content} data-fold={foldId} hidden={!open} className={REVEAL}>
        {children}
      </div>
    </>
  );
}

/**
 * The rest of a long union's members (a country code, a shape), folded behind a text button
 * that names how many there are in all.
 */
export function MoreValues({ total, children }: { total: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const restId = useId();
  return (
    <>
      <span id={restId} hidden={!open}>
        {children}
      </span>{' '}
      <Button
        variant="text"
        size="xs"
        aria-expanded={open}
        aria-controls={restId}
        onPress={() => setOpen((value) => !value)}
      >
        {open ? 'Show fewer' : `Show all ${total}`}
      </Button>
    </>
  );
}

/**
 * A prop's anchor: a link to it that also copies its address and confirms in the snackbar.
 * It shows while the pointer is over the prop's first line or focus is in it, and always on
 * touch screens, which have no hover.
 */
export function PropLink({ id, name }: { id: string; name: string }) {
  const copy = useCopy('Link copied');
  return (
    <IconButton
      href={`#${id}`}
      variant="standard"
      size="xs"
      icon={<LinkIcon />}
      aria-label={`Link to ${name}`}
      onPress={() => {
        void copy(`${window.location.origin}${window.location.pathname}#${id}`);
      }}
      className="opacity-0 group-focus-within/prop:opacity-100 group-hover/prop:opacity-100 pointer-coarse:opacity-100"
    />
  );
}

/** A prop's own text for the filter: its name and description, not its keys'. */
function ownParts(item: Element): Element[] {
  return [
    item.querySelector(':scope > [data-prop-header] [data-prop-name]'),
    item.querySelector(':scope > [data-prop-description]'),
  ].filter((part): part is Element => part !== null);
}

function ownText(item: Element): string {
  return ownParts(item)
    .map((part) => part.textContent ?? '')
    .join(' ');
}

/** The name of the CSS highlight that marks the filter's matches (`globals.css`). */
const HIGHLIGHT = 'props-filter';

/**
 * Marks where the query's words occur in the matching props' names and descriptions, with
 * the CSS Custom Highlight API: purely visual (nothing is announced, and the page's text is
 * left as it is), and painted inside folds as they open. Browsers without it skip it.
 */
function highlight(items: readonly Element[], query: string): void {
  if (typeof CSS === 'undefined' || !('highlights' in CSS)) return;
  if (!query.trim()) {
    CSS.highlights.delete(HIGHLIGHT);
    return;
  }
  const ranges: Range[] = [];
  for (const part of items.flatMap(ownParts)) {
    const walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (const [start, end] of matchOffsets(node.textContent ?? '', query)) {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, end);
        ranges.push(range);
      }
    }
  }
  CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
}

interface FilterResult {
  /** How many props (keys included) match. */
  count: number;
  /** The folds that hold a match, to open. */
  folds: ReadonlySet<string>;
}

const NO_FILTER: FilterResult = { count: 0, folds: new Set() };

/**
 * Applies a query to the props lists inside `root`: hides each prop that doesn't match,
 * keeping a prop that holds a matching key and every key of a matching prop, then the groups
 * and component sections left empty, and highlights the matches.
 */
function applyFilter(root: HTMLElement, query: string): FilterResult {
  for (const hidden of root.querySelectorAll(`[${FILTERED_OUT}]`)) {
    hidden.removeAttribute(FILTERED_OUT);
  }
  if (!query.trim()) {
    highlight([], '');
    return NO_FILTER;
  }
  const items = [...root.querySelectorAll<HTMLElement>('li[data-prop]')];
  const matched = items.filter((item) => matchesPropFilter(ownText(item), query));
  highlight(matched, query);
  const shown = new Set<Element>();
  const folds = new Set<string>();
  for (const item of matched) {
    shown.add(item);
    for (const key of item.querySelectorAll('li[data-prop]')) shown.add(key);
    let parent = item.parentElement?.closest('li[data-prop]');
    while (parent) {
      shown.add(parent);
      parent = parent.parentElement?.closest('li[data-prop]');
    }
    let fold = item.parentElement?.closest<HTMLElement>('[data-fold]');
    while (fold) {
      folds.add(fold.dataset.fold!);
      fold = fold.parentElement?.closest<HTMLElement>('[data-fold]');
    }
  }
  for (const item of items) if (!shown.has(item)) item.setAttribute(FILTERED_OUT, '');
  for (const part of root.querySelectorAll('[data-prop-group], [data-props-component]')) {
    if (!part.querySelector(`li[data-prop]:not([${FILTERED_OUT}])`)) {
      part.setAttribute(FILTERED_OUT, '');
    }
  }
  return { count: matched.length, folds };
}

/**
 * A field that filters every props list below it by name and description, live: it hides
 * what doesn't match (keeping a matching key's prop, and opening the folds that hold a
 * match), announces how many props match, and shows an empty state when none do. Escape or
 * the clear button empties it.
 */
export function PropsFilter({ total, children }: { total: number; children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<FilterResult>(NO_FILTER);
  const root = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // The highlight belongs to the document: leaving the page takes it away.
  useEffect(() => () => highlight([], ''), []);

  const update = (value: string) => {
    setQuery(value);
    if (root.current) setResult(applyFilter(root.current, value));
  };
  const clear = () => {
    update('');
    field.current?.focus();
  };
  const active = query.trim() !== '';
  const status = !active
    ? ''
    : result.count === 0
      ? 'No props match'
      : `${propCount(result.count)} ${result.count === 1 ? 'matches' : 'match'}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <TextField
          label="Filter props"
          value={query}
          onChange={update}
          inputRef={field}
          autoComplete="off"
          leadingIcon={<SearchIcon />}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && active) clear();
          }}
          trailingIcon={
            active ? (
              <IconButton
                variant="standard"
                icon={<CloseIcon />}
                aria-label="Clear filter"
                onPress={clear}
              />
            ) : undefined
          }
          supportingText={`By name or description, across the ${propCount(total)} below`}
          className="w-full max-w-md"
        />
        <p role="status" className="min-h-5 text-body-small text-on-surface-variant">
          {status}
        </p>
      </div>
      {active && result.count === 0 && (
        <div className="flex flex-col items-start gap-2 rounded-corner-large bg-surface-container-low p-6">
          <p className="text-title-medium text-on-surface">
            No props match &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="text-body-medium text-on-surface-variant">
            Try part of a prop&apos;s name or a word from its description.
          </p>
          <Button variant="text" size="sm" onPress={clear} className="-ms-3">
            Clear filter
          </Button>
        </div>
      )}
      <FilterContext value={result.folds}>
        <div ref={root} className="flex flex-col gap-10">
          {children}
        </div>
      </FilterContext>
    </div>
  );
}
