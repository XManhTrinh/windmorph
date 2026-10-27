import { dividerTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const DividerBasic = lazyExample('divider/divider-basic', 'DividerBasic');
const DividerList = lazyExample('divider/divider-list', 'DividerList');

/** Divider page body: orientation, inset and the decorative flag. */
export async function DividerBody(): Promise<ComponentDoc> {
  const basic = await readExampleSource('divider/divider-basic.tsx');
  const basicHtml = await highlightSource(basic);

  const list = await readExampleSource('divider/divider-list.tsx');
  const listHtml = await highlightSource(list);

  return {
    tokens: [dividerTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Insets and orientation"
            code={basic}
            html={basicHtml}
            fileName="divider-basic.tsx"
          >
            <DividerBasic />
          </ExampleViewer>
          <ExampleViewer
            title="Dividers in a list"
            code={list}
            html={listHtml}
            fileName="divider-list.tsx"
          >
            <DividerList />
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
            A divider is a thin line that separates content into groups — between sections of a
            page, or between items in a list. Use it sparingly; whitespace or a change of surface
            often separates content more clearly than a line.
          </p>
          <p className="text-body-large text-on-surface-variant">
            <InlineCode>orientation</InlineCode> is <InlineCode>horizontal</InlineCode> (full width)
            or <InlineCode>vertical</InlineCode> (full height of a flex row), and{' '}
            <InlineCode>inset</InlineCode> leaves 16px at the start or at both ends.{' '}
            <InlineCode>LabeledDivider</InlineCode> adds supporting text 4px below a full-width
            line, the text 8px clear of the end and 8px clear below, such as the name of the section
            that follows.
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="differences-from-compose" className="text-headline-small text-on-surface">
            Differences from Compose
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              1px of <InlineCode>outline-variant</InlineCode> (
              <InlineCode>DividerTokens</InlineCode>
              ), drawn as a background clipped to the content box, so insets are padding and the
              root keeps no margins.
            </li>
            <li>
              The <InlineCode>inset</InlineCode> values (16px at the start or both ends) come from
              m3.material.io; Compose leaves insets to padding.
            </li>
            <li>
              It is a <InlineCode>div</InlineCode> rather than an <InlineCode>hr</InlineCode>, since
              an <InlineCode>hr</InlineCode> can&apos;t take a vertical orientation.
            </li>
            <li>
              It is decorative by default, hidden from assistive tech (M3: &ldquo;Dividers are
              decorative elements&rdquo;); <InlineCode>decorative={'{false}'}</InlineCode> exposes
              it as a <InlineCode>separator</InlineCode> where the line marks a real break.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
