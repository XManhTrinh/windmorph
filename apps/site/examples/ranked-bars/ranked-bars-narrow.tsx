'use client';

import { RankedBars } from '@windmorph/react-pro/charts';

const QUESTIONS = [
  { key: 'address', label: 'How do I change my delivery address?', value: 318 },
  { key: 'refund', label: 'When will my refund arrive?', value: 274 },
  { key: 'password', label: 'I forgot my password', value: 191 },
  { key: 'invoice', label: 'Where can I find an invoice for an order?', value: 126 },
  { key: 'other', label: 'Other questions', value: 210, rest: true },
];

/**
 * Under 18rem of its own width, each name takes a line with its amount at the end, and the bar
 * runs the whole width under it. A long name wraps and is never cut.
 */
export function RankedBarsNarrow() {
  return (
    <div className="w-full max-w-[260px]">
      <RankedBars aria-label="Questions asked most this week" rows={QUESTIONS} />
    </div>
  );
}
