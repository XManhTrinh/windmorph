'use client';

import { DENSITIES, Select, SelectItem, ThemeScope } from '@windmorph/react';

/**
 * Web density, 0 to -3: each step takes 4px off the field (56px at 0, 44px at -3) and off its
 * options (44px at 0, 32px at -3). Density is a reader's choice, not a default (M3): set it on
 * `ThemeProvider` from a setting, or for a section with `ThemeScope`, as here.
 */
export function SelectDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Select label="Sort by" defaultValue="newest" className="w-full">
            <SelectItem key="newest">Newest first</SelectItem>
            <SelectItem key="low">Price, low to high</SelectItem>
            <SelectItem key="near">Nearest to you</SelectItem>
          </Select>
        </ThemeScope>
      ))}
    </div>
  );
}
