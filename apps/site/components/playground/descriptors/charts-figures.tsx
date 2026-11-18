'use client';

import { Meter, StatTile, type StatTileChange } from '@windmorph/react-pro/charts';
import { createElement } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const StatTileAny = loose(StatTile);
const MeterAny = loose(Meter);

/** The tile's trend: twelve weeks of orders, oldest first. */
const TREND = [212, 240, 231, 260, 298, 287, 310, 342, 330, 365, 401, 420];

/** The `change` control's choices: which way the number moved, and whether that is good news. */
const CHANGES: Record<string, StatTileChange | undefined> = {
  none: undefined,
  'up-good': { direction: 'up', tone: 'good', value: '12%', context: 'on last week' },
  'up-bad': { direction: 'up', tone: 'bad', value: '12%', context: 'on last week' },
  'down-good': { direction: 'down', tone: 'good', value: '4%', context: 'on last week' },
  'down-bad': { direction: 'down', tone: 'bad', value: '4%', context: 'on last week' },
  flat: { direction: 'flat', value: '0%', context: 'on last week' },
};

/** A change as the snippet writes it, its keys in the order they are written above. */
const changeCode = (change: StatTileChange) =>
  `{ ${Object.entries(change)
    .map(([key, value]) => `${key}: '${String(value)}'`)
    .join(', ')} }`;

/** The meter's amounts, in gigabytes, as the preview and the snippet write them. */
const gigabytes = (value: number) => `${value} GB`;

/** What is left under the limit, or how far past it the amount is, for the meter's `note`. */
const meterNote = (values: Record<string, unknown>) => {
  const value = Number(values.value);
  const max = Number(values.max);
  const apart = Math.round(Math.abs(max - value) * 10) / 10;
  return value > max ? `${gigabytes(apart)} over` : `${gigabytes(apart)} left`;
};

/** Playgrounds for the charts' figures, StatTile and Meter, by page slug. */
export const CHARTS_FIGURES_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'stat-tile': {
    component: 'StatTile',
    importFrom: '@windmorph/react-pro/charts',
    notRendered: {
      Sparkline:
        'The tile draws one from `trend`; the "A new period, and a trend on its own" example shows one standing alone, named.',
    },
    render: ({ change, trend, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-xs' },
        createElement(StatTileAny, {
          ...props,
          change: CHANGES[String(change)],
          trend: trend === true ? TREND : undefined,
        }),
      ),
    defaultProps: { size: 'md', change: 'none' },
    initialState: { label: 'Orders', value: 4218, change: 'up-good', trend: true },
    surfacedProps: ['label', 'value', 'unit', 'size', 'change', 'trend'],
    // A change is an object: the control picks one of a few, and the snippet writes it.
    enumOptions: { change: Object.keys(CHANGES) },
    controlKinds: { trend: 'boolean' },
    groups: { value: 'content', change: 'content' },
    numberRanges: { value: { min: 0, max: 20000, step: 1 } },
    toggledSlots: { trend: `[${TREND.join(', ')}]` },
    notControlled: {
      formatValue:
        "A function that writes the number; the preview keeps the default, in the page's locale, and the examples write minutes with one decimal.",
      icons: "Replacement arrows for the change; the preview keeps the tile's own.",
    },
    codeSlots: {
      change: (values) => {
        const change = CHANGES[String(values.change)];
        return change ? changeCode(change) : null;
      },
    },
  },
  meter: {
    component: 'Meter',
    importFrom: '@windmorph/react-pro/charts',
    notRendered: {
      MeterList:
        'A list of meters built from `rows`, each against its own limit; the "Plan limits, each against its own" example shows it, wide and narrow.',
    },
    render: ({ note, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-sm' },
        createElement(MeterAny, {
          ...props,
          formatValue: gigabytes,
          note: note === true ? meterNote(props) : undefined,
        }),
      ),
    defaultProps: { min: 0 },
    initialState: { label: 'Storage', value: 75.6, max: 100, warningAt: 80, note: true },
    surfacedProps: ['label', 'value', 'max', 'min', 'warningAt', 'note'],
    controlKinds: { note: 'boolean' },
    groups: { value: 'content', min: 'content' },
    numberRanges: {
      value: { min: 0, max: 150, step: 0.1 },
      max: { min: 10, max: 150, step: 1 },
      min: { min: 0, max: 50, step: 1 },
      warningAt: { min: 0, max: 150, step: 1 },
    },
    toggledSlots: { note: (values) => `"${meterNote(values)}"` },
    notControlled: {
      formatValue:
        'A function that writes the amount and the limit; the preview writes gigabytes, and the snippet writes the same function.',
      icons:
        "Replacement marks for the warning and critical states; the preview keeps the meter's own.",
    },
    codeSlots: { formatValue: '(gb) => `${gb} GB`' },
  },
};
