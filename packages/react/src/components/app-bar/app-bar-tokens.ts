import { color, defineComponentTokens } from '../../tokens/component';

/*
 * The app bar's component tokens, M3 Expressive's `md.comp.app-bar.*` names (checked against
 * m3.material.io's token tables, 2026-10-14; `top-app-bar` is the deprecated set), with the
 * defaults of `app-bar-styles.ts`. Read by TopAppBar and SearchAppBar, whose roots carry
 * `data-tokens="md-comp-app-bar"`.
 *
 * The container blends from `container-color` to `on-scroll-container-color` as content
 * scrolls under the bar (`container-color-blend`, worked out here so no class puts a private
 * variable after a comma). The icon tokens colour their slot, which standard and outlined
 * icon buttons follow (`--md-comp-icon-button-icon-color: currentColor`).
 */

/** The tokens of {@link TopAppBar} and {@link SearchAppBar}: `--md-comp-app-bar-<part>`. */
export const appBarTokenSet = defineComponentTokens({
  name: 'md-comp-app-bar',
  tokens: {
    'title-color': {
      value: color('on-surface'),
      description: 'The title.',
      compose: 'AppBarTokens.TitleColor',
      paints: { property: 'color', slot: 'title' },
    },
    'subtitle-color': {
      value: color('on-surface-variant'),
      description: 'The subtitle.',
      compose: 'AppBarTokens.SubtitleColor',
      paints: { property: 'color', slot: 'subtitle' },
    },
    'leading-icon-color': {
      value: color('on-surface'),
      description: 'The navigation icon.',
      compose: 'AppBarTokens.LeadingIconColor',
      paints: { property: 'color', slot: 'navigation' },
    },
    'trailing-icon-color': {
      value: color('on-surface-variant'),
      description: 'The actions.',
      compose: 'AppBarTokens.TrailingIconColor',
      paints: { property: 'color', slot: 'actions' },
    },
    'container-color': {
      value: color('surface'),
      description: 'The bar, with nothing scrolled under it.',
      compose: 'AppBarTokens.ContainerColor',
      paints: { property: 'background-color' },
    },
    'on-scroll-container-color': {
      value: color('surface-container'),
      description: 'The bar once content scrolls under it.',
      compose: 'AppBarTokens.OnScrollContainerColor',
      paints: { property: 'background-color', state: 'scrolled' },
    },
  },
  derived: {
    // `--m3-app-bar-scrolled` (0–100%, set on the root) blends the two; with
    // `scrolledColor="transparent"`, `--m3-app-bar-scrolled-color` replaces the scrolled one.
    'container-color-blend':
      'color-mix(in oklab, var(--m3-app-bar-scrolled-color, var(--_md-comp-app-bar-on-scroll-container-color)) var(--m3-app-bar-scrolled, 0%), var(--_md-comp-app-bar-container-color))',
  },
});
