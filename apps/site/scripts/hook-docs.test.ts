import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docText, documentHooksWith, documentTypesWith } from './hook-docs';

describe('docText', () => {
  it('reads a JSDoc link as its code name', () => {
    expect(docText([{ text: 'Wrap it in {@link FileTrigger}.', kind: 'text' }])).toBe(
      'Wrap it in `FileTrigger`.',
    );
  });
});

describe('documentHooksWith', () => {
  it("documents an options object field by field, with the hook's signature", () => {
    const [hook] = documentHooksWith([resolve(process.cwd(), 'scripts/fixtures/hooks.ts')], {
      strict: true,
      noLib: true,
      types: [],
    });
    expect(hook?.signature).toBe('useEdge(options?: EdgeOptions): boolean');
    expect(hook?.description).toBe("Whether the edge is in view, like `useEdge`'s callers expect.");
    expect(hook?.params.map((param) => param.name)).toEqual([
      'options',
      'options.threshold',
      'options.reverse',
    ]);
    expect(hook?.params[1]).toMatchObject({ type: 'number', required: false, defaultValue: '40' });
  });

  it("leaves out the members a type inherits from React's DOM attributes", () => {
    const [hook] = documentHooksWith(
      [resolve(process.cwd(), 'scripts/fixtures/inherited-hook.ts')],
      {
        strict: true,
        skipLibCheck: true,
        jsx: 4,
      },
    );
    expect(hook?.params.map((param) => param.name)).toEqual([
      'own',
      'own.aria-expanded',
      'own.openOnPressStart',
    ]);
  });
});

describe('documentTypesWith', () => {
  const entry = resolve(process.cwd(), 'scripts/fixtures/hooks.ts');
  const options = { strict: true, noLib: true, types: [] };

  it('documents a named type field by field, leaving names another entry exports', () => {
    const [type, ...rest] = documentTypesWith([entry], options, ['EdgeOptions', 'ElsewhereItem']);
    expect(rest).toEqual([]);
    expect(type).toMatchObject({ displayName: 'EdgeOptions', kind: 'type' });
    expect(type?.description).toBe('Options for `useEdge`.');
    expect(type?.fields.map((field) => field.name)).toEqual(['threshold', 'reverse']);
    expect(type?.fields[0]).toMatchObject({ type: 'number', required: false, defaultValue: '40' });
  });

  it("fails on a name that isn't a type", () => {
    expect(() => documentTypesWith([entry], options, ['useEdge'])).toThrow(
      /isn't an exported type/,
    );
  });
});
