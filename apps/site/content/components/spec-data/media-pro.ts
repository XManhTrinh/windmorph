import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro media components, by page slug. */
export const MEDIA_PRO_SPEC: Record<string, ComponentSpecData> = {
  'duration-tag': {
    covers: [
      {
        name: 'A length on a card that is a link, read in words as part of its name',
        kind: 'use case',
        examples: ['duration-tag/duration-tag-card'],
      },
      {
        name: 'Raised clear of a progress line (`raised`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
      {
        name: 'Corners (`placement`) and a rounder frame (`--wm-media-frame-corner`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
      {
        name: 'Your own words and clock (`label`, `formatDuration`)',
        kind: 'configuration',
        examples: ['duration-tag/duration-tag-options'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3 has no length tag; the core list’s video item draws the same look for its own length, from the same formatters in the core’s primitives.',
      },
      {
        item: 'One look in every mode',
        note: 'The clock is the theme’s light neutral on `scrim` at 72% in light and dark mode alike, so it keeps 4.5:1 over a white picture without a theme scope of its own.',
      },
    ],
  },
  shelf: {
    covers: [
      {
        name: 'Wide (16:9) cards, the arrows centred on their pictures (`arrowsAlign="media"`)',
        kind: 'variant',
        examples: ['shelf/shelf-wide'],
      },
      {
        name: 'Tall (9:16) cards (`per="tall"`)',
        kind: 'variant',
        examples: ['shelf/shelf-tall'],
      },
      {
        name: 'Loading, with skeleton cards (`ShelfPlaceholder`)',
        kind: 'configuration',
        examples: ['shelf/shelf-loading'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3’s carousel sizes its items as a share of the row and clips them; a shelf keeps an app’s own cards untouched in a plain list, with side arrows that M3’s carousel rules out.',
      },
      {
        item: 'Sized by its own width',
        note: 'Cards to a line step by the shelf’s width at the library’s size classes, never whole numbers, so part of the next card always shows.',
      },
    ],
  },
  'featured-carousel': {
    covers: [
      {
        name: 'Slides with a link and buttons, kept clear of the side arrows',
        kind: 'use case',
        examples: ['featured-carousel/featured-carousel-slides'],
      },
      {
        name: 'Moving by itself, with the Pause control (`autoAdvance`)',
        kind: 'configuration',
        examples: ['featured-carousel/featured-carousel-auto'],
      },
      {
        name: 'A slide that plays a video (`media`, `useFeaturedCarouselSlide`)',
        kind: 'use case',
        examples: ['featured-carousel/featured-carousel-auto'],
      },
      {
        name: 'Loading and failed (`FeaturedCarouselPlaceholder`)',
        kind: 'configuration',
        examples: ['featured-carousel/featured-carousel-loading'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3’s carousel doesn’t move by itself and has no Previous and Next, indicator or controls inside an item; this one follows the APG’s auto-rotating carousel, with the core carousel’s 28px item corner and words.',
      },
      {
        item: 'Moving by itself within WCAG 2.2.2',
        note: 'Off unless asked; one Pause control stops the slides and any media in them, keyboard focus or a move by hand stops it until Play, and reduced motion keeps it still.',
      },
    ],
  },
  'reorder-list': {
    covers: [
      {
        name: 'Moving a row by dragging its handle, by the keys and from the move menu',
        kind: 'use case',
        examples: ['reorder-list/reorder-list-steps'],
      },
      {
        name: "A row's own menu moving it (`moveMenu={false}`, `useReorderListItem`)",
        kind: 'configuration',
        examples: ['reorder-list/reorder-list-own-menu'],
      },
      {
        name: 'A row that keeps its place (`reorderable={false}`)',
        kind: 'configuration',
        examples: ['reorder-list/reorder-list-own-menu'],
      },
      {
        name: 'The handle at the end (`handlePlacement="end"`)',
        kind: 'configuration',
        examples: ['reorder-list/reorder-list-own-menu'],
      },
    ],
    extensions: [
      {
        item: 'M3’s dragged item',
        note: 'The lifted row takes the dragged list item of M3’s Compose tokens: `tertiary-container` with `on-tertiary-container`, level 4 elevation and 16px corners, over a drop zone in `surface-container-low`.',
      },
      {
        item: 'Moving without a drag',
        note: 'Arrow keys, Home and End on the handle and its move menu move a row too, and every move is announced (WCAG 2.5.7, 4.1.3).',
      },
    ],
  },
  'video-player': {
    covers: [
      {
        name: 'A file, with nothing set',
        kind: 'configuration',
        examples: ['video-player/video-player-basic'],
      },
      {
        name: 'Captions and chapters (`captions`, `chapters`)',
        kind: 'configuration',
        examples: ['video-player/video-player-controls'],
      },
      {
        name: 'Next, Rotate, Autoplay and Theater (`onNext`, `rotatable`, `onAutoplayNextChange`, `onTheaterChange`)',
        kind: 'configuration',
        examples: ['video-player/video-player-controls'],
      },
      {
        name: "Speeds and the settings' presets, one of them locked (`playbackRates`, `playbackRatePresets`, `onPlaybackRatePresetPress`)",
        kind: 'configuration',
        examples: ['video-player/video-player-speeds'],
      },
      {
        name: 'Looks: grouped and scrim (`look`)',
        kind: 'variant',
        examples: ['video-player/video-player-look'],
      },
      {
        name: 'A control of your own and content at the end (`controls`, `ended`)',
        kind: 'configuration',
        examples: ['video-player/video-player-look'],
      },
      {
        name: 'A stream an engine drives (`source={{ attach }}`)',
        kind: 'use case',
        examples: ['video-player/video-player-engine'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3 has no video player; this one is built from the core’s icon buttons, tooltips and loading indicator in a dark scope over the picture, with Pro’s `MediaTimeSlider` as its scrubber.',
      },
      {
        item: 'One look over any picture',
        note: 'The shared on-media tokens keep every word at 4.5:1 and every icon and focus ring at 3:1 over a white or a black frame, with a fallback fill under reduced transparency.',
      },
      {
        item: 'Nothing downloads before Play',
        note: 'The source is set on the `<video>` (or the engine attached) only when playback is first asked for, so a page of players loads only their posters.',
      },
    ],
  },
  'video-player-settings': {
    showcaseReason:
      'It opens inside a video player, or alone in an element you name, so its examples show it in both places rather than a playground of its own.',
    covers: [
      {
        name: "In a player's `settings` slot, with the rows the player fills",
        kind: 'use case',
        examples: ['video-player-settings/video-player-settings-slot'],
      },
      {
        name: "The player's rows placed among yours (`children` as a function)",
        kind: 'configuration',
        examples: ['video-player-settings/video-player-settings-slot'],
      },
      {
        name: 'Badges on a row and its options (`badge`, `badgeLabel`)',
        kind: 'configuration',
        examples: ['video-player-settings/video-player-settings-slot'],
      },
      {
        name: 'A choice page (`VideoPlayerSettingsChoice`)',
        kind: 'configuration',
        examples: [
          'video-player-settings/video-player-settings-slot',
          'video-player-settings/video-player-settings-alone',
        ],
      },
      {
        name: 'Alone, from your own button (`VideoPlayerSettingsTrigger`, `container`)',
        kind: 'use case',
        examples: ['video-player-settings/video-player-settings-alone'],
      },
      {
        name: 'The speed page, with a locked preset (`VideoPlayerSettingsSpeed`)',
        kind: 'configuration',
        examples: ['video-player-settings/video-player-settings-alone'],
      },
      {
        name: 'A switch, an action and a page of your own',
        kind: 'configuration',
        examples: ['video-player-settings/video-player-settings-alone'],
      },
    ],
    extensions: [
      {
        item: 'Not an M3 component',
        note: 'M3’s menus open submenus beside the item and are modal; this panel’s pages take its place at the player’s corner and leave the video playing, with the core `BottomSheet` on phones.',
      },
      {
        item: 'Readable over any picture',
        note: 'Its fill (72% `scrim`) keeps every word at 4.5:1 over a white frame without the blur, a selected preset’s label included, in every theme and contrast level.',
      },
    ],
  },
};
