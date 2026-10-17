'use client';

import { Button } from '@windmorph/react';
import { Collapse } from '@windmorph/react-pro';
import { useId, useState } from 'react';

/**
 * Kept in the page while closed: `keepMounted` leaves the answer in the HTML as
 * `hidden="until-found"`, so find-in-page (try searching for "locker") and a link to
 * `#locker-hours` open it through `onOpenChange`, and search engines read it.
 */
export function CollapseKeptMounted() {
  const [open, setOpen] = useState(false);
  const answer = useId();
  return (
    <div className="flex w-full max-w-md flex-col items-start">
      <Button
        variant="text"
        aria-expanded={open}
        aria-controls={answer}
        onPress={() => setOpen((current) => !current)}
      >
        When can I use the lockers?
      </Button>
      <Collapse open={open} onOpenChange={setOpen} keepMounted>
        <p id={answer} className="px-3 pb-3 text-body-medium text-on-surface-variant">
          <span id="locker-hours">
            Every locker is open from 6am to 10pm. Bring your own padlock, or borrow one at the
            front desk.
          </span>
        </p>
      </Collapse>
    </div>
  );
}
