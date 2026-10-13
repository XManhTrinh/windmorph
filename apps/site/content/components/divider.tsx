import { ExampleViewer } from '../../components/example-viewer';
import { DividerBasic } from '../../examples/divider/divider-basic';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';

/** Divider page body: orientation, inset and the decorative flag. */
export async function DividerBody() {
  const basic = await readExampleSource('divider/divider-basic.tsx');
  const basicHtml = await highlightSource(basic);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A divider is a thin line that separates content into groups — between sections of a page,
          or between items in a list. Use it sparingly; whitespace or a change of surface often
          separates content more clearly than a line.
        </p>
        <p className="text-body-large text-on-surface-variant">
          <InlineCode>orientation</InlineCode> is <InlineCode>horizontal</InlineCode> (full width)
          or <InlineCode>vertical</InlineCode> (full height of a flex row), and{' '}
          <InlineCode>inset</InlineCode> leaves 16px at the start or at both ends.{' '}
          <InlineCode>LabeledDivider</InlineCode> adds supporting text 4px below the line, with 8px
          clear at the end and below, such as the name of the section that follows.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Insets and orientation"
          code={basic}
          html={basicHtml}
          fileName="divider-basic.tsx"
        >
          <DividerBasic />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            A divider is <InlineCode>role=&quot;separator&quot;</InlineCode> by default; a vertical
            one also reports <InlineCode>aria-orientation=&quot;vertical&quot;</InlineCode>.
          </li>
          <li>
            Set <InlineCode>decorative</InlineCode> for a purely visual line (e.g. between list
            items that already read as separate); it then takes{' '}
            <InlineCode>role=&quot;none&quot;</InlineCode> and is hidden from assistive tech.
          </li>
          <li>A divider is not focusable and has no interaction.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            1px of <InlineCode>outline-variant</InlineCode> (<InlineCode>DividerTokens</InlineCode>
            ), drawn as a background clipped to the content box, so insets are padding and the root
            keeps no margins.
          </li>
          <li>
            The <InlineCode>inset</InlineCode> values (16px at the start or both ends) come from
            m3.material.io; Compose leaves insets to padding.
          </li>
          <li>
            It is a <InlineCode>div</InlineCode> rather than an <InlineCode>hr</InlineCode>, since
            an <InlineCode>hr</InlineCode> can&apos;t take a vertical orientation.
          </li>
        </ul>
      </section>
    </>
  );
}
