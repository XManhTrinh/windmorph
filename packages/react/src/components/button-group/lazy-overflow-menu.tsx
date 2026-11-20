'use client';

import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { MenuTriggerContext } from '../menu/menu-trigger';
import { closeOnLoadError } from '../../utils/close-on-load-error';
import { onDemand } from '../../utils/load-on-demand';
import { useDismissWhileLoading } from '../../utils/use-dismiss-while-loading';
import { useLoaded } from '../../utils/use-loaded';
import type { OverflowMenuListProps } from './overflow-menu-list';

const menu = onDemand<OverflowMenuListProps>(() =>
  import('./overflow-menu-list').then((module) => module.OverflowMenuList),
);

/**
 * Starts loading the overflow menu's module (and `Menu` with it), once; later calls return
 * the same promise.
 */
export const preloadOverflowMenu = menu.preload;

/** For `useDismissWhileLoading` outside a trigger, which never happens in a group. */
const NO_TRIGGER = { current: null };
const noop = () => {};

/**
 * `ButtonGroup`'s overflow menu, whose code loads only once a button folds: a group without
 * `overflow`, or whose buttons all fit, never carries `Menu`. It sits inside the indicator's
 * `MenuTrigger` and is rendered only while something is folded. Rendering it starts the
 * load, so the menu is usually ready long before the indicator is pressed, and then opens in
 * the same pass as the press (it never suspends, see `onDemand`). It mounts once loaded, or
 * when the menu opens if that comes first, and shows nothing until then. A failed load is
 * tried again when the pointer moves over the indicator, focus enters it, or the menu opens;
 * opened, a failed load closes it. Open while it loads, Escape, a press outside and focus
 * moving on close it (so it never opens late), and the indicator names no menu until one is in
 * the page, as `Menu`'s own parts loaded on demand do.
 */
export function LazyOverflowMenuList(props: OverflowMenuListProps) {
  const trigger = useContext(MenuTriggerContext);
  const isOpen = trigger?.state.isOpen === true;
  const [ready, setReady] = useState(isOpen);
  // Set during render, so an open before the load ends renders the menu in the same pass.
  if (isOpen && !ready) setReady(true);

  const triggerRef = trigger?.triggerRef;
  const close = trigger?.state.close;
  const arrived = useLoaded(menu, isOpen, close && closeOnLoadError('Menu', close)) !== undefined;
  const waiting = isOpen && !arrived;
  useDismissWhileLoading(triggerRef ?? NO_TRIGGER, waiting, close ?? noop, {
    onArrow: (focus) => trigger?.state.open(focus),
  });
  const setPending = trigger?.setPending;
  useLayoutEffect(() => {
    setPending?.(waiting);
    return () => setPending?.(false);
  }, [setPending, waiting]);
  useEffect(() => {
    let mounted = true;
    // A failed preload is left to the next hover, focus or open, which loads again.
    const preload = () =>
      void menu.preload().then(
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
  return <menu.Component {...props} />;
}
