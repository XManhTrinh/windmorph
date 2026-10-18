'use client';

import { Select, SelectItem } from '@windmorph/react';

/** Do: a select for one choice from a long list. */
export function SelectDoLongList() {
  return (
    <Select label="Country" defaultValue="fr" className="w-full max-w-72">
      <SelectItem key="au">Australia</SelectItem>
      <SelectItem key="ca">Canada</SelectItem>
      <SelectItem key="fr">France</SelectItem>
      <SelectItem key="de">Germany</SelectItem>
      <SelectItem key="jp">Japan</SelectItem>
      <SelectItem key="gb">United Kingdom</SelectItem>
    </Select>
  );
}

/** Don't: a select hiding two choices people should see at once. */
export function SelectDontTwoOptions() {
  return (
    <Select label="Delivery" defaultValue="standard" className="w-full max-w-72">
      <SelectItem key="standard">Standard</SelectItem>
      <SelectItem key="express">Express</SelectItem>
    </Select>
  );
}
