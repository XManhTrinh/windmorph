'use client';

import { Time } from '@internationalized/date';
import {
  Button,
  PickerDialog,
  TimePicker,
  TimePickerModeToggle,
  type TimePickerMode,
} from '@windmorph/react';
import { useState } from 'react';

/**
 * The modal time picker: `variant="time"` pads the content and shows a title, and a
 * `TimePickerModeToggle` (the keyboard / clock button) sits at the start of the actions row
 * to switch the picker between its dial and input modes. Like the date dialog it is closed
 * until the trigger opens it.
 */
export function PickerDialogTime() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TimePickerMode>('dial');
  return (
    <div className="flex flex-col items-start gap-4">
      <Button onPress={() => setOpen(true)}>Pick a time</Button>
      <PickerDialog
        variant="time"
        title="Select time"
        aria-label="Select time"
        open={open}
        onOpenChange={setOpen}
        modeToggleButton={<TimePickerModeToggle mode={mode} onModeChange={setMode} />}
        dismissButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            OK
          </Button>
        }
      >
        <TimePicker
          defaultValue={new Time(7, 30)}
          hourCycle={12}
          mode={mode}
          onModeChange={setMode}
        />
      </PickerDialog>
    </div>
  );
}
