'use client';

import { Select, SelectItem, type SelectKey } from '@windmorph/react';
import { useState } from 'react';

/**
 * Several choices: the menu stays open between picks, the field lists them (with a count
 * when they don't fit), and `maxSelections` caps them. `presentation="auto"` opens a
 * bottom sheet on phones and a menu on larger windows.
 */
export function SelectMultiple() {
  const [days, setDays] = useState<SelectKey[]>(['sat', 'sun']);
  return (
    <Select
      label="Open on"
      selectionMode="multiple"
      value={days}
      onChange={setDays}
      maxSelections={6}
      presentation="auto"
      supportingText="Up to six days"
    >
      <SelectItem key="mon">Monday</SelectItem>
      <SelectItem key="tue">Tuesday</SelectItem>
      <SelectItem key="wed">Wednesday</SelectItem>
      <SelectItem key="thu">Thursday</SelectItem>
      <SelectItem key="fri">Friday</SelectItem>
      <SelectItem key="sat">Saturday</SelectItem>
      <SelectItem key="sun">Sunday</SelectItem>
    </Select>
  );
}
