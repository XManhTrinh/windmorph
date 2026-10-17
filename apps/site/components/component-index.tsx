'use client';

import { Button, ChipSet, FilterChip, TextField } from '@windmorph/react';
import { EmptyState } from '@windmorph/react-pro';
import { useState, useSyncExternalStore, type Key } from 'react';
import {
  GALLERY_RAIL_GROUPS,
  pagesInRailGroup,
  type ComponentMeta,
} from '../content/components/catalog';
import { ComponentGallery } from './gallery';
import { SearchIcon, SearchOffIcon } from './icons';

const KINDS = [
  { key: 'all', label: 'All' },
  { key: 'expressive', label: 'Expressive' },
  { key: 'pro', label: 'Pro' },
] as const;

type Kind = (typeof KINDS)[number]['key'];

/** The URL parameter that opens the index filtered: `/components?filter=pro`. */
export const FILTER_PARAM = 'filter';

/** The filter a query string asks for (`?filter=pro`), or All. */
export function kindFromSearch(search: string): Kind {
  const value = new URLSearchParams(search).get(FILTER_PARAM);
  return KINDS.find(({ key }) => key === value)?.key ?? 'all';
}

function subscribeToHistory(onChange: () => void) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

/** Keeps the chosen filter in the URL, so the filtered index can be linked to. */
function writeKind(kind: Kind) {
  const url = new URL(window.location.href);
  if (kind === 'all') url.searchParams.delete(FILTER_PARAM);
  else url.searchParams.set(FILTER_PARAM, kind);
  window.history.replaceState(window.history.state, '', url);
}

function matches(page: ComponentMeta, kind: Kind, query: string): boolean {
  if (kind === 'expressive' && !page.expressive) return false;
  if (kind === 'pro' && !page.pro) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [page.title, page.summary, ...(page.keywords ?? []), ...page.propsComponents].some(
    (text) => text.toLowerCase().includes(q),
  );
}

/** Every page the gallery lists. */
const GALLERY_PAGES = GALLERY_RAIL_GROUPS.flatMap((group) => pagesInRailGroup(group.id));

/**
 * The component index: filter chips (All, Expressive, Pro) and a field that filters as you
 * type, over the grouped gallery. The static HTML lists every component; filtering runs on
 * the client, and the count line, a status region, announces the result. The chips follow
 * the URL's `filter` parameter (`/components?filter=pro`), and a chip's choice is written
 * back to it, so a filtered index can be linked to and survives a reload.
 */
export function ComponentIndex() {
  // The URL's filter after hydration (the static HTML shows All), until a chip is picked.
  const urlKind = useSyncExternalStore(
    subscribeToHistory,
    () => kindFromSearch(window.location.search),
    (): Kind => 'all',
  );
  const [picked, setPicked] = useState<Kind | null>(null);
  const kind = picked ?? urlKind;
  const setKind = (next: Kind) => {
    setPicked(next);
    writeKind(next);
  };
  const [query, setQuery] = useState('');
  const filter = (page: ComponentMeta) => matches(page, kind, query);
  const count = GALLERY_PAGES.filter(filter).length;
  const total = GALLERY_PAGES.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 medium:flex-row medium:items-center medium:justify-between">
        <ChipSet
          aria-label="Show"
          selectionMode="single"
          deselectable={false}
          selectedKeys={[kind]}
          onSelectionChange={(keys: Set<Key>) => {
            const [next] = [...keys];
            if (next != null) setKind(String(next) as Kind);
          }}
        >
          {KINDS.map(({ key, label }) => (
            <FilterChip key={key} value={key}>
              {label}
            </FilterChip>
          ))}
        </ChipSet>
        <TextField
          label="Filter components"
          type="search"
          variant="outlined"
          leadingIcon={<SearchIcon />}
          value={query}
          onChange={setQuery}
          className="w-full medium:w-72"
        />
      </div>
      <p role="status" className="text-body-medium text-on-surface-variant">
        {count === total ? `${total} components` : `${count} of ${total} components`}
      </p>
      {count > 0 ? (
        <ComponentGallery groupHeadingTag="h2" filter={filter} />
      ) : (
        <EmptyState
          tone="tertiary"
          icon={<SearchOffIcon />}
          title="No components match"
          description="Try another word, or show all components."
          actions={
            <Button
              variant="tonal"
              onPress={() => {
                setKind('all');
                setQuery('');
              }}
            >
              Show all
            </Button>
          }
        />
      )}
    </div>
  );
}
