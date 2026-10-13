'use client';

import { Button, ChipSet, FilterChip, TextField } from '@windmorph/react';
import { EmptyState } from '@windmorph/react-pro';
import { useState, type Key } from 'react';
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
 * the client, and the count line, a status region, announces the result.
 */
export function ComponentIndex() {
  const [kind, setKind] = useState<Kind>('all');
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
          disallowEmptySelection
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
