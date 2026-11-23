'use client';

import {
  BarChart,
  ChartFrame,
  ChartLegend,
  chartColor,
  type ChartLegendItem,
  type ChartPlace,
  type ChartSeries,
} from '@windmorph/react-pro/charts';
import { useState } from 'react';

const MONTHS: ChartPlace[] = [
  { key: '2026-01', tick: 'Jan', name: 'January 2026' },
  { key: '2026-02', tick: 'Feb', name: 'February 2026' },
  { key: '2026-03', tick: 'Mar', name: 'March 2026' },
  { key: '2026-04', tick: 'Apr', name: 'April 2026' },
  { key: '2026-05', tick: 'May', name: 'May 2026' },
  { key: '2026-06', tick: 'Jun', name: 'June 2026' },
];

/** Each channel pinned to a colour slot, so it is the same colour in both charts. */
const CHANNELS = [
  { key: 'web', label: 'Web', slot: 1 },
  { key: 'phone', label: 'Phone', slot: 2 },
  { key: 'store', label: 'In store', slot: 3 },
] as const;

type Channel = (typeof CHANNELS)[number]['key'];

const seriesOf = (orders: Record<Channel, number[]>): ChartSeries[] =>
  CHANNELS.map((channel) => ({ ...channel, values: orders[channel.key] }));

const NORTH = seriesOf({
  web: [410, 432, 468, 455, 490, 512],
  phone: [120, 114, 131, 126, 118, 135],
  store: [240, 226, 251, 262, 270, 288],
});

const SOUTH = seriesOf({
  web: [298, 315, 330, 342, 361, 377],
  phone: [96, 102, 99, 108, 112, 105],
  store: [180, 172, 194, 201, 188, 210],
});

/**
 * The legend's keys take the slots' colours with `chartColor` and their patterns with `slot`,
 * as the charts draw them.
 */
const LEGEND: ChartLegendItem[] = CHANNELS.map((channel) => ({
  key: channel.key,
  label: channel.label,
  color: chartColor(channel.slot),
  slot: channel.slot,
}));

/**
 * Two shops' orders under one legend of the app's own. Each chart leaves its own legend out
 * (`legend={false}`) and takes the hidden channels from the shared one (`hiddenSeries`), so a
 * chip hides a channel in both. The last channel shown can't be hidden.
 */
export function BarChartSharedLegend() {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div className="flex w-full flex-col gap-4">
      <ChartLegend
        items={LEGEND}
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
        labels={{ legend: 'Channels' }}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartFrame title="North shop" description="Orders each month">
          <BarChart
            places={MONTHS}
            series={NORTH}
            hiddenSeries={hidden}
            legend={false}
            placeLabel="Month"
          />
        </ChartFrame>
        <ChartFrame title="South shop" description="Orders each month">
          <BarChart
            places={MONTHS}
            series={SOUTH}
            hiddenSeries={hidden}
            legend={false}
            placeLabel="Month"
          />
        </ChartFrame>
      </div>
    </div>
  );
}
