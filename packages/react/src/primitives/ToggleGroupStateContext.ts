'use client';

import { createContext } from 'react';
import type { ToggleGroupState } from 'react-stately';

/**
 * Selection state of an enclosing toggle group (e.g. a connected `ButtonGroup`). Toggle
 * buttons with a `value` inside it are selected through the group instead of on their own.
 * Overlays reset it: a dialog or menu opened from inside a group isn't part of it.
 */
export const ToggleGroupStateContext = createContext<ToggleGroupState | null>(null);
