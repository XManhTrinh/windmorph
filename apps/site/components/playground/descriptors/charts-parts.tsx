'use client';

import { Button } from '@windmorph/react';
import {
  ChartFrame,
  FunnelBars,
  RankedBars,
  SegmentedBar,
  SegmentedList,
} from '@windmorph/react-pro/charts';
import { createElement } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const SegmentedBarAny = loose(SegmentedBar);
const SegmentedListAny = loose(SegmentedList);
const RankedBarsAny = loose(RankedBars);
const FunnelBarsAny = loose(FunnelBars);
const ChartFrameAny = loose(ChartFrame);
const ButtonAny = loose(Button);

const BUTTON_IMPORT = "import { Button } from '@windmorph/react';";

/** The parts the segmented previews show: a whole by device, or a survey's ordered answers. */
const VISITS = [
  { key: 'phone', label: 'Phone', value: 5120 },
  { key: 'desktop', label: 'Desktop', value: 2980 },
  { key: 'tablet', label: 'Tablet', value: 610 },
  { key: 'tv', label: 'Television', value: 240 },
];
const ANSWERS = [
  { key: 'never', label: 'Never', value: 120 },
  { key: 'rarely', label: 'Rarely', value: 210 },
  { key: 'sometimes', label: 'Sometimes', value: 340 },
  { key: 'often', label: 'Often', value: 260 },
  { key: 'always', label: 'Always', value: 90 },
];
const VISITS_CODE = `[
    { key: 'phone', label: 'Phone', value: 5120 },
    { key: 'desktop', label: 'Desktop', value: 2980 },
    { key: 'tablet', label: 'Tablet', value: 610 },
    { key: 'tv', label: 'Television', value: 240 },
  ]`;
const ANSWERS_CODE = `[
    { key: 'never', label: 'Never', value: 120 },
    { key: 'rarely', label: 'Rarely', value: 210 },
    { key: 'sometimes', label: 'Sometimes', value: 340 },
    { key: 'often', label: 'Often', value: 260 },
    { key: 'always', label: 'Always', value: 90 },
  ]`;

/** The rows the ranked preview shows, in no order, with the rest last. */
const CITIES = [
  { key: 'lyon', label: 'Lyon', value: 412 },
  { key: 'paris', label: 'Paris', value: 1204 },
  { key: 'hamburg', label: 'Hamburg', value: 655 },
  { key: 'rest', label: 'Everywhere else', value: 920, rest: true },
];
const CITIES_CODE = `[
    { key: 'lyon', label: 'Lyon', value: 412 },
    { key: 'paris', label: 'Paris', value: 1204 },
    { key: 'hamburg', label: 'Hamburg', value: 655 },
    { key: 'rest', label: 'Everywhere else', value: 920, rest: true },
  ]`;
const CHECKOUT = [
  { key: 'cart', label: 'Added to cart', value: 1200 },
  { key: 'details', label: 'Entered delivery details', value: 780 },
  { key: 'paid', label: 'Paid', value: 548 },
];
const CHECKOUT_CODE = `[
    { key: 'cart', label: 'Added to cart', value: 1200 },
    { key: 'details', label: 'Entered delivery details', value: 780 },
    { key: 'paid', label: 'Paid', value: 548 },
  ]`;

/** The chart the frame preview holds: a segmented bar, which gives the frame its table. */
const FRAME_PARTS = VISITS.slice(0, 3);
const FRAME_CHILD_CODE = `<SegmentedBar
    parts={[
      { key: 'phone', label: 'Phone', value: 5120 },
      { key: 'desktop', label: 'Desktop', value: 2980 },
      { key: 'tablet', label: 'Tablet', value: 610 },
    ]}
  />`;

/** Playgrounds for the charts of parts and the frame charts sit in, by page slug. */
export const CHARTS_PARTS_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'segmented-bar': {
    component: 'SegmentedBar',
    importFrom: '@windmorph/react-pro/charts',
    componentSwitch: {
      control: 'form',
      components: { bar: 'SegmentedBar', list: 'SegmentedList' },
    },
    // Ordered parts need parts with an order, so `ordered` shows a survey's answers.
    render: ({ form, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(form === 'list' ? SegmentedListAny : SegmentedBarAny, {
          ...props,
          'aria-label': props.ordered ? 'How often people cycle to work' : 'Visits by device',
          parts: props.ordered ? ANSWERS : VISITS,
        }),
      ),
    defaultProps: { ordered: false, texture: false },
    surfacedProps: ['form', 'ordered', 'texture'],
    // Both change only how the parts are painted.
    groups: { ordered: 'appearance', texture: 'appearance' },
    controlDescriptions: {
      form: 'A bar that prints each share on its part, with a key below (`SegmentedBar`), or a thin bar with each part’s name, share and amount listed under it (`SegmentedList`).',
    },
    notControlled: {
      formatValue:
        'A function that writes each amount; the "A list of the parts" example writes gigabytes.',
      formatShare: 'A function that writes each share, 0 to 1; a whole percentage by default.',
    },
    codeSlots: {
      'aria-label': (values) =>
        values.ordered ? '"How often people cycle to work"' : '"Visits by device"',
      parts: (values) => (values.ordered ? ANSWERS_CODE : VISITS_CODE),
    },
  },
  'ranked-bars': {
    component: 'RankedBars',
    importFrom: '@windmorph/react-pro/charts',
    componentSwitch: {
      control: 'chart',
      components: { ranked: 'RankedBars', funnel: 'FunnelBars' },
    },
    // A funnel takes no `sort`: its steps keep their order.
    render: ({ chart, sort, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        chart === 'funnel'
          ? createElement(FunnelBarsAny, { ...props, 'aria-label': 'Checkout', steps: CHECKOUT })
          : createElement(RankedBarsAny, {
              ...props,
              sort,
              'aria-label': 'Orders by city',
              rows: CITIES,
            }),
      ),
    defaultProps: { sort: 'descending' },
    surfacedProps: ['chart', 'sort'],
    controlDescriptions: {
      chart:
        'Parts ranked largest first, with the rest last (`RankedBars`), or the steps of a funnel in their own order, each with its share of the step before (`FunnelBars`).',
    },
    notControlled: {
      formatValue: 'A function that writes each amount; the page’s locale writes them by default.',
      formatShare:
        'A function that writes each funnel step’s share of the step before; a whole percentage by default.',
    },
    codeSlots: {
      'aria-label': (values) => (values.chart === 'funnel' ? '"Checkout"' : '"Orders by city"'),
      rows: (values) => (values.chart === 'funnel' ? null : CITIES_CODE),
      steps: (values) => (values.chart === 'funnel' ? CHECKOUT_CODE : null),
    },
  },
  'chart-frame': {
    component: 'ChartFrame',
    importFrom: '@windmorph/react-pro/charts',
    // The table switch sets `showTable`, and Try again clears the error, as a reload would. A
    // cleared text control is no state at all, so the frame shows the chart again.
    render: ({ actions, headingLevel, description, empty, error, ...props }, update) =>
      createElement(
        ChartFrameAny,
        {
          ...props,
          title: 'Visits by device',
          headingLevel: headingLevel == null ? undefined : Number(headingLevel),
          description: description || undefined,
          empty: empty || undefined,
          error: error || undefined,
          showTable: props.showTable === true,
          onShowTableChange: (show: boolean) => update('showTable', show),
          onRetry: () => update('error', ''),
          className: 'w-full max-w-md',
          ...(actions === true && {
            actions: createElement(ButtonAny, { variant: 'text' }, 'Download'),
          }),
        },
        createElement(SegmentedBarAny, { parts: FRAME_PARTS }),
      ),
    defaultProps: {
      variant: 'filled',
      headingLevel: 3,
      actions: false,
      showTable: false,
      pending: false,
      loading: false,
      minHeight: 240,
    },
    initialState: { description: 'This month', minHeight: 160 },
    surfacedProps: [
      'variant',
      'headingLevel',
      'description',
      'actions',
      'showTable',
      'pending',
      'loading',
      'empty',
      'error',
      'minHeight',
    ],
    enumOptions: { headingLevel: ['2', '3', '4', '5', '6'] },
    // The heading level is a number, so the snippet writes it as one.
    controlKinds: {
      headingLevel: 'number',
      description: 'string',
      actions: 'boolean',
      empty: 'string',
      error: 'string',
    },
    toggledSlots: { actions: '<Button variant="text">Download</Button>' },
    numberRanges: { minHeight: { min: 80, max: 480, step: 20 } },
    notControlled: {
      table:
        'Rows of your own for the table view, or `false` for none; the preview’s segmented bar gives the frame its own.',
      icons: 'Replacement icons for the table switch and the error.',
    },
    importMembers: ['SegmentedBar'],
    codeImports: [BUTTON_IMPORT],
    codeSlots: {
      title: '"Visits by device"',
      onRetry: (values) => (values.error ? '() => {}' : null),
    },
    codeChildren: FRAME_CHILD_CODE,
  },
};
