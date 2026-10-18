'use client';

import { CalendarDate } from '@internationalized/date';
import { Button, DatePicker, PickerDialog } from '@windmorph/react';
import { useState } from 'react';

/**
 * The modal date picker: a `DatePicker` in a `PickerDialog`. The picker edits a draft that
 * OK (or Enter on a day) saves, so Cancel leaves the date as it was. Its header's year
 * button opens the year list, and on compact windows `fullScreen="compact"` fills the
 * window with a Save button at the top.
 */
export function DatePickerModal() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(new CalendarDate(2030, 3, 14));
  const [draft, setDraft] = useState<CalendarDate | null>(value);
  const save = () => {
    if (draft) setValue(draft);
  };
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        variant="tonal"
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        Choose a delivery date
      </Button>
      <p className="text-body-medium text-on-surface-variant">Delivery: {value.toString()}</p>
      <PickerDialog
        aria-label="Delivery date"
        open={open}
        onOpenChange={setOpen}
        onConfirm={save}
        fullScreen="compact"
        dismissButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button
            variant="text"
            onPress={() => {
              save();
              setOpen(false);
            }}
          >
            OK
          </Button>
        }
      >
        <DatePicker value={draft} onChange={setDraft} yearRange={[2025, 2035]} />
      </PickerDialog>
    </div>
  );
}
