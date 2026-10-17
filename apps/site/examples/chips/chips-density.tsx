'use client';

import { ChipSet, DENSITIES, FilterChip } from '@windmorph/react';

const OPTIONS = ['Vegetarian', 'Vegan', 'Spicy', 'Gluten-free', 'Nut-free'];

/**
 * Web density, 0 to -3: each step takes 4px off the chips (32px at 0, 24px at -2 and -3),
 * which keep their 48px touch targets, as M3 asks of chips at any density; the set puts 2px
 * more between rows a step so those targets never reach the next row. Here each `ChipSet`
 * sets `density`; in an app, set it once on `ThemeProvider` from a setting.
 */
export function ChipsDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <div key={density} className="flex flex-col gap-2">
          <p className="text-title-small">{`Density ${density}`}</p>
          <ChipSet
            aria-label={`Diet, density ${density}`}
            selectionMode="multiple"
            defaultSelectedKeys={['Spicy']}
            density={density}
          >
            {OPTIONS.map((label) => (
              <FilterChip key={label} value={label}>
                {label}
              </FilterChip>
            ))}
          </ChipSet>
        </div>
      ))}
    </div>
  );
}
