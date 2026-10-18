import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The loading indicator's component tokens, M3's `md.comp.loading-indicator.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with Compose's
 * LoadingIndicatorTokens defaults. The root's `data-variant` (`default` or `contained`)
 * picks the public names; `loading-indicator-styles.ts` reads one private variable per part.
 * The size and the full corners stay classes.
 */

const paintsIndicator = { property: 'fill', slot: 'indicator' } as const;

/** The tokens of {@link LoadingIndicator}: `--md-comp-loading-indicator-[contained-]<part>`. */
export const loadingIndicatorTokenSet = defineComponentTokens({
  name: 'md-comp-loading-indicator',
  tokens: {},
  scopes: {
    variant: {
      default: {
        prefix: 'md-comp-loading-indicator',
        tokens: {
          'active-indicator-color': {
            value: color('primary'),
            description: 'The morphing shape.',
            compose: 'LoadingIndicatorTokens.ActiveIndicatorColor',
            paints: paintsIndicator,
          },
        },
        fixed: { 'container-color': 'transparent' },
      },
      contained: {
        prefix: 'md-comp-loading-indicator-contained',
        tokens: {
          'active-indicator-color': {
            value: color('on-primary-container'),
            description: 'The morphing shape of a contained indicator.',
            compose: 'LoadingIndicatorTokens.ContainedActiveColor',
            paints: paintsIndicator,
          },
          'container-color': {
            value: color('primary-container'),
            description: 'The round container behind it.',
            compose: 'LoadingIndicatorTokens.ContainedContainerColor',
            paints: { property: 'background-color' },
          },
        },
      },
    },
  },
});
