import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro media components, by page slug. */
export const MEDIA_PRO_SPEC: Record<string, ComponentSpecData> = {
  'duration-tag': {
    covers: [
      {
        name: 'A length on a card that is a link, read in words as part of its name',
        kind: 'use case',
        examples: ['duration-tag/duration-tag-card'],
      },
      {
        name: 'Raised clear of a progress line (`raised`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
      {
        name: 'Corners (`placement`) and a rounder frame (`--wm-media-frame-corner`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
      {
        name: 'Your own words and clock (`label`, `formatDuration`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3 has no length tag; the core list’s video item draws the same look for its own length, from the same formatters in the core’s primitives.',
      },
      {
        item: 'One look in every mode',
        note: 'The clock is the theme’s light neutral on `scrim` at 72% in light and dark mode alike, so it keeps 4.5:1 over a white picture without a theme scope of its own.',
      },
    ],
  },
};
