'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  TextField,
} from '@windmorph/react';

/**
 * A full-screen dialog on compact windows and a basic dialog on larger ones
 * (`fullScreen="compact"`, the M3 recommendation). `DialogHeader` holds the close button,
 * the headline and the confirming action in full screen; `DialogActions` take over on
 * larger windows. Narrow the window below 600px to see it fill the screen.
 */
export function DialogFullScreen() {
  return (
    <DialogTrigger>
      <Button variant="tonal">Edit name</Button>
      <Dialog fullScreen="compact">
        {({ close }) => (
          <>
            <DialogHeader
              action={
                <Button variant="text" onPress={close}>
                  Save
                </Button>
              }
            >
              Edit name
            </DialogHeader>
            <DialogContent>
              <TextField
                label="Name"
                defaultValue="Sam Taylor"
                autoComplete="name"
                className="w-full"
              />
            </DialogContent>
            <DialogActions>
              <Button variant="text" onPress={close}>
                Cancel
              </Button>
              <Button variant="text" onPress={close}>
                Save
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DialogTrigger>
  );
}
