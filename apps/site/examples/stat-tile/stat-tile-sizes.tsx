'use client';

import { Card, useLocale } from '@windmorph/react';
import { StatTile } from '@windmorph/react-pro/charts';
import { useMemo } from 'react';

/**
 * `size="lg"` for the one figure a page is about; `md`, the default, for a row of them. A unit
 * sits small beside the number, and `formatValue` writes the number your way, here compact
 * ("18K"). `valueText` is what screen readers hear in its place: the full figure ("18,240"), or
 * the unit in words ("8.2 minutes" for "8.2 min"). A figure that
 * isn't a number yet (a weather station that hasn't reported, `NaN`) says "No value", never
 * "NaN". A tile needs neither a change nor a trend.
 */
export function StatTileSizes() {
  const { locale } = useLocale();
  const formats = useMemo(
    () => ({
      // A count, grouped as the page's locale groups it ("1,204", "1.204", "1 204").
      count: new Intl.NumberFormat(locale),
      // A short figure for the screen ("18K"), read in full through `valueText`.
      compact: new Intl.NumberFormat(locale, { notation: 'compact' }),
      // Minutes with one decimal in the page's locale, so 8 reads "8.0" beside 8.2.
      minutes: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    }),
    [locale],
  );
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <Card variant="outlined" className="w-full max-w-xs p-4">
        <StatTile
          size="lg"
          label="Sign-ups this month"
          value={18240}
          formatValue={(value) => formats.compact.format(value)}
          valueText={(value) => formats.count.format(value)}
          change={{
            direction: 'up',
            tone: 'good',
            value: formats.count.format(1204),
            context: 'on last month',
          }}
        />
      </Card>
      <div className="flex w-full max-w-xs flex-col gap-4">
        <Card variant="outlined" className="p-4">
          <StatTile
            label="Time on page"
            value={8.2}
            unit="min"
            formatValue={(value) => formats.minutes.format(value)}
            valueText={(value) => `${formats.minutes.format(value)} minutes`}
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
