'use client';

import { createContext, type HTMLAttributes, type RefObject } from 'react';
import type { OverlayTriggerState, TooltipTriggerState } from 'react-stately';
import type { TooltipPlacement } from './TooltipPlacementContext';

/** What a `TooltipTrigger` gives its `Tooltip`. */
export interface TooltipContextValue {
  state: TooltipTriggerState;
  triggerRef: RefObject<HTMLElement | null>;
  tooltipProps: HTMLAttributes<HTMLElement>;
  placement: TooltipPlacement;
  offset: number;
}

/** What a `RichTooltipTrigger` gives its `RichTooltip`. */
export type RichContextValue = {
  triggerRef: RefObject<HTMLElement | null>;
  placement: TooltipPlacement;
  offset: number;
} & (
  | { persistent: true; state: OverlayTriggerState; overlayProps: HTMLAttributes<HTMLElement> }
  | { persistent: false; state: TooltipTriggerState; tooltipProps: HTMLAttributes<HTMLElement> }
);

// The tooltip triggers' contexts are declared here, below the tooltip, so that `Overlay` can
// reset them: a dialog, menu or sheet opened from a button inside a tooltip trigger isn't in
// the trigger, and its icon buttons and FABs show their own tooltips.
// (Line comments: a doc block would ship in every module that opens an overlay.)
export const TooltipContext = createContext<TooltipContextValue | null>(null);
export const RichContext = createContext<RichContextValue | null>(null);
