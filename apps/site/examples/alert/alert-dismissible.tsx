'use client';

import { Button } from '@windmorph/react';
import { Alert } from '@windmorph/react-pro';
import { useState } from 'react';

/** `onClose` adds a close button; without it, an alert stays until its cause is fixed. */
export function AlertDismissible() {
  const [open, setOpen] = useState(true);
  return open ? (
    <Alert tone="info" title="New: success and warning colours" onClose={() => setOpen(false)}>
      Every theme now has them, for statuses like &quot;Paid&quot; and &quot;Payment pending&quot;.
    </Alert>
  ) : (
    <Button variant="tonal" onPress={() => setOpen(true)}>
      Show the alert again
    </Button>
  );
}
