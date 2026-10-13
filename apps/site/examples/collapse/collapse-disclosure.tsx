'use client';

import { Button } from '@windmorph/react';
import { Collapse } from '@windmorph/react-pro';
import { useId, useState } from 'react';

/** A question that shows its answer: the button names what it controls and whether it's open. */
export function CollapseDisclosure() {
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
        Can I bring a guest?
      </Button>
      <Collapse isOpen={open}>
        <p id={answer} className="px-3 pb-3 text-body-medium text-on-surface-variant">
          Yes, one guest per member. Add their name when you book, so there&apos;s a seat for them.
        </p>
      </Collapse>
    </div>
  );
}
