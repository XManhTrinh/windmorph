import type { ComponentAccessibility } from './types';

export const barChart: ComponentAccessibility = {
  keyboard: [
    {
      keys: ['Tab'],
      action:
        'Moves through the legend’s chips, one stop each, when there are two or more series, then to the chart itself: one stop, a slider over the places.',
    },
    { keys: ['Arrow Right', 'Arrow Up'], action: 'Reads the next place, towards the newest.' },
    { keys: ['Arrow Left', 'Arrow Down'], action: 'Reads the place before.' },
    { keys: ['Home', 'End'], action: 'Reads the first or the newest place.' },
    {
      keys: ['Page Up', 'Page Down'],
      action: 'Moves a tenth of the places forward or back, at least one.',
    },
    {
      keys: ['Enter', 'Space'],
      action:
        'Hides or shows the series. The last one shown can’t be hidden: its chip keeps its look and its tab stop, is `aria-disabled` and is described by `labels.lastSeries` ("The last series shown stays").',
      where: 'On a legend chip',
    },
    {
      keys: ['Escape'],
      action:
        'Hides the readout, wherever focus is for one the pointer shows. It shows again on another place (a key or the pointer), once the pointer leaves and comes back, or when the chart takes focus again. With no readout showing, Escape goes on, so a dialog round the chart still closes.',
    },
  ],
  keyboardNotes: [
    'The slider starts on the newest place each time it takes focus, or on the place a click or tap just read, and the keys go on from there.',
    'Right to left, Arrow Left moves forward and Arrow Right back, following the direction the chart is laid out in, a `dir` region of the page included.',
  ],
  screenReader: {
    role: 'A `slider`: a native range input over the plot, from the first place (0) to the newest. With two or more series, a `group` of toggle buttons (the legend) comes before it.',
    name: 'The chart’s `aria-label` or `aria-labelledby`, or its `ChartFrame`’s title. The legend is named `labels.legend` ("Series") and the chart’s name, so a page of charts holds no row of legends all called "Series"; each chip is named by its series’ label.',
    states:
      'Its `aria-valuetext` is the place’s `name`, each series on show with its value, then with two or more their total ("Week of 1 June: Web 312, Phone 146, In store 88. Total 546"), from `labels.describePlace` and `labels.total`. A value that is missing says "No value" (`labels.noValue`), and so does a total where no series has one. Each legend chip is pressed while its series shows.',
    notes: [
      'The axes, the bars and the readout are hidden from assistive technology (`aria-hidden`); the value text says the same, and a `ChartFrame`’s table view holds every value, with a Total column once there are two or more series.',
      'A hidden series leaves the value text and the total. It needs no live region: the value is read as the slider moves.',
      'Being a native range input, it can be stepped by a phone’s screen reader, which sends no key events (a swipe up or down).',
      'With no places it stays in the page and focusable, `aria-disabled` rather than disabled, so focus on it never drops to the page, and says "No value" rather than a bare 0.',
      'The value text follows the keys and a screen reader’s own steps, never the pointer hovering a focused chart, so what is heard doesn’t change under a resting mouse.',
      '`aria-describedby`, `aria-description`, `aria-roledescription`, the braille labels and `aria-details` go to the slider; other `aria-*` and `data-*` attributes go to the root.',
    ],
  },
  focus: [
    'The plot draws the M3 focus indicator round itself while the slider has keyboard focus; the readout shows the place being read, and the other places’ bars step back.',
    'A click or a tap on the plot reads that place and moves focus to the slider without scrolling, so the readout stays and the keys go on from there. A finger that scrolls the page moves no focus.',
    'Leaving the chart clears the place it read.',
    'Focus on a legend chip that goes (with its series, or with the whole legend) moves to the slider, so it never drops to the page.',
  ],
  touchTarget: [
    'The whole plot is the target, and each place takes its whole slot, however short its bars: a thin bar is as easy to read as a tall one.',
    'The legend’s chips are the core’s filter chips, 32px tall with 48px touch targets. A legend that wraps spaces its rows as the core’s chip set does, 48px apart top to top at any density, so the targets of two rows never overlap; `--wm-chart-legend-gap` sets the space beside each chip and above the plot.',
  ],
  motion: [
    'Bars rise one place after another once, as the chart first comes into view, and move to new numbers on the spatial spring. Under reduced motion they take their new size and place at once, with no one-after-another start, a bar that arrives once the chart is on screen fades in where it lands, and a place that leaves goes at once; stepping back while a place is read and a series hiding still fade.',
    'In forced colours each bar is `Canvas` with a `CanvasText` edge and its own hatch (slot 1 solid `CanvasText`, a quiet series dotted), and the legend and readout keys carry the same pattern, so a part is matched to its name without colour.',
  ],
  consumer: [
    'Name every chart: put it in a `ChartFrame`, whose title names it, or give it `aria-label` or `aria-labelledby`.',
    'Give each place a full `name` ("Week of 1 June"): it is what screen readers, the readout and the table say. The `tick` is only for the axis.',
    'Put units and currencies in `formatValue`, so the value text says them.',
    'Show every value another way too: a `ChartFrame` gives the table view, since the readout enhances and is hidden from assistive technology.',
    'Refer to series by name, never by colour alone. Keep `texture` on (it is, for two or more series) unless every series is told apart some other way, such as a label on each bar.',
    'Mark a part drawn only to compare with ("Other", everything else in a stack) `quiet`: it steps back in colour and is always dotted, so it is told apart without colour; its label still has to say what it is.',
    'A chart that updates by itself needs a way to pause it (WCAG 2.2.2).',
    'Translate `labels` (`describePlace`, `total`, `noValue`, `legend`, `lastSeries`, `place`), or set them once for the app with a `LabelsProvider` under `Chart`.',
    'For a theme of your own, add its chart palette with `withChartColors`, so the slots are made for it as the built-in themes’ are.',
  ],
};
