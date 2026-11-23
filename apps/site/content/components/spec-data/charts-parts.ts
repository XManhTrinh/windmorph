import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro charts of parts and the frame they sit in, by page slug. */
export const CHARTS_PARTS_SPEC: Record<string, ComponentSpecData> = {
  'segmented-bar': {
    covers: [
      {
        name: 'A bar that prints its shares, with a key below (`SegmentedBar`)',
        kind: 'variant',
        examples: ['segmented-bar/segmented-bar-parts'],
      },
      {
        name: 'A thin bar with the parts listed under it (`SegmentedList`)',
        kind: 'variant',
        examples: ['segmented-bar/segmented-bar-list', 'segmented-bar/segmented-bar-ordered'],
      },
      {
        name: 'More than six parts, folded into "Other"',
        kind: 'configuration',
        examples: ['segmented-bar/segmented-bar-parts'],
      },
      {
        name: 'Ordered parts in the theme’s ramp (`ordered`)',
        kind: 'configuration',
        examples: ['segmented-bar/segmented-bar-ordered'],
      },
      {
        name: 'A pattern per part, on by default (`texture`)',
        kind: 'configuration',
        examples: ['segmented-bar/segmented-bar-parts', 'segmented-bar/segmented-bar-list'],
      },
      {
        name: 'Amounts in a unit of your own (`formatValue`)',
        kind: 'configuration',
        examples: ['segmented-bar/segmented-bar-list'],
      },
    ],
    extensions: [
      {
        item: 'Built on M3’s foundations, for charts',
        note: 'M3 has no charts. The parts take the charts’ colour slots, generated from the theme and checked at 3:1 on every surface, with figures in white or black at 4.5:1, M3’s corner shapes and the spatial spring.',
      },
      {
        item: 'Read by pointer, finger and keyboard',
        note: 'The bar is one stop, a native range input over its parts, so a phone’s screen reader steps it too; the pointer and a finger read the part under them in a readout.',
      },
    ],
  },
  'ranked-bars': {
    covers: [
      {
        name: 'Largest first, with the rest last (`RankedBars`, `rest`)',
        kind: 'variant',
        examples: ['ranked-bars/ranked-bars-cities'],
      },
      {
        name: 'Steps with each one’s share of the step before (`FunnelBars`)',
        kind: 'variant',
        examples: ['ranked-bars/ranked-bars-funnel'],
      },
      {
        name: 'A narrow container: names on a line of their own',
        kind: 'configuration',
        examples: ['ranked-bars/ranked-bars-narrow'],
      },
    ],
    extensions: [
      {
        item: 'Built on M3’s foundations, for charts',
        note: 'M3 has no charts. The bars take the charts’ first colour slot, built from the theme’s primary, with the rest row in the quiet colour, M3’s type scale for names and amounts, and the spatial spring.',
      },
    ],
  },
  'chart-frame': {
    covers: [
      {
        name: 'A title that names the chart, a description and the table switch',
        kind: 'configuration',
        examples: ['chart-frame/chart-frame-table'],
      },
      {
        name: 'The table view as a list of figures in a narrow column',
        kind: 'configuration',
        examples: ['chart-frame/chart-frame-narrow'],
      },
      {
        name: 'Empty, loading, error and pending states',
        kind: 'configuration',
        examples: ['chart-frame/chart-frame-states'],
      },
      {
        name: 'Actions of your own in the header (`actions`)',
        kind: 'use case',
        examples: ['chart-frame/chart-frame-states'],
      },
    ],
    extensions: [
      {
        item: 'The core Card, with a table view',
        note: 'M3 has no chart container. This is the core `Card` with a heading that names the chart and a switch to a plain `DataTable` of the same numbers, loaded only when first asked for.',
      },
    ],
  },
};
