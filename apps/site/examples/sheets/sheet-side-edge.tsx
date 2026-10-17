'use client';

import { Button, SideSheet } from '@windmorph/react';
import { useState } from 'react';

/**
 * `edge="start"` anchors a side sheet to the start edge (the left in a left-to-right page,
 * the right in RTL); the default `end` is the other side, as M3 usually places it. On a touch
 * screen a swipe toward the sheet's edge closes it, past half its width or on a fling. Here
 * the app keeps the sheet open while a filter changed and isn't applied yet: it leaves `open`
 * true, so a swipe, Escape or a press on the scrim springs back, and it says why.
 */
export function SheetSideEdge() {
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [warning, setWarning] = useState(false);
  // Applying or discarding settles the change, then closes the sheet.
  const settle = () => {
    setDirty(false);
    setWarning(false);
    setOpen(false);
  };
  return (
    <div className="flex flex-col items-start gap-2">
      <Button onPress={() => setOpen(true)}>Open filters</Button>
      <SideSheet
        title="Filters"
        edge="start"
        open={open}
        onOpenChange={(next) => {
          if (next || !dirty) {
            setOpen(next);
            setWarning(false);
          } else {
            setWarning(true);
          }
        }}
        footer={
          <>
            <Button onPress={settle}>Apply</Button>
            <Button variant="outlined" onPress={settle}>
              Discard
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-start gap-3">
          <Button variant="tonal" onPress={() => setDirty(true)}>
            Only shared with me
          </Button>
          <p className="text-body-medium text-on-surface-variant" role="status">
            {warning ? 'Apply or discard your changes first.' : dirty ? 'Not applied yet.' : ''}
          </p>
        </div>
      </SideSheet>
    </div>
  );
}
