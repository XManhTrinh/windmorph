'use client';

import { CalendarDate } from '@internationalized/date';
import { Button, DateRangePicker, PickerDialog, type DateRange } from '@windmorph/react';
import { useState } from 'react';

/**
 * `fullScreen="always"` fills the window at every size, as M3's full-screen date picker:
 * a close (×) button and Save sit in a row at the top, where Save calls `onConfirm`, and the
 * range picker's months fill the height. `"compact"` does this only below 600px.
 */
export function PickerDialogFullScreen() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<DateRange>({
    start: new CalendarDate(2030, 9, 1),
    end: new CalendarDate(2030, 9, 5),
  });
  const [draft, setDraft] = useState<DateRange | null>(value);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        Book a stay
      </Button>
      <p className="text-body-medium text-on-surface-variant">
        Stay: {value.start.toString()} – {value.end.toString()}
      </p>
      <PickerDialog
        aria-label="Stay dates"
        open={open}
        onOpenChange={setOpen}
        fullScreen="always"
        onConfirm={() => {
          if (draft) setValue(draft);
        }}
        confirmButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            OK
          </Button>
        }
      >
        <DateRangePicker value={draft} onChange={setDraft} yearRange={[2025, 2035]} />
      </PickerDialog>
    </div>
  );
}
