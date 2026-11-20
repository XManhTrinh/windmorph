'use client';

import { DurationTag, MediaFrame, Shelf } from '@windmorph/react-pro';
import { createElement } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const DurationTagAny = loose(DurationTag);
const ShelfAny = loose(Shelf);

/** The shelf preview's cards: a picture in one of the theme's tones and a title. */
const SHELF_TITLES = [
  'Harbour lights',
  'Mountain pass',
  'Night market',
  'Old town',
  'River walk',
  'Desert road',
  'Northern coast',
  'Glass house',
];
const SHELF_TONES = [
  'bg-primary-container',
  'bg-inverse-surface',
  'bg-tertiary-container',
  'bg-secondary',
];

function shelfCard(title: string, index: number, tall: boolean) {
  return createElement(
    'a',
    {
      key: title,
      href: `#${title}`,
      className:
        'flex flex-col gap-2 rounded-corner-medium text-on-surface outline-offset-2 focus-visible:outline-[3px] focus-visible:outline-secondary',
    },
    createElement('span', {
      'data-shelf-media': '',
      className: `block w-full rounded-corner-medium ${tall ? 'aspect-[9/16]' : 'aspect-video'} ${SHELF_TONES[index % SHELF_TONES.length]}`,
    }),
    createElement('span', { className: 'text-title-small' }, title),
  );
}

/** Playgrounds for the Windmorph Pro media components, by page slug. */
export const MEDIA_PRO_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'duration-tag': {
    component: 'DurationTag',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      MediaFrame:
        'The preview’s tag sits in one, at 16:9, and the snippet writes it; the examples show a rounder frame.',
    },
    render: (props) =>
      createElement(
        MediaFrame,
        { ratio: '16/9', className: 'w-full max-w-sm' },
        createElement('span', { className: 'bg-tertiary-container' }),
        props.raised ? createElement('span', { className: 'h-1 w-3/5 self-end bg-primary' }) : null,
        createElement(DurationTagAny, props),
      ),
    defaultProps: { placement: 'bottom-end', raised: false },
    initialState: { duration: 252 },
    surfacedProps: ['duration', 'placement', 'raised', 'label'],
    numberRanges: { duration: { min: 0, max: 36000, step: 1 } },
    notControlled: {
      formatDuration:
        'A function that writes the clock; the preview keeps `m:ss` in the page’s locale, and the examples write minutes.',
    },
    importMembers: ['MediaFrame'],
    codeWrap: {
      before: '<MediaFrame ratio="16/9">\n  <img src="/media/poster.jpg" alt="" />',
      after: '</MediaFrame>',
    },
  },
  shelf: {
    component: 'Shelf',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      ShelfPlaceholder:
        'The loading row, a server component with skeleton cards; the "Loading" example shows it.',
    },
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(
          ShelfAny,
          { ...props, 'aria-label': 'Series' },
          SHELF_TITLES.map((title, index) => shelfCard(title, index, props.per === 'tall')),
        ),
      ),
    defaultProps: { per: 'wide', arrowsAlign: 'center', arrows: true },
    surfacedProps: ['per', 'arrowsAlign', 'arrows', 'cardWidth'],
    notControlled: {
      previousIcon: 'A replacement chevron; the preview keeps the shelf’s own.',
      nextIcon: 'A replacement chevron; the preview keeps the shelf’s own.',
    },
    codeSlots: { 'aria-label': '"Series"' },
    codeChildren:
      '<a href="/series/harbour">Harbour lights</a>\n<a href="/series/pass">Mountain pass</a>\n<a href="/series/market">Night market</a>',
  },
};
