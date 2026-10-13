'use client';

import { IconButton, SearchBar } from '@windmorph/react';
import { useState } from 'react';
import { CloseIcon, MicIcon, SearchIcon } from '../../components/icons';

const SUGGESTIONS = ['Holiday photos', 'Flight confirmation', 'Invoice March', 'Team lunch'];

function Suggestions({ query, onPick }: { query: string; onPick: (value: string) => void }) {
  const items = SUGGESTIONS.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  if (items.length === 0) {
    return <p className="px-4 py-4 text-body-medium text-on-surface-variant">No suggestions</p>;
  }
  return (
    <div className="flex flex-col py-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="flex h-14 items-center gap-4 px-4 text-start text-body-large text-on-surface outline-none hover:bg-on-surface/8 focus-visible:bg-on-surface/10"
        >
          <span className="size-6 text-on-surface-variant">
            <SearchIcon />
          </span>
          {item}
        </button>
      ))}
    </div>
  );
}

/**
 * A docked search bar: pressing it, typing, or pressing ↓ opens a dropdown of suggestions
 * over a scrim. Escape or a press outside closes it. `aria-label` names the bar;
 * `onSubmit` fires on Enter.
 */
export function SearchDocked() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const submit = (value: string) => {
    setQuery(value);
    setSubmitted(value);
  };
  return (
    <div className="flex w-full max-w-[360px] flex-col items-start gap-4">
      <SearchBar
        aria-label="Search mail"
        placeholder="Search mail"
        value={query}
        onChange={setQuery}
        onSubmit={submit}
        leadingIcon={<SearchIcon />}
        trailingIcon={({ expanded }) =>
          expanded && query ? (
            <IconButton icon={<CloseIcon />} aria-label="Clear" onPress={() => setQuery('')} />
          ) : (
            <IconButton icon={<MicIcon />} aria-label="Voice search" />
          )
        }
        className="w-full"
      >
        <Suggestions query={query} onPick={submit} />
      </SearchBar>
      <p className="text-body-medium text-on-surface-variant">Searched: {submitted}</p>
    </div>
  );
}
