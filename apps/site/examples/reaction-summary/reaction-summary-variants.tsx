'use client';

import { ReactionSummary } from '@windmorph/react-pro';
import { useState } from 'react';

const TOP = [
  { id: 'love', icon: '❤️' },
  { id: 'like', icon: '👍' },
  { id: 'wow', icon: '😮' },
];

/** Under a post (`stacked`, opening who reacted) and at the end of a comment's row (`chip`). */
export function ReactionSummaryVariants() {
  const [opened, setOpened] = useState(0);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <ReactionSummary
        items={TOP}
        total={1284}
        onPress={() => setOpened((count) => count + 1)}
        labels={{ count: (total) => `${total} reactions. See who reacted` }}
      />
      <p className="text-body-small text-on-surface-variant" aria-live="polite">
        {opened > 0 ? `Opened the list ${opened} time${opened === 1 ? '' : 's'}` : ''}
      </p>
      <ReactionSummary variant="chip" size="sm" items={TOP} total={12} />
      <ReactionSummary variant="chip" size="sm" items={TOP.slice(1, 2)} total={1} />
    </div>
  );
}
