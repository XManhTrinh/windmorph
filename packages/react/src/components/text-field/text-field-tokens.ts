import { color, corner, defineComponentTokens, type ComponentToken } from '../../tokens/component';

/*
 * The text field's component tokens, M3's `md.comp.{filled,outlined}-text-field.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * Filled/OutlinedTextFieldTokens defaults. Select and Autocomplete draw the same field
 * (`select/field-shell.tsx`), so they read these tokens too. The field's `data-variant` picks
 * the public names. Error, disabled and hover colours other than the outline stay classes.
 */

/** The tokens both variants share, written for one variant's Compose object. */
const contentTokens = (compose: 'FilledTextFieldTokens' | 'OutlinedTextFieldTokens') =>
  ({
    'label-text-color': {
      value: color('on-surface-variant'),
      description: 'The label.',
      compose: `${compose}.LabelColor`,
      paints: { property: 'color', slot: 'label' },
    },
    'focus-label-text-color': {
      value: color('primary'),
      description: 'The label while the field has focus.',
      compose: `${compose}.FocusLabelColor`,
      paints: { property: 'color', slot: 'label', state: 'focused' },
    },
    'input-text-color': {
      value: color('on-surface'),
      description: 'The text the user types.',
      compose: `${compose}.InputColor`,
      paints: { property: 'color', slot: 'input' },
    },
    'caret-color': {
      value: color('primary'),
      description: 'The text cursor.',
      compose: `${compose}.CaretColor`,
      paints: { property: 'caret-color', slot: 'input' },
    },
    'supporting-text-color': {
      value: color('on-surface-variant'),
      description: 'The supporting text below the field.',
      compose: `${compose}.SupportingColor`,
      paints: { property: 'color', slot: 'supporting-text' },
    },
    'leading-icon-color': {
      value: color('on-surface-variant'),
      description: 'The leading icon.',
      compose: `${compose}.LeadingIconColor`,
      paints: { property: 'color', slot: 'leading-icon' },
    },
    'trailing-icon-color': {
      value: color('on-surface-variant'),
      description: 'The trailing icon.',
      compose: `${compose}.TrailingIconColor`,
      paints: { property: 'color', slot: 'trailing-icon' },
    },
  }) satisfies Record<string, ComponentToken>;

/** The tokens of {@link TextField}, Select and Autocomplete: `--md-comp-<variant>-text-field-<part>`. */
export const textFieldTokenSet = defineComponentTokens({
  name: 'md-comp-text-field',
  tokens: {},
  scopes: {
    variant: {
      filled: {
        prefix: 'md-comp-filled-text-field',
        tokens: {
          'container-color': {
            value: color('surface-container-highest'),
            description: 'The container.',
            compose: 'FilledTextFieldTokens.ContainerColor',
            paints: { property: 'background-color', slot: 'container' },
          },
          'container-shape': {
            value: corner('extra-small'),
            description: 'The top corners.',
            compose: 'FilledTextFieldTokens.ContainerShape',
            paints: { property: 'border-top-left-radius', slot: 'container' },
          },
          'active-indicator-color': {
            value: color('on-surface-variant'),
            description: 'The line along the bottom of the container.',
            compose: 'FilledTextFieldTokens.ActiveIndicatorColor',
            paints: { property: 'background-color', slot: 'active-indicator' },
          },
          'focus-active-indicator-color': {
            value: color('primary'),
            description: 'The bottom line while the field has focus.',
            compose: 'FilledTextFieldTokens.FocusActiveIndicatorColor',
            paints: { property: 'background-color', slot: 'active-indicator', state: 'focused' },
          },
          ...contentTokens('FilledTextFieldTokens'),
        },
        // A filled field draws no outline.
        fixed: {
          'outline-color': 'transparent',
          'hover-outline-color': 'transparent',
          'focus-outline-color': 'transparent',
        },
      },
      outlined: {
        prefix: 'md-comp-outlined-text-field',
        tokens: {
          'container-shape': {
            value: corner('extra-small'),
            description: 'The corners.',
            compose: 'OutlinedTextFieldTokens.ContainerShape',
            paints: { property: 'border-top-left-radius', slot: 'outline' },
          },
          'outline-color': {
            value: color('outline'),
            description: 'The 1px outline.',
            compose: 'OutlinedTextFieldTokens.OutlineColor',
            paints: { property: 'border-top-color', slot: 'outline' },
          },
          'hover-outline-color': {
            value: color('on-surface'),
            description: 'The outline under the pointer.',
            compose: 'OutlinedTextFieldTokens.HoverOutlineColor',
            paints: { property: 'border-top-color', slot: 'outline', state: 'hovered' },
          },
          'focus-outline-color': {
            value: color('primary'),
            description: 'The 2px outline while the field has focus.',
            compose: 'OutlinedTextFieldTokens.FocusOutlineColor',
            paints: { property: 'border-top-color', slot: 'outline', state: 'focused' },
          },
          ...contentTokens('OutlinedTextFieldTokens'),
        },
        // An outlined field has no container fill, and hides the active indicator.
        fixed: {
          'container-color': 'transparent',
          'active-indicator-color': color('on-surface-variant'),
          'focus-active-indicator-color': color('primary'),
        },
      },
    },
  },
});
