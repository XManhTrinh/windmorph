'use client';

import { Button, IconButton, List, ListItem } from '@windmorph/react';
import {
  Accordion,
  AccordionItem,
  Avatar,
  Collapse,
  CommentRow,
  ExpandableText,
  ListDetailLayout,
  MediaGrid,
  MediaViewer,
  ShapedIcon,
  Tag,
} from '@windmorph/react-pro';
import { createElement, useState, type ReactElement } from 'react';
import { SAMPLE_PHOTO } from '../../../examples/image-crop/sample-photo';
import { SAMPLE_PHOTOS } from '../../../examples/media-viewer/sample-photos';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  PersonIcon,
  ScheduleIcon,
  StarIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../../icons';
import {
  DENSITY_OPTIONS,
  type PlaygroundDescriptor,
  type PlaygroundUpdate,
  asDensity,
  loose,
  noop,
  SHAPE_IMPORT,
  shapeOptions,
  shapeSlot,
  shapeValue,
} from './shared';

const AccordionAny = loose(Accordion);
const AccordionItemAny = loose(AccordionItem);
const AvatarAny = loose(Avatar);
const TagAny = loose(Tag);
const ShapedIconAny = loose(ShapedIcon);
const ExpandableTextAny = loose(ExpandableText);
const CollapseAny = loose(Collapse);
const CommentRowAny = loose(CommentRow);
const MediaGridAny = loose(MediaGrid);
const MediaViewerAny = loose(MediaViewer);
const ListDetailLayoutAny = loose(ListDetailLayout);

/** The accordion playground's questions. */
const ACCORDION_FAQ = [
  {
    id: 'arrival',
    title: 'When will my order arrive?',
    answer: 'In two to four working days, with tracking by email.',
  },
  {
    id: 'exchange',
    title: 'Can I exchange an item?',
    answer: 'Yes, within 30 days, for another size or colour.',
  },
  {
    id: 'packaging',
    title: 'Is the packaging recyclable?',
    answer: 'Yes: the box and the paper tape are both recyclable.',
  },
];

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

/**
 * The media viewer's preview: the Open photos button opens it and, with `origin` on, is
 * what it grows out of, read from the press, since an element can't be a control value.
 */
function MediaViewerPreview({
  props: { open, index, actions, origin, ...icons },
  update,
}: {
  props: Record<string, unknown>;
  update: PlaygroundUpdate;
}) {
  const [opener, setOpener] = useState<Element | undefined>();
  const icon = (name: string, element: ReactElement) =>
    icons[name] === true ? { [name]: element } : {};
  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="tonal"
        onPress={(event) => {
          setOpener(event.target);
          update('open', true);
        }}
      >
        Open photos
      </Button>
      <MediaViewerAny
        aria-label="Photos"
        items={SAMPLE_PHOTOS}
        open={open === true}
        onOpenChange={(next: boolean) => update('open', next)}
        index={photoIndex(index, SAMPLE_PHOTOS.length)}
        onIndexChange={(next: number) => update('index', next)}
        origin={origin === true ? opener : undefined}
        {...(actions === true && {
          actions: (
            <Button variant="text" href="#demo-post">
              View post
            </Button>
          ),
        })}
        {...icon('closeIcon', <ArrowBackIcon />)}
        {...icon('previousIcon', <ArrowBackIcon />)}
        {...icon('nextIcon', <ArrowForwardIcon />)}
        {...icon('zoomInIcon', <ZoomInIcon />)}
        {...icon('zoomOutIcon', <ZoomOutIcon />)}
      />
    </div>
  );
}

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
    codeImports: ["import { IconButton, List, ListItem } from '@windmorph/react';"],
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
          onAction: noop,
          'aria-label': 'Photos',
        }),
      ),
    defaultProps: { columns: 3 },
    surfacedProps: ['max', 'columns'],
    initialState: { max: 6, columns: 3 },
    numberRanges: { max: { min: 1, max: GRID_PHOTOS.length }, columns: { min: 1, max: 4 } },
    codeImports: ["import { photos } from './photos';"],
    codeSlots: {
      items: 'photos',
      onAction: "(index) => console.log('Open photo', index)",
      'aria-label': '"Photos"',
    },
  },
  'media-viewer': {
    component: 'MediaViewer',
    importFrom: '@windmorph/react-pro',
    // The viewer covers the window: the button opens it, and closing it turns `open` off.
    render: (props, update) => createElement(MediaViewerPreview, { key: 'viewer', props, update }),
    defaultProps: {
      open: false,
      index: 0,
      actions: false,
      origin: false,
      closeIcon: false,
      previousIcon: false,
      nextIcon: false,
      zoomInIcon: false,
      zoomOutIcon: false,
    },
    surfacedProps: [
      'open',
      'index',
      'origin',
      'actions',
      'closeIcon',
      'previousIcon',
      'nextIcon',
      'zoomInIcon',
      'zoomOutIcon',
    ],
    initialState: { actions: true, origin: true },
    numberRanges: { index: { min: 0, max: SAMPLE_PHOTOS.length - 1 } },
    controlKinds: {
      actions: 'boolean',
      origin: 'boolean',
      closeIcon: 'boolean',
      previousIcon: 'boolean',
      nextIcon: 'boolean',
      zoomInIcon: 'boolean',
      zoomOutIcon: 'boolean',
    },
    controlDescriptions: {
      origin:
        'Grows the viewer out of the Open photos button that opened it, the M3 container transform.',
    },
    // The snippet opens the viewer from a button, as the preview does, and keeps `open` in
    // state; with `origin`, the button it was opened from.
    codeState: (values) => ({
      open: `useState(${values.open === true})`,
      ...(values.origin === true && { opener: 'useState<Element>()' }),
    }),
    codeWrap: (values) => ({
      before: `<>\n  <Button\n    variant="tonal"\n    onPress={${
        values.origin === true
          ? '(event) => {\n      setOpener(event.target);\n      setOpen(true);\n    }'
          : '() => setOpen(true)'
      }}\n  >\n    Open photos\n  </Button>`,
      after: '</>',
    }),
    toggledSlots: {
      origin: 'opener',
      actions: '<Button variant="text" href="/posts/42">View post</Button>',
      closeIcon: '<ArrowBackIcon />',
      previousIcon: '<ArrowBackIcon />',
      nextIcon: '<ArrowForwardIcon />',
      zoomInIcon: '<ZoomInIcon />',
      zoomOutIcon: '<ZoomOutIcon />',
    },
    codeImports: [
      "import { Button } from '@windmorph/react';",
      "import { photos } from './photos';",
    ],
    codeSlots: {
      items: 'photos',
      open: 'open',
      onOpenChange: 'setOpen',
      'aria-label': '"Photos"',
    },
  },
  'shaped-icon': {
    component: 'ShapedIcon',
    importFrom: '@windmorph/react-pro',
    render: ({ shape, ...props }) =>
      createElement(ShapedIconAny, { ...props, shape: shapeValue(shape) }, createElement(StarIcon)),
    defaultProps: { shape: 'circle', size: 'md', color: 'secondary' },
    surfacedProps: ['shape', 'size', 'color'],
    initialState: { shape: 'Cookie9Sided', size: 'lg', color: 'primary' },
    enumOptions: {
      shape: shapeOptions(['circle']),
      size: ['sm', 'md', 'lg', 'xl'],
      color: ['primary', 'secondary', 'tertiary', 'neutral', 'error'],
    },
    // A shape is written as its constant, imported from `@windmorph/react/primitives`.
    codeSlots: { shape: shapeSlot('circle') },
    codeImports: [SHAPE_IMPORT],
    codeChildren: '<StarIcon />',
  },
  'comment-row': {
    component: 'CommentRow',
    importFrom: '@windmorph/react-pro',
    render: ({ below, href, ...props }) =>
      createElement(
        // A list item needs its list, so `as="li"` previews inside one.
        props.as === 'li' ? 'ul' : 'div',
        { className: 'w-full max-w-md', ...(props.as === 'li' && { role: 'list' }) },
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
      pending: false,
      as: 'div',
      bubble: '',
      below: false,
      href: '',
    },
    surfacedProps: ['variant', 'pending', 'as', 'bubble', 'below', 'href'],
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
  accordion: {
    component: 'Accordion',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      AccordionItem:
        "The accordion's items, composed in the preview; each one's title, supporting text, leading icon and `disabled` are its own, as the examples show.",
      AccordionHeader:
        'A header built from parts, for a header of your own; the "A header from parts" example shows it.',
      AccordionPanel:
        'The panel beside an `AccordionHeader`; the "A header from parts" example shows it.',
    },
    // A segmented accordion sits on a container colour, as its own example does.
    render: ({ density, headingLevel, ...props }) =>
      createElement(
        'div',
        {
          className:
            props.variant === 'segmented'
              ? 'w-full max-w-md rounded-corner-large bg-surface-container p-4'
              : 'w-full max-w-md',
        },
        createElement(
          AccordionAny,
          {
            ...props,
            // Switching to several open at once keeps what is open; back to one starts afresh.
            key: String(props.multiple),
            defaultExpandedKeys: ['arrival'],
            density: asDensity(density),
            headingLevel: headingLevel == null ? undefined : Number(headingLevel),
          },
          ...ACCORDION_FAQ.map(({ id, title, answer }) =>
            createElement(AccordionItemAny, { key: id, id, title }, answer),
          ),
        ),
      ),
    defaultProps: {
      variant: 'standard',
      multiple: false,
      disabled: false,
      headingLevel: 3,
      density: 0,
    },
    surfacedProps: ['variant', 'multiple', 'disabled', 'headingLevel', 'density'],
    enumOptions: { ...DENSITY_OPTIONS, headingLevel: ['2', '3', '4', '5', '6'] },
    // The heading level and density are numbers, so the snippet writes them as numbers.
    controlKinds: { headingLevel: 'number', density: 'number' },
    notControlled: {
      defaultExpandedKeys:
        'The uncontrolled `expandedKeys`; the preview opens the first question, and the snippet writes it.',
      expandedKeys:
        "An Iterable of the open items' `id`s; open and fold items in the preview instead, or see the controlled example.",
    },
    importMembers: ['AccordionItem'],
    codeSlots: { defaultExpandedKeys: "['arrival']" },
    codeChildren: ACCORDION_FAQ.map(
      ({ id, title, answer }) =>
        `<AccordionItem id="${id}" title="${title}">\n    ${answer}\n  </AccordionItem>`,
    ).join('\n  '),
  },
  collapse: {
    component: 'Collapse',
    importFrom: '@windmorph/react-pro',
    // A new `appear` remounts it, so the switch shows what it does on mount.
    render: ({ open, appear, keepMounted }, update) =>
      createElement(
        'div',
        { className: 'flex w-full max-w-md flex-col items-start' },
        <Button
          key="toggle"
          variant="text"
          aria-expanded={open === true}
          onPress={() => update('open', open !== true)}
        >
          Can I bring a guest?
        </Button>,
        createElement(
          CollapseAny,
          {
            key: `collapse-${String(appear)}`,
            open: open === true,
            onOpenChange: (next: boolean) => update('open', next),
            appear,
            keepMounted,
          },
          <p className="px-3 pb-3 text-body-medium text-on-surface-variant">
            Yes, one guest per member. Add their name when you book, so there&apos;s a seat for
            them.
          </p>,
        ),
      ),
    defaultProps: { appear: false, keepMounted: false },
    surfacedProps: ['open', 'appear', 'keepMounted'],
    initialState: { open: true },
    codeChildren:
      '<p className="px-3 pb-3 text-body-medium text-on-surface-variant">\n    Yes, one guest per member.\n  </p>',
  },
  'expandable-text': {
    component: 'ExpandableText',
    groups: { lines: 'appearance' },
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
    numberRanges: { lines: { min: 1, max: 6 } },
    enumOptions: { as: ['div', 'p'] },
    codeSlots: { className: '"text-body-large text-on-surface"' },
    codeChildren: EXPANDABLE_TEXT_SAMPLE,
  },
  avatar: {
    component: 'Avatar',
    notRendered: {
      AvatarGroup: 'Stacks several avatars with an overflow count; the page examples show it.',
    },
    importFrom: '@windmorph/react-pro',
    render: ({ presence, badge, badgeLabel, src, icon, alt, decorative, href, shape, ...props }) =>
      createElement(AvatarAny, {
        ...props,
        shape: shapeValue(shape),
        ...(decorative === true ? { decorative: true } : { alt: String(alt || props.name || '') }),
        ...(src === true && { src: SAMPLE_PHOTO }),
        ...(icon === true && { icon: <PersonIcon /> }),
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
      color: 'auto',
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
      'color',
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
      shape: shapeOptions(['circle', 'rounded']),
      color: ['auto', 'primary', 'secondary', 'tertiary', 'neutral'],
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
    toggledSlots: { src: '"/avatars/nora.jpg"', icon: '<PersonIcon />' },
    // A shape is written as its constant, imported from `@windmorph/react/primitives`.
    codeSlots: { shape: shapeSlot('circle') },
    codeImports: [SHAPE_IMPORT],
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
    notRendered: {
      TagGroup: 'Lays out and names several tags; the page examples show it.',
    },
    importFrom: '@windmorph/react-pro',
    render: ({ icon, fullLabel, maxWidth, ...props }) =>
      createElement(
        TagAny,
        {
          ...props,
          ...(icon === true && { icon: <ScheduleIcon /> }),
          ...(fullLabel !== '' && fullLabel != null && { fullLabel }),
          ...(typeof maxWidth === 'number' && { maxWidth }),
        },
        'Open now',
      ),
    defaultProps: {
      variant: 'tonal',
      color: 'neutral',
      size: 'md',
      shape: 'round',
      dot: false,
      icon: false,
      fullLabel: '',
    },
    surfacedProps: ['variant', 'color', 'size', 'shape', 'dot', 'icon', 'fullLabel', 'maxWidth'],
    initialState: { color: 'success', dot: true },
    // A tag shows a status dot or a leading icon, not both (the types say so).
    adjust: (values, changed) => {
      if (changed === 'dot' && values.dot === true) return { ...values, icon: false };
      if (changed === 'icon' && values.icon === true) return { ...values, dot: false };
      return values;
    },
    enumOptions: {
      variant: ['tonal', 'filled', 'outlined'],
      color: ['neutral', 'primary', 'secondary', 'tertiary', 'error', 'success', 'warning'],
      size: ['sm', 'md', 'lg'],
      shape: ['round', 'square'],
    },
    controlKinds: { icon: 'boolean', maxWidth: 'number' },
    toggledSlots: { icon: '<ScheduleIcon />' },
    numberRanges: { maxWidth: { min: 48, max: 240, step: 4 } },
    codeChildren: 'Open now',
  },
};
