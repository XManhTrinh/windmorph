import type { ComponentSpecData } from './types';

/** Spec data for the Feedback and Pickers groups, by page slug. */
export const FEEDBACK_PICKERS_SPEC: Record<string, ComponentSpecData> = {
  snackbar: {
    spec: 'snackbar/specs',
    covers: [
      { name: 'Single line', kind: 'configuration', examples: ['snackbar/snackbar-layouts'] },
      {
        name: 'Single line with action',
        kind: 'configuration',
        examples: ['snackbar/snackbar-layouts'],
      },
      { name: 'Two lines', kind: 'configuration', examples: ['snackbar/snackbar-two-lines'] },
      {
        name: 'Two lines with action',
        kind: 'configuration',
        examples: ['snackbar/snackbar-two-lines'],
      },
      {
        name: 'Two lines with longer action',
        kind: 'configuration',
        examples: ['snackbar/snackbar-two-lines', 'snackbar/snackbar-layouts'],
      },
      {
        name: 'Close affordance (optional icon)',
        kind: 'configuration',
        examples: ['snackbar/snackbar-layouts'],
      },
      {
        name: 'Queued messages, one at a time',
        kind: 'use case',
        examples: ['snackbar/snackbar-host'],
      },
      {
        name: 'Replacing an outdated snackbar',
        kind: 'use case',
        examples: ['snackbar/snackbar-host'],
      },
    ],
    extensions: [
      {
        item: 'Pause on hover and focus',
        note: 'The auto-dismiss timer pauses while the pointer or focus is on the snackbar, so nobody loses the message (WCAG 2.2.1).',
      },
      {
        item: '`focusShortcut`',
        note: 'Alt+G (configurable, or `false`) moves focus to a snackbar with a control, the keyboard path the spec asks for on the web.',
      },
    ],
    compose: [
      {
        composable: 'SnackbarHost',
        component: 'SnackbarHost',
        params: [
          { compose: 'hostState', windmorph: 'state' },
          { compose: 'snackbar', windmorph: 'snackbar' },
          { compose: 'modifier', windmorph: 'className' },
        ],
      },
      {
        composable: 'SnackbarHostState',
        component: 'useSnackbarHostState',
        params: [
          {
            compose: 'showSnackbar(message, actionLabel, withDismissAction, duration)',
            windmorph: 'showSnackbar({ message, actionLabel, withDismissAction, duration })',
            note: 'Resolves `action-performed` or `dismissed`; `{ replace: true }` replaces the one on screen.',
          },
        ],
        note: 'A snackbar with an action never times out, as the spec requires; Compose lets one.',
      },
      {
        composable: 'Snackbar',
        component: 'Snackbar',
        params: [
          { compose: 'action', windmorph: 'actionLabel + onAction' },
          {
            compose: 'dismissAction',
            windmorph: 'onDismiss',
            note: 'Shows the close button, named by `labels.dismiss`.',
          },
          { compose: 'actionOnNewLine', windmorph: 'actionOnNewLine' },
          { compose: 'content', windmorph: 'children' },
        ],
      },
    ],
  },
  progress: {
    spec: 'progress-indicators/specs',
    covers: [
      {
        name: 'Linear progress indicator',
        kind: 'variant',
        examples: ['progress/progress-linear'],
      },
      {
        name: 'Circular progress indicator',
        kind: 'variant',
        examples: ['progress/progress-circular'],
      },
      {
        name: 'Behavior: determinate',
        kind: 'configuration',
        examples: ['progress/progress-linear', 'progress/progress-circular'],
      },
      {
        name: 'Behavior: indeterminate',
        kind: 'configuration',
        examples: ['progress/progress-linear', 'progress/progress-circular'],
      },
      {
        name: 'Track thickness: configurable',
        kind: 'configuration',
        examples: [
          'progress/progress-linear',
          'progress/progress-circular',
          'progress/progress-track',
        ],
      },
      {
        name: 'Shape: flat',
        kind: 'configuration',
        examples: ['progress/progress-linear', 'progress/progress-circular'],
      },
      {
        name: 'Shape: wavy',
        kind: 'configuration',
        examples: ['progress/progress-linear', 'progress/progress-circular'],
      },
      {
        name: 'Size: circular, 24 to 240dp',
        kind: 'configuration',
        examples: ['progress/progress-sizes'],
      },
      {
        name: 'Inside a button, without a track',
        kind: 'use case',
        examples: ['progress/progress-track'],
      },
    ],
    differences: [
      {
        item: 'Indeterminate circular keeps its track',
        note: 'Both the flat and the wavy indeterminate circular indicators draw their track, as the spec shows them moving along a fixed track; Compose hides the flat one’s.',
      },
    ],
    compose: [
      {
        composable: 'LinearProgressIndicator',
        component: 'LinearProgressIndicator',
        params: [
          { compose: 'progress', windmorph: 'value', note: 'Leave it out for indeterminate.' },
          {
            compose: 'Modifier.width(…)',
            windmorph: 'className',
            note: '240px by default; `w-full` spans the container.',
          },
          {
            compose: 'strokeCap, gapSize',
            windmorph: '—',
            note: 'Fixed to the spec: round caps and a 4px gap.',
          },
          {
            compose: 'trackColor = Color.Transparent',
            windmorph: 'track={false}',
          },
          { compose: 'drawStopIndicator', windmorph: 'stopIndicator' },
        ],
      },
      {
        composable: 'LinearWavyProgressIndicator',
        component: 'LinearProgressIndicator wavy',
        params: [
          { compose: 'stroke', windmorph: 'thickness' },
          { compose: 'trackStroke', windmorph: 'trackThickness' },
        ],
      },
      {
        composable: 'CircularProgressIndicator',
        component: 'CircularProgressIndicator',
        params: [
          { compose: 'progress', windmorph: 'value' },
          {
            compose: 'Modifier.size(…)',
            windmorph: 'size',
            note: 'In px, clamped to the spec’s 24–240px; the strokes keep their thickness.',
          },
          { compose: 'strokeWidth', windmorph: 'thickness' },
          { compose: 'trackColor = Color.Transparent', windmorph: 'track={false}' },
        ],
      },
      {
        composable: 'CircularWavyProgressIndicator',
        component: 'CircularProgressIndicator wavy',
        params: [
          { compose: 'stroke', windmorph: 'thickness' },
          { compose: 'trackStroke', windmorph: 'trackThickness' },
        ],
      },
    ],
  },
  'loading-indicator': {
    spec: 'loading-indicator/specs',
    covers: [
      {
        name: 'Loading indicator',
        kind: 'variant',
        examples: ['loading-indicator/loading-indeterminate'],
      },
      {
        name: 'Containment: default',
        kind: 'configuration',
        examples: ['loading-indicator/loading-indeterminate', 'loading-indicator/loading-shapes'],
      },
      {
        name: 'Containment: contained',
        kind: 'configuration',
        examples: [
          'loading-indicator/loading-indeterminate',
          'loading-indicator/loading-determinate',
        ],
      },
      {
        name: 'Following a gesture (pull to refresh)',
        kind: 'use case',
        examples: ['loading-indicator/loading-determinate'],
      },
      {
        name: 'Size: 48dp by default, flexible from 24 to 240dp',
        kind: 'configuration',
        examples: ['loading-indicator/loading-determinate'],
      },
    ],
    compose: [
      {
        composable: 'LoadingIndicator',
        component: 'LoadingIndicator',
        params: [
          { compose: 'progress', windmorph: 'value', note: 'Leave it out for indeterminate.' },
          {
            compose: 'polygons',
            windmorph: 'shapes',
            note: 'MaterialShapes names or RoundedPolygons.',
          },
        ],
      },
      {
        composable: 'ContainedLoadingIndicator',
        component: 'LoadingIndicator variant="contained"',
        params: [
          { compose: 'containerColor, indicatorColor', windmorph: 'classNames, or the tokens' },
        ],
      },
    ],
  },
  'pull-to-refresh': {
    spec: 'loading-indicator/specs',
    covers: [
      {
        name: 'Pull to refresh (loading indicator guidelines)',
        kind: 'use case',
        examples: ['pull-to-refresh/pull-to-refresh-basic', 'pull-to-refresh/pull-to-refresh-feed'],
      },
      {
        name: 'Containment: contained, used with pull to refresh',
        kind: 'configuration',
        examples: ['pull-to-refresh/pull-to-refresh-basic'],
      },
      {
        name: 'Threshold before a refresh; reversing past it cancels',
        kind: 'configuration',
        examples: ['pull-to-refresh/pull-to-refresh-threshold'],
      },
      {
        name: 'Visible until the refresh completes',
        kind: 'use case',
        examples: ['pull-to-refresh/pull-to-refresh-feed'],
      },
      {
        name: 'Refresh without relying on a gesture',
        kind: 'use case',
        examples: ['pull-to-refresh/pull-to-refresh-button'],
      },
    ],
    extensions: [
      {
        item: 'On the web',
        note: 'The spec says the loading indicator is used in pull to refresh on Jetpack Compose only; this brings the same behaviour to touch, mouse and pen on the web.',
      },
      {
        item: 'Promise-driven refreshing',
        note: 'Without `refreshing`, a promise returned by `onRefresh` keeps the indicator until it settles.',
      },
      {
        item: 'Announcements',
        note: 'A polite live region announces the start and the end of each refresh (`labels`).',
      },
    ],
    notBuilt: [
      {
        item: 'Arrow indicator',
        note: "Compose's older `PullToRefreshDefaults.Indicator` (an arrow on a circular indicator) isn't built: M3 Expressive uses the loading indicator.",
      },
    ],
    compose: [
      {
        composable: 'PullToRefreshBox',
        component: 'PullToRefresh',
        params: [
          { compose: 'isRefreshing', windmorph: 'refreshing' },
          { compose: 'onRefresh', windmorph: 'onRefresh', note: 'May return a promise.' },
          { compose: 'enabled', windmorph: 'disabled', note: 'Inverted.' },
          { compose: 'threshold', windmorph: 'threshold', note: 'In px; 80 by default.' },
          {
            compose: 'indicator',
            windmorph: 'classNames.indicator',
            note: 'Always `PullToRefreshDefaults.LoadingIndicator`.',
          },
        ],
      },
      {
        composable: 'Modifier.pullToRefresh',
        component: 'PullToRefresh',
        note: 'Wrap the scroll container, or the page.',
      },
    ],
  },
  'date-picker': {
    spec: 'date-pickers/specs',
    covers: [
      { name: 'Docked date picker', kind: 'variant', examples: ['date-picker/date-field'] },
      {
        name: 'Modal date picker',
        kind: 'variant',
        examples: ['date-picker/date-picker-modal', 'date-picker/date-picker-basic'],
      },
      { name: 'Modal date input', kind: 'variant', examples: ['date-picker/date-input'] },
      {
        name: 'Docked: day, month and year selection',
        kind: 'configuration',
        examples: ['date-picker/date-field'],
      },
      {
        name: 'Modal: single date selection',
        kind: 'configuration',
        examples: ['date-picker/date-picker-modal', 'date-picker/date-picker-basic'],
      },
      {
        name: 'Modal: date range selection',
        kind: 'configuration',
        examples: ['date-picker/date-range-modal', 'date-picker/date-range'],
      },
      {
        name: 'Modal: year selection',
        kind: 'configuration',
        examples: ['date-picker/date-picker-basic', 'date-picker/date-picker-modal'],
      },
      {
        name: 'Modal input: single date input',
        kind: 'configuration',
        examples: ['date-picker/date-input'],
      },
      {
        name: 'Modal input: date range input',
        kind: 'configuration',
        examples: ['date-picker/date-input'],
      },
      {
        name: 'Full screen on compact windows',
        kind: 'use case',
        examples: ['date-picker/date-range-modal', 'date-picker/date-picker-modal'],
      },
    ],
    extensions: [
      {
        item: 'Density of the typed fields',
        note: "`density` (0 to -3, or the theme's) takes 4px a step off the docked field and the input mode's fields, as text fields; the calendar keeps its 48px days, since M3 doesn't make date pickers denser.",
      },
      {
        item: '`monthLayout="paged"`',
        note: 'The range picker scrolls a vertical list of months as the spec says; `paged` shows one month at a time instead.',
      },
    ],
    notBuilt: [
      {
        item: 'Docked date range',
        note: 'The spec’s docked picker is single-date; a range uses the modal range picker.',
      },
    ],
    compose: [
      {
        composable: 'DatePicker',
        component: 'DatePicker',
        params: [
          {
            compose: 'rememberDatePickerState(initialSelectedDateMillis)',
            windmorph: 'value / defaultValue',
            note: 'A `CalendarDate`, not milliseconds.',
          },
          { compose: 'initialDisplayMode', windmorph: 'defaultMode' },
          { compose: 'yearRange', windmorph: 'yearRange' },
          {
            compose: 'selectableDates',
            windmorph: 'min, max, isDateUnavailable',
          },
          { compose: 'showModeToggle', windmorph: 'showModeToggle' },
          { compose: 'title, headline', windmorph: 'showHeader, labels' },
        ],
      },
      {
        composable: 'DateRangePicker',
        component: 'DateRangePicker',
        params: [
          {
            compose:
              'rememberDateRangePickerState(initialSelectedStartDateMillis, initialSelectedEndDateMillis)',
            windmorph: 'value / defaultValue',
            note: 'A `{ start, end }` pair of `CalendarDate`s.',
          },
        ],
      },
      {
        composable: 'DatePickerDialog',
        component: 'PickerDialog',
        params: [
          { compose: 'confirmButton', windmorph: 'confirmButton' },
          { compose: 'dismissButton', windmorph: 'dismissButton' },
          { compose: 'onDismissRequest', windmorph: 'onOpenChange' },
        ],
      },
      {
        composable: 'DatePicker in a docked field (no Compose counterpart)',
        component: 'DateField',
        note: 'Compose has no docked date picker; `DateField` is the spec’s docked variant.',
      },
    ],
  },
  'time-picker': {
    spec: 'time-pickers/specs',
    covers: [
      {
        name: 'Time picker dial',
        kind: 'variant',
        examples: ['time-picker/time-picker-dial', 'time-picker/time-picker-modes'],
      },
      { name: 'Time picker input', kind: 'variant', examples: ['time-picker/time-picker-modes'] },
      {
        name: 'Vertical layout',
        kind: 'configuration',
        examples: ['time-picker/time-picker-dial'],
      },
      {
        name: 'Horizontal layout',
        kind: 'configuration',
        examples: ['time-picker/time-picker-modes'],
      },
      {
        name: '24-hour time picker dial',
        kind: 'configuration',
        examples: ['time-picker/time-picker-modes'],
      },
      {
        name: 'Modal, with a dial / input toggle',
        kind: 'use case',
        examples: ['time-picker/time-picker-modal'],
      },
    ],
    differences: [
      {
        item: '24-hour ring layout',
        note: '00–11 sit on the outer ring and 12–23 on the inner one, as the spec’s image, Compose and Android show; one sentence of the guidelines says even and odd numbers instead.',
      },
    ],
    extensions: [
      {
        item: 'Density of the input mode',
        note: "`density` (0 to -3, or the theme's) takes 4px a step off the typed hour and minute fields; the dial keeps its size, since M3 doesn't make time pickers denser.",
      },
      {
        item: '`layout="auto"` and `useTimePickerRoom`',
        note: 'Picks the vertical layout, the horizontal one or the input from the window’s room, so the picker never scrolls, as the spec asks.',
      },
    ],
    notBuilt: [
      {
        item: 'Input validation messages',
        note: 'An out-of-range hour or minute is marked invalid, without a written message yet.',
      },
    ],
    compose: [
      {
        composable: 'TimePicker',
        component: 'TimePicker',
        params: [
          {
            compose: 'rememberTimePickerState(initialHour, initialMinute)',
            windmorph: 'value / defaultValue',
            note: 'A `Time` from `@internationalized/date`.',
          },
          { compose: 'is24Hour', windmorph: 'hourCycle={24}' },
          { compose: 'layoutType', windmorph: 'layout' },
        ],
      },
      { composable: 'TimeInput', component: 'TimePicker mode="input"' },
      {
        composable: 'TimePickerDialog',
        component: 'PickerDialog variant="time"',
        params: [
          { compose: 'title', windmorph: 'title' },
          { compose: 'modeToggleButton', windmorph: 'modeToggleButton' },
        ],
      },
      {
        composable: 'TimePickerDialogDefaults.DisplayModeToggle',
        component: 'TimePickerModeToggle',
        note: 'Its names come from `labels.inputMode` and `labels.dialMode`, the same object as the time picker’s `labels`.',
      },
    ],
  },
  'picker-dialog': {
    spec: 'date-pickers/specs',
    covers: [
      {
        name: 'Modal date picker',
        kind: 'variant',
        examples: ['picker-dialog/picker-dialog-date'],
      },
      {
        name: 'Modal time picker',
        kind: 'variant',
        examples: ['picker-dialog/picker-dialog-time'],
      },
      {
        name: 'Full-screen modal date picker',
        kind: 'configuration',
        examples: ['picker-dialog/picker-dialog-full-screen'],
      },
      {
        name: 'Close affordance and Save in full screen',
        kind: 'configuration',
        examples: ['picker-dialog/picker-dialog-full-screen'],
      },
      {
        name: 'Mode toggle in the actions',
        kind: 'configuration',
        examples: ['picker-dialog/picker-dialog-time'],
      },
    ],
    extensions: [
      {
        item: 'One dialog for both pickers',
        note: '`variant` (`date` or `time`) covers what Compose splits into `DatePickerDialog` and `TimePickerDialog`.',
      },
      {
        item: '`children` as a function',
        note: '`children` may be a function of `{ close }`, so a confirm action can apply its value and close in one place.',
      },
    ],
    compose: [
      {
        composable: 'DatePickerDialog',
        component: 'PickerDialog',
        params: [
          { compose: 'onDismissRequest', windmorph: 'onOpenChange' },
          { compose: 'confirmButton', windmorph: 'confirmButton' },
          { compose: 'dismissButton', windmorph: 'dismissButton' },
          {
            compose: 'properties (DialogProperties)',
            windmorph: 'dismissable, fullScreen',
            note: 'Compose has no full-screen date picker; the spec recommends one on compact windows.',
          },
        ],
      },
      {
        composable: 'TimePickerDialog',
        component: 'PickerDialog variant="time"',
        params: [{ compose: 'modeToggleButton', windmorph: 'modeToggleButton' }],
      },
    ],
  },
  alert: {
    covers: [
      {
        name: 'Tone: error, info, success, warning, neutral',
        kind: 'variant',
        examples: ['alert/alert-tones', 'alert/alert-form-error'],
      },
      { name: 'Variant: tonal and outlined', kind: 'variant', examples: ['alert/alert-tones'] },
      {
        name: 'With a title',
        kind: 'configuration',
        examples: ['alert/alert-tones', 'alert/alert-dismissible'],
      },
      { name: 'With actions', kind: 'configuration', examples: ['alert/alert-form-error'] },
      { name: 'Dismissible', kind: 'configuration', examples: ['alert/alert-dismissible'] },
      {
        name: 'Leaving with its exit motion (`open={false}`)',
        kind: 'configuration',
        examples: ['alert/alert-dismissible'],
      },
      { name: 'A form’s error', kind: 'use case', examples: ['alert/alert-form-error'] },
    ],
  },
  'load-more': {
    covers: [
      {
        name: 'Load more button (manual)',
        kind: 'configuration',
        examples: ['load-more/load-more-list'],
      },
      {
        name: 'Loading as you scroll (auto)',
        kind: 'configuration',
        examples: ['load-more/load-more-auto'],
      },
      {
        name: 'Status: idle, loading, error, done',
        kind: 'variant',
        examples: ['load-more/load-more-list', 'load-more/load-more-auto'],
      },
      {
        name: 'Retry after a failed page',
        kind: 'use case',
        examples: ['load-more/load-more-list'],
      },
      {
        name: 'Custom loading and end content',
        kind: 'configuration',
        examples: ['load-more/load-more-auto'],
      },
    ],
  },
  skeleton: {
    covers: [
      {
        name: 'Variant: rectangle, circle, text',
        kind: 'variant',
        examples: ['skeleton/skeleton-variants', 'skeleton/skeleton-animations'],
      },
      {
        name: 'Animation: pulse, shimmer, none',
        kind: 'configuration',
        examples: ['skeleton/skeleton-animations'],
      },
      {
        name: 'Tone: highest and high',
        kind: 'configuration',
        examples: ['skeleton/skeleton-variants'],
      },
      {
        name: 'Text lines sized to the type scale',
        kind: 'configuration',
        examples: ['skeleton/skeleton-variants', 'skeleton/skeleton-cards'],
      },
      {
        name: 'Placeholder for a list of cards',
        kind: 'use case',
        examples: ['skeleton/skeleton-cards'],
      },
    ],
  },
  'empty-state': {
    covers: [
      {
        name: 'Variant: plain, filled, elevated, outlined',
        kind: 'variant',
        examples: ['empty-state/empty-state-variants', 'empty-state/empty-state-no-posts'],
      },
      {
        name: 'Size: sm, md, lg',
        kind: 'configuration',
        examples: [
          'empty-state/empty-state-variants',
          'empty-state/empty-state-search',
          'empty-state/empty-state-retry',
        ],
      },
      {
        name: 'Tone and an M3 Expressive shape',
        kind: 'configuration',
        examples: ['empty-state/empty-state-search', 'empty-state/empty-state-retry'],
      },
      {
        name: 'Nothing here yet',
        kind: 'use case',
        examples: ['empty-state/empty-state-no-posts'],
      },
      {
        name: 'No results, announced',
        kind: 'use case',
        examples: ['empty-state/empty-state-search'],
      },
      {
        name: 'Couldn’t load, with a retry',
        kind: 'use case',
        examples: ['empty-state/empty-state-retry'],
      },
    ],
  },
};
