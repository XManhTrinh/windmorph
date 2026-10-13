'use client';

import { IconButton, SearchBar } from '@windmorph/react';
import { useState } from 'react';
import { ArrowBackIcon, SearchIcon } from '../../components/icons';

const PEOPLE = ['Alex Morgan', 'Priya Shah', 'Sam Taylor', 'Zoë Müller', 'Jordan Lee'];

/**
 * The full-screen layout, for compact windows: `view="full-screen"` opens the search view
 * over the whole window, with the query at the top and the results below it. The collapsed
 * bar centres its placeholder (`textAlign="center"`). While expanded, the leading icon turns
 * into a back button that calls `collapse()`; Escape closes the view too.
 * `resultsAnnouncement` tells screen readers how many results there are.
 */
export function SearchFullScreen() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const results = PEOPLE.filter((name) => name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="w-full max-w-[360px]">
      <SearchBar
        aria-label="Search people"
        placeholder="Search people"
        view="full-screen"
        textAlign="center"
        value={query}
        onChange={setQuery}
        expanded={expanded}
        onExpandedChange={setExpanded}
        leadingIcon={({ expanded: open, collapse }) =>
          open ? (
            <IconButton
              variant="standard"
              icon={<ArrowBackIcon />}
              aria-label="Back"
              onPress={collapse}
            />
          ) : (
            <SearchIcon />
          )
        }
        resultsAnnouncement={`${results.length} people found`}
        className="w-full"
      >
        <div className="flex flex-col py-2">
          {results.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setQuery(name);
                setExpanded(false);
              }}
              className="flex h-14 items-center px-4 text-start text-body-large text-on-surface outline-none hover:bg-on-surface/8 focus-visible:bg-on-surface/10"
            >
              {name}
            </button>
          ))}
        </div>
      </SearchBar>
    </div>
  );
}
