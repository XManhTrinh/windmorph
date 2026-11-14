'use client';

import { createContext } from 'react';

/**
 * Whether the enclosing `ChipSet` is disabled, which disables every chip in it. Overlays reset
 * it: a dialog or menu opened from a chip of the set isn't part of the set.
 */
export const ChipSetDisabledContext = createContext(false);
