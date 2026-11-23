'use client';

import { BarChart, ChartFrame } from '@windmorph/react-pro/charts';

const WEEKS = [
  { key: '2026-06-02', tick: '2 Jun', name: 'Week of 2 June' },
  { key: '2026-06-09', tick: '9 Jun', name: 'Week of 9 June' },
  { key: '2026-06-16', tick: '16 Jun', name: 'Week of 16 June' },
  { key: '2026-06-23', tick: '23 Jun', name: 'Week of 23 June' },
  { key: '2026-06-30', tick: '30 Jun', name: 'Week of 30 June' },
  { key: '2026-07-07', tick: '7 Jul', name: 'Week of 7 July' },
  { key: '2026-07-14', tick: '14 Jul', name: 'Week of 14 July' },
  { key: '2026-07-21', tick: '21 Jul', name: 'Week of 21 July' },
];

const ORDERS = [
  { key: 'web', label: 'Web', values: [318, 342, 356, 331, 364, 389, 402, 377] },
  { key: 'phone', label: 'Phone', values: [142, 128, 151, 166, 158, 147, 171, 180] },
  { key: 'store', label: 'In store', values: [96, 88, 81, 92, 104, 99, 86, 94] },
];

/**
 * The title names the chart inside, so the chart needs no `aria-label` of its own. The switch
 * beside it shows the same numbers as a table, which keeps the chart's height and scrolls its
 * rows under the header; `placeLabel` names the weeks' column. The table loads the first time
 * it's asked for.
 */
export function ChartFrameTable() {
  return (
    <ChartFrame
      title="Orders"
      description="By channel, the last 8 weeks"
      className="w-full max-w-2xl"
    >
      <BarChart places={WEEKS} series={ORDERS} placeLabel="Week" />
    </ChartFrame>
  );
}
