'use client';

import { Link } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * Text that does something instead of going somewhere: `onPress` and no `href` renders a
 * `<button>` with the link's look, here "3 others" showing everyone tagged in a post.
 */
export function LinkButton() {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-body-medium text-on-surface">
        <span className="text-title-small">Alex Kim</span> is with{' '}
        <Link variant="standalone" color="inherit" href="#demo-sam" className="text-title-small">
          Sam Lee
        </Link>{' '}
        and{' '}
        <Link
          variant="standalone"
          color="inherit"
          onPress={() => setShown((open) => !open)}
          className="text-title-small"
        >
          3 others
        </Link>
      </p>
      {shown ? (
        <p className="text-body-small text-on-surface-variant">
          Jordan Park, Riley Chen and Casey Novak
        </p>
      ) : null}
    </div>
  );
}
