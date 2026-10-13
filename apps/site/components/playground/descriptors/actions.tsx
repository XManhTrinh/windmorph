'use client';

import {
  Button,
  ButtonGroup,
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
  EDIT,
  loose,
  type PlaygroundDescriptor,
  SEND,
  STAR,
  svg,
} from './shared';

const ButtonAny = loose(Button);
const IconButtonAny = loose(IconButton);
const ButtonGroupAny = loose(ButtonGroup);
const SplitButtonAny = loose(SplitButton);
const FabAny = loose(Fab);
const FabMenuAny = loose(FabMenu);
const FabMenuItemAny = loose(FabMenuItem);
const ReactionPickerAny = loose(ReactionPicker);
const ReactionSummaryAny = loose(ReactionSummary);

/** Material Symbols `star` (outlined) and `close`, for the snippets. */
const STAR_OUTLINE = svg(
  'm354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z',
);
const CLOSE = svg(
  'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z',
);

/** Why `elementType` and `preventFocusOnPress` have no control. */
const NO_VISIBLE_EFFECT = {
  elementType: 'Only changes the rendered element for a custom wrapper; nothing the preview shows.',
  preventFocusOnPress: 'Only keeps focus where it was on press; nothing the preview shows.',
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
          ...(leadingIcon === true && { leadingIcon: <EditIcon /> }),
          ...(selectedLeadingIcon === true && { selectedLeadingIcon: <StarIcon /> }),
          // The selected state belongs to the toggle form only.
          ...(toggle === true && {
            toggle: true,
            selected: Boolean(selected),
            onSelectedChange: (next: boolean) => update('selected', next),
          }),
        },
        'Label',
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
    },
    surfacedProps: [
      'variant',
      'size',
      'shape',
      'leadingIcon',
      'toggle',
      'selected',
      'selectedLeadingIcon',
      'disabled',
      'dragged',
      'href',
    ],
    initialState: { variant: 'filled', size: 'sm', leadingIcon: true },
    // Text buttons have no toggle form, and a toggle is never a link (the types say so).
    adjust: (values, changed) =>
      adjustToggleForm(values, changed, { noToggleVariant: 'text', fallbackVariant: 'filled' }),
    controlKinds: { leadingIcon: 'boolean', selectedLeadingIcon: 'boolean' },
    toggledSlots: { leadingIcon: EDIT, selectedLeadingIcon: STAR },
    notControlled: NO_VISIBLE_EFFECT,
    codeChildren: 'Label',
  },
  'icon-button': {
    component: 'IconButton',
    render: ({ selectedIcon, toggle, selected, ...props }, update) =>
      createElement(IconButtonAny, {
        ...props,
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
      tooltip: true,
      toggle: false,
      selected: false,
      selectedIcon: false,
      disabled: false,
      dragged: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'width',
      'shape',
      'toggle',
      'selected',
      'selectedIcon',
      'tooltip',
      'disabled',
      'dragged',
      'href',
    ],
    initialState: { variant: 'filled', size: 'sm', width: 'default' },
    // `selected` and `selectedIcon` belong to the toggle form, which is never a link.
    adjust: adjustToggleForm,
    controlKinds: { selectedIcon: 'boolean' },
    toggledSlots: { selectedIcon: STAR },
    notControlled: NO_VISIBLE_EFFECT,
    codeSlots: { icon: STAR_OUTLINE, 'aria-label': '"Favourite"' },
  },
  'button-group': {
    component: 'ButtonGroup',
    render: (props) => {
      // Selection needs toggle buttons with a value; a mode change starts afresh.
      const selectable = props.selectionMode !== 'none';
      const group = createElement(
        ButtonGroupAny,
        { ...props, key: String(props.selectionMode), 'aria-label': 'Text style' },
        ...['One', 'Two', 'Three'].map((label) =>
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
      disallowEmptySelection: false,
      overflow: false,
      disabled: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'shape',
      'buttonVariant',
      'selectionMode',
      'disallowEmptySelection',
      'expandedRatio',
      'overflow',
      'disabled',
    ],
    initialState: { variant: 'standard', size: 'sm' },
    notControlled: {
      selectedKeys:
        "A set of the buttons' values: press the buttons in the preview to select them.",
      defaultSelectedKeys:
        "The uncontrolled twin of `selectedKeys`, a set of the buttons' values: press the buttons in the preview to select them.",
    },
    importMembers: ['Button'],
    codeSlots: { 'aria-label': '"Text style"' },
    codeChildren: '<Button>One</Button>\n  <Button>Two</Button>\n  <Button>Three</Button>',
  },
  'split-button': {
    component: 'SplitButton',
    render: ({ leadingIcon, menu, open, ...props }, update) =>
      createElement(
        SplitButtonAny,
        {
          ...props,
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
    surfacedProps: [
      'variant',
      'size',
      'leadingIcon',
      'menuLabel',
      'menu',
      'open',
      'disabled',
      'href',
    ],
    initialState: { leadingIcon: true, menu: true, menuLabel: 'More send options' },
    controlKinds: { leadingIcon: 'boolean', menu: 'boolean' },
    toggledSlots: {
      leadingIcon: SEND,
      menu: '(\n    <Menu aria-label="More send options">\n      <MenuItem key="later">Send later</MenuItem>\n      <MenuItem key="draft">Save draft</MenuItem>\n    </Menu>\n  )',
    },
    notControlled: {
      leadingLabel:
        'Names an icon-only leading button, which has no label children; the Icon only example shows it.',
    },
    importMembers: ['Menu', 'MenuItem'],
    codeChildren: 'Send',
  },
  fab: {
    component: 'Fab',
    // A new key replays the entrance when `appear` is switched on.
    render: (props) =>
      createElement(FabAny, {
        ...props,
        key: String(props.appear),
        'aria-label': 'Add',
        icon: <AddIcon />,
      }),
    defaultProps: {
      size: 'default',
      color: 'primary-container',
      elevation: 'default',
      tooltip: true,
      visible: true,
      appear: false,
      dragged: false,
    },
    surfacedProps: [
      'size',
      'color',
      'elevation',
      'visible',
      'appear',
      'tooltip',
      'dragged',
      'href',
    ],
    initialState: { size: 'default', color: 'primary-container' },
    notControlled: NO_VISIBLE_EFFECT,
    codeSlots: { icon: ADD, 'aria-label': '"Add"' },
  },
  'fab-menu': {
    component: 'FabMenu',
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
          createElement(FabMenuItemAny, { key: 'edit', icon: <EditIcon /> }, 'Edit'),
          createElement(FabMenuItemAny, { key: 'send', icon: <SendIcon /> }, 'Send'),
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
    codeChildren: `<FabMenuItem icon={${EDIT}}>Edit</FabMenuItem>\n  <FabMenuItem icon={${SEND}}>Send</FabMenuItem>`,
  },
  'reaction-picker': {
    component: 'ReactionPicker',
    importFrom: '@windmorph/react-pro',
    // Room above the button for the row, which opens on long press, hover or ArrowUp.
    render: ({ value, isOpen, ...props }, update) =>
      createElement(
        'div',
        { className: 'pt-16' },
        createElement(ReactionPickerAny, {
          ...props,
          options: REACTIONS,
          value: value ?? null,
          onChange: (next: string | null) => update('value', next ?? undefined),
          isOpen: Boolean(isOpen),
          onOpenChange: (next: boolean) => update('isOpen', next),
        }),
      ),
    defaultProps: {
      size: 'md',
      variant: 'text',
      showIdleIcon: true,
      isOpen: false,
      isDisabled: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'value',
      'defaultOption',
      'showIdleIcon',
      'isOpen',
      'isDisabled',
    ],
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
    defaultProps: { variant: 'stacked', size: 'md', maxIcons: 3 },
    surfacedProps: ['variant', 'size', 'total', 'maxIcons'],
    initialState: { total: 128 },
    enumOptions: { variant: ['stacked', 'chip'], size: ['sm', 'md'] },
    codeSlots: { items: SUMMARY_ITEMS_CODE },
  },
};
