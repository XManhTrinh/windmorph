import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * Dialog's component tokens, M3's `md.comp.dialog.*` names (checked against m3.material.io's
 * token tables, 2026-10-14), with Compose's DialogTokens defaults. The panel carries
 * `data-tokens="md-comp-dialog"`, and `dialog-styles.ts` reads one private variable per part
 * (the icon, title and content inherit them). A full-screen dialog keeps its own container
 * (M3's separate full-screen set, not exposed): the window-filling `surface-container-high`
 * with no corners or shadow. The actions are text buttons with their own tokens, and the
 * dividers and the scrim stay classes.
 */

/** The tokens of {@link Dialog}: `--md-comp-dialog-<part>`. */
export const dialogTokenSet = defineComponentTokens({
  name: 'md-comp-dialog',
  tokens: {
    'container-color': {
      value: color('surface-container-high'),
      description: 'The panel.',
      compose: 'DialogTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'container-shape': {
      value: corner('extra-large'),
      description: "The panel's corners.",
      compose: 'DialogTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'container-elevation': {
      value: elevation(3),
      description: "The panel's shadow.",
      compose: 'DialogTokens.ContainerElevation',
      paints: { property: 'box-shadow' },
    },
    'headline-color': {
      value: color('on-surface'),
      description: "The title (`DialogTitle`, or the full-screen header's).",
      compose: 'DialogTokens.HeadlineColor',
      paints: { property: 'color', slot: 'title' },
    },
    'supporting-text-color': {
      value: color('on-surface-variant'),
      description: 'The supporting text (`DialogContent`).',
      compose: 'DialogTokens.SupportingTextColor',
      paints: { property: 'color', slot: 'content' },
    },
    'with-icon-icon-color': {
      value: color('secondary'),
      description: 'The icon above the title (`icon`).',
      compose: 'DialogTokens.IconColor',
      paints: { property: 'color', slot: 'icon' },
    },
  },
});
