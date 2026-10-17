'use client';

import { BottomSheet, Button } from '@windmorph/react';
import { useState } from 'react';

/**
 * A standard bottom sheet sits over the page without a scrim, so both stay usable. It
 * rests collapsed at `peekHeight` (56px by default); press or drag the handle to expand
 * it. It is `fixed` to the window by default; here `classNames.container` places it in a
 * bounded region so the demo stays inside the article.
 */
export function SheetBottomStandard() {
  const [count, setCount] = useState(0);
  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div className="flex flex-col items-start gap-4 p-6">
        <p className="text-body-large text-on-surface">Main content</p>
        <Button variant="tonal" onPress={() => setCount((c) => c + 1)}>
          {`Pressed ${count}`}
        </Button>
      </div>
      <BottomSheet
        variant="standard"
        aria-label="Now playing"
        classNames={{ container: 'absolute' }}
      >
        <div className="flex flex-col gap-2 px-6 pb-6">
          <p className="text-title-medium text-on-surface">Now playing</p>
          <p className="text-body-medium text-on-surface-variant">
            Track details and controls stay at hand while the page scrolls.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}
