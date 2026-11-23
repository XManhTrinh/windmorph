'use client';

import { Card, useLocale } from '@windmorph/react';
import { Meter } from '@windmorph/react-pro/charts';
import { useMemo } from 'react';

/** "42.5 GB" in the page's locale: the amount, the limit and what screen readers hear. */
function useGigabytes() {
  const { locale } = useLocale();
  return useMemo(() => {
    const gigabytes = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'gigabyte',
      maximumFractionDigits: 1,
    });
    return (value: number) => gigabytes.format(value);
  }, [locale]);
}

/**
 * Storage against a 100 GB limit. From `warningAt` the line under the track says "Close to the
 * limit" with a mark, and the fill and the mark turn to the warning colour; past `max` it says
 * "Over the limit", the fill and the mark in the error colour. The words keep the note's colour,
 * and the figure keeps the real amount. A notch marks where the warning starts. `note` holds your
 * own words: what is left, or what to do.
 */
export function MeterStorage() {
  const gb = useGigabytes();
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
      <Card variant="outlined" className="p-4">
        <Meter
          label="Photos"
          value={42.5}
          max={100}
          warningAt={80}
          formatValue={gb}
          note={`${gb(57.5)} left`}
        />
      </Card>
      <Card variant="outlined" className="p-4">
        <Meter
          label="Recordings"
          value={86}
          max={100}
          warningAt={80}
          formatValue={gb}
          note={`${gb(14)} left`}
        />
      </Card>
      <Card variant="outlined" className="p-4">
        <Meter
          label="Backups"
          value={104}
          max={100}
          warningAt={80}
          formatValue={gb}
          note="New backups are paused"
        />
      </Card>
    </div>
  );
}
