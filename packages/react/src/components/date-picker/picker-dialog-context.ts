'use client';

import { createContext } from 'react';

/**
 * What a {@link PickerDialog} with `onConfirm` offers the picker inside it: Enter on a
 * day (or in a date field) closes the dialog and saves, as the M3 keyboard table asks.
 */
export interface PickerDialogContextValue {
  /** Confirms once the picker's latest value has rendered, then closes the dialog. */
  requestConfirm: () => void;
}

export const PickerDialogContext = createContext<PickerDialogContextValue | null>(null);
