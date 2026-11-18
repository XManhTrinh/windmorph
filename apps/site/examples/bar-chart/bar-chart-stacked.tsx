'use client';

import { Button, ButtonGroup } from '@windmorph/react';
import {
  BarChart,
  ChartFrame,
  type ChartPlace,
  type ChartSeries,
} from '@windmorph/react-pro/charts';
import { useMemo, useState } from 'react';

/** Twelve weeks, oldest first. A week keeps its `key` whichever period shows it. */
const WEEKS: ChartPlace[] = [
  { key: '2026-06-01', tick: '1 Jun', name: 'Week of 1 June' },
  { key: '2026-06-08', tick: '8 Jun', name: 'Week of 8 June' },
  { key: '2026-06-15', tick: '15 Jun', name: 'Week of 15 June' },
  { key: '2026-06-22', tick: '22 Jun', name: 'Week of 22 June' },
  { key: '2026-06-29', tick: '29 Jun', name: 'Week of 29 June' },
  { key: '2026-07-06', tick: '6 Jul', name: 'Week of 6 July' },
  { key: '2026-07-13', tick: '13 Jul', name: 'Week of 13 July' },
  { key: '2026-07-20', tick: '20 Jul', name: 'Week of 20 July' },
  { key: '2026-07-27', tick: '27 Jul', name: 'Week of 27 July' },
  { key: '2026-08-03', tick: '3 Aug', name: 'Week of 3 August' },
  { key: '2026-08-10', tick: '10 Aug', name: 'Week of 10 August' },
  { key: '2026-08-17', tick: '17 Aug', name: 'Week of 17 August' },
];

/** Each channel's orders, one value for each of the twelve weeks. */
const CHANNELS: ChartSeries[] = [
  {
    key: 'web',
    label: 'Web',
    values: [312, 334, 351, 340, 368, 392, 377, 405, 421, 398, 436, 452],
  },
  {
    key: 'phone',
    label: 'Phone',
    values: [146, 139, 152, 160, 148, 155, 163, 151, 158, 166, 149, 157],
  },
  { key: 'store', label: 'In store', values: [88, 95, 102, 97, 91, 84, 79, 86, 93, 99, 104, 96] },
];

/**
 * Orders by channel, stacked into each week's total: the readout, the value text and the table
 * view add a Total. Switching the period keeps the weeks both periods share (same `key`), so
 * their bars slide to their new places while the others grow from nought or shrink away. The
 * period switch is the app's own, a connected button group.
 */
export function BarChartStacked() {
  const [period, setPeriod] = useState(new Set(['12']));
  const count = period.has('6') ? 6 : 12;
  const places = useMemo(() => WEEKS.slice(-count), [count]);
  const series = useMemo(
    () => CHANNELS.map((channel) => ({ ...channel, values: channel.values.slice(-count) })),
    [count],
  );
  return (
    <div className="flex w-full flex-col gap-4">
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        deselectable={false}
        selectedKeys={period}
        onSelectionChange={setPeriod}
        aria-label="Period"
        className="max-w-xs"
      >
        <Button toggle value="6">
          6 weeks
        </Button>
        <Button toggle value="12">
          12 weeks
        </Button>
      </ButtonGroup>
      <ChartFrame title="Orders" description="By channel, each week">
        <BarChart places={places} series={series} placeLabel="Week" />
      </ChartFrame>
    </div>
  );
}
