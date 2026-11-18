'use client';

import { IconButton } from '@windmorph/react';
import { ChartFrame, LineChart } from '@windmorph/react-pro/charts';
import { useEffect, useMemo, useState } from 'react';
import { PauseIcon, PlayArrowIcon } from '../../components/icons';

/** How many minutes the chart shows. */
const WINDOW = 15;

/** `10:04` for the minute `minute` minutes after 10:00. */
const clock = (minute: number) =>
  `${String((10 + Math.floor(minute / 60)) % 24).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

/** A made-up but repeatable figure for each minute, so the server and the browser agree. */
const visitorsAt = (minute: number) =>
  Math.round(120 + 30 * Math.sin(minute / 4) + ((minute * 37) % 17));

/**
 * The last 15 minutes of visitors, with a new minute every two seconds (sped up for this page).
 * Each minute keeps its `key`, so as the window moves on the kept points slide along and the
 * oldest slides off the start, rather than the line being redrawn. A chart that updates by
 * itself needs a way to pause it.
 */
export function LineChartLive() {
  const [latest, setLatest] = useState(WINDOW - 1);
  const [running, setRunning] = useState(true);
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
        tick: clock(minute),
        name: `${clock(minute)} to ${clock(minute + 1)}`,
      })),
    [minutes],
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
