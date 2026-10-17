'use client';

import { LoadMore, Skeleton, SkeletonGroup, type LoadMoreStatus } from '@windmorph/react-pro';
import { useState } from 'react';

const DISHES = ['Phở', 'Bánh mì', 'Bún chả', 'Gỏi cuốn', 'Crème brûlée', 'Apple strudel'];
const PAGE = 2;

/**
 * With `auto` the next page loads by itself as the end of the list scrolls
 * near (`rootMargin` ahead of the viewport): here as soon as it's on screen. `loading`
 * shows a skeleton of one item while a page loads, and `end` a line once everything is in.
 * Load more stays as the keyboard and screen reader fallback.
 */
export function LoadMoreAuto() {
  const [count, setCount] = useState(PAGE);
  const [status, setStatus] = useState<LoadMoreStatus>('idle');
  const load = () => {
    setStatus('loading');
    setTimeout(() => {
      const next = count + PAGE;
      setCount(next);
      setStatus(next >= DISHES.length ? 'done' : 'idle');
    }, 1200);
  };
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {DISHES.slice(0, count).map((dish) => (
          <li
            key={dish}
            className="rounded-corner-small bg-surface-container-high p-3 text-body-medium text-on-surface"
          >
            {dish}
          </li>
        ))}
      </ul>
      <LoadMore
        status={status}
        onLoadMore={load}
        auto
        rootMargin="0px"
        loading={
          <SkeletonGroup label="Loading more dishes">
            <Skeleton className="h-11" corner="small" />
          </SkeletonGroup>
        }
        end={<p className="text-body-small text-on-surface-variant">That&apos;s every dish</p>}
      />
    </div>
  );
}
