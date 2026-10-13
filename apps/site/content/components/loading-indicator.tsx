import type { ComponentDoc } from './doc';
import { ExampleViewer } from '../../components/example-viewer';
import { readExampleSource } from '../../lib/example-source';
import { highlightSource } from '../../lib/highlight';
import { InlineCode } from '../../components/inline-code';
import { lazyExample } from '../../lib/lazy-example';

const LoadingDeterminate = lazyExample(
  'loading-indicator/loading-determinate',
  'LoadingDeterminate',
);
const LoadingIndeterminate = lazyExample(
  'loading-indicator/loading-indeterminate',
  'LoadingIndeterminate',
);
const LoadingShapes = lazyExample('loading-indicator/loading-shapes', 'LoadingShapes');

/** Loading indicator page body. */
export async function LoadingIndicatorBody(): Promise<ComponentDoc> {
  const [indeterminate, determinate, shapes] = await Promise.all([
    readExampleSource('loading-indicator/loading-indeterminate.tsx'),
    readExampleSource('loading-indicator/loading-determinate.tsx'),
    readExampleSource('loading-indicator/loading-shapes.tsx'),
  ]);
  const [indeterminateHtml, determinateHtml, shapesHtml] = await Promise.all([
    highlightSource(indeterminate),
    highlightSource(determinate),
    highlightSource(shapes),
  ]);

  return {
    overview: (
      <>
        <section className="flex flex-col gap-6">
          <h2 id="examples" className="text-headline-small text-on-surface">
            Examples
          </h2>
          <ExampleViewer
            title="Indeterminate"
            code={indeterminate}
            html={indeterminateHtml}
            fileName="loading-indeterminate.tsx"
          >
            <LoadingIndeterminate />
          </ExampleViewer>
          <ExampleViewer
            title="Following a gesture, and sizing"
            code={determinate}
            html={determinateHtml}
            fileName="loading-determinate.tsx"
          >
            <LoadingDeterminate />
          </ExampleViewer>
          <ExampleViewer
            title="Custom shapes"
            code={shapes}
            html={shapesHtml}
            fileName="loading-shapes.tsx"
          >
            <LoadingShapes />
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
            The M3 Expressive loading indicator is a shape that morphs through Material shapes while
            it rotates. Use it for short, indeterminate waits (under 5 seconds). Pass{' '}
            <InlineCode>value</InlineCode> (0–1) only to follow a gesture&apos;s progress, such as
            pull to refresh: it morphs from a circle to a soft burst as it fills.
          </p>
          <p className="text-body-large text-on-surface-variant">
            Don&apos;t switch one loading indicator from indeterminate to determinate. When a
            process&apos;s progress becomes known, use a progress indicator, which can make that
            change.
          </p>
          <p className="text-body-large text-on-surface-variant">
            For a horizontal track, a ring over a track, or longer work, use{' '}
            <InlineCode>LinearProgressIndicator</InlineCode> or{' '}
            <InlineCode>CircularProgressIndicator</InlineCode> instead.
          </p>
        </section>
      </>
    ),
    accessibility: (
      <>
        <section className="flex flex-col gap-3">
          <h2 id="keyboard-and-screen-reader" className="text-headline-small text-on-surface">
            Keyboard &amp; screen reader
          </h2>
          <ul className="flex flex-col gap-2 ps-5 text-body-large text-on-surface-variant [&>li]:list-disc">
            <li>
              It is a React Aria <InlineCode>useProgressBar</InlineCode> (
              <InlineCode>role=&quot;progressbar&quot;</InlineCode>), so the types require an{' '}
              <InlineCode>aria-label</InlineCode> or <InlineCode>aria-labelledby</InlineCode>. A
              determinate indicator exposes <InlineCode>aria-valuenow</InlineCode> /{' '}
              <InlineCode>aria-valuetext</InlineCode>.
            </li>
            <li>It is not focusable and has no keyboard interaction; the drawing is decorative.</li>
            <li>
              Under <InlineCode>prefers-reduced-motion</InlineCode> the indeterminate indicator only
              rotates, with no morphs or springy quarter turns.
            </li>
          </ul>
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
              A single 48px box with full corners and no <InlineCode>size</InlineCode> prop — there
              is one spec size. <InlineCode>className</InlineCode> (e.g.{' '}
              <InlineCode>size-24</InlineCode>) resizes the box and the shape scales with it, kept
              square and centred by the viewBox.
            </li>
            <li>
              <InlineCode>variant</InlineCode> is <InlineCode>default</InlineCode> (a{' '}
              <InlineCode>primary</InlineCode> indicator) or <InlineCode>contained</InlineCode> (
              <InlineCode>on-primary-container</InlineCode> on a{' '}
              <InlineCode>primary-container</InlineCode> circle).
            </li>
            <li>
              Indeterminate loops Compose&apos;s seven shapes, springing to the next every 650ms
              with a quarter-turn of rotation; determinate morphs a circle into a soft burst as{' '}
              <InlineCode>value</InlineCode> rises. <InlineCode>shapes</InlineCode> overrides the
              sequence with two or more <InlineCode>MaterialShapes</InlineCode> names or{' '}
              <InlineCode>RoundedPolygon</InlineCode>s.
            </li>
            <li>
              Every frame is a pure function of elapsed time (tested against Compose&apos;s
              numbers); Motion writes the path and the inner <InlineCode>&lt;g&gt;</InlineCode>{' '}
              rotation straight to the SVG, so animation causes no React renders.
            </li>
          </ul>
        </section>
      </>
    ),
  };
}
