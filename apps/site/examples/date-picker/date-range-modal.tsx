'use client';

import { CalendarDate } from '@internationalized/date';
import { Button, DateRangePicker, PickerDialog, type DateRange } from '@windmorph/react';
import { useState } from 'react';

/**
 * The modal date range picker, full screen as M3 recommends for ranges on phones
 * (`fullScreen="compact"`): its months scroll vertically, and Save applies the range. On
 * larger windows it sits in a dialog with Cancel and OK.
 */
export function DateRangeModal() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<DateRange>({
    start: new CalendarDate(2030, 7, 6),
    end: new CalendarDate(2030, 7, 12),
  });
  const [draft, setDraft] = useState<DateRange | null>(value);
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
        Choose your trip dates
      </Button>
      <p className="text-body-medium text-on-surface-variant">
        Trip: {value.start.toString()} – {value.end.toString()}
      </p>
      <PickerDialog
        aria-label="Trip dates"
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
        <DateRangePicker value={draft} onChange={setDraft} yearRange={[2025, 2035]} />
      </PickerDialog>
    </div>
  );
}
