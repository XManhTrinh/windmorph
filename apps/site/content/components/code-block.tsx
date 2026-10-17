import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const CodeBlockHighlighted = lazyExample(
  'code-block/code-block-highlighted',
  'CodeBlockHighlighted',
);
const CodeBlockLineNumbers = lazyExample(
  'code-block/code-block-line-numbers',
  'CodeBlockLineNumbers',
);
const CodeBlockPlain = lazyExample('code-block/code-block-plain', 'CodeBlockPlain');

/** Code block page body: purpose, examples, highlighting and styling. */
export async function CodeBlockBody(): Promise<ComponentDoc> {
  const [highlighted, lineNumbers, plain] = await Promise.all([
    readExampleSource('code-block/code-block-highlighted.tsx'),
    readExampleSource('code-block/code-block-line-numbers.tsx'),
    readExampleSource('code-block/code-block-plain.tsx'),
  ]);
  const [highlightedHtml, lineNumbersHtml, plainHtml] = await Promise.all([
    highlightSource(highlighted),
    highlightSource(lineNumbers),
    highlightSource(plain),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Highlighted, with a title"
            code={highlighted}
            html={highlightedHtml}
            fileName="code-block-highlighted.tsx"
          >
            <CodeBlockHighlighted />
          </ExampleViewer>
          <ExampleViewer
            title="Line numbers"
            code={lineNumbers}
            html={lineNumbersHtml}
            fileName="code-block-line-numbers.tsx"
          >
            <CodeBlockLineNumbers />
          </ExampleViewer>
          <ExampleViewer
            title="Plain text, with and without copying"
            code={plain}
            html={plainHtml}
            fileName="code-block-plain.tsx"
          >
            <CodeBlockPlain />
          </ExampleViewer>
        </section>
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            A code block shows source code in documentation, a guide or a settings page, with a
            button that copies it. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>; this site shows every sample in one. Use
            it for code people read or copy; for a word of code inside a sentence, use inline{' '}
            <InlineCode>code</InlineCode> instead.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Highlight the code at build time and pass the markup as <InlineCode>html</InlineCode>,
            with the raw text as <InlineCode>code</InlineCode>, which the copy button copies. The
            component ships no highlighter, so nothing heavy reaches the browser.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              The copy button copies <InlineCode>code</InlineCode>, turns into a check mark named
              &quot;Copied&quot; for two seconds, and announces it.
            </li>
            <li>
              Long lines scroll sideways inside the block, never the page. The code always reads
              left to right, also on a right-to-left page.
            </li>
            <li>
              <InlineCode>title</InlineCode> shows in the header (a file name, usually) and names
              the code. Without a title and with <InlineCode>copyable={'{false}'}</InlineCode> there
              is no header.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="highlighting" className="text-headline-small text-on-surface">
            Highlighting
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>html</InlineCode> is trusted markup from your own build, rendered as it is
              inside <InlineCode>&lt;pre&gt;&lt;code&gt;</InlineCode>: never pass text people typed.
              Without it, <InlineCode>code</InlineCode> shows as plain text.
            </li>
            <li>
              It expects Shiki&apos;s CSS-variables theme (
              <InlineCode>createCssVariablesTheme</InlineCode>
              ), whose token spans read <InlineCode>--shiki-token-*</InlineCode> variables. The
              block sets them to M3 colour roles (keywords <InlineCode>primary</InlineCode>, strings{' '}
              <InlineCode>tertiary</InlineCode>, comments{' '}
              <InlineCode>on-surface-variant</InlineCode>
              …), so one highlight follows every theme, mode and contrast level. Set a variable on
              the block (with <InlineCode>className</InlineCode>) to change a colour.
            </li>
            <li>
              <InlineCode>showLineNumbers</InlineCode> counts the highlighter&apos;s{' '}
              <InlineCode>.line</InlineCode> spans, so it needs <InlineCode>html</InlineCode>.
            </li>
          </ul>
        </section>
        <section className="flex flex-col gap-3">
          <h2 id="styling" className="text-headline-small text-on-surface">
            Styling
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              <InlineCode>className</InlineCode> and <InlineCode>style</InlineCode> go on the
              bordered root; <InlineCode>classNames</InlineCode> styles the header, title,{' '}
              <InlineCode>pre</InlineCode>, <InlineCode>code</InlineCode> and copy button.
            </li>
            <li>
              It has no tokens of its own: it is <InlineCode>surface-container</InlineCode> with an{' '}
              <InlineCode>outline-variant</InlineCode> border and medium corners, and its root
              carries <InlineCode>data-tokens=&quot;wm-code-block&quot;</InlineCode>. The copy
              button is the core&apos;s standard <InlineCode>IconButton</InlineCode>, kept at
              density 0 in its 48px header.
            </li>
            <li>
              <InlineCode>labels</InlineCode> holds every word it shows or announces:{' '}
              <InlineCode>copy</InlineCode>, <InlineCode>copied</InlineCode> and{' '}
              <InlineCode>region</InlineCode>, the code&apos;s name when there is no title.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
