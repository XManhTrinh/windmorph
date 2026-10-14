import { color, corner, defineComponentTokens } from '../../tokens/component';

/*
 * The toolbars' component tokens, M3 Expressive's `md.comp.toolbar.{docked,floating}.*`
 * names (checked against m3.material.io's token tables, 2026-10-14), with the defaults of
 * `toolbar-styles.ts`. The floating toolbar's `data-color` picks the standard or vibrant
 * container. Its elevation follows the `elevated` prop, and the vibrant toolbar's content
 * colours stay classes.
 */

/** The tokens of {@link DockedToolbar}: `--md-comp-toolbar-docked-<part>`. */
export const dockedToolbarTokenSet = defineComponentTokens({
  name: 'md-comp-toolbar-docked',
  tokens: {
    'container-color': {
      value: color('surface-container'),
      description: 'The toolbar.',
      compose: 'DockedToolbarTokens.ContainerColor',
      paints: { property: 'background-color' },
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
