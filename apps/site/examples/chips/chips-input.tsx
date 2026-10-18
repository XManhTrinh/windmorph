'use client';

import { ChipSet, InputChip } from '@windmorph/react';
import { useState } from 'react';

/**
 * Input chips represent discrete entries the user added, such as recipients. With only
 * `onRemove`, each chip is one focus stop, its remove button ("Remove Alex"), and Backspace
 * or Delete removes it. Add `onPress` (to edit, say) and the chip and its remove button
 * become two focus stops. A chip with a remove button is at least 88px wide.
 */
export function ChipsInput() {
  const [people, setPeople] = useState(['Alex', 'Sam', 'Priya']);
  return (
    <div className="flex flex-col items-start gap-3">
      <ChipSet aria-label="Recipients">
        {people.map((name) => (
          <InputChip key={name} onRemove={() => setPeople((all) => all.filter((x) => x !== name))}>
            {name}
          </InputChip>
        ))}
      </ChipSet>
      {people.length === 0 && (
        <p className="text-body-medium text-on-surface-variant">All recipients removed.</p>
      )}
    </div>
  );
}
