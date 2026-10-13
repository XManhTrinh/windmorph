'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';

const PLACEMENTS = ['top', 'bottom', 'start', 'end'] as const;

/**
 * Basic dialogs sit in the centre by default; `placement` moves one against a side of the
 * window, for a more ergonomic spot on large screens (the spec's custom positioning). It
 * keeps 24px from the edges on compact windows and 56px on wider ones.
 */
export function DialogPlacement() {
  return (
    <div className="flex flex-wrap gap-2">
      {PLACEMENTS.map((placement) => (
        <DialogTrigger key={placement}>
          <Button variant="outlined">{placement}</Button>
          <Dialog placement={placement}>
            {({ close }) => (
              <>
                <DialogTitle>Keep notifications on?</DialogTitle>
                <DialogContent>You&apos;ll hear about replies and new followers.</DialogContent>
                <DialogActions>
                  <Button variant="text" onPress={close}>
                    Turn off
                  </Button>
                  <Button variant="text" onPress={close}>
                    Keep on
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </DialogTrigger>
      ))}
    </div>
  );
}
