'use client';

import { SearchField, matchesSearch } from '@windmorph/react';
import { useState } from 'react';
import { SearchIcon } from '../../components/icons';

const SETTINGS = [
  'Wi-Fi',
  'Bluetooth',
  'Display',
  'Sound and vibration',
  'Notifications',
  'Battery',
  'Privacy',
  'Accessibility',
];

/**
 * A settings list filtered in place as you type: the search box never opens a view.
 * `matchesSearch` ignores case and accents; Escape or the clear button empties the query.
 */
export function SearchFieldFilter() {
  const [query, setQuery] = useState('');
  const shown = SETTINGS.filter((setting) => matchesSearch(setting, query));
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-2">
      <SearchField
        aria-label="Search settings"
        aria-controls="filtered-settings"
        placeholder="Search settings"
        leadingIcon={<SearchIcon />}
        value={query}
        onChange={setQuery}
      />
      <ul id="filtered-settings" aria-label="Settings" className="flex flex-col">
        {shown.map((setting) => (
          <li key={setting} className="flex h-12 items-center px-4 text-body-large text-on-surface">
            {setting}
          </li>
        ))}
      </ul>
      <p role="status" className="px-4 text-body-medium text-on-surface-variant">
        {shown.length === 0 ? 'No settings match' : ''}
      </p>
    </div>
  );
}
