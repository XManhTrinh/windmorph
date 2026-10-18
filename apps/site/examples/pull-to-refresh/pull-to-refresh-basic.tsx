'use client';

import { Card, PullToRefresh } from '@windmorph/react';
import { useState } from 'react';

const STORIES = [
  'Rain moves in after noon',
  'Night market opens Friday',
  'New bus route to the coast',
];

/**
 * The shortest setup: `onRefresh` returns a promise, and without a `refreshing` prop the
 * indicator stays until it settles. Give the area a height and `overflow-y-auto`, so it is the
 * scroll container. At the top, drag down (touch, or a mouse) past the threshold and let go.
 */
export function PullToRefreshBasic() {
  const [updated, setUpdated] = useState(0);
  return (
    <PullToRefresh
      onRefresh={() =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            setUpdated((count) => count + 1);
            resolve();
          }, 1500),
        )
      }
      role="region"
      aria-label="News"
      // A scrolling area needs keyboard access.
      tabIndex={0}
      className="h-[320px] w-full max-w-[412px] overflow-y-auto rounded-corner-large bg-surface-container-low outline-offset-2 focus-visible:outline-2 focus-visible:outline-secondary"
    >
      <div className="flex flex-col gap-3 p-4">
        <p className="text-label-large text-on-surface-variant">Refreshed {updated} times</p>
        {STORIES.map((story) => (
          <Card key={story} variant="outlined" className="p-4">
            <p className="text-title-medium">{story}</p>
          </Card>
        ))}
      </div>
    </PullToRefresh>
  );
}
