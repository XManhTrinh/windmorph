'use client';

import { Select, SelectItem, type SelectKey } from '@windmorph/react';
import { useState } from 'react';

/**
 * One choice from a short list. A press anywhere on the field opens the menu under it; the
 * chosen option shows a check, and its text fills the field.
 */
export function SelectBasic() {
  const [sort, setSort] = useState<SelectKey | null>('newest');
  return (
    <Select label="Sort by" value={sort} onChange={setSort}>
      <SelectItem key="newest">Newest first</SelectItem>
      <SelectItem key="low" description="Cheapest at the top">
        Price, low to high
      </SelectItem>
      <SelectItem key="high">Price, high to low</SelectItem>
      <SelectItem key="near">Nearest to you</SelectItem>
    </Select>
  );
}
