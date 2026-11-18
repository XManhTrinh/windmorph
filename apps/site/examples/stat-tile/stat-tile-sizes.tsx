'use client';

import { Card } from '@windmorph/react';
import { StatTile } from '@windmorph/react-pro/charts';

/** Minutes with one decimal, so 8 reads "8.0" beside 8.2. */
const minutes = new Intl.NumberFormat('en', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * `size="lg"` for the one figure a page is about; `md`, the default, for a row of them. A unit
 * sits small beside the number, and `formatValue` writes the number your way. A figure that
 * isn't a number yet (a weather station that hasn't reported, `NaN`) says "No value", never
 * "NaN". A tile needs neither a change nor a trend.
 */
export function StatTileSizes() {
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <Card variant="outlined" className="w-full max-w-xs p-4">
        <StatTile
          size="lg"
          label="Sign-ups this month"
          value={18240}
          change={{ direction: 'up', tone: 'good', value: '1,204', context: 'on last month' }}
        />
      </Card>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Card variant="outlined" className="p-4">
          <StatTile
            label="Time on page"
            value={8.2}
            unit="min"
            formatValue={(value) => minutes.format(value)}
            trend={[8.4, 8.1, 8.3, 8.0, 8.2, 8.2, 8.1, 8.3, 8.2, 8.2, 8.3, 8.2]}
          />
        </Card>
        <Card variant="outlined" className="p-4">
          {/* Not reported yet. */}
          <StatTile label="Readings today" value={Number.NaN} />
        </Card>
      </div>
    </div>
  );
}
