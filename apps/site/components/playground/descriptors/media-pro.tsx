'use client';

import {
  DurationTag,
  FeaturedCarousel,
  FeaturedCarouselSlide,
  MediaFrame,
  ReorderList,
  ReorderListItem,
  Shelf,
} from '@windmorph/react-pro';
import { createElement, useState } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const DurationTagAny = loose(DurationTag);
const ShelfAny = loose(Shelf);
const FeaturedCarouselAny = loose(FeaturedCarousel);
const ReorderListAny = loose(ReorderList);

/** The reorder preview's rows, kept in order by the preview itself. */
const REORDER_STEPS = ['Soak the beans', 'Rinse and drain', 'Simmer', 'Season', 'Let it rest'];

/** A reorder list holding its own order, so the preview's moves stay. */
function ReorderPreview(props: Record<string, unknown>) {
  const [order, setOrder] = useState(REORDER_STEPS);
  return createElement(
    ReorderListAny,
    {
      ...props,
      'aria-label': 'Recipe steps',
      className: 'w-full max-w-md',
      onReorder: (keys: string[]) => setOrder(keys),
    },
    order.map((step) =>
      createElement(
        ReorderListItem,
        { key: step, textValue: step },
        createElement('span', { className: 'text-body-large text-on-surface' }, step),
      ),
    ),
  );
}

/** The carousel preview's slides: a title on one of the theme's tones. */
const CAROUSEL_SLIDES = [
  { title: 'City after dark', tone: 'bg-primary-container text-on-primary-container' },
  { title: 'Harbour lights', tone: 'bg-tertiary-container text-on-tertiary-container' },
  { title: 'Mountain pass', tone: 'bg-secondary-container text-on-secondary-container' },
  { title: 'Night market', tone: 'bg-surface-container-highest text-on-surface' },
];

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
  'featured-carousel': {
    component: 'FeaturedCarousel',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      FeaturedCarouselSlide:
        'Each preview slide is one, with its `textValue`; the "Moving by itself" example shows `media`.',
      FeaturedCarouselPlaceholder:
        'The loading and failed frame, a server component; the "Loading and failed" example shows it.',
    },
    render: (props) =>
      createElement(
        'div',
        { className: 'w-full' },
        createElement(
          FeaturedCarouselAny,
          { ...props, 'aria-label': 'Featured' },
          CAROUSEL_SLIDES.map((slide) =>
            createElement(
              FeaturedCarouselSlide,
              { key: slide.title, textValue: slide.title },
              createElement(
                'div',
                {
                  className: `wm-featured-carousel-content flex h-full items-end pb-6 ${slide.tone}`,
                },
                createElement('h3', { className: 'text-headline-small' }, slide.title),
              ),
            ),
          ),
        ),
      ),
    defaultProps: { loop: true, autoAdvance: false, arrows: true, indicator: true, maxDots: 20 },
    surfacedProps: ['autoAdvance', 'loop', 'arrows', 'indicator', 'maxDots'],
    controlKinds: { autoAdvance: 'boolean' },
    numberRanges: { maxDots: { min: 1, max: 30, step: 1 } },
    notControlled: {
      index: 'The current slide, which the preview’s own arrows, keys and swipes change.',
      defaultIndex: 'The slide current at first; the preview starts at the first.',
      paused: 'Whether the Pause control has stopped it, which the preview’s own control changes.',
      defaultPaused: 'Whether it starts stopped; the preview’s Pause control shows it.',
      previousIcon: 'A replacement chevron; the preview keeps the carousel’s own.',
      nextIcon: 'A replacement chevron; the preview keeps the carousel’s own.',
      pauseIcon: 'A replacement icon; the preview keeps the carousel’s own.',
      playIcon: 'A replacement icon; the preview keeps the carousel’s own.',
    },
    importMembers: ['FeaturedCarouselSlide'],
    codeSlots: { 'aria-label': '"Featured"' },
    codeChildren:
      '<FeaturedCarouselSlide textValue="City after dark">\n  <h3>City after dark</h3>\n</FeaturedCarouselSlide>\n<FeaturedCarouselSlide textValue="Harbour lights">\n  <h3>Harbour lights</h3>\n</FeaturedCarouselSlide>',
  },
  'reorder-list': {
    component: 'ReorderList',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      ReorderListItem:
        'Each preview row is one, with its `textValue`; the second example shows `reorderable`.',
    },
    render: (props) => createElement(ReorderPreview, props),
    defaultProps: { disabled: false, handlePlacement: 'start', moveMenu: true },
    surfacedProps: ['handlePlacement', 'moveMenu', 'disabled'],
    notControlled: {
      handleIcon: 'A replacement icon; the preview keeps the handle’s own.',
      moveUpIcon: 'A replacement icon in the move menu; the preview keeps its own.',
      moveDownIcon: 'A replacement icon in the move menu; the preview keeps its own.',
      moveToTopIcon: 'A replacement icon in the move menu; the preview keeps its own.',
      moveToBottomIcon: 'A replacement icon in the move menu; the preview keeps its own.',
    },
    importMembers: ['ReorderListItem'],
    codeState: { order: "useState(['Soak the beans', 'Rinse and drain', 'Simmer'])" },
    codeSlots: {
      'aria-label': '"Recipe steps"',
      onReorder: '(keys) => setOrder(keys as string[])',
    },
    codeChildren:
      '{order.map((step) => (\n  <ReorderListItem key={step} textValue={step}>\n    {step}\n  </ReorderListItem>\n))}',
  },
};
