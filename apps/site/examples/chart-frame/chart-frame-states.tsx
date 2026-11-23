'use client';

import { Button } from '@windmorph/react';
import { ChartFrame, SegmentedBar, type ChartPart } from '@windmorph/react-pro/charts';
import { useEffect, useRef, useState } from 'react';

/** Nothing came back for this period. */
const RETURNS: ChartPart[] = [];

const ORDERS = [
  { key: 'web', label: 'Web', value: 620 },
  { key: 'phone', label: 'Phone', value: 240 },
  { key: 'store', label: 'In store', value: 150 },
];

const NEWER = [
  { key: 'web', label: 'Web', value: 540 },
  { key: 'phone', label: 'Phone', value: 310 },
  { key: 'store', label: 'In store', value: 170 },
];

/** Runs `then` after `ms`, cancelling the one before; cleared as the example goes. */
function useLater() {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (ms: number, then: () => void) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(then, ms);
  };
}

/**
 * The title stays in every state. `empty` says there's nothing to draw; `loading` holds a
 * placeholder before the first picture; `error` shows a message, with Try again when you pass
 * `onRetry` (here it loads, then shows the chart). `pending` keeps the last picture while new
 * numbers load, its colours dimmed and its figures readable: press Refresh.
 */
export function ChartFrameStates() {
  const [failed, setFailed] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [pending, setPending] = useState(false);
  const [newer, setNewer] = useState(false);
  const retryLater = useLater();
  const refreshLater = useLater();
  return (
    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
      <ChartFrame
        title="Returns"
        empty={RETURNS.length === 0 ? 'No returns this month' : undefined}
        minHeight={140}
      >
        <SegmentedBar parts={RETURNS} />
      </ChartFrame>
      <ChartFrame title="Visits by device" loading minHeight={140} />
      <ChartFrame
        title="Sign-ups by source"
        minHeight={140}
        loading={retrying}
        error={failed ? "The sign-ups couldn't be loaded." : undefined}
        onRetry={() => {
          setFailed(false);
          setRetrying(true);
          retryLater(1500, () => setRetrying(false));
        }}
      >
        <SegmentedBar
          parts={[
            { key: 'search', label: 'Search', value: 1840 },
            { key: 'direct', label: 'Direct', value: 1210 },
            { key: 'email', label: 'Email', value: 760 },
          ]}
        />
      </ChartFrame>
      <ChartFrame
        title="Orders by channel"
        minHeight={140}
        pending={pending}
        actions={
          <Button
            variant="text"
            onPress={() => {
              setPending(true);
              refreshLater(1500, () => {
                setNewer((value) => !value);
                setPending(false);
              });
            }}
          >
            Refresh
          </Button>
        }
      >
        <SegmentedBar parts={newer ? NEWER : ORDERS} />
      </ChartFrame>
    </div>
  );
}
