import { color, defineComponentTokens } from '../../tokens/component';

/*
 * Badge's component tokens, M3's `md.comp.badge.*` names (checked against m3.material.io's
 * token tables, 2026-10-14), with Compose's BadgeTokens defaults. The badge's `data-size`
 * (`small`, the dot, or `large`, with a label) picks the public names; `badge-styles.ts`
 * reads one private variable per part. Sizes and the full corners stay classes.
 */

/** The tokens of {@link Badge}: `--md-comp-badge-<part>` and `--md-comp-badge-large-<part>`. */
export const badgeTokenSet = defineComponentTokens({
  name: 'md-comp-badge',
  tokens: {},
  scopes: {
    size: {
      small: {
        prefix: 'md-comp-badge',
        tokens: {
          color: {
            value: color('error'),
            description: 'The small badge, a dot.',
            compose: 'BadgeTokens.Color',
            paints: { property: 'background-color' },
          },
        },
        // The dot shows no text; its colour matches the large badge's default.
        fixed: { 'label-text-color': color('on-error') },
      },
      large: {
        prefix: 'md-comp-badge-large',
        tokens: {
          color: {
            value: color('error'),
            description: 'The large badge, holding a count or short text.',
            compose: 'BadgeTokens.LargeColor',
            paints: { property: 'background-color' },
          },
          'label-text-color': {
            value: color('on-error'),
            description: "The large badge's label.",
            compose: 'BadgeTokens.LargeLabelTextColor',
            paints: { property: 'color' },
          },
        },
      },
    },
  },
});
