import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The radio button's component tokens, M3's `md.comp.radio-button.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's RadioButtonTokens defaults. The
 * drawn ring (`radio-ring.tsx`) carries `data-tokens`, so list items that are radio buttons
 * read the same tokens; the radio's root carries it too. Hover, focus, pressed and disabled
 * values stay classes.
 */

/** The tokens of {@link Radio}: `--md-comp-radio-button-<part>`. */
export const radioTokenSet = defineComponentTokens({
  name: 'md-comp-radio-button',
  tokens: {
    'selected-icon-color': {
      value: color('primary'),
      description: 'The ring and dot of a selected radio button.',
      compose: 'RadioButtonTokens.SelectedIconColor',
      paints: { property: 'border-top-color', slot: 'ring', state: 'selected' },
    },
    'unselected-icon-color': {
      value: color('on-surface-variant'),
      description: 'The ring of an unselected radio button.',
      compose: 'RadioButtonTokens.UnselectedIconColor',
      paints: { property: 'border-top-color', slot: 'ring' },
    },
  },
});
