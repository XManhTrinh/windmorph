'use client';

import {
  Badge,
  BadgedBox,
  BottomSheet,
  Button,
  Card,
  Carousel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  Divider,
  LabeledDivider,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  Tooltip,
  TooltipTrigger,
} from '@windmorph/react';
import { createElement } from 'react';
import {
  CloseIcon,
  DeleteIcon,
  EditIcon,
  ExpandMoreIcon,
  NotificationsIcon,
  SendIcon,
  StarIcon,
} from '../../icons';
import { type PlaygroundDescriptor, loose, svg } from './shared';

const CardAny = loose(Card);
const ListAny = loose(List);
const DividerAny = loose(Divider);
const LabeledDividerAny = loose(LabeledDivider);
const ListItemAny = loose(ListItem);
const DialogAny = loose(Dialog);
const MenuAny = loose(Menu);
const TooltipAny = loose(Tooltip);
const BottomSheetAny = loose(BottomSheet);
const CarouselAny = loose(Carousel);
const BadgeAny = loose(Badge);

const DELETE = svg(
  'M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z',
);
const CLOSE = svg(
  'm256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z',
);
const EXPAND_MORE = svg('M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z');

/** Coloured panels standing in for a carousel's images. */
const SLIDE_TONES = [
  'bg-primary-container text-on-primary-container',
  'bg-secondary-container text-on-secondary-container',
  'bg-tertiary-container text-on-tertiary-container',
  'bg-primary text-on-primary',
  'bg-secondary text-on-secondary',
  'bg-tertiary text-on-tertiary',
];
/** Multi-aspect items keep their own widths, from 9:16 to 16:9. */
const SLIDE_ASPECTS = [
  'aspect-[16/9]',
  'aspect-[9/16]',
  'aspect-square',
  'aspect-[4/5]',
  'aspect-[3/2]',
];

/** An enum control's "unset" option, which leaves the prop out. */
const NONE = 'none';
const unlessNone = (value: unknown) => (value === NONE ? undefined : value);
const asNumber = (value: unknown) => (value == null || value === '' ? undefined : Number(value));

/** Playgrounds for the M3 containment and overlay components, by page slug. */
export const CONTAINMENT_M3_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  card: {
    component: 'Card',
    render: ({ href, ...props }) =>
      createElement(
        CardAny,
        { ...props, ...(href ? { href } : {}), className: 'w-full max-w-xs' },
        <div key="body" className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Card title</h3>
          <p className="text-body-medium text-on-surface-variant">
            Supporting text describing the card.
          </p>
        </div>,
      ),
    defaultProps: { variant: 'filled', href: '', disabled: false, dragged: false },
    surfacedProps: ['variant', 'href', 'disabled', 'dragged'],
    initialState: { variant: 'elevated' },
    // Only an interactive card (a link or an action) can be disabled or dragged.
    codeSlots: {
      onPress: (values) =>
        !values.href && (values.disabled === true || values.dragged === true) ? '() => {}' : null,
    },
    notControlled: {
      preventFocusOnPress:
        'Only stops a press from moving focus (menu triggers set it); the preview looks the same.',
      toggle: 'Typed `false`: it only rules out a toggle form, which cards have no use for.',
    },
    codeChildren:
      '<div className="flex flex-col gap-1 p-4">\n    <h3 className="text-title-medium text-on-surface">Card title</h3>\n    <p className="text-body-medium text-on-surface-variant">Supporting text describing the card.</p>\n  </div>',
  },
  dialog: {
    component: 'Dialog',
    notRendered: {
      DialogTrigger:
        'Opens the dialog from a button; the preview opens it from the `open` control instead.',
      DialogTitle: "A part the preview composes the dialog from; it takes only the title's text.",
      DialogHeader:
        "The full-screen dialog's header, with its close button and action; the Full-screen example shows it.",
      DialogContent:
        'A part the preview composes the dialog from; its dividers show in the Dividers example.',
      DialogActions:
        "A part the preview composes the dialog from; it takes only the dialog's buttons.",
    },
    // The trigger's button opens the dialog (and is the container transform's origin);
    // closing it in any way sets `open` back to false.
    render: ({ icon, open, origin, ...props }, update) => (
      <DialogTrigger open={Boolean(open)} onOpenChange={(next) => update('open', next)}>
        <Button variant="tonal">Open dialog</Button>
        <DialogAny
          {...props}
          {...(icon === true && { icon: <DeleteIcon /> })}
          {...(origin === true && { origin: 'trigger' })}
        >
          <DialogHeader closeLabel="Close">Delete draft?</DialogHeader>
          <DialogContent>
            The draft and its attachments will be removed from this device.
          </DialogContent>
          <DialogActions>
            <Button variant="text" onPress={() => update('open', false)}>
              Cancel
            </Button>
            <Button variant="text" onPress={() => update('open', false)}>
              Delete
            </Button>
          </DialogActions>
        </DialogAny>
      </DialogTrigger>
    ),
    defaultProps: {
      open: false,
      role: 'alertdialog',
      icon: false,
      fullScreen: 'never',
      placement: 'center',
      dismissable: false,
      keyboardDismissDisabled: false,
      origin: false,
      quick: false,
      transition: 'reveal',
    },
    surfacedProps: [
      'open',
      'role',
      'icon',
      'fullScreen',
      'origin',
      'placement',
      'dismissable',
      'keyboardDismissDisabled',
      'quick',
      'transition',
    ],
    enumOptions: { role: ['alertdialog', 'dialog'], transition: ['reveal', 'scale'] },
    // `dismissable` defaults by role: false for an alert dialog, true for a plain one. A role
    // change resets it to the new default, and the snippet writes it only when it differs.
    codeDefaults: (values) => ({ dismissable: values.role !== 'alertdialog' }),
    // `origin` grows only a full-screen dialog out of the trigger, so turning it on makes a
    // basic dialog full screen.
    adjust: (values, changed) => {
      if (changed === 'role') return { ...values, dismissable: values.role !== 'alertdialog' };
      if (changed === 'origin' && values.origin === true && values.fullScreen === 'never') {
        return { ...values, fullScreen: 'always' };
      }
      return values;
    },
    controlKinds: { icon: 'boolean', origin: 'boolean' },
    toggledSlots: { icon: DELETE, origin: '"trigger"' },
    importMembers: ['Button', 'DialogActions', 'DialogContent', 'DialogHeader', 'DialogTrigger'],
    codeWrap: {
      before: '<DialogTrigger>\n  <Button variant="tonal">Open dialog</Button>',
      after: '</DialogTrigger>',
    },
    codeChildren:
      '<DialogHeader closeLabel="Close">Delete draft?</DialogHeader>\n  <DialogContent>The draft and its attachments will be removed from this device.</DialogContent>\n  <DialogActions>\n    <Button variant="text">Cancel</Button>\n    <Button variant="text">Delete</Button>\n  </DialogActions>',
  },
  menu: {
    component: 'Menu',
    notRendered: {
      MenuItem:
        "The menu's items, composed in the preview; their icons, description, badge and shortcut are per item, as the examples show.",
      MenuGroup: 'Groups items under an optional title; the Basic and Layouts examples show it.',
      MenuTrigger: "Opens the menu from the preview's button; its open state is the preview's own.",
      SubmenuTrigger: 'Opens a nested menu from an item; the Submenu example shows it.',
      ContextMenuTrigger:
        'Opens the menu on right-click or long press of an area; the Context menu example shows it.',
    },
    render: ({ density, offset, containerPadding, ...props }) =>
      createElement(
        MenuTrigger,
        null,
        <Button key="trigger" variant="tonal">
          Open menu
        </Button>,
        createElement(
          MenuAny,
          {
            key: 'menu',
            ...props,
            density: asNumber(density),
            offset: asNumber(offset),
            containerPadding: asNumber(containerPadding),
          },
          <MenuGroup key="edit" aria-label="Edit">
            <MenuItem key="edit" leadingIcon={<EditIcon />}>
              Edit
            </MenuItem>
            <MenuItem key="share" leadingIcon={<SendIcon />}>
              Share
            </MenuItem>
            <MenuItem key="favourite" leadingIcon={<StarIcon />}>
              Add to favourites
            </MenuItem>
          </MenuGroup>,
          <MenuGroup key="danger" aria-label="Danger zone">
            <MenuItem key="delete" leadingIcon={<DeleteIcon />}>
              Delete
            </MenuItem>
          </MenuGroup>,
        ),
      ),
    defaultProps: {
      variant: 'standard',
      layout: 'divider',
      density: 0,
      placement: 'bottom start',
      offset: 0,
      containerPadding: 12,
      presentation: 'popover',
      instant: false,
    },
    surfacedProps: [
      'variant',
      'layout',
      'density',
      'placement',
      'offset',
      'containerPadding',
      'presentation',
      'instant',
    ],
    enumOptions: {
      placement: ['bottom start', 'bottom end', 'top start', 'top end', 'start', 'end'],
      density: ['0', '-1', '-2', '-3'],
      presentation: ['popover', 'sheet', 'auto'],
    },
    // `density` is a number (0 to -3), so the snippet writes it as one.
    controlKinds: { density: 'number' },
    importMembers: ['Button', 'MenuGroup', 'MenuItem', 'MenuTrigger'],
    codeWrap: {
      before: '<MenuTrigger>\n  <Button variant="tonal">Open menu</Button>',
      after: '</MenuTrigger>',
    },
    codeChildren:
      '<MenuGroup aria-label="Edit">\n    <MenuItem key="edit">Edit</MenuItem>\n    <MenuItem key="share">Share</MenuItem>\n    <MenuItem key="favourite">Add to favourites</MenuItem>\n  </MenuGroup>\n  <MenuGroup aria-label="Danger zone">\n    <MenuItem key="delete">Delete</MenuItem>\n  </MenuGroup>',
  },
  tooltip: {
    component: 'Tooltip',
    notRendered: {
      RichTooltip:
        'A tooltip with a subhead, text and actions; the Rich examples show it, while the playground shows the plain tooltip.',
      TooltipTrigger:
        "Shows the tooltip on hover, focus or long press of the preview's button; its timing and placement show only while you use it.",
      RichTooltipTrigger:
        'Shows the rich tooltip; the Rich examples show its placement and persistent forms.',
    },
    // The icon button's own tooltip is off, so this one shows on hover and focus.
    render: (props) =>
      createElement(
        TooltipTrigger,
        null,
        <IconButton
          key="trigger"
          variant="standard"
          tooltip={false}
          icon={<NotificationsIcon />}
          aria-label="Notifications"
        />,
        createElement(TooltipAny, { key: 'tooltip', ...props }, 'Turn on notifications'),
      ),
    defaultProps: { caret: false },
    surfacedProps: ['caret'],
    initialState: { caret: true },
    importMembers: ['IconButton', 'TooltipTrigger'],
    codeImports: ["import { NotificationsIcon } from './icons';"],
    codeWrap: {
      before:
        '<TooltipTrigger>\n  <IconButton\n    variant="standard"\n    tooltip={false}\n    icon={<NotificationsIcon />}\n    aria-label="Notifications"\n  />',
      after: '</TooltipTrigger>',
    },
    codeChildren: 'Turn on notifications',
  },
  sheets: {
    component: 'BottomSheet',
    notRendered: {
      SideSheet:
        'A side panel with its own options (detached, levels and back button); the Side sheet examples show it.',
      SheetTrigger:
        'Opens the sheet from a button; the preview opens it from the `open` control instead.',
    },
    // In a bounded frame: a standard sheet is placed in it (`classNames.container`), and a
    // modal one opens over the window from the button.
    render: ({ open, closeIcon, collapseIcon, peekHeight, ...props }, update) =>
      createElement(
        'div',
        {
          className:
            'relative h-[320px] w-full max-w-md overflow-hidden rounded-corner-large border border-outline-variant',
        },
        <div key="page" className="flex flex-col items-start gap-3 p-6">
          <p className="text-body-large text-on-surface">Main content</p>
          <Button variant="tonal" onPress={() => update('open', true)}>
            Open sheet
          </Button>
        </div>,
        createElement(
          BottomSheetAny,
          {
            // A new variant starts afresh.
            key: String(props.variant),
            ...props,
            'aria-label': 'Now playing',
            open: Boolean(open),
            onOpenChange: (next: boolean) => update('open', next),
            peekHeight: asNumber(peekHeight),
            ...(closeIcon === true && { closeIcon: <CloseIcon /> }),
            ...(collapseIcon === true && { collapseIcon: <ExpandMoreIcon /> }),
            ...(props.variant === 'standard' && { classNames: { container: 'absolute' } }),
          },
          <div key="content" className="flex flex-col gap-2 px-6 pb-6">
            <p className="text-title-medium text-on-surface">Now playing</p>
            <p className="text-body-medium text-on-surface-variant">
              Track details and controls stay at hand while the page scrolls.
            </p>
          </div>,
        ),
      ),
    defaultProps: {
      variant: 'modal',
      open: false,
      dragHandle: true,
      skipPartiallyExpanded: false,
      peekHeight: 56,
      dismissable: true,
      closeButton: true,
      closeIcon: false,
      collapseIcon: false,
    },
    surfacedProps: [
      'variant',
      'open',
      'dragHandle',
      'skipPartiallyExpanded',
      'peekHeight',
      'dismissable',
      'closeButton',
      'closeIcon',
      'collapseIcon',
    ],
    controlKinds: { closeIcon: 'boolean', collapseIcon: 'boolean' },
    toggledSlots: { closeIcon: CLOSE, collapseIcon: EXPAND_MORE },
    codeSlots: { 'aria-label': '"Now playing"' },
    importMembers: ['Button', 'SheetTrigger'],
    codeWrap: {
      before: '<SheetTrigger>\n  <Button variant="tonal">Open sheet</Button>',
      after: '</SheetTrigger>',
    },
    codeChildren:
      '<div className="flex flex-col gap-2 px-6 pb-6">\n    <p className="text-title-medium text-on-surface">Now playing</p>\n    <p className="text-body-medium text-on-surface-variant">Track details and controls stay at hand while the page scrolls.</p>\n  </div>',
  },
  list: {
    component: 'List',
    notRendered: {
      ListItem:
        "The list's rows, composed in the preview; their text, leading and trailing content, links and controls are per row, as the examples show.",
      ListSection: 'Groups rows under a title; the Sections example shows it.',
      ListItemImage: "A row's leading image; the Media example shows it.",
      ListItemVideo: "A row's leading video thumbnail; the Media example shows it.",
      ListItemAvatar: "A row's leading avatar; the Media example shows it.",
    },
    // On a rounded surface, as a sheet or card would hold it: the segmented gaps show the
    // surface, and its corners (16px item corners + 12px padding) follow the items'.
    render: ({ value, dividers, disabledKeys, headlineLines, supportingTextLines, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-sm rounded-corner-extra-large bg-surface-container p-3' },
        createElement(
          ListAny,
          {
            ...props,
            // A radio list and a list box are built differently, so a mode change starts afresh.
            key: `${String(props.selectionMode)}-${value === NONE ? 'plain' : 'radio'}`,
            'aria-label': 'Contacts',
            value: unlessNone(value),
            dividers: unlessNone(dividers),
            disabledKeys: disabledKeys === true ? ['two'] : undefined,
            headlineLines: asNumber(headlineLines),
            supportingTextLines: asNumber(supportingTextLines),
          },
          createElement(
            ListItemAny,
            { key: 'one', value: 'one', supportingText: 'Supporting text' },
            'One line',
          ),
          createElement(
            ListItemAny,
            { key: 'two', value: 'two', supportingText: 'Supporting text' },
            'Two lines',
          ),
          createElement(ListItemAny, { key: 'three', value: 'three' }, 'Three'),
        ),
      ),
    defaultProps: {
      variant: 'standard',
      selectionMode: 'none',
      disallowEmptySelection: false,
      disabledKeys: false,
      value: NONE,
      required: false,
      disabled: false,
      controlPlacement: 'leading',
      dividers: NONE,
      selectionIndicator: true,
    },
    surfacedProps: [
      'variant',
      'selectionMode',
      'disallowEmptySelection',
      'disabledKeys',
      'value',
      'required',
      'disabled',
      'controlPlacement',
      'dividers',
      'selectionIndicator',
      'headlineLines',
      'supportingTextLines',
    ],
    initialState: { variant: 'segmented' },
    enumOptions: {
      value: [NONE, 'one', 'two', 'three'],
      dividers: [NONE, 'full', 'inset'],
    },
    // Line limits are numbers (1 to 3), so the snippet writes them as numbers.
    controlKinds: {
      disabledKeys: 'boolean',
      headlineLines: 'number',
      supportingTextLines: 'number',
    },
    toggledSlots: { disabledKeys: "['two']" },
    notControlled: {
      selectedKeys:
        'An Iterable of item keys; choose items in the preview with `selectionMode` on instead.',
      defaultSelectedKeys:
        'An Iterable of item keys, the uncontrolled `selectedKeys`; choose items in the preview.',
      expandedKeys:
        'An Iterable of keys of items with `childItems`; see the Expandable items example.',
      defaultExpandedKeys:
        'An Iterable of keys of items with `childItems`, the uncontrolled `expandedKeys`.',
      name: "A radio list's form field name, with no visible effect.",
    },
    importMembers: ['ListItem'],
    codeSlots: { 'aria-label': '"Contacts"' },
    codeChildren:
      '<ListItem key="one" value="one" supportingText="Supporting text">One line</ListItem>\n  <ListItem key="two" value="two" supportingText="Supporting text">Two lines</ListItem>\n  <ListItem key="three" value="three">Three</ListItem>',
  },
  carousel: {
    component: 'Carousel',
    render: ({
      preferredItemSize,
      itemSize,
      itemSpacing,
      minSmallItemSize,
      maxSmallItemSize,
      ...props
    }) => {
      const vertical = props.orientation === 'vertical';
      const aspect = props.variant === 'multi-aspect';
      return createElement(
        'div',
        { className: vertical ? 'flex w-full justify-center' : 'w-full' },
        createElement(
          CarouselAny,
          {
            // Keylines are measured per layout, so a layout change starts afresh.
            key: `${String(props.variant)}-${String(props.orientation)}`,
            ...props,
            'aria-label': 'Gallery',
            preferredItemSize: asNumber(preferredItemSize),
            itemSize: asNumber(itemSize),
            itemSpacing: asNumber(itemSpacing),
            minSmallItemSize: asNumber(minSmallItemSize),
            maxSmallItemSize: asNumber(maxSmallItemSize),
            className: vertical ? 'h-[360px] w-[220px]' : 'h-[200px]',
          },
          Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className={`flex items-end p-4 text-title-medium ${aspect ? SLIDE_ASPECTS[index % SLIDE_ASPECTS.length] : 'size-full'} ${SLIDE_TONES[index % SLIDE_TONES.length]}`}
            >
              {index + 1}
            </div>
          )),
        ),
      );
    },
    defaultProps: {
      variant: 'multi-browse',
      orientation: 'horizontal',
      heroAlignment: 'start',
      snap: 'none',
      preferredItemSize: 186,
      itemSize: 240,
      itemSpacing: 8,
      minSmallItemSize: 40,
      maxSmallItemSize: 56,
    },
    surfacedProps: [
      'variant',
      'orientation',
      'heroAlignment',
      'snap',
      'preferredItemSize',
      'itemSize',
      'itemSpacing',
      'minSmallItemSize',
      'maxSmallItemSize',
    ],
    notControlled: {
      contentPadding:
        'An object of start, end and cross padding, whose defaults change with the variant.',
      disabledIndexes:
        'A list of item indexes, which only matters with `onAction`; see Items that open something.',
    },
    codeSlots: { 'aria-label': '"Gallery"', className: '"h-[200px]"' },
    codeChildren:
      '<img src="/photos/harbour.jpg" alt="Harbour at dawn" />\n  <img src="/photos/market.jpg" alt="Flower market" />\n  <img src="/photos/ridge.jpg" alt="Ridge walk" />\n  <img src="/photos/lake.jpg" alt="Lake in winter" />',
  },
  badge: {
    component: 'Badge',
    notRendered: {
      BadgedBox:
        "Places the badge on the preview's icon; it takes only the badge, its content and classes.",
    },
    render: ({ max, label }) => {
      const props = { max: asNumber(max), label: label || undefined };
      return createElement(
        'div',
        { className: 'flex items-center gap-8 text-on-surface-variant' },
        <BadgedBox key="icon" badge={createElement(BadgeAny, props, 120)}>
          <span className="size-6">
            <NotificationsIcon />
          </span>
        </BadgedBox>,
        createElement(BadgeAny, { key: 'badge', ...props }, 120),
      );
    },
    defaultProps: { max: 999, label: '' },
    surfacedProps: ['max', 'label'],
    initialState: { max: 99, label: '120 new notifications' },
    codeChildren: '{120}',
  },
  divider: {
    component: 'Divider',
    componentSwitch: {
      control: 'divider',
      components: { plain: 'Divider', labeled: 'LabeledDivider' },
    },
    render: ({ divider, ...props }) =>
      divider === 'labeled'
        ? createElement(
            'div',
            { className: 'w-60 text-body-medium text-on-surface' },
            createElement(LabeledDividerAny, { key: 'd', ...props }, 'Or'),
          )
        : props.orientation === 'vertical'
          ? createElement(
              'div',
              { className: 'flex h-16 items-center gap-4 text-body-medium text-on-surface' },
              <span key="a">One</span>,
              createElement(DividerAny, { key: 'd', ...props }),
              <span key="b">Two</span>,
            )
          : createElement(
              'div',
              { className: 'w-60 text-body-medium text-on-surface' },
              createElement(DividerAny, { key: 'd', ...props }),
            ),
    defaultProps: { orientation: 'horizontal', inset: 'none', decorative: false },
    surfacedProps: ['divider', 'orientation', 'inset', 'decorative'],
    initialState: { orientation: 'horizontal', inset: 'none' },
    codeChildren: (values) => (values.divider === 'labeled' ? 'Or' : ''),
  },
};
