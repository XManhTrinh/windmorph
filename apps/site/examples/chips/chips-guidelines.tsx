'use client';

import { AssistChip, Button, ChipSet, FilterChip } from '@windmorph/react';
import { CalendarMonthIcon } from '../../components/icons';

/** Do: chips in a set, with short labels. */
export function ChipsDoSet() {
  return (
    <ChipSet aria-label="Diet" selectionMode="multiple" defaultSelectedKeys={['Vegetarian']}>
      <FilterChip value="Vegetarian">Vegetarian</FilterChip>
      <FilterChip value="Gluten-free">Gluten-free</FilterChip>
      <FilterChip value="Under 30 min">Under 30 min</FilterChip>
    </ChipSet>
  );
}

/** Don't: one chip on its own. */
export function ChipsDontSingle() {
  return (
    <ChipSet aria-label="Diet" selectionMode="multiple" defaultSelectedKeys={['Vegetarian']}>
      <FilterChip value="Vegetarian">Vegetarian</FilterChip>
    </ChipSet>
  );
}

/** Do: a button for the step that finishes the task. */
export function ChipsDoFinishWithButton() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ChipSet aria-label="Suggestions">
        <AssistChip leadingIcon={<CalendarMonthIcon />}>Add to calendar</AssistChip>
      </ChipSet>
      <Button variant="filled">Book a table</Button>
    </div>
  );
}

/** Don't: a chip that finishes the task. */
export function ChipsDontFinishWithChip() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ChipSet aria-label="Suggestions">
        <AssistChip leadingIcon={<CalendarMonthIcon />}>Add to calendar</AssistChip>
        <AssistChip>Book a table</AssistChip>
      </ChipSet>
    </div>
  );
}
