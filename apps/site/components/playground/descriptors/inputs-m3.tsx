'use client';

import {
  AssistChip,
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  FilterChip,
  InputChip,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Slider,
  SuggestionChip,
  Switch,
  TextField,
} from '@windmorph/react';
import { createElement, type ReactElement } from 'react';
import { SAMPLE_PORTRAIT } from '../../../examples/image-crop/sample-photo';
import {
  ExpandMoreIcon,
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
import {
  DENSITY_OPTIONS,
  EDIT,
  type PlaygroundDescriptor,
  type PlaygroundUpdate,
  asDensity,
  loose,
  noop,
} from './shared';

const TextFieldAny = loose(TextField);
const CheckboxAny = loose(Checkbox);
const RadioGroupAny = loose(RadioGroup);
const SwitchAny = loose(Switch);
const SliderAny = loose(Slider);
const AssistChipAny = loose(AssistChip);
const FilterChipAny = loose(FilterChip);
const InputChipAny = loose(InputChip);
const SuggestionChipAny = loose(SuggestionChip);
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

/** A switched-on slot's live icon; nothing while it's switched off. */
function slot(on: unknown, icon: () => ReactElement): ReactElement | undefined {
  return on === true ? icon() : undefined;
}

/** The field slots the text field, select and autocomplete share, with the field's own leading icon. */
const fieldSlots = (props: Record<string, unknown>, leading: () => ReactElement) => ({
  leadingIcon: slot(props.leadingIcon, leading),
  errorIcon: slot(props.errorIcon, () => createElement(HelpIcon)),
});

/** The chip types the chips playground switches between, by its `type` control's options. */
const CHIP_TYPES = {
  assist: 'AssistChip',
  filter: 'FilterChip',
  input: 'InputChip',
  suggestion: 'SuggestionChip',
} as const;

/** Each chip type's label, live and in the snippet. */
const CHIP_LABELS: Record<string, string> = {
  assist: 'Add note',
  filter: 'Vegetarian',
  input: 'Alex',
  suggestion: 'Sounds good',
};

/** The chip type chosen in the chips playground, rendered with the controls' values. */
function chipPreview(
  { type, leadingIcon, trailingIcon, avatar, onRemove, href, ...props }: Record<string, unknown>,
  update: PlaygroundUpdate,
): ReactElement {
  const shared = {
    ...props,
    density: asDensity(props.density),
    leadingIcon: slot(leadingIcon, () => createElement(EditIcon)),
  };
  const label = CHIP_LABELS[String(type)] ?? CHIP_LABELS.assist;
  switch (type) {
    case 'filter':
      return createElement(
        FilterChipAny,
        {
          ...shared,
          selected: props.selected === true,
          onSelectedChange: (next: boolean) => update('selected', next),
          trailingIcon:
            onRemove === true ? undefined : slot(trailingIcon, () => createElement(ExpandMoreIcon)),
          onRemove: onRemove === true ? noop : undefined,
        },
        label,
      );
    case 'input':
      return createElement(
        InputChipAny,
        {
          ...shared,
          avatar:
            avatar === true ? createElement('img', { src: SAMPLE_PORTRAIT, alt: '' }) : undefined,
          onRemove: onRemove === true ? noop : undefined,
        },
        label,
      );
    case 'suggestion':
      return createElement(SuggestionChipAny, shared, label);
    default:
      return createElement(
        AssistChipAny,
        { ...shared, href: href === '' ? undefined : href },
        label,
      );
  }
}

/**
 * A filter chip's trailing icon and remove button rule each other out (the types say so):
 * turning one on turns the other off.
 */
export function adjustChipTrailing(
  values: Record<string, unknown>,
  changed: string,
): Record<string, unknown> {
  if (changed === 'onRemove' && values.onRemove === true && values.type === 'filter') {
    return { ...values, trailingIcon: false };
  }
  if (changed === 'trailingIcon' && values.trailingIcon === true) {
    return { ...values, onRemove: false };
  }
  return values;
}

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
      counter: true,
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
      'counter',
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
      closeOnSelect: true,
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
      'placeholder',
      'selectionMode',
      'maxSelections',
      'closeOnSelect',
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
    // `closeOnSelect` defaults by selection mode: on for a single choice, off for several. A mode
    // change resets it to the new default, and the snippet writes it only when it differs.
    codeDefaults: (values) => ({ closeOnSelect: values.selectionMode !== 'multiple' }),
    adjust: (values, changed) =>
      changed === 'selectionMode'
        ? { ...values, closeOnSelect: values.selectionMode !== 'multiple' }
        : values,
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
      allowCustomValue: false,
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
      'placeholder',
      'selectionMode',
      'maxSelections',
      'allowCustomValue',
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
          density: asDensity(props.density),
          checked: props.checked === true,
          onCheckedChange: (checked: boolean) => update('checked', checked),
        },
        'I accept the terms',
      ),
    defaultProps: {
      checked: false,
      indeterminate: false,
      density: 0,
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    },
    surfacedProps: [
      'checked',
      'indeterminate',
      'density',
      'disabled',
      'readOnly',
      'required',
      'invalid',
    ],
    initialState: { checked: true },
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { density: 'number' },
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
        {
          ...props,
          density: asDensity(props.density),
          defaultValue: 'standard',
        },
        createElement(RadioAny, { key: 'standard', value: 'standard' }, 'Standard'),
        createElement(RadioAny, { key: 'express', value: 'express' }, 'Express'),
      ),
    defaultProps: {
      orientation: 'vertical',
      density: 0,
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
    },
    surfacedProps: [
      'label',
      'supportingText',
      'orientation',
      'density',
      'disabled',
      'readOnly',
      'required',
      'invalid',
      'errorMessage',
    ],
    initialState: {
      label: 'Delivery',
      orientation: 'vertical',
      errorMessage: 'Choose a delivery option.',
    },
    enumOptions: { ...DENSITY_OPTIONS, orientation: ['vertical', 'horizontal'] },
    importMembers: ['Radio'],
    controlKinds: { density: 'number', errorMessage: 'string' },
    groups: { errorMessage: 'content' },
    codeSlots: {
      defaultValue: '"standard"',
      // Shown only while invalid, so the snippet writes it only then.
      errorMessage: (values) =>
        values.invalid === true && typeof values.errorMessage === 'string' && values.errorMessage
          ? JSON.stringify(values.errorMessage)
          : null,
    },
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
          density: asDensity(props.density),
          checked: props.checked === true,
          selectedIcon: slot(props.selectedIcon, () => createElement(DarkModeIcon)),
          unselectedIcon: slot(props.unselectedIcon, () => createElement(LightModeIcon)),
          onCheckedChange: (checked: boolean) => update('checked', checked),
        },
        'Dark theme',
      ),
    defaultProps: {
      checked: false,
      disabled: false,
      readOnly: false,
      required: false,
      invalid: false,
      icons: false,
      selectedIcon: false,
      unselectedIcon: false,
      density: 0,
    },
    surfacedProps: [
      'checked',
      'disabled',
      'readOnly',
      'required',
      'invalid',
      'icons',
      'selectedIcon',
      'unselectedIcon',
      'density',
    ],
    initialState: { checked: true },
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { selectedIcon: 'boolean', unselectedIcon: 'boolean', density: 'number' },
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
          leadingIcon: slot(props.leadingIcon, () => createElement(VolumeDownIcon)),
          trailingIcon: slot(props.trailingIcon, () => createElement(VolumeUpIcon)),
          onChange: (value: number) => update('value', value),
        }),
      ),
    defaultProps: {
      size: 'xs',
      orientation: 'horizontal',
      min: 0,
      max: 100,
      step: 1,
      ticks: false,
      centered: false,
      valueLabel: false,
      disabled: false,
      leadingIcon: false,
      trailingIcon: false,
    },
    surfacedProps: [
      'size',
      'orientation',
      'value',
      'min',
      'max',
      'step',
      'ticks',
      'centered',
      'valueLabel',
      'leadingIcon',
      'trailingIcon',
      'disabled',
    ],
    initialState: { size: 'md', value: 40, leadingIcon: true },
    controlKinds: { leadingIcon: 'boolean', trailingIcon: 'boolean' },
    toggledSlots: { leadingIcon: '<VolumeDownIcon />', trailingIcon: '<VolumeUpIcon />' },
    numberRanges: {
      value: { min: 0, max: 100 },
      min: { min: 0, max: 50, step: 5 },
      max: { min: 50, max: 200, step: 10 },
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
    componentSwitch: { control: 'type', components: CHIP_TYPES },
    controlDescriptions: {
      type: 'The chip type: assist (an action), filter (a selectable option), input (an entry the user added) or suggestion (a suggested reply or query).',
    },
    notRendered: {
      ChipSet:
        'Lays out and groups several chips (selection, wrapping or scrolling); the examples show it around each chip type.',
    },
    render: chipPreview,
    defaultProps: {
      elevated: false,
      outline: 'standard',
      density: 0,
      disabled: false,
      dragged: false,
      leadingIcon: false,
      trailingIcon: false,
      selected: false,
      onRemove: false,
      avatar: false,
    },
    surfacedProps: [
      'type',
      'selected',
      'elevated',
      'outline',
      'density',
      'leadingIcon',
      'trailingIcon',
      'avatar',
      'onRemove',
      'disabled',
      'dragged',
      'href',
    ],
    initialState: { leadingIcon: true },
    adjust: adjustChipTrailing,
    enumOptions: DENSITY_OPTIONS,
    controlKinds: {
      leadingIcon: 'boolean',
      trailingIcon: 'boolean',
      avatar: 'boolean',
      onRemove: 'boolean',
      density: 'number',
    },
    groups: { onRemove: 'content' },
    toggledSlots: {
      leadingIcon: EDIT,
      trailingIcon: '<ExpandMoreIcon />',
      avatar: '<img src="/avatars/alex.jpg" alt="" />',
      onRemove: "() => console.log('Remove')",
    },
    notControlled: {
      as: 'Only changes the rendered element (`button` is the one choice); nothing in the preview changes.',
      preventFocusOnPress:
        'Keeps focus where it was when the chip is pressed (for menu triggers); nothing in the preview changes.',
      value:
        "Only identifies a filter chip in a selection group's keys; nothing the preview shows.",
    },
    codeChildren: (values) => CHIP_LABELS[String(values.type)] ?? CHIP_LABELS.assist!,
  },
};
