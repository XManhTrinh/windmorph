'use client';

import { IconButton, useLocale } from '@windmorph/react';
import { ChartFrame, LineChart } from '@windmorph/react-pro/charts';
import { useEffect, useMemo, useState } from 'react';
import { PauseIcon, PlayArrowIcon } from '../../components/icons';

/** How many minutes the chart shows. */
const WINDOW = 15;

/**
 * The time `minute` minutes after 10:00 on a fixed day, in UTC, so the server and the browser
 * write the same time.
 */
const timeAt = (minute: number) => Date.UTC(2026, 0, 1, 10, minute);

/**
 * The text with its thin and narrow no-break spaces made plain. The server's and the
 * browser's date formatting can space a range differently ("10:14\u2009–\u200910:15"), and
 * the page would then not hydrate.
 */
const plainSpaces = (text: string) => text.replace(/[\u2009\u202f]/g, ' ');

/** A made-up but repeatable figure for each minute, so the server and the browser agree. */
const visitorsAt = (minute: number) =>
  Math.round(120 + 30 * Math.sin(minute / 4) + ((minute * 37) % 17));

/**
 * The last 15 minutes of visitors, with a new minute every two seconds (sped up for this page).
 * Each minute keeps its `key`, so as the window moves on the kept points slide along and the
 * oldest slides off the start, rather than the line being redrawn. A chart that updates by
 * itself needs a way to pause it. The times are written in the page's locale, and each minute's
 * name is a range ("10:04 – 10:05 AM" in American English).
 */
export function LineChartLive() {
  const [latest, setLatest] = useState(WINDOW - 1);
  const [running, setRunning] = useState(true);
  const { locale } = useLocale();
  const time = useMemo(
    () => new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }),
    [locale],
  );
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setLatest((minute) => minute + 1), 2000);
    return () => clearInterval(timer);
  }, [running]);
  const minutes = useMemo(
    () => Array.from({ length: WINDOW }, (_, index) => latest - WINDOW + 1 + index),
    [latest],
  );
  const places = useMemo(
    () =>
      minutes.map((minute) => ({
        key: String(minute),
        tick: plainSpaces(time.format(timeAt(minute))),
        name: plainSpaces(time.formatRange(timeAt(minute), timeAt(minute + 1))),
      })),
    [minutes, time],
  );
  const series = useMemo(
    () => [{ key: 'visitors', label: 'Visitors', values: minutes.map(visitorsAt) }],
    [minutes],
  );
  return (
    <ChartFrame
      title="Visitors"
      description="Each minute, over the last 15 minutes"
      actions={
        <IconButton
          icon={running ? <PauseIcon /> : <PlayArrowIcon />}
          aria-label={running ? 'Pause updates' : 'Resume updates'}
          onPress={() => setRunning((value) => !value)}
        />
      }
      className="w-full"
    >
      <LineChart places={places} series={series} placeLabel="Minute" />
    </ChartFrame>
  );
}
