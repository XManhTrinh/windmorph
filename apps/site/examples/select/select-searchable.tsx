'use client';

import { Select, SelectItem, SelectSection, type SelectKey } from '@windmorph/react';
import { useState } from 'react';

const REGIONS = [
  {
    name: 'Europe',
    countries: [
      ['FR', 'France'],
      ['DE', 'Germany'],
      ['IE', 'Ireland'],
      ['NL', 'Netherlands'],
      ['PL', 'Poland'],
      ['GB', 'United Kingdom'],
    ],
  },
  {
    name: 'Asia and Pacific',
    countries: [
      ['AU', 'Australia'],
      ['JP', 'Japan'],
      ['NZ', 'New Zealand'],
      ['SG', 'Singapore'],
      ['KR', 'South Korea'],
      ['TH', 'Thailand'],
    ],
  },
  {
    name: 'Americas',
    countries: [
      ['CA', 'Canada'],
      ['US', 'United States'],
    ],
  },
];

/**
 * A long list with a search at the top: typing filters it ("thai" finds "Thailand"), and
 * sections with no matches hide. With `presentation="auto"`, phones get a bottom sheet that
 * shows the list first; `renderValue` shows the chosen country's code in the field.
 */
export function SelectSearchable() {
  const [country, setCountry] = useState<SelectKey | null>('GB');
  return (
    <Select
      label="Country of residence"
      searchable
      presentation="auto"
      value={country}
      onChange={setCountry}
      renderValue={([chosen]) => (chosen ? `${chosen.textValue} (${String(chosen.key)})` : null)}
    >
      {REGIONS.map((region) => (
        <SelectSection key={region.name} title={region.name}>
          {region.countries.map(([code, name]) => (
            <SelectItem key={code}>{name}</SelectItem>
          ))}
        </SelectSection>
      ))}
    </Select>
  );
}
