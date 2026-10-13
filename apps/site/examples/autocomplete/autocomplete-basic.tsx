'use client';

import { Autocomplete, AutocompleteItem, type AutocompleteKey } from '@windmorph/react';
import { useState } from 'react';

const CITIES = [
  { id: 'zrh', name: 'Zürich', country: 'Switzerland' },
  { id: 'sp', name: 'São Paulo', country: 'Brazil' },
  { id: 'mlg', name: 'Málaga', country: 'Spain' },
  { id: 'ldn', name: 'London', country: 'United Kingdom' },
  { id: 'bham', name: 'Birmingham', country: 'United Kingdom' },
  { id: 'syd', name: 'Sydney', country: 'Australia' },
  { id: 'mel', name: 'Melbourne', country: 'Australia' },
  { id: 'hou', name: 'Houston', country: 'United States' },
];

/**
 * Type to find an option in a long list. Matching ignores case and accents, so "zurich"
 * finds "Zürich"; the arrow keys move through the matches while focus stays in the field.
 */
export function AutocompleteBasic() {
  const [city, setCity] = useState<AutocompleteKey | null>(null);
  return (
    <Autocomplete
      label="City"
      supportingText="Where you live"
      defaultItems={CITIES}
      value={city}
      onChange={setCity}
    >
      {(item) => (
        <AutocompleteItem key={item.id} description={item.country}>
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
