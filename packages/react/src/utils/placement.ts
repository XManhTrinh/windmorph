import type { Placement } from 'react-aria';

/**
 * React Aria's placement for one of ours: a hyphenated, logical value (`'bottom-start'`, as
 * Floating UI and most libraries write it) becomes its spaced, physical form (`'bottom left'`),
 * resolving `start` / `end` from the laid-out direction, since React Aria reads its locale
 * rather than the DOM's `dir`.
 */
export function toAriaPlacement(placement: string, rtl: boolean): Placement {
  return placement
    .replace('-', ' ')
    .replace('start', rtl ? 'right' : 'left')
    .replace('end', rtl ? 'left' : 'right') as Placement;
}
