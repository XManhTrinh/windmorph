'use client';

import { Autocomplete, AutocompleteItem, matchesSearch } from '@windmorph/react';
import { useEffect, useState } from 'react';

interface Business {
  id: string;
  name: string;
  area: string;
}

const DIRECTORY: Business[] = [
  { id: '1', name: 'Red Lantern Kitchen', area: 'Camden, London' },
  { id: '2', name: 'Harbour Bakery', area: 'Holborn, London' },
  { id: '3', name: 'Silver Nails', area: 'Bankstown, Sydney' },
  { id: '4', name: 'Golden Kitchen', area: 'Footscray, Melbourne' },
  { id: '5', name: 'Lantern House', area: 'Bellaire, Houston' },
];

/** Stands in for a server search. */
function searchBusinesses(query: string): Promise<Business[]> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(DIRECTORY.filter((item) => matchesSearch(item.name, query))), 500),
  );
}

/**
 * Options loaded from a server for what was typed: controlled `items` and `inputValue`,
 * with `loading` showing the M3 loading indicator in the menu meanwhile.
 */
export function AutocompleteAsync() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    let current = true;
    void searchBusinesses(query).then((found) => {
      if (!current) return;
      setResults(found);
      setLoading(false);
    });
    return () => {
      current = false;
    };
  }, [query]);

  return (
    <Autocomplete
      label="Business"
      items={results}
      inputValue={query}
      onInputChange={(next) => {
        setQuery(next);
        setLoading(next.trim() !== '');
        if (!next.trim()) setResults([]);
      }}
      loading={loading}
      labels={{ noResults: 'No businesses found' }}
    >
      {(item) => (
        <AutocompleteItem key={item.id} description={item.area}>
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
