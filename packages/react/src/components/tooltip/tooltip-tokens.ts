import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * The tooltips' component tokens, M3's `md.comp.plain-tooltip.*` and `md.comp.rich-tooltip.*`
 * names (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * PlainTooltipTokens and RichTooltipTokens defaults. Each tooltip's surface carries its set's
 * `data-tokens` (so they apply however the tooltip's module loads), and `tooltip-styles.ts`
 * reads one private variable per part; the caret takes the container colour. The rich
 * tooltip's action is a text button with its own tokens. Sizes and padding stay classes.
 */

/** The tokens of {@link Tooltip}: `--md-comp-plain-tooltip-<part>`. */
export const plainTooltipTokenSet = defineComponentTokens({
  name: 'md-comp-plain-tooltip',
  tokens: {
    'container-color': {
      value: color('inverse-surface'),
      description: 'The container and its caret.',
      compose: 'PlainTooltipTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'container-shape': {
      value: corner('extra-small'),
      description: 'The corners.',
      compose: 'PlainTooltipTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'supporting-text-color': {
      value: color('inverse-on-surface'),
      description: 'The label.',
      compose: 'PlainTooltipTokens.SupportingTextColor',
      paints: { property: 'color' },
    },
  },
});

/** The tokens of {@link RichTooltip}: `--md-comp-rich-tooltip-<part>`. */
export const richTooltipTokenSet = defineComponentTokens({
  name: 'md-comp-rich-tooltip',
  tokens: {
    'container-color': {
      value: color('surface-container'),
      description: 'The container and its caret.',
      compose: 'RichTooltipTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'container-shape': {
      value: corner('medium'),
      description: 'The corners.',
      compose: 'RichTooltipTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
    'container-elevation': {
      value: elevation(2),
      description: 'The shadow.',
      compose: 'RichTooltipTokens.ContainerElevation',
      paints: { property: 'box-shadow' },
    },
    'subhead-color': {
      value: color('on-surface-variant'),
      description: 'The subhead (`title`).',
      compose: 'RichTooltipTokens.SubheadColor',
      paints: { property: 'color', slot: 'subhead' },
    },
    'supporting-text-color': {
      value: color('on-surface-variant'),
      description: 'The supporting text.',
      compose: 'RichTooltipTokens.SupportingTextColor',
      paints: { property: 'color', slot: 'text' },
    },
  },
});
