'use client';

import {
  BarChart,
  LineChart,
  type ChartPlace,
  type ChartSeries,
} from '@windmorph/react-pro/charts';
import { createElement } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const LineChartAny = loose(LineChart);
const BarChartAny = loose(BarChart);

/** Eight weeks, oldest first, for both previews. */
const WEEKS: ChartPlace[] = [
  { key: '2026-06-01', tick: '1 Jun', name: 'Week of 1 June' },
  { key: '2026-06-08', tick: '8 Jun', name: 'Week of 8 June' },
  { key: '2026-06-15', tick: '15 Jun', name: 'Week of 15 June' },
  { key: '2026-06-22', tick: '22 Jun', name: 'Week of 22 June' },
  { key: '2026-06-29', tick: '29 Jun', name: 'Week of 29 June' },
  { key: '2026-07-06', tick: '6 Jul', name: 'Week of 6 July' },
  { key: '2026-07-13', tick: '13 Jul', name: 'Week of 13 July' },
  { key: '2026-07-20', tick: '20 Jul', name: 'Week of 20 July' },
];

const SIGN_UPS: ChartSeries[] = [
  {
    key: 'this-year',
    label: 'This year',
    values: [1180, 1240, 1310, 1290, 1420, 1510, 1480, 1560],
  },
  { key: 'last-year', label: 'Last year', values: [980, 1010, 1060, 1040, 1120, 1150, 1130, 1190] },
];

const ORDERS: ChartSeries[] = [
  { key: 'web', label: 'Web', values: [312, 334, 351, 340, 368, 392, 377, 405] },
  { key: 'phone', label: 'Phone', values: [146, 139, 152, 160, 148, 155, 163, 151] },
  { key: 'store', label: 'In store', values: [88, 95, 102, 97, 91, 84, 79, 86] },
];

/** The snippets' places: the first weeks of the preview's, enough to paste and run. */
const WEEKS_CODE = `[
    { key: '2026-06-01', tick: '1 Jun', name: 'Week of 1 June' },
    { key: '2026-06-08', tick: '8 Jun', name: 'Week of 8 June' },
    { key: '2026-06-15', tick: '15 Jun', name: 'Week of 15 June' },
    { key: '2026-06-22', tick: '22 Jun', name: 'Week of 22 June' },
  ]`;
const SIGN_UPS_CODE = `[
    { key: 'this-year', label: 'This year', values: [1180, 1240, 1310, 1290] },
    { key: 'last-year', label: 'Last year', values: [980, 1010, 1060, 1040] },
  ]`;
const ORDERS_CODE = `[
    { key: 'web', label: 'Web', values: [312, 334, 351, 340] },
    { key: 'phone', label: 'Phone', values: [146, 139, 152, 160] },
    { key: 'store', label: 'In store', values: [88, 95, 102, 97] },
  ]`;

/** Why the charts' shared props have no control. */
const NOT_CONTROLLED = {
  formatValue:
    'A function of your own that writes each figure; the "Money in and out" example on the Bar chart page shows one.',
  formatAxis:
    'A function of your own that writes the side labels; the "Money in and out" example on the Bar chart page shows one.',
  placeLabel:
    "Names the places' column in a `ChartFrame`'s table view, which the preview has none of; the page examples show it.",
  hiddenSeries:
    'The keys of the series hidden; press a legend chip in the preview to hide one, and the "One legend for two charts" example on the Bar chart page keeps them in state.',
  defaultHiddenSeries:
    'The keys hidden at first; press a legend chip in the preview to hide one instead.',
};

const LEGEND_REASON =
  'The legend the chart draws for you with two or more series; the "One legend for two charts" example on the Bar chart page shows it on its own.';
const TOOLTIP_REASON =
  'The readout the chart draws for you: point at the preview, or Tab to it and use the arrow keys.';

/** The line and bar charts' playgrounds, by page slug. */
export const CHARTS_CARTESIAN_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'line-chart': {
    component: 'LineChart',
    importFrom: '@windmorph/react-pro/charts',
    notRendered: { ChartLegend: LEGEND_REASON, ChartTooltip: TOOLTIP_REASON },
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(LineChartAny, {
          ...props,
          // A new entrance plays as the remounted chart comes into view.
          key: String(props.entrance),
          'aria-label': 'Sign-ups',
          places: WEEKS,
          series: SIGN_UPS,
        }),
      ),
    defaultProps: {
      curve: 'monotone',
      entrance: 'rise',
      legend: true,
      texture: false,
      minHeight: 240,
    },
    initialState: { subject: 'this-year' },
    surfacedProps: ['subject', 'curve', 'entrance', 'legend', 'texture', 'minHeight'],
    enumOptions: { subject: ['this-year', 'last-year'] },
    groups: {
      subject: 'content',
      legend: 'content',
      texture: 'appearance',
      minHeight: 'appearance',
    },
    numberRanges: { minHeight: { min: 120, max: 480, step: 8 } },
    notControlled: NOT_CONTROLLED,
    codeSlots: { 'aria-label': '"Sign-ups"', places: WEEKS_CODE, series: SIGN_UPS_CODE },
  },
  'bar-chart': {
    component: 'BarChart',
    importFrom: '@windmorph/react-pro/charts',
    notRendered: { ChartLegend: LEGEND_REASON, ChartTooltip: TOOLTIP_REASON },
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(BarChartAny, {
          ...props,
          'aria-label': 'Orders by channel',
          places: WEEKS,
          series: ORDERS,
        }),
      ),
    defaultProps: { legend: true, texture: false, minHeight: 240 },
    surfacedProps: ['legend', 'texture', 'minHeight'],
    groups: { legend: 'content', texture: 'appearance', minHeight: 'appearance' },
    numberRanges: { minHeight: { min: 120, max: 480, step: 8 } },
    notControlled: NOT_CONTROLLED,
    codeSlots: { 'aria-label': '"Orders by channel"', places: WEEKS_CODE, series: ORDERS_CODE },
  },
};
