'use client';

import { useContext, useState } from 'react';
import { onDemand, usePreloadOnIntent } from '../../utils/load-on-demand';
import type { TooltipProps } from './Tooltip';
import { TooltipContext } from './tooltip-trigger';

const tooltip = onDemand<TooltipProps>(() => import('./Tooltip').then((module) => module.Tooltip));

/** Starts loading the `Tooltip` module, once; later calls return the same promise. */
export const preloadTooltip = tooltip.preload;

/**
 * A plain `Tooltip` whose module loads on demand, for components that show a tooltip of their
 * own (an icon button's label, a FAB's): it only appears on hover, keyboard focus or a touch
 * long press, so a page of buttons doesn't carry the tooltip's code up front. It goes inside a
 * `TooltipTrigger` from `./tooltip-trigger`, which works as before: the trigger's state,
 * naming and keyboard handling are all there from the first render.
 *
 * The module starts loading when the pointer moves over the trigger or focus enters it, and
 * at the latest when the tooltip opens; once loaded, every tooltip opens at once. Until the
 * tooltip first opens it renders nothing; if it opens before the module arrives it shows once
 * loaded. Once opened it stays mounted, so it can play its exit. Server rendering is
 * unchanged: a tooltip is never open there.
 */
export function LazyTooltip(props: TooltipProps) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('Tooltip must be rendered inside a TooltipTrigger');
  const isOpen = context.state.isOpen;
  const [opened, setOpened] = useState(isOpen);
  // Set during render, so the first open renders the tooltip in the same pass.
  if (isOpen && !opened) setOpened(true);

  // Until it first opens; after that the module is loading or in.
  usePreloadOnIntent(context.triggerRef, tooltip.preload, !opened);

  if (!opened) return null;
  return <tooltip.Component {...props} />;
}
