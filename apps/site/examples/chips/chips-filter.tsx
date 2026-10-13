'use client';

import { FilterChip } from '@windmorph/react';
import { useState } from 'react';

const OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-free'];

/**
 * Filter chips are toggles (`aria-pressed`). Without a leading icon a check grows in when
 * selected; the corners morph to round. Here each chip is controlled with `selected` /
 * `onSelectedChange`.
 */
export function ChipsFilter() {
  const [selected, setSelected] = useState<string[]>(['Spicy']);
  const toggle = (label: string) =>
    setSelected((current) =>
      current.includes(label) ? current.filter((x) => x !== label) : [...current, label],
    );

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((label) => (
          <FilterChip
            key={label}
            selected={selected.includes(label)}
            onSelectedChange={() => toggle(label)}
          >
            {label}
          </FilterChip>
        ))}
      </div>
      <p className="text-body-medium text-on-surface-variant">
        Selected: {selected.join(', ') || 'none'}
      </p>
    </div>
  );
}
