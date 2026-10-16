import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ComponentPropsFile, PropsRecord } from './generate-props';

/**
 * Every public prop of every component, the core's and Pro's, is documented: the generated
 * props tables are read from the components' JSDoc (the core's sources, Pro's installed
 * declarations), so a prop without a description shows as an empty row. Props inherited from
 * React and DOM types are already left out by the generator; the allowlists below are for
 * anything else that genuinely can't be described or defaulted.
 */

const propsDir = resolve(process.cwd(), '.generated/props');

function readComponents(source: ComponentPropsFile['source']): ComponentPropsFile[] {
  if (!existsSync(propsDir)) {
    throw new Error('No generated props: run `pnpm --filter site generate` first.');
  }
  return readdirSync(propsDir)
    .map((file) => JSON.parse(readFileSync(resolve(propsDir, file), 'utf8')) as unknown)
    .filter(
      (json): json is ComponentPropsFile =>
        typeof json === 'object' &&
        json !== null &&
        'props' in json &&
        (json as ComponentPropsFile).source === source,
    );
}

/**
 * `Component.prop` → why it has no description. Only props inherited from React or DOM types
 * belong here (the generator drops most of them already).
 */
const UNDESCRIBED: Record<string, string> = {};

/**
 * `Component.prop` → why an optional string-literal prop has no `@default`: a controlled
 * value whose default is on its `default*` twin, or a value inherited or absent by design.
 */
const NO_ENUM_DEFAULT: Record<string, string> = {
  'ThemeProvider.mode': 'Controlled; `defaultMode` holds the uncontrolled default.',
  'ThemeProvider.contrast': 'Controlled; `defaultContrast` holds the uncontrolled default.',
  'ThemeProvider.motion': 'Controlled; `defaultMotion` holds the uncontrolled default.',
  'ThemeProvider.density': 'Controlled; `defaultDensity` holds the uncontrolled default.',
  'ThemeScope.mode': 'Inherited from the nearest provider or scope when left out.',
  'ThemeScope.contrast': 'Inherited from the nearest provider or scope when left out.',
  'ThemeScope.motion': 'Inherited from the nearest provider or scope when left out.',
  'ThemeScope.density': 'Inherited from the nearest provider or scope when left out.',
  'OptionPopover.density': "Left out, the list takes the provider's or scope's density.",
  'TimePicker.mode': 'Controlled; `defaultMode` holds the uncontrolled default.',
  'BottomSheet.detent': 'Controlled; `defaultDetent` holds the uncontrolled default.',
  'TimePicker.hourCycle': "Left out, the locale's hour cycle is used.",
  'List.dividers': 'Left out, the list has no dividers.',
  'List.headlineLines': 'Left out, headlines have no line limit.',
  'List.supportingTextLines': 'Left out, supporting text has no line limit.',
  'ListItem.control': 'Left out, the item is a plain row.',
  'ListItem.headlineLines': "Left out, the list's limit applies.",
  'ListItem.supportingTextLines': "Left out, the list's limit applies.",
  'TopAppBar.scrollBehavior': 'Left out, the bar is static: no scroll behaviour is a value.',
  'SearchAppBar.scrollBehavior': 'Left out, the bar is static: no scroll behaviour is a value.',
};

/** RichMessageField's formatting labels, which share one gap in the pinned Pro build. */
const RICH_FORMAT_LABELS = [
  'code',
  'link',
  'bold',
  'italic',
  'strike',
  'bullets',
  'numbers',
  'quote',
  'codeBlock',
] as const;

/**
 * Pro's props with no `@default` on purpose, as {@link NO_ENUM_DEFAULT} for the core's.
 */
const PRO_NO_ENUM_DEFAULT: Record<string, string> = {
  'Accordion.density': "Left out, the accordion takes the nearest scope's density.",
  'PhoneField.density': "Left out, the field takes the provider's or scope's density.",
  'PinInput.density': "Left out, the boxes take the provider's or scope's density.",
  'PhoneField.country': 'Controlled; `defaultCountry` holds the uncontrolled default.',
  'PhoneField.defaultCountry': 'Left out, the first priority country is used.',
  'Avatar.presence': 'Left out, the avatar has no presence dot.',
  'FileTrigger.capture': 'Left out, the picker opens the files, not a camera.',
};

/**
 * Pro's props, and keys of its object props, that the pinned Pro build declares without JSDoc:
 * mostly members of a union (Avatar's link and button forms, the fields' label or
 * `aria-label` naming), where only some members carry a comment. They are fixed in Pro's TSDoc,
 * and the stale-allowlist check fails once a newer pin describes one, so each leaves this list.
 */
const PRO_GAP = "Pro's declaration has no JSDoc yet (fixed in Pro, then re-pinned).";
const PRO_UNDESCRIBED: Record<string, string> = Object.fromEntries(
  [
    'Avatar.badge',
    'Avatar.badgeLabel',
    'Avatar.href',
    'Avatar.onPress',
    'Avatar.alt',
    'Avatar.decorative',
    'AvatarGroup.overflowHref',
    'AvatarGroup.onOverflowPress',
    'EmptyState.classNames',
    'EmptyState.ref',
    'MediaUploadGrid.aria-label',
    'MediaUploadGrid.aria-labelledby',
    'MediaViewer.aria-label',
    'MediaViewer.aria-labelledby',
    'MessageField.submitOn',
    'MessageField.minRows',
    'MessageField.variant',
    'MessageField.toolbarPlacement',
    'MessageField.label',
    'MessageField.aria-label',
    'MessageField.aria-labelledby',
    'MessageFieldFrame.variant',
    'MessageFieldFrame.toolbarPlacement',
    'MessageFieldFrame.label',
    'MessageFieldFrame.aria-label',
    'MessageFieldFrame.aria-labelledby',
    'MessageFieldSend.variant',
    'MessageFieldTrigger.variant',
    'PhoneField.label',
    'PhoneField.aria-label',
    'PinInput.label',
    'RichMessageField.submitOn',
    'RichMessageField.formatting',
    'RichMessageField.variant',
    'RichMessageField.toolbarPlacement',
    'RichMessageField.label',
    'RichMessageField.aria-label',
    'RichMessageField.aria-labelledby',
    'TagGroup.ref',
    'EmptyState.classNames.root',
    'EmptyState.classNames.media',
    'EmptyState.classNames.icon',
    'EmptyState.classNames.title',
    'EmptyState.classNames.description',
    'EmptyState.classNames.actions',
    'PropsTable.labels.name',
    'PropsTable.labels.type',
    'PropsTable.labels.default',
    'PropsTable.labels.description',
    ...RICH_FORMAT_LABELS.map((key) => `RichMessageField.labels.${key}`),
  ].map((name) => [name, PRO_GAP]),
);

/** Pro's built-in strings without an English `@default` in the pinned build. */
const PRO_NO_STRING_DEFAULT: Record<string, string> = Object.fromEntries(
  [
    ...['title', 'confirm', 'close', 'busy', 'area', 'instructions', 'error'].map(
      (key) => `ImageCropDialog.labels.${key}`,
    ),
    ...['area', 'instructions', 'error'].map((key) => `ImageCropper.labels.${key}`),
    ...['position', 'description', 'error'].map((key) => `MediaViewer.labels.${key}`),
    ...['MessageField', 'MessageFieldFrame', 'RichMessageField'].flatMap((name) =>
      ['nearLimit', 'atLimit', 'overLimit'].map((key) => `${name}.labels.${key}`),
    ),
    ...['country', 'search', 'noResults', 'suggested', 'allCountries', 'invalid'].map(
      (key) => `PhoneField.labels.${key}`,
    ),
    ...RICH_FORMAT_LABELS.map((key) => `RichMessageField.labels.${key}`),
  ].map((name) => [name, PRO_GAP]),
);

interface Allowlists {
  undescribed: Record<string, string>;
  noEnumDefault: Record<string, string>;
  /** Keys of `strings`, `labels` and `classNames` without a description. */
  undescribedKeys: Record<string, string>;
  /** Keys of `strings` and `labels` without an English default. */
  noStringDefault: Record<string, string>;
}

function describePackage(
  title: string,
  source: ComponentPropsFile['source'],
  minimum: number,
  allow: Allowlists,
): void {
  const components = readComponents(source);

  /** `Component.prop` for each prop matching `test`, minus the allowlist. */
  function gaps(
    test: (prop: PropsRecord) => boolean,
    allowed: Record<string, string>,
    rows: (props: PropsRecord[]) => PropsRecord[] = (props) => props,
  ): string[] {
    return components.flatMap(({ displayName, props }) =>
      rows(props)
        .filter(test)
        .map((prop) => `${displayName}.${prop.name}`)
        .filter((name) => !(name in allowed)),
    );
  }

  describe(title, () => {
    it('reads the generated components', () => {
      expect(components.length).toBeGreaterThan(minimum);
    });

    it('describes every public prop', () => {
      expect(gaps((prop) => !prop.description, allow.undescribed)).toEqual([]);
    });

    it('gives every optional string-literal prop its default', () => {
      expect(
        gaps(
          (prop) => !prop.required && Boolean(prop.options) && !prop.defaultValue,
          allow.noEnumDefault,
        ),
      ).toEqual([]);
    });

    it('lists the keys of every strings, labels and classNames prop', () => {
      expect(
        gaps(
          (prop) => ['strings', 'labels', 'classNames'].includes(prop.name) && !prop.keys?.length,
          {},
        ),
      ).toEqual([]);
    });

    it('describes every key of strings, labels and classNames', () => {
      expect(
        gaps(
          (key) => !key.description,
          allow.undescribedKeys,
          (props) => props.flatMap((prop) => prop.keys ?? []),
        ),
      ).toEqual([]);
    });

    it('gives every built-in string its English default', () => {
      expect(
        gaps(
          (key) => !key.defaultValue,
          allow.noStringDefault,
          (props) =>
            props
              .filter((prop) => prop.name === 'strings' || prop.name === 'labels')
              .flatMap((prop) => prop.keys ?? []),
        ),
      ).toEqual([]);
    });

    it('keeps the allowlists to rows that still need them', () => {
      const rows = new Map<string, PropsRecord>(
        components.flatMap(({ displayName, props }) =>
          [...props, ...props.flatMap((prop) => prop.keys ?? [])].map(
            (row) => [`${displayName}.${row.name}`, row] as const,
          ),
        ),
      );
      // An entry is stale once its row is gone or no longer has the gap it excuses.
      const fixed = (list: Record<string, string>, field: 'description' | 'defaultValue') =>
        Object.keys(list).filter((name) => !rows.has(name) || Boolean(rows.get(name)?.[field]));
      const stale = [
        ...fixed(allow.undescribed, 'description'),
        ...fixed(allow.undescribedKeys, 'description'),
        ...fixed(allow.noStringDefault, 'defaultValue'),
        ...fixed(allow.noEnumDefault, 'defaultValue'),
      ];
      expect(stale).toEqual([]);
    });
  });
}

describePackage('core props docs', 'core', 50, {
  undescribed: UNDESCRIBED,
  noEnumDefault: NO_ENUM_DEFAULT,
  undescribedKeys: {},
  noStringDefault: {},
});

describePackage('Pro props docs', 'pro', 30, {
  undescribed: Object.fromEntries(
    Object.entries(PRO_UNDESCRIBED).filter(([name]) => name.split('.').length === 2),
  ),
  noEnumDefault: PRO_NO_ENUM_DEFAULT,
  undescribedKeys: Object.fromEntries(
    Object.entries(PRO_UNDESCRIBED).filter(([name]) => name.split('.').length > 2),
  ),
  noStringDefault: PRO_NO_STRING_DEFAULT,
});
