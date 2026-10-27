import { color, defineComponentTokens } from '../../tokens/component';

/*
 * Checkbox's component tokens, M3's `md.comp.checkbox.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's CheckboxTokens defaults. The
 * drawn box (`checkbox-box.tsx`) carries `data-tokens`, so list items that are checkboxes
 * read the same tokens; the checkbox's root carries it too. Hover, focus, pressed, error and
 * disabled values stay classes.
 */

/** The tokens of {@link Checkbox}: `--md-comp-checkbox-<part>`. */
export const checkboxTokenSet = defineComponentTokens({
  name: 'md-comp-checkbox',
  tokens: {
    'selected-container-color': {
      value: color('primary'),
      description: 'The box, checked or indeterminate.',
      compose: 'CheckboxTokens.SelectedContainerColor',
      paints: { property: 'background-color', slot: 'box', state: 'checked' },
    },
    'selected-icon-color': {
      value: color('on-primary'),
      description: 'The check mark and the dash.',
      compose: 'CheckboxTokens.SelectedIconColor',
      paints: { property: 'color', slot: 'box', state: 'checked' },
    },
    'unselected-outline-color': {
      value: color('on-surface-variant'),
      description: 'The 2px outline of an unchecked box.',
      compose: 'CheckboxTokens.UnselectedOutlineColor',
      paints: { property: 'border-top-color', slot: 'box' },
    },
  },
});
