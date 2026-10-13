'use client';

import { Button } from '@windmorph/react';
import { ExpandableText } from '@windmorph/react-pro';
import { useState } from 'react';

const NOTES = [
  'Doors open at 6pm. The first hour is for setting up tables and the sound check, so please arrive by 6:30 if you are helping. Guests arrive from 7.',
  'Bring your own bowl and chopsticks if you can: we are trying to cut down on disposables this year. There will be spares at the door for anyone who forgets.',
];

/** Controlled (`expanded`): one button opens or closes every note at once. */
export function ExpandableTextControlled() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <Button variant="tonal" size="sm" onPress={() => setExpanded((current) => !current)}>
        {expanded ? 'Collapse all' : 'Expand all'}
      </Button>
      {NOTES.map((note) => (
        <ExpandableText
          key={note}
          as="p"
          lines={2}
          collapsible
          expanded={expanded}
          onExpandedChange={setExpanded}
          className="text-body-medium text-on-surface"
        >
          {note}
        </ExpandableText>
      ))}
    </div>
  );
}
