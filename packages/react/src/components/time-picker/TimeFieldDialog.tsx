'use client';

import { Time } from '@internationalized/date';
import { useState } from 'react';
import { Button } from '../button/Button';
import { PickerDialog } from '../date-picker/PickerDialog';
import type { TimeFieldLabels } from './TimeField';
import { TimePicker, TimePickerModeToggle, type TimePickerMode } from './TimePicker';

/** Props of a {@link TimeFieldDialog}. */
export interface TimeFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: Time | null;
  onCommit: (time: Time) => void;
  hourCycle: 12 | 24;
  labels: TimeFieldLabels;
  className: string | undefined;
}

/**
 * A {@link TimeField}'s picker: the time picker in its typed form first, in a dialog, editing a
 * draft that OK keeps and Cancel drops. `TimeField` loads this module with `import()` as it is
 * first needed, so a form of many fields carries none of it.
 */
export function TimeFieldDialog({
  open,
  onOpenChange,
  value,
  onCommit,
  hourCycle,
  labels,
  className,
}: TimeFieldDialogProps) {
  const [draft, setDraft] = useState(value ?? new Time(12));
  const [mode, setMode] = useState<TimePickerMode>('input');
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraft(value ?? new Time(12));
      setMode('input');
    }
  }
  const confirm = () => {
    onCommit(draft);
    onOpenChange(false);
  };
  return (
    <PickerDialog
      aria-label={labels.title}
      variant="time"
      title={labels.title}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={confirm}
      fullScreen="compact"
      labels={{ close: labels.close, save: labels.save }}
      classNames={className === undefined ? {} : { panel: className }}
      modeToggleButton={<TimePickerModeToggle mode={mode} onModeChange={setMode} labels={labels} />}
      dismissButton={
        <Button variant="text" onPress={() => onOpenChange(false)}>
          {labels.cancel}
        </Button>
      }
      confirmButton={
        <Button variant="text" onPress={confirm}>
          {labels.ok}
        </Button>
      }
    >
      <TimePicker
        value={draft}
        onChange={setDraft}
        mode={mode}
        onModeChange={setMode}
        hourCycle={hourCycle}
        labels={labels}
      />
    </PickerDialog>
  );
}
