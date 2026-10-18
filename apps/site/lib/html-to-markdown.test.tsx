import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PropsList } from '../components/props-list';
import { SpecStatus } from '../components/spec-status';
import { SPEC_DATA } from '../content/components/spec-data';
import { htmlToMarkdown } from './html-to-markdown';

function markdown(html: string, headingOffset = 0): string {
  const root = document.createElement('div');
  root.innerHTML = html;
  return htmlToMarkdown(root, {
    pagePath: '/components/button',
    siteUrl: 'https://example.com',
    headingOffset,
    exampleSource: (fileName) => `// ${fileName}`,
  });
}

describe('htmlToMarkdown', () => {
  it('writes headings, paragraphs with inline code, and absolute links', () => {
    expect(
      markdown(
        '<h2 id="purpose">Purpose</h2><p>Use a <code>Fab</code> for the <a href="/components/fab">main action</a>.</p>',
      ),
    ).toBe('## Purpose\n\nUse a `Fab` for the [main action](https://example.com/components/fab).');
  });

  it('moves headings down by the offset', () => {
    expect(markdown('<h2>Props</h2><h3>Button</h3>', 1)).toBe('### Props\n\n#### Button');
  });

  it('writes nested lists', () => {
    expect(markdown('<ul><li>One<ul><li>Inner</li></ul></li><li>Two</li></ul>')).toBe(
      '- One\n  - Inner\n- Two',
    );
  });

  it('writes tables, escaping pipes', () => {
    expect(
      markdown(
        '<table><thead><tr><th>Name</th><th>Type</th></tr></thead><tbody><tr><td><code>size</code></td><td>"sm" | "md"</td></tr></tbody></table>',
      ),
    ).toBe('| Name | Type |\n| --- | --- |\n| `size` | "sm" \\| "md" |');
  });

  it('writes a code block with its language and title', () => {
    expect(
      markdown(
        '<div data-lang="css"><div><span>globals.css</span><button>Copy</button></div><pre aria-label="globals.css"><code><span>@import "a";</span>\n<span>@import "b";</span></code></pre></div>',
      ),
    ).toBe('`globals.css`:\n\n```css\n@import "a";\n@import "b";\n```');
  });

  it('replaces an example with its title and source file', () => {
    expect(
      markdown(
        '<div data-example-file="button-sizes.tsx" data-example-lang="tsx"><h3>Sizes</h3><div><div data-example="button/button-sizes"><button>XS</button></div></div><button>Show code</button></div>',
      ),
    ).toBe('### Sizes\n\n`button-sizes.tsx`:\n\n```tsx\n// button-sizes.tsx\n```');
  });

  it('leaves out controls, hidden content and anything marked to skip', () => {
    expect(
      markdown(
        '<p>Kept</p><button>Press</button><div role="tablist"><span>Tab</span></div><span aria-hidden="true">icon</span><section data-markdown="skip"><h2>Playground</h2></section><svg></svg>',
      ),
    ).toBe('Kept');
  });

  it("keeps an accordion header's text, and a closed panel's content", () => {
    expect(
      markdown(
        '<h3><button aria-expanded="false">Is there a free trial?<svg></svg></button></h3><div hidden="until-found"><p>Not yet.</p></div>',
      ),
    ).toBe('### Is there a free trial?\n\nNot yet.');
  });

  it('writes no heading without text', () => {
    expect(markdown('<h3><button>Can I use it offline?</button></h3>')).toMatch(/^### \S/);
  });

  it("writes a spec status once, as a table, without the phone cards' glued text", () => {
    const text = markdown(
      renderToStaticMarkup(<SpecStatus slug="button" title="Button" data={SPEC_DATA.button!} />),
    );
    const firstItem = /^\| ([^|]+) \|/m.exec(text.split('\n').slice(4).join('\n'))?.[1]?.trim();
    expect(firstItem).toBeTruthy();
    expect(text.split(firstItem!).length - 1).toBe(1);
    expect(text).not.toMatch(/\n- /);
  });

  it('writes definition lists whose terms sit in their own elements', () => {
    expect(markdown('<dl><div><dt>Sizes</dt><dd><code>xs, sm</code></dd></div></dl>')).toBe(
      '- **Sizes**: `xs, sm`',
    );
  });

  it('writes a props list as one table, folded keys included, with full types', () => {
    const html = renderToStaticMarkup(
      <PropsList
        caption="Sheet props"
        scope="Sheet"
        props={[
          {
            name: 'size',
            type: 'enum',
            required: true,
            defaultValue: '"sm"',
            description: 'The `sm` size;\nor {@link Badge}.',
            values: ['"sm"', '"md"'],
          },
          {
            name: 'labels',
            type: 'Partial<SheetLabels>',
            required: false,
            keys: [
              { name: 'labels.close', type: 'string', required: false, defaultValue: '"Close"' },
            ],
          },
        ]}
      />,
    );
    expect(markdown(`<h3>Sheet</h3>${html}`)).toBe(
      [
        '### Sheet',
        '',
        'Sheet props:',
        '',
        '| Name | Type | Default | Description |',
        '| --- | --- | --- | --- |',
        '| `size` (required) | `"sm" \\| "md"` | `"sm"` | The `sm` size; or [`Badge`](https://example.com/components/badge/api). |',
        '| `labels` | `Partial<SheetLabels>` |  |  |',
        '| `labels.close` | `string` | `"Close"` |  |',
      ].join('\n'),
    );
  });
});
