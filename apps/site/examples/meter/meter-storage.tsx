'use client';

import { Card } from '@windmorph/react';
import { Meter } from '@windmorph/react-pro/charts';

const gigabytes = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'gigabyte',
  maximumFractionDigits: 1,
});

/** "42.5 GB": the amount, the limit and what screen readers hear. */
const gb = (value: number) => gigabytes.format(value);

/**
 * Storage against a 100 GB limit. From `warningAt` the fill turns to the warning colour and the
 * line under the track says "Close to the limit" with a mark; past `max` it says "Over the
 * limit" in the error colour, while the figure keeps the real amount. A notch marks where the
 * warning starts. `note` holds your own words: what is left, or what to do.
 */
export function MeterStorage() {
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
