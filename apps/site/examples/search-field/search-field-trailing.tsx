'use client';

import { IconButton, SearchField } from '@windmorph/react';
import { useState } from 'react';
import { MicIcon, SearchIcon } from '../../components/icons';

/**
 * A trailing icon button beside the clear button, which shows once there's text. The two
 * buttons sit 8px apart, so their 48px touch targets meet without overlapping.
 */
export function SearchFieldTrailing() {
  const [query, setQuery] = useState('Display');
  return (
    <div className="w-full max-w-[360px]">
      <SearchField
        aria-label="Search settings"
        placeholder="Search settings"
        leadingIcon={<SearchIcon />}
        trailingIcon={<IconButton icon={<MicIcon />} aria-label="Voice search" />}
        value={query}
        onChange={setQuery}
      />
    </div>
  );
}
