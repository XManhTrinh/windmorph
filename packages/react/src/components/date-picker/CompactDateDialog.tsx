'use client';

import type { CalendarDate, DateValue } from '@internationalized/date';
import { useState } from 'react';
import { Button } from '../button/Button';
import type { DateFieldClassNames, DateFieldLabels } from './DateField';
import { DatePicker } from './DatePicker';
import { PickerDialog } from './PickerDialog';

/** Props of a {@link CompactDateDialog}. */
export interface CompactDateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: CalendarDate | null;
  onCommit: (date: CalendarDate | null) => void;
  min: DateValue | undefined;
  max: DateValue | undefined;
  isDateUnavailable: ((date: DateValue) => boolean) | undefined;
  yearRange: [number, number];
  labels: Partial<DateFieldLabels>;
  /** The field's calendar parts: `calendar` styles the dialog's surface here. */
  classNames: Pick<DateFieldClassNames, 'calendar' | 'menuButton' | 'weekday' | 'day' | 'item'>;
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
  min,
  max,
  isDateUnavailable,
  yearRange,
  labels,
  classNames,
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
      aria-label={labels.calendar ?? 'Choose a date'}
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={confirm}
      fullScreen="compact"
      {...(classNames.calendar && { classNames: { panel: classNames.calendar } })}
      dismissButton={
        <Button variant="text" onPress={() => onOpenChange(false)}>
          {labels.cancel ?? 'Cancel'}
        </Button>
      }
      confirmButton={
        <Button variant="text" onPress={confirm}>
          {labels.ok ?? 'OK'}
        </Button>
      }
    >
      <DatePicker
        value={draft}
        onChange={setDraft}
        min={min}
        max={max}
        isDateUnavailable={isDateUnavailable}
        yearRange={yearRange}
        labels={labels}
        classNames={{
          day: classNames.day,
          weekday: classNames.weekday,
          year: classNames.item,
          yearButton: classNames.menuButton,
        }}
      />
    </PickerDialog>
  );
}
