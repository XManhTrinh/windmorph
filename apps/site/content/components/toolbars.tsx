import { ExampleViewer } from '../../components/example-viewer';
import { ToolbarDocked } from '../../examples/toolbars/toolbar-docked';
import { ToolbarFabScroll } from '../../examples/toolbars/toolbar-fab-scroll';
import { ToolbarFloating } from '../../examples/toolbars/toolbar-floating';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Toolbars page body: docked, floating and a FAB with scroll expansion. */
export async function ToolbarsBody() {
  const [docked, floating, fabScroll] = await Promise.all([
    readExampleSource('toolbars/toolbar-docked.tsx'),
    readExampleSource('toolbars/toolbar-floating.tsx'),
    readExampleSource('toolbars/toolbar-fab-scroll.tsx'),
  ]);
  const [dockedHtml, floatingHtml, fabScrollHtml] = await Promise.all([
    highlightSource(docked),
    highlightSource(floating),
    highlightSource(fabScroll),
  ]);

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Toolbars gather a set of related actions. A{' '}
          <code className="text-on-surface">DockedToolbar</code> is a full-width 64px bar, usually
          along the bottom of the window (it replaces the bottom app bar), with its items spread out
          or centred. A <code className="text-on-surface">FloatingToolbar</code> is a pill that
          floats above the content, horizontal or vertical, in{' '}
          <code className="text-on-surface">standard</code> or{' '}
          <code className="text-on-surface">vibrant</code> colours.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A floating toolbar&apos;s <code className="text-on-surface">leading</code> and{' '}
          <code className="text-on-surface">trailing</code> groups collapse with{' '}
          <code className="text-on-surface">expanded</code>; alternatively pair it with a{' '}
          <code className="text-on-surface">fab</code> (a{' '}
          <code className="text-on-surface">ToolbarFab</code>), and collapsing hides the toolbar
          while the FAB grows. <code className="text-on-surface">useToolbarScrollExpansion</code>{' '}
          derives <code className="text-on-surface">expanded</code> from a scroll container.
        </p>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-headline-small text-on-surface">Examples</h2>
        <ExampleViewer
          title="Docked toolbar"
          code={docked}
          html={dockedHtml}
          fileName="toolbar-docked.tsx"
        >
          <ToolbarDocked />
        </ExampleViewer>
        <ExampleViewer
          title="Floating toolbar"
          code={floating}
          html={floatingHtml}
          fileName="toolbar-floating.tsx"
        >
          <ToolbarFloating />
        </ExampleViewer>
        <ExampleViewer
          title="FAB with scroll expansion"
          code={fabScroll}
          html={fabScrollHtml}
          fileName="toolbar-fab-scroll.tsx"
        >
          <ToolbarFabScroll />
        </ExampleViewer>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Keyboard &amp; screen reader</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Both toolbars are React Aria toolbars:{' '}
            <code className="text-on-surface">role=&quot;toolbar&quot;</code>, a required name (
            <code className="text-on-surface">aria-label</code> or{' '}
            <code className="text-on-surface">aria-labelledby</code>), and arrow keys between the
            controls, following the DOM direction.
          </li>
          <li>
            The controls are ordinary buttons, so each icon button still needs its own{' '}
            <code className="text-on-surface">aria-label</code>; the{' '}
            <code className="text-on-surface">ToolbarFab</code> is named the same way.
          </li>
          <li>
            Keyboard focus inside a floating toolbar expands it, so collapsed{' '}
            <code className="text-on-surface">leading</code> /{' '}
            <code className="text-on-surface">trailing</code> controls stay reachable; collapsed
            content is <code className="text-on-surface">inert</code> otherwise.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Differences from Compose</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Compose forces the toolbar open under a screen reader and adds expand / collapse
            actions. The web cannot detect either, so keyboard focus within counts as expanded;
            pointer focus does not.
          </li>
          <li>
            Collapsing closes the leading / trailing content through a grid track on the fast
            spatial spring, clipping only along the toolbar so focus rings and touch targets
            survive. With a FAB, the toolbar keeps its measured width while the surface springs to 0
            and the FAB&apos;s box grows 56 → 80px.
          </li>
          <li>
            <code className="text-on-surface">useToolbarScrollExpansion</code> ports Compose&apos;s
            vertical nested-scroll behaviour: 40px down collapses, 40px back up expands. There is no{' '}
            <code className="text-on-surface">onExpandedChange</code>, since nothing inside changes
            it.
          </li>
          <li>
            Deferred: the exit-always scroll behaviour, the docked toolbar&apos;s scroll collapse,
            and the overflow menu.
          </li>
        </ul>
      </section>
    </>
  );
}
