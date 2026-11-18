'use client';

import { ChartFrame, SegmentedBar } from '@windmorph/react-pro/charts';

const VISITS = [
  { key: 'phone', label: 'Phone', value: 5120 },
  { key: 'desktop', label: 'Desktop', value: 2980 },
  { key: 'tablet', label: 'Tablet', value: 610 },
];

/**
 * A segmented bar gives its frame its parts, amounts and shares. Here the frame starts on its
 * table (`defaultShowTable`), and in a column narrower than 600px the table is a list of
 * figures, one row per part. Press the switch to go back to the bar.
 */
export function ChartFrameNarrow() {
  return (
    <ChartFrame
      title="Visits by device"
      description="This month"
      variant="outlined"
      defaultShowTable
      minHeight={160}
      className="w-full max-w-xs"
    >
      <SegmentedBar parts={VISITS} />
    </ChartFrame>
  );
}
