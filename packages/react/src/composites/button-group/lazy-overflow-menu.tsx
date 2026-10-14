'use client';

import { lazy, Suspense, useContext, useEffect, useState } from 'react';
import { MenuTriggerContext } from '../../components/menu/menu-trigger';
import type {
  OverflowMenuList as OverflowMenuListComponent,
  OverflowMenuListProps,
} from './overflow-menu-list';

let menuModule: Promise<{ default: typeof OverflowMenuListComponent }> | undefined;

/**
 * Starts loading the overflow menu's module (and `Menu` with it), once; later calls return
 * the same promise.
 */
export function preloadOverflowMenu() {
  menuModule ??= import('./overflow-menu-list').then(
    (module) => ({ default: module.OverflowMenuList }),
    (error: unknown) => {
      // A failed load (say, a dropped connection) is tried again next time.
      menuModule = undefined;
      throw error;
    },
  );
  return menuModule;
}

const LoadedOverflowMenuList = lazy(preloadOverflowMenu);

/**
 * `ButtonGroup`'s overflow menu, whose code loads only once a button folds: a group without
 * `overflow`, or whose buttons all fit, never carries `Menu`. It sits inside the indicator's
 * `MenuTrigger` and is rendered only while something is folded. Rendering it starts the
 * load, so the menu is usually ready long before the indicator is pressed; it mounts once
 * loaded, or when the menu opens if that comes first, and shows nothing until then. A
 * failed load is tried again when the pointer moves over the indicator, focus enters it,
 * or the menu opens.
 */
export function LazyOverflowMenuList(props: OverflowMenuListProps) {
  const trigger = useContext(MenuTriggerContext);
  const isOpen = trigger?.state.isOpen === true;
  const [ready, setReady] = useState(isOpen);
  // Set during render, so an open before the load ends renders the menu in the same pass.
  if (isOpen && !ready) setReady(true);

  const triggerRef = trigger?.triggerRef;
  useEffect(() => {
    let mounted = true;
    // A failed preload is left to the next hover, focus or open, which loads again.
    const preload = () =>
      void preloadOverflowMenu().then(
        () => mounted && setReady(true),
        () => undefined,
      );
    preload();
    const element = triggerRef?.current;
    element?.addEventListener('pointerover', preload);
    element?.addEventListener('focusin', preload);
    return () => {
      mounted = false;
      element?.removeEventListener('pointerover', preload);
      element?.removeEventListener('focusin', preload);
    };
  }, [triggerRef]);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <LoadedOverflowMenuList {...props} />
    </Suspense>
  );
}
