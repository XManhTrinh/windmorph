import { color, defineComponentTokens } from '../../tokens/component';

/*
 * Divider's component token, M3's `md.comp.divider.color` (checked against m3.material.io's
 * token tables, 2026-10-14), with Compose's DividerTokens default. `divider-styles.ts` reads
 * it as one private variable. The thickness stays a class.
 */

/** The tokens of {@link Divider}: `--md-comp-divider-<part>`. */
export const dividerTokenSet = defineComponentTokens({
  name: 'md-comp-divider',
  tokens: {
    color: {
      value: color('outline-variant'),
      description: 'The line.',
      compose: 'DividerTokens.Color',
      paints: { property: 'background-color' },
    },
  },
});
