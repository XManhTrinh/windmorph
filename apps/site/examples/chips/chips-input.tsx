'use client';

import { InputChip } from '@windmorph/react';
import { useState } from 'react';

/**
 * Input chips represent discrete entries the user added, such as recipients. `onRemove`
 * adds a remove button and lets Backspace or Delete on the chip remove it; `removeLabel`
 * names that button (so it reads "Remove Alice").
 */
export function ChipsInput() {
  const [people, setPeople] = useState(['Alice', 'Bob', 'Chidi']);
  return (
    <div className="flex flex-wrap gap-2">
      {people.map((name) => (
        <InputChip
          key={name}
          removeLabel="Remove"
          onRemove={() => setPeople((all) => all.filter((x) => x !== name))}
        >
          {name}
        </InputChip>
      ))}
      {people.length === 0 && (
        <p className="text-body-medium text-on-surface-variant">All recipients removed.</p>
      )}
    </div>
  );
}
