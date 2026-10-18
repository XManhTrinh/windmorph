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
 * Time pickers are modal: a `TimePicker` in a `PickerDialog` with `variant="time"`. The
 * keyboard / clock button switches between the dial and typing the time, and OK saves the
 * draft, so Cancel keeps the time that was set.
 */
export function TimePickerModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TimePickerMode>('dial');
  const [value, setValue] = useState(new Time(7, 30));
  const [draft, setDraft] = useState(value);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button
        variant="tonal"
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
      >
        Set an alarm
      </Button>
      <p className="text-body-medium text-on-surface-variant">Alarm: {value.toString()}</p>
      <PickerDialog
        variant="time"
        title={mode === 'dial' ? 'Select time' : 'Enter time'}
        aria-label="Alarm time"
        open={open}
        onOpenChange={setOpen}
        modeToggleButton={<TimePickerModeToggle mode={mode} onModeChange={setMode} />}
        dismissButton={
          <Button variant="text" onPress={() => setOpen(false)}>
            Cancel
          </Button>
        }
        confirmButton={
          <Button
            variant="text"
            onPress={() => {
              setValue(draft);
              setOpen(false);
            }}
          >
            OK
          </Button>
        }
      >
        <TimePicker
          value={draft}
          onChange={setDraft}
          hourCycle={12}
          mode={mode}
          onModeChange={setMode}
        />
      </PickerDialog>
    </div>
  );
}
