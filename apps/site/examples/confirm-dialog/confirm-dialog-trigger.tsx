'use client';

import { Button, DialogTrigger } from '@windmorph/react';
import { ConfirmDialog } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * Inside a `DialogTrigger`, with no state of its own: the button opens it, and an action
 * that returns nothing closes it at once.
 */
export function ConfirmDialogTrigger() {
  const [signedOut, setSignedOut] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <DialogTrigger>
        <Button variant="text">Sign out everywhere</Button>
        <ConfirmDialog
          title="Sign out everywhere?"
          description="You'll need to sign in again on every device."
          confirmLabel="Sign out"
          onConfirm={() => setSignedOut(true)}
        />
      </DialogTrigger>
      <p role="status" className="min-h-5 text-body-medium text-on-surface-variant">
        {signedOut ? 'Signed out on every device.' : ''}
      </p>
    </div>
  );
}
