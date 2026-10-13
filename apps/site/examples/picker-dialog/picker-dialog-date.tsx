'use client';

import { CalendarDate } from '@internationalized/date';
import { Button, DatePicker, PickerDialog } from '@windmorph/react';
import { useState } from 'react';

/**
 * The modal date picker: a `PickerDialog` wrapping a `DatePicker`, controlled with `open` /
 * `onOpenChange`. The picker edits a draft; the `confirmButton` applies it and closes, the
 * `dismissButton` just closes. The dialog is closed until the trigger opens it, so nothing
 * is shown over the page on load.
 */
export function PickerDialogDate() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<CalendarDate>(new CalendarDate(2030, 3, 14));
  const [draft, setDraft] = useState<CalendarDate | null>(value);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        Pick a date
      </Button>
      <p className="text-body-medium text-on-surface-variant">Selected: {value.toString()}</p>
      <PickerDialog
        aria-label="Select date"
        open={open}
        onOpenChange={setOpen}
        dismissButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button
            variant="text"
            onPress={() => {
              if (draft) setValue(draft);
              setOpen(false);
            }}
          >
            OK
          </Button>
        }
      >
        <DatePicker value={draft} onChange={setDraft} yearRange={[2020, 2040]} />
      </PickerDialog>
    </div>
  );
}
