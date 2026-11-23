import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro line and bar charts, by page slug. */
export const CHARTS_CARTESIAN_SPEC: Record<string, ComponentSpecData> = {
  'line-chart': {
    covers: [
      {
        name: 'A subject with a wash, and a line to compare with (`subject`)',
        kind: 'variant',
        examples: ['line-chart/line-chart-compare'],
      },
      {
        name: 'One series alone, with straight joins (`curve="linear"`)',
        kind: 'variant',
        examples: ['line-chart/line-chart-temperature'],
      },
      {
        name: 'Values below nought, and a gap where there is no value (`null`)',
        kind: 'configuration',
        examples: ['line-chart/line-chart-temperature'],
      },
      {
        name: 'Figures with a unit (`formatValue`)',
        kind: 'configuration',
        examples: ['line-chart/line-chart-temperature'],
      },
      {
        name: 'In a `ChartFrame`, with the same numbers in its table view (`placeLabel`)',
        kind: 'use case',
        examples: ['line-chart/line-chart-compare'],
      },
      {
        name: 'A window of live figures moving on, matched by `key`',
        kind: 'use case',
        examples: ['line-chart/line-chart-live'],
      },
    ],
    extensions: [
      {
        item: 'Built to Material’s data visualisation guidance',
        note: 'M3 has no chart component. This one takes M3’s colour roles, type scale and springs, with eight series colours generated for every built-in theme, mode and contrast level.',
      },
      {
        item: 'One keyboard stop',
        note: 'The chart is a slider over its places, a native range input, so the keyboard and a phone’s screen reader read each place with its values.',
      },
      {
        item: 'Motion matched by place',
        note: 'New numbers move the lines from where they are on the spatial spring; a place that keeps its `key` slides, and reduced motion takes the new shape at once.',
      },
    ],
    notBuilt: [
      {
        item: 'A second value axis',
        note: 'Never two value axes on one plot: two measures on different scales are two charts.',
      },
      {
        item: 'Zoom and pan',
        note: 'Not built: an app chooses the places to show, such as a period switch.',
      },
    ],
  },
  'bar-chart': {
    covers: [
      {
        name: 'Several series stacked into a total',
        kind: 'variant',
        examples: ['bar-chart/bar-chart-stacked', 'bar-chart/bar-chart-shared-legend'],
      },
      {
        name: 'Values below nought, stacked down from a nought line',
        kind: 'configuration',
        examples: ['bar-chart/bar-chart-below-nought'],
      },
      {
        name: 'Figures and side labels of your own (`formatValue`, `formatAxis`)',
        kind: 'configuration',
        examples: ['bar-chart/bar-chart-below-nought'],
      },
      {
        name: 'A new period, matched by `key`',
        kind: 'use case',
        examples: ['bar-chart/bar-chart-stacked'],
      },
      {
        name: 'In a `ChartFrame`, with a Total column in its table view',
        kind: 'use case',
        examples: ['bar-chart/bar-chart-stacked', 'bar-chart/bar-chart-below-nought'],
      },
      {
        name: 'One legend for several charts (`ChartLegend`, `chartColor`, `hiddenSeries`)',
        kind: 'use case',
        examples: ['bar-chart/bar-chart-shared-legend'],
      },
    ],
    extensions: [
      {
        item: 'Built to Material’s data visualisation guidance',
        note: 'M3 has no chart component. This one takes M3’s colour roles, shapes and springs, with eight series colours generated for every built-in theme, mode and contrast level.',
      },
      {
        item: 'One keyboard stop',
        note: 'The chart is a slider over its places, a native range input, so the keyboard and a phone’s screen reader read each place with its values and their total.',
      },
      {
        item: 'Diverging stacks',
        note: 'Parts below nought stack down from a nought line, so the total is what the bars draw.',
      },
    ],
    notBuilt: [
      {
        item: 'Grouped and horizontal bars',
        note: 'Not built: bars stand upright, alone or stacked.',
      },
    ],
  },
};
