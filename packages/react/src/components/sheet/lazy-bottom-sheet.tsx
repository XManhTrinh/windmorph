'use client';

import { lazy, Suspense, useEffect, useState, type RefObject } from 'react';
import type { BottomSheet as BottomSheetComponent, BottomSheetProps } from './BottomSheet';

let sheetModule: Promise<{ default: typeof BottomSheetComponent }> | undefined;

/**
 * Starts loading the `BottomSheet` module, once; later calls return the same promise.
 * Components that open in a sheet only sometimes call it when a sheet becomes likely (the
 * pointer over their trigger, or focus on it), so the sheet is usually loaded by the time
 * it opens.
 */
export function preloadBottomSheet() {
  sheetModule ??= import('./BottomSheet').then(
    (module) => ({ default: module.BottomSheet }),
    (error: unknown) => {
      // A failed load (say, a dropped connection) is tried again next time.
      sheetModule = undefined;
      throw error;
    },
  );
  return sheetModule;
}

const LoadedBottomSheet = lazy(preloadBottomSheet);

/**
 * A `BottomSheet` whose module is loaded the first time it opens, for components that show
 * a sheet only in some presentations (`Menu` and `Select` with `presentation="sheet"` or
 * `"auto"`). Their other presentations then don't carry the sheet's code. Until it first
 * opens it renders nothing; while the module loads it renders nothing too, rather than a
 * placeholder of another shape. Once opened it stays mounted, so it can play its exit.
 * Server rendering works as it did: a sheet is never open there.
 */
export function LazyBottomSheet(props: BottomSheetProps) {
  const [opened, setOpened] = useState(props.open === true);
  // Set during render, so the first open renders the sheet in the same pass.
  if (props.open === true && !opened) setOpened(true);
  if (!opened) return null;
  return (
    <Suspense fallback={null}>
      <LoadedBottomSheet {...props} />
    </Suspense>
  );
}

/**
 * Preloads the sheet when the pointer moves over `ref`'s element or focus enters it, while
 * `enabled` (the component would open in a sheet).
 */
export function usePreloadBottomSheet(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    // A failed preload is left to the open, which loads again and reports it.
    const preload = () => void preloadBottomSheet().catch(() => undefined);
    element.addEventListener('pointerover', preload);
    element.addEventListener('focusin', preload);
    return () => {
      element.removeEventListener('pointerover', preload);
      element.removeEventListener('focusin', preload);
    };
  }, [ref, enabled]);
}
