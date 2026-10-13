import type { ComponentSpecData } from './types';

/** The exposed dropdown's colour style, which Select and Autocomplete share. */
const VIBRANT_NOT_BUILT = {
  item: 'Color: vibrant',
  note: 'The options list always uses the standard menu colours; the vibrant style is on `Menu` (`variant="vibrant"`) for action menus.',
};

/** Spec data for the M3 inputs and selection controls, by page slug. */
export const INPUTS_M3_SPEC: Record<string, ComponentSpecData> = {
  'text-field': {
    spec: 'text-fields/specs',
    covers: [
      { name: 'Filled text field', kind: 'variant', examples: ['text-field/text-field-variants'] },
      {
        name: 'Outlined text field',
        kind: 'variant',
        examples: ['text-field/text-field-variants'],
      },
      {
        name: 'Leading and trailing icons',
        kind: 'configuration',
        examples: ['text-field/text-field-adornments', 'text-field/text-field-form'],
      },
      {
        name: 'Prefix and suffix',
        kind: 'configuration',
        examples: ['text-field/text-field-adornments'],
      },
      {
        name: 'Supporting text and character counter',
        kind: 'configuration',
        examples: ['text-field/text-field-variants', 'text-field/text-field-multiline'],
      },
      {
        name: 'Error, with an error icon',
        kind: 'configuration',
        examples: ['text-field/text-field-states', 'text-field/text-field-form'],
      },
      {
        name: 'Required, disabled and read-only',
        kind: 'configuration',
        examples: ['text-field/text-field-states'],
      },
      {
        name: 'Text area and multi-line field',
        kind: 'configuration',
        examples: ['text-field/text-field-multiline'],
      },
      { name: 'Forms', kind: 'use case', examples: ['text-field/text-field-form'] },
    ],
    extensions: [
      {
        item: 'Autofill',
        note: "The label also floats for the browser's autofill (`:has(:autofill)`), since an autofilled value is hidden from scripts until the person interacts.",
      },
      {
        item: '`prefixLabel` and `suffixLabel`',
        note: 'What screen readers hear for a prefix or suffix ("US dollars" for "$"), which join the input\'s description.',
      },
    ],
    notBuilt: [
      {
        item: 'Composable field parts',
        note: 'Only the complete `TextField` is exported; the parts it is built from stay internal.',
      },
    ],
    compose: [
      {
        composable: 'TextField',
        component: 'TextField',
        params: [
          { compose: 'value, onValueChange', windmorph: '`value`, `onChange`' },
          { compose: 'label, placeholder', windmorph: '`label`, `placeholder`' },
          { compose: 'leadingIcon, trailingIcon', windmorph: '`leadingIcon`, `trailingIcon`' },
          { compose: 'prefix, suffix', windmorph: '`prefix`, `suffix`' },
          { compose: 'supportingText', windmorph: '`supportingText`' },
          {
            compose: 'isError',
            windmorph: '`invalid`, `errorMessage`',
            note: 'The message is announced as an alert.',
          },
          { compose: 'enabled, readOnly', windmorph: '`disabled`, `readOnly`' },
          {
            compose: 'singleLine = false, minLines, maxLines',
            windmorph: '`multiline`, `rows`, `autoGrow`, `maxRows`',
            note: 'A multiline field is a fixed-height text area unless `autoGrow` is set.',
          },
        ],
      },
      {
        composable: 'OutlinedTextField',
        component: 'TextField variant="outlined"',
      },
    ],
  },
  select: {
    spec: 'menus/specs',
    covers: [
      { name: 'Vertical menu', kind: 'variant', examples: ['select/select-basic'] },
      { name: 'Color: standard', kind: 'configuration', examples: ['select/select-basic'] },
      { name: 'Layout: standard', kind: 'configuration', examples: ['select/select-basic'] },
      {
        name: 'Layout: grouped',
        kind: 'configuration',
        examples: ['select/select-variants', 'select/select-searchable'],
      },
      {
        name: 'Filled and outlined fields',
        kind: 'configuration',
        examples: ['select/select-variants'],
      },
      {
        name: 'A menu opening from a text field',
        kind: 'use case',
        examples: ['select/select-basic'],
      },
    ],
    differences: [
      {
        item: 'Focus when the menu opens',
        note: "The chosen option, or else the first one, takes focus (the WAI-ARIA listbox pattern); M3's menu page says the first item, written for action menus.",
      },
    ],
    extensions: [
      {
        item: '`presentation="sheet"` and `"auto"`',
        note: "Opens the options in a bottom sheet, always or below 600px; the default `menu` is M3's dropdown on every window.",
      },
      {
        item: '`searchable`',
        note: "A search at the top of the menu or sheet that filters as you type, built from the search bar's field at 48px.",
      },
      {
        item: 'Multiple selection',
        note: '`selectionMode="multiple"` with `maxSelections`; the field lists the chosen options.',
      },
      {
        item: '`renderValue` and `loading`',
        note: 'What the field shows for the chosen option, and a loading indicator in the list.',
      },
    ],
    notBuilt: [VIBRANT_NOT_BUILT],
    compose: [
      {
        composable: 'ExposedDropdownMenuBox',
        component: 'Select',
        params: [
          { compose: 'expanded, onExpandedChange', windmorph: '`open`, `onOpenChange`' },
          {
            compose: 'TextField(readOnly, MenuAnchorType.PrimaryNotEditable)',
            windmorph: '`variant`, `label`, `supportingText`',
            note: 'The field is built in.',
          },
        ],
        note: 'The selected value is `value` / `onChange`, by item key.',
      },
      {
        composable: 'ExposedDropdownMenu + DropdownMenuItem',
        component: 'SelectItem',
        params: [
          { compose: 'text', windmorph: '`children`' },
          { compose: 'leadingIcon, trailingIcon', windmorph: '`leadingIcon`, `trailing`' },
        ],
      },
    ],
  },
  autocomplete: {
    spec: 'menus/specs',
    covers: [
      { name: 'Vertical menu', kind: 'variant', examples: ['autocomplete/autocomplete-basic'] },
      {
        name: 'Color: standard',
        kind: 'configuration',
        examples: ['autocomplete/autocomplete-basic'],
      },
      {
        name: 'Layout: grouped',
        kind: 'configuration',
        examples: ['autocomplete/autocomplete-sections'],
      },
      {
        name: 'Filled and outlined fields',
        kind: 'configuration',
        examples: ['autocomplete/autocomplete-basic', 'autocomplete/autocomplete-multiple'],
      },
      {
        name: 'Type to filter the options',
        kind: 'use case',
        examples: ['autocomplete/autocomplete-basic', 'autocomplete/autocomplete-sections'],
      },
      {
        name: 'Options loaded for what was typed',
        kind: 'use case',
        examples: ['autocomplete/autocomplete-async'],
      },
    ],
    extensions: [
      {
        item: 'Built-in filtering',
        note: 'Matches anywhere, ignoring case and accents ("zurich" finds "Zürich"); `filter` replaces it.',
      },
      {
        item: 'Multiple selection as input chips',
        note: '`selectionMode="multiple"` shows the choices as `InputChip`s in the field, with `maxSelections`.',
      },
      {
        item: '`allowsCustomValue` and `loading`',
        note: 'Keeps text that matches no option, and shows a loading indicator in the list.',
      },
    ],
    notBuilt: [VIBRANT_NOT_BUILT],
    compose: [
      {
        composable: 'ExposedDropdownMenuBox',
        component: 'Autocomplete',
        params: [
          {
            compose: 'TextField(value, onValueChange, MenuAnchorType.PrimaryEditable)',
            windmorph: '`inputValue`, `onInputChange`',
            note: 'The field is built in.',
          },
        ],
        note: 'Compose leaves filtering to the app; here it is built in.',
      },
      {
        composable: 'ExposedDropdownMenu + DropdownMenuItem',
        component: 'AutocompleteItem',
        params: [{ compose: 'text', windmorph: '`children`' }],
      },
    ],
  },
  checkbox: {
    spec: 'checkbox/specs',
    covers: [
      {
        name: 'Unselected and selected',
        kind: 'configuration',
        examples: ['checkbox/checkbox-basic'],
      },
      {
        name: 'Indeterminate',
        kind: 'configuration',
        examples: ['checkbox/checkbox-indeterminate'],
      },
      { name: 'Error', kind: 'configuration', examples: ['checkbox/checkbox-states'] },
      { name: 'Disabled', kind: 'configuration', examples: ['checkbox/checkbox-states'] },
      {
        name: 'Select several items, with a parent',
        kind: 'use case',
        examples: ['checkbox/checkbox-indeterminate'],
      },
    ],
    differences: [
      {
        item: 'Check to dash',
        note: "The indeterminate dash draws on its own instead of morphing from the check, because Safari can't animate a path's shape in CSS.",
      },
    ],
    compose: [
      {
        composable: 'Checkbox',
        component: 'Checkbox',
        params: [
          { compose: 'checked, onCheckedChange', windmorph: '`selected`, `onSelectedChange`' },
          { compose: 'enabled', windmorph: '`disabled`' },
        ],
        note: 'The label is the `children`, so the whole row is the target.',
      },
      {
        composable: 'TriStateCheckbox',
        component: 'Checkbox indeterminate',
        params: [
          {
            compose: 'state = ToggleableState.Indeterminate',
            windmorph: '`indeterminate`',
            note: 'Purely visual; the checkbox is still checked or not.',
          },
        ],
      },
    ],
  },
  'radio-group': {
    spec: 'radio-button/specs',
    covers: [
      {
        name: 'Selected and unselected',
        kind: 'configuration',
        examples: ['radio-group/radio-group-basic'],
      },
      { name: 'Disabled', kind: 'configuration', examples: ['radio-group/radio-group-states'] },
      {
        name: 'Choose one option from a set',
        kind: 'use case',
        examples: ['radio-group/radio-group-basic', 'radio-group/radio-group-horizontal'],
      },
    ],
    extensions: [
      {
        item: 'Group label, supporting and error text',
        note: "M3 radios have no error colour, so `RadioGroup` carries the group's label, supporting text and error message.",
      },
      {
        item: '`orientation`',
        note: 'Lays the options out in a column or a row, with matching arrow keys.',
      },
    ],
    compose: [
      {
        composable: 'RadioButton',
        component: 'Radio',
        params: [
          {
            compose: 'selected, onClick',
            windmorph: '`value`',
            note: "The group's `value` / `onChange` holds the selection.",
          },
          { compose: 'enabled', windmorph: '`disabled`' },
        ],
      },
      {
        composable: 'Modifier.selectableGroup()',
        component: 'RadioGroup',
        params: [{ compose: 'the selected option', windmorph: '`value`, `onChange`' }],
      },
    ],
  },
  switch: {
    spec: 'switch/specs',
    covers: [
      { name: 'Without icons', kind: 'configuration', examples: ['switch/switch-basic'] },
      { name: 'Icon on selected switch', kind: 'configuration', examples: ['switch/switch-icons'] },
      {
        name: 'Icon on selected and unselected switch',
        kind: 'configuration',
        examples: ['switch/switch-icons'],
      },
      { name: 'Disabled', kind: 'configuration', examples: ['switch/switch-states'] },
      {
        name: 'Turn a single setting on or off',
        kind: 'use case',
        examples: ['switch/switch-basic'],
      },
    ],
    compose: [
      {
        composable: 'Switch',
        component: 'Switch',
        params: [
          { compose: 'checked, onCheckedChange', windmorph: '`selected`, `onSelectedChange`' },
          { compose: 'thumbContent', windmorph: '`icons`, `selectedIcon`, `unselectedIcon`' },
          { compose: 'enabled', windmorph: '`disabled`' },
        ],
      },
    ],
  },
  slider: {
    spec: 'sliders/specs',
    covers: [
      { name: 'Standard', kind: 'variant', examples: ['slider/slider-sizes'] },
      { name: 'Centered', kind: 'variant', examples: ['slider/slider-discrete'] },
      { name: 'Range', kind: 'variant', examples: ['slider/slider-range'] },
      { name: 'Discrete', kind: 'variant', examples: ['slider/slider-discrete'] },
      {
        name: 'Orientation: horizontal and vertical',
        kind: 'configuration',
        examples: ['slider/slider-sizes', 'slider/slider-vertical'],
      },
      { name: 'Size: XS to XL', kind: 'configuration', examples: ['slider/slider-sizes'] },
      { name: 'Inset icon', kind: 'configuration', examples: ['slider/slider-value-label'] },
      { name: 'Stops', kind: 'configuration', examples: ['slider/slider-discrete'] },
      {
        name: 'Value indicator',
        kind: 'configuration',
        examples: ['slider/slider-value-label'],
      },
    ],
    differences: [
      {
        item: 'Pressing a discrete track',
        note: 'A press maps linearly to the value while discrete stops are drawn between the corners, so a press near the ends can land one step off; there are no haptics.',
      },
    ],
    extensions: [
      {
        item: '`endIcon`',
        note: "A second inset icon at the inactive track's end (from Material Components Android); the spec shows one inset icon.",
      },
      {
        item: '`formatOptions`',
        note: 'Formats the value indicator and what assistive tech announces, e.g. as a percentage.',
      },
    ],
    compose: [
      {
        composable: 'Slider',
        component: 'Slider',
        params: [
          { compose: 'value, onValueChange', windmorph: '`value`, `onChange`' },
          { compose: 'valueRange', windmorph: '`minValue`, `maxValue`' },
          {
            compose: 'steps',
            windmorph: '`step`, `ticks`',
            note: 'Compose counts the stops between the ends; `step` is the distance between values.',
          },
          { compose: 'onValueChangeFinished', windmorph: '`onChangeEnd`' },
          { compose: 'enabled', windmorph: '`disabled`' },
        ],
      },
      {
        composable: 'RangeSlider',
        component: 'RangeSlider',
        params: [
          { compose: 'value: ClosedFloatingPointRange', windmorph: '`value: [start, end]`' },
        ],
      },
      {
        composable: 'VerticalSlider',
        component: 'Slider orientation="vertical"',
        params: [
          {
            compose: 'reverseDirection',
            windmorph: '(none)',
            note: 'Vertical sliders always run bottom to top.',
          },
        ],
      },
    ],
  },
  chips: {
    spec: 'chips/specs',
    covers: [
      { name: 'Assist chip', kind: 'variant', examples: ['chips/chips-assist-suggestion'] },
      { name: 'Filter chip', kind: 'variant', examples: ['chips/chips-filter'] },
      { name: 'Input chip', kind: 'variant', examples: ['chips/chips-input'] },
      { name: 'Suggestion chip', kind: 'variant', examples: ['chips/chips-assist-suggestion'] },
      {
        name: 'Flat and elevated',
        kind: 'configuration',
        examples: ['chips/chips-assist-suggestion'],
      },
      { name: 'Filter content', kind: 'use case', examples: ['chips/chips-filter'] },
      { name: 'Entries a person added', kind: 'use case', examples: ['chips/chips-input'] },
    ],
    extensions: [
      {
        item: '`outline="strong"`',
        note: "Draws a flat chip's border in `outline` for 3:1 contrast, as the spec's accessibility guidance asks where nothing else shows the chip's edge.",
      },
      {
        item: '`ChipSet`',
        note: 'One Tab stop with arrow keys, a shared selection for filter chips, and a `scroll` layout that keeps one row.',
      },
    ],
    compose: [
      {
        composable: 'AssistChip / ElevatedAssistChip',
        component: 'AssistChip',
        params: [
          { compose: 'onClick, label', windmorph: '`onPress`, `children`' },
          { compose: 'leadingIcon', windmorph: '`leadingIcon`' },
          { compose: 'ElevatedAssistChip', windmorph: '`elevated`' },
          { compose: 'enabled', windmorph: '`disabled`' },
        ],
      },
      {
        composable: 'FilterChip / ElevatedFilterChip',
        component: 'FilterChip',
        params: [
          { compose: 'selected, onClick', windmorph: '`selected`, `onSelectedChange`' },
          { compose: 'leadingIcon, trailingIcon', windmorph: '`leadingIcon`, `trailingIcon`' },
          { compose: 'ElevatedFilterChip', windmorph: '`elevated`' },
        ],
      },
      {
        composable: 'InputChip',
        component: 'InputChip',
        params: [
          { compose: 'avatar, leadingIcon', windmorph: '`avatar`, `leadingIcon`' },
          { compose: 'trailingIcon (a close icon)', windmorph: '`onRemove`, `removeLabel`' },
          { compose: 'selected', windmorph: '`selected`' },
        ],
      },
      {
        composable: 'SuggestionChip / ElevatedSuggestionChip',
        component: 'SuggestionChip',
        params: [{ compose: 'ElevatedSuggestionChip', windmorph: '`elevated`' }],
      },
    ],
  },
};
