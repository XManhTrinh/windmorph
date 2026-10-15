'use client';

import {
  AssistChip,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  Switch,
  TextField,
} from '@windmorph/react';
import { createElement, type ReactElement } from 'react';
import {
  CloseIcon,
  DarkModeIcon,
  EditIcon,
  HelpIcon,
  LightModeIcon,
  MailIcon,
  SearchIcon,
  SortIcon,
  VolumeDownIcon,
  VolumeUpIcon,
} from '../../icons';
import { EDIT, type PlaygroundDescriptor, asDensity, loose } from './shared';

const TextFieldAny = loose(TextField);
const CheckboxAny = loose(Checkbox);
const RadioGroupAny = loose(RadioGroup);
const SwitchAny = loose(Switch);
const SliderAny = loose(Slider);
const AssistChipAny = loose(AssistChip);
const RadioAny = loose(Radio);
const SelectAny = loose(Select);
const SelectItemAny = loose(SelectItem);
const AutocompleteAny = loose(Autocomplete);
const AutocompleteItemAny = loose(AutocompleteItem);

/** The snippet's icons, matching the live ones. */
const SEARCH = '<SearchIcon />';
const CLOSE = '<CloseIcon />';
const HELP = '<HelpIcon />';
const MAIL = '<MailIcon />';
const SORT = '<SortIcon />';

/** The density control the fields share (0 to -3). */
const DENSITY_OPTIONS = { density: ['0', '-1', '-2', '-3'] };

/** A switched-on slot's live icon; nothing while it's switched off. */
function slot(on: unknown, icon: () => ReactElement): ReactElement | undefined {
  return on === true ? icon() : undefined;
}

/** The field slots the text field, select and autocomplete share, with the field's own leading icon. */
const fieldSlots = (props: Record<string, unknown>, leading: () => ReactElement) => ({
  leadingIcon: slot(props.leadingIcon, leading),
  errorIcon: slot(props.errorIcon, () => createElement(HelpIcon)),
});

/** Playgrounds for the M3 inputs and selection controls, by page slug. */
export const INPUTS_M3_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'text-field': {
    component: 'TextField',
    render: (props, update) =>
      createElement(TextFieldAny, {
        ...props,
        ...fieldSlots(props, () => createElement(MailIcon)),
        density: asDensity(props.density),
        trailingIcon: slot(props.trailingIcon, () => createElement(CloseIcon)),
        value: props.value ?? '',
        onChange: (value: string) => update('value', value),
      }),
    defaultProps: {
      variant: 'filled',
      density: 0,
      supportingTextOnFocus: false,
      invalid: false,
      required: false,
      disabled: false,
      readOnly: false,
      leadingIcon: false,
      trailingIcon: false,
      errorIcon: false,
      multiline: false,
      autoGrow: false,
      showCharacterCount: true,
    },
    surfacedProps: [
      'variant',
      'density',
      'label',
      'value',
      'supportingText',
      'supportingTextOnFocus',
      'errorMessage',
      'invalid',
      'required',
      'disabled',
      'readOnly',
      'leadingIcon',
      'trailingIcon',
      'errorIcon',
      'prefix',
      'prefixLabel',
      'suffix',
      'suffixLabel',
      'maxLength',
      'showCharacterCount',
      'multiline',
      'autoGrow',
      'rows',
      'maxRows',
    ],
    initialState: {
      variant: 'filled',
      label: 'Email',
      supportingText: 'We never share it.',
      errorMessage: 'Enter a valid email address.',
    },
    enumOptions: DENSITY_OPTIONS,
    controlKinds: {
      density: 'number',
      leadingIcon: 'boolean',
      trailingIcon: 'boolean',
      errorIcon: 'boolean',
      errorMessage: 'string',
      maxLength: 'number',
    },
    toggledSlots: { leadingIcon: MAIL, trailingIcon: CLOSE, errorIcon: HELP },
    numberRanges: {
      maxLength: { min: 10, max: 200, step: 10 },
      rows: { min: 1, max: 8 },
      maxRows: { min: 1, max: 8 },
    },
  },
  select: {
    component: 'Select',
    notRendered: {
      SelectItem:
        "The options, composed in the preview as the select's children; their text value, description and trailing content are per option, as the examples show.",
      SelectSection:
        'Groups options under a title inside the list; the preview keeps one flat list.',
      OptionPopover:
        'The popover the select and autocomplete open their options in, exported for building a custom field; the preview opens it through the select.',
    },
    render: (props, update) =>
      createElement(
        SelectAny,
        {
          ...props,
          ...fieldSlots(props, () => createElement(SortIcon)),
          density: asDensity(props.density),
          // Single and multiple values differ in shape, and a starting search applies from the
          // next mount, so either change starts afresh.
          key: `${String(props.selectionMode)}-${String(props.defaultSearchValue ?? '')}`,
          errorMessage: 'Choose how to sort',
          open: props.open === true,
          onOpenChange: (open: boolean) => update('open', open),
        },
        createElement(SelectItemAny, { key: 'newest' }, 'Newest first'),
        createElement(SelectItemAny, { key: 'low' }, 'Price, low to high'),
        createElement(SelectItemAny, { key: 'high' }, 'Price, high to low'),
        createElement(SelectItemAny, { key: 'near' }, 'Nearest to you'),
      ),
    defaultProps: {
      variant: 'filled',
      density: 0,
      selectionMode: 'single',
      presentation: 'menu',
      searchable: false,
      loading: false,
      open: false,
      invalid: false,
      disabled: false,
      readOnly: false,
      required: false,
      leadingIcon: false,
      errorIcon: false,
    },
    surfacedProps: [
      'variant',
      'density',
      'label',
      'supportingText',
      'selectionMode',
      'maxSelections',
      'presentation',
      'searchable',
      'defaultSearchValue',
      'loading',
      'open',
      'invalid',
      'required',
      'disabled',
      'readOnly',
      'leadingIcon',
      'errorIcon',
    ],
    initialState: { variant: 'filled', label: 'Sort by' },
    enumOptions: {
      ...DENSITY_OPTIONS,
      selectionMode: ['single', 'multiple'],
      presentation: ['menu', 'sheet', 'auto'],
    },
    controlKinds: {
      density: 'number',
      leadingIcon: 'boolean',
      errorIcon: 'boolean',
      maxSelections: 'number',
      defaultSearchValue: 'string',
    },
    toggledSlots: { leadingIcon: SORT, errorIcon: HELP },
    numberRanges: { maxSelections: { min: 1, max: 4 } },
    notControlled: {
      searchValue:
        'Controlling the search hands filtering to the app (with `onSearchChange` the built-in filter is off), so the preview would stop filtering; `defaultSearchValue` has a control instead.',
    },
    importMembers: ['SelectItem'],
    codeChildren:
      '<SelectItem key="newest">Newest first</SelectItem>\n  <SelectItem key="low">Price, low to high</SelectItem>\n  <SelectItem key="high">Price, high to low</SelectItem>\n  <SelectItem key="near">Nearest to you</SelectItem>',
  },
  autocomplete: {
    component: 'Autocomplete',
    notRendered: {
      AutocompleteItem:
        "The options, composed in the preview as the autocomplete's children; their text value, description and trailing content are per option, as the examples show.",
      AutocompleteSection: 'Groups options under a title; the Sections example shows it.',
    },
    render: (props) =>
      createElement(
        AutocompleteAny,
        {
          ...props,
          ...fieldSlots(props, () => createElement(SearchIcon)),
          density: asDensity(props.density),
          // Single and multiple values differ in shape, so a mode change starts afresh.
          key: String(props.selectionMode),
          errorMessage: 'Choose a city',
        },
        createElement(AutocompleteItemAny, { key: 'paris' }, 'Paris'),
        createElement(AutocompleteItemAny, { key: 'london' }, 'London'),
        createElement(AutocompleteItemAny, { key: 'sydney' }, 'Sydney'),
        createElement(AutocompleteItemAny, { key: 'zurich' }, 'Zürich'),
      ),
    defaultProps: {
      variant: 'filled',
      density: 0,
      selectionMode: 'single',
      allowsCustomValue: false,
      clearable: false,
      loading: false,
      invalid: false,
      disabled: false,
      readOnly: false,
      required: false,
      leadingIcon: false,
      errorIcon: false,
    },
    surfacedProps: [
      'variant',
      'density',
      'label',
      'supportingText',
      'selectionMode',
      'maxSelections',
      'allowsCustomValue',
      'clearable',
      'loading',
      'invalid',
      'required',
      'disabled',
      'readOnly',
      'leadingIcon',
      'errorIcon',
    ],
    initialState: { variant: 'filled', label: 'City', clearable: true },
    enumOptions: { ...DENSITY_OPTIONS, selectionMode: ['single', 'multiple'] },
    controlKinds: {
      density: 'number',
      leadingIcon: 'boolean',
      errorIcon: 'boolean',
      maxSelections: 'number',
    },
    toggledSlots: { leadingIcon: SEARCH, errorIcon: HELP },
    numberRanges: { maxSelections: { min: 1, max: 4 } },
    importMembers: ['AutocompleteItem'],
    codeChildren:
      '<AutocompleteItem key="paris">Paris</AutocompleteItem>\n  <AutocompleteItem key="london">London</AutocompleteItem>\n  <AutocompleteItem key="sydney">Sydney</AutocompleteItem>\n  <AutocompleteItem key="zurich">Zürich</AutocompleteItem>',
  },
  checkbox: {
    component: 'Checkbox',
    render: (props, update) =>
      createElement(
        CheckboxAny,
        {
          ...props,
          selected: props.selected === true,
          onSelectedChange: (selected: boolean) => update('selected', selected),
        },
        'I accept the terms',
      ),
    defaultProps: {
      selected: false,
      indeterminate: false,
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    },
    surfacedProps: ['selected', 'indeterminate', 'disabled', 'readOnly', 'required', 'invalid'],
    initialState: { selected: true },
    codeChildren: 'I accept the terms',
  },
  'radio-group': {
    component: 'RadioGroup',
    notRendered: {
      Radio:
        "The options, composed in the preview as the group's children; a radio takes only its value, label and disabled state, which the group's controls already show.",
    },
    render: (props) =>
      createElement(
        RadioGroupAny,
        { ...props, defaultValue: 'standard', errorMessage: 'Choose a delivery option.' },
        createElement(RadioAny, { key: 'standard', value: 'standard' }, 'Standard'),
        createElement(RadioAny, { key: 'express', value: 'express' }, 'Express'),
      ),
    defaultProps: {
      orientation: 'vertical',
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    },
    surfacedProps: [
      'label',
      'supportingText',
      'orientation',
      'disabled',
      'readOnly',
      'required',
      'invalid',
    ],
    initialState: { label: 'Delivery', orientation: 'vertical' },
    enumOptions: { orientation: ['vertical', 'horizontal'] },
    importMembers: ['Radio'],
    codeSlots: { defaultValue: '"standard"' },
    codeChildren:
      '<Radio value="standard">Standard</Radio>\n  <Radio value="express">Express</Radio>',
  },
  switch: {
    component: 'Switch',
    render: (props, update) =>
      createElement(
        SwitchAny,
        {
          ...props,
          selected: props.selected === true,
          selectedIcon: slot(props.selectedIcon, () => createElement(DarkModeIcon)),
          unselectedIcon: slot(props.unselectedIcon, () => createElement(LightModeIcon)),
          onSelectedChange: (selected: boolean) => update('selected', selected),
        },
        'Dark theme',
      ),
    defaultProps: {
      selected: false,
      disabled: false,
      readOnly: false,
      icons: false,
      selectedIcon: false,
      unselectedIcon: false,
    },
    surfacedProps: ['selected', 'disabled', 'readOnly', 'icons', 'selectedIcon', 'unselectedIcon'],
    initialState: { selected: true },
    controlKinds: { selectedIcon: 'boolean', unselectedIcon: 'boolean' },
    toggledSlots: { selectedIcon: '<DarkModeIcon />', unselectedIcon: '<LightModeIcon />' },
    codeChildren: 'Dark theme',
  },
  slider: {
    component: 'Slider',
    notRendered: {
      RangeSlider:
        'A slider with two thumbs and the same look as the slider in the preview; the Range example shows it.',
    },
    render: (props, update) =>
      createElement(
        'div',
        {
          className: props.orientation === 'vertical' ? 'flex justify-center' : 'w-full max-w-sm',
        },
        createElement(SliderAny, {
          ...props,
          'aria-label': 'Volume',
          startIcon: slot(props.startIcon, () => createElement(VolumeDownIcon)),
          endIcon: slot(props.endIcon, () => createElement(VolumeUpIcon)),
          onChange: (value: number) => update('value', value),
        }),
      ),
    defaultProps: {
      size: 'xs',
      orientation: 'horizontal',
      minValue: 0,
      maxValue: 100,
      step: 1,
      ticks: false,
      centered: false,
      showValueLabel: false,
      disabled: false,
      startIcon: false,
      endIcon: false,
    },
    surfacedProps: [
      'size',
      'orientation',
      'value',
      'minValue',
      'maxValue',
      'step',
      'ticks',
      'centered',
      'showValueLabel',
      'startIcon',
      'endIcon',
      'disabled',
    ],
    initialState: { size: 'md', value: 40, startIcon: true },
    controlKinds: { startIcon: 'boolean', endIcon: 'boolean' },
    toggledSlots: { startIcon: '<VolumeDownIcon />', endIcon: '<VolumeUpIcon />' },
    numberRanges: {
      value: { min: 0, max: 100 },
      minValue: { min: 0, max: 50, step: 5 },
      maxValue: { min: 50, max: 200, step: 10 },
      step: { min: 1, max: 25 },
    },
    notControlled: {
      formatOptions:
        'An `Intl.NumberFormatOptions` object (`{ style: "percent" }`), which no switch or list of options can stand for; the value label example shows it.',
      name: 'Names the hidden form inputs for form submission; nothing in the preview changes.',
    },
    codeSlots: { 'aria-label': '"Volume"' },
  },
  chips: {
    component: 'AssistChip',
    notRendered: {
      SuggestionChip:
        'A chip type of its own with its own look; the Assist and suggestion example shows it beside the assist chip.',
      FilterChip:
        'A selectable chip type with its own look and states; the Filter example shows it.',
      InputChip: 'A removable chip type, with an avatar or icon; the Input example shows it.',
      ChipSet:
        'Lays out and groups several chips (selection, wrapping or scrolling); the examples show it around each chip type.',
    },
    render: (props) =>
      createElement(
        AssistChipAny,
        {
          ...props,
          leadingIcon: slot(props.leadingIcon, () => createElement(EditIcon)),
          href: props.href === '' ? undefined : props.href,
        },
        'Add note',
      ),
    defaultProps: {
      elevated: false,
      outline: 'standard',
      disabled: false,
      dragged: false,
      leadingIcon: false,
    },
    surfacedProps: ['elevated', 'outline', 'leadingIcon', 'disabled', 'dragged', 'href'],
    initialState: { leadingIcon: true },
    controlKinds: { leadingIcon: 'boolean' },
    toggledSlots: { leadingIcon: EDIT },
    notControlled: {
      elementType:
        'Only changes the rendered element (`button` is the one choice); nothing in the preview changes.',
      preventFocusOnPress:
        'Keeps focus where it was when the chip is pressed (for menu triggers); nothing in the preview changes.',
    },
    codeChildren: 'Add note',
  },
};
