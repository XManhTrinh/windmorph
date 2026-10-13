'use client';

import { ChipSet, FilterChip } from '@windmorph/react';
import { useState } from 'react';

const OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-free'];

/**
 * Filter chips in a `ChipSet` share one selection: give each a `value`, and the set takes
 * `selectionMode`, `selectedKeys` and `onSelectionChange`. The set is one Tab stop and the
 * arrow keys move between chips. Without a leading icon, a check grows in when selected.
 */
export function ChipsFilter() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set(['Spicy']));
  return (
    <div className="flex flex-col items-start gap-3">
      <ChipSet
        aria-label="Diet"
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        {OPTIONS.map((label) => (
          <FilterChip key={label} value={label}>
            {label}
          </FilterChip>
        ))}
      </ChipSet>
      <p className="text-body-medium text-on-surface-variant">
        Selected: {[...selected].join(', ') || 'none'}
      </p>
    </div>
  );
}
