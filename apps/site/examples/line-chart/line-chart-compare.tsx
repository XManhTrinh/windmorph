'use client';

import {
  ChartFrame,
  LineChart,
  type ChartPlace,
  type ChartSeries,
} from '@windmorph/react-pro/charts';

/** Twelve weeks, oldest first: a short `tick` for the axis, a full `name` for everything else. */
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

const SIGN_UPS: ChartSeries[] = [
  {
    key: 'this-year',
    label: 'This year',
    values: [1180, 1240, 1310, 1290, 1420, 1510, 1480, 1560, 1630, 1590, 1710, 1780],
  },
  {
    key: 'last-year',
    label: 'Last year',
    values: [980, 1010, 1060, 1040, 1120, 1150, 1130, 1190, 1210, 1180, 1260, 1290],
  },
];

/**
 * This year's weekly sign-ups, the subject with a wash under its line, against the same weeks
 * last year. In a `ChartFrame` the title names the chart and the switch shows the same numbers
 * as a table, its first column named by `placeLabel`. Point at a week, tap it, or Tab to the
 * chart and use the arrow keys; the legend's chips hide and show a line.
 */
export function LineChartCompare() {
  return (
    <ChartFrame
      title="Sign-ups"
      description="Each week, this year against the same weeks last year"
      className="w-full"
    >
      <LineChart places={WEEKS} series={SIGN_UPS} subject="this-year" placeLabel="Week" />
    </ChartFrame>
  );
}
