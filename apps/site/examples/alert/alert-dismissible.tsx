'use client';

import { Button } from '@windmorph/react';
import { Alert } from '@windmorph/react-pro';
import { useState } from 'react';

/**
 * `onClose` adds a close button; without it, an alert stays until its cause is fixed. Setting
 * `open` to `false`, rather than unmounting the alert, lets it leave: it fades out as its
 * height folds, then calls `onExited`. Closing hands focus on before `onClose` runs.
 */
export function AlertDismissible() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Alert
        tone="info"
        title="New: success and warning colours"
        open={open}
        onClose={() => setOpen(false)}
      >
        Every theme now has them, for statuses like &quot;Paid&quot; and &quot;Payment
        pending&quot;.
      </Alert>
      <Button variant="tonal" onPress={() => setOpen((current) => !current)}>
        {open ? 'Hide the alert' : 'Show the alert again'}
      </Button>
    </div>
  );
}
