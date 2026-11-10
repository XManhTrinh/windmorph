'use client';

import { SearchField } from '@windmorph/react';
import { SearchIcon } from '../../components/icons';

/** Disabled: M3's disabled colours, no typing and no clear button. */
export function SearchFieldDisabled() {
  return (
    <div className="w-full max-w-[360px]">
      <SearchField
        aria-label="Search settings"
        placeholder="Search settings"
        defaultValue="Display"
        leadingIcon={<SearchIcon />}
        disabled
      />
    </div>
  );
}
