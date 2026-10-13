'use client';

import { CalendarDate, Time } from '@internationalized/date';
import {
  Button,
  DatePicker,
  LinearProgressIndicator,
  List,
  ListItem,
  LoadingIndicator,
  PickerDialog,
  PullToRefresh,
  Snackbar,
  TimePicker,
  TimePickerModeToggle,
} from '@windmorph/react';
import {
  Alert,
  avatarShapes,
  EmptyState,
  LoadMore,
  Skeleton,
  SkeletonGroup,
} from '@windmorph/react-pro';
import { createElement, useState } from 'react';
import { CloseIcon, DynamicFeedIcon, StarIcon } from '../../icons';
import { loose, noop, STAR, svg, type PlaygroundDescriptor, type PlaygroundUpdate } from './shared';

const ButtonAny = loose(Button);
const LinearProgressIndicatorAny = loose(LinearProgressIndicator);
const LoadingIndicatorAny = loose(LoadingIndicator);
const PullToRefreshAny = loose(PullToRefresh);
const SkeletonAny = loose(Skeleton);
const EmptyStateAny = loose(EmptyState);
const AlertAny = loose(Alert);
const SnackbarAny = loose(Snackbar);
const LoadMoreAny = loose(LoadMore);
const DatePickerAny = loose(DatePicker);
const TimePickerAny = loose(TimePicker);
const PickerDialogAny = loose(PickerDialog);

const CLOSE = svg(
  'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z',
);

/** The shapes the loading indicator's `shapes` switch morphs through, live and as code. */
const LOADING_SHAPES = ['Heart', 'Flower', 'Clover4Leaf', 'Burst'] as const;
const LOADING_SHAPES_CODE = `[${LOADING_SHAPES.map((shape) => `'${shape}'`).join(', ')}]`;

/** The date the date pickers start on, and the window the min / max switches allow. */
const DATE = new CalendarDate(2030, 3, 14);
const MIN_DATE = new CalendarDate(2030, 3, 5);
const MAX_DATE = new CalendarDate(2030, 3, 25);
/** The people in the pull to refresh playground's list. */
const PULL_SENDERS = ['Alex', 'Sam', 'Priya', 'Zoë', 'Jonas', 'Mei', 'Omar', 'Lena'];

const CALENDAR_DATE_IMPORT = "import { CalendarDate } from '@internationalized/date';";
const BUTTON_IMPORT = "import { Button } from '@windmorph/react';";

/**
 * The picker dialog's preview: a trigger, and the dialog driven by the controls. It keeps the
 * time picker's mode, so the mode toggle switches the dial and the input.
 */
function PickerDialogPreview({
  values: { dismissButton, modeToggleButton, closeIcon, title, ...props },
  update,
}: {
  values: Record<string, unknown>;
  update: PlaygroundUpdate;
}) {
  const [mode, setMode] = useState<'dial' | 'input'>('dial');
  const close = () => update('open', false);
  const time = props.variant === 'time';
  return createElement(
    'div',
    { className: 'flex flex-col items-start' },
    createElement(ButtonAny, { onPress: () => update('open', true) }, 'Open the picker'),
    createElement(
      PickerDialogAny,
      {
        ...props,
        'aria-label': time ? 'Select time' : 'Select date',
        title: title === '' ? undefined : title,
        onOpenChange: (open: boolean) => update('open', open),
        onConfirm: close,
        confirmButton: createElement(ButtonAny, { variant: 'text', onPress: close }, 'OK'),
        ...(dismissButton === true && {
          dismissButton: createElement(ButtonAny, { variant: 'text', onPress: close }, 'Cancel'),
        }),
        ...(modeToggleButton === true && {
          modeToggleButton: createElement(TimePickerModeToggle, { mode, onModeChange: setMode }),
        }),
        ...(closeIcon === true && { closeIcon: createElement(CloseIcon) }),
      },
      time
        ? createElement(TimePickerAny, {
            defaultValue: new Time(7, 30),
            hourCycle: 12,
            mode,
            onModeChange: setMode,
          })
        : createElement(DatePickerAny, { defaultValue: DATE, yearRange: [2020, 2040] }),
    ),
  );
}

/** Playgrounds for Feedback and Pickers, by page slug. */
export const FEEDBACK_PICKERS_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  progress: {
    component: 'LinearProgressIndicator',
    render: (props) =>
      createElement(LinearProgressIndicatorAny, {
        ...props,
        'aria-label': 'Uploading',
        className: 'w-[280px]',
      }),
    defaultProps: { wavy: false, thickness: 4, track: true, stopIndicator: true },
    surfacedProps: ['value', 'wavy', 'thickness', 'trackThickness', 'track', 'stopIndicator'],
    initialState: { value: 0.4 },
    codeSlots: { 'aria-label': '"Uploading"', className: '"w-full"' },
  },
  'loading-indicator': {
    component: 'LoadingIndicator',
    render: ({ shapes, ...props }) =>
      createElement(LoadingIndicatorAny, {
        ...props,
        ...(shapes === true && { shapes: LOADING_SHAPES }),
        'aria-label': 'Loading',
      }),
    defaultProps: { variant: 'default', size: 48, shapes: false },
    surfacedProps: ['variant', 'size', 'value', 'shapes'],
    controlKinds: { shapes: 'boolean' },
    toggledSlots: { shapes: LOADING_SHAPES_CODE },
    codeSlots: { 'aria-label': '"Loading"' },
  },
  'pull-to-refresh': {
    component: 'PullToRefresh',
    // A pull sets `refreshing`, and the "refresh" ends 1.5 seconds later, as a request would.
    render: (props, update) =>
      createElement(
        PullToRefreshAny,
        {
          ...props,
          onRefresh: () => {
            update('refreshing', true);
            setTimeout(() => update('refreshing', false), 1500);
          },
          className:
            'h-[320px] w-[320px] max-w-full overflow-y-auto rounded-corner-large bg-surface-container-low',
        },
        <List aria-label="Messages">
          {PULL_SENDERS.map((name) => (
            <ListItem key={name}>{name}</ListItem>
          ))}
        </List>,
      ),
    defaultProps: { refreshing: false, threshold: 80, disabled: false },
    surfacedProps: ['refreshing', 'threshold', 'disabled'],
    controlKinds: { threshold: 'number' },
    importMembers: ['List', 'ListItem'],
    codeSlots: { onRefresh: '() => {}', className: '"h-80 overflow-y-auto"' },
    codeChildren:
      '<List aria-label="Messages">\n    <ListItem>Alex</ListItem>\n    <ListItem>Sam</ListItem>\n  </List>',
  },
  skeleton: {
    component: 'Skeleton',
    importFrom: '@windmorph/react-pro',
    render: ({ animation, corner, ...props }) =>
      createElement(
        SkeletonGroup,
        {
          label: 'Loading',
          animation: animation as 'pulse' | 'shimmer' | 'none',
          className: 'w-72',
        },
        createElement(SkeletonAny, {
          ...props,
          ...(corner !== 'default' && { corner }),
          ...(props.variant === 'circle' && { className: 'size-16' }),
        }),
      ),
    defaultProps: {
      variant: 'rectangle',
      corner: 'default',
      tone: 'highest',
      animation: 'pulse',
      typescale: 'body-medium',
      lines: 1,
    },
    surfacedProps: ['variant', 'animation', 'corner', 'tone', 'typescale', 'lines'],
    initialState: { variant: 'text', lines: 3, animation: 'pulse' },
    // `lines` and `typescale` belong to the text variant (the types say so).
    adjust: (values, changed) => {
      if (changed === 'lines' || changed === 'typescale') return { ...values, variant: 'text' };
      if (changed === 'variant' && values.variant !== 'text') {
        return { ...values, lines: 1, typescale: 'body-medium' };
      }
      return values;
    },
    enumOptions: {
      variant: ['rectangle', 'text', 'circle'],
      animation: ['pulse', 'shimmer', 'none'],
      corner: ['default', 'none', 'extra-small', 'small', 'medium', 'large', 'extra-large', 'full'],
      tone: ['highest', 'high'],
    },
  },
  alert: {
    component: 'Alert',
    importFrom: '@windmorph/react-pro',
    render: ({ icon, actions, focusOnMount, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(
          AlertAny,
          {
            ...props,
            // `focusOnMount` acts as the alert appears, so switching it shows the alert afresh.
            key: String(focusOnMount),
            focusOnMount,
            ...(icon === true && { icon: createElement(StarIcon) }),
            ...(actions === true && {
              actions: createElement(ButtonAny, { variant: 'text' }, 'Reset password'),
            }),
          },
          "That email and password don't match.",
        ),
      ),
    defaultProps: {
      tone: 'error',
      variant: 'tonal',
      titleAs: 'p',
      icon: false,
      actions: false,
      focusOnMount: false,
    },
    surfacedProps: ['tone', 'variant', 'title', 'titleAs', 'icon', 'actions', 'focusOnMount'],
    enumOptions: {
      tone: ['error', 'info', 'success', 'warning', 'neutral'],
      variant: ['tonal', 'outlined'],
    },
    controlKinds: { title: 'string', icon: 'boolean', actions: 'boolean' },
    toggledSlots: {
      icon: STAR,
      actions: '<Button variant="text">Reset password</Button>',
    },
    codeImports: [BUTTON_IMPORT],
    codeChildren: "That email and password don't match.",
  },
  'empty-state': {
    component: 'EmptyState',
    importFrom: '@windmorph/react-pro',
    render: ({ actions, ...props }) =>
      createElement(EmptyStateAny, {
        ...props,
        icon: createElement(DynamicFeedIcon),
        className: 'w-full max-w-md',
        ...(actions === true && {
          actions: createElement(ButtonAny, { variant: 'tonal' }, 'Create a post'),
        }),
      }),
    defaultProps: {
      variant: 'plain',
      size: 'md',
      tone: 'secondary',
      shape: 'circle',
      titleAs: 'p',
      announce: false,
      actions: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'tone',
      'shape',
      'title',
      'titleAs',
      'description',
      'actions',
      'announce',
    ],
    initialState: {
      variant: 'filled',
      title: 'No posts yet',
      description: 'Posts you share will appear here.',
      actions: true,
    },
    enumOptions: {
      variant: ['plain', 'filled', 'elevated', 'outlined'],
      size: ['sm', 'md', 'lg'],
      tone: ['primary', 'secondary', 'tertiary', 'neutral', 'error'],
      shape: [
        'circle',
        ...avatarShapes.filter((shape) => shape !== 'circle' && shape !== 'rounded'),
      ],
    },
    controlKinds: { title: 'string', description: 'string', actions: 'boolean' },
    toggledSlots: { actions: '<Button variant="tonal">Create a post</Button>' },
    codeImports: [BUTTON_IMPORT, "import { DynamicFeedIcon } from './icons';"],
    codeSlots: { icon: '<DynamicFeedIcon />' },
  },
  'load-more': {
    component: 'LoadMore',
    importFrom: '@windmorph/react-pro',
    render: ({ loading, end, ...props }) =>
      createElement(
        'div',
        { className: 'flex w-full max-w-sm flex-col gap-2' },
        ...['Phở', 'Bánh mì', 'Bún chả'].map((dish) =>
          createElement(
            'p',
            {
              key: dish,
              className:
                'rounded-corner-small bg-surface-container-high p-3 text-body-medium text-on-surface',
            },
            dish,
          ),
        ),
        createElement(LoadMoreAny, {
          key: 'more',
          ...props,
          onLoadMore: noop,
          ...(loading === true && {
            loading: createElement(
              'p',
              { className: 'text-body-medium text-on-surface-variant' },
              'Loading more dishes…',
            ),
          }),
          ...(end === true && {
            end: createElement(
              'p',
              { className: 'text-body-small text-on-surface-variant' },
              "That's everything",
            ),
          }),
        }),
      ),
    // `status` is required, so it has no default and the snippet always writes it.
    defaultProps: { auto: true, rootMargin: '800px 0px', loading: false, end: false },
    surfacedProps: ['status', 'auto', 'rootMargin', 'loading', 'end'],
    initialState: { status: 'idle', auto: false },
    controlKinds: { loading: 'boolean', end: 'boolean' },
    toggledSlots: {
      loading: '<p className="text-body-medium text-on-surface-variant">Loading more dishes…</p>',
      end: '<p className="text-body-small text-on-surface-variant">That&apos;s everything</p>',
    },
    codeSlots: { onLoadMore: '() => {}' },
  },
  snackbar: {
    component: 'Snackbar',
    render: ({ onDismiss, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-[480px]' },
        createElement(
          SnackbarAny,
          { ...props, onAction: noop, ...(onDismiss === true && { onDismiss: noop }) },
          'Message archived',
        ),
      ),
    defaultProps: { actionOnNewLine: false, dismissLabel: 'Dismiss', onDismiss: false },
    surfacedProps: ['actionLabel', 'actionOnNewLine', 'onDismiss', 'dismissLabel'],
    initialState: { actionLabel: 'Undo', onDismiss: true },
    controlKinds: { onDismiss: 'boolean' },
    toggledSlots: { onDismiss: '() => {}' },
    codeSlots: { onAction: '() => {}' },
    codeChildren: 'Message archived',
  },
  'date-picker': {
    component: 'DatePicker',
    render: ({ minValue, maxValue, yearRange, defaultMode, ...props }) =>
      createElement(
        'div',
        { className: 'w-fit max-w-full rounded-corner-extra-large bg-surface-container-high' },
        createElement(DatePickerAny, {
          ...props,
          // The mode applies as the picker mounts, so a change starts it afresh.
          key: String(defaultMode),
          defaultMode,
          defaultValue: DATE,
          ...(minValue === true && { minValue: MIN_DATE }),
          ...(maxValue === true && { maxValue: MAX_DATE }),
          ...(yearRange === true && { yearRange: [2020, 2040] }),
        }),
      ),
    defaultProps: {
      showHeader: true,
      showModeToggle: true,
      defaultMode: 'calendar',
      minValue: false,
      maxValue: false,
      yearRange: false,
    },
    surfacedProps: [
      'showHeader',
      'showModeToggle',
      'defaultMode',
      'minValue',
      'maxValue',
      'yearRange',
    ],
    controlKinds: { minValue: 'boolean', maxValue: 'boolean', yearRange: 'boolean' },
    toggledSlots: {
      minValue: 'new CalendarDate(2030, 3, 5)',
      maxValue: 'new CalendarDate(2030, 3, 25)',
      yearRange: '[2020, 2040]',
    },
    notControlled: {
      value:
        'A `CalendarDate` that the picker sets as you pick: the preview starts on `defaultValue` and is picked in place.',
      defaultValue:
        'A `CalendarDate` object: the preview starts on 14 March 2030, and the snippet writes it.',
    },
    codeImports: [CALENDAR_DATE_IMPORT],
    codeSlots: { defaultValue: 'new CalendarDate(2030, 3, 14)' },
  },
  'time-picker': {
    component: 'TimePicker',
    render: ({ hourCycle, ...props }, update) =>
      createElement(
        'div',
        {
          className:
            'w-fit max-w-full overflow-x-auto rounded-corner-extra-large bg-surface-container-high p-6',
        },
        createElement(TimePickerAny, {
          ...props,
          ...((hourCycle === 12 || hourCycle === 24) && { hourCycle }),
          defaultValue: new Time(14, 35),
          onModeChange: (mode: string) => update('mode', mode),
        }),
      ),
    defaultProps: { layout: 'auto', mode: 'dial' },
    surfacedProps: ['hourCycle', 'mode', 'layout'],
    initialState: { hourCycle: 12, layout: 'vertical' },
    // 12 or 24, a number: a number field writes `hourCycle={12}`, as the type wants.
    controlKinds: { hourCycle: 'number' },
    enumOptions: { hourCycle: ['12', '24'] },
    notControlled: {
      value:
        'A `Time` that the picker sets as you pick: the preview starts on `defaultValue` and is picked in place.',
      defaultValue: 'A `Time` object: the preview starts at 14:35, and the snippet writes it.',
    },
    codeImports: ["import { Time } from '@internationalized/date';"],
    codeSlots: { defaultValue: 'new Time(14, 35)' },
  },
  'picker-dialog': {
    component: 'PickerDialog',
    render: (props, update) => createElement(PickerDialogPreview, { values: props, update }),
    defaultProps: {
      open: false,
      variant: 'date',
      fullScreen: 'never',
      dismissable: true,
      dismissButton: false,
      modeToggleButton: false,
      closeIcon: false,
    },
    surfacedProps: [
      'open',
      'variant',
      'title',
      'fullScreen',
      'dismissable',
      'dismissButton',
      'modeToggleButton',
      'closeIcon',
    ],
    initialState: { dismissButton: true },
    controlKinds: {
      title: 'string',
      dismissButton: 'boolean',
      modeToggleButton: 'boolean',
      closeIcon: 'boolean',
    },
    toggledSlots: {
      dismissButton: '<Button variant="text">Cancel</Button>',
      modeToggleButton: '<TimePickerModeToggle mode="dial" onModeChange={() => {}} />',
      closeIcon: CLOSE,
    },
    importMembers: ['Button', 'DatePicker', 'TimePicker', 'TimePickerModeToggle'],
    codeImports: [CALENDAR_DATE_IMPORT, "import { Time } from '@internationalized/date';"],
    codeSlots: {
      'aria-label': '"Select date"',
      confirmButton: '<Button variant="text">OK</Button>',
      onConfirm: '() => {}',
    },
    codeChildren: (values) =>
      values.variant === 'time'
        ? '<TimePicker defaultValue={new Time(14, 35)} />'
        : '<DatePicker defaultValue={new CalendarDate(2030, 3, 14)} />',
  },
};
