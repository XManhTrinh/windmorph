import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro containment components, by page slug. */
export const CONTAINMENT_PRO_SPEC: Record<string, ComponentSpecData> = {
  'list-detail-layout': {
    covers: [
      {
        name: 'Plain panes (`variant="plain"`)',
        kind: 'variant',
        examples: ['list-detail-layout/list-detail-settings'],
      },
      {
        name: 'Filled panes (`variant="filled"`)',
        kind: 'variant',
        examples: ['list-detail-layout/list-detail-inbox'],
      },
      {
        name: 'A navigating list (`listAs="nav"`), such as settings',
        kind: 'configuration',
        examples: ['list-detail-layout/list-detail-settings'],
      },
      {
        name: 'A list of items (`listAs="section"`), such as an inbox',
        kind: 'configuration',
        examples: ['list-detail-layout/list-detail-inbox'],
      },
      {
        name: 'One pane at a time below 840px, with Back',
        kind: 'configuration',
        examples: [
          'list-detail-layout/list-detail-settings',
          'list-detail-layout/list-detail-inbox',
        ],
      },
    ],
    compose: [
      {
        composable: 'ListDetailPaneScaffold',
        component: 'ListDetailLayout',
        params: [
          { compose: 'listPane', windmorph: 'list' },
          { compose: 'detailPane', windmorph: 'detail' },
          {
            compose: 'directive, value (from rememberListDetailPaneScaffoldNavigator())',
            windmorph: 'active, detailKey',
            note: "The app's route picks the pane that shows; there's no navigator object.",
          },
        ],
        note: 'From the adaptive layouts library (`material3-adaptive`), not Material 3 itself. Two panes only, with no extra pane.',
      },
    ],
  },
  'media-grid': {
    covers: [
      {
        name: 'A row that scrolls sideways on compact windows',
        kind: 'configuration',
        examples: ['media-grid/media-grid-viewer', 'media-grid/media-grid-columns'],
      },
      {
        name: 'Some of the photos (`max`), opening the viewer out of the pressed tile',
        kind: 'use case',
        examples: ['media-grid/media-grid-viewer'],
      },
      {
        name: 'Columns from medium windows up (`columns`)',
        kind: 'configuration',
        examples: ['media-grid/media-grid-columns'],
      },
    ],
  },
  'media-viewer': {
    covers: [
      {
        name: 'Opened from thumbnails, at the pressed photo',
        kind: 'use case',
        examples: ['media-viewer/media-viewer-gallery'],
      },
      {
        name: 'Growing out of the thumbnail tapped (`origin`, the M3 container transform)',
        kind: 'configuration',
        examples: ['media-viewer/media-viewer-gallery'],
      },
      {
        name: 'Captions, cut to two lines until tapped',
        kind: 'configuration',
        examples: ['media-viewer/media-viewer-gallery'],
      },
      {
        name: 'Actions in the top bar (`actions`)',
        kind: 'configuration',
        examples: ['media-viewer/media-viewer-actions'],
      },
      {
        name: 'Translated words (`labels`)',
        kind: 'configuration',
        examples: ['media-viewer/media-viewer-actions'],
      },
    ],
  },
  'shaped-icon': {
    covers: [
      {
        name: 'Sizes: `sm`, `md`, `lg`, `xl`',
        kind: 'configuration',
        examples: ['shaped-icon/shaped-icon-sizes'],
      },
      {
        name: 'A circle or an M3 Expressive shape',
        kind: 'variant',
        examples: ['shaped-icon/shaped-icon-sizes', 'shaped-icon/shaped-icon-steps'],
      },
      {
        name: 'Tones: primary, secondary, tertiary, neutral, error',
        kind: 'variant',
        examples: ['shaped-icon/shaped-icon-tones'],
      },
      {
        name: 'Leading icons for steps or features',
        kind: 'use case',
        examples: ['shaped-icon/shaped-icon-steps'],
      },
    ],
  },
  'comment-row': {
    covers: [
      {
        name: 'Filled bubble (`variant="filled"`)',
        kind: 'variant',
        examples: ['comment-row/comment-row-thread'],
      },
      {
        name: 'Dashed bubble for a removed comment (`variant="outlined"`)',
        kind: 'variant',
        examples: ['comment-row/comment-row-states'],
      },
      {
        name: 'Being sent (`pending`)',
        kind: 'configuration',
        examples: ['comment-row/comment-row-thread'],
      },
      {
        name: 'Content below the bubble (`below`)',
        kind: 'configuration',
        examples: ['comment-row/comment-row-states'],
      },
      {
        name: 'A named comment (`as="article"`)',
        kind: 'configuration',
        examples: ['comment-row/comment-row-states'],
      },
      {
        name: 'A thread in a list (`as="li"`), with reactions',
        kind: 'use case',
        examples: ['comment-row/comment-row-thread'],
      },
    ],
  },
  accordion: {
    covers: [
      {
        name: 'Standard rows with dividers (`variant="standard"`)',
        kind: 'variant',
        examples: ['accordion/accordion-faq'],
      },
      {
        name: 'Segmented containers (`variant="segmented"`)',
        kind: 'variant',
        examples: ['accordion/accordion-segmented', 'accordion/accordion-parts'],
      },
      {
        name: 'One item open at a time, which can fold fully',
        kind: 'configuration',
        examples: ['accordion/accordion-faq'],
      },
      {
        name: 'Several open at once, controlled (`multiple`, `expandedKeys`)',
        kind: 'configuration',
        examples: ['accordion/accordion-multiple'],
      },
      {
        name: 'Leading icons and supporting text',
        kind: 'configuration',
        examples: ['accordion/accordion-multiple', 'accordion/accordion-dense'],
      },
      {
        name: 'A header from parts (`AccordionHeader`, `AccordionPanel`), and a disabled item',
        kind: 'configuration',
        examples: ['accordion/accordion-parts'],
      },
      {
        name: 'Density, as a core list (`density`)',
        kind: 'configuration',
        examples: ['accordion/accordion-dense'],
      },
      {
        name: 'Closed panels found by find-in-page and `#fragment` links',
        kind: 'use case',
        examples: ['accordion/accordion-find-in-page'],
      },
      {
        name: 'A FAQ, or a long answer with links',
        kind: 'use case',
        examples: ['accordion/accordion-faq', 'accordion/accordion-long-panel'],
      },
    ],
    compose: [
      {
        composable: 'ListItem + AnimatedVisibility',
        component: 'Accordion',
        params: [
          { compose: 'expanded (your own state)', windmorph: 'expandedKeys, onExpandedChange' },
        ],
        note: "Compose Material 3 has no accordion: apps build one from list items and `AnimatedVisibility`. `Accordion` draws its headers as core list items and keeps the open items' state, the keys and the ARIA itself.",
      },
    ],
  },
  collapse: {
    covers: [
      {
        name: 'A disclosure: a button that shows and hides content',
        kind: 'use case',
        examples: ['collapse/collapse-disclosure'],
      },
      {
        name: 'One open at a time, folding as the next opens',
        kind: 'use case',
        examples: ['collapse/collapse-replies'],
      },
      {
        name: 'Open from the start, with no opening motion (`appear={false}`)',
        kind: 'configuration',
        examples: ['collapse/collapse-shown-first'],
      },
      {
        name: 'Kept in the page while closed, found by find-in-page (`keepMounted`)',
        kind: 'configuration',
        examples: ['collapse/collapse-kept-mounted'],
      },
    ],
    compose: [
      {
        composable: 'AnimatedVisibility(enter = expandVertically(), exit = shrinkVertically())',
        component: 'Collapse',
        params: [{ compose: 'visible', windmorph: 'open' }],
        note: "Compose's animation API, not a Material 3 component. `Collapse` opens its height (a CSS grid row, so nothing is measured) on the default spatial spring and folds it over the same time on the default effects spring's easing, which never overshoots, with the content fading on the effects spring.",
      },
    ],
  },
  'expandable-text': {
    covers: [
      {
        name: 'Cut to a number of lines (`lines`), with "See more"',
        kind: 'configuration',
        examples: ['expandable-text/expandable-text-post'],
      },
      {
        name: 'Collapsible again, with "See less" (`collapsible`)',
        kind: 'configuration',
        examples: ['expandable-text/expandable-text-collapsible'],
      },
      {
        name: 'Controlled (`expanded`)',
        kind: 'configuration',
        examples: ['expandable-text/expandable-text-controlled'],
      },
      {
        name: 'Translated buttons (`labels`)',
        kind: 'configuration',
        examples: ['expandable-text/expandable-text-collapsible'],
      },
    ],
  },
  avatar: {
    covers: [
      {
        name: 'A photo (`src`)',
        kind: 'variant',
        examples: ['avatar/avatar-photos'],
      },
      {
        name: 'Initials and icon fallbacks',
        kind: 'variant',
        examples: ['avatar/avatar-fallbacks'],
      },
      {
        name: 'Sizes: `xs` to `2xl` (24 to 96px)',
        kind: 'configuration',
        examples: ['avatar/avatar-fallbacks', 'avatar/avatar-photos'],
      },
      {
        name: 'Circle, rounded and the 35 M3 Expressive shapes',
        kind: 'configuration',
        examples: ['avatar/avatar-shapes'],
      },
      {
        name: 'Tones: `auto` per name, or a fixed role',
        kind: 'configuration',
        examples: ['avatar/avatar-tones'],
      },
      {
        name: 'Presence and badges',
        kind: 'configuration',
        examples: ['avatar/avatar-badges'],
      },
      {
        name: 'A link to a profile (`href`)',
        kind: 'use case',
        examples: ['avatar/avatar-photos'],
      },
      {
        name: 'Groups with "+N" (`AvatarGroup`)',
        kind: 'configuration',
        examples: ['avatar/avatar-group'],
      },
      {
        name: "Linked avatars in a group, in an app's own component, spaced for their touch targets",
        kind: 'use case',
        examples: ['avatar/avatar-group-links'],
      },
    ],
  },
  tag: {
    covers: [
      {
        name: 'Variants: tonal, filled, outlined',
        kind: 'variant',
        examples: ['tag/tag-variants'],
      },
      {
        name: 'Tones: M3 roles plus success and warning',
        kind: 'variant',
        examples: ['tag/tag-variants', 'tag/tag-statuses'],
      },
      {
        name: 'Sizes and shapes: `sm`, `md`, `lg`, full or rounded',
        kind: 'configuration',
        examples: ['tag/tag-sizes'],
      },
      {
        name: 'A live-status dot and a leading icon',
        kind: 'configuration',
        examples: ['tag/tag-statuses'],
      },
      {
        name: 'Short forms (`fullLabel`) and truncation (`maxWidth`), the full text in a tooltip',
        kind: 'configuration',
        examples: ['tag/tag-short-forms'],
      },
      {
        name: 'Component tokens',
        kind: 'use case',
        examples: ['tag/tag-tokens'],
      },
    ],
  },
  'code-block': {
    covers: [
      {
        name: 'Highlighted at build time (`html`), with a title',
        kind: 'use case',
        examples: ['code-block/code-block-highlighted'],
      },
      {
        name: 'Line numbers (`showLineNumbers`)',
        kind: 'configuration',
        examples: ['code-block/code-block-line-numbers'],
      },
      {
        name: 'Plain text, without a title, and without the copy button (`copyable`)',
        kind: 'configuration',
        examples: ['code-block/code-block-plain'],
      },
    ],
    showcaseReason:
      'Its content is source code and the markup a build-time highlighter makes from it, which a control panel cannot produce; the examples show each option with real highlighted code.',
  },
  'props-table': {
    covers: [
      {
        name: "A component's props, with required and default values",
        kind: 'use case',
        examples: ['props-table/props-table-basic'],
      },
      {
        name: 'Translated caption and headings (`labels`)',
        kind: 'configuration',
        examples: ['props-table/props-table-labels'],
      },
    ],
    showcaseReason:
      'Its only content is the rows, data your docs build reads from your types, so a control panel would have nothing to change; the examples show a filled table and translated headings.',
  },
};
