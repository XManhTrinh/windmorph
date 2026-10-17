'use client';

import {
  ChipSet,
  ExtendedFab,
  FilterChip,
  DockedToolbar,
  FloatingToolbar,
  IconButton,
  NavigationBar,
  NavigationBarItem,
  NavigationRail,
  NavigationRailItem,
  SearchBar,
  Tab,
  Tabs,
  ToolbarFab,
  TopAppBar,
} from '@windmorph/react';
import { Link } from '@windmorph/react-pro';
import { createElement, useRef } from 'react';
import {
  ArrowBackIcon,
  CloseIcon,
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  FormatUnderlinedIcon,
  HomeIcon,
  MenuIcon,
  MicIcon,
  MoreVertIcon,
  SearchIcon,
  SendIcon,
  StarIcon,
} from '../../icons';
import {
  DENSITY_OPTIONS,
  type PlaygroundDescriptor,
  type PlaygroundUpdate,
  asDensity,
  loose,
} from './shared';

const TabsAny = loose(Tabs);
const TabAny = loose(Tab);
const LinkAny = loose(Link);
const NavigationRailAny = loose(NavigationRail);
const NavigationBarAny = loose(NavigationBar);
const TopAppBarAny = loose(TopAppBar);
const SearchBarAny = loose(SearchBar);
const FloatingToolbarAny = loose(FloatingToolbar);
const DockedToolbarAny = loose(DockedToolbar);
const ToolbarFabAny = loose(ToolbarFab);

/** The segmented control's value for "leave the prop unset", so the component decides. */
const UNSET = 'auto';

/** Drops a prop whose control is set to `value`, so the component uses its own default. */
function unset(props: Record<string, unknown>, name: string, value: string = UNSET) {
  return props[name] === value ? { ...props, [name]: undefined } : props;
}

const DESTINATIONS = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'search', label: 'Search', icon: <SearchIcon /> },
  { id: 'starred', label: 'Starred', icon: <StarIcon /> },
  { id: 'sent', label: 'Sent', icon: <SendIcon /> },
];

/** An inbox to scroll under the bars that respond to scrolling: sender and subject. */
const INBOX = [
  ['Alex Morgan', 'Lunch on Friday?'],
  ['Priya Shah', 'Design review notes'],
  ['Sam Okafor', 'Flight confirmation'],
  ['Zoë Laurent', 'Photos from the weekend'],
  ['Jonas Müller', 'Invoice for March'],
  ['Mei Tanaka', 'Team offsite agenda'],
  ['Omar Haddad', 'Re: Quarterly report'],
  ['Lena Novak', 'Book club this Thursday'],
  ['Alex Morgan', 'Re: Lunch on Friday?'],
  ['Priya Shah', 'Launch checklist'],
  ['Sam Okafor', 'Your receipt'],
  ['Zoë Laurent', 'Concert tickets'],
];

/** Scroll content for the previews of bars that respond to scrolling. */
function Inbox() {
  return INBOX.map(([sender, subject], index) => (
    <p key={index} className="flex flex-col px-4 py-3">
      <span className="text-body-large text-on-surface">{sender}</span>
      <span className="text-body-medium text-on-surface-variant">{subject}</span>
    </p>
  ));
}

/** The rail in a bounded frame; the menu button and the modal sheet set `expanded` back. */
function RailPreview({
  header,
  update,
  ...props
}: Record<string, unknown> & { update: PlaygroundUpdate }) {
  return (
    <div className="flex h-[420px] w-full overflow-hidden rounded-corner-large border border-outline-variant">
      {createElement(
        NavigationRailAny,
        {
          ...props,
          'aria-label': 'Folders',
          onExpandedChange: (next: boolean) => update('expanded', next),
          ...(header === true && {
            header: ({ expanded, toggle }: { expanded: boolean; toggle: () => void }) => (
              <>
                <IconButton
                  variant="standard"
                  icon={<MenuIcon />}
                  aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
                  onPress={toggle}
                />
                <ExtendedFab
                  icon={<EditIcon />}
                  expanded={expanded}
                  elevation="flat"
                  className="mt-1"
                >
                  Compose
                </ExtendedFab>
              </>
            ),
          }),
        },
        DESTINATIONS.map(({ id, label, icon }) => (
          <NavigationRailItem key={id} icon={icon} selected={id === 'home'}>
            {label}
          </NavigationRailItem>
        )),
      )}
      <div className="flex-1 bg-surface-container-low p-4 text-body-large text-on-surface-variant">
        {props.modal === true && props.hideOnCollapse === true && (
          // A rail hidden while collapsed needs a way in from the page.
          <IconButton
            variant="standard"
            icon={<MenuIcon />}
            aria-label="Open navigation"
            onPress={() => update('expanded', true)}
          />
        )}
      </div>
    </div>
  );
}

/** The bar at the bottom of a scrolling frame, so `hide-on-scroll` has something to follow. */
function BarPreview(props: Record<string, unknown>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div className="h-[320px] w-[412px] max-w-full overflow-hidden rounded-corner-large border border-outline-variant">
      <div
        ref={scrollRef}
        tabIndex={0}
        role="region"
        aria-label="Messages"
        className="h-full overflow-y-auto"
      >
        <Inbox />
        {createElement(
          NavigationBarAny,
          { ...unset(props, 'arrangement'), 'aria-label': 'Mail', scrollRef },
          DESTINATIONS.map(({ id, label, icon }) => (
            <NavigationBarItem key={id} icon={icon} selected={id === 'home'}>
              {label}
            </NavigationBarItem>
          )),
        )}
      </div>
    </div>
  );
}

/** The top app bar's `bottom` row: filter chips, with the row's own padding. */
const FILTER_CHIPS = (
  <ChipSet aria-label="Filter messages" layout="scroll" className="px-[8px] pb-[8px]">
    <FilterChip value="unread">Unread</FilterChip>
    <FilterChip value="starred">Starred</FilterChip>
    <FilterChip value="attachments">Attachments</FilterChip>
  </ChipSet>
);

/** The bar over its own scroll container, so each scroll behaviour can be tried. */
function TopAppBarPreview({ navigationIcon, actions, bottom, ...props }: Record<string, unknown>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      tabIndex={0}
      role="region"
      aria-label="Messages"
      className="h-[320px] w-[412px] max-w-full overflow-y-auto rounded-corner-large border border-outline-variant"
    >
      {createElement(TopAppBarAny, {
        ...unset(props, 'scrollBehavior', 'none'),
        scrollRef,
        ...(navigationIcon === true && {
          navigationIcon: <IconButton icon={<ArrowBackIcon />} aria-label="Back" />,
        }),
        ...(actions === true && {
          actions: (
            <>
              <IconButton icon={<StarIcon />} aria-label="Favourite" />
              <IconButton icon={<MoreVertIcon />} aria-label="More" />
            </>
          ),
        }),
        ...(bottom === true && { bottom: FILTER_CHIPS }),
      })}
      <Inbox />
    </div>
  );
}

const SUGGESTIONS = ['Holiday photos', 'Flight confirmation', 'Invoice March', 'Team lunch'];

/** The search view's suggestions, filtered by the query. */
function Suggestions({ query, onPick }: { query: string; onPick: (value: string) => void }) {
  const items = SUGGESTIONS.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="flex flex-col py-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onPick(item)}
          className="flex h-14 items-center gap-4 px-4 text-start text-body-large text-on-surface outline-none hover:bg-on-surface/8 focus-visible:bg-on-surface/10"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

const FORMATTING = [
  <IconButton key="bold" toggle icon={<FormatBoldIcon />} aria-label="Bold" />,
  <IconButton key="italic" toggle icon={<FormatItalicIcon />} aria-label="Italic" />,
  <IconButton key="underline" toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />,
];

/** The toolbar's own props, without the `fab.*` controls its FAB reads. */
function ownProps(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([name]) => !name.includes('.')));
}

/** The toolbar FAB's props from its `fab.*` controls, as the live element takes them. */
function toolbarFabProps(values: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(values['fab.color'] !== UNSET && { color: values['fab.color'] }),
    ...(values['fab.expandedIcon'] === true && { expandedIcon: <CloseIcon /> }),
    iconTransition: values['fab.iconTransition'],
    elevation: values['fab.elevation'],
    tooltip: values['fab.tooltip'],
    dragged: values['fab.dragged'],
    ...(typeof values['fab.href'] === 'string' && { href: '#' }),
  };
}

/** The toolbar's FAB, live. */
function toolbarFab(values: Record<string, unknown>) {
  return <ToolbarFabAny {...toolbarFabProps(values)} icon={<EditIcon />} aria-label="Compose" />;
}

/** The toolbar's FAB in the snippet: only the props that differ from its defaults. */
function toolbarFabCode(values: Record<string, unknown>): string {
  const attrs = [
    values['fab.color'] !== UNSET && `color="${String(values['fab.color'])}"`,
    'icon={<EditIcon />}',
    values['fab.expandedIcon'] === true && 'expandedIcon={<CloseIcon />}',
    values['fab.expandedIcon'] === true &&
      values['fab.iconTransition'] === 'rotate' &&
      'iconTransition="rotate"',
    values['fab.elevation'] !== 'default' && `elevation="${String(values['fab.elevation'])}"`,
    values['fab.tooltip'] === false && 'tooltip={false}',
    values['fab.dragged'] === true && 'dragged',
    typeof values['fab.href'] === 'string' && `href="${values['fab.href']}"`,
    'aria-label="Compose"',
  ].filter(Boolean);
  return `<ToolbarFab ${attrs.join(' ')} />`;
}

/**
 * A floating toolbar holds leading and trailing content or a FAB, never both (the types say
 * so): turning one on turns the other off, and the FAB's own controls turn the FAB on.
 */
function adjustToolbarContent(
  values: Record<string, unknown>,
  changed: string,
): Record<string, unknown> {
  const fabControl = changed === 'fabPlacement' || changed.startsWith('fab.');
  if ((changed === 'fab' && values.fab === true) || fabControl) {
    return { ...values, fab: true, leading: false, trailing: false };
  }
  if ((changed === 'leading' || changed === 'trailing') && values[changed] === true) {
    return { ...values, fab: false, fabPlacement: 'end' };
  }
  if (changed === 'fab' && values.fab === false) return { ...values, fabPlacement: 'end' };
  return values;
}

/**
 * `hideOnCollapse` only applies to a modal rail, so turning it on makes the rail modal and
 * turning `modal` off turns it off: the snippet never carries a prop that does nothing.
 */
export function adjustRailModal(
  values: Record<string, unknown>,
  changed: string,
): Record<string, unknown> {
  if (changed === 'hideOnCollapse' && values.hideOnCollapse === true) {
    return { ...values, modal: true };
  }
  if (changed === 'modal' && values.modal === false) return { ...values, hideOnCollapse: false };
  return values;
}

/** Playgrounds for Navigation, by page slug. */
export const NAVIGATION_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'navigation-rail': {
    component: 'NavigationRail',
    notRendered: {
      NavigationRailItem:
        "The destinations, composed in the preview as the rail's children; their icons, badges and links are per destination, as the examples show.",
    },
    render: (props, update) => <RailPreview {...props} update={update} />,
    defaultProps: {
      expanded: false,
      modal: false,
      hideOnCollapse: false,
      header: false,
      itemAlignment: 'top',
      divider: false,
      indicatorMotion: 'expand',
    },
    surfacedProps: [
      'expanded',
      'modal',
      'hideOnCollapse',
      'header',
      'itemAlignment',
      'divider',
      'indicatorMotion',
    ],
    initialState: { header: true },
    adjust: adjustRailModal,
    enumOptions: { itemAlignment: ['top', 'center'], indicatorMotion: ['expand', 'slide'] },
    controlKinds: { header: 'boolean' },
    toggledSlots: {
      header:
        '({ expanded, toggle }) => (\n    <>\n      <IconButton\n        variant="standard"\n        icon={<MenuIcon />}\n        aria-label={expanded ? \'Collapse navigation\' : \'Expand navigation\'}\n        onPress={toggle}\n      />\n      <ExtendedFab icon={<EditIcon />} expanded={expanded} elevation="flat">\n        Compose\n      </ExtendedFab>\n    </>\n  )',
    },
    importMembers: ['NavigationRailItem', 'IconButton', 'ExtendedFab'],
    codeSlots: { 'aria-label': '"Folders"' },
    codeState: { current: "useState('home')" },
    codeChildren: [
      ['home', 'Home', 'HomeIcon'],
      ['search', 'Search', 'SearchIcon'],
    ]
      .map(
        ([id, label, icon]) =>
          `<NavigationRailItem\n    icon={<${icon} />}\n    selected={current === '${id}'}\n    onPress={() => setCurrent('${id}')}\n  >\n    ${label}\n  </NavigationRailItem>`,
      )
      .join('\n  '),
  },
  'navigation-bar': {
    component: 'NavigationBar',
    notRendered: {
      NavigationBarItem:
        "The destinations, composed in the preview as the bar's children; their icons, badges and links are per destination, as the examples show.",
    },
    render: (props) => <BarPreview {...props} />,
    defaultProps: { iconPlacement: 'top', arrangement: UNSET, scrollBehavior: 'pinned' },
    surfacedProps: ['iconPlacement', 'arrangement', 'scrollBehavior'],
    enumOptions: {
      iconPlacement: ['top', 'start'],
      arrangement: [UNSET, 'equal', 'centered'],
      scrollBehavior: ['pinned', 'hide-on-scroll'],
    },
    importMembers: ['NavigationBarItem'],
    codeSlots: { 'aria-label': '"Mail"' },
    codeState: { current: "useState('home')" },
    codeChildren: [
      ['home', 'Home', 'HomeIcon'],
      ['search', 'Search', 'SearchIcon'],
    ]
      .map(
        ([id, label, icon]) =>
          `<NavigationBarItem\n    icon={<${icon} />}\n    selected={current === '${id}'}\n    onPress={() => setCurrent('${id}')}\n  >\n    ${label}\n  </NavigationBarItem>`,
      )
      .join('\n  '),
  },
  tabs: {
    component: 'Tabs',
    notRendered: {
      Tab: "The tabs, composed in the preview as the tab row's children; their icons and badges are per tab, as the examples show.",
    },
    render: (props) =>
      createElement(
        TabsAny,
        {
          ...props,
          density: asDensity(props.density),
          'aria-label': 'Inbox',
          className: 'w-full max-w-[480px]',
        },
        createElement(
          TabAny,
          { key: 'all', title: 'All', icon: <StarIcon /> },
          <p key="p" className="p-4 text-body-large text-on-surface-variant">
            Everything in one place.
          </p>,
        ),
        createElement(
          TabAny,
          { key: 'sent', title: 'Sent', icon: <SendIcon /> },
          <p key="p" className="p-4 text-body-large text-on-surface-variant">
            Messages you sent.
          </p>,
        ),
        createElement(
          TabAny,
          { key: 'drafts', title: 'Drafts', icon: <EditIcon /> },
          <p key="p" className="p-4 text-body-large text-on-surface-variant">
            Unfinished messages.
          </p>,
        ),
      ),
    defaultProps: {
      variant: 'primary',
      scrollable: false,
      iconPlacement: 'top',
      align: 'stretch',
      swipeable: false,
      keyboardActivation: 'manual',
      density: 0,
      disabled: false,
    },
    surfacedProps: [
      'variant',
      'scrollable',
      'iconPlacement',
      'align',
      'density',
      'swipeable',
      'keyboardActivation',
      'disabled',
    ],
    initialState: { variant: 'primary' },
    notControlled: {
      value:
        "The selected tab's `key`, which the preview's tabs set as you press them; the Secondary example starts on its second tab with `defaultValue`.",
      defaultValue:
        'The tab selected at first: the preview starts on its first tab, as tabs do by default.',
    },
    enumOptions: DENSITY_OPTIONS,
    controlKinds: { density: 'number' },
    importMembers: ['Tab'],
    codeSlots: { 'aria-label': '"Inbox"' },
    codeChildren:
      '<Tab key="all" title="All" icon={<StarIcon />}>\n    <p>Everything in one place.</p>\n  </Tab>\n  <Tab key="sent" title="Sent" icon={<SendIcon />}>\n    <p>Messages you sent.</p>\n  </Tab>\n  <Tab key="drafts" title="Drafts" icon={<EditIcon />}>\n    <p>Unfinished messages.</p>\n  </Tab>',
  },
  'top-app-bar': {
    component: 'TopAppBar',
    render: (props) => <TopAppBarPreview {...props} />,
    defaultProps: {
      variant: 'small',
      title: '',
      subtitle: '',
      titleAlign: 'start',
      navigationIcon: false,
      actions: false,
      bottom: false,
      scrollBehavior: 'none',
      scrolledColor: 'container',
    },
    surfacedProps: [
      'variant',
      'title',
      'subtitle',
      'titleAlign',
      'navigationIcon',
      'actions',
      'bottom',
      'scrollBehavior',
      'scrolledColor',
    ],
    initialState: {
      variant: 'medium',
      title: 'Inbox',
      subtitle: '24 messages',
      navigationIcon: true,
      actions: true,
      scrollBehavior: 'exit-until-collapsed',
    },
    enumOptions: {
      variant: ['small', 'medium', 'large'],
      titleAlign: ['start', 'center'],
      scrollBehavior: ['none', 'pinned', 'enter-always', 'exit-until-collapsed'],
      scrolledColor: ['container', 'transparent'],
    },
    controlKinds: {
      title: 'string',
      subtitle: 'string',
      navigationIcon: 'boolean',
      actions: 'boolean',
      bottom: 'boolean',
    },
    toggledSlots: {
      navigationIcon: '<IconButton icon={<ArrowBackIcon />} aria-label="Back" />',
      actions:
        '(\n    <>\n      <IconButton icon={<StarIcon />} aria-label="Favourite" />\n      <IconButton icon={<MoreVertIcon />} aria-label="More" />\n    </>\n  )',
      bottom:
        '(\n    <ChipSet aria-label="Filter messages" layout="scroll" className="px-[8px] pb-[8px]">\n      <FilterChip value="unread">Unread</FilterChip>\n      <FilterChip value="starred">Starred</FilterChip>\n      <FilterChip value="attachments">Attachments</FilterChip>\n    </ChipSet>\n  )',
    },
    importMembers: ['ChipSet', 'FilterChip', 'IconButton'],
  },
  search: {
    component: 'SearchBar',
    notRendered: {
      SearchAppBar:
        'A top app bar holding the search bar, whose scroll behaviour needs a scrolling page; the App bar example shows it.',
    },
    render: ({ leadingIcon, trailingIcon, value, ...props }, update) => {
      const query = typeof value === 'string' ? value : '';
      return (
        <div className="w-full max-w-[360px]">
          {createElement(
            SearchBarAny,
            {
              ...props,
              'aria-label': 'Search mail',
              className: 'w-full',
              value: query,
              onChange: (next: string) => update('value', next),
              onExpandedChange: (next: boolean) => update('expanded', next),
              ...(leadingIcon === true && { leadingIcon: <SearchIcon /> }),
              ...(trailingIcon === true && {
                trailingIcon: (
                  <IconButton variant="standard" icon={<MicIcon />} aria-label="Voice search" />
                ),
              }),
            },
            <Suggestions query={query} onPick={(item) => update('value', item)} />,
          )}
        </div>
      );
    },
    defaultProps: {
      value: '',
      expanded: false,
      view: 'auto',
      placeholder: '',
      leadingIcon: false,
      trailingIcon: false,
      textAlign: 'start',
      resultsAnnouncement: '',
    },
    surfacedProps: [
      'value',
      'expanded',
      'view',
      'placeholder',
      'leadingIcon',
      'trailingIcon',
      'textAlign',
      'resultsAnnouncement',
    ],
    initialState: {
      placeholder: 'Search mail',
      leadingIcon: true,
      trailingIcon: true,
      resultsAnnouncement: 'Suggestions updated',
    },
    enumOptions: { view: ['auto', 'docked', 'full-screen'], textAlign: ['start', 'center'] },
    controlKinds: { leadingIcon: 'boolean', trailingIcon: 'boolean' },
    notControlled: {
      inputProps:
        'Input attributes such as `enterKeyHint`, `autoComplete` or `inputMode`, which change the keyboard and form wiring, nothing the preview shows.',
    },
    toggledSlots: {
      leadingIcon: '<SearchIcon />',
      trailingIcon:
        '<IconButton variant="standard" icon={<MicIcon />} aria-label="Voice search" />',
    },
    importMembers: ['IconButton'],
    codeSlots: { 'aria-label': '"Search mail"' },
    codeChildren: '{/* Suggestions or results, usually a List */}',
  },
  toolbars: {
    component: 'FloatingToolbar',
    componentSwitch: {
      control: 'toolbar',
      components: { floating: 'FloatingToolbar', docked: 'DockedToolbar' },
    },
    render: (values) => {
      const { toolbar, arrangement, leading, trailing, fab, ...props } = ownProps(values);
      if (toolbar === 'docked') {
        return (
          <div className="relative h-[280px] w-full overflow-hidden rounded-corner-large border border-outline-variant bg-surface-container-lowest">
            {createElement(
              DockedToolbarAny,
              {
                arrangement,
                color: props.color,
                visible: props.visible,
                'aria-label': 'Formatting',
                className: 'absolute inset-x-0 bottom-0',
              },
              FORMATTING,
            )}
          </div>
        );
      }
      return (
        <div className="relative flex h-[280px] w-full items-center justify-center overflow-hidden rounded-corner-large border border-outline-variant bg-surface-container-lowest">
          {createElement(
            FloatingToolbarAny,
            {
              ...props,
              'aria-label': 'Formatting',
              ...(leading === true && {
                leading: <IconButton icon={<EditIcon />} aria-label="Edit" />,
              }),
              ...(trailing === true && {
                trailing: <IconButton icon={<DeleteIcon />} aria-label="Delete" />,
              }),
              ...(fab === true && { fab: toolbarFab(values) }),
            },
            FORMATTING,
          )}
        </div>
      );
    },
    defaultProps: {
      orientation: 'horizontal',
      color: 'standard',
      elevated: true,
      expanded: true,
      visible: true,
      exitEdge: 'bottom',
      leading: false,
      trailing: false,
      fab: false,
      fabPlacement: 'end',
      'fab.color': UNSET,
      'fab.expandedIcon': false,
      'fab.iconTransition': 'swap',
      'fab.elevation': 'default',
      'fab.tooltip': true,
      'fab.dragged': false,
      arrangement: 'centered',
    },
    surfacedProps: [
      'toolbar',
      'orientation',
      'color',
      'elevated',
      'expanded',
      'visible',
      'exitEdge',
      'leading',
      'trailing',
      'fab',
      'fabPlacement',
      'fab.color',
      'fab.expandedIcon',
      'fab.iconTransition',
      'fab.elevation',
      'fab.tooltip',
      'fab.dragged',
      'fab.href',
      'arrangement',
    ],
    initialState: { leading: true, trailing: true },
    slotComponents: { fab: 'ToolbarFab' },
    adjust: adjustToolbarContent,
    enumOptions: {
      orientation: ['horizontal', 'vertical'],
      color: ['standard', 'vibrant'],
      exitEdge: ['bottom', 'top', 'start', 'end'],
      fabPlacement: ['end', 'start', 'top', 'bottom'],
      'fab.color': [UNSET, 'standard', 'vibrant'],
      'fab.iconTransition': ['swap', 'rotate'],
      'fab.elevation': ['default', 'lowered', 'flat'],
    },
    controlKinds: {
      leading: 'boolean',
      trailing: 'boolean',
      fab: 'boolean',
      'fab.expandedIcon': 'boolean',
      'fab.tooltip': 'boolean',
      'fab.dragged': 'boolean',
      'fab.href': 'string',
    },
    notControlled: {
      'fab.as':
        'Only changes the rendered element for a custom wrapper; nothing the preview shows.',
      'fab.preventFocusOnPress':
        'Only keeps focus where it was on press; nothing the preview shows.',
    },
    toggledSlots: {
      leading: '<IconButton icon={<EditIcon />} aria-label="Edit" />',
      trailing: '<IconButton icon={<DeleteIcon />} aria-label="Delete" />',
      fab: toolbarFabCode,
    },
    importMembers: ['IconButton', 'ToolbarFab'],
    codeSlots: {
      'aria-label': '"Formatting"',
      // A docked toolbar is placed by the app, usually along the bottom of the window.
      className: (values) => (values.toolbar === 'docked' ? '"fixed inset-x-0 bottom-0"' : null),
    },
    codeChildren:
      '<IconButton toggle icon={<FormatBoldIcon />} aria-label="Bold" />\n  <IconButton toggle icon={<FormatItalicIcon />} aria-label="Italic" />\n  <IconButton toggle icon={<FormatUnderlinedIcon />} aria-label="Underline" />',
  },
  link: {
    component: 'Link',
    importFrom: '@windmorph/react-pro',
    // The preview never leaves the page: with any `href`, it points at this spot. Without
    // one, the link is a button.
    render: ({ href, ...props }) =>
      createElement(
        LinkAny,
        { ...props, ...(typeof href === 'string' && href !== '' && { href: '#' }) },
        'Terms of service',
      ),
    defaultProps: {
      href: '',
      variant: 'inline',
      tone: 'primary',
      size: 'inherit',
      external: false,
      dragged: false,
    },
    surfacedProps: ['href', 'variant', 'tone', 'size', 'external', 'dragged'],
    initialState: { href: '/legal/terms' },
    notControlled: {
      as: 'Only changes the rendered element of a button link for a custom wrapper; nothing the preview shows.',
      preventFocusOnPress:
        'It only stops the link taking focus when pressed (menu triggers set it): nothing the preview can show.',
    },
    enumOptions: {
      variant: ['inline', 'standalone', 'plain'],
      tone: ['primary', 'inherit'],
      size: ['inherit', 'small', 'medium', 'large'],
    },
    codeChildren: 'Terms of service',
  },
};
