import type { ComponentSpecData } from './types';

/** Spec data for the Actions group, by page slug. */
export const ACTIONS_SPEC: Record<string, ComponentSpecData> = {
  button: {
    spec: 'buttons/specs',
    covers: [
      { name: 'Default button', kind: 'variant', examples: ['button/button-variants'] },
      {
        name: 'Toggle (selection)',
        kind: 'variant',
        examples: ['button/button-toggle', 'button/button-toggle-variants'],
      },
      { name: 'Size: XS, S, M, L, XL', kind: 'configuration', examples: ['button/button-sizes'] },
      {
        name: 'Shape: round and square',
        kind: 'configuration',
        examples: ['button/button-shapes', 'button/button-sizes'],
      },
      {
        name: 'Color: elevated, filled, tonal, outlined, text',
        kind: 'configuration',
        examples: ['button/button-variants', 'button/button-toggle-variants'],
      },
      {
        name: 'Small button padding: 16dp',
        kind: 'configuration',
        examples: ['button/button-sizes'],
      },
      {
        name: 'A link that looks like a button',
        kind: 'use case',
        examples: ['button/button-link'],
      },
    ],
    differences: [
      {
        item: 'Text button colour',
        note: "Text buttons use `primary`, as Compose's code does; the token file's `on-surface-variant` is flagged by a Compose TODO as a mistake.",
      },
    ],
    extensions: [
      {
        item: 'Links',
        note: '`href` renders an `<a>` that routes through React Aria’s `RouterProvider`, so a link can look like a button.',
      },
    ],
    notBuilt: [
      {
        item: '24dp small button padding',
        note: 'The spec marks it not recommended; small buttons use 16dp.',
      },
      {
        item: 'Trailing icon',
        note: 'The spec says not to use two icons in a button, so there is only `leadingIcon`.',
      },
    ],
    compose: [
      {
        composable: 'Button',
        component: 'Button',
        params: [
          { compose: 'onClick', windmorph: 'onPress' },
          { compose: 'enabled', windmorph: 'disabled', note: 'Inverted.' },
          { compose: 'shapes = ButtonDefaults.shapes()', windmorph: 'shape' },
          {
            compose: 'Modifier.heightIn(ButtonDefaults.MediumContainerHeight)',
            windmorph: 'size',
            note: 'One prop sets the height, padding, icon and type for XS to XL.',
          },
          { compose: 'icon slot before the text', windmorph: 'leadingIcon' },
        ],
      },
      { composable: 'ElevatedButton', component: 'Button variant="elevated"' },
      { composable: 'FilledTonalButton', component: 'Button variant="tonal"' },
      { composable: 'OutlinedButton', component: 'Button variant="outlined"' },
      { composable: 'TextButton', component: 'Button variant="text"' },
      {
        composable: 'ToggleButton',
        component: 'Button toggle',
        params: [
          { compose: 'checked', windmorph: 'selected' },
          { compose: 'onCheckedChange', windmorph: 'onSelectedChange' },
          {
            compose: 'icon in the content slot, swapped on checked',
            windmorph: 'leadingIcon, selectedLeadingIcon',
          },
        ],
        note: '`ElevatedToggleButton`, `TonalToggleButton` and `OutlinedToggleButton` are `Button toggle` with that `variant`.',
      },
    ],
  },
  'icon-button': {
    spec: 'icon-buttons/specs',
    covers: [
      {
        name: 'Default icon button',
        kind: 'variant',
        examples: ['icon-button/icon-button-variants'],
      },
      {
        name: 'Toggle (selection)',
        kind: 'variant',
        examples: ['icon-button/icon-button-toggle', 'icon-button/icon-button-toggle-variants'],
      },
      {
        name: 'Size: XS, S, M, L, XL',
        kind: 'configuration',
        examples: ['icon-button/icon-button-sizes'],
      },
      {
        name: 'Shape: round and square',
        kind: 'configuration',
        examples: ['icon-button/icon-button-shapes'],
      },
      {
        name: 'Color: filled, tonal, outlined, standard',
        kind: 'configuration',
        examples: ['icon-button/icon-button-variants', 'icon-button/icon-button-toggle-variants'],
      },
      {
        name: 'Width: narrow, default, wide',
        kind: 'configuration',
        examples: ['icon-button/icon-button-sizes'],
      },
      {
        name: 'Density (web, chosen by the reader)',
        kind: 'use case',
        examples: ['icon-button/icon-button-density'],
      },
    ],
    extensions: [
      {
        item: 'Links',
        note: '`href` renders an `<a>` that routes through React Aria’s `RouterProvider`.',
      },
      {
        item: '`iconTransition="rotate"`',
        note: "Not in the M3 spec, which swaps `icon` for `selectedIcon`: the icon turns and crossfades into the other, counter-clockwise as it selects (mirrored in RTL). Matches Google's Expressive showcase motion; reduced motion keeps only the crossfade.",
      },
      {
        item: 'Content colour token',
        note: 'A container can set `--md-comp-icon-button-icon-color` for its standard and outlined icon buttons, as the vibrant toolbar and the app bars do.',
      },
    ],
    compose: [
      { composable: 'IconButton', component: 'IconButton variant="standard"' },
      {
        composable: 'FilledIconButton',
        component: 'IconButton',
        params: [
          { compose: 'onClick', windmorph: 'onPress' },
          { compose: 'enabled', windmorph: 'disabled', note: 'Inverted.' },
          {
            compose: 'Modifier.size(IconButtonDefaults.smallContainerSize(widthOption))',
            windmorph: 'size, width',
            note: '`IconButtonWidthOption.Uniform` is `width="default"`.',
          },
          { compose: 'shapes = IconButtonDefaults.shapes()', windmorph: 'shape' },
          { compose: 'content', windmorph: 'icon', note: 'Plus a required `aria-label`.' },
        ],
        note: 'Filled is the default variant, as in the spec.',
      },
      { composable: 'FilledTonalIconButton', component: 'IconButton variant="tonal"' },
      { composable: 'OutlinedIconButton', component: 'IconButton variant="outlined"' },
      {
        composable: 'IconToggleButton',
        component: 'IconButton toggle',
        params: [
          { compose: 'checked', windmorph: 'selected' },
          { compose: 'onCheckedChange', windmorph: 'onSelectedChange' },
          { compose: 'content that swaps on checked', windmorph: 'selectedIcon' },
        ],
        note: '`FilledIconToggleButton`, `FilledTonalIconToggleButton` and `OutlinedIconToggleButton` are `IconButton toggle` with that `variant`.',
      },
    ],
  },
  'button-group': {
    spec: 'button-groups/specs',
    covers: [
      {
        name: 'Standard button group',
        kind: 'variant',
        examples: ['button-group/button-group-standard'],
      },
      {
        name: 'Connected button group',
        kind: 'variant',
        examples: ['button-group/button-group-connected', 'button-group/button-group-multiple'],
      },
      {
        name: 'Size: XS, S, M, L, XL',
        kind: 'configuration',
        examples: ['button-group/button-group-sizes'],
      },
      {
        name: 'Shape: round and square',
        kind: 'configuration',
        examples: ['button-group/button-group-sizes', 'button-group/button-group-multiple'],
      },
      {
        name: 'Selection: single-select',
        kind: 'configuration',
        examples: ['button-group/button-group-connected'],
      },
      {
        name: 'Selection: multi-select',
        kind: 'configuration',
        examples: ['button-group/button-group-multiple'],
      },
      {
        name: 'Selection: selection-required',
        kind: 'configuration',
        examples: ['button-group/button-group-connected'],
      },
      {
        name: 'Label buttons and icon buttons together',
        kind: 'use case',
        examples: ['button-group/button-group-standard'],
      },
      {
        name: 'Overflow menu at smaller widths',
        kind: 'use case',
        examples: ['button-group/button-group-overflow'],
      },
      {
        name: 'Density (web, chosen by the reader)',
        kind: 'use case',
        examples: ['button-group/button-group-density'],
      },
    ],
    extensions: [
      {
        item: 'Press bump on connected groups',
        note: "`expandedRatio` opts a connected group into the standard group's press bump. Not in the M3 spec, which keeps connected neighbours still; matches Google's Expressive showcase motion.",
      },
      {
        item: 'Shared button variant',
        note: '`buttonVariant` sets the variant of every `Button` in the group through context, and of its `IconButton`s for the styles they have (filled, tonal, outlined); a button’s own `variant` wins.',
      },
    ],
    compose: [
      {
        composable: 'ButtonGroup',
        component: 'ButtonGroup variant="standard"',
        params: [
          { compose: 'expandedRatio', windmorph: 'expandedRatio' },
          {
            compose: 'overflowIndicator = { ButtonGroupDefaults.OverflowIndicator(it) }',
            windmorph: 'overflow, labels.more',
            note: 'The menu items come from the folded buttons; there is no per-item menu content.',
          },
          {
            compose: 'Modifier.animateWidth(interactionSource)',
            windmorph: '(automatic)',
            note: 'The group watches its buttons’ presses itself.',
          },
          {
            compose: 'horizontalArrangement',
            windmorph: 'size',
            note: 'The gap follows the size: 18 / 12 / 8 / 8 / 8px.',
          },
        ],
      },
      {
        composable: 'Row(horizontalArrangement = ButtonGroupDefaults.ConnectedSpaceBetween)',
        component: 'ButtonGroup variant="connected"',
        params: [
          {
            compose: 'ToggleButton(shapes = ButtonGroupDefaults.connectedLeadingButtonShapes())',
            windmorph: '(automatic)',
            note: 'Each child gets its leading, middle or trailing corners from the group.',
          },
          {
            compose: 'Modifier.weight(1f)',
            windmorph: '(automatic)',
            note: 'The buttons are equal columns: they share a definite width, and a `w-fit` group gives each the widest one’s natural width.',
          },
        ],
      },
      {
        composable: 'SingleChoiceSegmentedButtonRow',
        component: 'ButtonGroup variant="connected" selectionMode="single"',
        params: [
          { compose: 'SegmentedButton(selected, onClick)', windmorph: 'Button toggle value' },
        ],
        note: 'Segmented buttons are deprecated in M3 Expressive; the connected group replaces them.',
      },
      {
        composable: 'MultiChoiceSegmentedButtonRow',
        component: 'ButtonGroup variant="connected" selectionMode="multiple"',
      },
    ],
  },
  'split-button': {
    spec: 'split-button/specs',
    covers: [
      { name: 'Split button', kind: 'variant', examples: ['split-button/split-button-basic'] },
      {
        name: 'Color: elevated, filled, tonal, outlined',
        kind: 'configuration',
        examples: ['split-button/split-button-variants'],
      },
      {
        name: 'Size: XS, S, M, L, XL',
        kind: 'configuration',
        examples: ['split-button/split-button-sizes'],
      },
      {
        name: 'Leading button: label and icon, label, or icon',
        kind: 'use case',
        examples: [
          'split-button/split-button-basic',
          'split-button/split-button-sizes',
          'split-button/split-button-icon',
        ],
      },
    ],
    extensions: [
      { item: 'Links', note: '`href` makes the leading button a link.' },
      {
        item: 'Custom overlays',
        note: 'Without `menu`, the trailing button joins an enclosing `DialogTrigger`, `SheetTrigger` or `RichTooltipTrigger`, or calls `onTrailingPress` with `trailingRef` to anchor an overlay of your own.',
      },
    ],
    compose: [
      {
        composable: 'SplitButtonLayout',
        component: 'SplitButton',
        params: [
          {
            compose: 'leadingButton = SplitButtonDefaults.LeadingButton(onClick)',
            windmorph: 'children, leadingIcon, onPress',
          },
          {
            compose:
              'trailingButton = SplitButtonDefaults.TrailingButton(checked, onCheckedChange)',
            windmorph: 'open, onOpenChange, labels.menu',
          },
          { compose: 'DropdownMenu', windmorph: 'menu' },
          { compose: 'spacing', windmorph: '(fixed)', note: 'The halves are always 2px apart.' },
        ],
        note: '`TonalLeadingButton`, `OutlinedLeadingButton` and `ElevatedLeadingButton` (and their trailing buttons) are `SplitButton` with that `variant`.',
      },
    ],
  },
  fab: {
    spec: 'floating-action-button/specs',
    covers: [
      { name: 'FAB', kind: 'variant', examples: ['fab/fab-colors'] },
      { name: 'Medium FAB', kind: 'variant', examples: ['fab/fab-colors'] },
      { name: 'Large FAB', kind: 'variant', examples: ['fab/fab-colors'] },
      {
        name: 'Small, medium and large extended FAB',
        kind: 'variant',
        examples: ['fab/fab-extended'],
      },
      {
        name: 'Color: primary, secondary, tertiary container',
        kind: 'configuration',
        examples: ['fab/fab-color-styles', 'fab/fab-colors'],
      },
      {
        name: 'Color: primary, secondary, tertiary',
        kind: 'configuration',
        examples: ['fab/fab-color-styles'],
      },
      {
        name: 'Level 0 when nested in another component',
        kind: 'use case',
        examples: ['fab/fab-elevation'],
      },
      {
        name: 'Extended FAB collapsing to a FAB',
        kind: 'use case',
        examples: ['fab/fab-extended-collapse'],
      },
      {
        name: 'Disappearing and reappearing on a page change',
        kind: 'use case',
        examples: ['fab/fab-visibility'],
      },
    ],
    extensions: [
      {
        item: 'Lowered elevation',
        note: '`elevation="lowered"` (level 1, hover 2, pressed 1) is Compose’s lowered elevation; the spec shows level 3, and level 0 when nested.',
      },
      { item: 'Links', note: '`href` renders the FAB as an `<a>`.' },
    ],
    notBuilt: [
      { item: 'Small FAB', note: 'Not recommended in M3 Expressive: use a larger size.' },
      {
        item: 'Surface colour styles',
        note: 'Still in the spec but no longer recommended for FABs and extended FABs.',
      },
      {
        item: 'Baseline extended FAB',
        note: 'Not recommended in M3 Expressive: use the small extended FAB.',
      },
    ],
    compose: [
      {
        composable: 'FloatingActionButton',
        component: 'Fab',
        params: [
          { compose: 'onClick', windmorph: 'onPress' },
          { compose: 'containerColor', windmorph: 'color' },
          {
            compose: 'elevation = FloatingActionButtonDefaults.loweredElevation()',
            windmorph: 'elevation="lowered"',
          },
          { compose: 'content', windmorph: 'icon', note: 'Plus a required `aria-label`.' },
          {
            compose: 'Modifier.animateFloatingActionButton(visible, alignment)',
            windmorph: 'visible',
          },
        ],
      },
      { composable: 'MediumFloatingActionButton', component: 'Fab size="md"' },
      { composable: 'LargeFloatingActionButton', component: 'Fab size="lg"' },
      {
        composable: 'SmallFloatingActionButton',
        component: 'Fab',
        note: 'The small FAB is deprecated; use the default size.',
      },
      {
        composable: 'ExtendedFloatingActionButton',
        component: 'ExtendedFab',
        params: [
          { compose: 'text', windmorph: 'children' },
          { compose: 'icon', windmorph: 'icon' },
          { compose: 'expanded', windmorph: 'expanded' },
        ],
        note: '`SmallExtendedFloatingActionButton`, `MediumExtendedFloatingActionButton` and `LargeExtendedFloatingActionButton` are `ExtendedFab size="sm" | "md" | "lg"`.',
      },
    ],
  },
  'fab-menu': {
    spec: 'fab-menu/specs',
    covers: [
      { name: 'FAB menu', kind: 'variant', examples: ['fab-menu/fab-menu-basic'] },
      {
        name: 'Color: primary, secondary, tertiary set',
        kind: 'configuration',
        examples: ['fab-menu/fab-menu-colors'],
      },
      {
        name: 'Opening from a medium or large FAB',
        kind: 'configuration',
        examples: ['fab-menu/fab-menu-web'],
      },
      { name: 'A menu on the web', kind: 'use case', examples: ['fab-menu/fab-menu-web'] },
    ],
    extensions: [
      {
        item: 'Outside press closes it',
        note: "Compose relies on the system back button, which the web doesn't have, so an outside press closes the menu too.",
      },
      {
        item: 'Appear and disappear',
        note: "`visible` and `appear` give the menu's FAB the FAB's own disappear and reappear motion.",
      },
      {
        item: '`iconTransition="rotate"`',
        note: "Not in the M3 spec, which swaps `icon` for `openIcon` halfway through the morph: the outgoing icon turns 90° counter-clockwise on open (mirrored in RTL) and fades out as the incoming one turns in. Matches Google's Expressive showcase motion; reduced motion keeps only the crossfade.",
      },
      {
        item: '`elevation`',
        note: "As on `Fab`: `lowered` (level 1) or `flat` (level 0, the spec's level for a FAB nested in another surface) for the button and its items.",
      },
    ],
    compose: [
      {
        composable: 'FloatingActionButtonMenu',
        component: 'FabMenu',
        params: [
          { compose: 'expanded', windmorph: 'open' },
          {
            compose: 'button = ToggleFloatingActionButton(checked, onCheckedChange)',
            windmorph: 'icon, openIcon, onOpenChange',
          },
          {
            compose: 'ToggleFloatingActionButton(containerColor)',
            windmorph: 'color',
            note: 'One of the primary, secondary or tertiary sets.',
          },
          {
            compose: 'horizontalAlignment',
            windmorph: '(fixed)',
            note: "Always on the window's trailing edge, as the spec says.",
          },
        ],
      },
      {
        composable: 'ToggleFloatingActionButton',
        component: 'FabMenu',
        params: [{ compose: 'Modifier.size(…)', windmorph: 'size' }],
        note: 'The toggle button is part of `FabMenu`.',
      },
      {
        composable: 'FloatingActionButtonMenuItem',
        component: 'FabMenuItem',
        params: [
          { compose: 'onClick', windmorph: 'onAction' },
          { compose: 'text', windmorph: 'children' },
          { compose: 'icon', windmorph: 'icon' },
        ],
      },
    ],
  },
  'reaction-picker': {
    covers: [
      {
        name: 'Text button',
        kind: 'variant',
        examples: ['reaction-picker/reaction-picker-variants'],
      },
      {
        name: 'Tonal button',
        kind: 'variant',
        examples: ['reaction-picker/reaction-picker-variants'],
      },
      {
        name: 'Size: small and medium',
        kind: 'configuration',
        examples: [
          'reaction-picker/reaction-picker-variants',
          'reaction-picker/reaction-picker-message',
        ],
      },
      {
        name: 'No icon before reacting',
        kind: 'configuration',
        examples: ['reaction-picker/reaction-picker-variants'],
      },
      {
        name: "A post's action bar",
        kind: 'use case',
        examples: ['reaction-picker/reaction-picker-post'],
      },
      {
        name: 'Reacting to a message, translated',
        kind: 'use case',
        examples: ['reaction-picker/reaction-picker-message'],
      },
    ],
  },
  'reaction-summary': {
    covers: [
      {
        name: 'Stacked',
        kind: 'variant',
        examples: [
          'reaction-summary/reaction-summary-variants',
          'reaction-summary/reaction-summary-sizes',
        ],
      },
      {
        name: 'Chip',
        kind: 'variant',
        examples: [
          'reaction-summary/reaction-summary-variants',
          'reaction-summary/reaction-summary-sizes',
        ],
      },
      {
        name: 'Size: small and medium',
        kind: 'configuration',
        examples: ['reaction-summary/reaction-summary-sizes'],
      },
      {
        name: 'Number of icons',
        kind: 'configuration',
        examples: ['reaction-summary/reaction-summary-sizes'],
      },
      {
        name: 'Pressable, to see who reacted',
        kind: 'use case',
        examples: ['reaction-summary/reaction-summary-variants'],
      },
    ],
  },
};
