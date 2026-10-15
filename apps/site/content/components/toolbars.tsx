import { dockedToolbarTokenSet, floatingToolbarTokenSet } from '@windmorph/react';
import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const ToolbarDocked = lazyExample('toolbars/toolbar-docked', 'ToolbarDocked');
const ToolbarDockedOverflow = lazyExample(
  'toolbars/toolbar-docked-overflow',
  'ToolbarDockedOverflow',
);
const ToolbarFabScroll = lazyExample('toolbars/toolbar-fab-scroll', 'ToolbarFabScroll');
const ToolbarFloating = lazyExample('toolbars/toolbar-floating', 'ToolbarFloating');
const ToolbarOverflow = lazyExample('toolbars/toolbar-overflow', 'ToolbarOverflow');
const ToolbarScrollExit = lazyExample('toolbars/toolbar-scroll-exit', 'ToolbarScrollExit');
const ToolbarVertical = lazyExample('toolbars/toolbar-vertical', 'ToolbarVertical');

/** Toolbars page body: docked, floating, overflow, scroll expansion and scroll exit. */
export async function ToolbarsBody(): Promise<ComponentDoc> {
  const [docked, dockedOverflow, floating, vertical, overflow, fabScroll, scrollExit] =
    await Promise.all([
      readExampleSource('toolbars/toolbar-docked.tsx'),
      readExampleSource('toolbars/toolbar-docked-overflow.tsx'),
      readExampleSource('toolbars/toolbar-floating.tsx'),
      readExampleSource('toolbars/toolbar-vertical.tsx'),
      readExampleSource('toolbars/toolbar-overflow.tsx'),
      readExampleSource('toolbars/toolbar-fab-scroll.tsx'),
      readExampleSource('toolbars/toolbar-scroll-exit.tsx'),
    ]);
  const [
    dockedHtml,
    dockedOverflowHtml,
    floatingHtml,
    verticalHtml,
    overflowHtml,
    fabScrollHtml,
    scrollExitHtml,
  ] = await Promise.all([
    highlightSource(docked),
    highlightSource(dockedOverflow),
    highlightSource(floating),
    highlightSource(vertical),
    highlightSource(overflow),
    highlightSource(fabScroll),
    highlightSource(scrollExit),
  ]);

  return {
    tokens: [dockedToolbarTokenSet, floatingToolbarTokenSet],
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Docked toolbar"
            code={docked}
            html={dockedHtml}
            fileName="toolbar-docked.tsx"
          >
            <ToolbarDocked />
          </ExampleViewer>
          <ExampleViewer
            title="Docked, with an overflow menu"
            code={dockedOverflow}
            html={dockedOverflowHtml}
            fileName="toolbar-docked-overflow.tsx"
          >
            <ToolbarDockedOverflow />
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
            title="Vertical, standard and vibrant"
            code={vertical}
            html={verticalHtml}
            fileName="toolbar-vertical.tsx"
          >
            <ToolbarVertical />
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
      </>
    ),
    guidelines: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="purpose" className="text-headline-small text-on-surface">
            Purpose
          </h2>
          <p className="text-body-large text-on-surface-variant">
            Toolbars gather a set of related actions. A <InlineCode>DockedToolbar</InlineCode> is a
            full-width 64px bar, usually along the bottom of the window (it replaces the bottom app
            bar). Its items sit centred 32px apart by default; for the spec&apos;s alternative,
            centred 8px apart, add <InlineCode>className=&quot;gap-2&quot;</InlineCode>. In compact
            windows, spread them evenly with{' '}
            <InlineCode>arrangement=&quot;space-between&quot;</InlineCode>. A{' '}
            <InlineCode>FloatingToolbar</InlineCode> is a pill that floats above the content,
            horizontal (16px from the window&apos;s edge) or vertical (24px), in{' '}
            <InlineCode>standard</InlineCode> or <InlineCode>vibrant</InlineCode> colours. It is
            elevated by default; set <InlineCode>elevated={'{false}'}</InlineCode> over visually
            distinct content. Avoid square icon buttons in it, and wide ones in a vertical toolbar
            (development warnings flag both).
          </p>
          <p className="text-body-large text-on-surface-variant">
            Icon buttons take the toolbar&apos;s colours: standard buttons are{' '}
            <InlineCode>on-surface-variant</InlineCode> in a standard toolbar and{' '}
            <InlineCode>on-primary-container</InlineCode> in a vibrant one, where a selected tonal
            toggle turns <InlineCode>surface-container</InlineCode> /{' '}
            <InlineCode>on-surface</InlineCode>. When the actions don&apos;t fit, as in compact
            windows, put the rest in an overflow menu: a <InlineCode>MenuTrigger</InlineCode> with
            an icon button at the end of a docked toolbar, or in a floating toolbar&apos;s trailing
            slot.
          </p>
          <p className="text-body-large text-on-surface-variant">
            A floating toolbar&apos;s <InlineCode>leading</InlineCode> and{' '}
            <InlineCode>trailing</InlineCode> groups collapse with <InlineCode>expanded</InlineCode>
            ; alternatively pair it with a <InlineCode>fab</InlineCode> (a{' '}
            <InlineCode>ToolbarFab</InlineCode>), and collapsing hides the toolbar while the FAB
            grows. <InlineCode>useToolbarScrollExpansion</InlineCode> derives{' '}
            <InlineCode>expanded</InlineCode> from a scroll container. Either toolbar can instead
            leave the screen on scroll: <InlineCode>useToolbarScrollExit</InlineCode> drives its{' '}
            <InlineCode>visible</InlineCode> prop (and <InlineCode>exitEdge</InlineCode> picks the
            floating toolbar&apos;s edge). Use one behaviour or the other, never both: a development
            warning flags a floating toolbar that is collapsed and hidden at once. Pair a floating
            toolbar with a FAB, not an extended FAB (also flagged in development).
          </p>
        </section>
      </>
    ),
    api: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="spec-values-and-differences" className="text-headline-small text-on-surface">
            Spec values and differences
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              Compose forces the toolbar open under a screen reader and adds expand / collapse
              actions. The web cannot detect either, so collapsed controls stay reachable and focus
              on them expands the toolbar.
            </li>
            <li>
              Collapsing closes the leading / trailing content through a grid track on the fast
              spatial spring, clipping only along the toolbar so focus rings and touch targets
              survive. With a FAB, the toolbar keeps its measured width while the surface springs to
              0 and the FAB&apos;s box grows 56 → 80px.
            </li>
            <li>
              <InlineCode>useToolbarScrollExpansion</InlineCode> ports Compose&apos;s vertical
              nested-scroll behaviour: 40px down collapses, 40px back up expands. There is no{' '}
              <InlineCode>onExpandedChange</InlineCode>, since nothing inside changes it.
            </li>
            <li>
              <InlineCode>useToolbarScrollExit</InlineCode> follows Compose&apos;s exit-always
              behaviour with the same 40px thresholds: the toolbar slides past its edge on the fast
              spatial spring (a <InlineCode>transform</InlineCode> set only while hidden, so it
              composes with Tailwind&apos;s <InlineCode>translate-*</InlineCode> utilities). It
              doesn&apos;t follow the finger.
            </li>
            <li>
              There is no built-in overflow row: compose a <InlineCode>MenuTrigger</InlineCode> in
              the trailing slot, as in the example.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
