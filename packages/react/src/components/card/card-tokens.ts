import { color, corner, defineComponentTokens, elevation } from '../../tokens/component';

/*
 * Card's component tokens, M3's `md.comp.{filled,elevated,outlined}-card.*` names (checked
 * against m3.material.io's token tables, 2026-10-14), with Compose's *CardTokens defaults.
 * `card-styles.ts` reads one private variable per part; the card's `data-variant` picks the
 * public names and defaults. Hover, focus, dragged and disabled values stay classes.
 */

const paintsContainer = { property: 'background-color' } as const;
const paintsShape = { property: 'border-top-left-radius' } as const;

/** The tokens of {@link Card}: `--md-comp-<variant>-card-<part>`. */
export const cardTokenSet = defineComponentTokens({
  name: 'md-comp-card',
  tokens: {},
  scopes: {
    variant: {
      filled: {
        prefix: 'md-comp-filled-card',
        tokens: {
          'container-color': {
            value: color('surface-container-highest'),
            description: 'The container.',
            compose: 'FilledCardTokens.ContainerColor',
            paints: paintsContainer,
          },
          'container-shape': {
            value: corner('medium'),
            description: 'The corners.',
            compose: 'FilledCardTokens.ContainerShape',
            paints: paintsShape,
          },
        },
        fixed: { 'container-elevation': elevation(0), 'outline-color': 'transparent' },
      },
      elevated: {
        prefix: 'md-comp-elevated-card',
        tokens: {
          'container-color': {
            value: color('surface-container-low'),
            description: 'The container.',
            compose: 'ElevatedCardTokens.ContainerColor',
            paints: paintsContainer,
          },
          'container-shape': {
            value: corner('medium'),
            description: 'The corners.',
            compose: 'ElevatedCardTokens.ContainerShape',
            paints: paintsShape,
          },
          'container-elevation': {
            value: elevation(1),
            description: 'The shadow at rest.',
            compose: 'ElevatedCardTokens.ContainerElevation',
            paints: { property: 'box-shadow' },
          },
        },
        fixed: { 'outline-color': 'transparent' },
      },
      outlined: {
        prefix: 'md-comp-outlined-card',
        tokens: {
          'container-color': {
            value: color('surface'),
            description: 'The container.',
            compose: 'OutlinedCardTokens.ContainerColor',
            paints: paintsContainer,
          },
          'container-shape': {
            value: corner('medium'),
            description: 'The corners.',
            compose: 'OutlinedCardTokens.ContainerShape',
            paints: paintsShape,
          },
          'outline-color': {
            value: color('outline-variant'),
            description: 'The 1px border.',
            compose: 'OutlinedCardTokens.OutlineColor',
            paints: { property: 'border-top-color' },
          },
        },
        fixed: { 'container-elevation': elevation(0) },
      },
    },
  },
});
