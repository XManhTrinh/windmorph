'use client';

import { createContext } from 'react';

/**
 * Where a tooltip sits against its anchor. `start` / `end` follow the text direction; a
 * second word aligns the tooltip with that edge of the anchor (`bottom start` sits below,
 * extending towards the end). Tooltips flip when there's no room.
 */
export type TooltipPlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'start'
  | 'end'
  | 'top start'
  | 'top end'
  | 'bottom start'
  | 'bottom end';

/**
 * The default placement of the plain tooltips inside, where a container calls for one other
 * than `top`. App bars provide `bottom` (the spec: "If the element is in an app bar, the plain
 * tooltip appears below the element"), so their icon buttons' tooltips open below. A
 * trigger's own `placement` wins.
 */
export const TooltipPlacementContext = createContext<TooltipPlacement | null>(null);
