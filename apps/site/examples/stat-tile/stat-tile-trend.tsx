'use client';

import { Button, Card, useLocale } from '@windmorph/react';
import { Sparkline, StatTile } from '@windmorph/react-pro/charts';
import { useMemo, useState } from 'react';

/** Two periods of twelve weeks, oldest week first. */
const PERIODS = {
  recent: {
    orders: [212, 240, 231, 260, 298, 287, 310, 342, 330, 365, 401, 420],
    visits: [5.1, 5.4, 5.2, 5.8, 6.1, 6.0, 6.4, 6.3, 6.9, 7.2, 7.1, 7.6],
  },
  earlier: {
    orders: [260, 251, 244, 238, 241, 229, 222, 230, 218, 214, 212, 205],
    visits: [6.2, 6.0, 5.9, 5.7, 5.8, 5.5, 5.4, 5.5, 5.2, 5.3, 5.0, 5.1],
  },
};

/** The change from the week before to the last week, as a share of the week before. */
const change = (weeks: number[]) => {
  const [before, last] = weeks.slice(-2) as [number, number];
  return Math.abs(last - before) / before;
};

/**
 * A new period: the number springs from the one showing to the new one, and each trend
 * moves to its new shape. A `Sparkline` on its own, beside the words it stands for, is named
 * with `aria-label` (what it shows and which way it goes), and becomes an image for screen
 * readers; inside a tile it is decorative.
 */
export function StatTileTrend() {
  const [period, setPeriod] = useState<keyof typeof PERIODS>('recent');
  // A whole percentage in the page's locale ("5%", "5 %", "%5").
  const { locale } = useLocale();
  const percent = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }),
    [locale],
  );
  const { orders, visits } = PERIODS[period];
  const rising = orders.at(-1)! >= orders.at(-2)!;
  const visitsWay = visits.at(-1)! >= visits[0]! ? 'rising' : 'falling';
  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4">
      <Card variant="outlined" className="flex w-full flex-col gap-6 p-4">
        <StatTile
          label="Orders last week"
          value={orders.at(-1)!}
          change={{
            direction: rising ? 'up' : 'down',
            tone: rising ? 'good' : 'bad',
            value: percent.format(change(orders)),
            context: 'on the week before',
          }}
          trend={orders}
        />
        <div className="flex items-center gap-4">
          <span className="flex-1 text-body-large text-on-surface">Visits, thousands</span>
          <Sparkline
            values={visits}
            aria-label={`Visits over twelve weeks, ${visitsWay}`}
            className="w-24"
          />
        </div>
      </Card>
      <Button variant="tonal" onPress={() => setPeriod(period === 'recent' ? 'earlier' : 'recent')}>
        {period === 'recent' ? 'Show the twelve weeks before' : 'Show the last twelve weeks'}
      </Button>
    </div>
  );
}
