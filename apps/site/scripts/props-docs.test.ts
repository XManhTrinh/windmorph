import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REACT_ARIA_RENAMES, type ComponentPropsFile, type PropsRecord } from './generate-props';

/**
 * Every public prop of every component, the core's and Pro's, is documented: the generated
 * props tables are read from the components' JSDoc (the core's sources, Pro's installed
 * declarations), so a prop without a description shows as an empty row. DOM attributes are
 * already left out by the generator and React Aria's props bring their own docs; the
 * allowlists below are for
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
 * Pro's props, and keys of its object props, that the pinned Pro build declares without JSDoc.
 * Empty: every Pro prop is described. A gap is fixed in Pro's TSDoc and re-pinned rather than
 * listed here, and the stale-allowlist check fails on any entry a newer pin describes.
 */
const PRO_UNDESCRIBED: Record<string, string> = {};

/** Pro's built-in strings without an English `@default` in the pinned build. Empty, as above. */
const PRO_NO_STRING_DEFAULT: Record<string, string> = {};

interface Allowlists {
  undescribed: Record<string, string>;
  noEnumDefault: Record<string, string>;
  /** Keys of `labels` and `classNames` without a description. */
  undescribedKeys: Record<string, string>;
  /** Keys of `labels` without an English default. */
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
          // React Aria's own props carry React Aria's docs, which rarely give a default.
          (prop) =>
            !prop.required && !prop.inherited && Boolean(prop.options) && !prop.defaultValue,
          allow.noEnumDefault,
        ),
      ).toEqual([]);
    });

    it("names the library's props, never React Aria's, in every row", () => {
      const renamed = new RegExp(`\\b(?:${Object.keys(REACT_ARIA_RENAMES).join('|')})\\b`);
      expect(
        gaps((prop) => renamed.test(`${prop.description ?? ''} ${prop.type}`) && !prop.keys, {}),
      ).toEqual([]);
    });

    it('never says disabled items cannot be focused', () => {
      expect(gaps((prop) => /cannot be [^.]*\bfocused\b/.test(prop.description ?? ''), {})).toEqual(
        [],
      );
    });

    it('lists the keys of every labels and classNames prop', () => {
      expect(
        gaps((prop) => ['labels', 'classNames'].includes(prop.name) && !prop.keys?.length, {}),
      ).toEqual([]);
    });

    it('describes every key of labels and classNames', () => {
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
            props.filter((prop) => prop.name === 'labels').flatMap((prop) => prop.keys ?? []),
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
