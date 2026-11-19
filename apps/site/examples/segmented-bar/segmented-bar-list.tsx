'use client';

import { useLocale } from '@windmorph/react';
import { SegmentedList } from '@windmorph/react-pro/charts';
import { useMemo } from 'react';

const STORAGE = [
  { key: 'photos', label: 'Photos', value: 41.2 },
  { key: 'videos', label: 'Videos', value: 28.6 },
  { key: 'documents', label: 'Documents', value: 6.3 },
  { key: 'music', label: 'Music', value: 3.1 },
];

/**
 * A thin bar that prints nothing, with each part's name, share and amount listed under it, for a
 * side panel or a narrow card. Each row's key carries its part's colour and its pattern (on by
 * default with two or more parts), so the list needs no legend. `formatValue` writes the amounts in gigabytes, in the page's locale.
 */
export function SegmentedBarList() {
  // Gigabytes in the page's locale.
  const { locale } = useLocale();
  const formatValue = useMemo(() => {
    const gigabytes = new Intl.NumberFormat(locale, { style: 'unit', unit: 'gigabyte' });
    return (value: number) => gigabytes.format(value);
  }, [locale]);
  return (
    <SegmentedList
      aria-label="Storage by file type"
      parts={STORAGE}
      formatValue={formatValue}
      className="w-full max-w-xs"
    />
  );
}
