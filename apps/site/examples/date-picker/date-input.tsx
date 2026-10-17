'use client';

import { CalendarDate } from '@internationalized/date';
import { Button, DatePicker, DateRangePicker, PickerDialog } from '@windmorph/react';
import { useState } from 'react';

/**
 * The modal date input: the modal picker opened in its typed mode with
 * `defaultMode="input"`, for a date that's quicker to type than to find, such as a date of
 * birth. The edit / calendar button in its header switches between typing and the calendar.
 * The typed mode is titled "Enter date" ("Enter dates" for a range); `labels.inputTitle`
 * words it for the task. A range types a start and an end date.
 */
export function DateInput() {
  const [open, setOpen] = useState<'single' | 'range' | null>(null);
  const close = () => setOpen(null);
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="tonal" onPress={() => setOpen('single')}>
        Enter your date of birth
      </Button>
      <Button variant="tonal" onPress={() => setOpen('range')}>
        Enter a date range
      </Button>
      <PickerDialog
        aria-label={open === 'range' ? 'Date range' : 'Date of birth'}
        open={open !== null}
        onOpenChange={(next) => !next && close()}
        onConfirm={close}
        dismissButton={
          <Button variant="text" onPress={close}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button variant="text" onPress={close}>
            OK
          </Button>
        }
      >
        {open === 'range' ? (
          <DateRangePicker defaultMode="input" />
        ) : (
          <DatePicker
            defaultMode="input"
            defaultValue={new CalendarDate(1990, 6, 21)}
            labels={{ inputTitle: 'Enter your date of birth' }}
          />
        )}
      </PickerDialog>
    </div>
  );
}
