'use client';

import { LoadMore, type LoadMoreStatus } from '@windmorph/react-pro';
import { useState } from 'react';

const PAGE = 5;
const TOTAL = 15;

/** A list a page at a time; the third page fails once, to show Retry. */
export function LoadMoreList() {
  const [count, setCount] = useState(PAGE);
  const [status, setStatus] = useState<LoadMoreStatus>('idle');
  const [failed, setFailed] = useState(false);
  const load = () => {
    setStatus('loading');
    setTimeout(() => {
      if (count === PAGE * 2 && !failed) {
        setFailed(true);
        setStatus('error');
        return;
      }
      const next = count + PAGE;
      setCount(next);
      setStatus(next >= TOTAL ? 'done' : 'idle');
    }, 800);
  };
  return (
    <div className="flex h-80 w-full max-w-sm flex-col overflow-y-auto rounded-corner-medium bg-surface-container-low p-2">
      <ul className="flex flex-col gap-2">
        {Array.from({ length: count }, (_, index) => (
          <li
            key={index}
            className="rounded-corner-small bg-surface-container-high p-3 text-body-medium text-on-surface"
          >
            Item {index + 1}
          </li>
        ))}
      </ul>
      <LoadMore
        status={status}
        onLoadMore={load}
        end={<p className="text-body-small text-on-surface-variant">That's everything</p>}
      />
    </div>
  );
}
