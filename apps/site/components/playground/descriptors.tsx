'use client';

import {
  AssistChip,
  Autocomplete,
  AutocompleteItem,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  Divider,
  Fab,
  FabMenu,
  FabMenuItem,
  IconButton,
  LinearProgressIndicator,
  List,
  ListItem,
  LoadingIndicator,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  SplitButton,
  Switch,
  Tab,
  Tabs,
  TextField,
} from '@windmorph/react';
import {
  Alert,
  Avatar,
  avatarShapes,
  EmptyState,
  ExpandableText,
  Link,
  MessageField,
  PhoneField,
  PinInput,
  ReactionPicker,
  ShapedIcon,
  Skeleton,
  SkeletonGroup,
  Tag,
} from '@windmorph/react-pro';
import { createElement, type ComponentType, type ReactElement } from 'react';
import { AddIcon, DynamicFeedIcon, EditIcon, SendIcon, StarIcon } from '../icons';

export interface PlaygroundDescriptor {
  /** Public component name as imported from '@windmorph/react', e.g. 'Button'. */
  component: string;
  /** The live element to render; receives the current prop values. */
  render: (props: Record<string, unknown>) => ReactElement;
  /** Prop values the component already defaults to — used to omit defaults from the code. */
  defaultProps?: Record<string, unknown>;
  /** Allowlist + order of props to surface as controls. */
  surfacedProps: string[];
  /** Initial control state (overrides defaults for the first render / shared URL default). */
  initialState?: Record<string, unknown>;
  /** OVERRIDE ONLY. Re-order/subset enum members otherwise read from the generated JSON. */
  enumOptions?: Record<string, string[]>;
  /** Extra `@windmorph/react` member names imported alongside the component in the copied snippet. */
  importMembers?: string[];
  /** Non-`@windmorph/react` import lines for the copied snippet (one per entry). */
  codeImports?: string[];
  /** Verbatim JSX for ReactNode-valued slots, self-contained so the snippet compiles. */
  codeSlots?: Record<string, string>;
  /** Verbatim children JSX emitted in the copied snippet. */
  codeChildren?: string;
  /** The entry the component is imported from in the snippet. @default '@windmorph/react' */
  importFrom?: '@windmorph/react' | '@windmorph/react-pro';
}

/** Casts a typed component to a loose one so arbitrary control values can be spread. */
function loose<P>(component: ComponentType<P>): ComponentType<Record<string, unknown>> {
  return component as unknown as ComponentType<Record<string, unknown>>;
}

const ButtonAny = loose(Button);
const IconButtonAny = loose(IconButton);
const ButtonGroupAny = loose(ButtonGroup);
const SplitButtonAny = loose(SplitButton);
const FabAny = loose(Fab);
const FabMenuAny = loose(FabMenu);
const FabMenuItemAny = loose(FabMenuItem);
const TextFieldAny = loose(TextField);
const CheckboxAny = loose(Checkbox);
const RadioGroupAny = loose(RadioGroup);
const SwitchAny = loose(Switch);
const SliderAny = loose(Slider);
const AssistChipAny = loose(AssistChip);
const CardAny = loose(Card);
const ListAny = loose(List);
const DividerAny = loose(Divider);
const TabsAny = loose(Tabs);
const LinearProgressIndicatorAny = loose(LinearProgressIndicator);
const LoadingIndicatorAny = loose(LoadingIndicator);
const RadioAny = loose(Radio);
const ListItemAny = loose(ListItem);
const AvatarAny = loose(Avatar);
const PinInputAny = loose(PinInput);
const PhoneFieldAny = loose(PhoneField);
const SelectAny = loose(Select);
const SelectItemAny = loose(SelectItem);
const AutocompleteAny = loose(Autocomplete);
const AutocompleteItemAny = loose(AutocompleteItem);
const SkeletonAny = loose(Skeleton);
const EmptyStateAny = loose(EmptyState);
const TagAny = loose(Tag);
const LinkAny = loose(Link);
const ShapedIconAny = loose(ShapedIcon);
const ExpandableTextAny = loose(ExpandableText);
const ReactionPickerAny = loose(ReactionPicker);
const MessageFieldAny = loose(MessageField);
const AlertAny = loose(Alert);
const TabAny = loose(Tab);

/** A no-op change handler so controlled inputs driven by the panel don't warn in preview. */
const noop = () => {};

/** Self-contained inline SVGs for the copied snippets (no icon package in this repo). */
const svg = (path: string) =>
  `<svg viewBox="0 -960 960 960" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="${path}" /></svg>`;
const STAR = svg(
  'm233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z',
);
const ADD = svg('M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z');
const EDIT = svg(
  'M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z',
);
const SEND = svg('M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Z');

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
const EXPANDABLE_TEXT_SAMPLE =
  'Phở night at the community hall this Saturday from 6pm. Bring a bowl and a friend: every table is shared, and the broth has been simmering since Friday morning. There is a vegetarian pot too, and the kids’ corner has crafts and lanterns. Parking is behind the church, and the 42 bus stops outside.';

export const PLAYGROUND_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  button: {
    component: 'Button',
    render: (props) => createElement(ButtonAny, props, 'Label'),
    defaultProps: { variant: 'filled', size: 'sm', disabled: false },
    surfacedProps: ['variant', 'size', 'disabled'],
    initialState: { variant: 'filled', size: 'sm' },
    codeChildren: 'Label',
  },
  'icon-button': {
    component: 'IconButton',
    render: (props) =>
      createElement(IconButtonAny, { ...props, 'aria-label': 'Favorite', icon: <StarIcon /> }),
    defaultProps: { variant: 'standard', size: 'sm', width: 'default', disabled: false },
    surfacedProps: ['variant', 'size', 'width', 'disabled'],
    initialState: { variant: 'standard', size: 'sm', width: 'default' },
    codeSlots: { icon: STAR, 'aria-label': '"Favorite"' },
  },
  'button-group': {
    component: 'ButtonGroup',
    render: (props) =>
      createElement(
        ButtonGroupAny,
        { ...props, 'aria-label': 'Text style' },
        createElement(ButtonAny, { key: 'one' }, 'One'),
        createElement(ButtonAny, { key: 'two' }, 'Two'),
        createElement(ButtonAny, { key: 'three' }, 'Three'),
      ),
    defaultProps: { variant: 'standard', size: 'sm', disabled: false },
    surfacedProps: ['variant', 'size', 'disabled'],
    initialState: { variant: 'standard', size: 'sm' },
    importMembers: ['Button'],
    codeSlots: { 'aria-label': '"Text style"' },
    codeChildren: '<Button>One</Button>\n  <Button>Two</Button>\n  <Button>Three</Button>',
  },
  'split-button': {
    component: 'SplitButton',
    render: (props) =>
      createElement(
        SplitButtonAny,
        {
          ...props,
          menuLabel: 'More actions',
          menu: (
            <Menu aria-label="More actions">
              <MenuItem key="rename">Rename</MenuItem>
              <MenuItem key="delete">Delete</MenuItem>
            </Menu>
          ),
        },
        'Save',
      ),
    defaultProps: { variant: 'filled', size: 'sm', disabled: false },
    surfacedProps: ['variant', 'size', 'disabled'],
    initialState: { variant: 'filled', size: 'sm' },
    importMembers: ['Menu', 'MenuItem'],
    codeSlots: {
      menuLabel: '"More actions"',
      menu: '(\n    <Menu aria-label="More actions">\n      <MenuItem key="rename">Rename</MenuItem>\n      <MenuItem key="delete">Delete</MenuItem>\n    </Menu>\n  )',
    },
    codeChildren: 'Save',
  },
  fab: {
    component: 'Fab',
    render: (props) => createElement(FabAny, { ...props, 'aria-label': 'Add', icon: <AddIcon /> }),
    defaultProps: { size: 'default', color: 'primary-container', elevation: 'default' },
    surfacedProps: ['size', 'color', 'elevation'],
    initialState: { size: 'default', color: 'primary-container' },
    codeSlots: { icon: ADD, 'aria-label': '"Add"' },
  },
  'fab-menu': {
    component: 'FabMenu',
    render: (props) =>
      createElement(
        FabMenuAny,
        { ...props, 'aria-label': 'Create', icon: <AddIcon /> },
        createElement(FabMenuItemAny, { key: 'edit', icon: <EditIcon /> }, 'Edit'),
        createElement(FabMenuItemAny, { key: 'send', icon: <SendIcon /> }, 'Send'),
      ),
    defaultProps: { size: 'default', color: 'primary', presentation: 'list' },
    surfacedProps: ['size', 'color', 'presentation'],
    initialState: { size: 'default', color: 'primary' },
    importMembers: ['FabMenuItem'],
    codeSlots: { icon: ADD, 'aria-label': '"Create"' },
    codeChildren: `<FabMenuItem icon={${EDIT}}>Edit</FabMenuItem>\n  <FabMenuItem icon={${SEND}}>Send</FabMenuItem>`,
  },
  'reaction-picker': {
    component: 'ReactionPicker',
    importFrom: '@windmorph/react-pro',
    // Room above the button for the row, which opens on long press, hover or ArrowUp.
    render: (props) =>
      createElement(
        'div',
        { className: 'pt-16' },
        createElement(ReactionPickerAny, { ...props, options: REACTIONS }),
      ),
    defaultProps: { size: 'md', isDisabled: false },
    surfacedProps: ['size', 'isDisabled'],
    enumOptions: { size: ['sm', 'md'] },
    codeSlots: { options: REACTIONS_CODE },
  },

  // Inputs & selection.
  'text-field': {
    component: 'TextField',
    render: (props) => createElement(TextFieldAny, { ...props, label: 'Label' }),
    defaultProps: { variant: 'filled', disabled: false },
    surfacedProps: ['variant', 'disabled'],
    initialState: { variant: 'filled' },
    codeSlots: { label: '"Label"' },
  },
  'message-field': {
    component: 'MessageField',
    importFrom: '@windmorph/react-pro',
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(MessageFieldAny, {
          ...props,
          'aria-label': 'Write a comment',
          placeholder: 'Write a comment…',
          errorMessage: "Couldn't send. Try again.",
          maxLength: 200,
        }),
      ),
    defaultProps: {
      variant: 'filled',
      size: 'md',
      submitOn: 'enter',
      clearOnSubmit: false,
      isSubmitting: false,
      invalid: false,
      isDisabled: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'submitOn',
      'clearOnSubmit',
      'isSubmitting',
      'invalid',
      'isDisabled',
    ],
    initialState: { clearOnSubmit: true },
    enumOptions: {
      variant: ['filled', 'tonal', 'outlined'],
      size: ['sm', 'md', 'lg'],
      submitOn: ['enter', 'mod-enter', 'none'],
    },
    codeSlots: {
      'aria-label': '"Write a comment"',
      placeholder: '"Write a comment…"',
      errorMessage: '"Couldn\'t send. Try again."',
      maxLength: '200',
    },
  },
  select: {
    component: 'Select',
    render: (props) =>
      createElement(
        SelectAny,
        {
          ...props,
          // Single and multiple values differ in shape, so a mode change starts afresh.
          key: String(props.selectionMode),
          label: 'Sort by',
          errorMessage: 'Choose how to sort',
        },
        createElement(SelectItemAny, { key: 'newest' }, 'Newest first'),
        createElement(SelectItemAny, { key: 'low' }, 'Price, low to high'),
        createElement(SelectItemAny, { key: 'high' }, 'Price, high to low'),
      ),
    defaultProps: {
      variant: 'filled',
      selectionMode: 'single',
      presentation: 'menu',
      searchable: false,
      invalid: false,
      disabled: false,
      required: false,
    },
    surfacedProps: [
      'variant',
      'selectionMode',
      'presentation',
      'searchable',
      'invalid',
      'disabled',
      'required',
    ],
    initialState: { variant: 'filled' },
    enumOptions: { selectionMode: ['single', 'multiple'], presentation: ['menu', 'sheet', 'auto'] },
    importMembers: ['SelectItem'],
    codeSlots: { label: '"Sort by"' },
    codeChildren:
      '<SelectItem key="newest">Newest first</SelectItem>\n  <SelectItem key="low">Price, low to high</SelectItem>\n  <SelectItem key="high">Price, high to low</SelectItem>',
  },
  autocomplete: {
    component: 'Autocomplete',
    render: (props) =>
      createElement(
        AutocompleteAny,
        {
          ...props,
          // Single and multiple values differ in shape, so a mode change starts afresh.
          key: String(props.selectionMode),
          label: 'City',
          errorMessage: 'Choose a city',
        },
        createElement(AutocompleteItemAny, { key: 'hn' }, 'Paris'),
        createElement(AutocompleteItemAny, { key: 'ldn' }, 'London'),
        createElement(AutocompleteItemAny, { key: 'syd' }, 'Sydney'),
        createElement(AutocompleteItemAny, { key: 'hou' }, 'Houston'),
      ),
    defaultProps: {
      variant: 'filled',
      selectionMode: 'single',
      allowsCustomValue: false,
      invalid: false,
      disabled: false,
      required: false,
    },
    surfacedProps: [
      'variant',
      'selectionMode',
      'allowsCustomValue',
      'invalid',
      'disabled',
      'required',
    ],
    initialState: { variant: 'filled' },
    enumOptions: { selectionMode: ['single', 'multiple'] },
    importMembers: ['AutocompleteItem'],
    codeSlots: { label: '"City"' },
    codeChildren:
      '<AutocompleteItem key="hn">Paris</AutocompleteItem>\n  <AutocompleteItem key="ldn">London</AutocompleteItem>\n  <AutocompleteItem key="syd">Sydney</AutocompleteItem>\n  <AutocompleteItem key="hou">Houston</AutocompleteItem>',
  },
  'phone-field': {
    component: 'PhoneField',
    importFrom: '@windmorph/react-pro',
    render: (props) =>
      createElement(PhoneFieldAny, {
        ...props,
        label: 'Phone',
        defaultCountry: 'GB',
        priorityCountries: ['GB', 'US', 'CA', 'AU'],
        errorMessage: 'Enter a valid phone number',
      }),
    defaultProps: { variant: 'outlined', invalid: false, disabled: false, required: false },
    surfacedProps: ['variant', 'invalid', 'disabled', 'required'],
    initialState: { variant: 'outlined' },
    codeSlots: {
      label: '"Phone"',
      defaultCountry: '"GB"',
      priorityCountries: "{['GB', 'US', 'CA', 'AU']}",
    },
  },
  'pin-input': {
    component: 'PinInput',
    importFrom: '@windmorph/react-pro',
    render: (props) =>
      createElement(PinInputAny, {
        ...props,
        label: 'Code',
        errorMessage: "That code didn't work.",
      }),
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
      corner: 'extra-small',
      length: 6,
      type: 'numeric',
      mask: false,
      otp: true,
      invalid: false,
      disabled: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'corner',
      'length',
      'type',
      'mask',
      'otp',
      'invalid',
      'disabled',
    ],
    initialState: { variant: 'outlined', size: 'medium', length: 6 },
    enumOptions: {
      corner: [
        'none',
        'extra-small',
        'small',
        'medium',
        'large',
        'large-increased',
        'extra-large',
        'extra-large-increased',
        'extra-extra-large',
        'full',
      ],
    },
    codeSlots: { label: '"Code"' },
  },
  checkbox: {
    component: 'Checkbox',
    render: (props) =>
      createElement(CheckboxAny, { ...props, onSelectedChange: noop }, 'I accept the terms'),
    defaultProps: { selected: false, indeterminate: false, disabled: false },
    surfacedProps: ['selected', 'indeterminate', 'disabled'],
    initialState: { selected: true },
    codeChildren: 'I accept the terms',
  },
  'radio-group': {
    component: 'RadioGroup',
    render: (props) =>
      createElement(
        RadioGroupAny,
        { ...props, label: 'Delivery', defaultValue: 'standard' },
        createElement(RadioAny, { key: 'standard', value: 'standard' }, 'Standard'),
        createElement(RadioAny, { key: 'express', value: 'express' }, 'Express'),
      ),
    defaultProps: { orientation: 'vertical', disabled: false },
    surfacedProps: ['orientation', 'disabled'],
    initialState: { orientation: 'vertical' },
    enumOptions: { orientation: ['vertical', 'horizontal'] },
    importMembers: ['Radio'],
    codeSlots: { label: '"Delivery"', defaultValue: '"standard"' },
    codeChildren:
      '<Radio value="standard">Standard</Radio>\n  <Radio value="express">Express</Radio>',
  },
  switch: {
    component: 'Switch',
    render: (props) => createElement(SwitchAny, { ...props, onSelectedChange: noop }, 'Wi-Fi'),
    defaultProps: { selected: false, disabled: false },
    surfacedProps: ['selected', 'disabled'],
    initialState: { selected: true },
    codeChildren: 'Wi-Fi',
  },
  slider: {
    component: 'Slider',
    render: (props) =>
      createElement(SliderAny, { ...props, 'aria-label': 'Volume', defaultValue: 40 }),
    defaultProps: { size: 'xs', orientation: 'horizontal', disabled: false },
    surfacedProps: ['size', 'disabled'],
    initialState: { size: 'md' },
    codeSlots: { 'aria-label': '"Volume"', defaultValue: '40' },
  },
  chips: {
    component: 'AssistChip',
    render: (props) =>
      createElement(AssistChipAny, { ...props, leadingIcon: <EditIcon /> }, 'Add note'),
    defaultProps: { elevated: false, disabled: false },
    surfacedProps: ['elevated', 'disabled'],
    initialState: {},
    codeSlots: { leadingIcon: EDIT },
    codeChildren: 'Add note',
  },

  // Containment & overlays.
  card: {
    component: 'Card',
    render: (props) =>
      createElement(
        CardAny,
        { ...props, className: 'w-full max-w-xs' },
        <div key="body" className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Card title</h3>
          <p className="text-body-medium text-on-surface-variant">
            Supporting text describing the card.
          </p>
        </div>,
      ),
    defaultProps: { variant: 'filled', disabled: false },
    surfacedProps: ['variant', 'disabled'],
    initialState: { variant: 'elevated' },
    codeChildren:
      '<div className="flex flex-col gap-1 p-4">\n    <h3 className="text-title-medium text-on-surface">Card title</h3>\n    <p className="text-body-medium text-on-surface-variant">Supporting text describing the card.</p>\n  </div>',
  },
  list: {
    component: 'List',
    // On a rounded surface, as a sheet or card would hold it: the segmented gaps show the
    // surface, and its corners (16px item corners + 12px padding) follow the items'.
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full max-w-sm rounded-corner-extra-large bg-surface-container p-3' },
        createElement(
          ListAny,
          { ...props, 'aria-label': 'Contacts' },
          createElement(ListItemAny, { key: 'one', supportingText: 'Supporting text' }, 'One line'),
          createElement(
            ListItemAny,
            { key: 'two', supportingText: 'Supporting text' },
            'Two lines',
          ),
          createElement(ListItemAny, { key: 'three' }, 'Three'),
        ),
      ),
    defaultProps: { variant: 'standard', selectionMode: 'none' },
    surfacedProps: ['variant', 'selectionMode'],
    initialState: { variant: 'segmented' },
    importMembers: ['ListItem'],
    codeSlots: { 'aria-label': '"Contacts"' },
    codeChildren:
      '<ListItem key="one" supportingText="Supporting text">One line</ListItem>\n  <ListItem key="two" supportingText="Supporting text">Two lines</ListItem>\n  <ListItem key="three">Three</ListItem>',
  },
  divider: {
    component: 'Divider',
    render: (props) =>
      props.orientation === 'vertical'
        ? createElement(
            'div',
            { className: 'flex h-16 items-center gap-4 text-body-medium text-on-surface' },
            <span key="a">One</span>,
            createElement(DividerAny, { key: 'd', ...props }),
            <span key="b">Two</span>,
          )
        : createElement(
            'div',
            { className: 'w-60 text-body-medium text-on-surface' },
            createElement(DividerAny, { key: 'd', ...props }),
          ),
    defaultProps: { orientation: 'horizontal', inset: 'none' },
    surfacedProps: ['orientation', 'inset'],
    initialState: { orientation: 'horizontal', inset: 'none' },
  },

  // Navigation.
  tabs: {
    component: 'Tabs',
    render: (props) =>
      createElement(
        TabsAny,
        { ...props, 'aria-label': 'Inbox', className: 'w-full max-w-[480px]' },
        createElement(
          TabAny,
          { key: 'all', title: 'All' },
          <p key="p" className="p-4 text-body-large text-on-surface-variant">
            Everything in one place.
          </p>,
        ),
        createElement(
          TabAny,
          { key: 'sent', title: 'Sent' },
          <p key="p" className="p-4 text-body-large text-on-surface-variant">
            Messages you sent.
          </p>,
        ),
      ),
    defaultProps: { variant: 'primary', iconPlacement: 'top', align: 'stretch', swipeable: false },
    surfacedProps: ['variant', 'iconPlacement', 'align', 'swipeable'],
    initialState: { variant: 'primary' },
    importMembers: ['Tab'],
    codeSlots: { 'aria-label': '"Inbox"' },
    codeChildren:
      '<Tab key="all" title="All">\n    <p>Everything in one place.</p>\n  </Tab>\n  <Tab key="sent" title="Sent">\n    <p>Messages you sent.</p>\n  </Tab>',
  },

  // Feedback.
  progress: {
    component: 'LinearProgressIndicator',
    render: (props) =>
      createElement(LinearProgressIndicatorAny, {
        ...props,
        'aria-label': 'Uploading',
        className: 'w-[280px]',
      }),
    defaultProps: { wavy: false, thickness: 4 },
    surfacedProps: ['value', 'wavy', 'thickness'],
    initialState: { value: 0.4, wavy: false, thickness: 4 },
    codeSlots: { 'aria-label': '"Uploading"', className: '"w-full"' },
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
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(
          AlertAny,
          { ...props, title: props.title === '' ? undefined : props.title },
          "That email and password don't match.",
        ),
      ),
    defaultProps: { tone: 'error', variant: 'tonal', title: '' },
    surfacedProps: ['tone', 'variant', 'title'],
    enumOptions: {
      tone: ['error', 'info', 'success', 'warning', 'neutral'],
      variant: ['tonal', 'outlined'],
    },
    codeChildren: "That email and password don't match.",
  },
  link: {
    component: 'Link',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(LinkAny, { ...props, href: '#' }, 'Terms of service'),
    defaultProps: { variant: 'inline', tone: 'primary', size: 'inherit', external: false },
    surfacedProps: ['variant', 'tone', 'size', 'external'],
    enumOptions: {
      variant: ['inline', 'standalone', 'plain'],
      tone: ['primary', 'inherit'],
      size: ['inherit', 'small', 'medium', 'large'],
    },
    codeSlots: { href: '"/legal/terms"' },
    codeChildren: 'Terms of service',
  },
  tag: {
    component: 'Tag',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(TagAny, props, 'Open now'),
    defaultProps: { variant: 'tonal', tone: 'neutral', size: 'md', shape: 'full', dot: false },
    surfacedProps: ['variant', 'tone', 'size', 'shape', 'dot'],
    initialState: { tone: 'success', dot: true },
    enumOptions: {
      variant: ['tonal', 'filled', 'outlined'],
      tone: ['neutral', 'primary', 'secondary', 'tertiary', 'error', 'success', 'warning'],
      size: ['sm', 'md', 'lg'],
      shape: ['full', 'rounded'],
    },
    codeChildren: 'Open now',
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
      actions: false,
    },
    surfacedProps: ['variant', 'size', 'tone', 'shape', 'title', 'description', 'actions'],
    initialState: {
      variant: 'filled',
      title: 'No posts yet',
      description: 'Posts you share will appear here.',
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
    codeImports: ["import { DynamicFeedIcon } from './icons';"],
    codeSlots: { icon: '<DynamicFeedIcon />' },
  },
  'shaped-icon': {
    component: 'ShapedIcon',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(ShapedIconAny, props, createElement(StarIcon)),
    defaultProps: { shape: 'circle', size: 'md', tone: 'secondary' },
    surfacedProps: ['shape', 'size', 'tone'],
    initialState: { shape: 'Cookie9Sided', size: 'lg', tone: 'primary' },
    enumOptions: {
      shape: [
        'circle',
        ...avatarShapes.filter((shape) => shape !== 'circle' && shape !== 'rounded'),
      ],
      size: ['sm', 'md', 'lg', 'xl'],
      tone: ['primary', 'secondary', 'tertiary', 'neutral', 'error'],
    },
    codeImports: ["import { StarIcon } from './icons';"],
    codeChildren: '<StarIcon />',
  },
  'expandable-text': {
    component: 'ExpandableText',
    importFrom: '@windmorph/react-pro',
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full max-w-sm' },
        createElement(
          ExpandableTextAny,
          { ...props, className: 'text-body-large text-on-surface' },
          EXPANDABLE_TEXT_SAMPLE,
        ),
      ),
    defaultProps: { lines: 5, collapsible: false, as: 'div' },
    surfacedProps: ['lines', 'collapsible', 'as'],
    initialState: { lines: 3, collapsible: true },
    enumOptions: { as: ['div', 'p'] },
    codeSlots: { className: '"text-body-large text-on-surface"' },
    codeChildren: EXPANDABLE_TEXT_SAMPLE,
  },
  avatar: {
    component: 'Avatar',
    importFrom: '@windmorph/react-pro',
    render: ({ presence, badge, badgeLabel, ...props }) =>
      createElement(AvatarAny, {
        ...props,
        alt: String(props.name ?? ''),
        ...(presence !== 'none' && { presence }),
        ...(badge !== '' && { badge, badgeLabel: String(badgeLabel || badge) }),
      }),
    defaultProps: {
      name: 'Nora Lindqvist',
      size: 'md',
      shape: 'circle',
      tone: 'auto',
      presence: 'none',
      presencePlacement: 'bottom-end',
      badge: '',
      badgeLabel: '',
      badgePlacement: 'top-end',
    },
    surfacedProps: [
      'name',
      'size',
      'shape',
      'tone',
      'presence',
      'presencePlacement',
      'badge',
      'badgeLabel',
      'badgePlacement',
    ],
    initialState: {
      name: 'Nora Lindqvist',
      size: 'xl',
      shape: 'Cookie12Sided',
      presence: 'online',
      badge: '✓',
      badgeLabel: 'verified',
    },
    enumOptions: {
      size: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      shape: [...avatarShapes],
      tone: ['auto', 'primary', 'secondary', 'tertiary', 'neutral'],
      presence: ['none', 'online', 'away', 'offline'],
      presencePlacement: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
      badgePlacement: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    codeSlots: { alt: '"Nora Lindqvist"' },
  },
  'loading-indicator': {
    component: 'LoadingIndicator',
    render: (props) => createElement(LoadingIndicatorAny, { ...props, 'aria-label': 'Loading' }),
    defaultProps: { variant: 'default' },
    surfacedProps: ['variant'],
    initialState: { variant: 'default' },
    codeSlots: { 'aria-label': '"Loading"' },
  },
};
