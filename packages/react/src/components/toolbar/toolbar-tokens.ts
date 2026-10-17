import { color, corner, defineComponentTokens } from '../../tokens/component';

/*
 * The toolbars' component tokens, M3 Expressive's `md.comp.toolbar.{docked,floating}.*`
 * names (checked against m3.material.io's token tables, 2026-10-14), with the defaults of
 * `toolbar-styles.ts`. The floating toolbar's `data-color` picks the standard or vibrant
 * container. Its elevation follows the `elevated` prop, and the vibrant toolbar's content
 * colours stay classes. The toolbar FAB has a set of its own (`toolbarFabTokenSet`).
 */

/**
 * The tokens of {@link DockedToolbar}, scoped by `data-color`:
 * `--md-comp-toolbar-docked-container-color` (standard) and
 * `--md-comp-toolbar-vibrant-container-color`. M3's tables have no vibrant docked token, so
 * the vibrant docked toolbar takes M3's colour-scheme token for vibrant toolbars
 * (`md.comp.toolbar.vibrant.container.color`) and can be re-coloured like the rest
 * (2026-10-17; before, it was a class).
 */
export const dockedToolbarTokenSet = defineComponentTokens({
  name: 'md-comp-toolbar-docked',
  tokens: {},
  scopes: {
    color: {
      standard: {
        prefix: 'md-comp-toolbar-docked',
        tokens: {
          'container-color': {
            value: color('surface-container'),
            description: 'The standard toolbar.',
            compose: 'DockedToolbarTokens.ContainerColor',
            paints: { property: 'background-color' },
          },
        },
      },
      vibrant: {
        prefix: 'md-comp-toolbar-vibrant',
        tokens: {
          'container-color': {
            value: color('primary-container'),
            description: 'The vibrant toolbar.',
            paints: { property: 'background-color' },
          },
        },
      },
    },
  },
});

/**
 * The tokens of {@link FloatingToolbar}: `--md-comp-toolbar-floating-<part>` and
 * `--md-comp-toolbar-floating-{standard,vibrant}-container-color`. With a FAB they paint the
 * toolbar's own surface beside it.
 */
export const floatingToolbarTokenSet = defineComponentTokens({
  name: 'md-comp-toolbar-floating',
  tokens: {
    'container-shape': {
      value: corner('full'),
      description: 'The corners.',
      compose: 'FloatingToolbarTokens.ContainerShape',
      paints: { property: 'border-top-left-radius' },
    },
  },
  scopes: {
    color: {
      standard: {
        prefix: 'md-comp-toolbar-floating-standard',
        tokens: {
          'container-color': {
            value: color('surface-container'),
            description: 'The standard toolbar.',
            compose: 'FloatingToolbarTokens.StandardContainerColor',
            paints: { property: 'background-color' },
          },
        },
      },
      vibrant: {
        prefix: 'md-comp-toolbar-floating-vibrant',
        tokens: {
          'container-color': {
            value: color('primary-container'),
            description: 'The vibrant toolbar.',
            compose: 'FloatingToolbarTokens.VibrantContainerColor',
            paints: { property: 'background-color' },
          },
        },
      },
    },
  },
});

/**
 * The tokens of {@link ToolbarFab}: `--md-comp-toolbar-floating-fab-container-shape` and
 * `--md-comp-toolbar-floating-fab-{standard,vibrant}-{container,icon}-color`, M3's names,
 * picked by the FAB's `data-color` (2026-10-17; they were classes). Elevation follows the
 * `elevation` prop.
 */
export const toolbarFabTokenSet = defineComponentTokens({
  name: 'md-comp-toolbar-floating-fab',
  tokens: {
    'container-shape': {
      value: corner('large'),
      description: 'The corners.',
      paints: { property: 'border-top-left-radius' },
    },
  },
  scopes: {
    color: {
      standard: {
        prefix: 'md-comp-toolbar-floating-fab-standard',
        tokens: {
          'container-color': {
            value: color('primary-container'),
            description: 'The FAB beside a standard toolbar.',
            paints: { property: 'background-color' },
          },
          'icon-color': {
            value: color('on-primary-container'),
            description: 'Its icon.',
            paints: { property: 'color' },
          },
        },
      },
      vibrant: {
        prefix: 'md-comp-toolbar-floating-fab-vibrant',
        tokens: {
          'container-color': {
            value: color('tertiary-container'),
            description: 'The FAB beside a vibrant toolbar.',
            paints: { property: 'background-color' },
          },
          'icon-color': {
            value: color('on-tertiary-container'),
            description: 'Its icon.',
            paints: { property: 'color' },
          },
        },
      },
    },
  },
});
