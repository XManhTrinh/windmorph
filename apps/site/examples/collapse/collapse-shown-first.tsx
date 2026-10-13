'use client';

import { Button } from '@windmorph/react';
import { Collapse } from '@windmorph/react-pro';
import { useId, useState } from 'react';

/**
 * Open from the start: `appear={false}` shows it in place on the first render, with no
 * opening motion, and it folds and unfolds as usual after that.
 */
export function CollapseShownFirst() {
  const [open, setOpen] = useState(true);
  const details = useId();
  return (
    <div className="flex w-full max-w-md flex-col items-start">
      <Button
        variant="text"
        aria-expanded={open}
        aria-controls={details}
        onPress={() => setOpen((current) => !current)}
      >
        {open ? 'Hide delivery details' : 'Show delivery details'}
      </Button>
      <Collapse isOpen={open} appear={false}>
        <p id={details} className="px-3 pb-3 text-body-medium text-on-surface-variant">
          Orders placed before noon arrive the next working day. Bánh mì and other fresh food is
          delivered chilled, in a recyclable box.
        </p>
      </Collapse>
    </div>
  );
}
