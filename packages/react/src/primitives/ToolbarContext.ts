'use client';

import { createContext } from 'react';

/** What a toolbar tells the controls inside it. */
export interface ToolbarContextValue {
  kind: 'docked' | 'floating';
  /** The toolbar's colour scheme; vibrant toolbars recolour their icon buttons (M3). */
  color: 'standard' | 'vibrant';
  /**
   * Whether a floating toolbar is expanded; its `ToolbarFab` shows `expandedIcon` while it
   * is. Docked toolbars leave it out.
   */
  expanded?: boolean;
  /** A floating toolbar's orientation; docked toolbars are always horizontal. */
  orientation?: 'horizontal' | 'vertical';
}

/**
 * Set by `DockedToolbar` and `FloatingToolbar`; `null` outside a toolbar. Overlays reset
 * it, so a menu or dialog opened from a toolbar keeps its own colours.
 */
export const ToolbarContext = createContext<ToolbarContextValue | null>(null);
