'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Switch,
} from '@windmorph/react';
import { useState } from 'react';

/**
 * The dialog enters with the M3 dialog motion: it slides down 50px while its container grows
 * from its top edge, then the headline and supporting text fade in, then the actions. It
 * leaves by fading its parts, sliding back up and shrinking. `onOpened` and `onClosed` fire
 * once each motion has finished, for work that should wait for it (moving focus elsewhere,
 * loading content, logging). `instant` turns the motion off.
 */
export function DialogMotion() {
  const [instant, setInstant] = useState(false);
  const [status, setStatus] = useState('Closed');
  return (
    <div className="flex flex-col items-start gap-4">
      <Switch checked={instant} onCheckedChange={setInstant}>
        Instant (no motion)
      </Switch>
      <DialogTrigger onOpenChange={(open) => setStatus(open ? 'Opening…' : 'Closing…')}>
        <Button variant="tonal">Open dialog</Button>
        <Dialog
          instant={instant}
          onOpened={() => setStatus('Opened')}
          onClosed={() => setStatus('Closed')}
        >
          {({ close }) => (
            <>
              <DialogTitle>Turn on backup?</DialogTitle>
              <DialogContent>
                Photos and videos from this device will be backed up to your account.
              </DialogContent>
              <DialogActions>
                <Button variant="text" onPress={close}>
                  Not now
                </Button>
                <Button variant="text" onPress={close}>
                  Turn on
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </DialogTrigger>
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
