'use client';

import { createContext } from 'react';

/** Whether the enclosing `ChipSet` is disabled, which disables every chip in it. */
export const ChipSetDisabledContext = createContext(false);
