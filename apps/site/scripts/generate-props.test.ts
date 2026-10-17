import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  enumOptionsFromType,
  enumValuesFromType,
  htmlAttributeElements,
  keepProp,
  normalizeDefaultValue,
  propOrigin,
  quoteDefault,
  refineWithChecker,
  refByForm,
  stripDocTags,
  type ComponentPropsFile,
} from './generate-props';

const ARIA = '/repo/node_modules/.pnpm/x/node_modules/@react-types/button/src/index.d.ts';
const DOM = '/repo/node_modules/.pnpm/x/node_modules/@types/react/index.d.ts';
const OWN = '/repo/packages/react/src/components/button/Button.tsx';
const PRO = '/repo/node_modules/@windmorph/react-pro/dist/components/link/Link.d.ts';

describe('enumOptionsFromType', () => {
  it('extracts string-literal union members with quotes stripped', () => {
    const options = enumOptionsFromType({
      name: 'enum',
      value: [{ value: '"filled"' }, { value: '"outlined"' }, { value: '"text"' }],
    });
    expect(options).toEqual(['filled', 'outlined', 'text']);
  });

  it('drops an `undefined` member (from optional unions)', () => {
    const options = enumOptionsFromType({
      name: 'enum',
      value: [{ value: '"sm"' }, { value: 'undefined' }],
    });
    expect(options).toEqual(['sm']);
  });

  it('returns undefined for a non-enum type', () => {
    expect(enumOptionsFromType({ name: 'boolean' })).toBeUndefined();
    expect(enumOptionsFromType({ name: 'string' })).toBeUndefined();
    expect(enumOptionsFromType(undefined)).toBeUndefined();
  });

  it('returns undefined for an enum with no usable members', () => {
    expect(enumOptionsFromType({ name: 'enum', value: [{ value: 'undefined' }] })).toBeUndefined();
  });
});

describe('enumValuesFromType', () => {
  it('keeps each member as written, so strings and numbers stay apart', () => {
    const values = enumValuesFromType({
      name: 'enum',
      value: [{ value: '"sm"' }, { value: '1' }, { value: 'undefined' }],
    });
    expect(values).toEqual(['"sm"', '1']);
  });

  it('returns undefined for a non-enum type', () => {
    expect(enumValuesFromType({ name: 'string' })).toBeUndefined();
  });
});

describe('normalizeDefaultValue', () => {
  it("collapses one default repeated by a union's members to a single value", () => {
    // Button's `variant` is declared in its action, link and toggle forms.
    expect(normalizeDefaultValue('"filled"\n"filled"')).toBe('"filled"');
    expect(normalizeDefaultValue('"sm"\n"sm"\n"sm"')).toBe('"sm"');
  });

  it('keeps a single-line default as it is', () => {
    expect(normalizeDefaultValue('0.15')).toBe('0.15');
  });

  it('keeps a default that genuinely spans several lines', () => {
    const raw = '{ start: 16, end: 16 } (uncontained: no end padding;\nfull-screen: none)';
    expect(normalizeDefaultValue(raw)).toBe(raw);
  });
});

describe('keepProp', () => {
  const prop = (name: string, ...files: string[]) => ({
    name,
    declarations: files.map((fileName) => ({ fileName })),
  });

  it("keeps the package's own props, Pro's included", () => {
    expect(keepProp(prop('variant', OWN))).toBe(true);
    expect(keepProp(prop('tone', PRO))).toBe(true);
  });

  it("keeps React Aria's props, which are API (onPress, errorMessage, selection)", () => {
    for (const name of ['onPress', 'errorMessage', 'placeholder', 'name', 'value', 'onAction']) {
      expect(keepProp(prop(name, ARIA))).toBe(true);
    }
  });

  it("leaves out React Aria's deprecated, escape-hatch, plumbing and is* props", () => {
    for (const name of ['validationState', 'UNSAFE_className', 'aria-haspopup', 'isRequired']) {
      expect(keepProp(prop(name, ARIA))).toBe(false);
    }
  });

  it('keeps only ref, className and style of the DOM attributes', () => {
    expect(keepProp(prop('className', DOM))).toBe(true);
    expect(keepProp(prop('onMouseEnter', DOM))).toBe(false);
  });

  it('counts a prop the component redeclares over a DOM attribute as its own', () => {
    const redeclared = { ...prop('aria-labelledby', OWN, DOM), parent: { fileName: DOM } };
    expect(propOrigin(redeclared)).toBe('own');
    expect(keepProp(redeclared)).toBe(true);
  });
});

describe('htmlAttributeElements', () => {
  it('names the elements whose attributes the props extend', () => {
    expect(htmlAttributeElements(['ButtonHTMLAttributes', 'AnchorHTMLAttributes'])).toEqual([
      'a',
      'button',
    ]);
    expect(htmlAttributeElements(['HTMLAttributes', 'DOMAttributes'])).toEqual(['element']);
    expect(htmlAttributeElements([])).toBeUndefined();
  });
});

describe('quoteDefault', () => {
  it('quotes a destructured enum or string default like a JSDoc one', () => {
    expect(quoteDefault('popover', { type: 'enum', values: ['"popover"', '"sheet"'] }, false)).toBe(
      '"popover"',
    );
    expect(quoteDefault('windmorph-theme', { type: 'string' }, false)).toBe('"windmorph-theme"');
  });

  it('leaves a quoted default, a number and a written @default as they are', () => {
    expect(quoteDefault('"sm"', { type: 'enum', values: ['"sm"'] }, true)).toBe('"sm"');
    expect(quoteDefault('4', { type: 'number' }, false)).toBe('4');
    expect(quoteDefault('a generated id', { type: 'string' }, true)).toBe('a generated id');
  });
});

describe('stripDocTags', () => {
  it("drops the raw @see line React's DOM docs carry", () => {
    expect(stripDocTags('Defines a string value.\n@see aria-labelledby.')).toBe(
      'Defines a string value.',
    );
  });
});

describe('refineWithChecker', () => {
  const fixture = resolve(process.cwd(), 'scripts/fixtures/union-props.ts');
  const record = (): ComponentPropsFile => ({
    displayName: 'Control',
    description: '',
    source: 'core',
    props: [
      {
        name: 'variant',
        type: 'enum',
        required: false,
        defaultValue: 'filled',
        values: ['"filled"', '"text"'],
      },
      {
        name: 'ref',
        type: 'string',
        required: false,
        description:
          'Ref to the root element: the `<button>`, or the `<a>` with `href`.\nRef to the root `<a>` element.',
      },
      {
        name: 'href',
        type: 'string',
        required: true,
        description: 'Not set: the control is a button.\nRenders a link.',
      },
      { name: 'aria-label', type: 'string', required: true },
      { name: 'aria-labelledby', type: 'string', required: true },
    ],
  });
  const refined = () => {
    const records = [record()];
    refineWithChecker(records, [fixture], { strict: true, noLib: true, types: [] });
    return Object.fromEntries(records[0]!.props.map((prop) => [prop.name, prop]));
  };

  it('marks a prop required only when every form requires it', () => {
    const props = refined();
    expect(props.href?.required).toBe(false);
    expect(props['aria-label']?.required).toBe(false);
    expect(props['aria-labelledby']?.required).toBe(false);
  });

  it("keeps one form's description instead of joining them, skipping a form that rules it out", () => {
    const props = refined();
    expect(props.ref?.description).toBe(
      'Ref to the root element: the `<button>`, or the `<a>` with `href`.',
    );
    expect(props.href?.description).toBe('Renders a link.');
  });

  it('notes a naming pair on both rows', () => {
    const props = refined();
    expect(props['aria-label']?.description).toBe(
      'Names the control.\n\nOne of `aria-label` or `aria-labelledby` is required.',
    );
    expect(props['aria-labelledby']?.description).toContain('One of `aria-label` or');
  });

  it('takes the @default tag, quoted', () => {
    expect(refined().variant?.defaultValue).toBe('"filled"');
  });
});

describe('refByForm', () => {
  it("names each form's element in one ref description", () => {
    expect(
      refByForm(['Ref to the root `<button>` element.', 'Ref to the root `<a>` element.']),
    ).toBe('Ref to the root element: the `<button>`, or the `<a>` with `href`.');
    expect(refByForm(['Ref to the `<a>`.', 'Ref to the `<button>`.'])).toBe(
      'Ref to the root element: the `<a>`, or the `<button>`.',
    );
    expect(refByForm(['Ref to the root `<div>`.'])).toBeUndefined();
  });
});
