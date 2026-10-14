'use client';

import { useState, type RefObject } from 'react';
import { onDemand, usePreloadOnIntent } from '../../utils/load-on-demand';
import type { BottomSheetProps } from './BottomSheet';

const sheet = onDemand<BottomSheetProps>(() =>
  import('./BottomSheet').then((module) => module.BottomSheet),
);

/**
 * Starts loading the `BottomSheet` module, once; later calls return the same promise.
 * Components that open in a sheet only sometimes call it when a sheet becomes likely (the
 * pointer over their trigger, or focus on it), so the sheet is usually loaded by the time
 * it opens.
 */
export const preloadBottomSheet = sheet.preload;

/**
 * A `BottomSheet` whose module is loaded the first time it opens, for components that show
 * a sheet only in some presentations (`Menu` and `Select` with `presentation="sheet"` or
 * `"auto"`). Their other presentations then don't carry the sheet's code. Until it first
 * opens it renders nothing; while the module loads it renders nothing too, rather than a
 * placeholder of another shape. Once loaded it opens in the same pass as the open itself
 * (it never suspends, see `onDemand`). Once opened it stays mounted, so it can play its exit.
 * Server rendering works as it did: a sheet is never open there.
 */
export function LazyBottomSheet(props: BottomSheetProps) {
  const [opened, setOpened] = useState(props.open === true);
  // Set during render, so the first open renders the sheet in the same pass.
  if (props.open === true && !opened) setOpened(true);
  if (!opened) return null;
  return <sheet.Component {...props} />;
}

/**
 * Preloads the sheet when the pointer moves over `ref`'s element or focus enters it, while
 * `enabled` (the component would open in a sheet).
 */
export function usePreloadBottomSheet(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  usePreloadOnIntent(ref, sheet.preload, enabled);
}
