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
 * `transition="scale"` swaps the M3 dialog motion for the library's original pop: the dialog
 * fades in while it scales up from 90%, and fades out while it scales to 95%, with no clip,
 * slide or staggered parts. It scales from the centre, or from the edge a `placement` puts it
 * against. Reduced motion keeps only the fades, and `instant` turns the motion off either way.
 */
export function DialogScale() {
  return (
    <DialogTrigger>
      <Button variant="tonal">Open dialog</Button>
      <Dialog transition="scale">
        {({ close }) => (
          <>
            <DialogTitle>Leave this group?</DialogTitle>
            <DialogContent>
              You won&apos;t see new messages unless someone adds you back.
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Stay
              </Button>
              <Button variant="text" onPress={close}>
                Leave
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
