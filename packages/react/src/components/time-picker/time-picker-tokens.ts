import { color, corner, defineComponentTokens } from '../../tokens/component';

/*
 * The time picker's component tokens, M3's `md.comp.time-picker.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's TimePickerTokens defaults. They
 * apply to `TimePicker` (its root carries `data-tokens="md-comp-time-picker"`) and to a
 * `PickerDialog` of the `time` variant, whose panel paints the container.
 *
 * The selector handle's colour also paints its track and centre dot, as Compose's
 * `TimePickerColors.selectorColor` does. Input mode's fields (M3's time input set), the
 * numbers, hover, focus and pressed values stay classes.
 */

/** The tokens of {@link TimePicker} and the time {@link PickerDialog}. */
export const timePickerTokenSet = defineComponentTokens({
  name: 'md-comp-time-picker',
  tokens: {
    'clock-dial-color': {
      value: color('surface-container-highest'),
      description: 'The clock dial.',
      compose: 'TimePickerTokens.ClockDialColor',
      paints: { property: 'fill', slot: 'clock-dial' },
    },
    'clock-dial-selector-handle-container-color': {
      value: color('primary'),
      description: "The dial's selector: its handle, track and centre dot.",
      compose: 'TimePickerTokens.ClockDialSelectorHandleContainerColor',
      paints: { property: 'fill', slot: 'clock-dial-selector-handle' },
    },
    'time-selector-selected-container-color': {
      value: color('primary-container'),
      description: 'The hour or minute selector being set.',
      compose: 'TimePickerTokens.TimeSelectorSelectedContainerColor',
      paints: { property: 'background-color', slot: 'time-selector', state: 'selected' },
    },
    'time-selector-unselected-container-color': {
      value: color('surface-container-highest'),
      description: 'The other time selector.',
      compose: 'TimePickerTokens.TimeSelectorUnselectedContainerColor',
      paints: { property: 'background-color', slot: 'time-selector' },
    },
    'period-selector-selected-container-color': {
      value: color('tertiary-container'),
      description: 'The chosen AM or PM option.',
      compose: 'TimePickerTokens.PeriodSelectorSelectedContainerColor',
      paints: { property: 'background-color', slot: 'period-selector-option', state: 'selected' },
    },
    'period-selector-outline-color': {
      value: color('outline'),
      description: "The AM / PM selector's 1px border and the line between its options.",
      compose: 'TimePickerTokens.PeriodSelectorOutlineColor',
      paints: { property: 'border-top-color', slot: 'period-selector' },
    },
    'container-color': {
      value: color('surface-container-high'),
      description: 'The dialog panel.',
      compose: 'TimePickerTokens.ContainerColor',
      paints: { property: 'background-color', state: 'variant' },
    },
    'container-shape': {
      value: corner('extra-large'),
      description: "The dialog panel's corners.",
      compose: 'TimePickerTokens.ContainerShape',
      paints: { property: 'border-top-left-radius', state: 'variant' },
    },
  },
});
