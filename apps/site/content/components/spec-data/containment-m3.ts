import type { ComponentSpecData } from './types';

/** Spec data for the M3 containment and overlay components, by page slug. */
export const CONTAINMENT_M3_SPEC: Record<string, ComponentSpecData> = {
  card: {
    spec: 'cards/specs',
    covers: [
      { name: 'Elevated card', kind: 'variant', examples: ['card/card-variants'] },
      { name: 'Filled card', kind: 'variant', examples: ['card/card-variants'] },
      { name: 'Outlined card', kind: 'variant', examples: ['card/card-variants'] },
      {
        name: 'Media, headline, supporting text and actions',
        kind: 'use case',
        examples: ['card/card-content'],
      },
      {
        name: 'Pressable and link cards',
        kind: 'use case',
        examples: ['card/card-interactive'],
      },
    ],
    extensions: [
      {
        item: 'Clipped content',
        note: 'Cards clip their content to the 12px corners, as Compose does, so media gets rounded edges; `overflow-visible` turns it off.',
      },
    ],
    notBuilt: [
      {
        item: 'Anatomy parts',
        note: 'No headline, media or actions sub-components: Compose ships none either, and layout utilities compose them.',
      },
    ],
    compose: [
      {
        composable: 'Card, ElevatedCard, OutlinedCard',
        component: 'Card variant',
        params: [
          { compose: 'onClick', windmorph: 'onPress', note: 'or `href` for a link card' },
          { compose: 'enabled', windmorph: 'disabled', note: 'inverted' },
          { compose: 'colors, elevation, border', windmorph: 'className, tokens' },
        ],
        note: '`Card` is `variant="filled"` (the default), `ElevatedCard` `"elevated"` and `OutlinedCard` `"outlined"`.',
      },
    ],
  },
  dialog: {
    spec: 'dialogs/specs',
    covers: [
      {
        name: 'Basic dialog',
        kind: 'variant',
        examples: ['dialog/dialog-basic', 'dialog/dialog-alert'],
      },
      { name: 'Full-screen dialog', kind: 'variant', examples: ['dialog/dialog-full-screen'] },
      { name: 'Icon (optional)', kind: 'configuration', examples: ['dialog/dialog-icon'] },
      { name: 'Custom position', kind: 'configuration', examples: ['dialog/dialog-placement'] },
      { name: 'Scrolling content', kind: 'configuration', examples: ['dialog/dialog-scrollable'] },
      {
        name: 'Confirm a high-risk action',
        kind: 'use case',
        examples: ['dialog/dialog-alert', 'dialog/dialog-icon'],
      },
    ],
    extensions: [
      {
        item: 'Full screen on every window',
        note: '`fullScreen="always"` fills wide windows too; the spec keeps full-screen dialogs to compact windows, which `fullScreen="compact"` follows.',
      },
      {
        item: 'Dismissal options',
        note: '`dismissable` lets a press outside close an alert dialog, and `keyboardDismissDisabled` keeps Escape from closing one.',
      },
    ],
    notBuilt: [
      {
        item: 'Dividers around scrolling content',
        note: "The spec's optional dividers above and below scrolling content aren't drawn automatically; add a `Divider` where needed.",
      },
    ],
    compose: [
      {
        composable: 'AlertDialog, BasicAlertDialog',
        component: 'Dialog',
        params: [
          {
            compose: 'onDismissRequest',
            windmorph: 'onOpenChange',
            note: 'or a `DialogTrigger` that owns the open state',
          },
          { compose: 'icon', windmorph: 'icon' },
          { compose: 'title', windmorph: 'DialogTitle' },
          { compose: 'text', windmorph: 'DialogContent' },
          { compose: 'confirmButton, dismissButton', windmorph: 'DialogActions' },
          { compose: 'properties.dismissOnClickOutside', windmorph: 'dismissable' },
          {
            compose: 'properties.dismissOnBackPress',
            windmorph: 'keyboardDismissDisabled',
            note: 'inverted: Escape is the web back gesture',
          },
        ],
      },
      {
        composable: 'Dialog(properties = DialogProperties(usePlatformDefaultWidth = false))',
        component: 'Dialog fullScreen',
        params: [{ compose: 'a top app bar with close and save', windmorph: 'DialogHeader' }],
        note: 'Compose has no full-screen dialog composable; `fullScreen="compact"` with a `DialogHeader` builds the spec\'s one.',
      },
    ],
  },
  menu: {
    spec: 'menus/specs',
    covers: [
      {
        name: 'Vertical menu with divider',
        kind: 'variant',
        examples: ['menu/menu-layouts', 'menu/menu-basic'],
      },
      { name: 'Vertical menu with gap', kind: 'variant', examples: ['menu/menu-layouts'] },
      {
        name: 'Color: standard',
        kind: 'configuration',
        examples: ['menu/menu-basic', 'menu/menu-layouts'],
      },
      { name: 'Color: vibrant', kind: 'configuration', examples: ['menu/menu-selection'] },
      { name: 'Layout: standard', kind: 'configuration', examples: ['menu/menu-selection'] },
      {
        name: 'Layout: grouped',
        kind: 'configuration',
        examples: ['menu/menu-basic', 'menu/menu-layouts'],
      },
      { name: 'Selection states', kind: 'use case', examples: ['menu/menu-selection'] },
      { name: 'Submenus', kind: 'use case', examples: ['menu/menu-submenu'] },
      { name: 'Context menu', kind: 'use case', examples: ['menu/menu-context'] },
    ],
    extensions: [
      {
        item: 'Gaps on the web',
        note: 'The spec says gaps aren\'t available on the web yet; `layout="gap"` offers them, and a gap menu that has to scroll switches to dividers, as the spec asks.',
      },
      {
        item: 'Offset',
        note: '`offset` sets a gap between the trigger and the menu (the split button uses 4px).',
      },
    ],
    notBuilt: [
      {
        item: 'Baseline menu',
        note: 'The spec keeps the square-cornered baseline menu available, but the M3 Expressive vertical menu replaces it here.',
      },
    ],
    compose: [
      {
        composable: 'DropdownMenu',
        component: 'MenuTrigger + Menu',
        params: [
          { compose: 'expanded', windmorph: 'MenuTrigger open' },
          { compose: 'onDismissRequest', windmorph: 'MenuTrigger onOpenChange' },
          { compose: 'offset', windmorph: 'Menu placement, offset' },
          {
            compose: 'containerColor',
            windmorph: 'Menu variant',
            note: '`vibrant` for the tertiary container',
          },
        ],
      },
      {
        composable: 'DropdownMenuItem',
        component: 'MenuItem',
        params: [
          { compose: 'text', windmorph: 'children' },
          {
            compose: 'onClick',
            windmorph: 'Menu onAction',
            note: "called with the item's `key`",
          },
          { compose: 'leadingIcon, trailingIcon', windmorph: 'leadingIcon, trailingIcon' },
          { compose: 'enabled', windmorph: 'Menu disabledKeys' },
          { compose: 'selected', windmorph: 'Menu selectionMode, selectedKeys' },
        ],
      },
    ],
  },
  tooltip: {
    spec: 'tooltips/specs',
    covers: [
      { name: 'Plain tooltip', kind: 'variant', examples: ['tooltip/tooltip-plain'] },
      { name: 'Rich tooltip', kind: 'variant', examples: ['tooltip/tooltip-rich'] },
      {
        name: 'Subhead, supporting text and two buttons',
        kind: 'configuration',
        examples: ['tooltip/tooltip-rich-configurations'],
      },
      {
        name: 'Subhead, supporting text and one button',
        kind: 'configuration',
        examples: ['tooltip/tooltip-rich-configurations', 'tooltip/tooltip-rich'],
      },
      {
        name: 'Subhead and supporting text',
        kind: 'configuration',
        examples: ['tooltip/tooltip-rich-configurations', 'tooltip/tooltip-rich'],
      },
      {
        name: 'Supporting text and one button',
        kind: 'configuration',
        examples: ['tooltip/tooltip-rich-configurations'],
      },
      {
        name: 'Supporting text and two buttons',
        kind: 'configuration',
        examples: ['tooltip/tooltip-rich-configurations'],
      },
      { name: 'Persistent rich tooltip', kind: 'use case', examples: ['tooltip/tooltip-rich'] },
    ],
    extensions: [
      {
        item: 'Caret',
        note: '`caret` draws a 16×8px pointer at the anchor, as Compose can; the spec shows none.',
      },
      {
        item: 'Focus keeps a plain tooltip',
        note: "A tooltip shown by keyboard focus stays until blur or Escape rather than leaving after Compose's timeout (WCAG 1.4.13).",
      },
    ],
    compose: [
      {
        composable: 'TooltipBox + PlainTooltip',
        component: 'TooltipTrigger + Tooltip',
        params: [
          { compose: 'positionProvider', windmorph: 'TooltipTrigger placement, offset' },
          { compose: 'state', windmorph: 'TooltipTrigger isOpen, onOpenChange' },
          { compose: 'caretShape', windmorph: 'Tooltip caret' },
        ],
      },
      {
        composable: 'TooltipBox + RichTooltip',
        component: 'RichTooltipTrigger + RichTooltip',
        params: [
          { compose: 'title', windmorph: 'RichTooltip title' },
          { compose: 'action', windmorph: 'RichTooltip action' },
          { compose: 'text', windmorph: 'children' },
          {
            compose: 'rememberTooltipState(isPersistent = true)',
            windmorph: 'RichTooltipTrigger persistent',
          },
        ],
      },
    ],
  },
  sheets: {
    spec: 'bottom-sheets/specs',
    covers: [
      {
        name: 'Standard bottom sheet',
        kind: 'variant',
        examples: ['sheets/sheet-bottom-standard'],
      },
      { name: 'Modal bottom sheet', kind: 'variant', examples: ['sheets/sheet-bottom'] },
      { name: 'Standard side sheet', kind: 'variant', examples: ['sheets/sheet-standard'] },
      { name: 'Modal side sheet', kind: 'variant', examples: ['sheets/sheet-side'] },
      {
        name: 'Drag handle (optional)',
        kind: 'configuration',
        examples: ['sheets/sheet-bottom', 'sheets/sheet-bottom-standard'],
      },
      {
        name: 'Detached side sheet',
        kind: 'configuration',
        examples: ['sheets/sheet-side-levels'],
      },
      {
        name: 'Side sheet bottom actions',
        kind: 'configuration',
        examples: ['sheets/sheet-side'],
      },
      {
        name: 'Back navigation in a side sheet',
        kind: 'use case',
        examples: ['sheets/sheet-side-levels'],
      },
    ],
    extensions: [
      {
        item: 'Skip the half detent',
        note: "`skipPartiallyExpanded` opens a tall modal sheet fully, as Compose's sheet state can.",
      },
    ],
    notBuilt: [
      {
        item: 'Predictive back and nested scrolling',
        note: "Dragging a sheet through its scrolling content and the predictive back gesture aren't built.",
      },
      {
        item: 'More detents',
        note: 'Sheets settle at half or full (modal) and peek or full (standard) only.',
      },
    ],
    compose: [
      {
        composable: 'ModalBottomSheet',
        component: 'BottomSheet variant="modal"',
        params: [
          { compose: 'onDismissRequest', windmorph: 'onOpenChange', note: 'or a `SheetTrigger`' },
          {
            compose: 'rememberModalBottomSheetState(skipPartiallyExpanded)',
            windmorph: 'skipPartiallyExpanded',
          },
          { compose: 'dragHandle', windmorph: 'dragHandle' },
          { compose: 'properties.shouldDismissOnClickOutside', windmorph: 'dismissable' },
        ],
      },
      {
        composable: 'BottomSheetScaffold',
        component: 'BottomSheet variant="standard"',
        params: [
          { compose: 'sheetPeekHeight', windmorph: 'peekHeight' },
          { compose: 'sheetDragHandle', windmorph: 'dragHandle' },
        ],
      },
      {
        composable: '(no Compose side sheet)',
        component: 'SideSheet',
        note: 'Side sheets follow m3.material.io and Material Components Android: `variant`, `detached`, `title`, `onBack`, `actions` and `footer`.',
      },
    ],
  },
  list: {
    spec: 'lists/specs',
    covers: [
      {
        name: 'Expressive list',
        kind: 'variant',
        examples: ['list/list-static', 'list/list-interactive'],
      },
      {
        name: 'Style: standard',
        kind: 'configuration',
        examples: ['list/list-dividers', 'list/list-selection'],
      },
      {
        name: 'Style: segmented',
        kind: 'configuration',
        examples: ['list/list-static', 'list/list-selection'],
      },
      {
        name: 'Single-action list',
        kind: 'configuration',
        examples: ['list/list-interactive', 'list/list-links'],
      },
      { name: 'Multi-action list', kind: 'configuration', examples: ['list/list-interactive'] },
      {
        name: 'Single-select list',
        kind: 'configuration',
        examples: ['list/list-selection', 'list/list-radio'],
      },
      {
        name: 'Multi-select list',
        kind: 'configuration',
        examples: ['list/list-selection', 'list/list-toggles'],
      },
      { name: 'Expand and collapse', kind: 'configuration', examples: ['list/list-expandable'] },
      { name: 'Images, video and avatars', kind: 'use case', examples: ['list/list-media'] },
      { name: 'Dividers and line limits', kind: 'use case', examples: ['list/list-dividers'] },
    ],
    extensions: [
      {
        item: '`ListSection`',
        note: "M3 defines no list subheader: `ListSection` groups items under a title styled after the navigation drawer's section headline. Items take their corners within their section, and the arrow keys move across sections as through one list.",
      },
    ],
    differences: [
      {
        item: 'Standard item colour',
        note: 'Standard items are transparent rather than `surface`, so a list takes the colour of the sheet, card or pane it sits on.',
      },
    ],
    notBuilt: [
      {
        item: 'Baseline list',
        note: 'The spec recommends expressive lists instead; a standard list without selection gives the flush baseline look.',
      },
      { item: 'Swipe to reveal', note: 'The spec offers it on Android Views only.' },
      { item: 'Drag to reorder', note: 'Reordering and its dragged item state are deferred.' },
    ],
    compose: [
      {
        composable: 'ListItem',
        component: 'ListItem',
        params: [
          { compose: 'headlineContent', windmorph: 'children' },
          { compose: 'overlineContent', windmorph: 'overline' },
          { compose: 'supportingContent', windmorph: 'supportingText' },
          { compose: 'leadingContent, trailingContent', windmorph: 'leading, trailing' },
          { compose: 'onClick', windmorph: 'List onAction', note: "or the item's `href`" },
          {
            compose: 'selected, onClick',
            windmorph: 'List selectionMode, selectedKeys, onSelectionChange',
          },
          { compose: 'checked, onCheckedChange', windmorph: 'control, checked, onCheckedChange' },
        ],
      },
      { composable: 'SegmentedListItem', component: 'List variant="segmented"' },
    ],
  },
  carousel: {
    spec: 'carousel/specs',
    covers: [
      { name: 'Multi-browse', kind: 'variant', examples: ['carousel/carousel-multibrowse'] },
      { name: 'Uncontained', kind: 'variant', examples: ['carousel/carousel-variants'] },
      {
        name: 'Uncontained multi-aspect ratio',
        kind: 'variant',
        examples: ['carousel/carousel-layouts'],
      },
      { name: 'Hero', kind: 'variant', examples: ['carousel/carousel-hero'] },
      { name: 'Center-aligned hero', kind: 'variant', examples: ['carousel/carousel-variants'] },
      { name: 'Full-screen', kind: 'variant', examples: ['carousel/carousel-layouts'] },
      {
        name: 'Items that open something',
        kind: 'use case',
        examples: ['carousel/carousel-actions'],
      },
    ],
    extensions: [
      {
        item: 'Vertical carousels',
        note: '`orientation="vertical"` lays out any variant in a column; the spec shows only full-screen carousels vertically.',
      },
    ],
    notBuilt: [
      {
        item: 'Parallax',
        note: "There's no parallax helper; each item's visible size is exposed as `--m3-carousel-item-size` to build one.",
      },
    ],
    compose: [
      {
        composable: 'HorizontalMultiBrowseCarousel',
        component: 'Carousel variant="multi-browse"',
        params: [
          { compose: 'preferredItemWidth', windmorph: 'preferredItemSize' },
          { compose: 'itemSpacing', windmorph: 'itemSpacing' },
          {
            compose: 'minSmallItemWidth, maxSmallItemWidth',
            windmorph: 'minSmallItemSize, maxSmallItemSize',
          },
          { compose: 'contentPadding', windmorph: 'contentPadding' },
        ],
      },
      {
        composable: 'HorizontalUncontainedCarousel',
        component: 'Carousel variant="uncontained"',
        params: [
          { compose: 'itemWidth', windmorph: 'itemSize' },
          { compose: 'flingBehavior', windmorph: 'snap' },
        ],
      },
      {
        composable: 'HorizontalCenteredHeroCarousel',
        component: 'Carousel variant="hero" heroAlignment="center"',
      },
      {
        composable: 'Modifier.maskClip(shape)',
        component: '--m3-carousel-corner',
        note: "Items are masked with 28px corners, as Compose's samples use `MaterialTheme.shapes.extraLarge`.",
      },
    ],
  },
  badge: {
    spec: 'badges/specs',
    covers: [
      {
        name: 'Small badge',
        kind: 'variant',
        examples: ['badge/badge-basic', 'badge/badge-navigation'],
      },
      {
        name: 'Large badge',
        kind: 'variant',
        examples: ['badge/badge-basic', 'badge/badge-navigation'],
      },
      {
        name: 'Large badge with maximum characters',
        kind: 'configuration',
        examples: ['badge/badge-basic', 'badge/badge-navigation'],
      },
      { name: 'On navigation items', kind: 'use case', examples: ['badge/badge-navigation'] },
      { name: 'On icons', kind: 'use case', examples: ['badge/badge-basic'] },
    ],
    extensions: [
      {
        item: 'Count cap',
        note: '`max` sets the highest count shown (999 by default, "999+"), and a text badge truncates past 34px.',
      },
    ],
    compose: [
      {
        composable: 'Badge',
        component: 'Badge',
        params: [
          { compose: 'content', windmorph: 'children', note: 'leave it out for the small dot' },
          { compose: 'containerColor, contentColor', windmorph: 'className, tokens' },
        ],
      },
      {
        composable: 'BadgedBox',
        component: 'BadgedBox',
        params: [{ compose: 'badge', windmorph: 'badge' }],
      },
    ],
  },
  divider: {
    spec: 'divider/specs',
    covers: [
      {
        name: 'Full-width divider',
        kind: 'configuration',
        examples: ['divider/divider-basic', 'divider/divider-list'],
      },
      {
        name: 'Inset divider',
        kind: 'configuration',
        examples: ['divider/divider-basic', 'divider/divider-list'],
      },
      { name: 'Middle-inset divider', kind: 'configuration', examples: ['divider/divider-basic'] },
      { name: 'Vertical divider', kind: 'configuration', examples: ['divider/divider-basic'] },
      {
        name: 'Divider with supporting text',
        kind: 'configuration',
        examples: ['divider/divider-basic'],
      },
      { name: 'Grouping list items', kind: 'use case', examples: ['divider/divider-list'] },
    ],
    compose: [
      {
        composable: 'HorizontalDivider, VerticalDivider',
        component: 'Divider orientation',
        params: [
          { compose: 'thickness, color', windmorph: 'className, tokens' },
          {
            compose: 'Modifier.padding(start = 16.dp)',
            windmorph: 'inset',
            note: '`start` or `middle`; Compose leaves insets to padding',
          },
        ],
      },
    ],
  },
};
