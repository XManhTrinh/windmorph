'use client';

import type { CalendarDate, DateValue } from '@internationalized/date';
import { useState } from 'react';
import { Button } from '../button/Button';
import type { DateFieldStrings } from './DateField';
import { DatePicker } from './DatePicker';
import { PickerDialog } from './PickerDialog';

/** Props of a {@link CompactDateDialog}. */
export interface CompactDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CalendarDate | null;
  onCommit: (date: CalendarDate | null) => void;
  minValue: DateValue | undefined;
  maxValue: DateValue | undefined;
  isDateUnavailable: ((date: DateValue) => boolean) | undefined;
  yearRange: [number, number];
  strings: DateFieldStrings;
  className: string | undefined;
}

/**
 * A {@link DateField}'s calendar on a compact window: the modal date picker in a
 * full-screen dialog, editing a draft that Save (or Enter on a day) keeps and the close
 * button drops, as the docked calendar's OK and Cancel do. `DateField` loads this module
 * with `import()` only on compact windows, so a field on a wider window doesn't carry the
 * modal picker's code.
 */
export function CompactDateDialog({
  open,
  onOpenChange,
  value,
  onCommit,
  minValue,
  maxValue,
  isDateUnavailable,
  yearRange,
  strings,
  className,
}: CompactDateDialogProps) {
  const [draft, setDraft] = useState(value);
  // Each opening starts from the field's date (state adjusted while rendering, no effect).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setDraft(value);
  }
  const confirm = () => {
    onCommit(draft);
    onOpenChange(false);
  };
  return (
    <PickerDialog
      aria-label={strings.calendar ?? 'Choose a date'}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={confirm}
      fullScreen="compact"
      dismissButton={
        <Button variant="text" onPress={() => onOpenChange(false)}>
          {strings.cancel ?? 'Cancel'}
        </Button>
      }
      confirmButton={
        <Button variant="text" onPress={confirm}>
          {strings.ok ?? 'OK'}
        </Button>
      }
    >
      <DatePicker
        value={draft}
        onChange={setDraft}
        minValue={minValue}
        maxValue={maxValue}
        isDateUnavailable={isDateUnavailable}
        yearRange={yearRange}
        strings={strings}
        className={className}
      />
    </PickerDialog>
  );
}
