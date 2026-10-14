import { color, corner, defineComponentTokens } from '../../tokens/component';

/*
 * The chips' component tokens, M3's `md.comp.{assist,filter,input,suggestion}-chip.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with Compose's *ChipTokens
 * defaults. M3 gives each kind its own token set, and their names differ (a filter chip's
 * colours say `unselected`, an assist chip's icon is `with-icon`), so each kind is a set of
 * its own: the root carries `data-tokens="md-comp-<kind>-chip"`, and `chip-styles.ts` reads
 * that kind's private variables. An elevated chip's root carries `data-elevated`.
 *
 * Hover, focus, dragged and disabled values, the elevated filter chip's selected container,
 * the selected leading icons, the strong outline, sizes and elevation stay classes.
 */

const paintsShape = { property: 'border-top-left-radius' } as const;
const paintsLabel = { property: 'color' } as const;
const paintsLeadingIcon = { slot: 'leading', property: 'color' } as const;
const paintsFlatOutline = { property: 'border-top-color' } as const;
const paintsElevatedContainer = { property: 'background-color', state: 'elevated' } as const;

/** The tokens of {@link AssistChip}: `--md-comp-assist-chip-*`. */
export const assistChipTokenSet = defineComponentTokens({
  name: 'md-comp-assist-chip',
  tokens: {
    'container-shape': {
      value: corner('small'),
      description: 'The corners.',
      compose: 'AssistChipTokens.ContainerShape',
      paints: paintsShape,
    },
    'label-text-color': {
      value: color('on-surface'),
      description: 'The label.',
      compose: 'AssistChipTokens.LabelTextColor',
      paints: paintsLabel,
    },
    'with-icon-icon-color': {
      value: color('primary'),
      description: 'The leading icon.',
      compose: 'AssistChipTokens.IconColor',
      paints: paintsLeadingIcon,
    },
    'flat-outline-color': {
      value: color('outline-variant'),
      description: 'The flat chip’s border (the strong outline keeps `outline`).',
      compose: 'AssistChipTokens.FlatOutlineColor',
      paints: paintsFlatOutline,
    },
    'elevated-container-color': {
      value: color('surface-container-low'),
      description: 'The elevated chip’s container.',
      compose: 'AssistChipTokens.ElevatedContainerColor',
      paints: paintsElevatedContainer,
    },
  },
});

/** The tokens of {@link SuggestionChip}: `--md-comp-suggestion-chip-*`. */
export const suggestionChipTokenSet = defineComponentTokens({
  name: 'md-comp-suggestion-chip',
  tokens: {
    'container-shape': {
      value: corner('small'),
      description: 'The corners.',
      compose: 'SuggestionChipTokens.ContainerShape',
      paints: paintsShape,
    },
    'label-text-color': {
      value: color('on-surface-variant'),
      description: 'The label.',
      compose: 'SuggestionChipTokens.LabelTextColor',
      paints: paintsLabel,
    },
    'with-leading-icon-leading-icon-color': {
      value: color('primary'),
      description: 'The leading icon.',
      compose: 'SuggestionChipTokens.LeadingIconColor',
      paints: paintsLeadingIcon,
    },
    'flat-outline-color': {
      value: color('outline-variant'),
      description: 'The flat chip’s border (the strong outline keeps `outline`).',
      compose: 'SuggestionChipTokens.FlatOutlineColor',
      paints: paintsFlatOutline,
    },
    'elevated-container-color': {
      value: color('surface-container-low'),
      description: 'The elevated chip’s container.',
      compose: 'SuggestionChipTokens.ElevatedContainerColor',
      paints: paintsElevatedContainer,
    },
  },
});

/** The tokens of {@link FilterChip}: `--md-comp-filter-chip-*`. */
export const filterChipTokenSet = defineComponentTokens({
  name: 'md-comp-filter-chip',
  tokens: {
    'container-shape': {
      value: corner('small'),
      description: 'The corners.',
      compose: 'FilterChipTokens.ContainerShape',
      paints: paintsShape,
    },
    'unselected-label-text-color': {
      value: color('on-surface-variant'),
      description: 'The label (and the check), unselected.',
      compose: 'FilterChipTokens.UnselectedLabelTextColor',
      paints: paintsLabel,
    },
    'selected-label-text-color': {
      value: color('on-secondary-container'),
      description: 'The label and the check, selected.',
      compose: 'FilterChipTokens.SelectedLabelTextColor',
      paints: { property: 'color', state: 'selected' },
    },
    'with-leading-icon-unselected-leading-icon-color': {
      value: color('primary'),
      description: 'The leading icon, unselected.',
      compose: 'FilterChipTokens.UnselectedLeadingIconColor',
      paints: paintsLeadingIcon,
    },
    'flat-unselected-outline-color': {
      value: color('outline-variant'),
      description: 'The flat chip’s border, unselected (the strong outline keeps `outline`).',
      compose: 'FilterChipTokens.FlatUnselectedOutlineColor',
      paints: paintsFlatOutline,
    },
    'flat-selected-container-color': {
      value: color('secondary-container'),
      description: 'The flat chip’s container, selected.',
      compose: 'FilterChipTokens.FlatSelectedContainerColor',
      paints: { property: 'background-color', state: 'selected' },
    },
    'elevated-unselected-container-color': {
      value: color('surface-container-low'),
      description: 'The elevated chip’s container, unselected.',
      compose: 'FilterChipTokens.ElevatedUnselectedContainerColor',
      paints: paintsElevatedContainer,
    },
  },
});

/** The tokens of {@link InputChip}: `--md-comp-input-chip-*`. */
export const inputChipTokenSet = defineComponentTokens({
  name: 'md-comp-input-chip',
  tokens: {
    'container-shape': {
      value: corner('small'),
      description: 'The corners.',
      compose: 'InputChipTokens.ContainerShape',
      paints: paintsShape,
    },
    'unselected-label-text-color': {
      value: color('on-surface-variant'),
      description: 'The label (and an unselected leading icon), unselected.',
      compose: 'InputChipTokens.UnselectedLabelTextColor',
      paints: paintsLabel,
    },
    'selected-label-text-color': {
      value: color('on-secondary-container'),
      description: 'The label, selected.',
      compose: 'InputChipTokens.SelectedLabelTextColor',
      paints: { property: 'color', state: 'selected' },
    },
    'unselected-outline-color': {
      value: color('outline-variant'),
      description: 'The border, unselected (the strong outline keeps `outline`).',
      compose: 'InputChipTokens.UnselectedOutlineColor',
      paints: paintsFlatOutline,
    },
    'selected-container-color': {
      value: color('secondary-container'),
      description: 'The container, selected.',
      compose: 'InputChipTokens.SelectedContainerColor',
      paints: { property: 'background-color', state: 'selected' },
    },
  },
});
