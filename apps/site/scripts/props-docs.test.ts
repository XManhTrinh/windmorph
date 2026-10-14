import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { ComponentPropsFile, PropsRecord } from './generate-props';

/**
 * Every public prop of every core component is documented: the generated props tables are
 * read from the components' JSDoc, so a prop without a description shows as an empty row.
 * Props inherited from React and DOM types are already left out by the generator; the
 * allowlists below are for anything else that genuinely can't be described or defaulted.
 *
 * Pro's components are documented in Pro, so only the core is checked here.
 */

const propsDir = resolve(process.cwd(), '.generated/props');

function readCoreComponents(): ComponentPropsFile[] {
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
        (json as ComponentPropsFile).source === 'core',
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
  'ThemeScope.mode': 'Inherited from the nearest provider or scope when left out.',
  'ThemeScope.contrast': 'Inherited from the nearest provider or scope when left out.',
  'ThemeScope.motion': 'Inherited from the nearest provider or scope when left out.',
  'TimePicker.mode': 'Controlled; `defaultMode` holds the uncontrolled default.',
  'TopAppBar.scrollBehavior': 'Left out, the bar is static: no scroll behaviour is a value.',
  'SearchAppBar.scrollBehavior': 'Left out, the bar is static: no scroll behaviour is a value.',
};

const components = readCoreComponents();

/** `Component.prop` for each prop matching `test`, minus the allowlist. */
function gaps(
  test: (prop: PropsRecord) => boolean,
  allow: Record<string, string>,
  rows: (props: PropsRecord[]) => PropsRecord[] = (props) => props,
): string[] {
  return components.flatMap(({ displayName, props }) =>
    rows(props)
      .filter(test)
      .map((prop) => `${displayName}.${prop.name}`)
      .filter((name) => !(name in allow)),
  );
}

describe('core props docs', () => {
  it('reads the generated core components', () => {
    expect(components.length).toBeGreaterThan(50);
  });

  it('describes every public prop', () => {
    expect(gaps((prop) => !prop.description, UNDESCRIBED)).toEqual([]);
  });

  it('gives every optional string-literal prop its default', () => {
    expect(
      gaps(
        (prop) => !prop.required && Boolean(prop.options) && !prop.defaultValue,
        NO_ENUM_DEFAULT,
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
        {},
        (props) => props.flatMap((prop) => prop.keys ?? []),
      ),
    ).toEqual([]);
  });

  it('gives every built-in string its English default', () => {
    expect(
      gaps(
        (key) => !key.defaultValue,
        {},
        (props) =>
          props
            .filter((prop) => prop.name === 'strings' || prop.name === 'labels')
            .flatMap((prop) => prop.keys ?? []),
      ),
    ).toEqual([]);
  });

  it('keeps the allowlists to props that exist', () => {
    const names = new Set(
      components.flatMap(({ displayName, props }) =>
        props.map((prop) => `${displayName}.${prop.name}`),
      ),
    );
    const stale = [...Object.keys(UNDESCRIBED), ...Object.keys(NO_ENUM_DEFAULT)].filter(
      (name) => !names.has(name),
    );
    expect(stale).toEqual([]);
  });
});
