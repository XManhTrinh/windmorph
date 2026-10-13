import type { ComponentSpecData } from './types';

/** Spec data for the Navigation group, by page slug. */
export const NAVIGATION_SPEC: Record<string, ComponentSpecData> = {
  'skip-link': {
    covers: [
      {
        name: 'Skip to content, before the navigation',
        kind: 'use case',
        examples: ['skip-link/skip-link-page'],
      },
    ],
    showcaseReason:
      'Its one prop, `target`, is the id of an element in the page, and the link only shows on keyboard focus, so a control panel would have nothing visible to change; the example lets you try it with Tab.',
  },
  link: {
    covers: [
      { name: 'Inline, in running text', kind: 'variant', examples: ['link/link-in-text'] },
      { name: 'Standalone', kind: 'variant', examples: ['link/link-standalone'] },
      { name: 'Plain, around a logo or photo', kind: 'variant', examples: ['link/link-plain'] },
      {
        name: 'Tone: primary or inherit (on colour)',
        kind: 'configuration',
        examples: ['link/link-standalone'],
      },
      {
        name: 'Size: inherit, small, medium, large',
        kind: 'configuration',
        examples: ['link/link-standalone'],
      },
      { name: 'External, in a new tab', kind: 'configuration', examples: ['link/link-in-text'] },
      {
        name: 'Text that acts: `onPress` without `href`',
        kind: 'use case',
        examples: ['link/link-button'],
      },
    ],
  },
  'navigation-rail': {
    spec: 'navigation-rail/specs',
    covers: [
      {
        name: 'Collapsed navigation rail',
        kind: 'variant',
        examples: ['navigation-rail/rail-states', 'navigation-rail/rail-inline'],
      },
      {
        name: 'Expanded navigation rail',
        kind: 'variant',
        examples: ['navigation-rail/rail-inline', 'navigation-rail/rail-states'],
      },
      {
        name: 'Expanded layout: standard',
        kind: 'configuration',
        examples: ['navigation-rail/rail-inline'],
      },
      {
        name: 'Expanded layout: modal',
        kind: 'configuration',
        examples: ['navigation-rail/rail-modal'],
      },
      {
        name: 'Expanded behavior: hide when collapsed',
        kind: 'configuration',
        examples: ['navigation-rail/rail-hide-on-collapse'],
      },
      {
        name: 'With a menu and a FAB',
        kind: 'use case',
        examples: ['navigation-rail/rail-inline'],
      },
      {
        name: 'Badges, selected icons and disabled items',
        kind: 'use case',
        examples: ['navigation-rail/rail-states'],
      },
    ],
    differences: [
      {
        item: 'Mode change motion',
        note: "Items switch layout at once and the labels fade in at their new place, while the rail's width does the spring, instead of cross-fading each label as it slides.",
      },
    ],
    extensions: [
      {
        item: '`itemAlignment="center"` with a top header',
        note: 'Centres the items in the space below the header, which stays at the top, and an overflowing rail still scrolls to every item.',
      },
      {
        item: '`onReselect`',
        note: 'Runs when the current destination is pressed again, for resetting its scroll position to the top.',
      },
      {
        item: '`--m3-rail-collapsed-width`',
        note: "A narrower collapsed rail, such as M3's 80px baseline, keeps the expand motion and every inset.",
      },
    ],
    notBuilt: [
      {
        item: 'Navigation rail (baseline)',
        note: 'Not recommended in M3 Expressive; use the collapsed rail, or set `--m3-rail-collapsed-width` to 80px for its width.',
      },
      {
        item: 'Navigation drawer',
        note: 'Deprecated in M3 Expressive; use the expanded rail, `modal` for the modal drawer.',
      },
    ],
    compose: [
      {
        composable: 'WideNavigationRail',
        component: 'NavigationRail',
        params: [
          { compose: 'state (expanded / collapsed)', windmorph: '`expanded` / `onExpandedChange`' },
          {
            compose: 'header',
            windmorph: '`header`',
            note: 'Or a function of `{ expanded, toggle }`.',
          },
          { compose: 'arrangement', windmorph: '`itemAlignment`' },
        ],
      },
      {
        composable: 'ModalWideNavigationRail',
        component: 'NavigationRail modal',
        params: [{ compose: 'hideOnCollapse', windmorph: '`hideOnCollapse`' }],
      },
      {
        composable: 'WideNavigationRailItem',
        component: 'NavigationRailItem',
        params: [
          { compose: 'selected', windmorph: '`selected`' },
          { compose: 'onClick', windmorph: '`onPress` or `href`' },
          { compose: 'icon', windmorph: '`icon` / `selectedIcon`' },
          { compose: 'label', windmorph: '`children`' },
          {
            compose: 'railExpanded',
            windmorph: '(from the rail)',
            note: 'Items read the rail’s state.',
          },
        ],
      },
    ],
  },
  'navigation-bar': {
    spec: 'navigation-bar/specs',
    covers: [
      {
        name: 'Flexible navigation bar',
        kind: 'variant',
        examples: ['navigation-bar/bar-stacked', 'navigation-bar/bar-inline'],
      },
      {
        name: 'Navigation item layout: vertical',
        kind: 'configuration',
        examples: ['navigation-bar/bar-stacked'],
      },
      {
        name: 'Navigation item layout: horizontal (medium windows)',
        kind: 'configuration',
        examples: ['navigation-bar/bar-inline'],
      },
      {
        name: 'Badges on destinations',
        kind: 'use case',
        examples: ['navigation-bar/bar-stacked'],
      },
    ],
    extensions: [
      {
        item: '`arrangement`',
        note: "Shares the width equally or centres the items, for either item layout (Compose's `ShortNavigationBarArrangement`).",
      },
      {
        item: '`onReselect`',
        note: 'Runs when the current destination is pressed again, for resetting its scroll position to the top.',
      },
    ],
    notBuilt: [
      {
        item: 'Navigation bar (baseline)',
        note: 'Deprecated in M3 Expressive; the flexible bar replaces it.',
      },
    ],
    compose: [
      {
        composable: 'ShortNavigationBar',
        component: 'NavigationBar',
        params: [{ compose: 'arrangement', windmorph: '`arrangement`' }],
      },
      {
        composable: 'ShortNavigationBarItem',
        component: 'NavigationBarItem',
        params: [
          { compose: 'iconPosition', windmorph: 'the bar’s `iconPosition`' },
          { compose: 'selected', windmorph: '`selected`' },
          { compose: 'onClick', windmorph: '`onPress` or `href`' },
          { compose: 'icon', windmorph: '`icon` / `selectedIcon`' },
          { compose: 'label', windmorph: '`children`' },
        ],
      },
    ],
  },
  tabs: {
    spec: 'tabs/specs',
    covers: [
      { name: 'Primary tabs', kind: 'variant', examples: ['tabs/tabs-primary'] },
      { name: 'Secondary tabs', kind: 'variant', examples: ['tabs/tabs-secondary'] },
      { name: 'Scrollable tabs', kind: 'configuration', examples: ['tabs/tabs-scrollable'] },
      { name: 'Icon and label text', kind: 'configuration', examples: ['tabs/tabs-primary'] },
      { name: 'Label text only', kind: 'configuration', examples: ['tabs/tabs-secondary'] },
      { name: 'Badges', kind: 'configuration', examples: ['tabs/tabs-badges'] },
      {
        name: 'Fixed tabs aligned to the centre or leading edge',
        kind: 'use case',
        examples: ['tabs/tabs-badges'],
      },
      { name: 'Swipe between fixed tabs', kind: 'use case', examples: ['tabs/tabs-badges'] },
    ],
    extensions: [
      {
        item: '`keyboardActivation="automatic"`',
        note: 'Selects a tab as focus reaches it; the default is the spec’s manual activation, with Space or Enter.',
      },
    ],
    compose: [
      {
        composable: 'PrimaryTabRow / SecondaryTabRow',
        component: 'Tabs variant',
        params: [{ compose: 'selectedTabIndex', windmorph: '`selectedKey` / `onSelectionChange`' }],
      },
      {
        composable: 'PrimaryScrollableTabRow / SecondaryScrollableTabRow',
        component: 'Tabs scrollable',
      },
      {
        composable: 'Tab',
        component: 'Tab',
        params: [
          { compose: 'text', windmorph: '`title`' },
          { compose: 'icon', windmorph: '`icon`' },
          { compose: 'content', windmorph: '`children`', note: 'The tab’s panel.' },
        ],
      },
    ],
  },
  'top-app-bar': {
    spec: 'app-bars/specs',
    covers: [
      {
        name: 'Search app bar',
        kind: 'variant',
        examples: ['search/search-app-bar'],
      },
      { name: 'Small', kind: 'variant', examples: ['top-app-bar/top-app-bar-variants'] },
      {
        name: 'Medium flexible',
        kind: 'variant',
        examples: ['top-app-bar/top-app-bar-variants', 'top-app-bar/top-app-bar-flexible'],
      },
      {
        name: 'Large flexible',
        kind: 'variant',
        examples: ['top-app-bar/top-app-bar-variants', 'top-app-bar/top-app-bar-flexible'],
      },
      {
        name: 'Text alignment: leading edge',
        kind: 'configuration',
        examples: ['top-app-bar/top-app-bar-variants'],
      },
      {
        name: 'Text alignment: centred',
        kind: 'configuration',
        examples: ['top-app-bar/top-app-bar-variants', 'top-app-bar/top-app-bar-flexible'],
      },
      {
        name: 'Subtitle and a filled icon button',
        kind: 'use case',
        examples: ['top-app-bar/top-app-bar-flexible'],
      },
      {
        name: 'Collapsing on scroll',
        kind: 'use case',
        examples: ['top-app-bar/top-app-bar-scrolling'],
      },
    ],
    differences: [
      {
        item: 'Scrolling',
        note: 'The bar is `sticky` and slides up by its offset rather than shrinking its layout height, so the content moves exactly with the scroll; there is no fling snap.',
      },
    ],
    notBuilt: [
      {
        item: 'Center-aligned app bar',
        note: 'Merged into the small bar in M3 Expressive: use `titleAlign="center"`.',
      },
      {
        item: 'Medium and large (baseline)',
        note: 'Not recommended in M3 Expressive; the medium and large flexible bars replace them.',
      },
    ],
    compose: [
      {
        composable: 'TopAppBar / CenterAlignedTopAppBar',
        component: 'TopAppBar',
        params: [
          { compose: 'title', windmorph: '`title`' },
          { compose: 'subtitle', windmorph: '`subtitle`' },
          { compose: 'titleHorizontalAlignment', windmorph: '`titleAlign`' },
          { compose: 'navigationIcon', windmorph: '`navigationIcon`' },
          { compose: 'actions', windmorph: '`actions`' },
        ],
      },
      {
        composable: 'MediumFlexibleTopAppBar / LargeFlexibleTopAppBar',
        component: 'TopAppBar variant="medium" / "large"',
      },
      {
        composable: 'TopAppBarDefaults.exitUntilCollapsedScrollBehavior',
        component: 'TopAppBar scrollBehavior="exit-until-collapsed"',
        params: [
          {
            compose: 'pinnedScrollBehavior / enterAlwaysScrollBehavior',
            windmorph: '`scrollBehavior="pinned"` / `"enter-always"`',
          },
        ],
        note: 'The bar follows the window, or the container in `scrollRef`.',
      },
    ],
  },
  search: {
    spec: 'search/specs',
    covers: [
      { name: 'Search', kind: 'variant', examples: ['search/search-docked'] },
      {
        name: 'Style: contained',
        kind: 'configuration',
        examples: ['search/search-docked', 'search/search-full-screen'],
      },
      { name: 'Layout: docked', kind: 'configuration', examples: ['search/search-docked'] },
      {
        name: 'Layout: full-screen',
        kind: 'configuration',
        examples: ['search/search-full-screen'],
      },
      { name: 'Search app bar', kind: 'use case', examples: ['search/search-app-bar'] },
    ],
    notBuilt: [
      {
        item: 'Style: divided',
        note: 'Not recommended in M3 Expressive; the contained style is used for both layouts.',
      },
      {
        item: 'Predictive back',
        note: 'The web has no predictive back gesture; Escape, a press outside or a back button closes the view.',
      },
    ],
    compose: [
      {
        composable: 'SearchBar / SearchBarDefaults.InputField',
        component: 'SearchBar',
        params: [
          { compose: 'query / onQueryChange', windmorph: '`value` / `onChange`' },
          { compose: 'onSearch', windmorph: '`onSubmit`' },
          { compose: 'expanded / onExpandedChange', windmorph: '`expanded` / `onExpandedChange`' },
          { compose: 'placeholder', windmorph: '`placeholder`' },
          { compose: 'leadingIcon / trailingIcon', windmorph: '`leadingIcon` / `trailingIcon`' },
        ],
      },
      {
        composable: 'ExpandedDockedSearchBar / ExpandedFullScreenSearchBar',
        component: 'SearchBar view="docked" / "full-screen"',
        note: 'The expanded content is the bar’s `children`.',
      },
      {
        composable: 'AppBarWithSearch',
        component: 'SearchAppBar',
        params: [
          { compose: 'navigationIcon', windmorph: '`navigationIcon`' },
          { compose: 'actions', windmorph: '`actions`' },
          { compose: 'scrollBehavior', windmorph: '`scrollBehavior`' },
        ],
      },
    ],
  },
  toolbars: {
    spec: 'toolbars/specs',
    covers: [
      { name: 'Docked toolbar', kind: 'variant', examples: ['toolbars/toolbar-docked'] },
      {
        name: 'Floating toolbar',
        kind: 'variant',
        examples: ['toolbars/toolbar-floating', 'toolbars/toolbar-vertical'],
      },
      {
        name: 'Color: standard',
        kind: 'configuration',
        examples: ['toolbars/toolbar-floating', 'toolbars/toolbar-vertical'],
      },
      {
        name: 'Color: vibrant',
        kind: 'configuration',
        examples: ['toolbars/toolbar-floating', 'toolbars/toolbar-overflow'],
      },
      {
        name: 'Floating toolbar layout: horizontal',
        kind: 'configuration',
        examples: ['toolbars/toolbar-floating'],
      },
      {
        name: 'Floating toolbar layout: vertical',
        kind: 'configuration',
        examples: ['toolbars/toolbar-vertical'],
      },
      {
        name: 'With FAB',
        kind: 'configuration',
        examples: ['toolbars/toolbar-fab-scroll', 'toolbars/toolbar-vertical'],
      },
      {
        name: 'Overflow menu in the trailing slot',
        kind: 'use case',
        examples: ['toolbars/toolbar-overflow'],
      },
      {
        name: 'Collapsing or leaving the screen on scroll',
        kind: 'use case',
        examples: ['toolbars/toolbar-fab-scroll', 'toolbars/toolbar-scroll-exit'],
      },
    ],
    differences: [
      {
        item: 'Leaving the screen',
        note: '`useToolbarScrollExit` slides the toolbar away after 40px of scrolling, without following the finger.',
      },
    ],
    notBuilt: [
      {
        item: 'Bottom app bar (baseline)',
        note: 'Deprecated in M3 Expressive; the docked toolbar replaces it.',
      },
      {
        item: 'Scroll collapse for the docked toolbar',
        note: 'Deferred; a docked toolbar can leave the screen on scroll with `useToolbarScrollExit`.',
      },
    ],
    compose: [
      {
        composable: 'HorizontalFloatingToolbar / VerticalFloatingToolbar',
        component: 'FloatingToolbar orientation',
        params: [
          { compose: 'expanded', windmorph: '`expanded`' },
          {
            compose: 'leadingContent / trailingContent',
            windmorph: '`leading` / `trailing`',
          },
          { compose: 'content', windmorph: '`children`' },
          { compose: 'floatingActionButton', windmorph: '`fab` (a `ToolbarFab`)' },
          { compose: 'floatingActionButtonPosition', windmorph: '`fabPosition`' },
          {
            compose: 'colors = FloatingToolbarDefaults.vibrantFloatingToolbarColors()',
            windmorph: '`color="vibrant"`',
          },
          {
            compose: 'expandedShadowElevation',
            windmorph: '`elevated`',
            note: 'Level 1 by default, as the spec asks.',
          },
        ],
      },
      {
        composable:
          'FloatingToolbarDefaults.StandardFloatingActionButton / VibrantFloatingActionButton',
        component: 'ToolbarFab',
        params: [{ compose: 'Standard / Vibrant', windmorph: '`color`' }],
        note: "Defaults to its toolbar's colour.",
      },
      {
        composable: 'Modifier.floatingToolbarVerticalNestedScroll',
        component: 'useToolbarScrollExpansion',
        note: 'Returns `expanded` for the toolbar.',
      },
      {
        composable: 'FloatingToolbarDefaults.exitAlwaysScrollBehavior',
        component: 'useToolbarScrollExit',
        params: [{ compose: 'exitDirection', windmorph: '`exitEdge`' }],
        note: 'Returns `visible` for either toolbar.',
      },
      {
        composable: 'FlexibleBottomAppBar',
        component: 'DockedToolbar',
        params: [{ compose: 'horizontalArrangement', windmorph: '`arrangement`' }],
      },
    ],
  },
};
