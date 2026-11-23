import type { ComponentSpecData } from './types';

/** Spec data for the charts' figures (Windmorph Pro), by page slug. */
export const CHARTS_FIGURES_SPEC: Record<string, ComponentSpecData> = {
  'stat-tile': {
    covers: [
      {
        name: 'A change that is good, bad or neutral news, with a trend',
        kind: 'configuration',
        examples: ['stat-tile/stat-tile-dashboard'],
      },
      {
        name: 'Sizes: md and lg (`size`)',
        kind: 'variant',
        examples: ['stat-tile/stat-tile-sizes'],
      },
      {
        name: 'A unit and a format of your own (`unit`, `formatValue`)',
        kind: 'configuration',
        examples: ['stat-tile/stat-tile-sizes'],
      },
      {
        name: 'A figure with no value yet',
        kind: 'configuration',
        examples: ['stat-tile/stat-tile-sizes'],
      },
      {
        name: 'A new period, springing from the figure showing',
        kind: 'use case',
        examples: ['stat-tile/stat-tile-trend'],
      },
      {
        name: 'A `Sparkline` on its own, named',
        kind: 'configuration',
        examples: ['stat-tile/stat-tile-trend'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3 has no chart components; the tile and its sparkline follow M3’s colour roles, type scale and springs, with the chart palette’s first series colour on the trend’s newest value.',
      },
      {
        item: 'A number that counts',
        note: 'The figure counts up once as it first comes into view and springs to each new value, never past it; under reduced motion it changes at once, and the server’s HTML holds the final figure.',
      },
    ],
  },
  meter: {
    covers: [
      {
        name: 'Fine, close to the limit and over it (`warningAt`, `max`)',
        kind: 'configuration',
        examples: ['meter/meter-storage'],
      },
      {
        name: 'A note under the track (`note`)',
        kind: 'configuration',
        examples: ['meter/meter-storage'],
      },
      {
        name: 'Several amounts, each against its own limit (`MeterList`)',
        kind: 'variant',
        examples: ['meter/meter-limits'],
      },
      {
        name: 'A list in a narrow container, each track under its name',
        kind: 'configuration',
        examples: ['meter/meter-limits'],
      },
      {
        name: 'A new amount',
        kind: 'use case',
        examples: ['meter/meter-changing'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3 has no meter or chart components; this is a `role="meter"` from React Aria, drawn in M3’s colour roles, shapes and springs, with the theme’s warning and error roles for its states.',
      },
      {
        item: 'States in words',
        note: 'Near the limit and past it, the meter shows a mark and words and says them in its value text, never colour alone.',
      },
    ],
  },
};
