import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * The modal date picker's component tokens, M3's `md.comp.date-picker.modal.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * DatePickerModalTokens defaults. They apply to `DatePicker` and `DateRangePicker` (each root
 * carries `data-tokens="md-comp-date-picker-modal"`) and to a `PickerDialog` of the `date`
 * variant, whose panel paints the container. The docked calendar of `DateField` is M3's
 * separate docked set, which isn't exposed: its days keep their classes.
 *
 * The range band is a gradient on each day cell, so its three shapes are worked out once
 * here (`derived`) from the band's colour. Hover, focus, pressed and disabled values, the
 * year list and the title stay classes.
 */

const RANGE = 'var(--_md-comp-date-picker-modal-range-selection-active-indicator-container-color)';

/** The tokens of {@link DatePicker}, {@link DateRangePicker} and the date {@link PickerDialog}. */
export const datePickerTokenSet = defineComponentTokens({
  name: 'md-comp-date-picker-modal',
  tokens: {
    'header-headline-color': {
      value: color('on-surface-variant'),
      description: 'The headline: the picked date or range.',
      compose: 'DatePickerModalTokens.HeaderHeadlineColor',
      paints: { property: 'color', slot: 'headline' },
    },
    'date-selected-container-color': {
      value: color('primary'),
      description: 'The circle of a picked day (and of both ends of a range).',
      compose: 'DatePickerModalTokens.DateSelectedContainerColor',
      paints: { property: 'background-color', slot: 'day', state: 'selected' },
    },
    'date-selected-label-text-color': {
      value: color('on-primary'),
      description: 'The number of a picked day.',
      compose: 'DatePickerModalTokens.DateSelectedLabelTextColor',
      paints: { property: 'color', slot: 'day', state: 'selected' },
    },
    'date-today-container-outline-color': {
      value: color('primary'),
      description: "The 1px outline of today's date.",
      compose: 'DatePickerModalTokens.DateTodayContainerOutlineColor',
      paints: { property: 'border-top-color', slot: 'day', state: 'today' },
    },
    'date-today-label-text-color': {
      value: color('primary'),
      description: "The number of today's date.",
      compose: 'DatePickerModalTokens.DateTodayLabelTextColor',
      paints: { property: 'color', slot: 'day', state: 'today' },
    },
    'range-selection-active-indicator-container-color': {
      value: color('secondary-container'),
      description: 'The band behind the days of a range.',
      compose: 'DatePickerModalTokens.RangeSelectionActiveIndicatorContainerColor',
      paints: { property: 'background-image', slot: 'cell', state: 'range' },
    },
    'container-color': {
      value: color('surface-container-high'),
      description: 'The dialog panel.',
      compose: 'DatePickerModalTokens.ContainerColor',
      paints: { property: 'background-color', state: 'variant' },
    },
    'container-shape': {
      value: corner('extra-large'),
      description: "The dialog panel's corners.",
      compose: 'DatePickerModalTokens.ContainerShape',
      paints: { property: 'border-top-left-radius', state: 'variant' },
    },
    'container-elevation': {
      value: elevation(3),
      description: "The dialog panel's shadow.",
      compose: 'DatePickerModalTokens.ContainerElevation',
      paints: { property: 'box-shadow', state: 'variant' },
    },
  },
  derived: {
    'range-middle': `linear-gradient(${RANGE}, ${RANGE})`,
    'range-to-right': `linear-gradient(to right, transparent 50%, ${RANGE} 50%)`,
    'range-to-left': `linear-gradient(to left, transparent 50%, ${RANGE} 50%)`,
  },
});
