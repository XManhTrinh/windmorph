import { color, defineComponentTokens, type ComponentToken } from '../../tokens/component';

/*
 * The tabs' component tokens, M3's `md.comp.{primary,secondary}-navigation-tab.*` names
 * (checked against m3.material.io's token tables, 2026-10-14), with the defaults of
 * `tabs-styles.ts`. The tabs' root and each tab carry `data-tokens="md-comp-tabs"` and
 * `data-variant`, so a tab's own state (`data-selected`) picks its colours. Hover, focus,
 * press and disabled colours stay classes.
 *
 * M3 names the primary tab's label colours `with-label-text-*` and the secondary tab's
 * plainly, so each variant reads its own label parts and declares the other's as fixed.
 */

const paintsContainer = { property: 'background-color', slot: 'list' } as const;
// The divider is an inset shadow along the list's bottom edge.
const paintsDivider = { property: 'box-shadow', slot: 'list' } as const;
const paintsIndicator = { property: 'background-color', slot: 'indicator' } as const;
const paintsActiveLabel = { property: 'color', state: 'selected' } as const;
const paintsInactiveLabel = { property: 'color', slot: 'tab' } as const;
const paintsActiveIcon = { property: 'color', slot: 'icon', state: 'selected' } as const;
const paintsInactiveIcon = { property: 'color', slot: 'icon' } as const;

/** The parts every variant declares, with their defaults and Compose names. */
function common(
  set: 'Primary' | 'Secondary',
  active: 'primary' | 'on-surface',
): Record<string, ComponentToken> {
  return {
    'container-color': {
      value: color('surface'),
      description: 'The tab row.',
      compose: `${set}NavigationTabTokens.ContainerColor`,
      paints: paintsContainer,
    },
    'divider-color': {
      value: color('outline-variant'),
      description: "The 1px divider along the row's bottom edge.",
      compose: `${set}NavigationTabTokens.DividerColor`,
      paints: paintsDivider,
    },
    'active-indicator-color': {
      value: color('primary'),
      description: "The selected tab's indicator.",
      compose: `${set}NavigationTabTokens.ActiveIndicatorColor`,
      paints: paintsIndicator,
    },
    'with-icon-active-icon-color': {
      value: color(active),
      description: "The selected tab's icon.",
      compose: `${set}NavigationTabTokens.ActiveIconColor`,
      paints: paintsActiveIcon,
    },
    'with-icon-inactive-icon-color': {
      value: color('on-surface-variant'),
      description: 'An unselected tab’s icon, at rest.',
      compose: `${set}NavigationTabTokens.InactiveIconColor`,
      paints: paintsInactiveIcon,
    },
  };
}

/** The tokens of {@link Tabs}: `--md-comp-{primary,secondary}-navigation-tab-<part>`. */
export const tabsTokenSet = defineComponentTokens({
  name: 'md-comp-tabs',
  tokens: {},
  scopes: {
    variant: {
      primary: {
        prefix: 'md-comp-primary-navigation-tab',
        tokens: {
          ...common('Primary', 'primary'),
          'with-label-text-active-label-text-color': {
            value: color('primary'),
            description: "The selected tab's label.",
            compose: 'PrimaryNavigationTabTokens.ActiveLabelTextColor',
            paints: paintsActiveLabel,
          },
          'with-label-text-inactive-label-text-color': {
            value: color('on-surface-variant'),
            description: 'An unselected tab’s label, at rest.',
            compose: 'PrimaryNavigationTabTokens.InactiveLabelTextColor',
            paints: paintsInactiveLabel,
          },
        },
        fixed: {
          'active-label-text-color': color('primary'),
          'inactive-label-text-color': color('on-surface-variant'),
        },
      },
      secondary: {
        prefix: 'md-comp-secondary-navigation-tab',
        tokens: {
          ...common('Secondary', 'on-surface'),
          'active-label-text-color': {
            value: color('on-surface'),
            description: "The selected tab's label.",
            compose: 'SecondaryNavigationTabTokens.ActiveLabelTextColor',
            paints: paintsActiveLabel,
          },
          'inactive-label-text-color': {
            value: color('on-surface-variant'),
            description: 'An unselected tab’s label, at rest.',
            compose: 'SecondaryNavigationTabTokens.InactiveLabelTextColor',
            paints: paintsInactiveLabel,
          },
        },
        fixed: {
          'with-label-text-active-label-text-color': color('on-surface'),
          'with-label-text-inactive-label-text-color': color('on-surface-variant'),
        },
      },
    },
  },
});
