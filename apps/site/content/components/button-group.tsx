import { ExampleViewer } from '../../components/example-viewer';
import { ButtonGroupConnected } from '../../examples/button-group/button-group-connected';
import { ButtonGroupMultiple } from '../../examples/button-group/button-group-multiple';
import { ButtonGroupStandard } from '../../examples/button-group/button-group-standard';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** ButtonGroup page body. */
export async function ButtonGroupBody() {
  const [standard, connected, multiple] = await Promise.all([
    readExampleSource('button-group/button-group-standard.tsx'),
    readExampleSource('button-group/button-group-connected.tsx'),
    readExampleSource('button-group/button-group-multiple.tsx'),
  ]);
  const [standardHtml, connectedHtml, multipleHtml] = await Promise.all([
    highlightSource(standard),
    highlightSource(connected),
    highlightSource(multiple),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          A button group lays out a set of related <code className="text-on-surface">Button</code>{' '}
          and <code className="text-on-surface">IconButton</code> children as a unit, sharing their
          size, shape and variant. The <code className="text-on-surface">connected</code> variant,
          with single or multiple selection, is the M3 Expressive replacement for segmented buttons.
        </p>
        <p className="text-body-large text-on-surface-variant">
          Use a standard group for a row of independent actions, and a connected group for choosing
          between mutually related options.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Standard"
          code={standard}
          html={standardHtml}
          fileName="button-group-standard.tsx"
        >
          <ButtonGroupStandard />
        </ExampleViewer>
        <ExampleViewer
          title="Connected, single selection"
          code={connected}
          html={connectedHtml}
          fileName="button-group-connected.tsx"
        >
          <ButtonGroupConnected />
        </ExampleViewer>
        <ExampleViewer
          title="Connected, multiple selection"
          code={multiple}
          html={multipleHtml}
          fileName="button-group-multiple.tsx"
        >
          <ButtonGroupMultiple />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Give the group an accessible name with{' '}
            <code className="text-on-surface">aria-label</code>.
          </li>
          <li>
            Without selection the group is a{' '}
            <code className="text-on-surface">role=&quot;group&quot;</code>; each button is tabbable
            and activates on Enter or Space.
          </li>
          <li>
            Single selection renders as a <code className="text-on-surface">radiogroup</code> of
            radios: arrow keys move between options and select, and every option stays reachable.
          </li>
          <li>
            Multiple selection behaves like a set of checkboxes.{' '}
            <code className="text-on-surface">disallowEmptySelection</code> keeps at least one
            option chosen.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Press expansion: the pressed item grows by{' '}
            <code className="text-on-surface">expandedRatio</code> (0.15) of its width while its
            neighbours shrink by the same amount, so the group&apos;s width stays constant. On the
            web the group watches each child&apos;s{' '}
            <code className="text-on-surface">data-pressed</code> and animates{' '}
            <code className="text-on-surface">flex-basis</code> on the fast spatial spring;{' '}
            <code className="text-on-surface">expandedRatio=0</code> turns it off.
          </li>
          <li>
            Connected groups use a 2px gap; outer corners stay full, inner corners are small (8px)
            and extra-small (4px) when pressed, and selected buttons become fully round. These are
            logical corners, so they mirror in RTL.
          </li>
          <li>
            Toggle buttons with a <code className="text-on-surface">value</code> join the
            group&apos;s React Aria toggle-group state; no-op selection changes that React Stately
            reports are not passed to <code className="text-on-surface">onSelectionChange</code>.
          </li>
          <li>
            Compose only ships <em>Small</em> group tokens (gaps 12px / 2px, inner corners 8/4px);
            those values are used at every size until per-size values are published. The Compose
            overflow menu is deferred.
          </li>
          <li>
            Children must be direct <code className="text-on-surface">Button</code> /{' '}
            <code className="text-on-surface">IconButton</code> elements, since each is wrapped in
            its own context provider for its position.
          </li>
        </ul>
      </section>
    </>
  );
}
