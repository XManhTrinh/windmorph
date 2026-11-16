'use client';

import { createContext, type RefObject } from 'react';
import type { OverlayTriggerState } from 'react-stately';

/** What a `DialogTrigger` gives its `Dialog`. */
interface DialogTriggerContextValue {
  state: OverlayTriggerState;
  /** Links the dialog to its trigger (`aria-controls`). */
  overlayProps: { id?: string };
  /** The trigger, for `origin="trigger"`. */
  triggerRef: RefObject<HTMLElement | null>;
}

/** What a `SheetTrigger` gives the modal sheet inside it. */
export interface SheetTriggerContextValue {
  state: OverlayTriggerState;
  overlayProps: { id?: string };
}

// The dialog and sheet triggers' contexts are declared here, below the dialog and the sheets,
// so that `Overlay` can reset them: what an overlay holds is not that trigger's dialog or
// sheet, so a dialog or modal sheet inside it keeps its own open state. Opened with the
// trigger's own, each would make the other inert, and nothing in either could take focus.
// (Line comments: a doc block would ship in every module that opens an overlay.)
export const DialogTriggerContext = createContext<DialogTriggerContextValue | null>(null);
export const SheetTriggerContext = createContext<SheetTriggerContextValue | null>(null);
