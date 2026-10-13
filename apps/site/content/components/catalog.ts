/**
 * The pure component catalog: metadata only, with NO page-body imports, so it is safe to
 * import from client components (the nav shell, flyout and drawer) without dragging the
 * fs-reading `Body` modules into the client bundle. `registry.tsx` attaches the bodies.
 */

/** The groups the component gallery is organised into, in display order. */
export type ComponentGroup =
  | 'Actions'
  | 'Inputs & selection'
  | 'Containment & overlays'
  | 'Navigation'
  | 'Feedback & pickers'
  | 'Primitives';

/**
 * The rail-group dimension that drives the left navigation rail and the gallery index.
 * One word per id so the rail label fits a single line; `Feedback & pickers` (the canonical
 * `group`) splits into `feedback` and `pickers` here.
 */
export type RailGroupId =
  'actions' | 'inputs' | 'containment' | 'navigation' | 'feedback' | 'pickers' | 'primitives';

export interface RailGroup {
  id: RailGroupId;
  /** ONE WORD — the rail label (fits a single rail line). */
  railLabel: string;
  /** Full name for the flyout header and the gallery section heading. */
  fullName: string;
}

/** Rail order, top to bottom. The gallery uses the same order. */
export const RAIL_GROUPS: RailGroup[] = [
  { id: 'actions', railLabel: 'Actions', fullName: 'Actions' },
  { id: 'inputs', railLabel: 'Inputs', fullName: 'Inputs & selection' },
  { id: 'containment', railLabel: 'Containment', fullName: 'Containment & overlays' },
  { id: 'navigation', railLabel: 'Navigation', fullName: 'Navigation' },
  // feedback members: snackbar, progress, loading-indicator, skeleton
  { id: 'feedback', railLabel: 'Feedback', fullName: 'Feedback' },
  // pickers members: date-picker, time-picker, picker-dialog
  { id: 'pickers', railLabel: 'Pickers', fullName: 'Pickers' },
  { id: 'primitives', railLabel: 'Primitives', fullName: 'Primitives' },
];

/** The rail groups keyed by id, for the shell and gallery to resolve a label. */
export const RAIL_GROUP_MAP: Record<RailGroupId, RailGroup> = Object.fromEntries(
  RAIL_GROUPS.map((group) => [group.id, group]),
) as Record<RailGroupId, RailGroup>;

/**
 * An M3 Expressive specs summary for a component, derived read-only from `packages/react/src`.
 * All fields optional: only values confirmable from source are supplied, and the card
 * renders only the fields present.
 */
export interface ComponentSpecs {
  /** Supported size tokens, e.g. ['xs', 'sm', 'md', 'lg', 'xl']. */
  sizes?: string[];
  /** Resting corner/shape token, e.g. 'rounded-corner-full'. */
  shape?: string;
  /** Supported variant union, e.g. ['filled', 'outlined', 'text']. */
  variants?: string[];
  /** Resting elevation level, e.g. 'level3'. */
  elevation?: string;
}

/** Component page metadata, without the page body (see `ComponentPageMeta` in registry). */
export interface ComponentMeta {
  /** URL slug under `/components/`. */
  slug: string;
  title: string;
  group: ComponentGroup;
  /** The rail/gallery grouping dimension (one-word rail labels; feedback/pickers split). */
  railGroup: RailGroupId;
  /** One-line summary shown in the gallery and the page header. */
  summary: string;
  /** Generated-props `displayName`s whose JSON the template renders as a `PropsTable`. */
  propsComponents: string[];
  /** Whether the page shows an interactive Playground (`full`) or a hand-written showcase. */
  playground?: 'full' | 'showcase';
  /** M3 Expressive specs summary, rendered in the Specs card when present. */
  specs?: ComponentSpecs;
  /** Related component slugs, shown as a short "Related" line. */
  related?: string[];
  /** A short "when not to use" note. */
  whenNotToUse?: string;
  /** Other words people search for, e.g. "OTP" for the PIN input. Matched by the site search. */
  keywords?: string[];
  /**
   * The hooks this page documents (`useFileTrigger`). Searchable by name, like the components
   * in `propsComponents`.
   */
  hooks?: string[];
  /** Marks a component whose source/story flags it as preview. */
  stability?: 'preview';
  /**
   * Marks one of the M3 Expressive (May 2025) components — new or substantially updated with
   * expressive shape, motion and emphasis. Drives the "Expressive" chip in the gallery.
   */
  expressive?: boolean;
  /**
   * Marks a Windmorph Pro component: an addition that is NOT part of Material Design 3, shipped
   * from `@windmorph/react-pro`. Drives the "Pro" chip in the gallery.
   */
  pro?: boolean;
}

/** Every component's metadata, in display order. */
export const COMPONENT_META: ComponentMeta[] = [
  {
    slug: 'button',
    title: 'Button',
    group: 'Actions',
    railGroup: 'actions',
    summary: 'Five variants and five sizes for text actions, with a toggle form and a press morph.',
    propsComponents: ['Button'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      shape: 'rounded-corner-full',
      variants: ['elevated', 'filled', 'tonal', 'outlined', 'text'],
    },
    related: ['icon-button', 'button-group', 'fab'],
    whenNotToUse:
      'For an icon-only action use an IconButton; for the single most important action on a screen use a FAB.',
  },
  {
    slug: 'icon-button',
    title: 'Icon button',
    group: 'Actions',
    railGroup: 'actions',
    summary: 'A compact icon-only action; requires an accessible name.',
    propsComponents: ['IconButton'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      shape: 'rounded-corner-full',
      variants: ['standard', 'filled', 'tonal', 'outlined'],
    },
    related: ['button', 'fab', 'toolbars'],
    whenNotToUse: 'When the action has a short text label, use a Button so the label is visible.',
  },
  {
    slug: 'button-group',
    title: 'Button group',
    group: 'Actions',
    railGroup: 'actions',
    summary: 'Groups buttons as a unit; the connected variant replaces segmented buttons.',
    propsComponents: ['ButtonGroup'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      variants: ['standard', 'connected'],
    },
    related: ['button', 'split-button'],
    whenNotToUse:
      'For a single action use a Button; for a primary action with a related menu use a Split button.',
  },
  {
    slug: 'split-button',
    title: 'Split button',
    group: 'Actions',
    railGroup: 'actions',
    summary: 'A primary action beside a trailing button that opens a menu of related actions.',
    propsComponents: ['SplitButton'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      variants: ['filled', 'elevated', 'tonal', 'outlined'],
    },
    related: ['button', 'button-group', 'menu'],
    whenNotToUse: 'When the trailing menu adds no related choices, a single Button is clearer.',
  },
  {
    slug: 'fab',
    title: 'FAB',
    group: 'Actions',
    railGroup: 'actions',
    summary: "A screen's single most important action, as an icon or an extended label.",
    propsComponents: ['Fab', 'ExtendedFab'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['default', 'medium', 'large'],
      shape: 'rounded-corner-large',
      elevation: 'level3',
    },
    related: ['fab-menu', 'icon-button', 'button'],
    keywords: ['floating action button', 'extended FAB', 'tooltip', 'show', 'hide', 'flat'],
    whenNotToUse: 'For secondary actions use a Button or IconButton; a screen has one FAB at most.',
  },
  {
    slug: 'fab-menu',
    title: 'FAB menu',
    group: 'Actions',
    railGroup: 'actions',
    summary: 'A FAB that opens two to six related actions above it, or a menu on the web.',
    propsComponents: ['FabMenu', 'FabMenuItem'],
    playground: 'full',
    expressive: true,
    specs: {
      shape: 'rounded-corner-large',
      elevation: 'level3',
    },
    related: ['fab', 'menu', 'toolbars'],
    keywords: ['speed dial', 'menu', 'actions'],
    whenNotToUse: 'For a single action use a plain FAB; for a long list of choices use a Menu.',
  },
  {
    slug: 'reaction-picker',
    title: 'Reaction picker',
    group: 'Actions',
    railGroup: 'actions',
    summary:
      'A reaction button that likes on tap, with a floating row of reactions on long press, hover or the keyboard; slide a finger along it to pick. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['ReactionPicker'],
    playground: 'full',
    pro: true,
    specs: { sizes: ['sm', 'md'], shape: 'rounded-corner-full' },
    related: ['icon-button', 'button', 'toolbars'],
    whenNotToUse:
      'For a single on/off action, such as Save or Follow, use a toggle Button or IconButton.',
    keywords: [
      'reaction',
      'reactions',
      'like',
      'like button',
      'emoji',
      'emoji picker',
      'love',
      'react',
      'long press',
      'feed',
      'social',
      'facebook',
    ],
  },
  {
    slug: 'reaction-summary',
    title: 'Reaction summary',
    group: 'Actions',
    railGroup: 'actions',
    summary:
      'The reactions so far: the top kinds’ icons and how many, stacked under a post or as a chip in a comment; pressable to see who reacted. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['ReactionSummary'],
    playground: 'showcase',
    pro: true,
    related: ['reaction-picker', 'comment-row', 'badge'],
    whenNotToUse: 'To react, use the Reaction picker; for an unread count, a Badge.',
    keywords: ['reactions', 'likes', 'count', 'tally', 'emoji', 'who reacted'],
  },

  {
    slug: 'text-field',
    title: 'Text field',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'Filled or outlined text input with a floating label, icons, affixes, counter, error icon and a text area.',
    propsComponents: ['TextField'],
    playground: 'full',
    specs: {
      variants: ['filled', 'outlined'],
      shape: 'rounded-corner-extra-small',
    },
    related: ['checkbox', 'radio-group', 'slider'],
    whenNotToUse:
      'For a yes/no choice use a Checkbox or Switch; for picking one of a few options use a Radio group.',
  },
  {
    slug: 'message-field',
    title: 'Message field',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'A rounded field for writing something to send (a comment, a reply, a chat message) that grows from a pill into a box, with a send button, tools that open into their own row on focus, a reply banner and attachments; plus its trigger. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['MessageField', 'MessageFieldFrame', 'MessageFieldTrigger'],
    playground: 'full',
    pro: true,
    specs: {
      sizes: ['sm', 'md', 'lg'],
      variants: ['filled', 'tonal', 'outlined'],
      shape: 'rounded-corner-full',
    },
    related: ['text-field', 'search', 'media-upload-grid'],
    whenNotToUse:
      'For form input sent with the rest of a form use a Text field; for search use a Search bar.',
    keywords: [
      'composer',
      'chat input',
      'comment box',
      'message input',
      'send',
      'reply',
      'chat',
      'comment',
      'textarea',
      'auto grow',
      'autosize',
      "what's on your mind",
      'tools',
      'emoji',
      'attach',
      'useMessageField',
      'MessageFieldFrame',
      'MessageFieldSend',
      'docked',
      'character limit',
    ],
    hooks: ['useMessageField', 'useMessageFieldInput', 'useCoarsePointer'],
  },
  {
    slug: 'rich-message-field',
    title: 'Rich message field',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'A message field that formats as you type, as Slack’s: bold, italic, strike, code, links, lists, quotes and code blocks, with a formatting toolbar, and @mentions that suggest people; plus FormattedText, which shows what it wrote. Not an M3 component (@windmorph/react-pro/rich-text, with Tiptap).',
    propsComponents: ['RichMessageField', 'FormattingToolbar', 'FormattedText'],
    playground: 'showcase',
    pro: true,
    related: ['message-field', 'text-field'],
    whenNotToUse:
      'For plain messages use a Message field; for long documents with headings and tables, a full editor.',
    keywords: [
      'rich text',
      'formatting',
      'mention',
      '@mention',
      'tag people',
      'autocomplete',
      'markdown',
      'slack',
      'bold',
      'italic',
      'code block',
      'editor',
      'wysiwyg',
      'tiptap',
      'formatted text',
      'markers',
      'parseMarkers',
    ],
    hooks: ['useRichMessageField'],
  },
  {
    slug: 'select',
    title: 'Select',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'An exposed dropdown menu: a field that opens a menu of options. One or several choices, sections, a search for long lists, a sheet on phones.',
    propsComponents: ['Select', 'SelectItem'],
    playground: 'full',
    specs: {
      variants: ['filled', 'outlined'],
      shape: 'rounded-corner-extra-small',
      elevation: 'level2',
    },
    related: ['autocomplete', 'radio-group', 'menu', 'text-field'],
    whenNotToUse:
      'For a long list or options from a server use an Autocomplete; for up to about five options that should stay visible, a Radio group; for actions, a Menu.',
    keywords: [
      'dropdown',
      'drop-down',
      'picker',
      'select box',
      'exposed dropdown menu',
      'options',
      'combobox',
      'searchable select',
      'select with search',
    ],
  },
  {
    slug: 'autocomplete',
    title: 'Autocomplete',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'A field you type into, with a menu of matching options. Accent-insensitive filtering, input chips for several choices, server results.',
    propsComponents: ['Autocomplete', 'AutocompleteItem'],
    playground: 'full',
    specs: {
      variants: ['filled', 'outlined'],
      shape: 'rounded-corner-extra-small',
      elevation: 'level2',
    },
    related: ['select', 'search', 'chips', 'text-field'],
    whenNotToUse:
      'For a short, known list use a Select; to search content rather than choose a value, use Search.',
    keywords: [
      'combobox',
      'combo box',
      'typeahead',
      'type-ahead',
      'autosuggest',
      'suggestions',
      'dropdown',
      'picker',
      'filter',
      'tags',
      'multi-select',
    ],
  },
  {
    slug: 'file-trigger',
    title: 'File trigger',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'Makes any library button open the file picker, or the camera on phones; useFileTrigger does it from a menu item. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['FileTrigger'],
    hooks: ['useFileTrigger'],
    playground: 'showcase',
    pro: true,
    related: ['image-crop', 'button', 'icon-button'],
    whenNotToUse:
      'For several photos that people drop, reorder and watch upload, a Media upload grid.',
    keywords: [
      'file',
      'upload',
      'file picker',
      'file input',
      'attach',
      'camera',
      'photo upload',
      'browse',
    ],
  },
  {
    slug: 'image-crop',
    title: 'Image crop',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'Frames a photo before upload: drag, pinch or zoom it behind a fixed frame, and get the crop in the original pixels. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['ImageCropDialog', 'ImageCropper'],
    playground: 'showcase',
    pro: true,
    specs: {
      shape: 'rounded-corner-medium',
    },
    related: ['dialog', 'slider', 'avatar'],
    whenNotToUse:
      'For photos shown as uploaded (attachments, documents, chat images), skip the crop and upload the file.',
    keywords: [
      'crop',
      'cropper',
      'avatar',
      'profile picture',
      'photo',
      'image',
      'upload',
      'zoom',
      'pan',
    ],
  },
  {
    slug: 'media-upload-grid',
    title: 'Media upload grid',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'The photos someone is adding: upload progress and errors, remove and retry, drag to reorder (mouse, touch or keyboard), an add tile and file drop. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['MediaUploadGrid'],
    playground: 'showcase',
    pro: true,
    specs: {
      shape: 'rounded-corner-medium',
    },
    related: ['file-trigger', 'image-crop', 'progress'],
    whenNotToUse:
      'For one photo, such as a profile picture, use a File trigger and an Image crop; for documents, list the files instead.',
    keywords: [
      'upload',
      'photo upload',
      'image upload',
      'gallery',
      'photos',
      'attachments',
      'drag and drop',
      'drop zone',
      'dropzone',
      'reorder',
      'sortable',
      'thumbnails',
      'composer',
      'file upload',
    ],
  },
  {
    slug: 'phone-field',
    title: 'Phone field',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'A phone number with a searchable country picker; formats as typed and reports E.164. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['PhoneField'],
    playground: 'full',
    pro: true,
    specs: {
      variants: ['outlined', 'filled'],
      shape: 'rounded-corner-extra-small',
    },
    related: ['text-field', 'pin-input'],
    whenNotToUse:
      'For a number whose country never varies and needs no checking, a Text field with type="tel" is enough.',
    keywords: [
      'telephone',
      'mobile',
      'tel',
      'country code',
      'dialling code',
      'international',
      'E.164',
    ],
  },
  {
    slug: 'pin-input',
    title: 'PIN input',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary:
      'One box per character for verification codes, PINs and vouchers, with paste and one-time-code autofill. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['PinInput'],
    playground: 'full',
    pro: true,
    specs: {
      sizes: ['small', 'medium', 'large'],
      variants: ['outlined', 'filled'],
      shape: 'rounded-corner-extra-small',
    },
    related: ['text-field'],
    whenNotToUse:
      'For anything of variable or longer length (passwords, recovery keys, phone numbers), use a Text field.',
    keywords: [
      'OTP',
      'one-time code',
      'verification code',
      'two-factor',
      '2FA',
      'passcode',
      'code input',
    ],
  },
  {
    slug: 'checkbox',
    title: 'Checkbox',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary: 'Selects any number of options, with checked, unchecked and indeterminate states.',
    propsComponents: ['Checkbox'],
    playground: 'full',
    related: ['switch', 'radio-group'],
    whenNotToUse:
      'For a single setting that takes effect immediately use a Switch; for one choice from a set use a Radio group.',
  },
  {
    slug: 'radio-group',
    title: 'Radio group',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary: 'A set of radio buttons for picking exactly one option; a Radio needs a RadioGroup.',
    propsComponents: ['RadioGroup', 'Radio'],
    playground: 'full',
    related: ['checkbox', 'switch'],
    whenNotToUse:
      'When any number of options may be selected use checkboxes; for a long list of choices use a Menu.',
  },
  {
    slug: 'switch',
    title: 'Switch',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary: 'Toggles a single setting on or off, with optional icons in the thumb.',
    propsComponents: ['Switch'],
    playground: 'full',
    related: ['checkbox'],
    whenNotToUse: 'When the change needs confirmation or a Save action, use a Checkbox instead.',
  },
  {
    slug: 'slider',
    title: 'Slider',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary: 'Chooses a value or a range on a continuous or stepped scale, in five sizes.',
    propsComponents: ['Slider', 'RangeSlider'],
    playground: 'full',
    expressive: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    related: ['text-field'],
    whenNotToUse:
      'When a precise value matters, use a Text field; for a few discrete options use a Radio group.',
  },
  {
    slug: 'chips',
    title: 'Chips',
    group: 'Inputs & selection',
    railGroup: 'inputs',
    summary: 'Assist, suggestion, filter and input chips for compact actions and entries.',
    propsComponents: ['AssistChip', 'SuggestionChip', 'FilterChip', 'InputChip'],
    playground: 'full',
    specs: {
      variants: ['assist', 'suggestion', 'filter', 'input'],
      shape: 'rounded-corner-small',
    },
    related: ['button', 'text-field'],
    whenNotToUse:
      'For a primary action use a Button; for picking one of a fixed set in a form use a Radio group.',
  },
  {
    slug: 'card',
    title: 'Card',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary: 'A container for related content in three forms: static, pressable or a link.',
    propsComponents: ['Card'],
    playground: 'full',
    specs: {
      variants: ['filled', 'elevated', 'outlined'],
      shape: 'rounded-corner-medium',
    },
    related: ['list', 'carousel', 'dialog'],
    whenNotToUse:
      'For a plain row of text use a List item; for full-screen content a card adds no value.',
  },
  {
    slug: 'dialog',
    title: 'Dialog',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A modal surface for a focused task or a decision, with flat title, content and actions, or full screen on compact windows.',
    propsComponents: [
      'Dialog',
      'DialogTrigger',
      'DialogTitle',
      'DialogHeader',
      'DialogContent',
      'DialogActions',
    ],
    playground: 'showcase',
    specs: {
      shape: 'rounded-corner-extra-large',
      elevation: 'level3',
    },
    related: ['sheets', 'menu', 'snackbar'],
    keywords: ['modal', 'full screen', 'fullscreen', 'popup', 'confirm'],
    whenNotToUse:
      'For a brief, non-blocking message use a Snackbar; for content that need not interrupt use a Sheet.',
  },
  {
    slug: 'menu',
    title: 'Menu',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A temporary list of choices anchored to a trigger, with groups, selection and typeahead.',
    propsComponents: ['Menu', 'MenuItem', 'MenuGroup', 'MenuTrigger'],
    playground: 'showcase',
    specs: {
      elevation: 'level2',
    },
    related: ['split-button', 'list', 'dialog'],
    whenNotToUse:
      'For a persistent set of choices use a List or Tabs; for a single action use a Button.',
  },
  {
    slug: 'tooltip',
    title: 'Tooltip',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary: 'A plain label on hover or focus, or a rich tooltip with a subhead and an action.',
    propsComponents: ['Tooltip', 'RichTooltip', 'TooltipTrigger', 'RichTooltipTrigger'],
    playground: 'showcase',
    specs: {
      variants: ['plain', 'rich'],
    },
    related: ['icon-button', 'badge'],
    whenNotToUse:
      "Don't hide essential information in a tooltip; put it in the UI. Touch users cannot hover.",
  },
  {
    slug: 'sheets',
    title: 'Sheets',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary: 'Bottom and side sheets for supplementary content, modal or standing in the layout.',
    propsComponents: ['BottomSheet', 'SideSheet', 'SheetTrigger'],
    playground: 'showcase',
    specs: {
      variants: ['modal', 'standard'],
      shape: 'rounded-corner-large',
      elevation: 'level1',
    },
    related: ['dialog', 'menu'],
    whenNotToUse: 'For a focused decision that must block the screen use a Dialog.',
  },
  {
    slug: 'list',
    title: 'List',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'Rows with headline, overline, supporting text and leading or trailing content (icons, avatars, images, video thumbnails); items can be links, switches, checkboxes or radio buttons.',
    propsComponents: ['List', 'ListItem', 'ListItemImage', 'ListItemVideo'],
    keywords: [
      'settings',
      'image list',
      'thumbnail',
      'video thumbnail',
      'divider',
      'line clamp',
      'ellipsis',
      'settings menu',
      'link list',
      'switch item',
      'checkbox item',
      'radio list',
      'toggle row',
      'segmented',
    ],
    playground: 'full',
    specs: {
      variants: ['standard', 'segmented'],
    },
    related: ['card', 'menu'],
    whenNotToUse:
      'For top-level navigation use a Navigation rail or bar; for tabular data use a table.',
  },
  {
    slug: 'list-detail-layout',
    title: 'List-detail layout',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      "M3's list-detail canonical layout: one pane at a time on phones, the list beside the open item from 840px. For settings, an inbox or a dashboard. Not an M3 component (@windmorph/react-pro).",
    propsComponents: ['ListDetailLayout'],
    playground: 'showcase',
    pro: true,
    specs: {
      variants: ['plain', 'filled'],
      shape: 'rounded-corner-large',
    },
    related: ['list', 'navigation-rail', 'sheets'],
    whenNotToUse:
      "For a few peer views use Tabs; for a short task that doesn't need its own URL, a Dialog.",
    keywords: [
      'list detail',
      'list-detail',
      'master detail',
      'two pane',
      'split view',
      'canonical layout',
      'settings',
      'inbox',
      'adaptive layout',
    ],
  },
  {
    slug: 'carousel',
    title: 'Carousel',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A scrollable row of items that resize along keylines: multi-browse, uncontained or hero.',
    propsComponents: ['Carousel'],
    playground: 'showcase',
    expressive: true,
    specs: {
      variants: ['multi-browse', 'uncontained', 'hero'],
      shape: 'rounded-corner-extra-large',
    },
    related: ['card', 'tabs'],
    whenNotToUse: 'When every item must be seen at once, use a grid of Cards instead.',
  },
  {
    slug: 'media-grid',
    title: 'Media grid',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'Square photo tiles, a sideways row on compact windows and a grid from medium up; a tile opens the viewer. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['MediaGrid'],
    playground: 'showcase',
    pro: true,
    related: ['media-viewer', 'media-upload-grid', 'carousel'],
    whenNotToUse:
      'For one large swipeable set use a Carousel; for photos being uploaded, the Media upload grid.',
    keywords: ['photos', 'gallery', 'grid', 'thumbnails', 'images', 'tiles', 'album'],
  },
  {
    slug: 'media-viewer',
    title: 'Media viewer',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A full-screen viewer for a set of photos: swipe between them, zoom, and read each caption and position. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['MediaViewer'],
    playground: 'showcase',
    pro: true,
    related: ['carousel', 'dialog', 'image-crop'],
    whenNotToUse:
      'To browse items inline on the page, use a Carousel; to frame a photo before upload, an Image crop.',
    keywords: [
      'lightbox',
      'gallery',
      'photo viewer',
      'image viewer',
      'slideshow',
      'fullscreen',
      'zoom',
      'pinch',
      'swipe',
      'photos',
    ],
  },
  {
    slug: 'shaped-icon',
    title: 'Shaped icon',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      "An icon in a circle or an M3 Expressive shape, in a tone's container colours: emphasis for steps, features and empty states. Not an M3 component (@windmorph/react-pro).",
    propsComponents: ['ShapedIcon'],
    playground: 'full',
    pro: true,
    related: ['empty-state', 'avatar', 'icon-button'],
    whenNotToUse: 'For something to press use an Icon button; for a person or business, an Avatar.',
    keywords: [
      'icon',
      'shape',
      'expressive',
      'cookie',
      'flower',
      'feature icon',
      'step icon',
      'decorative',
    ],
  },
  {
    slug: 'comment-row',
    title: 'Comment row',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'One comment or message in a thread: avatar, bubble, what goes under it and a 48dp actions row that spaces the comments. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['CommentRow'],
    playground: 'showcase',
    pro: true,
    related: ['reaction-picker', 'reaction-summary', 'collapse', 'message-field'],
    whenNotToUse: 'For rows of a settings list or a menu use a List.',
    keywords: ['comment', 'reply', 'message', 'chat', 'bubble', 'thread', 'conversation', 'review'],
  },
  {
    slug: 'collapse',
    title: 'Collapse',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'Content that opens and folds on its height, as an accordion when two switch together: reply fields, answers, more filters. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['Collapse'],
    playground: 'showcase',
    pro: true,
    related: ['expandable-text', 'message-field', 'list'],
    whenNotToUse:
      'For text cut to a few lines use Expandable text; for content over the page, a dialog or a sheet.',
    keywords: ['accordion', 'disclosure', 'expand', 'fold', 'reveal', 'show', 'hide', 'height'],
  },
  {
    slug: 'expandable-text',
    title: 'Expandable text',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'Text cut to a few lines with "See more", shown only when it is cut, that expands it in place: posts, comments, reviews and bios. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['ExpandableText'],
    playground: 'full',
    pro: true,
    related: ['card', 'link', 'list'],
    whenNotToUse:
      'For whole sections behind a heading use a list or a disclosure; to open the full text on its own page, a Link.',
    keywords: [
      'see more',
      'read more',
      'show more',
      'show less',
      'truncate',
      'line clamp',
      'clamp',
      'ellipsis',
      'collapse',
      'expand',
      'long text',
    ],
  },
  {
    slug: 'avatar',
    title: 'Avatar',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A picture with an initials or icon fallback, badges, 35 Expressive shapes and groups. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['Avatar', 'AvatarGroup'],
    playground: 'full',
    pro: true,
    specs: {
      sizes: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      shape: 'rounded-corner-full',
    },
    related: ['badge', 'chips', 'list'],
    whenNotToUse: 'For a status count or dot on an icon, use a Badge.',
  },
  {
    slug: 'badge',
    title: 'Badge',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary: 'A small dot or a short count or label, placed on an anchor with BadgedBox.',
    propsComponents: ['Badge', 'BadgedBox'],
    playground: 'showcase',
    specs: {
      sizes: ['small', 'large'],
      shape: 'rounded-corner-full',
    },
    related: ['navigation-bar', 'icon-button'],
    whenNotToUse: 'For a status that needs a label and context, use a Chip or inline text.',
  },
  {
    slug: 'tag',
    title: 'Tag',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary:
      'A small, static label for a status or category: Sold, Open now, Featured. Tonal, filled or outlined, in M3 and success and warning tones. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['Tag', 'TagGroup'],
    playground: 'full',
    pro: true,
    specs: {
      shape: 'rounded-corner-full',
      variants: ['tonal', 'filled', 'outlined'],
    },
    related: ['badge', 'chips'],
    whenNotToUse:
      'For something pressable use a chip; for a count on an icon or avatar use a Badge.',
    keywords: ['tag', 'label', 'status', 'pill', 'lozenge', 'category', 'chip', 'badge', 'token'],
  },
  {
    slug: 'divider',
    title: 'Divider',
    group: 'Containment & overlays',
    railGroup: 'containment',
    summary: 'A thin line that separates content, horizontal or vertical, with optional insets.',
    propsComponents: ['Divider'],
    playground: 'full',
    related: ['list', 'card'],
    whenNotToUse: 'When whitespace already groups content, a divider adds visual noise.',
  },
  {
    slug: 'skip-link',
    title: 'Skip link',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      '"Skip to content" for keyboard users: off screen until focused, then it moves focus past the navigation (WCAG 2.4.1). Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['SkipLink'],
    playground: 'showcase',
    pro: true,
    related: ['link', 'top-app-bar'],
    whenNotToUse: 'For navigation people see, use a Link or the navigation components.',
    keywords: [
      'skip link',
      'skip to content',
      'skip navigation',
      'bypass blocks',
      'accessibility',
      'keyboard',
    ],
  },
  {
    slug: 'link',
    title: 'Link',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      'Navigation written as text: in a sentence, as a name, or on its own line. Underlined in text, routed like every library link, with new-tab handling. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['Link'],
    playground: 'full',
    pro: true,
    related: ['button', 'list'],
    whenNotToUse:
      "For a section's or dialog's action use a text Button; for a whole card or row, a Card or ListItem with href.",
    keywords: [
      'link',
      'anchor',
      'hyperlink',
      'text link',
      'href',
      'url',
      'external link',
      'link button',
      'onPress',
    ],
  },
  {
    slug: 'navigation-rail',
    title: 'Navigation rail',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      'Top-level destinations along the start edge, collapsed or expanded, in medium windows.',
    propsComponents: ['NavigationRail', 'NavigationRailItem'],
    playground: 'showcase',
    expressive: true,
    related: ['navigation-bar', 'tabs'],
    whenNotToUse: 'In compact windows use a Navigation bar; for in-page sections use Tabs.',
  },
  {
    slug: 'navigation-bar',
    title: 'Navigation bar',
    group: 'Navigation',
    railGroup: 'navigation',
    summary: '3–5 destinations along the bottom of compact and medium windows, stacked or inline.',
    propsComponents: ['NavigationBar', 'NavigationBarItem'],
    playground: 'showcase',
    expressive: true,
    related: ['navigation-rail', 'tabs'],
    whenNotToUse: 'For more than five destinations use a Navigation rail or drawer.',
  },
  {
    slug: 'tabs',
    title: 'Tabs',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      'Primary and secondary tab rows with a sliding indicator, scrollable when they overflow.',
    propsComponents: ['Tabs', 'Tab'],
    keywords: ['tab bar', 'badge', 'swipe', 'segmented sections'],
    playground: 'full',
    specs: {
      variants: ['primary', 'secondary'],
    },
    related: ['navigation-bar', 'top-app-bar'],
    whenNotToUse: 'For top-level app destinations use a Navigation bar or rail, not tabs.',
  },
  {
    slug: 'top-app-bar',
    title: 'Top app bar',
    group: 'Navigation',
    railGroup: 'navigation',
    summary: 'A header with the screen title and actions, in three sizes, with scroll behaviour.',
    propsComponents: ['TopAppBar'],
    playground: 'showcase',
    specs: {
      variants: ['center', 'small', 'medium', 'large'],
    },
    related: ['toolbars', 'search', 'navigation-rail'],
    whenNotToUse: 'For actions tied to content rather than the screen, use a Toolbar.',
  },
  {
    slug: 'search',
    title: 'Search',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      'A search bar that expands into a docked or full-screen view, and an app bar with search.',
    propsComponents: ['SearchBar', 'SearchAppBar'],
    playground: 'showcase',
    specs: {
      variants: ['docked', 'full-screen'],
    },
    related: ['top-app-bar', 'text-field'],
    whenNotToUse: 'For a simple filter field inside a form use a Text field.',
  },
  {
    slug: 'toolbars',
    title: 'Toolbars',
    group: 'Navigation',
    railGroup: 'navigation',
    summary:
      'Docked and floating toolbars of related actions, with an optional FAB, scroll collapse and scroll exit.',
    propsComponents: ['DockedToolbar', 'FloatingToolbar', 'ToolbarFab'],
    hooks: ['useToolbarScrollExpansion', 'useToolbarScrollExit'],
    playground: 'showcase',
    expressive: true,
    specs: {
      variants: ['docked', 'floating'],
    },
    related: ['top-app-bar', 'fab', 'icon-button'],
    keywords: ['bottom app bar', 'action bar', 'overflow menu', 'scroll'],
    whenNotToUse: 'For the screen title and global actions use a Top app bar.',
  },
  {
    slug: 'alert',
    title: 'Alert',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary:
      "A message that stays until it's resolved: a form's error, a page's warning, a system notice. Error, info, success, warning and neutral, tonal or outlined. Not an M3 component (@windmorph/react-pro).",
    propsComponents: ['Alert'],
    playground: 'full',
    pro: true,
    specs: {
      shape: 'rounded-corner-medium',
      variants: ['tonal', 'outlined'],
    },
    related: ['snackbar', 'dialog', 'empty-state'],
    whenNotToUse:
      'For brief feedback use a Snackbar; for one field, its error text; for a decision that blocks the page, a Dialog.',
    keywords: [
      'alert',
      'banner',
      'notice',
      'message',
      'error message',
      'callout',
      'warning',
      'success',
    ],
  },
  {
    slug: 'snackbar',
    title: 'Snackbar',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary: 'A brief message with an optional action and dismiss, queued through a host.',
    propsComponents: ['Snackbar', 'SnackbarHost'],
    hooks: ['useSnackbarHostState'],
    playground: 'showcase',
    related: ['dialog', 'progress'],
    whenNotToUse:
      'For a message that must be acknowledged use a Dialog; for persistent status use inline text.',
  },
  {
    slug: 'progress',
    title: 'Progress indicators',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary: 'Linear and circular indicators, determinate or indeterminate, flat or wavy.',
    propsComponents: ['LinearProgressIndicator', 'CircularProgressIndicator'],
    playground: 'full',
    expressive: true,
    specs: {
      variants: ['linear', 'circular'],
    },
    related: ['loading-indicator', 'snackbar'],
    whenNotToUse: 'For an indeterminate wait of unknown length prefer the Loading indicator.',
  },
  {
    slug: 'load-more',
    title: 'Load more',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary:
      'The end of a list loaded a page at a time: loads as the end comes near, with Load more, a loading state and Retry. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['LoadMore'],
    playground: 'showcase',
    pro: true,
    related: ['loading-indicator', 'skeleton', 'list'],
    whenNotToUse: 'For numbered pages people jump between, use pagination.',
    keywords: [
      'infinite scroll',
      'pagination',
      'load more',
      'paging',
      'next page',
      'retry',
      'feed',
    ],
  },
  {
    slug: 'loading-indicator',
    title: 'Loading indicator',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary: 'An Expressive shape that morphs while it rotates; replaces the spinning circle.',
    propsComponents: ['LoadingIndicator'],
    playground: 'full',
    expressive: true,
    specs: {
      variants: ['default', 'contained'],
      shape: 'rounded-corner-full',
    },
    related: ['progress'],
    whenNotToUse: 'When progress can be measured, use a determinate Progress indicator instead.',
  },
  {
    slug: 'skeleton',
    title: 'Skeleton',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary:
      'A placeholder in the shape of loading content, pure CSS with pulse or shimmer. Not an M3 component (@windmorph/react-pro).',
    propsComponents: ['Skeleton', 'SkeletonGroup'],
    playground: 'full',
    pro: true,
    specs: {
      shape: 'rounded-corner-small',
      variants: ['rectangle', 'text', 'circle'],
    },
    related: ['loading-indicator', 'progress'],
    whenNotToUse:
      'When the shape of the coming content is unknown, or a whole page is loading, use the Loading indicator.',
  },
  {
    slug: 'empty-state',
    title: 'Empty state',
    group: 'Feedback & pickers',
    railGroup: 'feedback',
    summary:
      "Fills a region with nothing to show: no posts yet, no results, coming soon, or couldn't load with a retry. Not an M3 component (@windmorph/react-pro).",
    propsComponents: ['EmptyState'],
    playground: 'full',
    pro: true,
    specs: {
      shape: 'rounded-full',
      variants: ['plain', 'filled', 'elevated', 'outlined'],
    },
    related: ['card', 'skeleton', 'snackbar'],
    whenNotToUse:
      'While content loads, use a Skeleton; for feedback about an action, a Snackbar; for a form field, helper text.',
    keywords: [
      'empty',
      'empty state',
      'no results',
      'no data',
      'blank',
      'zero state',
      'nothing here',
      'placeholder',
      'error state',
      'retry',
    ],
  },
  {
    slug: 'date-picker',
    title: 'Date picker',
    group: 'Feedback & pickers',
    railGroup: 'pickers',
    summary:
      'Pick a single date or a range on a month grid or by typing, docked below a field or in a dialog.',
    propsComponents: ['DatePicker', 'DateRangePicker', 'DateField'],
    playground: 'showcase',
    related: ['time-picker', 'picker-dialog', 'text-field'],
    whenNotToUse:
      'For a date far in the past or future, such as a date of birth, use the docked DateField or the typed input rather than the calendar.',
    keywords: [
      'calendar',
      'date field',
      'date input',
      'docked',
      'date range',
      'day',
      'month',
      'year',
    ],
  },
  {
    slug: 'time-picker',
    title: 'Time picker',
    group: 'Feedback & pickers',
    railGroup: 'pickers',
    summary: 'Pick an hour and minute on a clock dial or by typing, 12- or 24-hour.',
    propsComponents: ['TimePicker', 'TimePickerModeToggle'],
    playground: 'showcase',
    related: ['date-picker', 'picker-dialog'],
    whenNotToUse: 'For a rough time of day, a Select of presets may be simpler than a clock dial.',
    keywords: [
      'clock',
      'dial',
      'hour',
      'minute',
      'time input',
      'alarm',
      'am pm',
      '24-hour',
      'useTimePickerRoom',
    ],
  },
  {
    slug: 'picker-dialog',
    title: 'Picker dialog',
    group: 'Feedback & pickers',
    railGroup: 'pickers',
    summary:
      'The modal form of a date or time picker, with confirm, dismiss and mode-toggle slots.',
    propsComponents: ['PickerDialog'],
    playground: 'showcase',
    related: ['date-picker', 'time-picker', 'dialog'],
    whenNotToUse: 'When the picker can sit inline in the layout, the docked form avoids a modal.',
    keywords: ['modal date picker', 'full screen', 'time picker dialog', 'save', 'confirm'],
  },
  {
    slug: 'primitives',
    title: 'Primitives',
    group: 'Primitives',
    railGroup: 'primitives',
    summary:
      'The internal building blocks M3 components are made from, exported for custom controls.',
    propsComponents: [],
    hooks: ['useM3Interaction', 'useM3Morph', 'useM3Spring', 'usePresence', 'useTriggerProps'],
  },
];

/** The catalog keyed by slug. */
export const COMPONENT_META_MAP: Record<string, ComponentMeta> = Object.fromEntries(
  COMPONENT_META.map((meta) => [meta.slug, meta]),
);

/**
 * The pages in a rail group, in alphabetical order by title, so the flyout, the drawer and
 * the gallery list them the same way.
 */
export const pagesInRailGroup = (id: RailGroupId): ComponentMeta[] =>
  COMPONENT_META.filter((meta) => meta.railGroup === id).sort((a, b) =>
    a.title.localeCompare(b.title, 'en'),
  );

/**
 * The rail groups shown in the Browse-components gallery: every rail group EXCEPT the
 * `primitives` reference page (which is a building-block reference, not a component family).
 * This is the single source of truth for the gallery, so its card count and category count
 * stay in step with the homepage stat.
 */
export const GALLERY_RAIL_GROUPS: RailGroup[] = RAIL_GROUPS.filter(
  (group) => group.id !== 'primitives',
);

/**
 * The homepage "Components" stat and the Browse-components gallery card count: the number of
 * component GALLERY PAGES (component families), i.e. every documented page except the
 * Primitives reference. Computed from the catalog, never a literal — this is the exact
 * number of cards the gallery renders.
 */
export const COMPONENT_PAGE_COUNT = COMPONENT_META.filter(
  (meta) => meta.railGroup !== 'primitives',
).length;

/** The number of gallery categories (non-primitive rail groups), for honest hero copy. */
export const CATEGORY_COUNT = GALLERY_RAIL_GROUPS.length;
