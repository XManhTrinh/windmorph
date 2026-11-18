'use client';

import { SegmentedList } from '@windmorph/react-pro/charts';

const STORAGE = [
  { key: 'photos', label: 'Photos', value: 41.2 },
  { key: 'videos', label: 'Videos', value: 28.6 },
  { key: 'documents', label: 'Documents', value: 6.3 },
  { key: 'music', label: 'Music', value: 3.1 },
];

/**
 * A thin bar that prints nothing, with each part's name, share and amount listed under it, for a
 * side panel or a narrow card. Each row's key carries its part's colour and, with `texture`, its
 * pattern, so the list needs no legend. `formatValue` writes the amounts in gigabytes.
 */
export function SegmentedBarList() {
  return (
    <SegmentedList
      aria-label="Storage by file type"
      parts={STORAGE}
      formatValue={(gigabytes) => `${gigabytes} GB`}
      texture
      className="w-full max-w-xs"
    />
  );
}
