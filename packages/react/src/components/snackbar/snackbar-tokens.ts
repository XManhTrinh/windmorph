import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * Snackbar's component tokens, M3's `md.comp.snackbar.*` names (checked against
 * m3.material.io's token tables, 2026-10-14), with Compose's SnackbarTokens defaults.
 * `snackbar-styles.ts` reads one private variable per part. The action and dismiss buttons'
 * hover, focus and pressed layers follow their colours; sizes and padding stay classes.
 */

/** The tokens of {@link Snackbar}: `--md-comp-snackbar-<part>`. */
export const snackbarTokenSet = defineComponentTokens({
  name: 'md-comp-snackbar',
  tokens: {
    'container-color': {
      value: color('inverse-surface'),
      description: 'The container.',
      compose: 'SnackbarTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'container-shape': {
      value: corner('extra-small'),
      description: 'The corners.',
      compose: 'SnackbarTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'container-elevation': {
      value: elevation(3),
      description: 'The shadow.',
      compose: 'SnackbarTokens.ContainerElevation',
      paints: { property: 'box-shadow' },
    },
    'supporting-text-color': {
      value: color('inverse-on-surface'),
      description: 'The message.',
      compose: 'SnackbarTokens.SupportingTextColor',
      paints: { property: 'color' },
    },
    'action-label-text-color': {
      value: color('inverse-primary'),
      description: 'The action, a text button.',
      compose: 'SnackbarTokens.ActionLabelTextColor',
      paints: { property: 'color', slot: 'action' },
    },
    'icon-color': {
      value: color('inverse-on-surface'),
      description: 'The dismiss icon button.',
      compose: 'SnackbarTokens.IconColor',
      paints: { property: 'color', slot: 'dismiss' },
    },
  },
});
