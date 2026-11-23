'use client';

import { SegmentedBar } from '@windmorph/react-pro/charts';

const VISITS = [
  { key: 'phone', label: 'Phone', value: 5120 },
  { key: 'desktop', label: 'Desktop', value: 2980 },
  { key: 'tablet', label: 'Tablet', value: 610 },
];

/** Largest first, so the smallest are the ones that fold into "Other". */
const SIGN_UPS = [
  { key: 'search', label: 'Search', value: 1840 },
  { key: 'direct', label: 'Direct', value: 1210 },
  { key: 'email', label: 'Email', value: 760 },
  { key: 'referral', label: 'Referral', value: 520 },
  { key: 'ads', label: 'Ads', value: 310 },
  { key: 'events', label: 'Events', value: 90 },
  { key: 'print', label: 'Print', value: 40 },
];

/**
 * Each part is a block as wide as its share, printing its share where it has room, with a key
 * below. Seven parts are more than colour can tell apart, so the sixth and seventh fold into one
 * quiet, dotted "Other". With two or more parts, each part and its key carry a pattern by
 * default, for anyone who doesn't tell the colours apart (`texture={false}` turns them off).
 * Rest the pointer on a part, or tab to a bar and use the arrow keys, to read it.
 */
export function SegmentedBarParts() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-8">
      <SegmentedBar aria-label="Visits by device" parts={VISITS} />
      <SegmentedBar aria-label="Sign-ups by source" parts={SIGN_UPS} />
    </div>
  );
}
