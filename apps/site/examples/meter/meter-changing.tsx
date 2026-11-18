'use client';

import { Button, Card } from '@windmorph/react';
import { Meter } from '@windmorph/react-pro/charts';
import { useState } from 'react';

const LIMIT = 100;

const gigabytes = new Intl.NumberFormat('en', {
  style: 'unit',
  unit: 'gigabyte',
  maximumFractionDigits: 1,
});
const gb = (value: number) => gigabytes.format(value);

/**
 * A new amount moves the fill and springs the number from the one showing. Past `warningAt`
 * the words and the mark appear in the line kept for them under the track, so nothing below
 * the meter moves.
 */
export function MeterChanging() {
  const [used, setUsed] = useState(62);
  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <Card variant="outlined" className="w-full p-4">
        <Meter
          label="Storage"
          value={used}
          max={LIMIT}
          warningAt={80}
          formatValue={gb}
          note={used > LIMIT ? `${gb(used - LIMIT)} over` : `${gb(LIMIT - used)} left`}
        />
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="tonal" onPress={() => setUsed((value) => Math.min(130, value + 12))}>
          Add 12 GB
        </Button>
        <Button variant="text" onPress={() => setUsed((value) => Math.max(0, value - 12))}>
          Remove 12 GB
        </Button>
      </div>
    </div>
  );
}
