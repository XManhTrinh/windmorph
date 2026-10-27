'use client';

import { Checkbox } from '@windmorph/react';
import { useState } from 'react';

/**
 * A parent checkbox shows `indeterminate` (a dash) when only some children are checked.
 * `indeterminate` changes only what's shown and announced ("mixed"): the underlying state is
 * still checked or unchecked.
 */
export function CheckboxIndeterminate() {
  const [items, setItems] = useState([true, false, false]);
  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean);

  const setAt = (index: number, value: boolean) =>
    setItems((current) => current.map((item, i) => (i === index ? value : item)));

  return (
    <div className="flex flex-col gap-2">
      <Checkbox
        checked={allChecked}
        indeterminate={someChecked && !allChecked}
        onCheckedChange={(value) => setItems([value, value, value])}
      >
        Select all
      </Checkbox>
      <div className="flex flex-col gap-2 ps-6">
        <Checkbox checked={items[0]} onCheckedChange={(v) => setAt(0, v)}>
          Email
        </Checkbox>
        <Checkbox checked={items[1]} onCheckedChange={(v) => setAt(1, v)}>
          SMS
        </Checkbox>
        <Checkbox checked={items[2]} onCheckedChange={(v) => setAt(2, v)}>
          Push
        </Checkbox>
      </div>
    </div>
  );
}
