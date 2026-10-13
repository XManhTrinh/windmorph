'use client';

import type { ReactNode } from 'react';
import { ButtonContext, standardIconButtons } from '../button/ButtonContext';
import { TooltipPlacementContext } from '../tooltip/Tooltip';

/**
 * What an app bar gives the controls inside it: `standard` icon buttons, and plain tooltips
 * below (the spec: "If the element is in an app bar, the plain tooltip appears below the
 * element"). Shared by `TopAppBar` and `SearchAppBar`.
 */
export function AppBarItems({ children }: { children: ReactNode }) {
  return (
    <TooltipPlacementContext value="bottom">
      <ButtonContext value={standardIconButtons}>{children}</ButtonContext>
    </TooltipPlacementContext>
  );
}
