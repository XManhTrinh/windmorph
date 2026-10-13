'use client';

import { Time } from '@internationalized/date';
import { Button, IconButton, PickerDialog, TimePicker } from '@windmorph/react';
import { useState } from 'react';
import { EditIcon } from '../../components/icons';

/**
 * The modal time picker: `variant="time"` pads the content and shows a title, and the
 * `modeToggleButton` sits at the start of the actions row to switch the picker between its
 * dial and input modes. Like the date dialog it is closed until the trigger opens it.
 */
export function PickerDialogTime() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'dial' | 'input'>('dial');
  return (
    <div className="flex flex-col items-start gap-4">
      <Button onPress={() => setOpen(true)}>Pick a time</Button>
      <PickerDialog
        variant="time"
        title="Select time"
        aria-label="Select time"
        open={open}
        onOpenChange={setOpen}
        modeToggleButton={
          <IconButton
            icon={<EditIcon />}
            aria-label={mode === 'dial' ? 'Switch to text input' : 'Switch to clock'}
            onPress={() => setMode(mode === 'dial' ? 'input' : 'dial')}
          />
        }
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
        <TimePicker defaultValue={new Time(7, 30)} hourCycle={12} mode={mode} />
      </PickerDialog>
    </div>
  );
}
