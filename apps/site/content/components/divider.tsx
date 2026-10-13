import { ExampleViewer } from '../../components/example-viewer';
import { DividerBasic } from '../../examples/divider/divider-basic';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

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
          <code className="text-on-surface">orientation</code> is{' '}
          <code className="text-on-surface">horizontal</code> (full width) or{' '}
          <code className="text-on-surface">vertical</code> (full height of a flex row), and{' '}
          <code className="text-on-surface">inset</code> leaves 16px at the start or at both ends.
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
            A divider is <code className="text-on-surface">role=&quot;separator&quot;</code> by
            default; a vertical one also reports{' '}
            <code className="text-on-surface">aria-orientation=&quot;vertical&quot;</code>.
          </li>
          <li>
            Set <code className="text-on-surface">decorative</code> for a purely visual line (e.g.
            between list items that already read as separate); it then takes{' '}
            <code className="text-on-surface">role=&quot;none&quot;</code> and is hidden from
            assistive tech.
          </li>
          <li>A divider is not focusable and has no interaction.</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            1px of <code className="text-on-surface">outline-variant</code> (
            <code className="text-on-surface">DividerTokens</code>), drawn as a background clipped
            to the content box, so insets are padding and the root keeps no margins.
          </li>
          <li>
            The <code className="text-on-surface">inset</code> values (16px at the start or both
            ends) come from m3.material.io; Compose leaves insets to padding.
          </li>
          <li>
            It is a <code className="text-on-surface">div</code> rather than an{' '}
            <code className="text-on-surface">hr</code>, since an{' '}
            <code className="text-on-surface">hr</code> can&apos;t take a vertical orientation.
          </li>
        </ul>
      </section>
    </>
  );
}
