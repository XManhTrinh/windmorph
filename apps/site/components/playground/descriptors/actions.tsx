'use client';

import {
  Button,
  ButtonGroup,
  ExtendedFab,
  Fab,
  FabMenu,
  FabMenuItem,
  IconButton,
  Menu,
  MenuItem,
  SplitButton,
} from '@windmorph/react';
import { ReactionPicker, ReactionSummary } from '@windmorph/react-pro';
import { createElement } from 'react';
import { AddIcon, CloseIcon, EditIcon, SendIcon, StarIcon, StarOutlineIcon } from '../../icons';
import {
  ADD,
  adjustToggleForm,
  asDensity,
  DENSITY_OPTIONS,
  EDIT,
  loose,
  type PlaygroundDescriptor,
  SEND,
  STAR,
} from './shared';

const ButtonAny = loose(Button);
const IconButtonAny = loose(IconButton);
const ButtonGroupAny = loose(ButtonGroup);
const SplitButtonAny = loose(SplitButton);
const FabAny = loose(Fab);
const ExtendedFabAny = loose(ExtendedFab);
const FabMenuAny = loose(FabMenu);
const FabMenuItemAny = loose(FabMenuItem);
const ReactionPickerAny = loose(ReactionPicker);
const ReactionSummaryAny = loose(ReactionSummary);

/** Material Symbols `star` (outlined) and `close`, for the snippets. */
const STAR_OUTLINE = '<StarOutlineIcon />';
const CLOSE = '<CloseIcon />';

/** The button group's buttons: a calendar's views. */
const VIEWS = ['Day', 'Week', 'Month'];

/** Why `as` and `preventFocusOnPress` have no control. */
const NO_VISIBLE_EFFECT = {
  as: 'Only changes the rendered element for a custom wrapper; nothing the preview shows.',
  preventFocusOnPress: 'Only keeps focus where it was on press; nothing the preview shows.',
};

/** Why a pending button's own indicator has no control. */
const PENDING_INDICATOR = {
  pendingIndicator:
    'Takes an element (another indicator, such as a CircularProgressIndicator); the Pending example shows one.',
};

/** A button's `value`, besides {@link NO_VISIBLE_EFFECT}. */
const SELECTION_VALUE = {
  value: 'Only identifies the button in a selection group; nothing the preview shows.',
};

/** The reaction picker's options, live and as the snippet writes them. */
const REACTIONS = [
  { id: 'like', label: 'Like', icon: '👍', color: 'primary' },
  { id: 'love', label: 'Love', icon: '❤️', color: 'error' },
  { id: 'haha', label: 'Haha', icon: '😆', color: 'warning' },
  { id: 'sad', label: 'Sad', icon: '😢', color: 'warning' },
] as const;
const REACTIONS_CODE = `[\n    ${REACTIONS.map(
  ({ id, label, icon, color }) =>
    `{ id: '${id}', label: '${label}', icon: '${icon}', color: '${color}' }`,
).join(',\n    ')},\n  ]`;
const REACTION_IDS = REACTIONS.map(({ id }) => id);

/** The reaction summary's most used reactions, live and as the snippet writes them. */
const SUMMARY_ITEMS = [
  { id: 'love', icon: '❤️' },
  { id: 'like', icon: '👍' },
  { id: 'wow', icon: '😮' },
  { id: 'haha', icon: '😆' },
] as const;
const SUMMARY_ITEMS_CODE = `[\n    ${SUMMARY_ITEMS.map(({ id, icon }) => `{ id: '${id}', icon: '${icon}' }`).join(',\n    ')},\n  ]`;

/** Playgrounds for Actions, by page slug. */
export const ACTIONS_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  button: {
    component: 'Button',
    render: ({ leadingIcon, selectedLeadingIcon, toggle, selected, ...props }, update) =>
      createElement(
        ButtonAny,
        {
          ...props,
          ...(leadingIcon === true && { leadingIcon: <StarOutlineIcon /> }),
          ...(selectedLeadingIcon === true && { selectedLeadingIcon: <StarIcon /> }),
          // The selected state belongs to the toggle form only.
          ...(toggle === true && {
            toggle: true,
            selected: Boolean(selected),
            onSelectedChange: (next: boolean) => update('selected', next),
          }),
        },
        'Favourite',
      ),
    defaultProps: {
      variant: 'filled',
      size: 'sm',
      shape: 'round',
      leadingIcon: false,
      disabled: false,
      dragged: false,
      toggle: false,
      selected: false,
      selectedLeadingIcon: false,
      pending: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'shape',
      'leadingIcon',
      'toggle',
      'selected',
      'selectedLeadingIcon',
      'pending',
      'disabled',
      'dragged',
      'href',
    ],
    initialState: { variant: 'filled', size: 'sm', leadingIcon: true },
    // Text buttons have no toggle form, and a toggle is never a link (the types say so).
    adjust: (values, changed) =>
      adjustToggleForm(values, changed, { noToggleVariant: 'text', fallbackVariant: 'filled' }),
    controlKinds: { leadingIcon: 'boolean', selectedLeadingIcon: 'boolean' },
    toggledSlots: { leadingIcon: STAR_OUTLINE, selectedLeadingIcon: STAR },
    notControlled: { ...NO_VISIBLE_EFFECT, ...SELECTION_VALUE, ...PENDING_INDICATOR },
    codeChildren: 'Favourite',
  },
  'icon-button': {
    component: 'IconButton',
    render: ({ selectedIcon, toggle, selected, density, ...props }, update) =>
      createElement(IconButtonAny, {
        ...props,
        density: asDensity(density),
        'aria-label': 'Favourite',
        icon: <StarOutlineIcon />,
        ...(selectedIcon === true && { selectedIcon: <StarIcon /> }),
        ...(toggle === true && {
          toggle: true,
          selected: Boolean(selected),
          onSelectedChange: (next: boolean) => update('selected', next),
        }),
      }),
    defaultProps: {
      variant: 'filled',
      size: 'sm',
      width: 'default',
      shape: 'round',
      density: 0,
      tooltip: true,
      toggle: false,
      selected: false,
      selectedIcon: false,
      iconTransition: 'swap',
      pending: false,
      disabled: false,
      dragged: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'width',
      'shape',
      'density',
      'toggle',
      'selected',
      'selectedIcon',
      'iconTransition',
      'tooltip',
      'pending',
      'disabled',
      'dragged',
      'href',
    ],
    initialState: { variant: 'filled', size: 'sm', width: 'default' },
    // `selected` and `selectedIcon` belong to the toggle form, which is never a link, and
    // `iconTransition` hands `icon` over to `selectedIcon`, so it needs both.
    adjust: (values, changed) => {
      const next = adjustToggleForm(values, changed);
      if (changed === 'iconTransition' && next.iconTransition === 'rotate') {
        next.selectedIcon = true;
        next.toggle = true;
        next.href = undefined;
        next.pending = false;
      }
      if (next.toggle !== true || next.selectedIcon !== true) next.iconTransition = 'swap';
      return next;
    },
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { selectedIcon: 'boolean', density: 'number' },
    toggledSlots: { selectedIcon: STAR },
    notControlled: { ...NO_VISIBLE_EFFECT, ...SELECTION_VALUE, ...PENDING_INDICATOR },
    codeSlots: { icon: STAR_OUTLINE, 'aria-label': '"Favourite"' },
  },
  'button-group': {
    component: 'ButtonGroup',
    render: (props) => {
      // Selection needs toggle buttons with a value; a mode change starts afresh.
      const selectable = props.selectionMode !== 'none';
      const group = createElement(
        ButtonGroupAny,
        {
          ...props,
          key: String(props.selectionMode),
          'aria-label': 'View',
          ...(selectable && { defaultSelectedKeys: ['week'] }),
        },
        ...VIEWS.map((label) =>
          createElement(
            ButtonAny,
            { key: label, ...(selectable && { toggle: true, value: label.toLowerCase() }) },
            label,
          ),
        ),
      );
      // A narrow box, so `overflow` has something to fold.
      return props.overflow === true ? <div className="w-[180px]">{group}</div> : group;
    },
    defaultProps: {
      variant: 'standard',
      size: 'sm',
      shape: 'round',
      buttonVariant: 'filled',
      selectionMode: 'none',
      deselectable: true,
      overflow: false,
      disabled: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'shape',
      'buttonVariant',
      'selectionMode',
      'deselectable',
      'expandedRatio',
      'overflow',
      'disabled',
    ],
    initialState: { variant: 'standard', size: 'sm', selectionMode: 'single' },
    numberRanges: { expandedRatio: { min: 0, max: 0.5, step: 0.05 } },
    notControlled: {
      selectedKeys:
        "A set of the buttons' values: press the buttons in the preview to select them.",
      defaultSelectedKeys:
        "The uncontrolled twin of `selectedKeys`, a set of the buttons' values: press the buttons in the preview to select them.",
    },
    importMembers: ['Button'],
    // The preview's narrow box, so the pasted group folds as it does there.
    codeWrap: (values) =>
      values.overflow === true
        ? { before: '<div className="w-[180px]">', after: '</div>' }
        : undefined,
    codeSlots: {
      'aria-label': '"View"',
      defaultSelectedKeys: (values) => (values.selectionMode === 'none' ? null : "['week']"),
    },
    codeChildren: (values) =>
      VIEWS.map((label) =>
        values.selectionMode === 'none'
          ? `<Button>${label}</Button>`
          : `<Button toggle value="${label.toLowerCase()}">${label}</Button>`,
      ).join('\n  '),
  },
  'split-button': {
    component: 'SplitButton',
    render: ({ leadingIcon, menu, open, ...props }, update) =>
      createElement(
        SplitButtonAny,
        {
          ...props,
          labels: { menu: 'More send options' },
          ...(leadingIcon === true && { leadingIcon: <SendIcon /> }),
          open: Boolean(open),
          onOpenChange: (next: boolean) => update('open', next),
          ...(menu === true && {
            menu: (
              <Menu aria-label="More send options">
                <MenuItem key="later">Send later</MenuItem>
                <MenuItem key="draft">Save draft</MenuItem>
              </Menu>
            ),
          }),
        },
        'Send',
      ),
    defaultProps: {
      variant: 'filled',
      size: 'sm',
      leadingIcon: false,
      menu: false,
      open: false,
      disabled: false,
    },
    surfacedProps: ['variant', 'size', 'leadingIcon', 'menu', 'open', 'disabled', 'href'],
    initialState: { leadingIcon: true, menu: true },
    controlKinds: { leadingIcon: 'boolean', menu: 'boolean' },
    toggledSlots: {
      leadingIcon: SEND,
      menu: '(\n    <Menu aria-label="More send options">\n      <MenuItem key="later">Send later</MenuItem>\n      <MenuItem key="draft">Save draft</MenuItem>\n    </Menu>\n  )',
    },
    notControlled: {
      leadingLabel:
        'Names an icon-only leading button, which has no label children; the Icon only example shows it.',
    },
    codeSlots: { labels: "{ menu: 'More send options' }" },
    importMembers: ['Menu', 'MenuItem'],
    codeChildren: 'Send',
  },
  fab: {
    component: 'Fab',
    componentSwitch: { control: 'fab', components: { icon: 'Fab', extended: 'ExtendedFab' } },
    // A new key replays the entrance when `appear` is switched on. `expanded` is the extended
    // FAB's alone: the icon FAB would pass it on to its element.
    render: ({ fab, expanded, ...props }) =>
      fab === 'extended'
        ? createElement(
            ExtendedFabAny,
            { ...props, expanded, key: String(props.appear), icon: <EditIcon /> },
            'Compose',
          )
        : createElement(FabAny, {
            ...props,
            key: String(props.appear),
            'aria-label': 'Add',
            icon: <AddIcon />,
          }),
    // Each form has its own sizes, so switching starts on the new form's default.
    adjust: (values, changed) =>
      changed === 'fab'
        ? { ...values, size: values.fab === 'extended' ? 'sm' : 'default' }
        : values,
    codeDefaults: (values) => ({ size: values.fab === 'extended' ? 'sm' : 'default' }),
    defaultProps: {
      size: 'default',
      color: 'primary-container',
      elevation: 'default',
      tooltip: true,
      visible: true,
      appear: false,
      dragged: false,
      expanded: true,
    },
    surfacedProps: [
      'fab',
      'size',
      'expanded',
      'color',
      'elevation',
      'visible',
      'appear',
      'tooltip',
      'dragged',
      'href',
    ],
    initialState: { size: 'default', color: 'primary-container' },
    notControlled: {
      ...NO_VISIBLE_EFFECT,
      icon: 'Optional on the extended FAB only, and M3 pairs its label with an icon, so the preview always shows one; a text-only extended FAB just leaves it out.',
    },
    codeSlots: {
      icon: (values) => (values.fab === 'extended' ? EDIT : ADD),
      'aria-label': (values) => (values.fab === 'extended' ? null : '"Add"'),
    },
    codeChildren: (values) => (values.fab === 'extended' ? 'Compose' : ''),
  },
  'fab-menu': {
    component: 'FabMenu',
    notRendered: {
      FabMenuItem:
        "The menu's actions, composed in the preview as its children; each item's icon and link belong to one action, as the examples show.",
    },
    // Anchored at the bottom end of a frame, as an app anchors it to the window.
    render: ({ openIcon, open, ...props }, update) =>
      createElement(
        'div',
        { className: 'relative h-[360px] w-full max-w-[400px]' },
        createElement(
          FabMenuAny,
          {
            ...props,
            key: String(props.appear),
            'aria-label': 'Create',
            icon: <AddIcon />,
            ...(openIcon === true && { openIcon: <CloseIcon /> }),
            open: Boolean(open),
            onOpenChange: (next: boolean) => update('open', next),
            className: 'absolute end-4 bottom-4',
          },
          createElement(FabMenuItemAny, { key: 'note', icon: <EditIcon /> }, 'Note'),
          createElement(FabMenuItemAny, { key: 'message', icon: <SendIcon /> }, 'Message'),
        ),
      ),
    defaultProps: {
      size: 'default',
      color: 'primary',
      presentation: 'list',
      openIcon: false,
      iconTransition: 'swap',
      elevation: 'default',
      tooltip: true,
      open: false,
      visible: true,
      appear: false,
    },
    surfacedProps: [
      'size',
      'color',
      'elevation',
      'presentation',
      'openIcon',
      'iconTransition',
      'tooltip',
      'open',
      'visible',
      'appear',
    ],
    initialState: { size: 'default', color: 'primary', openIcon: true },
    controlKinds: { openIcon: 'boolean' },
    toggledSlots: { openIcon: CLOSE },
    importMembers: ['FabMenuItem'],
    codeSlots: { icon: ADD, 'aria-label': '"Create"' },
    codeChildren: `<FabMenuItem icon={${EDIT}}>Note</FabMenuItem>\n  <FabMenuItem icon={${SEND}}>Message</FabMenuItem>`,
  },
  'reaction-picker': {
    component: 'ReactionPicker',
    importFrom: '@windmorph/react-pro',
    // Room above the button for the row, which opens on long press, hover or ArrowUp.
    render: ({ value, open, ...props }, update) =>
      createElement(
        'div',
        { className: 'pt-16' },
        createElement(ReactionPickerAny, {
          ...props,
          options: REACTIONS,
          value: value ?? null,
          onChange: (next: string | null) => update('value', next ?? undefined),
          open: Boolean(open),
          onOpenChange: (next: boolean) => update('open', next),
        }),
      ),
    defaultProps: {
      size: 'md',
      variant: 'text',
      idleIcon: true,
      open: false,
      disabled: false,
    },
    surfacedProps: ['variant', 'size', 'value', 'defaultOption', 'idleIcon', 'open', 'disabled'],
    enumOptions: {
      size: ['sm', 'md'],
      variant: ['text', 'tonal'],
      value: REACTION_IDS,
      defaultOption: REACTION_IDS,
    },
    codeSlots: { options: REACTIONS_CODE },
  },
  'reaction-summary': {
    component: 'ReactionSummary',
    importFrom: '@windmorph/react-pro',
    render: ({ total, ...props }) =>
      createElement(ReactionSummaryAny, {
        ...props,
        items: SUMMARY_ITEMS,
        total: typeof total === 'number' ? total : 0,
      }),
    defaultProps: { variant: 'stacked', size: 'md', max: 3 },
    surfacedProps: ['variant', 'size', 'total', 'max'],
    initialState: { total: 128 },
    numberRanges: { total: { min: 0, max: 2000 }, max: { min: 1, max: 4 } },
    enumOptions: { variant: ['stacked', 'chip'], size: ['sm', 'md'] },
    codeSlots: { items: SUMMARY_ITEMS_CODE },
  },
};
