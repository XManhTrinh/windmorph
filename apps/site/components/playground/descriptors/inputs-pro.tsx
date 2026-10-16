'use client';

import { Button, IconButton } from '@windmorph/react';
import {
  Avatar,
  FileTrigger,
  ImageCropDialog,
  MessageField,
  PinInput,
  type MediaUploadItem,
} from '@windmorph/react-pro';
import type { MentionSuggestion } from '@windmorph/react-pro/rich-text';
import { createElement, lazy, useState } from 'react';
import {
  AddAPhotoIcon,
  ArrowForwardIcon,
  DeleteIcon,
  EditIcon,
  FormatBoldIcon,
  FormatItalicIcon,
  HistoryIcon,
  InkPenIcon,
  MicIcon,
  ScheduleIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '../../icons';
import { SAMPLE_PHOTO, SAMPLE_PORTRAIT } from '../../../examples/image-crop/sample-photo';
import { SAMPLE_PHOTOS } from '../../../examples/media-upload-grid/sample-photos';
import {
  DENSITY_OPTIONS,
  asDensity,
  loose,
  type PlaygroundDescriptor,
  type PlaygroundUpdate,
} from './shared';

const PinInputAny = loose(PinInput);
const MessageFieldAny = loose(MessageField);
const FileTriggerAny = loose(FileTrigger);
const ImageCropDialogAny = loose(ImageCropDialog);
/*
 * The phone field (its country metadata), the rich message field (Tiptap) and the upload
 * grid weigh a few hundred KB between them, so they load with their own pages' playgrounds
 * instead of with every component page.
 */
const PhoneFieldAny = lazy(async () => ({
  default: loose((await import('@windmorph/react-pro')).PhoneField),
}));
const RichMessageFieldAny = lazy(async () => ({
  default: loose((await import('@windmorph/react-pro/rich-text')).RichMessageField),
}));
const MediaUploadGridAny = lazy(async () => ({
  default: loose((await import('@windmorph/react-pro')).MediaUploadGrid),
}));

/** Remounts a preview when a prop that only counts on mount (`autoFocus`, `defaultOpen`) changes. */
const mountKey = (props: Record<string, unknown>, names: string[]) =>
  names.map((name) => String(props[name] ?? '')).join('|');

/**
 * The slots the message fields share, live: each control is a switch that adds its sample
 * (an avatar, icon buttons, a row of photos) or takes it away. The text is controlled from
 * the panel, and the banner's close button clears the banner control.
 */
function messageFieldSlots(props: Record<string, unknown>, update: PlaygroundUpdate) {
  return {
    leading: props.leading ? <Avatar name="Alex Morgan" decorative size="md" /> : undefined,
    trailing: props.trailing ? (
      <IconButton variant="standard" icon={<ScheduleIcon />} aria-label="Schedule message" />
    ) : undefined,
    tools: props.tools ? (
      <IconButton variant="standard" icon={<AddAPhotoIcon />} aria-label="Add a photo" />
    ) : undefined,
    emptyAction: props.emptyAction ? (
      <IconButton variant="standard" icon={<MicIcon />} aria-label="Record a voice message" />
    ) : undefined,
    sendIcon: props.sendIcon ? <ArrowForwardIcon /> : undefined,
    closeIcon: props.closeIcon ? <DeleteIcon /> : undefined,
    attachments: props.attachments ? (
      <MediaUploadGridAny
        aria-label="Photos to send"
        layout="row"
        items={SAMPLE_PHOTOS.slice(0, 2).map((photo, index) => ({
          key: `photo-${index}`,
          previewUrl: photo.url,
          alt: photo.alt,
          status: 'done' as const,
        }))}
      />
    ) : undefined,
    onBannerClose: () => update('banner', undefined),
    value: typeof props.value === 'string' ? props.value : '',
    onChange: (value: string) => update('value', value),
    onSubmit: () => undefined,
  };
}

/** The slot switches' snippets, shared by both message fields. */
const MESSAGE_FIELD_SLOTS = {
  leading: '<Avatar name="Alex Morgan" decorative size="md" />',
  trailing:
    '<IconButton variant="standard" icon={<ScheduleIcon />} aria-label="Schedule message" />',
  tools: '<IconButton variant="standard" icon={<AddAPhotoIcon />} aria-label="Add a photo" />',
  emptyAction:
    '<IconButton variant="standard" icon={<MicIcon />} aria-label="Record a voice message" />',
  sendIcon: '<ArrowForwardIcon />',
  closeIcon: '<DeleteIcon />',
  attachments:
    "(\n    <MediaUploadGrid\n      aria-label=\"Photos to send\"\n      layout=\"row\"\n      items={[{ key: 'hills', previewUrl: '/photos/hills.jpg', alt: 'Hills under a blue sky', status: 'done' }]}\n    />\n  )",
};

/** The defaults both message fields share. */
const MESSAGE_FIELD_DEFAULTS = {
  variant: 'filled',
  size: 'md',
  docked: false,
  value: '',
  leading: false,
  trailing: false,
  tools: false,
  toolsWhenIdle: 'inline',
  closeIcon: false,
  toolbarPlacement: 'auto',
  attachments: false,
  send: true,
  sendVariant: 'filled',
  sendIcon: false,
  emptyAction: false,
  submitting: false,
  showCounter: false,
  counterThreshold: 0.9,
  invalid: false,
  minRows: 1,
  submitOn: 'enter',
  clearOnSubmit: false,
  expandOnFocus: false,
  defaultOpen: false,
  autoFocus: false,
  required: false,
  disabled: false,
  readOnly: false,
};

/** The message fields' number controls. */
const MESSAGE_FIELD_RANGES = {
  maxLength: { min: 20, max: 500, step: 10 },
  counterThreshold: { min: 0, max: 1, step: 0.05 },
  minRows: { min: 1, max: 6 },
  maxRows: { min: 1, max: 12 },
};

/** Slots switched on and off, and ReactNode props edited as text. */
const MESSAGE_FIELD_KINDS = {
  docked: 'boolean',
  leading: 'boolean',
  trailing: 'boolean',
  tools: 'boolean',
  emptyAction: 'boolean',
  sendIcon: 'boolean',
  closeIcon: 'boolean',
  attachments: 'boolean',
  label: 'string',
  description: 'string',
  banner: 'string',
  errorMessage: 'string',
} as const;

/** The controls both message fields share, look first, then content, then behaviour. */
const messageFieldControls = (own: string[]) => [
  'variant',
  'size',
  'docked',
  'label',
  'placeholder',
  'description',
  'value',
  ...own,
  'leading',
  'trailing',
  'tools',
  'toolsWhenIdle',
  'banner',
  'closeIcon',
  'toolbarPlacement',
  'attachments',
  'send',
  'sendVariant',
  'sendIcon',
  'emptyAction',
  'canSend',
  'submitting',
  'maxLength',
  'showCounter',
  'counterThreshold',
  'invalid',
  'errorMessage',
  'minRows',
  'maxRows',
  'submitOn',
  'clearOnSubmit',
  'expandOnFocus',
  'defaultOpen',
  'autoFocus',
  'required',
  'disabled',
  'readOnly',
];

const MESSAGE_FIELD_NOT_CONTROLLED = {
  accept: 'The file types `onFiles` takes from a paste or drop, which the preview ignores.',
};

const IMPORT_ICON_BUTTON = "import { IconButton } from '@windmorph/react';";

/** The people the rich field's `@` suggests. */
const PEOPLE: MentionSuggestion[] = [
  { id: 'sam', label: 'Sam Lee' },
  { id: 'priya', label: 'Priya Shah' },
  { id: 'zoe', label: 'Zoë Müller' },
];
const searchPeople = (query: string) =>
  PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()));

/** Shows what the picker returned, so the options have something to show. */
function FileTriggerPreview(props: Record<string, unknown>) {
  const [chosen, setChosen] = useState<string[]>([]);
  const { capture, ...rest } = props;
  return (
    <div className="flex flex-col items-center gap-3">
      {createElement(
        FileTriggerAny,
        {
          ...rest,
          ...(capture !== 'none' && { capture }),
          accept: ['image/*', '.pdf'],
          onSelect: (files: File[]) => setChosen(files.map((file) => file.name)),
        },
        <Button variant="tonal" leadingIcon={<AddAPhotoIcon />}>
          Choose files
        </Button>,
      )}
      <p className="text-body-medium text-on-surface-variant" aria-live="polite">
        {chosen.length > 0 ? `Chosen: ${chosen.join(', ')}` : 'Nothing chosen yet.'}
      </p>
    </div>
  );
}

/** The sample photos, one uploading and one failed, as a composer shows them. */
const UPLOAD_ITEMS: MediaUploadItem[] = [
  { key: 'hills', previewUrl: SAMPLE_PHOTOS[0]!.url, alt: SAMPLE_PHOTOS[0]!.alt, status: 'done' },
  {
    key: 'rocks',
    previewUrl: SAMPLE_PHOTOS[1]!.url,
    alt: SAMPLE_PHOTOS[1]!.alt,
    status: 'uploading',
    progress: 0.4,
  },
  {
    key: 'lake',
    previewUrl: SAMPLE_PHOTOS[2]!.url,
    alt: SAMPLE_PHOTOS[2]!.alt,
    status: 'error',
    error: 'Connection lost',
  },
];

/** A grid the preview can add to, reorder, retry and remove from. */
function MediaUploadGridPreview({
  removeIcon,
  retryIcon,
  actionsIcon,
  addIcon,
  ...props
}: Record<string, unknown>) {
  const [items, setItems] = useState<MediaUploadItem[]>(UPLOAD_ITEMS);
  return (
    <div className="w-full max-w-[480px]">
      {createElement(MediaUploadGridAny, {
        ...props,
        removeIcon: removeIcon ? <DeleteIcon /> : undefined,
        retryIcon: retryIcon ? <HistoryIcon /> : undefined,
        actionsIcon: actionsIcon ? <EditIcon /> : undefined,
        addIcon: addIcon ? <AddAPhotoIcon /> : undefined,
        'aria-label': 'Photos in your post',
        items,
        accept: ['image/*'],
        onAdd: (files: File[]) =>
          setItems((current) => [
            ...current,
            ...files.map((file) => ({
              key: crypto.randomUUID(),
              previewUrl: URL.createObjectURL(file),
              alt: file.name,
              status: 'done' as const,
            })),
          ]),
        onReorder: (keys: string[]) =>
          setItems((current) => keys.map((key) => current.find((item) => item.key === key)!)),
        onRemove: (key: string) =>
          setItems((current) => current.filter((item) => item.key !== key)),
        onRetry: (key: string) =>
          setItems((current) =>
            current.map((item) =>
              item.key === key ? { ...item, status: 'done', error: undefined } : item,
            ),
          ),
      })}
    </div>
  );
}

/** The crop dialog's photos: a plausible app URL in the snippet, a stand-in photo live. */
const CROP_PHOTOS: Record<string, string> = {
  '/photos/landscape.jpg': SAMPLE_PHOTO,
  '/photos/portrait.jpg': SAMPLE_PORTRAIT,
};

/** Playgrounds for the Windmorph Pro inputs, by page slug. */
export const INPUTS_PRO_DESCRIPTORS: Record<string, PlaygroundDescriptor> = {
  'message-field': {
    component: 'MessageField',
    notRendered: {
      MessageFieldFrame:
        'The frame the message field is built from, exported for a custom editor; the preview shows the field itself.',
      MessageFieldTrigger:
        'A button that looks like the field and opens a full composer; the page examples show it.',
      MessageFieldSend:
        "The field's send button, exported for a custom editor; the preview's field includes it.",
    },
    importFrom: '@windmorph/react-pro',
    render: (props, update) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(MessageFieldAny, {
          ...props,
          key: mountKey(props, ['autoFocus', 'defaultOpen', 'expandOnFocus']),
          'aria-label': 'Write a comment',
          ...messageFieldSlots(props, update),
          toolbar: props.toolbar ? (
            <div className="flex gap-1">
              <IconButton variant="standard" icon={<FormatBoldIcon />} aria-label="Bold" />
              <IconButton variant="standard" icon={<FormatItalicIcon />} aria-label="Italic" />
            </div>
          ) : undefined,
        }),
      ),
    defaultProps: { ...MESSAGE_FIELD_DEFAULTS, toolbar: false, maxRows: 6 },
    surfacedProps: messageFieldControls(['toolbar']),
    notControlled: {
      ...MESSAGE_FIELD_NOT_CONTROLLED,
      name: 'Form wiring: the name the text submits under, with nothing to see in the preview.',
      form: 'Form wiring: the id of a `<form>` elsewhere on the page, with nothing to see.',
      enterKeyHint:
        "The label of a phone keyboard's Enter key, which a desktop preview can't show.",
      inputMode: "Picks a phone's on-screen keyboard, which a desktop preview can't show.",
      spellCheck: "The browser's spelling check, which changes nothing in the field's own look.",
      autoComplete: "The browser's autofill hint, which changes nothing in the field's own look.",
      autoCorrect: "The phone keyboard's autocorrect, which a desktop preview can't show.",
    },
    initialState: {
      placeholder: 'Write a comment…',
      errorMessage: "Couldn't send. Try again.",
      maxLength: 200,
      clearOnSubmit: true,
    },
    controlKinds: { ...MESSAGE_FIELD_KINDS, toolbar: 'boolean' },
    numberRanges: MESSAGE_FIELD_RANGES,
    toggledSlots: {
      ...MESSAGE_FIELD_SLOTS,
      toolbar:
        '(\n    <div className="flex gap-1">\n      <IconButton variant="standard" icon={<FormatBoldIcon />} aria-label="Bold" />\n      <IconButton variant="standard" icon={<FormatItalicIcon />} aria-label="Italic" />\n    </div>\n  )',
    },
    importMembers: ['Avatar', 'MediaUploadGrid'],
    codeImports: [IMPORT_ICON_BUTTON],
    codeSlots: { 'aria-label': '"Write a comment"' },
  },
  'rich-message-field': {
    component: 'RichMessageField',
    notRendered: {
      FormattingToolbar:
        "The rich field's formatting buttons, exported for a custom editor; the preview's field includes it.",
      FormattedText: "Renders a rich message's saved text; the page examples show it.",
    },
    importFrom: '@windmorph/react-pro/rich-text',
    render: (props, update) =>
      createElement(
        'div',
        { className: 'w-full max-w-md' },
        createElement(RichMessageFieldAny, {
          ...props,
          key: mountKey(props, ['autoFocus', 'defaultOpen', 'expandOnFocus']),
          'aria-label': 'Write a comment',
          ...messageFieldSlots(props, update),
          formattingIcon: props.formattingIcon ? <InkPenIcon /> : undefined,
          mentions: props.mentions ? { search: searchPeople } : undefined,
        }),
      ),
    defaultProps: {
      ...MESSAGE_FIELD_DEFAULTS,
      formatting: 'toggle',
      formattingPlacement: 'auto',
      formattingIcon: false,
      mentions: false,
      maxRows: 10,
    },
    surfacedProps: messageFieldControls([
      'formatting',
      'formattingPlacement',
      'formattingIcon',
      'mentions',
    ]),
    notControlled: {
      ...MESSAGE_FIELD_NOT_CONTROLLED,
      formattingToolbar:
        "The toolbar's button groups and icons, a nested object of lists; the defaults are the ones to show.",
    },
    initialState: {
      placeholder: 'Write a comment…',
      errorMessage: "Couldn't send. Try again.",
      mentions: true,
      clearOnSubmit: true,
    },
    controlKinds: { ...MESSAGE_FIELD_KINDS, formattingIcon: 'boolean', mentions: 'boolean' },
    numberRanges: MESSAGE_FIELD_RANGES,
    toggledSlots: {
      ...MESSAGE_FIELD_SLOTS,
      formattingIcon: '<InkPenIcon />',
      mentions:
        "{\n    search: (query) =>\n      [\n        { id: 'sam', label: 'Sam Lee' },\n        { id: 'priya', label: 'Priya Shah' },\n      ].filter((person) => person.label.toLowerCase().includes(query.toLowerCase())),\n  }",
    },
    codeImports: [
      IMPORT_ICON_BUTTON,
      "import { Avatar, MediaUploadGrid } from '@windmorph/react-pro';",
    ],
    codeSlots: { 'aria-label': '"Write a comment"' },
  },
  'file-trigger': {
    component: 'FileTrigger',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(FileTriggerPreview, props),
    defaultProps: { multiple: false, capture: 'none', directory: false },
    surfacedProps: ['multiple', 'capture', 'directory'],
    notControlled: {
      accept:
        "The file types the OS picker offers, a list; the preview's picker takes images and PDFs.",
    },
    enumOptions: { capture: ['none', 'user', 'environment'] },
    codeImports: ["import { Button } from '@windmorph/react';"],
    codeSlots: {
      accept: "['image/*', '.pdf']",
      onSelect: '(files) => console.log(files)',
    },
    codeChildren: '<Button variant="tonal">Choose files</Button>',
  },
  'image-crop': {
    component: 'ImageCropDialog',
    groups: { src: 'content' },
    notRendered: {
      ImageCropper:
        'The cropping area on its own, for a custom layout; the preview shows it inside the crop dialog.',
    },
    importFrom: '@windmorph/react-pro',
    render: ({ src, zoomInIcon, zoomOutIcon, ...props }, update) => (
      <>
        <Button variant="tonal" onPress={() => update('open', true)}>
          Crop the photo
        </Button>
        {createElement(ImageCropDialogAny, {
          ...props,
          zoomInIcon: zoomInIcon ? <ZoomInIcon /> : undefined,
          zoomOutIcon: zoomOutIcon ? <ZoomOutIcon /> : undefined,
          src: CROP_PHOTOS[String(src)] ?? SAMPLE_PHOTO,
          open: Boolean(props.open),
          onOpenChange: (open: boolean) => update('open', open),
          onConfirm: () => update('open', false),
        })}
      </>
    ),
    // `open` and `src` are required, so the snippet always writes them.
    defaultProps: {
      aspect: 1,
      guide: 'none',
      maxZoom: 4,
      busy: false,
      zoomInIcon: false,
      zoomOutIcon: false,
    },
    surfacedProps: [
      'open',
      'src',
      'aspect',
      'guide',
      'maxZoom',
      'zoomInIcon',
      'zoomOutIcon',
      'busy',
      'progress',
    ],
    initialState: { open: false, src: '/photos/landscape.jpg', guide: 'circle' },
    numberRanges: {
      aspect: { min: 0.5, max: 2, step: 0.25 },
      maxZoom: { min: 1, max: 8, step: 0.5 },
      progress: { min: 0, max: 1, step: 0.05 },
    },
    enumOptions: { src: Object.keys(CROP_PHOTOS) },
    controlKinds: { zoomInIcon: 'boolean', zoomOutIcon: 'boolean' },
    toggledSlots: { zoomInIcon: '<ZoomInIcon />', zoomOutIcon: '<ZoomOutIcon />' },
    codeSlots: {
      onOpenChange: '(open) => console.log(open)',
      onConfirm: '(result) => console.log(result.crop)',
    },
  },
  'media-upload-grid': {
    component: 'MediaUploadGrid',
    importFrom: '@windmorph/react-pro',
    render: (props) => createElement(MediaUploadGridPreview, props),
    defaultProps: {
      layout: 'grid',
      disabled: false,
      removeIcon: false,
      retryIcon: false,
      actionsIcon: false,
      addIcon: false,
    },
    surfacedProps: [
      'layout',
      'maxItems',
      'removeIcon',
      'retryIcon',
      'actionsIcon',
      'addIcon',
      'disabled',
    ],
    notControlled: {
      accept: 'The file types the add tile and a drop take, a list; the preview takes images.',
    },
    initialState: { maxItems: 6 },
    numberRanges: { maxItems: { min: 1, max: 12 } },
    controlKinds: {
      removeIcon: 'boolean',
      retryIcon: 'boolean',
      actionsIcon: 'boolean',
      addIcon: 'boolean',
    },
    toggledSlots: {
      removeIcon: '<DeleteIcon />',
      retryIcon: '<HistoryIcon />',
      actionsIcon: '<EditIcon />',
      addIcon: '<AddAPhotoIcon />',
    },
    codeSlots: {
      'aria-label': '"Photos in your post"',
      items:
        "[\n    { key: 'hills', previewUrl: '/photos/hills.jpg', alt: 'Hills under a blue sky', status: 'done' },\n    { key: 'rocks', previewUrl: '/photos/rocks.jpg', alt: 'Red rocks at dawn', status: 'uploading', progress: 0.4 },\n  ]",
      onAdd: '(files) => console.log(files)',
    },
  },
  'phone-field': {
    component: 'PhoneField',
    groups: { country: 'content', locale: 'content' },
    importFrom: '@windmorph/react-pro',
    render: ({ priorityCountries, density, ...props }, update) =>
      createElement(PhoneFieldAny, {
        ...props,
        density: asDensity(density),
        key: mountKey(props, ['autoFocus']),
        ...(priorityCountries === true && { priorityCountries: ['GB', 'US', 'CA', 'AU'] }),
        value: typeof props.value === 'string' ? props.value : '',
        onChange: (value: string) => update('value', value),
        onCountryChange: (country: string) => update('country', country),
      }),
    defaultProps: {
      variant: 'outlined',
      density: 0,
      value: '',
      country: 'GB',
      priorityCountries: false,
      locale: 'en-US',
      invalid: false,
      required: false,
      disabled: false,
      readOnly: false,
      autoFocus: false,
    },
    surfacedProps: [
      'variant',
      'density',
      'label',
      'value',
      'country',
      'priorityCountries',
      'locale',
      'supportingText',
      'invalid',
      'errorMessage',
      'required',
      'disabled',
      'readOnly',
      'autoFocus',
    ],
    notControlled: {
      name: 'Form wiring: the name the E.164 number submits under, with nothing to see.',
    },
    initialState: {
      label: 'Phone',
      priorityCountries: true,
      errorMessage: 'Enter a valid phone number',
    },
    enumOptions: {
      ...DENSITY_OPTIONS,
      country: ['GB', 'US', 'CA', 'AU', 'FR', 'DE'],
      locale: ['en-US', 'fr-FR', 'de-DE'],
    },
    controlKinds: { priorityCountries: 'boolean', supportingText: 'string', density: 'number' },
    toggledSlots: { priorityCountries: "['GB', 'US', 'CA', 'AU']" },
  },
  'pin-input': {
    component: 'PinInput',
    importFrom: '@windmorph/react-pro',
    render: ({ density, ...props }, update) =>
      createElement(PinInputAny, {
        ...props,
        density: asDensity(density),
        value: typeof props.value === 'string' ? props.value : '',
        onChange: (value: string) => update('value', value),
      }),
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
      density: 0,
      corner: 'extra-small',
      length: 6,
      type: 'numeric',
      value: '',
      mask: false,
      otp: true,
      invalid: false,
      required: false,
      disabled: false,
      readOnly: false,
    },
    surfacedProps: [
      'variant',
      'size',
      'density',
      'corner',
      'label',
      'length',
      'type',
      'value',
      'mask',
      'otp',
      'supportingText',
      'invalid',
      'errorMessage',
      'required',
      'disabled',
      'readOnly',
    ],
    notControlled: {
      groups:
        'Group sizes that must add up to `length`, so a fixed split would break as the length changes; the Groups example shows them.',
      separator: 'Shows only between `groups`, which have no control; the Groups example sets one.',
      pattern:
        'A regular expression; `type` covers the built-in character sets, and the Groups example uses one.',
    },
    initialState: {
      label: 'Code',
      errorMessage: "That code didn't work.",
      supportingText: 'We sent it to your email.',
    },
    enumOptions: {
      ...DENSITY_OPTIONS,
      corner: [
        'none',
        'extra-small',
        'small',
        'medium',
        'large',
        'large-increased',
        'extra-large',
        'extra-large-increased',
        'extra-extra-large',
        'full',
      ],
    },
    controlKinds: {
      label: 'string',
      supportingText: 'string',
      errorMessage: 'string',
      density: 'number',
    },
    numberRanges: { length: { min: 4, max: 8 } },
  },
};
