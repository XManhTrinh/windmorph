'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@windmorph/react';

/**
 * Beyond the `placement` presets, `classNames.positioner` aligns a basic dialog anywhere on
 * the window (the spec's custom positioning), here in the top end corner, near the controls
 * that opened it. The positioner's padding still keeps the dialog 24px from the edges on
 * compact windows and 56px on wider ones.
 */
export function DialogCustomPosition() {
  return (
    <DialogTrigger>
      <Button variant="outlined">Sync settings</Button>
      <Dialog classNames={{ positioner: 'items-start justify-end' }}>
        {({ close }) => (
          <>
            <DialogTitle>Sync across devices?</DialogTitle>
            <DialogContent>
              Your theme and layout will match on every device where you sign in.
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Not now
              </Button>
              <Button variant="text" onPress={close}>
                Sync
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
