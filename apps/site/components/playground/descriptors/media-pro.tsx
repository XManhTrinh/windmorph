'use client';

import {
  DurationTag,
  FeaturedCarousel,
  FeaturedCarouselSlide,
  MediaFrame,
  ReorderList,
  ReorderListItem,
  Shelf,
  VideoPlayer,
} from '@windmorph/react-pro';
import { createElement, useState } from 'react';
import { loose, type PlaygroundDescriptor } from './shared';

const DurationTagAny = loose(DurationTag);
const ShelfAny = loose(Shelf);
const FeaturedCarouselAny = loose(FeaturedCarousel);
const ReorderListAny = loose(ReorderList);
const VideoPlayerAny = loose(VideoPlayer);

/** The player preview's captions and chapters, as the snippet writes them. */
const VIDEO_CAPTIONS = [
  { lang: 'en', src: '/media/captions/tour-en.vtt' },
  { lang: 'fr', src: '/media/captions/tour-fr.vtt' },
];
const VIDEO_CHAPTERS = [
  { start: 0, title: 'Themes' },
  { start: 6, title: 'Motion' },
  { start: 12, title: 'Your own' },
];

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
  { title: 'City after dark', fill: 'bg-primary-container text-on-primary-container' },
  { title: 'Harbour lights', fill: 'bg-tertiary-container text-on-tertiary-container' },
  { title: 'Mountain pass', fill: 'bg-secondary-container text-on-secondary-container' },
  { title: 'Night market', fill: 'bg-surface-container-highest text-on-surface' },
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
      href: `#demo-${title.toLowerCase().replaceAll(' ', '-')}`,
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
    // `number | null | undefined`: a length not known yet draws nothing.
    controlKinds: { duration: 'number' },
    numberRanges: { duration: { min: 0, max: 36000, step: 1 } },
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
    defaultProps: { per: 'wide', arrowsAlign: 'center', arrows: true, pageShare: 0.85 },
    surfacedProps: ['per', 'arrowsAlign', 'arrows', 'cardWidth', 'pageShare'],
    numberRanges: { pageShare: { min: 0.25, max: 1, step: 0.05 } },
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
                  className: `wm-featured-carousel-content flex h-full items-end pb-6 ${slide.fill}`,
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
  'video-player': {
    component: 'VideoPlayer',
    importFrom: '@windmorph/react-pro',
    notRendered: {
      VideoPlayerControl:
        'A button of your own on the bar, passed in `controls`; the "The scrim look" example adds one.',
      VideoPlayerControlGroup: 'A container for controls of your own, in the player’s look.',
      VideoPlayerVolume: 'The player’s own sound control, exported for a player of your own.',
      VideoPlayerNotice:
        'The player draws its own notices; this one is for a frame without a player.',
      MediaSlider:
        'The thin slider of the volume and the settings’ speed, for a value of your own.',
    },
    render: ({ captions, chapters, ...props }) =>
      createElement(VideoPlayerAny, {
        ...props,
        'aria-label': 'A tour of the components',
        source: '/media/bento/bento-dark.mp4',
        poster: { src: '/media/bento/bento-dark.jpg' },
        width: 1152,
        height: 720,
        duration: 18,
        captions: captions === true ? VIDEO_CAPTIONS : undefined,
        chapters: chapters === true ? VIDEO_CHAPTERS : undefined,
        className: 'aspect-[1152/720] w-full max-w-xl rounded-corner-large',
      }),
    defaultProps: { look: 'grouped', loop: false, rotatable: false },
    surfacedProps: ['look', 'loop', 'rotatable', 'captions', 'chapters'],
    controlKinds: { captions: 'boolean', chapters: 'boolean' },
    toggledSlots: {
      captions: `[\n    { lang: 'en', src: '/media/captions/tour-en.vtt' },\n    { lang: 'fr', src: '/media/captions/tour-fr.vtt' },\n  ]`,
      chapters: `[\n    { start: 0, title: 'Themes' },\n    { start: 6, title: 'Motion' },\n    { start: 12, title: 'Your own' },\n  ]`,
    },
    notControlled: {
      poster:
        'The picture before the first frame; the preview always has one, and the snippet writes it.',
      posterLoading: 'How the poster loads, which changes nothing to see.',
      duration: 'The length known before anything loads; the preview’s video is 18 seconds.',
      width: 'The video’s width before it loads; the preview’s is 1152.',
      height: 'The video’s height before it loads; the preview’s is 720.',
      autoPlay: 'Starts as it shows; the preview waits for Play, as a docs page should.',
      playbackRate: 'The speed, which `<` and `>` change in the preview.',
      defaultPlaybackRate: 'The speed at first; `<` and `>` change it in the preview.',
      playbackRates:
        'The speeds `<` and `>` step through; the preview keeps quarters from 0.25 to 2.',
      playbackRatePresets:
        'The settings’ speed presets; the preview has no settings, and the "Speeds up to 4×, with a locked preset" example sets them.',
      rotation: 'The picture’s turn, which Rotate and R change once `rotatable` is on.',
      defaultRotation: 'The turn at first; Rotate and R change it once `rotatable` is on.',
      autoplayNext:
        'Autoplay’s state, shown once `onAutoplayNextChange` is given; the "Captions, chapters" example has it.',
      defaultAutoplayNext: 'Autoplay at first; the "Captions, chapters" example shows the switch.',
      theater:
        'Theater’s state, with the layout yours; the "Captions, chapters" example widens its frame.',
      defaultTheater: 'Theater at first; the "Captions, chapters" example shows the button.',
      theaterFrom: 'The window size class the Theater button shows from; the examples show it.',
      captionsLang:
        'The captions shown, which the Captions button and C change once `captions` is on.',
      defaultCaptionsLang: 'The captions at first; the Captions button and C change them.',
      resumeFrom: 'A second to start from, with "Resumed from"; it needs a fresh mount to show.',
      inView:
        'Pausing or playing by how much is in view, for a feed; a single preview can’t show it.',
      covered: 'Something over the player, with `inView`; a single preview can’t show it.',
      controls: 'Your own controls on the bar; the "The scrim look" example adds one.',
      settings: 'The settings companion; the Video player settings page shows it.',
      settingsBadge: 'A mark on the Settings button; the Video player settings page shows it.',
      ended: 'Content over the picture when it ends; the "The scrim look" example has it.',
      icons: 'Replacement icons; the preview keeps the player’s own.',
      videoProps: 'Attributes for the `<video>`, such as `crossOrigin`, with nothing to see.',
      posterDelay:
        'Holds the poster back after another player; a single preview has nothing before it.',
      volume: 'The volume, which the preview’s own slider and the arrow keys change.',
      defaultVolume: 'The volume at first; the preview’s own slider changes it.',
      muted: 'Whether it is muted, which the preview’s sound button and M change.',
      defaultMuted: 'Muted at first; the preview’s sound button changes it.',
    },
    codeSlots: {
      'aria-label': '"A tour of the components"',
      source: '"/media/tour.mp4"',
      poster: "{ src: '/media/tour.jpg' }",
    },
  },
};
