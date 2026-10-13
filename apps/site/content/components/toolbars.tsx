import { ExampleViewer } from '../../components/example-viewer';
import { ToolbarDocked } from '../../examples/toolbars/toolbar-docked';
import { ToolbarFabScroll } from '../../examples/toolbars/toolbar-fab-scroll';
import { ToolbarFloating } from '../../examples/toolbars/toolbar-floating';
import { ToolbarOverflow } from '../../examples/toolbars/toolbar-overflow';
import { ToolbarScrollExit } from '../../examples/toolbars/toolbar-scroll-exit';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';

/** Toolbars page body: docked, floating, overflow, scroll expansion and scroll exit. */
export async function ToolbarsBody() {
  const [docked, floating, overflow, fabScroll, scrollExit] = await Promise.all([
    readExampleSource('toolbars/toolbar-docked.tsx'),
    readExampleSource('toolbars/toolbar-floating.tsx'),
    readExampleSource('toolbars/toolbar-overflow.tsx'),
    readExampleSource('toolbars/toolbar-fab-scroll.tsx'),
    readExampleSource('toolbars/toolbar-scroll-exit.tsx'),
  ]);
  const [dockedHtml, floatingHtml, overflowHtml, fabScrollHtml, scrollExitHtml] = await Promise.all(
    [
      highlightSource(docked),
      highlightSource(floating),
      highlightSource(overflow),
      highlightSource(fabScroll),
      highlightSource(scrollExit),
    ],
  );

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Purpose</h2>
        <p className="text-body-large text-on-surface-variant">
          Toolbars gather a set of related actions. A{' '}
          <code className="text-on-surface">DockedToolbar</code> is a full-width 64px bar, usually
          along the bottom of the window (it replaces the bottom app bar), with its items centred
          32px apart or, in compact windows, spread out. A{' '}
          <code className="text-on-surface">FloatingToolbar</code> is a pill that floats above the
          content, horizontal (16px from the window&apos;s edge) or vertical (24px), in{' '}
          <code className="text-on-surface">standard</code> or{' '}
          <code className="text-on-surface">vibrant</code> colours. It is elevated by default; set{' '}
          <code className="text-on-surface">elevated={'{false}'}</code> over visually distinct
          content. Avoid square icon buttons in it (a development warning flags them).
        </p>
        <p className="text-body-large text-on-surface-variant">
          Icon buttons take the toolbar&apos;s colours: standard buttons are{' '}
          <code className="text-on-surface">on-surface-variant</code> in a standard toolbar and{' '}
          <code className="text-on-surface">on-primary-container</code> in a vibrant one, where a
          selected tonal toggle turns <code className="text-on-surface">surface-container</code> /{' '}
          <code className="text-on-surface">on-surface</code>. When the actions don&apos;t fit, put
          the rest in an overflow menu in the trailing slot.
        </p>
        <p className="text-body-large text-on-surface-variant">
          A floating toolbar&apos;s <code className="text-on-surface">leading</code> and{' '}
          <code className="text-on-surface">trailing</code> groups collapse with{' '}
          <code className="text-on-surface">expanded</code>; alternatively pair it with a{' '}
          <code className="text-on-surface">fab</code> (a{' '}
          <code className="text-on-surface">ToolbarFab</code>), and collapsing hides the toolbar
          while the FAB grows. <code className="text-on-surface">useToolbarScrollExpansion</code>{' '}
          derives <code className="text-on-surface">expanded</code> from a scroll container. Either
          toolbar can instead leave the screen on scroll:{' '}
          <code className="text-on-surface">useToolbarScrollExit</code> drives its{' '}
          <code className="text-on-surface">visible</code> prop (and{' '}
          <code className="text-on-surface">exitEdge</code> picks the floating toolbar&apos;s edge).
          Use one behaviour or the other, never both.
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
          title="Vibrant, with an overflow menu"
          code={overflow}
          html={overflowHtml}
          fileName="toolbar-overflow.tsx"
        >
          <ToolbarOverflow />
        </ExampleViewer>
        <ExampleViewer
          title="FAB with scroll expansion"
          code={fabScroll}
          html={fabScrollHtml}
          fileName="toolbar-fab-scroll.tsx"
        >
          <ToolbarFabScroll />
        </ExampleViewer>
        <ExampleViewer
          title="Leaving the screen on scroll"
          code={scrollExit}
          html={scrollExitHtml}
          fileName="toolbar-scroll-exit.tsx"
        >
          <ToolbarScrollExit />
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
            Collapsed controls stay in the tab order and the accessibility tree, clipped to nothing,
            and focus reaching them (from the keyboard or a screen reader) expands the toolbar, so
            every control stays reachable while collapsed. Keyboard focus anywhere inside keeps it
            expanded; pointer focus on the always-shown controls doesn&apos;t.
          </li>
          <li>
            A toolbar that has left the screen (
            <code className="text-on-surface">visible={'{false}'}</code>) is{' '}
            <code className="text-on-surface">inert</code>.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-headline-small text-on-surface">Spec values and differences</h2>
        <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
          <li>
            Compose forces the toolbar open under a screen reader and adds expand / collapse
            actions. The web cannot detect either, so collapsed controls stay reachable and focus on
            them expands the toolbar.
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
            <code className="text-on-surface">useToolbarScrollExit</code> follows Compose&apos;s
            exit-always behaviour with the same 40px thresholds: the toolbar slides past its edge on
            the fast spatial spring (a <code className="text-on-surface">transform</code> set only
            while hidden, so it composes with Tailwind&apos;s{' '}
            <code className="text-on-surface">translate-*</code> utilities). It doesn&apos;t follow
            the finger.
          </li>
          <li>
            There is no built-in overflow row: compose a{' '}
            <code className="text-on-surface">MenuTrigger</code> in the trailing slot, as in the
            example.
          </li>
        </ul>
      </section>
    </>
  );
}
