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
  SideSheet,
  Tooltip,
  TooltipTrigger,
} from '@windmorph/react';
import { createElement } from 'react';
import {
  ArrowBackIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  ExpandMoreIcon,
  NotificationsIcon,
  SendIcon,
  StarIcon,
} from '../../icons';
import { DENSITY_OPTIONS, type PlaygroundDescriptor, asDensity, loose } from './shared';

const CardAny = loose(Card);
const ListAny = loose(List);
const DividerAny = loose(Divider);
const LabeledDividerAny = loose(LabeledDivider);
const ListItemAny = loose(ListItem);
const DialogAny = loose(Dialog);
const MenuAny = loose(Menu);
const TooltipAny = loose(Tooltip);
const BottomSheetAny = loose(BottomSheet);
const SideSheetAny = loose(SideSheet);
const CarouselAny = loose(Carousel);
const BadgeAny = loose(Badge);

const DELETE = '<DeleteIcon />';
const CLOSE = '<CloseIcon />';
const EXPAND_MORE = '<ExpandMoreIcon />';

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

/** The list's rows: people, with their roles as supporting text. */
const CONTACTS = [
  { key: 'alex', name: 'Alex Morgan', role: 'Product designer' },
  { key: 'priya', name: 'Priya Shah', role: 'Engineering lead' },
  { key: 'sam', name: 'Sam Okafor', role: 'Research' },
];

/** The carousel's photos, as the snippet names them, standing in as coloured panels. */
const PHOTOS = [
  'Harbour at dawn',
  'Flower market',
  'Ridge walk',
  'Lake in winter',
  'Old town',
  'Night ferry',
  'Vineyard',
  'Coastal path',
];

/** An enum control's "unset" option, which leaves the prop out. */
const NONE = 'none';
const unlessNone = (value: unknown) => (value === NONE ? undefined : value);
const asNumber = (value: unknown) => (value == null || value === '' ? undefined : Number(value));

/** A line-limit control's value as the snippet's number, or nothing while unset. */
const lineLimit = (value: unknown) => (value === NONE || value == null ? null : String(value));

/**
 * `required` only applies to a radio list (one with a `value`): turning it on picks the first
 * contact, and going back to a plain list turns it off.
 */
export function adjustListRadio(
  values: Record<string, unknown>,
  changed: string,
): Record<string, unknown> {
  if (changed === 'required' && values.required === true && values.value === NONE) {
    return { ...values, value: CONTACTS[0]!.key };
  }
  if (changed === 'value' && values.value === NONE) return { ...values, required: false };
  return values;
}

/**
 * `instant` skips the popover's motion; a sheet keeps its slide, so the snippet never pairs
 * them: choosing the sheet turns `instant` off, and turning `instant` on with the sheet goes
 * back to the popover (`auto` keeps it, since it's a popover on wider windows).
 */
export function adjustMenuInstant(
  values: Record<string, unknown>,
  changed: string,
): Record<string, unknown> {
  if (changed === 'presentation' && values.presentation === 'sheet') {
    return { ...values, instant: false };
  }
  if (changed === 'instant' && values.instant === true && values.presentation === 'sheet') {
    return { ...values, presentation: 'popover' };
  }
  return values;
}

/** Playgrounds for the M3 containment and overlay components, by page slug. */
export const CONTAINMENT_M3_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  card: {
    component: 'Card',
    render: ({ href, ...props }) =>
      createElement(
        CardAny,
        { ...props, ...(href ? { href } : {}), className: 'w-full max-w-xs' },
        <div key="body" className="flex flex-col gap-1 p-4">
          <h3 className="text-title-medium text-on-surface">Alpine hut trail</h3>
          <p className="text-body-medium text-on-surface-variant">
            A guided three-day walk with two nights in mountain huts, from €320.
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
    codeChildren:
      '<div className="flex flex-col gap-1 p-4">\n    <h3 className="text-title-medium text-on-surface">Alpine hut trail</h3>\n    <p className="text-body-medium text-on-surface-variant">\n      A guided three-day walk with two nights in mountain huts, from €320.\n    </p>\n  </div>',
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
      closedBy: 'closerequest',
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
      'closedBy',
      'quick',
      'transition',
    ],
    enumOptions: { role: ['alertdialog', 'dialog'], transition: ['reveal', 'scale'] },
    // `closedBy` defaults by role: Escape only for an alert dialog, Escape or a press outside for
    // a plain one. A role change resets it to the new default, and the snippet writes it only
    // when it differs.
    codeDefaults: (values) => ({
      closedBy: values.role === 'alertdialog' ? 'closerequest' : 'any',
    }),
    // `origin` grows only a full-screen dialog out of the trigger, so turning it on makes a
    // basic dialog full screen.
    adjust: (values, changed) => {
      if (changed === 'role') {
        return { ...values, closedBy: values.role === 'alertdialog' ? 'closerequest' : 'any' };
      }
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
    // The trigger opens and closes the dialog, so the snippet leaves `open` to it.
    codeSlots: { open: () => null },
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
    adjust: adjustMenuInstant,
    notControlled: {
      deselectable:
        "Applies only to a menu with `selectionMode`, which the preview's action menu doesn't have; the Selection example shows it.",
    },
    enumOptions: {
      placement: ['bottom start', 'bottom end', 'top start', 'top end', 'start', 'end'],
      density: ['0', '-1', '-2', '-3'],
      presentation: ['popover', 'sheet', 'auto'],
    },
    // `density` is a number (0 to -3), so the snippet writes it as one.
    controlKinds: { density: 'number' },
    numberRanges: {
      offset: { min: 0, max: 24 },
      containerPadding: { min: 0, max: 48, step: 4 },
    },
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
    codeWrap: {
      before:
        '<TooltipTrigger>\n  <IconButton\n    variant="standard"\n    tooltip={false}\n    icon={<NotificationsIcon />}\n    aria-label="Notifications"\n  />',
      after: '</TooltipTrigger>',
    },
    codeChildren: 'Turn on notifications',
  },
  sheets: {
    component: 'BottomSheet',
    componentSwitch: { control: 'sheet', components: { bottom: 'BottomSheet', side: 'SideSheet' } },
    controlDescriptions: {
      sheet: 'Which sheet the playground shows: a bottom sheet or a side sheet.',
    },
    notControlled: {
      detent:
        'Controlled by the app; the `defaultDetent` control picks where the sheet starts, and its handle moves it from there.',
    },
    notRendered: {
      SheetTrigger:
        'Opens the sheet from a button; the preview opens it from the `open` control instead.',
    },
    // In a bounded frame: a standard sheet is placed in it, and a modal one opens over the
    // window from the button.
    render: (
      {
        sheet,
        open,
        closeIcon,
        collapseIcon,
        backIcon,
        onBack,
        actions,
        footer,
        title,
        peekHeight,
        ...props
      },
      update,
    ) => {
      const side = sheet === 'side';
      const standard = props.variant === 'standard';
      const content = (
        <div
          key="content"
          className={side ? 'flex flex-col gap-2' : 'flex flex-col gap-2 px-6 pb-6'}
        >
          {!side && <p className="text-title-medium text-on-surface">Now playing</p>}
          <p className="text-body-medium text-on-surface-variant">
            Track details and controls stay at hand while the page scrolls.
          </p>
        </div>
      );
      const shared = {
        // A new variant, or a new starting detent, starts afresh.
        key: `${String(sheet)}-${String(props.variant)}-${String(props.defaultDetent)}`,
        ...props,
        open: Boolean(open),
        onOpenChange: (next: boolean) => update('open', next),
        ...(closeIcon === true && { closeIcon: <CloseIcon /> }),
      };
      return createElement(
        'div',
        {
          className: `relative h-[320px] w-full max-w-md overflow-hidden rounded-corner-large border border-outline-variant${side && standard ? ' flex' : ''}`,
        },
        <div key="page" className="flex flex-1 flex-col items-start gap-3 p-6">
          <p className="text-body-large text-on-surface">Midnight Drive · 12 songs</p>
          <Button variant="tonal" onPress={() => update('open', !(open === true))}>
            {side ? 'Show details' : 'Show player'}
          </Button>
        </div>,
        side
          ? createElement(
              SideSheetAny,
              {
                ...shared,
                title: title === '' || title == null ? undefined : title,
                ...((title === '' || title == null) && { 'aria-label': 'Details' }),
                ...(onBack === true && { onBack: () => update('open', false) }),
                ...(backIcon === true && { backIcon: <ArrowBackIcon /> }),
                ...(actions === true && {
                  actions: <Button variant="text">Edit</Button>,
                }),
                ...(footer === true && {
                  footer: (
                    <Button variant="filled" onPress={() => update('open', false)}>
                      Save
                    </Button>
                  ),
                }),
              },
              content,
            )
          : createElement(
              BottomSheetAny,
              {
                ...shared,
                'aria-label': 'Now playing',
                peekHeight: asNumber(peekHeight),
                ...(collapseIcon === true && { collapseIcon: <ExpandMoreIcon /> }),
                ...(standard && { classNames: { container: 'absolute' } }),
              },
              content,
            ),
      );
    },
    defaultProps: {
      variant: 'modal',
      open: false,
      dragHandle: true,
      skipPartiallyExpanded: false,
      peekHeight: 56,
      defaultDetent: 'collapsed',
      closedBy: 'any',
      closeButton: true,
      closeIcon: false,
      collapseIcon: false,
      detached: false,
      onBack: false,
      backIcon: false,
      actions: false,
      footer: false,
      footerDivider: false,
      divider: true,
    },
    surfacedProps: [
      'sheet',
      'variant',
      'open',
      'title',
      'detached',
      'dragHandle',
      'skipPartiallyExpanded',
      'peekHeight',
      'defaultDetent',
      'closedBy',
      'closeButton',
      'onBack',
      'actions',
      'footer',
      'footerDivider',
      'divider',
      'closeIcon',
      'collapseIcon',
      'backIcon',
    ],
    initialState: { title: 'Details' },
    controlKinds: {
      title: 'string',
      closeIcon: 'boolean',
      collapseIcon: 'boolean',
      backIcon: 'boolean',
      onBack: 'boolean',
      actions: 'boolean',
      footer: 'boolean',
    },
    groups: { onBack: 'content' },
    toggledSlots: {
      closeIcon: CLOSE,
      collapseIcon: EXPAND_MORE,
      backIcon: '<ArrowBackIcon />',
      onBack: "() => console.log('Back')",
      actions: '<Button variant="text">Edit</Button>',
      footer: '<Button variant="filled">Save</Button>',
    },
    numberRanges: { peekHeight: { min: 32, max: 240, step: 8 } },
    // A modal sheet's trigger opens and closes it; a standard sheet keeps `open` in state,
    // toggled by a button beside it.
    codeState: (values): Record<string, string> =>
      values.variant === 'standard' ? { open: `useState(${values.open === true})` } : {},
    codeSlots: {
      open: (values) => (values.variant === 'standard' ? 'open' : null),
      onOpenChange: (values) => (values.variant === 'standard' ? 'setOpen' : null),
      // A side sheet with a title is named by it; the bottom sheet's needs a name.
      'aria-label': (values) =>
        values.sheet === 'side' && values.title
          ? null
          : values.sheet === 'side'
            ? '"Details"'
            : '"Now playing"',
    },
    importMembers: ['Button', 'SheetTrigger'],
    // A modal sheet opens from a button; a standard one sits in the layout, open to begin with.
    codeWrap: (values) =>
      values.variant === 'standard'
        ? {
            before: `<div className="flex">\n  <Button variant="tonal" onPress={() => setOpen(!open)}>\n    ${values.sheet === 'side' ? 'Show details' : 'Show player'}\n  </Button>`,
            after: '</div>',
          }
        : {
            before: `<SheetTrigger>\n  <Button variant="tonal">${values.sheet === 'side' ? 'Show details' : 'Show player'}</Button>`,
            after: '</SheetTrigger>',
          },
    codeChildren: (values) =>
      values.sheet === 'side'
        ? '<p className="text-body-medium text-on-surface-variant">Track details and controls stay at hand while the page scrolls.</p>'
        : '<div className="flex flex-col gap-2 px-6 pb-6">\n    <p className="text-title-medium text-on-surface">Now playing</p>\n    <p className="text-body-medium text-on-surface-variant">Track details and controls stay at hand while the page scrolls.</p>\n  </div>',
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
    render: ({
      value,
      dividers,
      disabledKeys,
      headlineLines,
      supportingTextLines,
      density,
      ...props
    }) =>
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
            disabledKeys: disabledKeys === true ? ['priya'] : undefined,
            headlineLines: asNumber(unlessNone(headlineLines)),
            supportingTextLines: asNumber(unlessNone(supportingTextLines)),
            density: asDensity(density),
          },
          ...CONTACTS.map(({ key, name, role }) =>
            createElement(ListItemAny, { key, value: key, supportingText: role }, name),
          ),
        ),
      ),
    defaultProps: {
      variant: 'standard',
      selectionMode: 'none',
      deselectable: true,
      disabledKeys: false,
      value: NONE,
      required: false,
      disabled: false,
      controlPlacement: 'start',
      dividers: NONE,
      selectionIndicator: true,
      headlineLines: NONE,
      supportingTextLines: NONE,
      density: 0,
    },
    surfacedProps: [
      'variant',
      'selectionMode',
      'deselectable',
      'disabledKeys',
      'value',
      'required',
      'disabled',
      'controlPlacement',
      'dividers',
      'selectionIndicator',
      'headlineLines',
      'supportingTextLines',
      'density',
    ],
    initialState: { variant: 'segmented' },
    adjust: adjustListRadio,
    // Line limits are unset (no limit) or 1 to 3.
    enumOptions: {
      ...DENSITY_OPTIONS,
      value: [NONE, ...CONTACTS.map(({ key }) => key)],
      dividers: [NONE, 'full', 'inset'],
      headlineLines: [NONE, '1', '2', '3'],
      supportingTextLines: [NONE, '1', '2', '3'],
    },
    controlKinds: { disabledKeys: 'boolean', density: 'number' },
    toggledSlots: { disabledKeys: "['priya']" },
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
    codeSlots: {
      'aria-label': '"Contacts"',
      // The line limits are numbers, written only when set.
      headlineLines: (values) => lineLimit(values.headlineLines),
      supportingTextLines: (values) => lineLimit(values.supportingTextLines),
    },
    // Items carry a `value` only in a radio list.
    codeChildren: (values) =>
      CONTACTS.map(
        ({ key, name, role }) =>
          `<ListItem key="${key}"${values.value === NONE ? '' : ` value="${key}"`} supportingText="${role}">\n    ${name}\n  </ListItem>`,
      ).join('\n  '),
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
          PHOTOS.map((photo, index) => (
            <div
              key={photo}
              role="img"
              aria-label={photo}
              className={`flex items-end p-4 text-title-small ${aspect ? SLIDE_ASPECTS[index % SLIDE_ASPECTS.length] : 'size-full'} ${SLIDE_TONES[index % SLIDE_TONES.length]}`}
            >
              <span aria-hidden="true" className="line-clamp-2">
                {photo}
              </span>
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
    numberRanges: {
      preferredItemSize: { min: 80, max: 320, step: 2 },
      itemSize: { min: 120, max: 360, step: 4 },
      itemSpacing: { min: 0, max: 32 },
      minSmallItemSize: { min: 24, max: 80 },
      maxSmallItemSize: { min: 40, max: 120 },
    },
    notControlled: {
      contentPadding:
        'An object of start, end and cross padding, whose defaults change with the variant.',
      disabledIndexes:
        'A list of item indexes, which only matters with `onAction`; see Items that open something.',
    },
    codeSlots: { 'aria-label': '"Gallery"', className: '"h-[200px]"' },
    codeChildren: PHOTOS.slice(0, 4)
      .map(
        (photo) =>
          `<img src="/photos/${photo.toLowerCase().replaceAll(' ', '-')}.jpg" alt="${photo}" />`,
      )
      .join('\n  '),
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
    numberRanges: { max: { min: 9, max: 999 } },
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
              <span key="a">Reply</span>,
              createElement(DividerAny, { key: 'd', ...props }),
              <span key="b">Forward</span>,
            )
          : createElement(
              'div',
              { className: 'flex w-60 flex-col gap-3 text-body-medium text-on-surface' },
              <span key="a">Delivery address</span>,
              createElement(DividerAny, { key: 'd', ...props }),
              <span key="b">Payment method</span>,
            ),
    defaultProps: { orientation: 'horizontal', inset: 'none', decorative: true },
    surfacedProps: ['divider', 'orientation', 'inset', 'decorative'],
    initialState: { orientation: 'horizontal', inset: 'none' },
    codeChildren: (values) => (values.divider === 'labeled' ? 'Or' : ''),
  },
};
