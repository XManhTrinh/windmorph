'use client';

import { useState, type ReactElement, type ReactNode } from 'react';
import { LazyTooltip } from '../tooltip/lazy-tooltip';
import {
  TooltipTrigger,
  useInTooltipTrigger,
  WithoutDescription,
} from '../tooltip/tooltip-trigger';

interface FabTooltipProps {
  /** Whether the tooltip can show: an extended FAB while collapsed, a FAB menu while closed. */
  available: boolean;
  label: ReactNode;
  /** Classes for the tooltip's surface (its `classNames.panel`). */
  className?: string | undefined;
  /** The FAB, a library button that reads `TriggerContext`. */
  children: ReactElement;
}

/**
 * The plain tooltip M3 asks of an icon-only FAB on the web, for FABs that are icon-only
 * some of the time. It stays mounted either way, so toggling never remounts the FAB (which
 * would drop focus and cut its motion short), and an open tooltip closes once it stops
 * being available. Inside an app's own `TooltipTrigger` or `RichTooltipTrigger` it steps
 * aside, so there's never a second tooltip.
 */
export function FabTooltip({ available, label, className, children }: FabTooltipProps) {
  const inTooltipTrigger = useInTooltipTrigger();
  const [isOpen, setOpen] = useState(false);
  const [wasAvailable, setWasAvailable] = useState(available);
  // Closes it for good when it stops being available, so it doesn't reopen by itself when
  // it becomes available again (state adjusted during render, not in an effect).
  if (available !== wasAvailable) {
    setWasAvailable(available);
    if (!available) setOpen(false);
  }
  if (inTooltipTrigger) return children;
  return (
    <TooltipTrigger isDisabled={!available} isOpen={available && isOpen} onOpenChange={setOpen}>
      {/* The label is the FAB's name, so the tooltip doesn't describe it too. */}
      <WithoutDescription>{children}</WithoutDescription>
      <LazyTooltip classNames={{ panel: className }}>{label}</LazyTooltip>
    </TooltipTrigger>
  );
}
