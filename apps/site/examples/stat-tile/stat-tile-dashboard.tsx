'use client';

import { Card } from '@windmorph/react';
import { StatTile } from '@windmorph/react-pro/charts';

/**
 * A row of figures on a dashboard, each on an outlined card. The arrow shows which way a
 * figure moved and screen readers hear it in words; `change.tone` says whether that is good
 * news, so more returns is a rise in the error colour. Each trend is drawn over its own range,
 * oldest first, so its shape reads at this size. The row wraps as the column narrows.
 */
export function StatTileDashboard() {
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-4">
      <Card variant="outlined" className="p-4">
        <StatTile
          label="Orders"
          value={4218}
          change={{ direction: 'up', tone: 'good', value: '12%', context: 'on last week' }}
          trend={[212, 240, 231, 260, 298, 287, 310, 342, 330, 365, 401, 420]}
        />
      </Card>
      <Card variant="outlined" className="p-4">
        <StatTile
          label="Sign-ups"
          value={1376}
          change={{ direction: 'down', tone: 'bad', value: '3%', context: 'on last week' }}
          trend={[152, 149, 161, 158, 150, 147, 151, 144, 139, 142, 138, 136]}
        />
      </Card>
      <Card variant="outlined" className="p-4">
        <StatTile
          label="Returns"
          value={86}
          change={{ direction: 'up', tone: 'bad', value: '9%', context: 'on last week' }}
          trend={[60, 64, 70, 66, 72, 80, 79, 86]}
        />
      </Card>
      <Card variant="outlined" className="p-4">
        <StatTile
          label="Delivery time"
          value={2.4}
          unit="days"
          change={{ direction: 'flat', value: '0%', context: 'on last week' }}
          trend={[2.6, 2.5, 2.5, 2.4, 2.5, 2.4, 2.4, 2.4]}
        />
      </Card>
    </div>
  );
}
