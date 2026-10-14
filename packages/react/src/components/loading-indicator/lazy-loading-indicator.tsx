'use client';

import type { RefObject } from 'react';
import { onDemand, usePreloadOnIntent } from '../../utils/load-on-demand';
import type { LoadingIndicatorProps } from './LoadingIndicator';

const indicator = onDemand<LoadingIndicatorProps>(() =>
  import('./LoadingIndicator').then((module) => module.LoadingIndicator),
);

/** Starts loading the `LoadingIndicator` module, once; later calls return the same promise. */
export const preloadLoadingIndicator = indicator.preload;

/**
 * A `LoadingIndicator` whose module (its shapes and morphing) loads the first time it renders,
 * for components that show one only sometimes: an option list shows it only while `loading`.
 * Render it only while it should show. Until the module arrives it renders nothing, so place
 * it in a box that keeps its room; once loaded it renders at once.
 */
export const LazyLoadingIndicator = indicator.Component;

/**
 * Preloads the loading indicator when the pointer moves over `ref`'s element or focus enters
 * it, while `enabled` (the component may show one, e.g. it takes a `loading` prop), so it's
 * usually ready by the time it shows.
 */
export function usePreloadLoadingIndicator(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  usePreloadOnIntent(ref, indicator.preload, enabled);
}
