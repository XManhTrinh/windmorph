import type { ColorRole } from '../../tokens/color';
import {
  color,
  corner,
  defineComponentTokens,
  type ComponentToken,
  type ComponentTokenScope,
} from '../../tokens/component';
import type { CornerName } from '../../tokens/shape';
import type { ExtendedFabSize, FabColor, FabSize } from './fab-styles';

/*
 * The FAB's and the extended FAB's component tokens, M3's `md.comp.fab.*` and
 * `md.comp.extended-fab.*` names (checked against m3.material.io's token tables,
 * 2026-10-14). A FAB's `data-color` picks its colour set (`fab-primary-container`, …) and
 * its `data-size` its size set (`fab`, `fab-medium`, `fab-large`); the styles read one
 * private variable per part. The icon and label follow the content colour (`currentColor`).
 * Elevation stays with the `elevation` prop, and sizes stay classes.
 */

const paintsContainer = { property: 'background-color' } as const;
const paintsContent = { property: 'color' } as const;
const paintsShape = { property: 'border-top-left-radius' } as const;

/** Each colour style's container and content roles, as `fab-styles.ts` painted them. */
const COLORS: Record<FabColor, { container: ColorRole; content: ColorRole }> = {
  'primary-container': { container: 'primary-container', content: 'on-primary-container' },
  'secondary-container': { container: 'secondary-container', content: 'on-secondary-container' },
  'tertiary-container': { container: 'tertiary-container', content: 'on-tertiary-container' },
  primary: { container: 'primary', content: 'on-primary' },
  secondary: { container: 'secondary', content: 'on-secondary' },
  tertiary: { container: 'tertiary', content: 'on-tertiary' },
};

/** Compose's token objects for the colour styles it has (the tonal primary and secondary). */
const COMPOSE_COLORS: Partial<Record<FabColor, string>> = {
  'primary-container': 'FabPrimaryContainerTokens',
  'secondary-container': 'FabSecondaryContainerTokens',
};

/** One scope per colour style: its container and its content (`icon` or `label-text`). */
function colorScopes(component: 'fab' | 'extended-fab', content: 'icon' | 'label-text') {
  return Object.fromEntries(
    (Object.keys(COLORS) as FabColor[]).map((name) => {
      const roles = COLORS[name];
      const compose = component === 'fab' ? COMPOSE_COLORS[name] : undefined;
      const tokens: Record<string, ComponentToken> = {
        'container-color': {
          value: color(roles.container),
          description: 'The container.',
          ...(compose && { compose: `${compose}.ContainerColor` }),
          paints: paintsContainer,
        },
        [`${content}-color`]: {
          value: color(roles.content),
          description:
            content === 'icon' ? 'The icon.' : 'The label and the icon, which follows it.',
          ...(compose && { compose: `${compose}.IconColor` }),
          paints: paintsContent,
        },
      };
      return [name, { prefix: `md-comp-${component}-${name}`, tokens }];
    }),
  ) as Record<FabColor, ComponentTokenScope>;
}

/** A size's container shape: `--md-comp-<prefix>-container-shape`. */
const shapeScope = (prefix: string, value: CornerName, compose: string): ComponentTokenScope => ({
  prefix,
  tokens: {
    'container-shape': {
      value: corner(value),
      description: 'The corners.',
      compose: `${compose}.ContainerShape`,
      paints: paintsShape,
    },
  },
});

/** The tokens of {@link Fab}: `--md-comp-fab-<colour>-*` and `--md-comp-fab[-<size>]-container-shape`. */
export const fabTokenSet = defineComponentTokens({
  name: 'md-comp-fab',
  tokens: {},
  scopes: {
    color: colorScopes('fab', 'icon'),
    size: {
      default: shapeScope('md-comp-fab', 'large', 'FabBaselineTokens'),
      medium: shapeScope('md-comp-fab-medium', 'large-increased', 'FabMediumTokens'),
      large: shapeScope('md-comp-fab-large', 'extra-large', 'FabLargeTokens'),
    } satisfies Record<FabSize, ComponentTokenScope>,
  },
});

/**
 * The tokens of {@link ExtendedFab}: `--md-comp-extended-fab-<colour>-*` and
 * `--md-comp-extended-fab-<size>-container-shape`.
 */
export const extendedFabTokenSet = defineComponentTokens({
  name: 'md-comp-extended-fab',
  tokens: {},
  scopes: {
    color: colorScopes('extended-fab', 'label-text'),
    size: {
      sm: shapeScope('md-comp-extended-fab-small', 'large', 'ExtendedFabSmallTokens'),
      md: shapeScope('md-comp-extended-fab-medium', 'large-increased', 'ExtendedFabMediumTokens'),
      lg: shapeScope('md-comp-extended-fab-large', 'extra-large', 'ExtendedFabLargeTokens'),
    } satisfies Record<ExtendedFabSize, ComponentTokenScope>,
  },
});
