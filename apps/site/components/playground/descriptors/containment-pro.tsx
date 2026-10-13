'use client';

import { Button, IconButton, List, ListItem } from '@windmorph/react';
import {
  Avatar,
  avatarShapes,
  Collapse,
  CommentRow,
  ExpandableText,
  ListDetailLayout,
  MediaGrid,
  MediaViewer,
  ShapedIcon,
  Tag,
} from '@windmorph/react-pro';
import { createElement } from 'react';
import { SAMPLE_PHOTO } from '../../../examples/image-crop/sample-photo';
import { SAMPLE_PHOTOS } from '../../../examples/media-viewer/sample-photos';
import { ArrowBackIcon, StarIcon } from '../../icons';
import { type PlaygroundDescriptor, STAR, loose, noop } from './shared';

const AvatarAny = loose(Avatar);
const TagAny = loose(Tag);
const ShapedIconAny = loose(ShapedIcon);
const ExpandableTextAny = loose(ExpandableText);
const CollapseAny = loose(Collapse);
const CommentRowAny = loose(CommentRow);
const MediaGridAny = loose(MediaGrid);
const MediaViewerAny = loose(MediaViewer);
const ListDetailLayoutAny = loose(ListDetailLayout);

const EXPANDABLE_TEXT_SAMPLE =
  'Phở night at the community hall this Saturday from 6pm. Bring a bowl and a friend: every table is shared, and the broth has been simmering since Friday morning. There is a vegetarian pot too, and the kids’ corner has crafts and lanterns. Parking is behind the church, and the 42 bus stops outside.';

/** Eight photos for the grid, the four samples twice. */
const GRID_PHOTOS = [...SAMPLE_PHOTOS, ...SAMPLE_PHOTOS].map((photo, index) => ({
  ...photo,
  key: `${photo.key}-${index}`,
}));

/** The settings sections the list-detail playground shows. */
const SECTIONS = [
  { key: 'profile', title: 'Profile', summary: 'Name, photos, bio and languages' },
  { key: 'account', title: 'Account', summary: 'Username, email and password' },
  { key: 'privacy', title: 'Privacy', summary: 'Search engines and blocked accounts' },
];
const SECTIONS_CODE = `(\n    <List aria-label="Settings sections">\n      <ListItem href="/settings/profile">Profile</ListItem>\n      <ListItem href="/settings/account">Account</ListItem>\n      <ListItem href="/settings/privacy">Privacy</ListItem>\n    </List>\n  )`;

/** Clamps a numeric control to a valid photo index. */
const photoIndex = (value: unknown, count: number) =>
  Math.min(Math.max(0, Math.trunc(Number(value) || 0)), count - 1);

/** Playgrounds for the Windmorph Pro containment components, by page slug. */
export const CONTAINMENT_PRO_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'list-detail-layout': {
    component: 'ListDetailLayout',
    importFrom: '@windmorph/react-pro',
    // Both panes show from 840px wide; narrower, `active` picks the one that shows.
    render: ({ back, listWidth, stickyTop, ...props }, update) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(ListDetailLayoutAny, {
          ...props,
          className: 'min-h-72 w-full',
          ...(listWidth !== '' && listWidth != null && { listWidth }),
          ...(stickyTop !== '' && stickyTop != null && { stickyTop }),
          back:
            back === true ? (
              <IconButton
                variant="standard"
                aria-label="Back to settings"
                icon={<ArrowBackIcon />}
                onPress={() => update('active', 'list')}
              />
            ) : undefined,
          list: (
            <List
              aria-label="Settings sections"
              selectionMode="single"
              selectedKeys={['profile']}
              onSelectionChange={() => update('active', 'detail')}
            >
              {SECTIONS.map((section) => (
                <ListItem key={section.key} supportingText={section.summary}>
                  {section.title}
                </ListItem>
              ))}
            </List>
          ),
          detail: (
            <div className="flex flex-col gap-2 p-4">
              <h3 className="text-headline-small text-on-surface">Profile</h3>
              <p className="text-body-large text-on-surface-variant">
                Name, photos, bio and languages
              </p>
            </div>
          ),
        }),
      ),
    // `active`, `listLabel` and `detailLabel` are required, so the snippet always writes them.
    defaultProps: {
      variant: 'plain',
      listAs: 'nav',
      detailKey: '',
      listWidth: '',
      stickyTop: '',
      back: false,
    },
    surfacedProps: [
      'variant',
      'active',
      'listAs',
      'back',
      'listLabel',
      'detailLabel',
      'detailKey',
      'listWidth',
      'stickyTop',
    ],
    initialState: {
      variant: 'filled',
      active: 'list',
      listLabel: 'Preferences',
      detailLabel: 'Preference',
      back: true,
    },
    controlKinds: { back: 'boolean' },
    toggledSlots: {
      back: '<IconButton variant="standard" aria-label="Back to settings" icon={<ArrowBackIcon />} href="/settings" />',
    },
    codeImports: [
      "import { IconButton, List, ListItem } from '@windmorph/react';",
      "import { ArrowBackIcon } from './icons';",
    ],
    codeSlots: {
      list: SECTIONS_CODE,
      detail: '<p className="p-4 text-body-large">Name, photos, bio and languages</p>',
    },
  },
  'media-grid': {
    component: 'MediaGrid',
    importFrom: '@windmorph/react-pro',
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(MediaGridAny, {
          ...props,
          items: GRID_PHOTOS,
          onItemPress: noop,
          'aria-label': 'Photos',
        }),
      ),
    defaultProps: { columns: 3 },
    surfacedProps: ['max', 'columns'],
    initialState: { max: 6, columns: 3 },
    codeImports: ["import { photos } from './photos';"],
    codeSlots: {
      items: 'photos',
      onItemPress: "(index) => console.log('Open photo', index)",
      'aria-label': '"Photos"',
    },
  },
  'media-viewer': {
    component: 'MediaViewer',
    importFrom: '@windmorph/react-pro',
    // The viewer covers the window: the button opens it, and closing it turns `open` off.
    render: ({ open, index, actions }, update) =>
      createElement(
        'div',
        { className: 'flex flex-col items-center gap-2' },
        <Button key="open" variant="tonal" onPress={() => update('open', true)}>
          Open photos
        </Button>,
        createElement(MediaViewerAny, {
          key: 'viewer',
          'aria-label': 'Photos',
          items: SAMPLE_PHOTOS,
          open: open === true,
          onOpenChange: (next: boolean) => update('open', next),
          index: photoIndex(index, SAMPLE_PHOTOS.length),
          onIndexChange: (next: number) => update('index', next),
          ...(actions === true && {
            actions: (
              <Button variant="text" href="#demo-post">
                View post
              </Button>
            ),
          }),
        }),
      ),
    defaultProps: { open: false, index: 0, actions: false },
    surfacedProps: ['open', 'index', 'actions'],
    initialState: { actions: true },
    controlKinds: { actions: 'boolean' },
    toggledSlots: { actions: '<Button variant="text" href="/posts/42">View post</Button>' },
    codeImports: [
      "import { Button } from '@windmorph/react';",
      "import { photos } from './photos';",
    ],
    codeSlots: { items: 'photos', 'aria-label': '"Photos"' },
  },
  'shaped-icon': {
    component: 'ShapedIcon',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(ShapedIconAny, props, createElement(StarIcon)),
    defaultProps: { shape: 'circle', size: 'md', tone: 'secondary' },
    surfacedProps: ['shape', 'size', 'tone'],
    initialState: { shape: 'Cookie9Sided', size: 'lg', tone: 'primary' },
    enumOptions: {
      shape: [
        'circle',
        ...avatarShapes.filter((shape) => shape !== 'circle' && shape !== 'rounded'),
      ],
      size: ['sm', 'md', 'lg', 'xl'],
      tone: ['primary', 'secondary', 'tertiary', 'neutral', 'error'],
    },
    codeImports: ["import { StarIcon } from './icons';"],
    codeChildren: '<StarIcon />',
  },
  'comment-row': {
    component: 'CommentRow',
    importFrom: '@windmorph/react-pro',
    render: ({ below, href, ...props }) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(CommentRowAny, {
          ...props,
          ...(props.as === 'article' && { 'aria-label': 'Comment by Alex Morgan' }),
          ...(href !== '' && href != null && { href }),
          avatar: <Avatar name="Alex Morgan" size="sm" decorative />,
          ...(below === true && {
            below: (
              <img
                src={SAMPLE_PHOTOS[3]!.src}
                alt={SAMPLE_PHOTOS[3]!.alt}
                width={160}
                height={160}
                className="size-40 rounded-corner-large object-cover"
              />
            ),
          }),
          actions: (
            <>
              <time dateTime="2026-10-12T09:00:00Z" className="px-3">
                2 min
              </time>
              <Button variant="text" size="xs" className="text-on-surface-variant">
                Reply
              </Button>
            </>
          ),
        }),
      ),
    defaultProps: {
      variant: 'filled',
      isPending: false,
      as: 'div',
      bubble: '',
      below: false,
      href: '',
    },
    surfacedProps: ['variant', 'isPending', 'as', 'bubble', 'below', 'href'],
    initialState: { bubble: 'Is the cooking class open to beginners?' },
    enumOptions: { as: ['div', 'article', 'li'] },
    controlKinds: { bubble: 'string', below: 'boolean' },
    toggledSlots: {
      below:
        '<img src="/photos/lunch.jpg" alt="A bowl of phở" className="size-40 rounded-corner-large object-cover" />',
    },
    importMembers: ['Avatar'],
    codeImports: ["import { Button } from '@windmorph/react';"],
    codeSlots: {
      avatar: '<Avatar name="Alex Morgan" size="sm" decorative />',
      actions:
        '(\n    <>\n      <time dateTime="2026-10-12T09:00:00Z" className="px-3">2 min</time>\n      <Button variant="text" size="xs">Reply</Button>\n    </>\n  )',
    },
  },
  collapse: {
    component: 'Collapse',
    importFrom: '@windmorph/react-pro',
    // A new `appear` remounts it, so the switch shows what it does on mount.
    render: ({ isOpen, appear }, update) =>
      createElement(
        'div',
        { className: 'flex w-full max-w-md flex-col items-start' },
        <Button
          key="toggle"
          variant="text"
          aria-expanded={isOpen === true}
          onPress={() => update('isOpen', isOpen !== true)}
        >
          Can I bring a guest?
        </Button>,
        createElement(
          CollapseAny,
          { key: `collapse-${String(appear)}`, isOpen: isOpen === true, appear },
          <p className="px-3 pb-3 text-body-medium text-on-surface-variant">
            Yes, one guest per member. Add their name when you book, so there&apos;s a seat for
            them.
          </p>,
        ),
      ),
    // `isOpen` is required, so the snippet always writes it.
    defaultProps: { appear: true },
    surfacedProps: ['isOpen', 'appear'],
    initialState: { isOpen: true },
    codeChildren:
      '<p className="px-3 pb-3 text-body-medium text-on-surface-variant">\n    Yes, one guest per member.\n  </p>',
  },
  'expandable-text': {
    component: 'ExpandableText',
    importFrom: '@windmorph/react-pro',
    render: (props, update) =>
      createElement(
        'div',
        { className: 'w-full max-w-sm' },
        createElement(
          ExpandableTextAny,
          {
            ...props,
            expanded: props.expanded === true,
            onExpandedChange: (next: boolean) => update('expanded', next),
            className: 'text-body-large text-on-surface',
          },
          EXPANDABLE_TEXT_SAMPLE,
        ),
      ),
    defaultProps: { lines: 5, collapsible: false, expanded: false, as: 'div' },
    surfacedProps: ['lines', 'collapsible', 'expanded', 'as'],
    initialState: { lines: 3, collapsible: true },
    enumOptions: { as: ['div', 'p'] },
    codeSlots: { className: '"text-body-large text-on-surface"' },
    codeChildren: EXPANDABLE_TEXT_SAMPLE,
  },
  avatar: {
    component: 'Avatar',
    importFrom: '@windmorph/react-pro',
    render: ({ presence, badge, badgeLabel, src, icon, alt, decorative, href, ...props }) =>
      createElement(AvatarAny, {
        ...props,
        ...(decorative === true ? { decorative: true } : { alt: String(alt || props.name || '') }),
        ...(src === true && { src: SAMPLE_PHOTO }),
        ...(icon === true && { icon: <StarIcon /> }),
        ...(href !== '' && href != null && { href }),
        ...(presence !== 'none' && { presence }),
        ...(badge !== '' && { badge, badgeLabel: String(badgeLabel || badge) }),
      }),
    defaultProps: {
      name: 'Nora Lindqvist',
      initials: '',
      src: false,
      icon: false,
      size: 'md',
      shape: 'circle',
      tone: 'auto',
      presence: 'none',
      presencePlacement: 'bottom-end',
      badge: '',
      badgeLabel: '',
      badgePlacement: 'top-end',
      ring: false,
      href: '',
      alt: '',
      decorative: false,
    },
    surfacedProps: [
      'name',
      'initials',
      'src',
      'icon',
      'size',
      'shape',
      'tone',
      'presence',
      'presencePlacement',
      'badge',
      'badgeLabel',
      'badgePlacement',
      'ring',
      'href',
      'alt',
      'decorative',
    ],
    initialState: {
      name: 'Nora Lindqvist',
      size: 'xl',
      shape: 'Cookie12Sided',
      presence: 'online',
      badge: '✓',
      badgeLabel: 'verified',
      alt: 'Nora Lindqvist',
    },
    enumOptions: {
      size: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      shape: [...avatarShapes],
      tone: ['auto', 'primary', 'secondary', 'tertiary', 'neutral'],
      presence: ['none', 'online', 'away', 'offline'],
      presencePlacement: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
      badgePlacement: ['top-start', 'top-end', 'bottom-start', 'bottom-end'],
    },
    controlKinds: { src: 'boolean', icon: 'boolean' },
    // A decorative avatar has no `alt` (the name is written beside it): the types say so.
    adjust: (values, changed) => {
      if (changed === 'decorative' && values.decorative === true) return { ...values, alt: '' };
      if (changed === 'alt' && values.alt) return { ...values, decorative: false };
      return values;
    },
    toggledSlots: { src: '"/avatars/nora.jpg"', icon: STAR },
    notControlled: {
      srcSet:
        'Responsive sources for `src`: the preview has one sample photo, so it would look the same.',
      sizes: 'Picks among `srcSet` sources by layout width: no visible effect with one sample.',
      image:
        "An app's own image element (such as `next/image`) in place of `src`: the preview uses `src`.",
      locale:
        'Only changes how initials are cased in locales such as Turkish: the sample names look the same.',
    },
  },
  tag: {
    component: 'Tag',
    importFrom: '@windmorph/react-pro',
    render: ({ icon, fullLabel, maxWidth, ...props }) =>
      createElement(
        TagAny,
        {
          ...props,
          ...(icon === true && { icon: <StarIcon /> }),
          ...(fullLabel !== '' && fullLabel != null && { fullLabel }),
          ...(typeof maxWidth === 'number' && { maxWidth }),
        },
        'Open now',
      ),
    defaultProps: {
      variant: 'tonal',
      tone: 'neutral',
      size: 'md',
      shape: 'full',
      dot: false,
      icon: false,
      fullLabel: '',
    },
    surfacedProps: ['variant', 'tone', 'size', 'shape', 'dot', 'icon', 'fullLabel', 'maxWidth'],
    initialState: { tone: 'success', dot: true },
    // A tag shows a status dot or a leading icon, not both (the types say so).
    adjust: (values, changed) => {
      if (changed === 'dot' && values.dot === true) return { ...values, icon: false };
      if (changed === 'icon' && values.icon === true) return { ...values, dot: false };
      return values;
    },
    enumOptions: {
      variant: ['tonal', 'filled', 'outlined'],
      tone: ['neutral', 'primary', 'secondary', 'tertiary', 'error', 'success', 'warning'],
      size: ['sm', 'md', 'lg'],
      shape: ['full', 'rounded'],
    },
    controlKinds: { icon: 'boolean', maxWidth: 'number' },
    toggledSlots: { icon: STAR },
    codeChildren: 'Open now',
  },
};
