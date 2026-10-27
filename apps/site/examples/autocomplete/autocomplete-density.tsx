'use client';

import { Autocomplete, AutocompleteItem, DENSITIES, ThemeScope } from '@windmorph/react';

const CITIES = ['Zürich', 'São Paulo', 'London', 'Sydney', 'Houston'];

/**
 * Web density, 0 to -3: each step takes 4px off the field and its first row of chips, and off
 * its options. Density is a reader's choice, not a default (M3): set it on `ThemeProvider` from
 * a setting, or for a section with `ThemeScope`, as here.
 */
export function AutocompleteDensity() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 medium:grid-cols-2">
      {DENSITIES.map((density) => (
        <ThemeScope key={density} density={density} className="flex flex-col gap-4">
          <p className="text-title-small">{`Density ${density}`}</p>
          <Autocomplete label="City" clearable className="w-full">
            {CITIES.map((city) => (
              <AutocompleteItem key={city}>{city}</AutocompleteItem>
            ))}
          </Autocomplete>
          <Autocomplete
            label="Cities"
            selectionMode="multiple"
            defaultValue={['London']}
            className="w-full"
          >
            {CITIES.map((city) => (
              <AutocompleteItem key={city}>{city}</AutocompleteItem>
            ))}
          </Autocomplete>
        </ThemeScope>
      ))}
    </div>
  );
}
