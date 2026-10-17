import type { ComponentSpecData } from './types';

/** Spec data for the Windmorph Pro inputs, by page slug. */
export const INPUTS_PRO_SPEC: Record<string, ComponentSpecData> = {
  'message-field': {
    covers: [
      {
        name: 'Variants: filled, tonal and outlined',
        kind: 'variant',
        examples: ['message-field/message-field-variants'],
      },
      {
        name: 'Sizes: sm, md and lg',
        kind: 'configuration',
        examples: ['message-field/message-field-variants'],
      },
      {
        name: 'Opens on focus, with tools and a standard Send',
        kind: 'configuration',
        examples: ['message-field/message-field-comment'],
      },
      {
        name: 'Reply banner, attachments and an empty action',
        kind: 'configuration',
        examples: ['message-field/message-field-chat'],
      },
      {
        name: 'Docked as a footer',
        kind: 'configuration',
        examples: ['message-field/message-field-docked'],
      },
      {
        name: 'Character limit, label, description and error',
        kind: 'configuration',
        examples: ['message-field/message-field-limit'],
      },
      {
        name: 'Send on Ctrl or ⌘ + Enter',
        kind: 'configuration',
        examples: ['message-field/message-field-limit'],
      },
      {
        name: 'Comments and chat',
        kind: 'use case',
        examples: ['message-field/message-field-comment', 'message-field/message-field-chat'],
      },
      {
        name: 'A trigger that opens a composer (`MessageFieldTrigger`)',
        kind: 'use case',
        examples: ['message-field/message-field-trigger'],
      },
    ],
    extensions: [
      {
        item: 'Built on the M3 search bar and text field',
        note: 'A pill like the search bar that grows into a rounded box over several lines, with the text field’s colour roles, a counter and error text; M3 has no message composer of its own.',
      },
    ],
  },
  'rich-message-field': {
    covers: [
      {
        name: 'Formatting toolbar on demand (`formatting="toggle"`)',
        kind: 'configuration',
        examples: ['rich-message-field/rich-message-field-comment'],
      },
      {
        name: 'Formatting toolbar always shown, at the top',
        kind: 'configuration',
        examples: ['rich-message-field/rich-message-field-post'],
      },
      {
        name: 'Mentions',
        kind: 'configuration',
        examples: ['rich-message-field/rich-message-field-mentions'],
      },
      {
        name: 'Showing what it wrote (`FormattedText`)',
        kind: 'use case',
        examples: [
          'rich-message-field/rich-message-field-comment',
          'rich-message-field/rich-message-field-mentions',
        ],
      },
      {
        name: "A post's composer",
        kind: 'use case',
        examples: ['rich-message-field/rich-message-field-post'],
      },
    ],
    extensions: [
      {
        item: 'Formatting as you type',
        note: 'The message field’s frame with a rich-text editor (Tiptap, an optional peer dependency), handing out plain markers that `FormattedText` shows.',
      },
    ],
  },
  'file-trigger': {
    covers: [
      {
        name: 'Any library button as the trigger',
        kind: 'configuration',
        examples: ['file-trigger/file-trigger-photo'],
      },
      {
        name: 'File types (`accept`)',
        kind: 'configuration',
        examples: ['file-trigger/file-trigger-photo', 'file-trigger/file-trigger-folder'],
      },
      {
        name: 'The camera on phones (`capture`)',
        kind: 'configuration',
        examples: ['file-trigger/file-trigger-photo'],
      },
      {
        name: 'Several files or a folder (`multiple`, `directory`)',
        kind: 'configuration',
        examples: ['file-trigger/file-trigger-folder'],
      },
      {
        name: 'From a menu item (`useFileTrigger`)',
        kind: 'use case',
        examples: ['file-trigger/file-trigger-menu'],
      },
    ],
  },
  'image-crop': {
    covers: [
      {
        name: 'In a dialog (`ImageCropDialog`)',
        kind: 'variant',
        examples: ['image-crop/image-crop-avatar'],
      },
      {
        name: 'Inline (`ImageCropper`)',
        kind: 'variant',
        examples: ['image-crop/image-crop-inline'],
      },
      {
        name: 'Round avatar guide',
        kind: 'configuration',
        examples: ['image-crop/image-crop-avatar'],
      },
      {
        name: 'Frame aspect ratio',
        kind: 'configuration',
        examples: ['image-crop/image-crop-inline'],
      },
      {
        name: 'Saving with progress (`busy`, `progress`)',
        kind: 'configuration',
        examples: ['image-crop/image-crop-avatar'],
      },
    ],
    extensions: [
      {
        item: 'Built on the M3 dialog',
        note: 'Full screen with the M3 full-screen dialog’s header on compact windows, and a basic dialog on larger ones.',
      },
    ],
  },
  'media-upload-grid': {
    covers: [
      {
        name: 'Grid layout',
        kind: 'variant',
        examples: ['media-upload-grid/media-upload-grid-composer'],
      },
      {
        name: 'Row layout',
        kind: 'variant',
        examples: ['media-upload-grid/media-upload-grid-row'],
      },
      {
        name: 'Upload progress, error and retry',
        kind: 'configuration',
        examples: ['media-upload-grid/media-upload-grid-composer'],
      },
      {
        name: 'Reordering and a menu per photo',
        kind: 'configuration',
        examples: ['media-upload-grid/media-upload-grid-composer'],
      },
      {
        name: 'A limit on photos (`maxItems`)',
        kind: 'configuration',
        examples: [
          'media-upload-grid/media-upload-grid-composer',
          'media-upload-grid/media-upload-grid-row',
        ],
      },
      {
        name: 'Disabled',
        kind: 'configuration',
        examples: ['media-upload-grid/media-upload-grid-disabled'],
      },
    ],
  },
  'phone-field': {
    covers: [
      {
        name: 'Variants: outlined and filled',
        kind: 'variant',
        examples: ['phone-field/phone-field-variants'],
      },
      {
        name: 'Priority countries and a starting country',
        kind: 'configuration',
        examples: ['phone-field/phone-field-signup'],
      },
      {
        name: 'Invalid number',
        kind: 'configuration',
        examples: ['phone-field/phone-field-variants'],
      },
      {
        name: 'Flags',
        kind: 'configuration',
        examples: ['phone-field/phone-field-flags'],
      },
      {
        name: 'Required, read-only and disabled',
        kind: 'configuration',
        examples: ['phone-field/phone-field-states'],
      },
      {
        name: 'Country names in another language (`locale`)',
        kind: 'configuration',
        examples: ['phone-field/phone-field-states'],
      },
      {
        name: 'Density, 56 to 44px (`density`)',
        kind: 'configuration',
        examples: ['phone-field/phone-field-density'],
      },
      {
        name: 'A phone number at sign-up',
        kind: 'use case',
        examples: ['phone-field/phone-field-signup'],
      },
    ],
    extensions: [
      {
        item: 'Built on the M3 text field and select',
        note: 'The number is a `TextField`, and the country a searchable `Select` that opens as the M3 menu on medium and larger windows and as a bottom sheet on compact ones.',
      },
    ],
  },
  'pin-input': {
    covers: [
      {
        name: 'Variants: outlined and filled',
        kind: 'variant',
        examples: ['pin-input/pin-input-variants'],
      },
      {
        name: 'Sizes: small, medium and large',
        kind: 'configuration',
        examples: ['pin-input/pin-input-variants'],
      },
      {
        name: 'Corners from the M3 shape scale',
        kind: 'configuration',
        examples: ['pin-input/pin-input-corners', 'pin-input/pin-input-pin'],
      },
      {
        name: 'Character sets: numeric, alphabetic and alphanumeric',
        kind: 'configuration',
        examples: ['pin-input/pin-input-corners', 'pin-input/pin-input-groups'],
      },
      {
        name: 'Groups, a separator and a custom pattern',
        kind: 'configuration',
        examples: ['pin-input/pin-input-groups'],
      },
      {
        name: 'Masked',
        kind: 'configuration',
        examples: ['pin-input/pin-input-pin'],
      },
      {
        name: 'Invalid, required, read-only and disabled',
        kind: 'configuration',
        examples: ['pin-input/pin-input-states', 'pin-input/pin-input-verification'],
      },
      {
        name: 'Density, 56 to 44px (`density`)',
        kind: 'configuration',
        examples: ['pin-input/pin-input-density'],
      },
      {
        name: 'A verification code that submits itself',
        kind: 'use case',
        examples: ['pin-input/pin-input-verification'],
      },
    ],
    extensions: [
      {
        item: 'Built on the M3 text field',
        note: 'Each box reads the `--wm-pin-input-*` tokens, whose defaults are the text field’s outlined or filled tokens, so a text field theme restyles it too. One real input sits over the boxes, so autofill, paste and screen readers see a single field.',
      },
    ],
  },
};
