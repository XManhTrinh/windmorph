'use client';

import { Button } from '@windmorph/react';
import { Popover, PopoverTrigger } from '@windmorph/react-pro';

/** An anchored panel of any content; below 600px wide it fills the window. */
export function PopoverAccount() {
  return (
    <PopoverTrigger>
      <Button variant="tonal">Account</Button>
      <Popover aria-label="Account" headline="Account">
        <div className="flex flex-col gap-3">
          <p className="m-0 text-body-medium text-on-surface">Signed in as Alex Morgan</p>
          <Button variant="text">Sign out</Button>
        </div>
      </Popover>
    </PopoverTrigger>
  );
}
