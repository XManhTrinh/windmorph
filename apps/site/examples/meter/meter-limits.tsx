'use client';

import { Card } from '@windmorph/react';
import { MeterList, type MeterListRow } from '@windmorph/react-pro/charts';
import { useId } from 'react';

/** A plan's limits, each against its own; `key` stays the same as the amounts change. */
const LIMITS: MeterListRow[] = [
  { key: 'seats', label: 'Seats', value: 18, max: 20, warningAt: 18, note: '2 left' },
  { key: 'projects', label: 'Projects', value: 4, max: 10, note: '6 left' },
  {
    key: 'minutes',
    label: 'Recording minutes this month',
    value: 1120,
    max: 1000,
    note: '120 over the plan',
  },
  { key: 'stations', label: 'Weather stations', value: 31, max: 50, warningAt: 45 },
];

/**
 * Several amounts, each against its own limit: names, tracks and figures line up as three
 * columns. Each row warns as a `Meter` does. In a container narrower than 28rem, such as a
 * side panel, each track drops under its name. Each list is named by its heading.
 */
export function MeterLimits() {
  const wide = useId();
  const narrow = useId();
  return (
    <div className="flex w-full flex-wrap items-start gap-4">
      <Card variant="outlined" className="flex w-full max-w-2xl flex-col gap-4 p-4">
        <h3 id={wide} className="text-title-medium text-on-surface">
          Plan limits
        </h3>
        <MeterList aria-labelledby={wide} rows={LIMITS} />
      </Card>
      <Card variant="outlined" className="flex w-full max-w-[18rem] flex-col gap-4 p-4">
        <h3 id={narrow} className="text-title-medium text-on-surface">
          In a side panel
        </h3>
        <MeterList aria-labelledby={narrow} rows={LIMITS} />
      </Card>
    </div>
  );
}
