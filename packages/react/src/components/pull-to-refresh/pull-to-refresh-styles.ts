import { tv } from '../../utils/tv';

/*
 * Values follow Compose Material 3 (`PullToRefreshDefaults.LoadingIndicator` and
 * `IndicatorBox`): a 48px circle on `primary-container`, elevation level 0, holding a
 * contained loading indicator, clipped at the top of the pull area. The determinate and
 * indeterminate indicators crossfade on the default effects spring, as Compose's `Crossfade`
 * does. Every class is written out in full so Tailwind can find it.
 */

/** Variant definitions for {@link PullToRefresh}; extend them to add variants. */
export const pullToRefreshStyles = tv({
  slots: {
    // No layout of its own: the consumer's classes make it the scroll container (or not).
    // `overscroll-y-contain` keeps a scrolling root from chaining into the page or starting
    // the browser's own pull to refresh.
    root: 'overscroll-y-contain data-pulling:select-none',
    // A zero-height sticky layer at the top of the area, so the indicator stays in view while
    // the content scrolls ("Don't scroll the loading indicator off-screen").
    layer: 'pointer-events-none sticky top-0 z-(--md-sys-z-sticky) h-0',
    // Clips the indicator at the top of the area (Compose's `clipRect(top = 0f)`), with room
    // for the longest pull: twice the threshold. In flow but overflowing the zero-height layer,
    // so it covers the content without moving it, and nothing inside is positioned.
    clip: 'flex h-[calc(var(--m3-pull-to-refresh-threshold)*2)] justify-center overflow-hidden',
    indicator:
      'grid size-[48px] shrink-0 place-items-center overflow-hidden rounded-corner-full bg-primary-container',
    face: '[grid-area:1/1] transition-opacity duration-m3-effects-default ease-m3-effects-default data-[active=false]:opacity-0',
  },
});
