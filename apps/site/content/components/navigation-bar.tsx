import { ExampleViewer } from '../../components/example-viewer';
import { BarInline } from '../../examples/navigation-bar/bar-inline';
import { BarStacked } from '../../examples/navigation-bar/bar-stacked';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Navigation bar page body: stacked and inline items. */
export async function NavigationBarBody() {
  const [stacked, inline] = await Promise.all([
    readExampleSource('navigation-bar/bar-stacked.tsx'),
    readExampleSource('navigation-bar/bar-inline.tsx'),
  ]);
  const [stackedHtml, inlineHtml] = await Promise.all([
    highlightSource(stacked),
    highlightSource(inline),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          The flexible navigation bar holds 3–5 top-level destinations along the bottom of compact
          and medium windows. With{' '}
          <code className="text-on-surface">iconPosition=&quot;top&quot;</code> (the default) items
          stack the icon above the label; with{' '}
          <code className="text-on-surface">iconPosition=&quot;start&quot;</code> the icon sits
          beside the label in a pill, for the flexible bar in medium windows. For larger windows use
          a <code className="text-on-surface">NavigationRail</code> instead.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Items are links (<code className="text-on-surface">href</code>) or buttons (
          <code className="text-on-surface">onPress</code>) with an{' '}
          <code className="text-on-surface">icon</code>, an optional{' '}
          <code className="text-on-surface">selectedIcon</code> and a label;{' '}
          <code className="text-on-surface">selected</code> marks the current one.{' '}
          <code className="text-on-surface">arrangement=&quot;centered&quot;</code> groups the items
          within side padding instead of spreading them equally.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Stacked items (compact)"
          code={stacked}
          html={stackedHtml}
          fileName="bar-stacked.tsx"
        >
          <BarStacked />
        </ExampleViewer>
        <ExampleViewer
          title="Inline items, centred"
          code={inline}
          html={inlineHtml}
          fileName="bar-inline.tsx"
        >
          <BarInline />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            The bar is a <code className="text-on-surface">nav</code> landmark and needs a name via{' '}
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code> (required by the types).
          </li>
          <li>
            Each item is a link or button that Tab reaches and Enter or Space activates; the icon is
            hidden from assistive tech and the label names the item.
          </li>
          <li>
            The selected item sets{' '}
            <code className="text-on-surface">aria-current=&quot;page&quot;</code> so the current
            destination is announced.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            This is Compose&apos;s short / flexible navigation bar (
            <code className="text-on-surface">ShortNavigationBar</code>), which replaces the
            original navigation bar; it is 64px{' '}
            <code className="text-on-surface">surface-container</code> with no elevation.
          </li>
          <li>
            <code className="text-on-surface">arrangement=&quot;centered&quot;</code> reproduces
            Compose&apos;s side padding of (100% − 10% × (n + 3)) / 2 for up to 6 items.
          </li>
          <li>
            The pill grows from its centre on the default spatial spring, and the state layer and
            focus ring are pill-shaped, as in Compose&apos;s indicator ripple.
          </li>
        </ul>
      </section>
    </>
  );
}
