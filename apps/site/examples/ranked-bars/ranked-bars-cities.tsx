'use client';

import { RankedBars } from '@windmorph/react-pro/charts';

const CITIES = [
  { key: 'lyon', label: 'Lyon', value: 412 },
  { key: 'paris', label: 'Paris', value: 1204 },
  { key: 'zurich', label: 'Zürich', value: 380 },
  { key: 'hamburg', label: 'Hamburg', value: 655 },
  { key: 'vienna', label: 'Vienna', value: 298 },
  { key: 'rest', label: 'Everywhere else', value: 920, rest: true },
];

/**
 * The cities come in any order and the list puts the largest first. "Everywhere else" is the
 * rest (`rest: true`): it stays last whatever its size, in the quiet colour, on the same scale
 * as the others.
 */
export function RankedBarsCities() {
  return <RankedBars aria-label="Orders by city" rows={CITIES} className="w-full max-w-lg" />;
}
