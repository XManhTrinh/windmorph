'use client';

import { useLocale } from '@windmorph/react';
import {
  BarChart,
  ChartFrame,
  type ChartPlace,
  type ChartSeries,
} from '@windmorph/react-pro/charts';
import { useMemo } from 'react';

const MONTHS: ChartPlace[] = [
  { key: '2026-01', tick: 'Jan', name: 'January 2026' },
  { key: '2026-02', tick: 'Feb', name: 'February 2026' },
  { key: '2026-03', tick: 'Mar', name: 'March 2026' },
  { key: '2026-04', tick: 'Apr', name: 'April 2026' },
  { key: '2026-05', tick: 'May', name: 'May 2026' },
  { key: '2026-06', tick: 'Jun', name: 'June 2026' },
];

/** What came in, above nought, and what went out, below it. */
const MONEY: ChartSeries[] = [
  { key: 'in', label: 'Money in', values: [4200, 3900, 4600, 5100, 4800, 5300] },
  { key: 'out', label: 'Money out', values: [-3600, -4100, -3800, -4500, -5200, -4400] },
];

/**
 * A part below nought stacks down from a nought line, so each month's total is what the bars
 * draw: 4,200 in and 3,600 out make 600, and a month that spent more than came in has a total
 * below nought. `formatValue` writes the readout's, the table's and the value text's figures,
 * `formatAxis` the side labels, both in the page's locale.
 */
export function BarChartBelowNought() {
  const { locale } = useLocale();
  const formats = useMemo(() => {
    const full = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    });
    const compact = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
    });
    return {
      value: (amount: number) => full.format(amount),
      axis: (amount: number) => compact.format(amount),
    };
  }, [locale]);
  return (
    <ChartFrame
      title="Money in and out"
      description="Each month, in euros; the total is the difference"
      className="w-full"
    >
      <BarChart
        places={MONTHS}
        series={MONEY}
        formatValue={formats.value}
        formatAxis={formats.axis}
        placeLabel="Month"
      />
    </ChartFrame>
  );
}
