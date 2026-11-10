'use client';

import { List, ListItem, SearchField, matchesSearch } from '@windmorph/react';
import { useState } from 'react';
import { SearchIcon } from '../../components/icons';

const PEOPLE = [
  'Alex Morgan',
  'Sam Lee',
  'Priya Nair',
  'Zoë Müller',
  'Jordan Blake',
  'Noor Haddad',
];

/** Full width in a list pane: the field fills the pane above the list it filters. */
export function SearchFieldPane() {
  const [query, setQuery] = useState('');
  const shown = PEOPLE.filter((person) => matchesSearch(person, query));
  return (
    <section
      aria-label="People"
      className="flex w-full max-w-[400px] flex-col gap-2 rounded-corner-large bg-surface-container-low p-4"
    >
      <SearchField
        aria-label="Search people"
        aria-controls="people-list"
        placeholder="Search people"
        leadingIcon={<SearchIcon />}
        value={query}
        onChange={setQuery}
      />
      <List id="people-list" aria-label="People">
        {shown.map((person) => (
          <ListItem key={person}>{person}</ListItem>
        ))}
      </List>
    </section>
  );
}
