'use client';

import { BottomSheet, Button, type BottomSheetDetent } from '@windmorph/react';
import { useState } from 'react';

/**
 * A standard bottom sheet can open fully raised and collapse to its peek: `detent` and
 * `onDetentChange` let the page raise and lower it too, while the handle (a press, Enter or
 * Space, or a drag), Escape and the collapse button still move it. Leave out `detent` and
 * set `defaultDetent="expanded"` for an uncontrolled sheet that opens raised.
 */
export function SheetBottomDetents() {
  const [detent, setDetent] = useState<BottomSheetDetent>('expanded');
  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div className="flex flex-col items-start gap-4 p-6">
        <p className="text-body-large text-on-surface">Route to Riverside Park</p>
        <Button
          variant="tonal"
          onPress={() => setDetent(detent === 'expanded' ? 'collapsed' : 'expanded')}
        >
          {detent === 'expanded' ? 'Show the map' : 'Show directions'}
        </Button>
      </div>
      <BottomSheet
        variant="standard"
        aria-label="Directions"
        detent={detent}
        onDetentChange={setDetent}
        classNames={{ container: 'absolute' }}
      >
        <div className="flex flex-col gap-2 px-6 pb-6">
          <p className="text-title-medium text-on-surface">12 min · 1.1 km</p>
          <ol className="flex list-decimal flex-col gap-1 ps-5 text-body-medium text-on-surface-variant">
            <li>Head north on Mill Lane</li>
            <li>Turn right onto Station Road</li>
            <li>Cross the footbridge</li>
            <li>The park entrance is on your left</li>
          </ol>
        </div>
      </BottomSheet>
    </div>
  );
}
