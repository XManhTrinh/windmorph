import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const PropsTableBasic = lazyExample('props-table/props-table-basic', 'PropsTableBasic');
const PropsTableLabels = lazyExample('props-table/props-table-labels', 'PropsTableLabels');

/** Props table page body: purpose, examples and styling. */
export async function PropsTableBody(): Promise<ComponentDoc> {
  const [basic, labels] = await Promise.all([
    readExampleSource('props-table/props-table-basic.tsx'),
    readExampleSource('props-table/props-table-labels.tsx'),
  ]);
  const [basicHtml, labelsHtml] = await Promise.all([
    highlightSource(basic),
    highlightSource(labels),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="A component's props"
            code={basic}
            html={basicHtml}
            fileName="props-table-basic.tsx"
          >
            <PropsTableBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Translated headings"
            code={labels}
            html={labelsHtml}
            fileName="props-table-labels.tsx"
          >
            <PropsTableLabels />
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
            A props table documents a component&apos;s API: each prop&apos;s name, type, default and
            description, one row each. It is{' '}
            <strong className="text-on-surface">not an M3 component</strong>, so it comes from{' '}
            <InlineCode>@windmorph/react-pro</InlineCode>. It is built for documentation and is
            deliberately not a data table: there is no sorting, selection or paging. For data people
            work with, build a table of your own.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Generate the rows from your components&apos; types at build time, so the table never
            drifts from the code. It renders on the server and ships no script of its own.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 id="behaviour" className="text-headline-small text-on-surface">
            Behaviour
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              On a narrow screen the table keeps its columns (at least 512px) and scrolls sideways
              inside its rounded border, never the page.
            </li>
            <li>
              Names, types and defaults show as code, always left to right; a required prop has an
              asterisk.
            </li>
          </ul>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="styling" className="text-headline-small text-on-surface">
            Rows and styling
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Each row is a <InlineCode>PropsTableRow</InlineCode>: <InlineCode>name</InlineCode>,{' '}
              <InlineCode>type</InlineCode>, and optionally <InlineCode>defaultValue</InlineCode>,{' '}
              <InlineCode>description</InlineCode> (plain text) and{' '}
              <InlineCode>required</InlineCode>. Names must be unique.
            </li>
            <li>
              <InlineCode>className</InlineCode> and <InlineCode>style</InlineCode> go on the scroll
              region, the outermost element; <InlineCode>classNames</InlineCode> styles the table,
              its head, rows, header and data cells, and each column&apos;s cells.
            </li>
            <li>
              It has no tokens of its own: <InlineCode>surface</InlineCode> with{' '}
              <InlineCode>outline-variant</InlineCode> borders and medium corners, and its root
              carries <InlineCode>data-tokens=&quot;wm-props-table&quot;</InlineCode>.
            </li>
            <li>
              <InlineCode>labels</InlineCode> holds the caption, the four column headings and the
              word read after a required prop; <InlineCode>caption</InlineCode> wins over{' '}
              <InlineCode>labels.caption</InlineCode>.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
