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
import { CloseIcon, EditIcon, HelpIcon, SearchIcon, StarIcon, StarOutlineIcon } from '../../icons';
import { EDIT, STAR, type PlaygroundDescriptor, loose, svg } from './shared';

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
const SEARCH = svg(
  'M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z',
);
const CLOSE = svg(
  'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z',
);
const HELP = svg(
  'M478-240q21 0 35.5-14.5T528-290q0-21-14.5-35.5T478-340q-21 0-35.5 14.5T428-290q0 21 14.5 35.5T478-240Zm-36-154h74q0-33 7.5-52t42.5-52q26-26 41-49.5t15-56.5q0-56-41-86t-97-30q-57 0-92.5 30T342-618l66 26q5-18 22.5-39t53.5-21q32 0 48 17.5t16 38.5q0 20-12 37.5T506-526q-44 39-54 59t-10 73Zm38 314q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z',
);
const STAR_OUTLINE = svg(
  'm354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z',
);

/** A switched-on slot's live icon; nothing while it's switched off. */
function slot(on: unknown, icon: () => ReactElement): ReactElement | undefined {
  return on === true ? icon() : undefined;
}

/** The field slots the text field, select and autocomplete share. */
const fieldSlots = (props: Record<string, unknown>) => ({
  leadingIcon: slot(props.leadingIcon, () => createElement(SearchIcon)),
  errorIcon: slot(props.errorIcon, () => createElement(HelpIcon)),
});

/** Playgrounds for the M3 inputs and selection controls, by page slug. */
export const INPUTS_M3_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'text-field': {
    component: 'TextField',
    render: (props, update) =>
      createElement(TextFieldAny, {
        ...props,
        ...fieldSlots(props),
        trailingIcon: slot(props.trailingIcon, () => createElement(CloseIcon)),
        value: props.value ?? '',
        onChange: (value: string) => update('value', value),
      }),
    defaultProps: {
      variant: 'filled',
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
    controlKinds: {
      leadingIcon: 'boolean',
      trailingIcon: 'boolean',
      errorIcon: 'boolean',
      errorMessage: 'string',
      maxLength: 'number',
    },
    toggledSlots: { leadingIcon: SEARCH, trailingIcon: CLOSE, errorIcon: HELP },
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
          ...fieldSlots(props),
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
    enumOptions: { selectionMode: ['single', 'multiple'], presentation: ['menu', 'sheet', 'auto'] },
    controlKinds: {
      leadingIcon: 'boolean',
      errorIcon: 'boolean',
      maxSelections: 'number',
      defaultSearchValue: 'string',
    },
    toggledSlots: { leadingIcon: SEARCH, errorIcon: HELP },
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
          ...fieldSlots(props),
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
    enumOptions: { selectionMode: ['single', 'multiple'] },
    controlKinds: { leadingIcon: 'boolean', errorIcon: 'boolean', maxSelections: 'number' },
    toggledSlots: { leadingIcon: SEARCH, errorIcon: HELP },
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
          selectedIcon: slot(props.selectedIcon, () => createElement(StarIcon)),
          unselectedIcon: slot(props.unselectedIcon, () => createElement(StarOutlineIcon)),
          onSelectedChange: (selected: boolean) => update('selected', selected),
        },
        'Wi-Fi',
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
    toggledSlots: { selectedIcon: STAR, unselectedIcon: STAR_OUTLINE },
    codeChildren: 'Wi-Fi',
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
          startIcon: slot(props.startIcon, () => createElement(StarIcon)),
          endIcon: slot(props.endIcon, () => createElement(StarOutlineIcon)),
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
    initialState: { size: 'md', value: 40 },
    controlKinds: { startIcon: 'boolean', endIcon: 'boolean' },
    toggledSlots: { startIcon: STAR, endIcon: STAR_OUTLINE },
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
