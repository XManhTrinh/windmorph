import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { docText, documentHooksWith } from './hook-docs';

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
});
